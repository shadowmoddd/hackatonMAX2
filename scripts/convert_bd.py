"""
Convert bd/*.txt Python-dict files into:
  - data/resources.json (for bot recommendation engine)
  - miniapp/src/data/materialDatabase.ts (for miniapp curated DB)

Each input file defines one dict like BACKEND_MATERIALS = { ... } with structure:
  {level}/{step_key}/materials: [ { type, name, link, platform, duration } ]
"""

import json
import re
import ast
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
BD_DIR = ROOT / "bd"
OUT_JSON = ROOT / "data" / "resources.json"
OUT_TS = ROOT / "miniapp" / "src" / "data" / "materialDatabase.ts"

# Mapping: filename → (sphere, specializations, sphere_id_for_miniapp)
FILE_MAP = {
    "backend.txt":       ("it", ["backend"],          "it_backend"),
    "frontend.txt":      ("it", ["frontend"],         "it_frontend"),
    "ML.txt":            ("it", ["ml"],               "it_ml"),
    "DevOps.txt":        ("it", ["devops"],           "it_devops"),
    "UI-UX.txt":         ("design", ["ux", "webdesign"], "design"),
    "видеомонтаж.txt":   ("video_photo", [],          "video_photo"),
}

LEVEL_MAP_RU_TO_EN = {
    "beginner": ["beginner", "elementary"],
    "advanced": ["intermediate", "advanced"],  # БД "advanced" = средний-продвинутый
    "expert": ["advanced"],                     # БД "expert" = senior-продвинутый
    "intermediate": ["intermediate"],
}

LEVEL_DIFFICULTY = {
    "beginner": "beginner",
    "advanced": "intermediate",
    "expert": "advanced",
    "intermediate": "intermediate",
}

TYPE_MAP = {
    "видео": "video",
    "видеокурс": "course",
    "плейлист": "course",
    "статья": "article",
    "руководство": "article",
    "лекция": "lecture",
    "курс": "course",
    "книга": "book",
}

PLATFORM_DETECT = {
    "youtube.com": "YouTube",
    "youtu.be": "YouTube",
    "habr.com": "Habr",
    "rutube.ru": "RuTube",
    "vk.com": "VK Видео",
    "vk.ru": "VK Видео",
    "tproger.ru": "Tproger",
    "практикум": "Яндекс Практикум",
    "stepik": "Stepik",  # отфильтруем
}


def detect_platform(url: str, fallback: str) -> str:
    try:
        host = urlparse(url).netloc.lower().replace("www.", "")
        for domain, name in PLATFORM_DETECT.items():
            if domain in host:
                return name
    except Exception:
        pass
    return fallback


