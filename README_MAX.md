# Progressors Learning — MAX

Готовая MAX-версия проекта. Основная логика обучения, AI, база материалов, SQLite и Mini App сохранены; Telegram runtime удалён.

## 1. Backend

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn bot.main:app --host 0.0.0.0 --port 8000
```

Проверка:

```text
GET http://127.0.0.1:8000/health
```

Должно вернуть:

```json
{"ok": true}
```

## 2. Mini App

```bash
cd miniapp
npm install
npm run dev
```

Для production:

```bash
npm run build
```

Mini App уже подключает официальный MAX Bridge через:

```html
<script src="https://st.max.ru/js/max-web-app.js"></script>
```

## 3. Webhook MAX

MAX требует публичный HTTPS endpoint. Локальный `127.0.0.1:8000` напрямую MAX использовать не может.

В `.env` укажи:

```env
MAX_WEBHOOK_URL=https://YOUR-DOMAIN/webhook
MAX_WEBHOOK_SECRET=YOUR_SECRET
```

Если Mini App должна открываться именно внутри MAX, укажи также публичное имя/ссылку MAX-бота:

```env
MAX_BOT_USERNAME=your_bot_username_or_max_bot_link
```

После запуска backend зарегистрируй webhook:

```bash
python scripts/register_webhook.py
```

Скрипт подписывает бота на:

- `message_created`
- `message_callback`
- `bot_started`

## 4. Важно

Токены хранятся только в `.env`. Файл `.env` добавлен в `.gitignore`.

Если токен MAX уже публиковался где-либо вне вашего закрытого окружения, отзови его и выпусти новый перед финальным запуском.
