// Основной реестр сфер и шагов обучения

export type StepStatus = 'locked' | 'available' | 'completed'

export interface CareerPath {
  title: string
  description: string
  skills: string[]
}

export interface StepMaterial {
  id: string
  type: 'video' | 'article' | 'quiz'
  title: string
  xp: number
  duration?: string
  source?: string
  videoUrl?: string
  videoId?: string
  searchQuery?: string
  articleContent?: string[]
  articleUrl?: string
  description?: string
}

export interface Step {
  id: number
  order: number
  title: string
  icon: string
  duration: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  xp: number
  why: string
  skills: string[]
  materials: StepMaterial[]
}

export interface CareerPathExtended {
  roles: string[]
  salaryRange: string
  timeToJob: string
  topSkills: string[]
  companiesHiring: string[]
}

export interface Sphere {
  id: string
  name: string
  icon: string
  description: string
  color?: string
  roadmapTitle?: string
  career?: CareerPath
  careerPath?: CareerPathExtended
  steps: Step[]
}

// ── Quiz questions per step ────────────────────────────────
// Ключ: `${sphereId}_${stepNum}`, например 'it_backend_1', 'design_3'
export const STEP_QUIZ_QUESTIONS: Record<string, { question: string; hint: string[] }[]> = {

  // ── Backend ──────────────────────────────────────────────
  it_backend_1: [
    { question: 'Что такое переменная в Python? Для чего она нужна?', hint: ['переменная', 'значение', 'хранение', 'присвоение', 'имя', 'тип'] },
    { question: 'Чем список (list) отличается от кортежа (tuple)?', hint: ['изменяемый', 'неизменяемый', 'mutable', 'list', 'tuple', 'добавить', 'удалить'] },
    { question: 'Что такое функция в Python? Как она объявляется?', hint: ['def', 'функция', 'параметр', 'return', 'вызов', 'аргумент'] },
    { question: 'Что делает цикл for в Python? Приведи пример использования.', hint: ['цикл', 'итерация', 'for', 'in', 'range', 'перебор', 'элемент'] },
    { question: 'Что такое словарь (dict) в Python? Как получить значение по ключу?', hint: ['словарь', 'dict', 'ключ', 'значение', 'key', 'value', 'скобки'] },
    { question: 'Что такое исключения в Python и зачем нужны try/except?', hint: ['исключение', 'try', 'except', 'ошибка', 'обработка', 'exception', 'raise'] },
  ],

  it_backend_2: [
    { question: 'Что такое класс в Python? Чем он отличается от функции?', hint: ['класс', 'class', 'объект', 'экземпляр', 'атрибут', 'метод', 'ООП'] },
    { question: 'Что такое наследование? Приведи пример когда оно полезно.', hint: ['наследование', 'родитель', 'дочерний', 'super', 'extends', 'общий', 'переиспользование'] },
    { question: 'Что такое инкапсуляция? Зачем нужны приватные атрибуты?', hint: ['инкапсуляция', 'приватный', '_', '__', 'защита', 'скрытие', 'интерфейс'] },
    { question: 'Что такое полиморфизм? Объясни на примере.', hint: ['полиморфизм', 'метод', 'переопределение', 'override', 'один интерфейс', 'разная реализация'] },
    { question: 'Что такое магические методы в Python (dunder methods)?', hint: ['__init__', '__str__', '__repr__', 'dunder', 'магический', 'special method', '__len__'] },
    { question: 'В чем разница между @classmethod и @staticmethod?', hint: ['classmethod', 'staticmethod', 'cls', 'self', 'экземпляр', 'класс', 'без'] },
  ],

  it_backend_3: [
    { question: 'Что такое реляционная база данных? Чем она отличается от NoSQL?', hint: ['реляционная', 'таблица', 'sql', 'nosql', 'строки', 'ключ', 'связи', 'документ'] },
    { question: 'Что такое SQL? Напиши структуру простого SELECT-запроса.', hint: ['select', 'from', 'where', 'запрос', 'таблица', 'условие', 'столбец'] },
    { question: 'Что такое первичный ключ (PRIMARY KEY)? Зачем он нужен?', hint: ['первичный ключ', 'primary key', 'уникальный', 'идентификатор', 'строка', 'id'] },
    { question: 'Что такое JOIN в SQL? Когда его используют?', hint: ['join', 'объединение', 'таблицы', 'связь', 'foreign key', 'inner', 'left', 'right'] },
    { question: 'Что такое индекс в базе данных? Как он ускоряет запросы?', hint: ['индекс', 'поиск', 'ускорение', 'b-tree', 'производительность', 'column', 'создать'] },
    { question: 'Что такое транзакция? Что означает ACID?', hint: ['транзакция', 'acid', 'атомарность', 'консистентность', 'изоляция', 'commit', 'rollback'] },
  ],

  it_backend_4: [
    { question: 'Что такое REST API? Объясни основные принципы.', hint: ['rest', 'api', 'http', 'stateless', 'endpoint', 'ресурс', 'json'] },
    { question: 'Чем GET отличается от POST запроса? Когда использовать каждый?', hint: ['get', 'post', 'тело', 'параметры', 'данные', 'идемпотентность', 'создание'] },
    { question: 'Что такое HTTP статус коды? Назови примеры 2xx, 4xx, 5xx.', hint: ['200', '201', '404', '500', '401', 'статус', 'код', 'ответ'] },
    { question: 'Что такое middleware в Django/FastAPI? Зачем оно нужно?', hint: ['middleware', 'промежуточный', 'запрос', 'ответ', 'аутентификация', 'логирование', 'перехват'] },
    { question: 'Что такое сериализация данных? Зачем нужен JSON?', hint: ['сериализация', 'json', 'строка', 'объект', 'передача', 'формат', 'deserialization'] },
    { question: 'Что такое аутентификация и авторизация? В чем разница?', hint: ['аутентификация', 'авторизация', 'кто ты', 'что можешь', 'токен', 'jwt', 'права'] },
  ],

  it_backend_5: [
    { question: 'Что такое Docker? Чем контейнер отличается от виртуальной машины?', hint: ['docker', 'контейнер', 'виртуальная машина', 'образ', 'изоляция', 'ядро', 'ресурсы'] },
    { question: 'Что такое Dockerfile? Опиши его основные инструкции.', hint: ['dockerfile', 'from', 'run', 'copy', 'cmd', 'expose', 'инструкция', 'образ'] },
    { question: 'Что такое reverse proxy? Зачем нужен nginx перед приложением?', hint: ['nginx', 'reverse proxy', 'балансировка', 'ssl', 'проксирование', 'upstream', 'порт'] },
    { question: 'Что такое переменные окружения (environment variables)? Зачем они нужны?', hint: ['env', 'переменная окружения', 'конфиг', 'секрет', 'production', 'dotenv', 'безопасность'] },
    { question: 'Что такое CI/CD? Как автоматизировать деплой?', hint: ['ci', 'cd', 'pipeline', 'автоматизация', 'тесты', 'деплой', 'github actions'] },
    { question: 'Что такое логирование в приложении? Зачем оно нужно в production?', hint: ['логирование', 'log', 'уровень', 'error', 'debug', 'мониторинг', 'отладка'] },
  ],

  // ── Frontend ──────────────────────────────────────────────
  it_frontend_1: [
    { question: 'Для чего нужен HTML? Чем тег отличается от атрибута?', hint: ['html', 'разметка', 'тег', 'атрибут', 'структура', 'браузер', 'элемент'] },
    { question: 'Что такое блочные и строчные элементы в HTML?', hint: ['блочный', 'строчный', 'block', 'inline', 'div', 'span', 'перенос строки'] },
    { question: 'Что такое CSS? Как применить стили к HTML-элементу?', hint: ['css', 'стиль', 'селектор', 'свойство', 'значение', 'class', 'id'] },
    { question: 'Что такое блочная модель (box model) в CSS?', hint: ['box model', 'margin', 'padding', 'border', 'content', 'отступы', 'поля'] },
    { question: 'Чем Flexbox отличается от Grid? Когда что применять?', hint: ['flexbox', 'grid', 'одномерный', 'двумерный', 'строка', 'столбец', 'выравнивание'] },
    { question: 'Что такое адаптивная верстка? Как работают media queries?', hint: ['адаптивная', 'responsive', 'media query', 'breakpoint', 'мобильный', 'ширина', 'экран'] },
  ],

  it_frontend_2: [
    { question: 'Что такое JavaScript? Чем он отличается от HTML и CSS?', hint: ['javascript', 'логика', 'динамика', 'интерактивность', 'скрипт', 'браузер', 'поведение'] },
    { question: 'Что такое DOM и как JavaScript с ним взаимодействует?', hint: ['dom', 'дерево', 'document', 'querySelector', 'элемент', 'изменение', 'узел'] },
    { question: 'Что такое событие (event) в JavaScript? Как добавить обработчик?', hint: ['событие', 'event', 'addEventListener', 'click', 'обработчик', 'callback', 'функция'] },
    { question: 'Что такое let, const, var в JavaScript? В чем разница?', hint: ['let', 'const', 'var', 'область видимости', 'переопределение', 'hoisting', 'блок'] },
    { question: 'Что такое промис (Promise)? Зачем нужен async/await?', hint: ['promise', 'промис', 'async', 'await', 'асинхронный', 'then', 'resolve', 'reject'] },
    { question: 'Что такое fetch API? Как сделать GET-запрос к серверу?', hint: ['fetch', 'запрос', 'api', 'response', 'json', 'http', 'async'] },
  ],

  it_frontend_3: [
    { question: 'Что такое React и зачем он нужен?', hint: ['react', 'библиотека', 'компонент', 'ui', 'virtual dom', 'facebook', 'переиспользование'] },
    { question: 'Что такое компонент в React? Как создать функциональный компонент?', hint: ['компонент', 'function', 'jsx', 'props', 'return', 'render', 'reusable'] },
    { question: 'Что такое props? Как передать данные в дочерний компонент?', hint: ['props', 'свойства', 'передача', 'дочерний', 'родитель', 'параметр', 'атрибут'] },
    { question: 'Что такое state (состояние) в React? Как работает useState?', hint: ['state', 'состояние', 'useState', 'hook', 'set', 'перерендер', 'изменение'] },
    { question: 'Что такое хук useEffect? Когда он вызывается?', hint: ['useEffect', 'эффект', 'lifecycle', 'mount', 'unmount', 'dependency', 'массив зависимостей'] },
    { question: 'Что такое условный рендеринг в React? Приведи примеры.', hint: ['условный', 'рендеринг', 'if', 'тернарный', '&&', 'null', 'показать скрыть'] },
  ],

  it_frontend_4: [
    { question: 'Что такое TypeScript? Какие проблемы он решает?', hint: ['typescript', 'типизация', 'статическая', 'ошибка', 'compile', 'интерфейс', 'тип'] },
    { question: 'Что такое интерфейс (interface) в TypeScript?', hint: ['interface', 'интерфейс', 'контракт', 'форма', 'объект', 'свойства', 'тип'] },
    { question: 'Что такое generics в TypeScript? Приведи пример.', hint: ['generic', 'обобщение', '<T>', 'параметр типа', 'переиспользование', 'гибкий', 'Array'] },
    { question: 'Чем type alias отличается от interface в TypeScript?', hint: ['type', 'interface', 'union', 'intersection', 'extends', 'implements', 'разница'] },
    { question: 'Что такое union типы в TypeScript?', hint: ['union', '|', 'объединение', 'несколько', 'типов', 'narrowing', 'тип гвард'] },
    { question: 'Как TypeScript помогает в работе с React компонентами?', hint: ['props', 'FC', 'React.FC', 'тип', 'children', 'событие', 'строгость'] },
  ],

  it_frontend_5: [
    { question: 'Что такое роутинг в React? Зачем нужен React Router?', hint: ['роутинг', 'маршрут', 'react router', 'url', 'страница', 'navigation', 'path'] },
    { question: 'Что такое глобальное состояние? Чем отличается от локального?', hint: ['глобальное', 'локальное', 'redux', 'zustand', 'context', 'пробрасывание', 'store'] },
    { question: 'Что такое оптимизация производительности React? Назови методы.', hint: ['useMemo', 'useCallback', 'memo', 'React.memo', 'оптимизация', 'перерендер', 'lazy'] },
    { question: 'Что такое code splitting и lazy loading?', hint: ['code splitting', 'lazy', 'Suspense', 'динамический импорт', 'chunk', 'загрузка', 'производительность'] },
    { question: 'Что такое CSS-in-JS? Назови примеры библиотек.', hint: ['css-in-js', 'styled-components', 'emotion', 'модульный css', 'стили', 'компонент', 'изоляция'] },
    { question: 'Что такое Webpack / Vite? Зачем нужны сборщики проектов?', hint: ['webpack', 'vite', 'bundler', 'сборка', 'модуль', 'импорт', 'оптимизация'] },
  ],

  // ── Machine Learning ──────────────────────────────────────
  it_ml_1: [
    { question: 'Что такое NumPy? Зачем он нужен в Data Science?', hint: ['numpy', 'массив', 'ndarray', 'матрица', 'математика', 'быстро', 'vectorization'] },
    { question: 'Что такое Pandas DataFrame? Как загрузить CSV-файл?', hint: ['pandas', 'dataframe', 'csv', 'read_csv', 'таблица', 'строки', 'столбцы'] },
    { question: 'Что такое data cleaning (очистка данных)? Как работать с пропущенными значениями?', hint: ['пропуски', 'nan', 'fillna', 'dropna', 'очистка', 'preprocessing', 'данные'] },
    { question: 'Что такое matplotlib? Как построить базовый график?', hint: ['matplotlib', 'plot', 'scatter', 'histogram', 'визуализация', 'plt', 'ось'] },
    { question: 'Что такое feature (признак) в машинном обучении?', hint: ['признак', 'feature', 'столбец', 'переменная', 'input', 'характеристика', 'атрибут'] },
    { question: 'Как разделить датасет на train и test? Зачем это нужно?', hint: ['train', 'test', 'split', 'train_test_split', 'обучение', 'проверка', 'переобучение'] },
  ],

  it_ml_2: [
    { question: 'Что такое линейная алгебра и зачем она нужна в ML?', hint: ['матрица', 'вектор', 'умножение', 'транспонирование', 'определитель', 'линейная', 'алгебра'] },
    { question: 'Что такое производная? Как она связана с обучением нейросетей?', hint: ['производная', 'градиент', 'изменение', 'обратное распространение', 'backprop', 'loss', 'минимум'] },
    { question: 'Что такое вероятность и зачем она нужна в ML?', hint: ['вероятность', 'распределение', 'байес', 'conditional', 'событие', 'prior', 'posterior'] },
    { question: 'Что такое статистика в контексте анализа данных?', hint: ['среднее', 'медиана', 'дисперсия', 'стандартное отклонение', 'корреляция', 'распределение', 'тест'] },
    { question: 'Что такое нормализация данных? Зачем она нужна?', hint: ['нормализация', 'scaling', 'MinMaxScaler', 'StandardScaler', 'диапазон', 'значение', 'алгоритм'] },
    { question: 'Что такое корреляция? Как она помогает выбрать признаки?', hint: ['корреляция', 'связь', 'признак', 'целевая переменная', 'pearson', 'матрица', 'heatmap'] },
  ],

  it_ml_3: [
    { question: 'Что такое линейная регрессия? Когда её применяют?', hint: ['регрессия', 'линейная', 'предсказание', 'непрерывное', 'коэффициент', 'MSE', 'линия'] },
    { question: 'Что такое логистическая регрессия? Для каких задач подходит?', hint: ['логистическая', 'классификация', 'бинарная', 'вероятность', 'sigmoid', 'порог', 'метка'] },
    { question: 'Что такое дерево решений (Decision Tree)?', hint: ['дерево', 'разбиение', 'узел', 'лист', 'признак', 'threshold', 'gini', 'entropy'] },
    { question: 'Что такое метрики качества модели? Назови примеры для классификации.', hint: ['accuracy', 'precision', 'recall', 'f1', 'метрика', 'матрица ошибок', 'confusion matrix'] },
    { question: 'Что такое кросс-валидация? Зачем она нужна?', hint: ['кросс-валидация', 'k-fold', 'fold', 'обобщение', 'переобучение', 'оценка', 'generalization'] },
    { question: 'Что такое ансамблевые методы? Чем Random Forest лучше одного дерева?', hint: ['ансамбль', 'random forest', 'bagging', 'много деревьев', 'усреднение', 'дисперсия', 'обобщение'] },
  ],

  it_ml_4: [
    { question: 'Что такое нейронная сеть? Из чего она состоит?', hint: ['нейрон', 'слой', 'вес', 'активация', 'входной', 'выходной', 'скрытый'] },
    { question: 'Что такое функция активации? Назови примеры и их назначение.', hint: ['relu', 'sigmoid', 'softmax', 'tanh', 'активация', 'нелинейность', 'функция'] },
    { question: 'Что такое обратное распространение ошибки (backpropagation)?', hint: ['backprop', 'градиент', 'ошибка', 'цепное правило', 'веса', 'обновление', 'производная'] },
    { question: 'Что такое CNN? Для каких задач используется?', hint: ['cnn', 'свёрточная', 'изображение', 'фильтр', 'pooling', 'computer vision', 'пространственный'] },
    { question: 'Что такое RNN и для чего она применяется?', hint: ['rnn', 'рекуррентная', 'последовательность', 'текст', 'время', 'память', 'hidden state'] },
    { question: 'Что такое переобучение нейросети? Как его предотвратить?', hint: ['переобучение', 'overfitting', 'dropout', 'регуляризация', 'аугментация', 'early stopping', 'валидация'] },
  ],

  it_ml_5: [
    { question: 'Что такое MLOps? Зачем нужно выкладывать модель в продакшн?', hint: ['mlops', 'деплой', 'api', 'production', 'мониторинг', 'pipeline', 'автоматизация'] },
    { question: 'Что такое FastAPI и как сделать API для ML-модели?', hint: ['fastapi', 'api', 'endpoint', 'predict', 'json', 'модель', 'inference'] },
    { question: 'Что такое feature store? Зачем хранить признаки отдельно?', hint: ['feature store', 'признаки', 'централизованный', 'переиспользование', 'онлайн', 'оффлайн', 'хранение'] },
    { question: 'Что такое A/B тестирование модели? Как сравнить две версии?', hint: ['ab тест', 'эксперимент', 'контрольная группа', 'метрика', 'статистика', 'p-value', 'версия'] },
    { question: 'Что такое Jupyter Notebook? Чем он удобен для исследования?', hint: ['jupyter', 'notebook', 'ячейка', 'markdown', 'интерактивный', 'исследование', 'код'] },
    { question: 'Как оценить качество рекомендательной системы?', hint: ['рекомендательная', 'precision@k', 'recall@k', 'ndcg', 'coverage', 'diversity', 'метрика'] },
  ],

  // ── DevOps ────────────────────────────────────────────────
  it_devops_1: [
    { question: 'Что такое Linux и зачем DevOps-инженеру нужно его знать?', hint: ['linux', 'unix', 'сервер', 'команды', 'bash', 'файловая система', 'процесс'] },
    { question: 'Что делает команда ls в Linux? Какие есть полезные флаги?', hint: ['ls', 'список', 'файлы', '-la', '-lh', 'директория', 'скрытые'] },
    { question: 'Что такое права доступа в Linux? Что означает chmod 755?', hint: ['права', 'chmod', 'rwx', 'владелец', 'группа', 'другие', '755'] },
    { question: 'Что такое процесс в Linux? Как управлять процессами?', hint: ['процесс', 'pid', 'ps', 'kill', 'top', 'фоновый', 'fg', 'bg'] },
    { question: 'Что такое SSH и как им подключиться к серверу?', hint: ['ssh', 'защищённый', 'ключ', 'port 22', 'remote', 'подключение', 'терминал'] },
    { question: 'Что такое bash-скрипт? Как написать простую автоматизацию?', hint: ['bash', 'скрипт', 'sh', 'автоматизация', 'shebang', 'переменная', 'цикл'] },
  ],

  it_devops_2: [
    { question: 'Что такое Git и зачем нужна система контроля версий?', hint: ['git', 'версия', 'коммит', 'история', 'откат', 'команда', 'изменения'] },
    { question: 'Что делает git commit? Что такое сообщение коммита?', hint: ['commit', 'сохранение', 'изменения', 'сообщение', 'staged', 'репозиторий', 'история'] },
    { question: 'Что такое ветка (branch) в Git? Как создать и переключиться?', hint: ['ветка', 'branch', 'checkout', 'merge', 'изоляция', 'feature', 'main'] },
    { question: 'Что такое merge и rebase? В чем разница?', hint: ['merge', 'rebase', 'объединение', 'история', 'конфликт', 'linear', 'ветки'] },
    { question: 'Что такое pull request? Зачем делать code review?', hint: ['pull request', 'pr', 'review', 'код ревью', 'обратная связь', 'качество', 'merge'] },
    { question: 'Что такое .gitignore? Какие файлы нужно игнорировать?', hint: ['gitignore', 'исключить', 'env', 'node_modules', 'логи', 'секреты', 'артефакты'] },
  ],

  it_devops_3: [
    { question: 'Что такое Docker образ (image) и контейнер? В чем разница?', hint: ['image', 'образ', 'контейнер', 'запущенный', 'шаблон', 'слои', 'read-only'] },
    { question: 'Что делает команда docker build? Что такое Docker layer?', hint: ['docker build', 'dockerfile', 'слой', 'layer', 'кэш', 'образ', 'команда'] },
    { question: 'Что такое Docker Compose? Зачем нужен для разработки?', hint: ['docker compose', 'сервис', 'yml', 'сеть', 'несколько контейнеров', 'up', 'down'] },
    { question: 'Что такое Docker volume? Как сохранить данные контейнера?', hint: ['volume', 'данные', 'персистентность', 'mount', 'bind', 'база данных', 'хранение'] },
    { question: 'Что такое Docker registry? Как опубликовать образ?', hint: ['registry', 'docker hub', 'push', 'pull', 'репозиторий образов', 'тег', 'publish'] },
    { question: 'Как оптимизировать размер Docker образа?', hint: ['оптимизация', 'multi-stage', 'размер', 'alpine', '.dockerignore', 'слои', 'минимальный'] },
  ],

  it_devops_4: [
    { question: 'Что такое CI/CD pipeline? Из каких этапов он состоит?', hint: ['pipeline', 'этап', 'build', 'test', 'deploy', 'автоматизация', 'непрерывная интеграция'] },
    { question: 'Что такое GitHub Actions? Как настроить workflow?', hint: ['github actions', 'workflow', 'yaml', 'trigger', 'job', 'step', 'runner'] },
    { question: 'Что такое артефакты сборки? Зачем их хранить?', hint: ['артефакт', 'build', 'бинарник', 'хранение', 'версия', 'развёртывание', 'сборка'] },
    { question: 'Что такое тесты в CI? Почему нельзя деплоить без тестов?', hint: ['тест', 'unit', 'integration', 'автоматический', 'регрессия', 'качество', 'ci'] },
    { question: 'Что такое blue-green deployment? В чем его преимущество?', hint: ['blue-green', 'два окружения', 'переключение', 'downtime', 'rollback', 'production', 'деплой'] },
    { question: 'Что такое мониторинг приложения? Какие метрики важны?', hint: ['мониторинг', 'метрика', 'cpu', 'memory', 'latency', 'error rate', 'alerting'] },
  ],

  it_devops_5: [
    { question: 'Что такое Kubernetes? Зачем нужна оркестрация?', hint: ['kubernetes', 'k8s', 'оркестрация', 'pod', 'контейнер', 'масштабирование', 'управление'] },
    { question: 'Что такое Pod в Kubernetes? Как он связан с контейнером?', hint: ['pod', 'контейнер', 'минимальная единица', 'ip', 'сеть', 'жизненный цикл', 'группа'] },
    { question: 'Что такое Deployment в Kubernetes? Зачем нужен ReplicaSet?', hint: ['deployment', 'replicaset', 'реплика', 'доступность', 'обновление', 'rollback', 'желаемое состояние'] },
    { question: 'Что такое Service в Kubernetes? Как происходит балансировка?', hint: ['service', 'балансировка', 'clusterip', 'nodeport', 'loadbalancer', 'selector', 'endpoint'] },
    { question: 'Что такое Helm? Зачем нужны чарты для Kubernetes?', hint: ['helm', 'chart', 'шаблон', 'пакет', 'values', 'release', 'upgrade'] },
    { question: 'Что такое namespace в Kubernetes? Зачем изолировать окружения?', hint: ['namespace', 'изоляция', 'окружение', 'dev', 'prod', 'rbac', 'квота'] },
  ],

  // ── Design ────────────────────────────────────────────────
  design_1: [
    { question: 'Что такое дизайн? Чем он отличается от искусства?', hint: ['дизайн', 'функция', 'решение', 'пользователь', 'задача', 'искусство', 'цель'] },
    { question: 'Что такое UI и UX дизайн? В чем разница?', hint: ['ui', 'ux', 'интерфейс', 'опыт', 'визуальный', 'удобство', 'пользователь'] },
    { question: 'Что такое принципы гештальта в дизайне?', hint: ['гештальт', 'близость', 'сходство', 'замкнутость', 'продолжение', 'группировка', 'восприятие'] },
    { question: 'Что такое сетка (grid) в дизайне? Зачем она нужна?', hint: ['сетка', 'grid', 'колонка', 'выравнивание', 'порядок', 'структура', 'ритм'] },
    { question: 'Что такое иерархия в дизайне? Как её создать?', hint: ['иерархия', 'размер', 'цвет', 'контраст', 'важность', 'внимание', 'шрифт'] },
    { question: 'Что такое белое пространство (whitespace) и зачем оно нужно?', hint: ['белое пространство', 'whitespace', 'воздух', 'отступ', 'читаемость', 'дыхание', 'акцент'] },
  ],

  design_2: [
    { question: 'Что такое фрейм (frame) в Figma? Чем он отличается от группы?', hint: ['фрейм', 'frame', 'группа', 'контейнер', 'ограничения', 'auto layout', 'компонент'] },
    { question: 'Что такое компонент в Figma? Зачем его использовать?', hint: ['компонент', 'мастер', 'экземпляр', 'переиспользование', 'изменение', 'символ', 'библиотека'] },
    { question: 'Что такое Auto Layout в Figma?', hint: ['auto layout', 'адаптивный', 'padding', 'gap', 'направление', 'shrink', 'fill'] },
    { question: 'Что такое стили (styles) в Figma? Как они помогают в работе?', hint: ['стиль', 'цвет', 'шрифт', 'тень', 'консистентность', 'библиотека', 'переиспользование'] },
    { question: 'Как сделать прототип в Figma? Что такое интерактивные компоненты?', hint: ['прототип', 'связи', 'transition', 'overlay', 'триггер', 'animate', 'клик'] },
    { question: 'Что такое варианты компонентов (variants) в Figma?', hint: ['variants', 'вариант', 'состояние', 'свойство', 'hover', 'active', 'disabled'] },
  ],

  design_3: [
    { question: 'Что такое UX-исследование? Зачем оно нужно перед дизайном?', hint: ['исследование', 'пользователь', 'данные', 'инсайт', 'проблема', 'проверка', 'гипотеза'] },
    { question: 'Что такое user persona (персонаж)? Как его создать?', hint: ['персонаж', 'persona', 'портрет', 'цели', 'потребности', 'поведение', 'характеристики'] },
    { question: 'Что такое CJM (Customer Journey Map)?', hint: ['cjm', 'путь', 'пользователь', 'этапы', 'эмоции', 'точки контакта', 'карта'] },
    { question: 'Что такое юзабилити-тестирование? Как его провести?', hint: ['юзабилити', 'тест', 'пользователь', 'задание', 'наблюдение', 'проблемы', 'паттерн'] },
    { question: 'Что такое A/B тест в дизайне?', hint: ['ab тест', 'вариант', 'метрика', 'конверсия', 'сравнение', 'статистика', 'победитель'] },
    { question: 'Что такое Jobs-to-be-Done (JTBD)?', hint: ['jtbd', 'работа', 'пользователь', 'задача', 'контекст', 'мотивация', 'outcome'] },
  ],

  design_4: [
    { question: 'Что такое wireframe? Чем он отличается от прототипа?', hint: ['wireframe', 'скелет', 'низкая детализация', 'прототип', 'структура', 'контент', 'схема'] },
    { question: 'Что такое пользовательский поток (user flow)?', hint: ['user flow', 'поток', 'шаги', 'сценарий', 'навигация', 'диаграмма', 'экран'] },
    { question: 'Что такое интерактивный прототип? Зачем тестировать до разработки?', hint: ['интерактивный', 'прототип', 'клик', 'переход', 'тест', 'итерация', 'дешево'] },
    { question: 'Что такое информационная архитектура (IA)?', hint: ['ia', 'структура', 'навигация', 'контент', 'иерархия', 'sitemap', 'организация'] },
    { question: 'Что такое микровзаимодействия (micro-interactions)?', hint: ['микро', 'анимация', 'обратная связь', 'триггер', 'правило', 'фидбек', 'состояние'] },
    { question: 'Как правильно организовать передачу макетов разработчикам?', hint: ['handoff', 'figma', 'inspect', 'документация', 'спецификация', 'размеры', 'ассеты'] },
  ],

  design_5: [
    { question: 'Что такое дизайн-система? Чем она отличается от UI-кита?', hint: ['дизайн-система', 'компонент', 'токен', 'паттерн', 'документация', 'консистентность', 'команда'] },
    { question: 'Что такое токены дизайна (design tokens)?', hint: ['токен', 'переменная', 'цвет', 'отступ', 'шрифт', 'тема', 'брендинг'] },
    { question: 'Что такое атомарный дизайн (atomic design)?', hint: ['атомарный', 'атом', 'молекула', 'организм', 'шаблон', 'страница', 'брэдфрост'] },
    { question: 'Что такое доступность (accessibility) в дизайне?', hint: ['доступность', 'a11y', 'контраст', 'wcag', 'screen reader', 'инклюзивный', 'шрифт'] },
    { question: 'Как поддерживать дизайн-систему актуальной?', hint: ['версионирование', 'документация', 'changelog', 'governance', 'процесс', 'обновление', 'команда'] },
    { question: 'Что такое dark mode в дизайне? Как проектировать под него?', hint: ['dark mode', 'тема', 'цвет', 'контраст', 'переменная', 'семантический', 'токен'] },
  ],

  // ── Video/Photo ───────────────────────────────────────────
  video_photo_1: [
    { question: 'Что такое монтаж видео? Из каких этапов он состоит?', hint: ['монтаж', 'нарезка', 'склейка', 'timeline', 'последовательность', 'сцена', 'переход'] },
    { question: 'Что такое timeline в видеоредакторе? Как устроена дорожка?', hint: ['timeline', 'дорожка', 'видео', 'аудио', 'клип', 'позиция', 'время'] },
    { question: 'Что такое FPS (частота кадров)? Как это влияет на видео?', hint: ['fps', 'кадры', 'плавность', '24', '30', '60', 'кино', 'движение'] },
    { question: 'Что такое разрешение видео? Чем 4K лучше 1080p?', hint: ['разрешение', '1080p', '4k', 'пиксели', 'качество', 'размер файла', 'экран'] },
    { question: 'Что такое B-roll? Зачем он нужен в монтаже?', hint: ['b-roll', 'перебивка', 'иллюстрация', 'основной план', 'разнообразие', 'визуальный', 'поддержка'] },
    { question: 'Что такое cut (склейка)? Какие виды склеек существуют?', hint: ['cut', 'склейка', 'жёсткая', 'прямая', 'jump cut', 'match cut', 'l-cut', 'j-cut'] },
  ],

  video_photo_2: [
    { question: 'Что такое цветокоррекция? Какие параметры она затрагивает?', hint: ['цветокоррекция', 'яркость', 'контраст', 'насыщенность', 'баланс белого', 'экспозиция', 'тени'] },
    { question: 'Что такое гистограмма в видео? Как её читать?', hint: ['гистограмма', 'яркость', 'распределение', 'темные', 'светлые', 'экспозиция', 'обрезание'] },
    { question: 'Чем цветокоррекция отличается от color grading?', hint: ['цветокоррекция', 'color grading', 'технический', 'художественный', 'лук', 'стиль', 'lut'] },
    { question: 'Что такое LUT (Look-Up Table)? Как применить его в редакторе?', hint: ['lut', 'предустановка', 'цвет', 'применить', 'стиль', 'кинематограф', 'log'] },
    { question: 'Что такое баланс белого (white balance)? Как исправить неправильный?', hint: ['баланс белого', 'температура', 'кельвин', 'теплый', 'холодный', 'нейтральный', 'исправить'] },
    { question: 'Что такое HDR видео? В чем его преимущества?', hint: ['hdr', 'динамический диапазон', 'светлые', 'тёмные', 'log', 'профиль', 'детали'] },
  ],

  video_photo_3: [
    { question: 'Что такое переход (transition) в монтаже? Когда он уместен?', hint: ['переход', 'transition', 'fade', 'dissolve', 'темп', 'смена сцены', 'уместность'] },
    { question: 'Что такое jump cut? Когда его используют намеренно?', hint: ['jump cut', 'прыжок', 'YouTube', 'ритм', 'пауза', 'убрать', 'вирусный'] },
    { question: 'Что такое match cut и J-cut? Приведи пример.', hint: ['match cut', 'j-cut', 'l-cut', 'аудио', 'видео', 'опережение', 'плавность'] },
    { question: 'Что такое темп (pacing) видео? Как он влияет на восприятие?', hint: ['темп', 'pacing', 'ритм', 'длина клипа', 'музыка', 'эмоция', 'динамика'] },
    { question: 'Что такое motion blur? Когда добавлять его искусственно?', hint: ['motion blur', 'смазывание', 'движение', 'реалистичность', 'export', 'shutter speed', 'slow motion'] },
    { question: 'Как правильно синхронизировать видео с музыкой?', hint: ['синхронизация', 'beat', 'ритм', 'удар', 'монтаж по музыке', 'маркер', 'темп'] },
  ],

  video_photo_4: [
    { question: 'Что такое звук в видео? Чем монофоническое отличается от стерео?', hint: ['моно', 'стерео', 'звук', 'каналы', 'пространство', 'аудио', 'наушники'] },
    { question: 'Что такое шумоподавление (noise reduction)? Как убрать фоновый шум?', hint: ['шум', 'noise reduction', 'фон', 'частота', 'фильтр', 'чистый звук', 'plug-in'] },
    { question: 'Что такое музыкальный бит в монтаже? Как нарезать под музыку?', hint: ['бит', 'музыка', 'ритм', 'удар', 'синхрон', 'маркер', 'cut'] },
    { question: 'Что такое звуковые эффекты (SFX)? Зачем их добавлять?', hint: ['sfx', 'звуковые эффекты', 'атмосфера', 'удар', 'переход', 'форматирование', 'immersion'] },
    { question: 'Что такое нормализация звука? Как выровнять уровни громкости?', hint: ['нормализация', 'громкость', 'lufs', 'peak', 'компрессор', 'лимитер', '-14 lufs'] },
    { question: 'Что такое voiceover (закадровый голос)? Как его записать качественно?', hint: ['voiceover', 'закадровый', 'микрофон', 'тишина', 'запись', 'редактирование', 'фильтр'] },
  ],

  video_photo_5: [
    { question: 'Что такое экспорт видео? Какой кодек выбрать?', hint: ['экспорт', 'кодек', 'h264', 'h265', 'mp4', 'битрейт', 'качество'] },
    { question: 'Что такое битрейт (bitrate)? Как он влияет на качество и размер?', hint: ['битрейт', 'bitrate', 'качество', 'размер', 'сжатие', 'mbps', 'постоянный'] },
    { question: 'Как оптимизировать видео для YouTube?', hint: ['youtube', 'рекомендации', 'h264', '1080p', 'aac', 'финальный экспорт', 'настройки'] },
    { question: 'Что такое портфолио видеомонтажера? Что в него включить?', hint: ['портфолио', 'showreel', 'работы', 'разнообразие', 'демонстрация', 'навыки', 'клиент'] },
    { question: 'Что такое proxy-файлы в монтаже? Зачем они нужны?', hint: ['proxy', 'прокси', 'производительность', '4k', 'облегченный', 'монтаж', 'рендер'] },
    { question: 'Как построить процесс (workflow) от съёмки до публикации?', hint: ['workflow', 'процесс', 'организация', 'папки', 'бэкап', 'финальный', 'публикация'] },
  ],

  // Фолбэк (если key не найден)
  it_3: [
    { question: 'Что такое переменная в программировании? Приведи пример.', hint: ['переменная', 'значение', 'хранение', 'x', 'присвоение', 'тип'] },
    { question: 'Что такое функция? Для чего она нужна?', hint: ['функция', 'def', 'код', 'вызов', 'параметр', 'возврат', 'повторно'] },
    { question: 'Что такое REST API? Объясни своими словами.', hint: ['api', 'http', 'запрос', 'endpoint', 'rest', 'интерфейс', 'сервис'] },
    { question: 'Что такое база данных? Зачем она нужна?', hint: ['база', 'данные', 'хранение', 'таблица', 'sql', 'запрос', 'crud'] },
    { question: 'Что такое Docker и зачем он нужен?', hint: ['docker', 'контейнер', 'образ', 'изоляция', 'окружение', 'портируемость'] },
  ],
}

