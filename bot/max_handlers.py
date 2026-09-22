from __future__ import annotations
import asyncio
from loguru import logger
from bot.config import settings
from bot.max_api import max_api
from bot.max_models import MaxMessage, MaxCallback
from bot.state import state_store
from bot.db.repository import UserRepository, ProfileRepository, RoadmapRepository, StepRepository
from bot.keyboards.inline import *
from bot.services.goal_classifier import classify_goal
from bot.services.profile_service import format_profile_summary, save_profile, get_or_create_user
from bot.services.quiz_service import generate_quiz, evaluate_quiz
from bot.services.roadmap_service import create_roadmap_from_profile, format_roadmap_overview, format_step_card, format_material_card, format_progress_card
from bot.utils import escape, safe_int

async def send(m: MaxMessage, text: str, buttons=None): return await max_api.send_message(m.user.id,text,buttons)

async def start(m, session):
    await state_store.clear(m.user.id)
    repo=UserRepository(session); await repo.get_or_create(m.user.id,m.user.username,m.user.first_name)
    await send(m,f"Привет, <b>{escape(m.user.first_name)}</b> 👋\n\nХочешь освоить новую профессию или прокачать навыки, но не знаешь с чего начать?\n\n<b>Progressors Learning</b> составит персональный маршрут под твой уровень и цель — только бесплатные материалы на русском языке, только то что реально нужно.\n\nОткрывай приложение 👇",roadmap_start_keyboard())

async def process_text(m, session):
    st=await state_store.get_state(m.user.id); data=await state_store.get_data(m.user.id)
    if m.text=="/start" or m.text=="🔃 Перезапустить бота": return await start(m,session)
    if m.text=="/newprofile":
        await state_store.set_state(m.user.id,'goal'); await send(m,"🎯 <b>Вопрос 1 из 5</b>\n\nЧего хочешь достичь?"); return
    if m.text=="/progress":
        user=await UserRepository(session).get_by_platform_user_id(m.user.id); roadmap=await RoadmapRepository(session).get_active(user.id) if user else None
        if roadmap: await send(m,format_progress_card(roadmap,roadmap.steps,user=user))
        return
    if st=='goal':
        if not m.text or len(m.text.strip())<3: return await send(m,'Пожалуйста, опиши свою цель подробнее (минимум 3 символа).')
        goal=m.text.strip(); await state_store.update(m.user.id,goal=goal)
        try: questions=await generate_quiz(goal)
        except Exception as e: logger.error(e); questions=[]
        if questions:
            await state_store.update(m.user.id,quiz_questions=questions,quiz_answers=[]); await state_store.set_state(m.user.id,'quiz'); return await send(m,f"🎯 Задам пару вопросов, чтобы понять твой текущий уровень.\n\n<b>Вопрос:</b> {questions[0]['q']}")
        hit=classify_goal(goal); await state_store.update(m.user.id,sphere=hit['sphere'] or 'other',specialization=(hit['specs'] or [None])[0],level='beginner'); await state_store.set_state(m.user.id,'time_per_week'); return await send(m,'⏰ <b>Вопрос 2 из 5</b>\n\nСколько времени в неделю готов уделять обучению?',time_keyboard())
    if st=='quiz':
        qs=data.get('quiz_questions',[]); ans=data.get('quiz_answers',[]); i=len(ans)
        if i>=len(qs): return
        q=qs[i]; a=m.text.strip(); hints=q.get('hints',[]); correct=bool(hints) and any(h.lower() in a.lower() for h in hints); ans.append({'q':q['q'],'a':a,'correct':correct}); await state_store.update(m.user.id,quiz_answers=ans)
        if i+1<len(qs): return await send(m,f"{'✅ Правильно!' if correct else '💡 Понял.'}\n\n<b>Следующий вопрос:</b> {qs[i+1]['q']}")
        try: ev=await evaluate_quiz(data['goal'],ans)
        except Exception: ev={}
        await state_store.update(m.user.id,level=ev.get('level','beginner'),sphere=ev.get('sphere') or classify_goal(data['goal'])['sphere'] or 'other',specialization=ev.get('specialization'),learning_gaps=ev.get('learning_gaps',[]),strong_points=ev.get('strong_points',[])); await state_store.set_state(m.user.id,'time_per_week'); return await send(m,'📊 Определил твой уровень.\n\n⏰ <b>Вопрос 2 из 5</b>\n\nСколько времени в неделю готов уделять обучению?',time_keyboard())
    if st=='adjustment_goal':
        new_goal=m.text.strip() if m.text else ''
        if not new_goal: return await send(m,'Пожалуйста, напиши новую цель.')
        user=await UserRepository(session).get_by_platform_user_id(m.user.id); await ProfileRepository(session).upsert(user.id,{'goal':new_goal}); await state_store.clear(m.user.id); return await generate_roadmap(m,session,user.id)

