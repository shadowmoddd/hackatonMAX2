export interface DocEntry {
  title: string
  url: string
  description: string
}

export const DOCS: Record<string, DocEntry[]> = {
  it_backend: [
    { title: 'Python 3', url: 'https://telegra.ph/Python-3--SHpargalka-po-osnovam-05-21-2', description: 'Шпаргалка: переменные, функции, классы, обработка ошибок' },
    { title: 'Django', url: 'https://telegra.ph/Django--SHpargalka-dlya-nachinayushchih-05-21', description: 'Шпаргалка: модели, views, URL-маршруты, команды' },
    { title: 'FastAPI', url: 'https://telegra.ph/FastAPI--SHpargalka-05-21', description: 'Шпаргалка: эндпоинты, Pydantic, async, запуск' },
    { title: 'SQL и PostgreSQL', url: 'https://telegra.ph/SQL-i-PostgreSQL--SHpargalka-05-21', description: 'Шпаргалка: SELECT, JOIN, агрегация, индексы' },
  ],
  it_frontend: [
    { title: 'JavaScript', url: 'https://telegra.ph/JavaScript--SHpargalka-po-osnovam-05-21', description: 'Шпаргалка: переменные, функции, DOM, fetch, async/await' },
    { title: 'HTML5 и CSS3', url: 'https://telegra.ph/HTML5-i-CSS3--SHpargalka-05-21', description: 'Шпаргалка: разметка, Flexbox, Grid, CSS-переменные' },
    { title: 'React', url: 'https://telegra.ph/React--SHpargalka-05-21', description: 'Шпаргалка: компоненты, useState, useEffect, props' },
  ],
  it_ml: [
    { title: 'Python 3', url: 'https://telegra.ph/Python-3--SHpargalka-po-osnovam-05-21-2', description: 'Шпаргалка по Python — база для Data Science' },
  ],
  it_devops: [
    { title: 'Git', url: 'https://telegra.ph/Git--SHpargalka-po-komandam-05-21', description: 'Шпаргалка: коммиты, ветки, merge, отмена изменений' },
    { title: 'Docker', url: 'https://telegra.ph/Docker--SHpargalka-05-21', description: 'Шпаргалка: образы, контейнеры, Dockerfile, Compose' },
    { title: 'Linux', url: 'https://telegra.ph/Linux--Osnovnye-komandy-05-21', description: 'Шпаргалка: навигация, файлы, процессы, сеть, bash' },
  ],
  design: [
    { title: 'HTML5 и CSS3', url: 'https://telegra.ph/HTML5-i-CSS3--SHpargalka-05-21', description: 'Шпаргалка: разметка, Flexbox, Grid, CSS-переменные' },
    { title: 'JavaScript', url: 'https://telegra.ph/JavaScript--SHpargalka-po-osnovam-05-21', description: 'Шпаргалка по JS для веб-дизайнеров' },
  ],
}

export function getDocsForSphere(sphereId: string): DocEntry[] {
  return DOCS[sphereId] ?? DOCS['it_backend']
}