// ── Данные сфер ───────────────────────────────────────────

export const SPHERES: Sphere[] = [
  {
    id: 'it_backend',
    name: 'Backend-разработка',
    icon: '⚙️',
    description: 'Создавай серверную логику, API и базы данных на Python',
    career: {
      title: 'Python Backend Developer',
      description: 'Разрабатываешь серверную часть веб-приложений: REST API, базы данных, деплой',
      skills: ['Python', 'Django/FastAPI', 'PostgreSQL', 'Docker', 'REST API']
    },
    steps: [
      {
        id: 1, order: 1,
        title: 'Основы Python с нуля',
        icon: '🐍', duration: '6 часов', difficulty: 'beginner', xp: 100,
        why: 'Python — самый востребованный язык для backend. На этом шаге освоишь синтаксис, переменные, функции — это база для всего дальнейшего.',
        skills: ['переменные и типы данных', 'функции и аргументы', 'циклы и условия', 'списки, словари, множества'],
        materials: [
          { id: 'py_hir_1', type: 'video', title: 'Python — лекция 1 Хирьянов (МФТИ)', xp: 30, duration: '1.5 часа', searchQuery: 'Тимофей Хирьянов Python лекция 1 МФТИ', videoUrl: 'https://www.youtube.com/watch?v=lKO3qDLCAnk' },
          { id: 'py_ulbi_1', type: 'video', title: 'Python с нуля — Ulbi TV', xp: 25, duration: '2 часа', searchQuery: 'Python с нуля Ulbi TV полный курс' },
          { id: 'py_habr_1', type: 'article', title: 'Python: что такое и как начать (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/101regular/' },
          { id: 'py_quiz_1', type: 'quiz', title: 'Проверь основы Python', xp: 25 }
        ]
      },
      {
        id: 2, order: 2,
        title: 'Объектно-ориентированное программирование',
        icon: '🧩', duration: '5 часов', difficulty: 'beginner', xp: 120,
        why: 'ООП — основа архитектуры любого серьёзного проекта. Без понимания классов и наследования не получится читать и писать production-код.',
        skills: ['классы и объекты', 'наследование', 'инкапсуляция', 'полиморфизм', 'магические методы'],
        materials: [
          { id: 'oop_hir_1', type: 'video', title: 'ООП в Python — Хирьянов (МФТИ)', xp: 30, duration: '2 часа', searchQuery: 'Хирьянов ООП Python МФТИ лекция' },
          { id: 'oop_selfedu_1', type: 'video', title: 'ООП Python — Selfedu', xp: 25, duration: '1.5 часа', searchQuery: 'Python ООП Selfedu классы объекты' },
          { id: 'oop_habr_1', type: 'article', title: 'ООП в Python: полное руководство (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/648257/' },
          { id: 'oop_quiz_2', type: 'quiz', title: 'Квиз по ООП', xp: 25 }
        ]
      },
      {
        id: 3, order: 3,
        title: 'Базы данных и SQL',
        icon: '🗄️', duration: '7 часов', difficulty: 'intermediate', xp: 150,
        why: 'Практически каждое web-приложение хранит данные в БД. SQL — обязательный навык для backend-разработчика, без него нет реальных проектов.',
        skills: ['SELECT, INSERT, UPDATE, DELETE', 'JOIN и связи таблиц', 'индексы', 'транзакции и ACID', 'PostgreSQL основы'],
        materials: [
          { id: 'sql_edu_1', type: 'video', title: 'SQL для начинающих — Артём Санников', xp: 30, duration: '2 часа', searchQuery: 'SQL для начинающих полный курс русский Санников' },
          { id: 'sql_habr_1', type: 'article', title: 'Изучаем SQL: JOIN (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/173985/' },
          { id: 'sql_habr_2', type: 'article', title: 'PostgreSQL: установка и первые шаги (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/441538/' },
          { id: 'sql_quiz_3', type: 'quiz', title: 'Квиз по SQL', xp: 30 }
        ]
      },
      {
        id: 4, order: 4,
        title: 'REST API с Django / FastAPI',
        icon: '🚀', duration: '8 часов', difficulty: 'intermediate', xp: 175,
        why: 'API — это язык общения между frontend и backend. Django и FastAPI — самые популярные Python фреймворки для создания backend.',
        skills: ['создание REST endpoints', 'сериализация данных', 'аутентификация и JWT', 'middleware', 'документация API'],
        materials: [
          { id: 'drf_1', type: 'video', title: 'Django REST Framework — Devman', xp: 35, duration: '3 часа', searchQuery: 'Django REST Framework урок русский DRF' },
          { id: 'fastapi_1', type: 'video', title: 'FastAPI за 1 час — Ulbi TV', xp: 30, duration: '1 час', searchQuery: 'FastAPI tutorial на русском Ulbi' },
          { id: 'api_habr_1', type: 'article', title: 'Создание REST API на FastAPI (Habr)', xp: 25, duration: '25 минут', articleUrl: 'https://habr.com/ru/articles/596663/' },
          { id: 'api_quiz_4', type: 'quiz', title: 'Квиз по REST API', xp: 30 }
        ]
      },
      {
        id: 5, order: 5,
        title: 'Docker и деплой проекта',
        icon: '🐳', duration: '6 часов', difficulty: 'intermediate', xp: 200,
        why: 'Написать код — это половина работы. Уметь выложить его в production — вторая половина. Docker сделал деплой воспроизводимым и простым.',
        skills: ['Dockerfile', 'docker-compose', 'nginx', 'переменные окружения', 'CI/CD основы'],
        materials: [
          { id: 'docker_1', type: 'video', title: 'Docker с нуля — Ulbi TV', xp: 35, duration: '2 часа', searchQuery: 'Docker с нуля Ulbi TV урок' },
          { id: 'docker_habr_1', type: 'article', title: 'Docker для начинающих (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/310460/' },
          { id: 'deploy_habr_1', type: 'article', title: 'Деплой Django на VPS с Docker (Habr)', xp: 25, duration: '30 минут', articleUrl: 'https://habr.com/ru/articles/513572/' },
          { id: 'deploy_quiz_5', type: 'quiz', title: 'Квиз по деплою', xp: 35 }
        ]
      }
    ]
  },

  {
    id: 'it_frontend',
    name: 'Frontend-разработка',
    icon: '🎨',
    description: 'Создавай красивые и интерактивные сайты на HTML, CSS, JS и React',
    career: {
      title: 'Frontend Developer',
      description: 'Разрабатываешь пользовательский интерфейс веб-приложений',
      skills: ['HTML/CSS', 'JavaScript', 'React', 'TypeScript', 'Webpack/Vite']
    },
    steps: [
      {
        id: 1, order: 1,
        title: 'HTML и CSS — основы верстки',
        icon: '🌐', duration: '5 часов', difficulty: 'beginner', xp: 90,
        why: 'HTML и CSS — строительные блоки любого сайта. Без них нет frontend. Уже после этого шага сможешь сверстать простую страницу.',
        skills: ['теги и атрибуты HTML', 'блочная модель CSS', 'Flexbox', 'Grid', 'адаптивная верстка'],
        materials: [
          { id: 'html_sorax_1', type: 'video', title: 'HTML/CSS для начинающих — Sorax', xp: 30, duration: '2 часа', searchQuery: 'HTML CSS для начинающих Sorax полный курс' },
          { id: 'html_fls_1', type: 'video', title: 'Верстка сайта — FLS (Фрилансер по жизни)', xp: 25, duration: '1.5 часа', searchQuery: 'верстка сайта FLS Фрилансер по жизни html css' },
          { id: 'html_habr_1', type: 'article', title: 'Flexbox: руководство (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/157525/' },
          { id: 'html_quiz_1', type: 'quiz', title: 'Квиз по HTML/CSS', xp: 25 }
        ]
      },
      {
        id: 2, order: 2,
        title: 'JavaScript — основы языка',
        icon: '⚡', duration: '7 часов', difficulty: 'beginner', xp: 120,
        why: 'JavaScript — единственный язык браузера. Без него нет интерактивности: нет кнопок, форм, анимаций. Всё что "движется" — это JS.',
        skills: ['переменные let/const', 'функции и стрелки', 'DOM-манипуляции', 'события', 'промисы и async/await'],
        materials: [
          { id: 'js_kcancel_1', type: 'video', title: 'JavaScript с нуля — Владилен Минин', xp: 35, duration: '3 часа', searchQuery: 'JavaScript с нуля Владилен Минин полный курс' },
          { id: 'js_habr_1', type: 'article', title: 'Современный JavaScript: асинхронность (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/282477/' },
          { id: 'js_mdn_1', type: 'article', title: 'Промисы и async/await на MDN (рус)', xp: 20, duration: '15 минут', articleUrl: 'https://developer.mozilla.org/ru/docs/Learn/JavaScript/Asynchronous/Promises' },
          { id: 'js_quiz_2', type: 'quiz', title: 'Квиз по JavaScript', xp: 25 }
        ]
      },
      {
        id: 3, order: 3,
        title: 'React — компонентный подход',
        icon: '⚛️', duration: '8 часов', difficulty: 'intermediate', xp: 150,
        why: 'React используется в 40% вакансий frontend. Компонентный подход, виртуальный DOM и экосистема делают его стандартом индустрии.',
        skills: ['JSX синтаксис', 'props и state', 'хуки useState/useEffect', 'работа со списками', 'условный рендеринг'],
        materials: [
          { id: 'react_minin_1', type: 'video', title: 'React для начинающих — Владилен Минин', xp: 35, duration: '3 часа', searchQuery: 'React для начинающих Владилен Минин 2024' },
          { id: 'react_habr_1', type: 'article', title: 'React хуки: подробное руководство (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/554280/' },
          { id: 'react_habr_2', type: 'article', title: 'useEffect: полное руководство (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/580276/' },
          { id: 'react_quiz_3', type: 'quiz', title: 'Квиз по React', xp: 25 }
        ]
      },
      {
        id: 4, order: 4,
        title: 'TypeScript для React-разработчика',
        icon: '🔷', duration: '5 часов', difficulty: 'intermediate', xp: 140,
        why: 'TypeScript убирает целый класс ошибок на этапе написания кода. Большинство компаний уже требуют TS в вакансиях.',
        skills: ['базовые типы TS', 'interface и type', 'generics', 'типизация React-компонентов', 'union типы'],
        materials: [
          { id: 'ts_minin_1', type: 'video', title: 'TypeScript полный курс — Владилен Минин', xp: 35, duration: '3 часа', searchQuery: 'TypeScript полный курс Владилен Минин 2024' },
          { id: 'ts_habr_1', type: 'article', title: 'TypeScript: введение для JavaScript разработчика (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/610244/' },
          { id: 'ts_habr_2', type: 'article', title: 'Generics в TypeScript (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/669898/' },
          { id: 'ts_quiz_4', type: 'quiz', title: 'Квиз по TypeScript', xp: 25 }
        ]
      },
      {
        id: 5, order: 5,
        title: 'Проектная разработка и инструменты',
        icon: '🛠️', duration: '6 часов', difficulty: 'advanced', xp: 180,
        why: 'Умение собрать проект, настроить роутинг и оптимизацию — то, что отличает junior от middle. Этот шаг выводит тебя на уровень реальных проектов.',
        skills: ['React Router', 'Zustand/Redux', 'Vite сборка', 'code splitting', 'CSS-in-JS'],
        materials: [
          { id: 'proj_minin_1', type: 'video', title: 'React проект с нуля — Владилен Минин', xp: 40, duration: '4 часа', searchQuery: 'React проект с нуля todo app Владилен Минин' },
          { id: 'proj_habr_1', type: 'article', title: 'Zustand: простой state manager (Habr)', xp: 25, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/706890/' },
          { id: 'proj_habr_2', type: 'article', title: 'Оптимизация React приложений (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/508058/' },
          { id: 'proj_quiz_5', type: 'quiz', title: 'Квиз по проектной разработке', xp: 40 }
        ]
      }
    ]
  },

  {
    id: 'it_ml',
    name: 'Machine Learning',
    icon: '🤖',
    description: 'Разрабатывай модели машинного обучения и анализируй данные',
    career: {
      title: 'ML Engineer / Data Scientist',
      description: 'Строишь и применяешь модели машинного обучения для реальных задач',
      skills: ['Python', 'NumPy/Pandas', 'sklearn', 'PyTorch', 'MLOps']
    },
    steps: [
      {
        id: 1, order: 1,
        title: 'Python для Data Science',
        icon: '📊', duration: '6 часов', difficulty: 'beginner', xp: 100,
        why: 'NumPy, Pandas и Matplotlib — это "троица" данных. Без них невозможно делать ничего полезного в ML. Именно с них начинается путь в Data Science.',
        skills: ['NumPy массивы', 'Pandas DataFrame', 'работа с CSV', 'визуализация данных', 'очистка данных'],
        materials: [
          { id: 'ds_py_1', type: 'video', title: 'Python для Data Science — Школа Big Data', xp: 30, duration: '2 часа', searchQuery: 'Python для Data Science NumPy Pandas на русском' },
          { id: 'ds_pandas_1', type: 'video', title: 'Pandas за 30 минут — основы', xp: 25, duration: '30 минут', searchQuery: 'Pandas урок на русском за 30 минут' },
          { id: 'ds_habr_1', type: 'article', title: 'Pandas: шпаргалка (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/196980/' },
          { id: 'ds_quiz_1', type: 'quiz', title: 'Квиз по Python DS', xp: 25 }
        ]
      },
      {
        id: 2, order: 2,
        title: 'Математика для ML',
        icon: '📐', duration: '7 часов', difficulty: 'beginner', xp: 120,
        why: 'ML — это прикладная математика. Без понимания линейной алгебры, производных и вероятностей алгоритмы будут "чёрным ящиком".',
        skills: ['матрицы и векторы', 'производные и градиент', 'вероятность', 'статистика', 'нормализация'],
        materials: [
          { id: 'math_1', type: 'video', title: 'Линейная алгебра для ML — 3Blue1Brown рус', xp: 30, duration: '2 часа', searchQuery: '3Blue1Brown линейная алгебра для машинного обучения на русском' },
          { id: 'math_stat_1', type: 'video', title: 'Статистика для ML — на русском', xp: 25, duration: '1.5 часа', searchQuery: 'статистика для машинного обучения курс на русском' },
          { id: 'math_habr_1', type: 'article', title: 'Математика для ML: минимальный набор (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/301352/' },
          { id: 'math_quiz_2', type: 'quiz', title: 'Квиз по математике для ML', xp: 25 }
        ]
      },
      {
        id: 3, order: 3,
        title: 'Классические алгоритмы ML',
        icon: '🧠', duration: '8 часов', difficulty: 'intermediate', xp: 160,
        why: 'Линейная регрессия, деревья решений, Random Forest решают большинство реальных задач бизнеса. Это must-have для любого ML-специалиста.',
        skills: ['линейная регрессия', 'классификация', 'sklearn', 'метрики качества', 'кросс-валидация'],
        materials: [
          { id: 'ml_class_1', type: 'video', title: 'Машинное обучение — Воронцов (Яндекс)', xp: 40, duration: '3 часа', searchQuery: 'Воронцов машинное обучение Яндекс Школа анализа данных ШАД' },
          { id: 'ml_sklearn_1', type: 'video', title: 'sklearn за 1 час — практика', xp: 30, duration: '1 час', searchQuery: 'sklearn scikit-learn машинное обучение урок на русском' },
          { id: 'ml_habr_1', type: 'article', title: 'Random Forest объяснение (Habr)', xp: 25, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/171759/' },
          { id: 'ml_quiz_3', type: 'quiz', title: 'Квиз по алгоритмам ML', xp: 30 }
        ]
      },
      {
        id: 4, order: 4,
        title: 'Нейронные сети и Deep Learning',
        icon: '🔮', duration: '10 часов', difficulty: 'advanced', xp: 200,
        why: 'Deep Learning изменил AI. CNN для изображений, трансформеры для текста — без нейросетей современный ML немыслим.',
        skills: ['перцептрон', 'backpropagation', 'CNN', 'RNN', 'PyTorch основы'],
        materials: [
          { id: 'dl_1', type: 'video', title: 'Deep Learning — Школа МФТИ / Хирьянов', xp: 40, duration: '3 часа', searchQuery: 'Deep Learning нейронные сети МФТИ Хирьянов на русском' },
          { id: 'dl_pytorch_1', type: 'video', title: 'PyTorch с нуля — практический курс', xp: 35, duration: '2.5 часа', searchQuery: 'PyTorch с нуля урок на русском нейросети' },
          { id: 'dl_habr_1', type: 'article', title: 'Нейронные сети: объяснение (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/312450/' },
          { id: 'dl_quiz_4', type: 'quiz', title: 'Квиз по нейросетям', xp: 35 }
        ]
      },
      {
        id: 5, order: 5,
        title: 'ML проекты и деплой моделей',
        icon: '🚢', duration: '8 часов', difficulty: 'advanced', xp: 220,
        why: 'Модель без деплоя — это просто ноутбук. Научись превращать эксперименты в реальные сервисы и составлять портфолио.',
        skills: ['FastAPI для ML', 'Docker ML-приложений', 'Jupyter проекты', 'портфолио', 'MLOps основы'],
        materials: [
          { id: 'mlops_1', type: 'video', title: 'Деплой ML модели — FastAPI + Docker', xp: 40, duration: '2 часа', searchQuery: 'деплой ML модели FastAPI Docker урок на русском' },
          { id: 'mlops_habr_1', type: 'article', title: 'MLOps: от эксперимента к production (Habr)', xp: 30, duration: '25 минут', articleUrl: 'https://habr.com/ru/articles/563342/' },
          { id: 'mlops_habr_2', type: 'article', title: 'Как создать ML проект для портфолио (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/494718/' },
          { id: 'mlops_quiz_5', type: 'quiz', title: 'Квиз по MLOps', xp: 40 }
        ]
      }
    ]
  },

  {
    id: 'it_devops',
    name: 'DevOps',
    icon: '🐳',
    description: 'Автоматизируй деплой, настраивай CI/CD и управляй инфраструктурой',
    career: {
      title: 'DevOps Engineer',
      description: 'Строишь и поддерживаешь инфраструктуру, автоматизируешь деплой',
      skills: ['Linux', 'Docker', 'Kubernetes', 'CI/CD', 'Terraform']
    },
    steps: [
      {
        id: 1, order: 1,
        title: 'Linux для DevOps',
        icon: '🐧', duration: '6 часов', difficulty: 'beginner', xp: 100,
        why: '90% серверов работают на Linux. Без командной строки нет DevOps — она используется везде: настройка, мониторинг, скрипты.',
        skills: ['основные команды bash', 'права доступа', 'процессы и сервисы', 'SSH', 'bash-скрипты'],
        materials: [
          { id: 'linux_1', type: 'video', title: 'Linux для начинающих — полный курс', xp: 35, duration: '3 часа', searchQuery: 'Linux для начинающих полный курс на русском ubuntu' },
          { id: 'linux_habr_1', type: 'article', title: 'Шпаргалка по Linux командам (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/123456/' },
          { id: 'linux_habr_2', type: 'article', title: 'Bash скрипты: основы (Habr)', xp: 20, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/471868/' },
          { id: 'linux_quiz_1', type: 'quiz', title: 'Квиз по Linux', xp: 25 }
        ]
      },
      {
        id: 2, order: 2,
        title: 'Git и командная работа',
        icon: '🌿', duration: '4 часа', difficulty: 'beginner', xp: 90,
        why: 'Git — инструмент №1 для любого разработчика и DevOps-инженера. Без него нет совместной разработки и контроля версий.',
        skills: ['коммиты и ветки', 'merge и rebase', 'pull requests', '.gitignore', 'GitHub/GitLab'],
        materials: [
          { id: 'git_1', type: 'video', title: 'Git с нуля — полный курс на русском', xp: 30, duration: '2 часа', searchQuery: 'Git с нуля полный курс на русском 2024' },
          { id: 'git_habr_1', type: 'article', title: 'Git: шпаргалка команд (Habr)', xp: 20, duration: '10 минут', articleUrl: 'https://habr.com/ru/articles/559748/' },
          { id: 'git_habr_2', type: 'article', title: 'Gitflow: рабочий процесс (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/106864/' },
          { id: 'git_quiz_2', type: 'quiz', title: 'Квиз по Git', xp: 20 }
        ]
      },
      {
        id: 3, order: 3,
        title: 'Docker и контейнеризация',
        icon: '🐳', duration: '7 часов', difficulty: 'intermediate', xp: 150,
        why: 'Docker изменил индустрию. Любое приложение теперь должно быть контейнеризировано. Это стандарт деплоя в 2024 году.',
        skills: ['Dockerfile', 'docker build и run', 'Docker Compose', 'volumes и networks', 'registry'],
        materials: [
          { id: 'docker_dv_1', type: 'video', title: 'Docker с нуля — полный курс', xp: 35, duration: '3 часа', searchQuery: 'Docker с нуля полный курс на русском 2024' },
          { id: 'docker_compose_1', type: 'video', title: 'Docker Compose — практика', xp: 30, duration: '1.5 часа', searchQuery: 'Docker Compose урок на русском практика' },
          { id: 'docker_habr_1', type: 'article', title: 'Docker для начинающих (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/310460/' },
          { id: 'docker_quiz_3', type: 'quiz', title: 'Квиз по Docker', xp: 30 }
        ]
      },
      {
        id: 4, order: 4,
        title: 'CI/CD — автоматизация деплоя',
        icon: '🔄', duration: '6 часов', difficulty: 'intermediate', xp: 170,
        why: 'CI/CD позволяет автоматически тестировать и деплоить код при каждом коммите. Это ускоряет разработку и снижает количество ошибок.',
        skills: ['GitHub Actions', 'pipeline', 'тесты в CI', 'деплой артефактов', 'мониторинг'],
        materials: [
          { id: 'cicd_1', type: 'video', title: 'GitHub Actions с нуля — CI/CD урок', xp: 35, duration: '2 часа', searchQuery: 'GitHub Actions CI CD урок на русском 2024' },
          { id: 'cicd_habr_1', type: 'article', title: 'GitHub Actions: полное руководство (Habr)', xp: 25, duration: '25 минут', articleUrl: 'https://habr.com/ru/articles/547194/' },
          { id: 'cicd_habr_2', type: 'article', title: 'Blue-Green Deployment на практике (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/358908/' },
          { id: 'cicd_quiz_4', type: 'quiz', title: 'Квиз по CI/CD', xp: 30 }
        ]
      },
      {
        id: 5, order: 5,
        title: 'Kubernetes — оркестрация',
        icon: '☸️', duration: '8 часов', difficulty: 'advanced', xp: 220,
        why: 'Kubernetes — стандарт для запуска контейнеров в production. Без него не обойтись при масштабировании на реальных нагрузках.',
        skills: ['Pod и Deployment', 'Service и Ingress', 'Helm charts', 'namespace', 'масштабирование'],
        materials: [
          { id: 'k8s_1', type: 'video', title: 'Kubernetes с нуля — полный курс', xp: 40, duration: '4 часа', searchQuery: 'Kubernetes с нуля полный курс на русском k8s 2024' },
          { id: 'k8s_habr_1', type: 'article', title: 'Kubernetes: концепции для начинающих (Habr)', xp: 30, duration: '25 минут', articleUrl: 'https://habr.com/ru/articles/258443/' },
          { id: 'k8s_habr_2', type: 'article', title: 'Helm: управление чартами (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/448844/' },
          { id: 'k8s_quiz_5', type: 'quiz', title: 'Квиз по Kubernetes', xp: 40 }
        ]
      }
    ]
  },

  {
    id: 'design',
    name: 'UX/UI Design',
    icon: '✏️',
    description: 'Проектируй удобные интерфейсы и создавай дизайн-системы',
    career: {
      title: 'UX/UI Designer',
      description: 'Проектируешь пользовательский опыт и визуальный интерфейс продуктов',
      skills: ['Figma', 'UX-исследования', 'прототипирование', 'дизайн-система', 'UI-компоненты']
    },
    steps: [
      {
        id: 1, order: 1,
        title: 'Основы дизайна и визуальные принципы',
        icon: '🎨', duration: '4 часа', difficulty: 'beginner', xp: 90,
        why: 'Дизайн — это не "красиво", а решение задач. Принципы гештальта, сетки и иерархия — фундамент, без которого любая работа выглядит любительски.',
        skills: ['принципы гештальта', 'сетка и выравнивание', 'иерархия', 'белое пространство', 'цвет и контраст'],
        materials: [
          { id: 'des_basic_1', type: 'video', title: 'Основы дизайна интерфейсов — Школа дизайна ВШЭ', xp: 30, duration: '1.5 часа', searchQuery: 'основы дизайна интерфейсов Школа дизайна ВШЭ НИУ' },
          { id: 'des_basic_2', type: 'video', title: 'Принципы UI дизайна — на русском', xp: 25, duration: '45 минут', searchQuery: 'принципы UI дизайна на русском урок 2024' },
          { id: 'des_habr_1', type: 'article', title: 'Гештальт в дизайне интерфейсов (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/119797/' },
          { id: 'des_quiz_1', type: 'quiz', title: 'Квиз по основам дизайна', xp: 20 }
        ]
      },
      {
        id: 2, order: 2,
        title: 'Figma — инструмент профессионала',
        icon: '🖥️', duration: '6 часов', difficulty: 'beginner', xp: 110,
        why: 'Figma — стандарт индустрии для UI-дизайна. 95% вакансий требуют Figma. Знание инструмента откроет двери к реальным проектам.',
        skills: ['фреймы и группы', 'Auto Layout', 'компоненты и варианты', 'стили', 'прототипирование'],
        materials: [
          { id: 'figma_1', type: 'video', title: 'Figma с нуля — полный курс для начинающих', xp: 35, duration: '3 часа', searchQuery: 'Figma с нуля полный курс на русском 2024' },
          { id: 'figma_autolayout_1', type: 'video', title: 'Auto Layout в Figma — урок', xp: 25, duration: '45 минут', searchQuery: 'Auto Layout Figma урок на русском' },
          { id: 'figma_habr_1', type: 'article', title: 'Figma: компоненты и варианты (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/651065/' },
          { id: 'figma_quiz_2', type: 'quiz', title: 'Квиз по Figma', xp: 25 }
        ]
      },
      {
        id: 3, order: 3,
        title: 'UX-исследования и пользователи',
        icon: '🔍', duration: '5 часов', difficulty: 'intermediate', xp: 130,
        why: 'Дизайн без исследований — это угадывание. UX-исследования позволяют делать продукты, которые реально решают проблемы людей.',
        skills: ['user persona', 'CJM', 'юзабилити-тестирование', 'Jobs-to-be-Done', 'A/B тестирование'],
        materials: [
          { id: 'ux_1', type: 'video', title: 'UX-исследования: с чего начать — Яндекс', xp: 30, duration: '1.5 часа', searchQuery: 'UX исследования с чего начать Яндекс урок на русском' },
          { id: 'ux_habr_1', type: 'article', title: 'Customer Journey Map: руководство (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/276675/' },
          { id: 'ux_habr_2', type: 'article', title: 'Jobs-to-be-Done теория (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/330760/' },
          { id: 'ux_quiz_3', type: 'quiz', title: 'Квиз по UX-исследованиям', xp: 25 }
        ]
      },
      {
        id: 4, order: 4,
        title: 'Прототипирование и информационная архитектура',
        icon: '🗺️', duration: '5 часов', difficulty: 'intermediate', xp: 140,
        why: 'Прототипы позволяют тестировать идеи до дорогостоящей разработки. Информационная архитектура делает навигацию понятной.',
        skills: ['wireframe', 'user flow', 'интерактивный прототип', 'information architecture', 'micro-interactions'],
        materials: [
          { id: 'proto_1', type: 'video', title: 'Прототипирование в Figma — урок', xp: 30, duration: '1.5 часа', searchQuery: 'прототипирование Figma урок на русском interactive prototype' },
          { id: 'ia_habr_1', type: 'article', title: 'Информационная архитектура: основы (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/205604/' },
          { id: 'proto_habr_1', type: 'article', title: 'Микровзаимодействия в дизайне (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/324854/' },
          { id: 'proto_quiz_4', type: 'quiz', title: 'Квиз по прототипированию', xp: 25 }
        ]
      },
      {
        id: 5, order: 5,
        title: 'Дизайн-системы и доступность',
        icon: '🏗️', duration: '6 часов', difficulty: 'advanced', xp: 180,
        why: 'Дизайн-системы делают продукт консистентным и масштабируемым. Доступность расширяет аудиторию и становится обязательным требованием.',
        skills: ['токены дизайна', 'атомарный дизайн', 'документация компонентов', 'WCAG', 'dark mode'],
        materials: [
          { id: 'ds_sys_1', type: 'video', title: 'Дизайн-система с нуля — Школа дизайна ВШЭ', xp: 35, duration: '2 часа', searchQuery: 'дизайн система с нуля ВШЭ Школа дизайна урок' },
          { id: 'ds_habr_1', type: 'article', title: 'Атомарный дизайн: методология (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/249999/' },
          { id: 'a11y_habr_1', type: 'article', title: 'Доступность: основы WCAG (Habr)', xp: 25, duration: '20 минут', articleUrl: 'https://habr.com/ru/articles/310418/' },
          { id: 'ds_quiz_5', type: 'quiz', title: 'Квиз по дизайн-системам', xp: 35 }
        ]
      }
    ]
  },

  {
    id: 'video_photo',
    name: 'Видео и Фото',
    icon: '🎬',
    description: 'Освой видеомонтаж, цветокоррекцию и создание контента',
    career: {
      title: 'Видеомонтажер / Контент-мейкер',
      description: 'Создаёшь и редактируешь видео для YouTube, соцсетей и бизнеса',
      skills: ['DaVinci Resolve', 'монтаж', 'цветокоррекция', 'звук', 'экспорт']
    },
    steps: [
      {
        id: 1, order: 1,
        title: 'Монтаж с нуля — основы',
        icon: '🎬', duration: '5 часов', difficulty: 'beginner', xp: 90,
        why: 'Монтаж превращает сырые кадры в историю. Это основа — без понимания timeline, клипов и склеек невозможно двигаться дальше.',
        skills: ['timeline и дорожки', 'импорт и организация', 'базовые склейки', 'B-roll', 'экспорт видео'],
        materials: [
          { id: 'mont_1', type: 'video', title: 'Монтаж для начинающих — Андрей Сухой', xp: 30, duration: '2 часа', searchQuery: 'монтаж видео для начинающих Андрей Сухой DaVinci' },
          { id: 'mont_dr_1', type: 'video', title: 'DaVinci Resolve с нуля — урок', xp: 25, duration: '1.5 часа', searchQuery: 'DaVinci Resolve с нуля урок на русском 2024' },
          { id: 'mont_habr_1', type: 'article', title: 'Монтаж: базовые принципы (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/303838/' },
          { id: 'mont_quiz_1', type: 'quiz', title: 'Квиз по основам монтажа', xp: 20 }
        ]
      },
      {
        id: 2, order: 2,
        title: 'Цветокоррекция и color grading',
        icon: '🌈', duration: '5 часов', difficulty: 'intermediate', xp: 120,
        why: 'Цвет — это эмоция. Правильная цветокоррекция делает видео профессиональным, а color grading создаёт уникальный стиль.',
        skills: ['гистограмма', 'баланс белого', 'LUT', 'color grading', 'HDR основы'],
        materials: [
          { id: 'color_1', type: 'video', title: 'Цветокоррекция в DaVinci Resolve — полный урок', xp: 35, duration: '2.5 часа', searchQuery: 'цветокоррекция DaVinci Resolve урок на русском color grading' },
          { id: 'color_lut_1', type: 'video', title: 'LUT в монтаже — что это и как применять', xp: 25, duration: '30 минут', searchQuery: 'LUT применение монтаж видео урок на русском' },
          { id: 'color_habr_1', type: 'article', title: 'Цветокоррекция: основы и инструменты (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/212219/' },
          { id: 'color_quiz_2', type: 'quiz', title: 'Квиз по цветокоррекции', xp: 25 }
        ]
      },
      {
        id: 3, order: 3,
        title: 'Переходы и темп видео',
        icon: '✂️', duration: '4 часа', difficulty: 'intermediate', xp: 110,
        why: 'Переходы задают ритм и настроение. Умелое использование монтажных приёмов отличает профессионала от любителя.',
        skills: ['jump cut', 'match cut', 'J-cut и L-cut', 'темп монтажа', 'синхронизация с музыкой'],
        materials: [
          { id: 'trans_1', type: 'video', title: 'Переходы и приёмы монтажа — урок', xp: 30, duration: '1.5 часа', searchQuery: 'переходы монтаж видео приемы урок на русском 2024' },
          { id: 'trans_beat_1', type: 'video', title: 'Монтаж под музыку — синхронизация', xp: 25, duration: '45 минут', searchQuery: 'монтаж под музыку синхронизация бит урок' },
          { id: 'trans_habr_1', type: 'article', title: 'Правила монтажа: переходы (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/205358/' },
          { id: 'trans_quiz_3', type: 'quiz', title: 'Квиз по переходам', xp: 25 }
        ]
      },
      {
        id: 4, order: 4,
        title: 'Звук и аудиопостпродакшн',
        icon: '🔊', duration: '4 часа', difficulty: 'intermediate', xp: 120,
        why: 'Зрители простят плохую картинку, но не простят плохой звук. Качественный аудио — половина успеха видео.',
        skills: ['шумоподавление', 'нормализация', 'синхронизация звука', 'SFX', 'voiceover'],
        materials: [
          { id: 'audio_1', type: 'video', title: 'Работа со звуком в DaVinci Resolve', xp: 30, duration: '1.5 часа', searchQuery: 'звук аудио DaVinci Resolve Fairlight урок на русском' },
          { id: 'audio_noise_1', type: 'video', title: 'Шумоподавление: убираем фоновый шум', xp: 25, duration: '30 минут', searchQuery: 'шумоподавление видео урок убрать фоновый шум' },
          { id: 'audio_habr_1', type: 'article', title: 'LUFS: нормализация звука для YouTube (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/428529/' },
          { id: 'audio_quiz_4', type: 'quiz', title: 'Квиз по звуку', xp: 25 }
        ]
      },
      {
        id: 5, order: 5,
        title: 'Финальный экспорт и публикация',
        icon: '📤', duration: '3 часа', difficulty: 'beginner', xp: 100,
        why: 'Неправильный экспорт убивает качество видео. Этот шаг научит экспортировать идеально под каждую платформу.',
        skills: ['кодеки H.264/H.265', 'битрейт и качество', 'экспорт для YouTube', 'proxy файлы', 'workflow'],
        materials: [
          { id: 'export_1', type: 'video', title: 'Экспорт видео: настройки для YouTube', xp: 25, duration: '45 минут', searchQuery: 'экспорт видео YouTube настройки DaVinci Resolve урок' },
          { id: 'export_workflow_1', type: 'video', title: 'Workflow монтажера: от съёмки до публикации', xp: 30, duration: '1 час', searchQuery: 'workflow видеомонтаж от съемки до публикации урок' },
          { id: 'export_habr_1', type: 'article', title: 'Кодеки и контейнеры: разбираем (Habr)', xp: 20, duration: '15 минут', articleUrl: 'https://habr.com/ru/articles/145389/' },
          { id: 'export_quiz_5', type: 'quiz', title: 'Квиз по экспорту', xp: 25 }
        ]
      }
    ]
  }
]

export function getSphere(id: string): Sphere | undefined {
  return SPHERES.find(s => s.id === id)
}

export function getStep(sphereId: string, stepNum: number): Step | undefined {
  return getSphere(sphereId)?.steps.find(s => s.order === stepNum || s.id === stepNum)
}