async def callback(c: MaxCallback, session):
    p=c.payload; uid=c.user.id
    if p=='roadmap_start' or p=='roadmap_continue':
        user=await UserRepository(session).get_by_platform_user_id(uid); roadmap=await RoadmapRepository(session).get_active(user.id) if user else None
        if not roadmap: return await max_api.answer_callback(c.callback_id,'Маршрут не найден.')
        step=await StepRepository(session).get_current_step(roadmap.id)
        if not step: return await send(c.message,'🎉 Все шаги завершены! Ты молодец!')
        await StepRepository(session).update_status(step.id,'in_progress'); return await show_step(c.message,step,roadmap.total_steps)
    if p.startswith('time_'): await state_store.update(uid,time_per_week=p[5:]); await state_store.set_state(uid,'total_hours'); return await send(c.message,'🕐 <b>Вопрос 3 из 5</b>\n\nСколько часов суммарно ты готов потратить на весь маршрут?',total_hours_keyboard())
    if p.startswith('hours_'): await state_store.update(uid,total_hours=p[6:],formats=[]); await state_store.set_state(uid,'formats'); return await send(c.message,'🎬 <b>Вопрос 4 из 5</b>\n\nКакие форматы обучения тебе подходят?',formats_keyboard([]))
    if p.startswith('toggle_fmt_'):
        d=await state_store.get_data(uid); selected=d.get('formats',[]); f=p[11:]; selected.remove(f) if f in selected else selected.append(f); await state_store.update(uid,formats=selected); return await send(c.message,'Выбери форматы:',formats_keyboard(selected))
    if p=='formats_done':
        d=await state_store.get_data(uid)
        if not d.get('formats'): return await max_api.answer_callback(c.callback_id,'Выбери хотя бы один формат!')
        await state_store.set_state(uid,'learn_style'); return await send(c.message,'🎓 <b>Вопрос 5 из 5</b>\n\nКак тебе лучше всего учиться?',learn_style_keyboard())
    if p.startswith('lstyle_'):
        await state_store.update(uid,learn_style=p[7:]); await state_store.set_state(uid,'confirm'); d=await state_store.get_data(uid); return await send(c.message,format_profile_summary(d)+'\n\nВсё верно?',profile_confirm_keyboard())
    if p=='profile_edit': await state_store.set_state(uid,'goal'); return await send(c.message,'🔄 Начнём заново.\n\n🎯 <b>Вопрос 1 из 5</b>\n\nЧего хочешь достичь?')
    if p=='profile_confirm':
        d=await state_store.get_data(uid); user=await get_or_create_user(session,uid,c.user.username,c.user.first_name); await save_profile(session,user.id,d); await state_store.clear(uid); return await generate_roadmap(c.message,session,user.id)
    if p.startswith('progress_'):
        rid=safe_int(p,'progress_'); roadmap=await RoadmapRepository(session).get_with_steps(rid) if rid else None; user=await UserRepository(session).get_by_platform_user_id(uid); return await send(c.message,format_progress_card(roadmap,roadmap.steps,user=user)) if roadmap else None
    if p=='roadmap_adjust': return await send(c.message,'🔄 <b>Как хочешь изменить маршрут?</b>',adjustment_keyboard())
    if p=='adj_change_goal': await state_store.set_state(uid,'adjustment_goal'); return await send(c.message,'🎯 Напиши новую цель обучения:')
    if p in {'adj_harder','adj_easier','adj_more_video','adj_more_articles'}: return await adjust(c,session,p)
    if p.startswith('step_next_'): return await next_step(c,session,safe_int(p,'step_next_'))
    if p.startswith('step_complete_'): return await complete_step(c,session,safe_int(p,'step_complete_'))
    if p.startswith('step_back_'): return await back_step(c,session,safe_int(p,'step_back_'))
    if p.startswith('step_dislike_'): return await send(c.message,'Почему шаг не подходит?',feedback_reason_keyboard(safe_int(p,'step_dislike_')))
    if p.startswith('fb_'): return await feedback(c,session)
    await max_api.answer_callback(c.callback_id)

