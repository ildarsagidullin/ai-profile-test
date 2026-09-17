import { dimensionDefinitions, profileDefinitions, surveyQuestions } from "./survey-config.js?v=2";

export function optionValue(option) {
  return typeof option === "string" ? option : option.value ?? option.label;
}

export function optionLabel(option) {
  return typeof option === "string" ? option : option.label;
}

export function getQuestion(id) {
  return surveyQuestions.find((question) => question.id === id);
}

export function getOption(questionOrId, value) {
  const question = typeof questionOrId === "string" ? getQuestion(questionOrId) : questionOrId;
  return question?.options?.find((option) => optionValue(option) === value);
}

export function getAnswerLabels(question, answer) {
  if (answer == null || answer === "") return [];
  if (question.type === "textarea") return [String(answer).trim()];
  const values = Array.isArray(answer) ? answer : [answer];
  return values.map((value) => optionLabel(getOption(question, value) ?? value));
}

export function isAnswered(question, answer) {
  if (question.type === "multiple") return Array.isArray(answer) && answer.length > 0;
  if (question.type === "textarea") return typeof answer === "string" && answer.trim().length >= (question.minLength ?? 1);
  return typeof answer === "string" && answer.trim().length > 0;
}

export function toggleMultiple(current, value, exclusiveValue) {
  const selected = new Set(Array.isArray(current) ? current : []);
  if (value === exclusiveValue) return selected.has(value) ? [] : [value];
  selected.delete(exclusiveValue);
  selected.has(value) ? selected.delete(value) : selected.add(value);
  return [...selected];
}

function cleanHandleUrl(raw, domains) {
  let value = String(raw ?? "").trim();
  value = value.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  for (const domain of domains) {
    value = value.replace(new RegExp(`^${domain.replace(".", "\\.")}\\/`, "i"), "");
  }
  return value.replace(/^@/, "").split(/[/?#]/)[0];
}

export function normalizeTelegram(raw) {
  const value = cleanHandleUrl(raw, ["t.me", "telegram.me"]);
  return /^[A-Za-z][A-Za-z0-9_]{4,31}$/.test(value) ? `@${value}` : null;
}

export function normalizeInstagram(raw) {
  const value = cleanHandleUrl(raw, ["instagram.com"]);
  const valid = /^(?!.*\.\.)(?!.*\.$)[A-Za-z0-9_][A-Za-z0-9._]{0,29}$/.test(value);
  return valid ? `@${value}` : null;
}

export function normalizeContact(channel, raw) {
  return channel === "instagram" ? normalizeInstagram(raw) : normalizeTelegram(raw);
}

function singleScore(answers, id, field = "score") {
  return Number(getOption(id, answers[id])?.[field] ?? 0);
}

function maxSelectedScore(answers, id, field) {
  const selected = Array.isArray(answers[id]) ? answers[id] : [];
  return Math.max(0, ...selected.map((value) => Number(getOption(id, value)?.[field] ?? 0)));
}

function toolScore(values) {
  if (!Array.isArray(values) || values.includes("none")) return 0;
  const count = values.length;
  if (count >= 5) return 4;
  if (count >= 3) return 3;
  return count;
}

function percent(values) {
  const maximum = values.length * 4;
  return maximum ? Math.round((values.reduce((sum, value) => sum + value, 0) / maximum) * 100) : 0;
}

export function calculateDimensions(answers) {
  const understanding = percent([
    singleScore(answers, "frequency"),
    singleScore(answers, "prompting"),
    singleScore(answers, "verification")
  ]);
  const practice = percent([
    toolScore(answers.tools),
    maxSelectedScore(answers, "tasks", "depth"),
    maxSelectedScore(answers, "experience", "depth")
  ]);
  const systems = percent([
    singleScore(answers, "systemness"),
    maxSelectedScore(answers, "tasks", "systemDepth"),
    maxSelectedScore(answers, "experience", "systemDepth")
  ]);
  const readiness = percent([
    singleScore(answers, "goalProgress"),
    singleScore(answers, "earnings"),
    singleScore(answers, "weeklyTime")
  ]);
  return { understanding, practice, systems, readiness };
}

export function calculateOverall(dimensions) {
  return Math.round(
    dimensions.understanding * 0.25 +
    dimensions.practice * 0.3 +
    dimensions.systems * 0.25 +
    dimensions.readiness * 0.2
  );
}

export function getProfile(score) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));
  return profileDefinitions.find((profile) => safeScore >= profile.min && safeScore <= profile.max) ?? profileDefinitions[0];
}

export function getDimensionExtremes(dimensions) {
  const ordered = Object.keys(dimensionDefinitions);
  const strongestKey = ordered.reduce((best, key) => dimensions[key] > dimensions[best] ? key : best, ordered[0]);
  const weakestKey = ordered.reduce((worst, key) => dimensions[key] <= dimensions[worst] ? key : worst, ordered[0]);
  return {
    strongestKey,
    weakestKey,
    strongest: dimensionDefinitions[strongestKey],
    weakest: dimensionDefinitions[weakestKey]
  };
}

export function getDynamicQuestion(answers) {
  return getOption("goal", answers.goal)?.actionQuestion ?? "Что ты уже сделал ради этой цели?";
}

