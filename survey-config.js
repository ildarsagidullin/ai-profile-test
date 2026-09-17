export const submissionEndpoint = "https://script.google.com/macros/s/AKfycbwmAZ8N9ZwLNmoBCF-lns-j7a5MLbcWK8gQQdKjwmW3cunNpPBEzI0jSZzBd5ihcht4/exec";

export const funnelId = "reels-cold-ai-profile-v1";

export const dimensionDefinitions = {
  understanding: {
    name: "Понимание ИИ",
    shortName: "Понимание",
    high: "Ты понимаешь, как ставить задачу нейросети и оценивать качество ответа.",
    low: "Тебе не хватает понятной схемы: как ставить задачу ИИ и проверять результат.",
    next: "Усложни проверку: добавь собственные критерии качества и тестируй ответы на пограничных случаях."
  },
  practice: {
    name: "Практическое применение",
    shortName: "Практика",
    high: "Ты уже умеешь превращать возможности ИИ в полезный результат.",
    low: "Знания пока редко превращаются в законченные задачи и реальные результаты.",
    next: "Бери более сложные задачи и фиксируй измеримый эффект: время, качество или деньги."
  },
  systems: {
    name: "Системность и автоматизация",
    shortName: "Системность",
    high: "Ты выстраиваешь повторяемые процессы, а не начинаешь каждый раз с нуля.",
    low: "ИИ пока используется отдельными запросами, без шаблонов и повторяемого процесса.",
    next: "Повышай надёжность автоматизаций: добавь проверки, резервные сценарии и контроль ошибок."
  },
  readiness: {
    name: "Готовность к росту",
    shortName: "Рост",
    high: "У тебя есть ресурс и готовность превратить навык в заметный результат.",
    low: "Цель есть, но ей пока не хватает времени, конкретного действия или проверки рынком.",
    next: "Следующий рост даст масштаб: упакуй лучший результат и проверь его на реальных пользователях или клиентах."
  }
};

export const profileDefinitions = [
  {
    min: 0,
    max: 20,
    name: "Наблюдатель",
    summary: "Ты видишь потенциал ИИ, но пока не превратил интерес в устойчивую практику. Твоя точка роста — не изучить всё, а получить первый полезный результат на реальной задаче."
  },
  {
    min: 21,
    max: 40,
    name: "Исследователь",
    summary: "Ты уже пробуешь инструменты и начинаешь понимать их возможности. Следующий скачок даст регулярный сценарий, который экономит время или улучшает конкретный результат."
  },
  {
    min: 41,
    max: 60,
    name: "Уверенный пользователь",
    summary: "У тебя есть крепкая база и полезные сценарии работы с ИИ. Чтобы расти быстрее, пора собирать разрозненные приёмы в повторяемую систему."
  },
  {
    min: 61,
    max: 80,
    name: "Практик",
    summary: "Ты применяешь ИИ в реальных задачах и способен создавать законченные решения. Следующий уровень — измерять эффект, автоматизировать и упаковывать лучшие кейсы."
  },
  {
    min: 81,
    max: 100,
    name: "AI-архитектор",
    summary: "Ты умеешь строить вокруг ИИ рабочие системы, а не просто пользоваться отдельными сервисами. Главный резерв — надёжность, масштабирование и превращение решений в продукт."
  }
];