async def generate_roadmap(m,session,user_id):
    profile=await ProfileRepository(session).get_by_user_id(user_id)
    if not profile: return await send(m,'Профиль не найден. Используй /start.')
    try: roadmap,_=await create_roadmap_from_profile(session,user_id,profile)
    except Exception as e: logger.error(e); return await send(m,'😔 Не удалось построить маршрут. Попробуй ещё раз.')
    await send(m,format_roadmap_overview(roadmap),roadmap_start_keyboard())

async def show_step(m,step,total):
    await send(m,format_step_card(step,total))
    for i,mat in enumerate(step.get_materials(),1): await send(m,format_material_card(mat,i))
    await send(m,'Что дальше?',step_actions_keyboard(step.id,step.order_num<total))

async def next_step(c,session,step_id):
    if not step_id:return
    sr=StepRepository(session); step=await sr.get_by_id(step_id); roadmap=await RoadmapRepository(session).get_with_steps(step.roadmap_id) if step else None
    if not roadmap:return
    candidates=sorted([s for s in roadmap.steps if s.order_num>step.order_num],key=lambda s:s.order_num)
    if step.status=='in_progress': await sr.update_status(step.id,'completed',{'action':'moved_on'})
    if candidates:
        nxt=candidates[0]; await sr.update_status(nxt.id,'in_progress'); await show_step(c.message,nxt,roadmap.total_steps)
    else: await send(c.message,format_progress_card(roadmap,roadmap.steps))

async def complete_step(c,session,step_id):
    if not step_id:return
    sr=StepRepository(session); await sr.update_status(step_id,'completed',{'action':'completed'}); step=await sr.get_by_id(step_id)
    if not step:return
    roadmap=await RoadmapRepository(session).get_with_steps(step.roadmap_id); user=await UserRepository(session).get_by_platform_user_id(c.user.id)
    await send(c.message,format_progress_card(roadmap,roadmap.steps,user=user))

async def back_step(c,session,step_id):
    sr=StepRepository(session); step=await sr.get_by_id(step_id) if step_id else None
    if step:
        roadmap=await RoadmapRepository(session).get_with_steps(step.roadmap_id)
        if roadmap: await show_step(c.message,step,roadmap.total_steps)

async def feedback(c,session):
    await send(c.message,'Спасибо за обратную связь! Она будет учтена при корректировке маршрута.')

async def adjust(c,session,action):
    user=await UserRepository(session).get_by_platform_user_id(c.user.id)
    roadmap=await RoadmapRepository(session).get_active(user.id) if user else None
    if not roadmap:return
    await send(c.message,'🔄 Перестраиваю маршрут...')
    # Здесь используется тот же AI adjustment сервис из исходного проекта; остальные сервисы не меняются.
    from bot.services.ai_service import get_ai_service
    rr=RoadmapRepository(session); full=await rr.get_with_steps(roadmap.id); profile=await ProfileRepository(session).get_by_user_id(user.id)
    amap={'adj_harder':('too_hard','Хочу сложнее'),'adj_easier':('too_easy','Хочу проще'),'adj_more_video':('wrong_format','Хочу больше видео'),'adj_more_articles':('wrong_format','Хочу больше статей')}
    typ,reason=amap[action]; data=await get_ai_service().adjust_roadmap(full,full.steps,reason,typ)
    await rr.abandon_active(user.id); nr=await rr.create(user.id,data.get('title',roadmap.title),data.get('description',''),len(data.get('steps',[])),data.get('estimated_weeks',0)); await StepRepository(session).create_bulk(nr.id,data.get('steps',[])); updated=await rr.get_with_steps(nr.id)
    await send(c.message,'✅ Маршрут обновлён!\n\n'+format_roadmap_overview(updated),roadmap_start_keyboard())