const weakStepByDimension = {
  understanding: "Выбери одну повторяющуюся задачу и составь для неё промпт из четырёх частей: контекст, цель, ограничения и формат результата.",
  practice: "Выбери одну реальную задачу и доведи её с ИИ до законченного результата, который можно показать другому человеку.",
  systems: "Сохрани лучший сценарий работы с ИИ как пошаговый шаблон и повтори его минимум три раза.",
  readiness: "Забронируй в календаре два коротких занятия в неделю и зафиксируй один измеримый результат на ближайшие 30 дней."
};

const goalStep = {
  start: "Освой один основной инструмент и реши с ним три разные задачи: поиск, создание и анализ.",
  productivity: "Замерь время на одной рабочей задаче до и после ИИ, затем улучши инструкцию по результату.",
  career: "Собери один кейс для портфолио, который показывает задачу, твой процесс и измеримый итог.",
  income: "Упакуй один понятный результат как услугу и покажи предложение пяти потенциальным клиентам.",
  clients: "Добавь ИИ в один этап своей услуги и оформи сравнение результата до и после.",
  business: "Выбери один частый процесс, опиши его шаги и автоматизируй самое простое узкое место.",
  freedom: "Выбери одну удалённую услугу с ИИ, собери демонстрационный пример и начни точечный поиск заказов."
};

const roleScenario = {
  student: "личный помощник для обучения: разбирает сложные темы, создаёт план практики и проверяет понимание",
  routine: "рабочий помощник для писем, документов, сверки данных и типовых отчётов",
  creative: "контент- и исследовательский конвейер: от идеи и анализа до черновика и контроля качества",
  manager: "помощник руководителя: готовит резюме встреч, варианты решений, планы и контрольные списки",
  freelance: "система быстрого производства клиентского результата — от брифа до первой версии и проверки",
  services: "помощник эксперта, который исследует аудиторию, готовит материалы и усиливает продукт",
  business: "операционный помощник, который обрабатывает обращения, документы и повторяющиеся внутренние задачи"
};

const goalFinish = {
  start: "сделать ИИ понятным ежедневным инструментом",
  productivity: "освободить время и повысить качество работы",
  career: "создать доказательство нового навыка для работодателя",
  income: "превратить навык в первый оплачиваемый результат",
  clients: "повысить ценность услуги и заметность для клиентов",
  business: "сократить ручную работу в одном процессе",
  freedom: "собрать основу удалённого источника дохода"
};

export function getScenario(answers) {
  const role = roleScenario[answers.role] ?? "личный ИИ-помощник для повторяющихся задач";
  const finish = goalFinish[answers.goal] ?? "получить измеримый результат";
  return `Тебе подойдёт ${role}. Начни с одного узкого сценария — так за 30 дней ты сможешь ${finish}.`;
}

export function getGrowthPlan(answers, weakestKey) {
  const outcome = String(answers.outcome90 ?? "").trim();
  const outcomeStep = outcome
    ? `Собери мини-кейс и сравни его с твоим критерием успеха: «${outcome.slice(0, 180)}${outcome.length > 180 ? "…" : ""}».`
    : "Собери мини-кейс: задача, действия, результат и цифра, которая покажет прогресс.";
  return [
    { period: "Дни 1–7", text: weakStepByDimension[weakestKey] },
    { period: "Дни 8–21", text: goalStep[answers.goal] ?? goalStep.start },
    { period: "Дни 22–30", text: outcomeStep }
  ];
}

export function buildResult(answers) {
  const dimensions = calculateDimensions(answers);
  const overall = calculateOverall(dimensions);
  const profile = getProfile(overall);
  const extremes = getDimensionExtremes(dimensions);
  const plan = getGrowthPlan(answers, extremes.weakestKey);
  const scenario = getScenario(answers);
  return { dimensions, overall, profile, ...extremes, plan, scenario };
}

export function createSubmissionPayload(answers, contact, source, submissionId) {
  const result = buildResult(answers);
  const normalizedContact = normalizeContact(contact.channel, contact.username);
  const payload = {
    submittedAt: new Date().toISOString(),
    submissionId,
    funnelId: source.funnelId,
    utmSource: source.utmSource,
    utmCampaign: source.utmCampaign,
    utmContent: source.utmContent,
    referrer: source.referrer,
    name: contact.name.trim(),
    contactChannel: contact.channel === "instagram" ? "Instagram" : "Telegram",
    contactHandle: normalizedContact,
    consent: contact.consent ? "Да" : "Нет",
    scoreUnderstanding: String(result.dimensions.understanding),
    scorePractice: String(result.dimensions.practice),
    scoreSystems: String(result.dimensions.systems),
    scoreReadiness: String(result.dimensions.readiness),
    overallScore: String(result.overall),
    profile: result.profile.name,
    strongestDimension: result.strongest.name,
    weakestDimension: result.weakest.name,
    plan30: result.plan.map((step) => `${step.period}: ${step.text}`).join(" | "),
    scenario: result.scenario
  };

  for (const question of surveyQuestions) {
    payload[question.id] = getAnswerLabels(question, answers[question.id]).join(" | ");
  }

  return { payload, result };
}