export const surveyQuestions = [
  {
    id: "role",
    title: "Чем ты сейчас занимаешься?",
    type: "single",
    hint: "Выбери вариант, который ближе всего к твоей ситуации.",
    options: [
      { value: "student", label: "Учусь или пока не работаю" },
      { value: "routine", label: "Работаю в найме: операционные или рутинные задачи" },
      { value: "creative", label: "Работаю в найме: маркетинг, дизайн, контент, IT" },
      { value: "manager", label: "Руковожу командой или направлением" },
      { value: "freelance", label: "Работаю на фрилансе" },
      { value: "services", label: "Продаю свои услуги или экспертность" },
      { value: "business", label: "Развиваю свой бизнес / ИП" }
    ]
  },
  {
    id: "frequency",
    title: "Как часто ты используешь ИИ?",
    type: "single",
    options: [
      { value: "none", label: "Пока не использую", score: 0 },
      { value: "rare", label: "Несколько раз в месяц", score: 1 },
      { value: "weekly", label: "Несколько раз в неделю", score: 2 },
      { value: "daily", label: "Каждый день", score: 3 },
      { value: "constant", label: "Несколько раз в день — это часть моей работы", score: 4 }
    ]
  },
  {
    id: "tools",
    title: "Какими ИИ-инструментами ты уже пользуешься?",
    type: "multiple",
    hint: "Можно выбрать несколько вариантов.",
    exclusive: "none",
    options: [
      { value: "chatgpt", label: "ChatGPT" },
      { value: "claude", label: "Claude" },
      { value: "gemini", label: "Gemini" },
      { value: "perplexity", label: "Perplexity" },
      { value: "images", label: "Midjourney / генераторы изображений" },
      { value: "video", label: "Sora / Runway / генераторы видео" },
      { value: "code", label: "Claude Code / Cursor / другие ИИ-инструменты для кода" },
      { value: "automation", label: "n8n / Make / Zapier" },
      { value: "other", label: "Другие ИИ-сервисы" },
      { value: "none", label: "Ничем не пользуюсь" }
    ]
  },
  {
    id: "tasks",
    title: "Какие задачи ты уже решаешь с помощью ИИ?",
    type: "multiple",
    hint: "Отметь всё, что делаешь хотя бы иногда.",
    exclusive: "unused",
    options: [
      { value: "questions", label: "Ищу информацию и задаю повседневные вопросы", depth: 1, systemDepth: 0 },
      { value: "learning", label: "Учусь и разбираюсь в новых темах", depth: 1, systemDepth: 0 },
      { value: "texts", label: "Пишу и редактирую тексты", depth: 1, systemDepth: 0 },
      { value: "visuals", label: "Создаю изображения или видео", depth: 1, systemDepth: 0 },
      { value: "analysis", label: "Анализирую документы, данные или идеи", depth: 2, systemDepth: 1 },
      { value: "work", label: "Ускоряю рабочие задачи", depth: 2, systemDepth: 2 },
      { value: "sites", label: "Создаю сайты, приложения или прототипы", depth: 3, systemDepth: 2 },
      { value: "automation", label: "Автоматизирую повторяющиеся процессы", depth: 4, systemDepth: 4 },
      { value: "unused", label: "Пока не использую ИИ для задач", depth: 0, systemDepth: 0 }
    ]
  },
  {
    id: "prompting",
    title: "Как ты обычно ставишь задачу нейросети?",
    type: "single",
    options: [
      { value: "simple", label: "Пишу короткий вопрос как получится", score: 0 },
      { value: "details", label: "Добавляю детали, если первый ответ не подошёл", score: 1 },
      { value: "context", label: "Сразу даю контекст, цель и формат ответа", score: 2 },
      { value: "examples", label: "Использую роль, ограничения, примеры и критерии", score: 3 },
      { value: "systems", label: "Создаю и тестирую собственные шаблоны промптов", score: 4 }
    ]
  },
  {
    id: "verification",
    title: "Как ты проверяешь ответы ИИ?",
    type: "single",
    options: [
      { value: "trust", label: "Обычно доверяю первому ответу", score: 0 },
      { value: "obvious", label: "Проверяю только если вижу явную ошибку", score: 1 },
      { value: "sources", label: "Сверяю важные факты и прошу источники", score: 2 },
      { value: "criteria", label: "Заранее задаю критерии и сравниваю варианты", score: 3 },
      { value: "tests", label: "Использую чек-листы, тесты или проверку человеком", score: 4 }
    ]
  },
  {
    id: "experience",
    title: "Что ты уже создавал или настраивал сам?",
    type: "multiple",
    hint: "Даже один небольшой эксперимент считается.",
    exclusive: "nothing",
    options: [
      { value: "prompts", label: "Сохранял рабочие промпты или инструкции", depth: 1, systemDepth: 1 },
      { value: "content", label: "Собирал контент или исследование из нескольких шагов", depth: 2, systemDepth: 1 },
      { value: "site", label: "Делал сайт, приложение или прототип с ИИ", depth: 3, systemDepth: 2 },
      { value: "bot", label: "Создавал чат-бота", depth: 3, systemDepth: 3 },
      { value: "workflow", label: "Собирал автоматизацию в n8n, Make или Zapier", depth: 4, systemDepth: 4 },
      { value: "agent", label: "Создавал ИИ-агента или подключал API", depth: 4, systemDepth: 4 },
      { value: "nothing", label: "Пока ничего из этого", depth: 0, systemDepth: 0 }
    ]
  },
  {
    id: "systemness",
    title: "Насколько системно ИИ встроен в твою работу?",
    type: "single",
    options: [
      { value: "random", label: "Использую разово, когда вспоминаю", score: 0 },
      { value: "regular", label: "Есть несколько частых задач, но каждый раз начинаю заново", score: 1 },
      { value: "templates", label: "Храню удачные промпты и шаблоны", score: 2 },
      { value: "processes", label: "Есть повторяемые процессы из нескольких шагов", score: 3 },
      { value: "automated", label: "Часть процессов автоматизирована или работает через агентов", score: 4 }
    ]
  },
  {
    id: "goal",
    title: "Какой результат от ИИ для тебя главный на ближайшие 90 дней?",
    type: "single",
    options: [
      { value: "start", label: "Разобраться с нуля и начать уверенно пользоваться", actionQuestion: "Что ты уже сделал, чтобы начать разбираться в ИИ?" },
      { value: "productivity", label: "Экономить время и лучше справляться с текущей работой", actionQuestion: "Что ты уже пробовал, чтобы ускорить работу с помощью ИИ?" },
      { value: "career", label: "Получить новую профессию или усилить карьеру", actionQuestion: "Что ты уже сделал для перехода в профессию, связанную с ИИ?" },
      { value: "income", label: "Начать зарабатывать с помощью ИИ", actionQuestion: "Что ты уже пробовал, чтобы получить доход с помощью ИИ?" },
      { value: "clients", label: "Усилить свои услуги и привлекать больше клиентов", actionQuestion: "Что ты уже пробовал менять в своих услугах с помощью ИИ?" },
      { value: "business", label: "Автоматизировать процессы в бизнесе", actionQuestion: "Какие бизнес-процессы ты уже пробовал автоматизировать?" },
      { value: "freedom", label: "Перейти к удалённой работе и стать свободнее", actionQuestion: "Что ты уже сделал для перехода к удалённому заработку?" }
    ]
  },
  {
    id: "goalProgress",
    title: "Что ты уже сделал ради этой цели?",
    dynamicFrom: "goal",
    type: "single",
    options: [
      { value: "nothing", label: "Пока только думаю об этом", score: 0 },
      { value: "content", label: "Смотрю материалы и сохраняю идеи", score: 1 },
      { value: "practice", label: "Регулярно пробую на своих задачах", score: 2 },
      { value: "project", label: "Делаю конкретный проект или кейс", score: 3 },
      { value: "result", label: "Уже получил измеримый результат", score: 4 }
    ]
  },
  {
    id: "earnings",
    title: "Получалось ли тебе зарабатывать благодаря ИИ?",
    type: "single",
    options: [
      { value: "none", label: "Нет, пока не пробовал", score: 0 },
      { value: "trying", label: "Пробовал предложить услугу, но без оплаты", score: 1 },
      { value: "indirect", label: "ИИ помогает делать текущую работу быстрее или лучше", score: 2 },
      { value: "first", label: "Получил первые деньги за работу с использованием ИИ", score: 3 },
      { value: "regular", label: "Регулярно зарабатываю на ИИ-услугах или решениях", score: 4 }
    ]
  },
  {
    id: "weeklyTime",
    title: "Сколько времени в неделю ты реально готов уделять этой цели?",
    type: "single",
    options: [
      { value: "under2", label: "Меньше 2 часов", score: 0 },
      { value: "2to5", label: "2–5 часов", score: 1 },
      { value: "5to10", label: "5–10 часов", score: 2 },
      { value: "10to20", label: "10–20 часов", score: 3 },
      { value: "over20", label: "Более 20 часов", score: 4 }
    ]
  },
  {
    id: "barriers",
    title: "Что сейчас сильнее всего тормозит твой рост?",
    type: "multiple",
    hint: "Можно выбрать несколько вариантов.",
    exclusive: "none",
    options: [
      { value: "start", label: "Не понимаю, с чего начать и что изучать" },
      { value: "overload", label: "Слишком много инструментов и информации" },
      { value: "time", label: "Не хватает времени и регулярности" },
      { value: "quality", label: "Не получается стабильно получать качественный результат" },
      { value: "practice", label: "Не хватает реальных задач и практики" },
      { value: "clients", label: "Не понимаю, что продавать и где искать клиентов" },
      { value: "technical", label: "Останавливает техническая часть" },
      { value: "confidence", label: "Сомневаюсь, что у меня получится" },
      { value: "none", label: "Серьёзных препятствий нет" }
    ]
  },
  {
    id: "outcome90",
    title: "Что должно измениться через 90 дней, чтобы ты сказал: «Это был успех»?",
    type: "textarea",
    hint: "Конкретный ответ сделает твой маршрут точнее.",
    placeholder: "Например: автоматизировать отчёты, собрать портфолио и найти первого клиента…",
    minLength: 5
  }
];