def parse_file(path: Path) -> dict:
    """Extract the assigned dict literal from a .txt file."""
    text = path.read_text(encoding="utf-8")
    # Find the first dict assignment: VAR = { ... }
    match = re.search(r"^\w+\s*=\s*(\{)", text, re.MULTILINE)
    if not match:
        raise ValueError(f"No dict found in {path}")
    start = match.start(1)
    depth = 0
    end = start
    for i, ch in enumerate(text[start:], start=start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    dict_text = text[start:end]
    return ast.literal_eval(dict_text)


def extract_topics(name: str, description: str = "") -> list[str]:
    """Extract topic keywords from material name + description."""
    src = f"{name} {description}".lower()
    src = re.sub(r"[^\wа-яё\s\-]", " ", src)
    words = re.findall(r"[а-яёa-z][а-яёa-z\-]{2,}", src)
    stopwords = {
        "для", "как", "что", "это", "при", "над", "под", "над", "над", "над",
        "the", "and", "you", "your", "with", "for", "from", "into", "out",
        "видео", "статья", "плейлист", "руководство", "курс", "лекция",
        "начинающих", "новичок", "новичков", "начала", "старт", "урок", "уроки",
        "за", "от", "до", "по", "из", "на", "не", "и", "в", "с", "о"
    }
    return list(dict.fromkeys(w for w in words if w not in stopwords and len(w) >= 3))[:8]


def material_id(sphere_id: str, idx: int, name: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "_", name.lower())[:40].strip("_")
    return f"{sphere_id}_{idx:03d}_{slug}" if slug else f"{sphere_id}_{idx:03d}"


def convert_for_bot(all_data: dict) -> list[dict]:
    """Convert to data/resources.json format used by bot/services/recommendation_engine.py"""
    resources = []
    idx = 0
    for filename, (sphere, specs, sphere_id) in FILE_MAP.items():
        raw = all_data.get(filename)
        if not raw:
            continue
        for level_ru, sections in raw.items():
            levels = LEVEL_MAP_RU_TO_EN.get(level_ru, [level_ru])
            for section_key, section in sections.items():
                section_title = section.get("title", "")
                section_desc = section.get("description", "")
                for mat in section.get("materials", []):
                    idx += 1
                    name = mat.get("name", "")
                    if not name:
                        continue
                    url = mat.get("link", "").strip()
                    platform_raw = mat.get("platform", "")
                    mat_type = TYPE_MAP.get(mat.get("type", "").lower(), "video")
                    platform = detect_platform(url, platform_raw)
                    difficulty = LEVEL_DIFFICULTY.get(level_ru, "beginner")

                    resources.append({
                        "id": material_id(sphere_id, idx, name),
                        "title": name,
                        "url": url,  # ПРЯМАЯ ССЫЛКА из БД пользователя
                        "search_query": name,  # fallback для DDG если URL умрёт
                        "type": mat_type,
                        "platform": platform,
                        "sphere": [sphere],
                        "specializations": specs,
                        "levels": levels,
                        "topics": extract_topics(name, section_desc),
                        "duration": mat.get("duration", ""),
                        "difficulty": difficulty,
                        "why_template": f"Освоишь: {section_title.lstrip('🎥🐍📚🎨🤖🐳🎬 ')}" if section_title else "",
                        "section": section_key,
                    })
    return resources


def convert_for_miniapp(all_data: dict) -> list[dict]:
    """Convert to miniapp CuratedMaterial[] for materialDatabase.ts"""
    materials = []
    idx = 0
    for filename, (sphere, specs, sphere_id) in FILE_MAP.items():
        raw = all_data.get(filename)
        if not raw:
            continue
        for level_ru, sections in raw.items():
            levels = LEVEL_MAP_RU_TO_EN.get(level_ru, [level_ru])
            for section_key, section in sections.items():
                # Маппинг section → шаг (step_1, step_2, etc.) → stepKey "sphere_N"
                step_num = None
                if section_key.startswith("step_"):
                    try:
                        step_num = int(section_key.split("_")[1])
                    except (ValueError, IndexError):
                        pass
                step_key = f"{sphere_id}_{step_num}" if step_num else None

                for mat in section.get("materials", []):
                    idx += 1
                    name = mat.get("name", "")
                    if not name:
                        continue
                    url = mat.get("link", "").strip()
                    if not url.startswith("http"):
                        continue  # пропускаем без прямой ссылки
                    mat_type = "video" if TYPE_MAP.get(mat.get("type", "").lower(), "video") in ("video", "course", "lecture") else "article"
                    platform = detect_platform(url, mat.get("platform", ""))

                    materials.append({
                        "title": name,
                        "source": platform,
                        "duration": mat.get("duration", ""),
                        "xp": 20 if mat_type == "video" else 15,
                        "type": mat_type,
                        "url": url,
                        "stepKey": step_key,
                        "topics": extract_topics(name, section.get("description", "")),
                        "levels": levels,
                    })
    return materials


def render_ts(materials: list[dict]) -> str:
    """Render materials as TypeScript materialDatabase.ts"""
    lines = []
    lines.append("// AUTO-GENERATED from bd/*.txt — do not edit by hand. Re-run scripts/convert_bd.py to update.")
    lines.append("")
    lines.append("export interface CuratedMaterial {")
    lines.append("  title: string")
    lines.append("  source: string")
    lines.append("  duration: string")
    lines.append("  xp: number")
    lines.append("  type: 'video' | 'article'")
    lines.append("  url: string")
    lines.append("  stepKey?: string")
    lines.append("  topics: string[]")
    lines.append("  levels: string[]")
    lines.append("}")
    lines.append("")
    lines.append("export const CURATED_MATERIALS: CuratedMaterial[] = [")
    for m in materials:
        lines.append("  {")
        lines.append(f"    title: {json.dumps(m['title'], ensure_ascii=False)},")
        lines.append(f"    source: {json.dumps(m['source'], ensure_ascii=False)},")
        lines.append(f"    duration: {json.dumps(m['duration'], ensure_ascii=False)},")
        lines.append(f"    xp: {m['xp']},")
        lines.append(f"    type: {json.dumps(m['type'])},")
        lines.append(f"    url: {json.dumps(m['url'], ensure_ascii=False)},")
        if m.get("stepKey"):
            lines.append(f"    stepKey: {json.dumps(m['stepKey'])},")
        lines.append(f"    topics: {json.dumps(m['topics'], ensure_ascii=False)},")
        lines.append(f"    levels: {json.dumps(m['levels'])},")
        lines.append("  },")
    lines.append("]")
    lines.append("")
    return "\n".join(lines)


def main():
    print(f"[BD] Reading files from {BD_DIR}")
    all_data = {}
    for name in FILE_MAP:
        path = BD_DIR / name
        if not path.exists():
            print(f"  [WARN] {name} not found")
            continue
        try:
            all_data[name] = parse_file(path)
            print(f"  [OK]  {name}: {sum(len(s.get('materials',[])) for lvl in all_data[name].values() for s in lvl.values())} materials")
        except Exception as e:
            print(f"  [ERR] {name}: {e}")

    bot_resources = convert_for_bot(all_data)
    miniapp_materials = convert_for_miniapp(all_data)

    print(f"\n[OUTPUT] Bot resources: {len(bot_resources)}")
    print(f"[OUTPUT] Miniapp materials: {len(miniapp_materials)}")

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"resources": bot_resources}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"  Written: {OUT_JSON}")

    OUT_TS.parent.mkdir(parents=True, exist_ok=True)
    OUT_TS.write_text(render_ts(miniapp_materials), encoding="utf-8")
    print(f"  Written: {OUT_TS}")


if __name__ == "__main__":
    main()
