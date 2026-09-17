import { dimensionDefinitions, funnelId, submissionEndpoint, surveyQuestions } from "./survey-config.js?v=1";
import {
  createSubmissionPayload,
  getDynamicQuestion,
  isAnswered,
  normalizeContact,
  optionLabel,
  optionValue,
  toggleMultiple
} from "./survey-engine.js?v=1";

const DRAFT_KEY = "ai-profile-reels-draft-v1";
const COMPLETE_KEY = "ai-profile-reels-complete-v1";
const JUST_SUBMITTED_KEY = "ai-profile-reels-just-submitted-v1";
const app = document.querySelector("#app");

function captureSource() {
  const params = new URLSearchParams(location.search);
  return {
    funnelId,
    utmSource: params.get("utm_source") ?? "",
    utmCampaign: params.get("utm_campaign") ?? "",
    utmContent: params.get("utm_content") ?? "",
    referrer: document.referrer ?? ""
  };
}

const initialState = {
  screen: "intro",
  index: 0,
  answers: {},
  contact: { name: "", channel: "telegram", username: "", consent: false },
  source: captureSource(),
  error: "",
  submitting: false
};

let state = loadDraft();

function cloneInitialState() {
  return JSON.parse(JSON.stringify(initialState));
}

function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (!saved) return cloneInitialState();
    return {
      ...cloneInitialState(),
      ...saved,
      contact: { ...initialState.contact, ...(saved.contact ?? {}) },
      source: { ...initialState.source, ...(saved.source ?? {}) },
      error: "",
      submitting: false
    };
  } catch {
    return cloneInitialState();
  }
}

function saveDraft() {
  const { error: _error, submitting: _submitting, ...persisted } = state;
  localStorage.setItem(DRAFT_KEY, JSON.stringify(persisted));
}

function completedResult() {
  try { return JSON.parse(localStorage.getItem(COMPLETE_KEY)); } catch { return null; }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function button(label, className, onClick, disabled = false) {
  const node = el("button", `btn ${className}`, label);
  node.type = "button";
  node.disabled = disabled;
  node.addEventListener("click", onClick);
  return node;
}

function progress(current, total) {
  const wrap = el("div", "progress-wrap");
  const meta = el("div", "progress-meta");
  meta.append(el("span", "", `Вопрос ${current} из ${total}`), el("span", "", `${Math.round((current / total) * 100)}%`));
  const track = el("div", "progress-track");
  const bar = el("div", "progress-bar");
  bar.style.width = `${(current / total) * 100}%`;
  track.append(bar);
  wrap.append(meta, track);
  return wrap;
}

function render() {
  app.replaceChildren();
  const completed = completedResult();
  if (completed) {
    const justSubmitted = sessionStorage.getItem(JUST_SUBMITTED_KEY) === "1";
    sessionStorage.removeItem(JUST_SUBMITTED_KEY);
    renderResult(completed, !justSubmitted);
    return;
  }
  if (state.screen === "intro") renderIntro();
  else if (state.screen === "contact") renderContact();
  else renderQuestion();
}

function renderIntro() {
  app.classList.add("intro-card");
  const eyebrow = el("div", "eyebrow", "Персональная диагностика");
  const title = el("h1", "", "Узнай свой реальный ИИ-профиль");
  const lead = el("p", "lead", "14 вопросов покажут, насколько ИИ уже встроен в твою работу и где находится самый быстрый рост. В конце — четыре оценки, сильная сторона и маршрут на 30 дней.");
  const valueList = el("div", "value-list");
  ["Увидишь уровень от Наблюдателя до AI-архитектора", "Найдёшь главное ограничение, которое тормозит рост", "Получишь сценарий применения ИИ под свою цель"].forEach((text) => {
    const item = el("div", "value-item");
    item.append(el("span", "value-check", "✓"), el("span", "", text));
    valueList.append(item);
  });
  const meta = el("div", "start-meta");
  meta.append(el("span", "pill", "≈ 4 минуты"), el("span", "pill", "14 вопросов"), el("span", "pill", "Маршрут на 30 дней"));
  const gift = el("div", "trust-note");
  gift.append(el("span", "trust-icon", "✦"), el("span", "", "Для открытия результата понадобится контакт. Гайд по ИИ-агентам я пришлю лично в Telegram или Instagram."));
  const start = button("Узнать свой ИИ-профиль →", "btn-primary btn-large", () => {
    state.screen = "question";
    state.index = 0;
    saveDraft();
    scrollTop();
    render();
  });
  app.append(eyebrow, title, lead, valueList, meta, gift, start);
}

function renderQuestion() {
  app.classList.remove("intro-card");
  const question = surveyQuestions[state.index];
  const titleText = question.dynamicFrom ? getDynamicQuestion(state.answers) : question.title;
  app.append(progress(state.index + 1, surveyQuestions.length));
  const heading = el("h2", "question-title", titleText);
  heading.tabIndex = -1;
  app.append(heading);
  if (question.hint) app.append(el("p", "hint", question.hint));

  if (question.type === "textarea") {
    const textarea = el("textarea", "textarea-field");
    textarea.placeholder = question.placeholder ?? "";
    textarea.maxLength = 1200;
    textarea.value = state.answers[question.id] ?? "";
    textarea.addEventListener("input", () => {
      state.answers[question.id] = textarea.value;
      state.error = "";
      saveDraft();
    });
    app.append(textarea);
  } else {
    app.append(renderOptions(question));
  }

  const error = el("div", "error-message", state.error);
  error.setAttribute("role", "alert");
  app.append(error, renderQuestionActions(question));
  requestAnimationFrame(() => heading.focus({ preventScroll: true }));
}

function renderOptions(question) {
  const options = el("div", "options");
  options.setAttribute("role", question.type === "single" ? "radiogroup" : "group");
  const current = state.answers[question.id];
  for (const option of question.options) {
    const value = optionValue(option);
    const label = el("label", "option");
    const input = el("input");
    input.type = question.type === "single" ? "radio" : "checkbox";
    input.name = question.id;
    input.value = value;
    input.checked = question.type === "single" ? current === value : (current ?? []).includes(value);
    input.addEventListener("change", () => {
      if (question.type === "single") state.answers[question.id] = value;
      else state.answers[question.id] = toggleMultiple(state.answers[question.id], value, question.exclusive);
      state.error = "";
      saveDraft();
      if (question.type === "multiple") render();
    });
    label.append(input, el("span", "option-text", optionLabel(option)));
    options.append(label);
  }
  return options;
}

function renderQuestionActions(question) {
  const actions = el("div", "actions");
  actions.append(button("← Назад", "btn-secondary", goBack));
  actions.append(button(state.index === surveyQuestions.length - 1 ? "Завершить диагностику →" : "Далее →", "btn-primary", () => {
    if (!isAnswered(question, state.answers[question.id])) {
      state.error = question.type === "textarea" ? "Напиши хотя бы одно конкретное изменение." : "Выбери хотя бы один вариант.";
      render();
      return;
    }
    state.error = "";
    if (state.index < surveyQuestions.length - 1) state.index += 1;
    else state.screen = "contact";
    saveDraft();
    scrollTop();
    render();
  }));
  return actions;
}

function goBack() {
  state.error = "";
  if (state.screen === "contact") {
    state.screen = "question";
    state.index = surveyQuestions.length - 1;
  } else if (state.index === 0) {
    state.screen = "intro";
  } else {
    state.index -= 1;
  }
  saveDraft();
  scrollTop();
  render();
}

function contactField(labelText, name, placeholder, autocomplete) {
  const group = el("div", "field-group");
  const label = el("label", "field-label", labelText);
  label.htmlFor = name;
  const input = el("input", "text-field");
  input.id = name;
  input.name = name;
  input.placeholder = placeholder;
  input.autocomplete = autocomplete;
  input.maxLength = 100;
  input.value = state.contact[name];
  input.addEventListener("input", () => {
    state.contact[name] = input.value;
    state.error = "";
    saveDraft();
  });
  group.append(label, input);
  return group;
}

function renderChannelSelector() {
  const group = el("fieldset", "channel-field");
  group.append(el("legend", "field-label", "Куда тебе написать?"));
  const choices = el("div", "channel-choices");
  [["telegram", "Telegram"], ["instagram", "Instagram"]].forEach(([value, labelText]) => {
    const label = el("label", "channel-choice");
    const input = el("input");
    input.type = "radio";
    input.name = "channel";
    input.value = value;
    input.checked = state.contact.channel === value;
    input.addEventListener("change", () => {
      state.contact.channel = value;
      state.contact.username = "";
      state.error = "";
      saveDraft();
      render();
    });
    label.append(input, el("span", "", labelText));
    choices.append(label);
  });
  group.append(choices);
  return group;
}

function renderContact() {
  app.classList.remove("intro-card");
  const ready = el("div", "ready-mark", "✓");
  const eyebrow = el("div", "eyebrow", "Диагностика завершена");
  const heading = el("h2", "contact-title", "Твой ИИ-профиль готов");
  heading.tabIndex = -1;
  const lead = el("p", "lead", "Оставь имя и удобный контакт — полный результат откроется сразу на этой странице. Гайд по ИИ-агентам я пришлю лично чуть позже.");
  app.append(ready, eyebrow, heading, lead);
  app.append(contactField("Как тебя зовут?", "name", "Например, Ильдар", "name"));
  app.append(renderChannelSelector());
  const channelName = state.contact.channel === "instagram" ? "Instagram" : "Telegram";
  const placeholder = state.contact.channel === "instagram" ? "@username или instagram.com/username" : "@username или t.me/username";
  app.append(contactField(`Твой username в ${channelName}`, "username", placeholder, "username"));

  const consent = el("label", "consent");
  const checkbox = el("input");
  checkbox.type = "checkbox";
  checkbox.checked = state.contact.consent;
  checkbox.addEventListener("change", () => {
    state.contact.consent = checkbox.checked;
    state.error = "";
    saveDraft();
  });
  consent.append(checkbox, el("span", "", `Я согласен на обработку ответов и на связь со мной в ${channelName} по поводу диагностики и гайда.`));
  app.append(consent);

  const error = el("div", "error-message", state.error);
  error.setAttribute("role", "alert");
  const actions = el("div", "actions");
  actions.append(button("← Назад", "btn-secondary", goBack));
  actions.append(button(state.submitting ? "Открываем…" : "Открыть мой результат →", "btn-primary", submitSurvey, state.submitting));
  app.append(error, actions);
  requestAnimationFrame(() => heading.focus({ preventScroll: true }));
}

function validateContact() {
  if (state.contact.name.trim().length < 2) return "Укажи имя — хотя бы два символа.";
  if (!normalizeContact(state.contact.channel, state.contact.username)) {
    return state.contact.channel === "instagram"
      ? "Проверь Instagram username: можно использовать латинские буквы, цифры, точки и подчёркивания."
      : "Проверь Telegram username: нужно 5–32 символа — латинские буквы, цифры или подчёркивания.";
  }
  if (!state.contact.consent) return "Подтверди согласие, чтобы открыть результат и получить гайд.";
  return "";
}

function createSubmissionId() {
  return globalThis.crypto?.randomUUID?.() ?? `profile-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function submitSurvey() {
  const validationError = validateContact();
  if (validationError) {
    state.error = validationError;
    render();
    return;
  }
  const submissionId = createSubmissionId();
  const { payload, result } = createSubmissionPayload(state.answers, state.contact, state.source, submissionId);
  const demoMode = new URLSearchParams(location.search).get("demo") === "1";
  if (!submissionEndpoint && !demoMode) {
    state.error = "Приём ответов ещё настраивается. Всё заполненное сохранено — попробуй снова немного позже.";
    render();
    return;
  }

  state.submitting = true;
  state.error = "";
  render();
  try {
    if (!demoMode) {
      await fetch(submissionEndpoint, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    }
    const stored = { result, contactChannel: payload.contactChannel, submittedAt: payload.submittedAt, submissionId };
    localStorage.setItem(COMPLETE_KEY, JSON.stringify(stored));
    sessionStorage.setItem(JUST_SUBMITTED_KEY, "1");
    localStorage.removeItem(DRAFT_KEY);
    state.submitting = false;
    scrollTop();
    render();
  } catch {
    state.submitting = false;
    state.error = "Не удалось отправить ответы. Проверь интернет: всё заполненное сохранено, можно попробовать ещё раз.";
    saveDraft();
    render();
  }
}

function renderScoreRing(overall) {
  const ring = el("div", "score-ring");
  ring.style.setProperty("--score", `${overall * 3.6}deg`);
  const inner = el("div", "score-ring-inner");
  inner.append(el("strong", "score-value", String(overall)), el("span", "score-total", "из 100"));
  ring.append(inner);
  return ring;
}

function renderDimensions(dimensions) {
  const grid = el("div", "dimension-grid");
  Object.entries(dimensionDefinitions).forEach(([key, definition]) => {
    const item = el("div", "dimension-item");
    const top = el("div", "dimension-top");
    top.append(el("span", "", definition.name), el("strong", "", `${dimensions[key]}/100`));
    const track = el("div", "dimension-track");
    const bar = el("div", "dimension-bar");
    bar.style.width = `${dimensions[key]}%`;
    track.append(bar);
    item.append(top, track);
    grid.append(item);
  });
  return grid;
}

function renderInsight(label, title, text, modifier) {
  const card = el("div", `insight-card ${modifier}`);
  card.append(el("span", "insight-label", label), el("h3", "", title), el("p", "", text));
  return card;
}

function renderResult(stored, alreadyCompleted = false) {
  app.classList.remove("intro-card");
  const result = stored.result;
  app.append(el("div", "eyebrow", alreadyCompleted ? "Твой сохранённый результат" : "Твой ИИ-профиль"));
  const hero = el("div", "result-hero");
  const copy = el("div", "result-hero-copy");
  copy.append(el("div", "profile-kicker", "Уровень"), el("h1", "result-title", result.profile.name), el("p", "result-summary", result.profile.summary));
  hero.append(copy, renderScoreRing(result.overall));
  app.append(hero);

  const scores = el("section", "result-section");
  scores.append(el("h2", "section-title", "Твои четыре оценки"), el("p", "section-lead", "Они показывают не только знания, но и то, насколько ИИ уже приносит практический результат."), renderDimensions(result.dimensions));
  app.append(scores);

  const insights = el("div", "insights-grid");
  const strongestScore = result.dimensions[result.strongestKey];
  const weakestScore = result.dimensions[result.weakestKey];
  const strongestText = strongestScore < 40
    ? "Сейчас это самая развитая из твоих четырёх шкал. Она только формируется, поэтому первый практический результат быстро её усилит."
    : result.strongest.high;
  const weakestText = weakestScore >= 75 ? result.weakest.next : result.weakest.low;
  insights.append(
    renderInsight("Сильная сторона", result.strongest.name, strongestText, "positive"),
    renderInsight(weakestScore >= 75 ? "Следующая зона роста" : "Главная точка роста", result.weakest.name, weakestText, "growth")
  );
  app.append(insights);

  const route = el("section", "result-section route-section");
  route.append(el("div", "eyebrow", "Персональный маршрут"), el("h2", "section-title", "Твои следующие 30 дней"));
  const plan = el("ol", "plan-list");
  result.plan.forEach((step, index) => {
    const item = el("li", "plan-item");
    item.append(el("span", "plan-number", String(index + 1)), el("div", "plan-copy"));
    item.querySelector(".plan-copy").append(el("strong", "", step.period), el("p", "", step.text));
    plan.append(item);
  });
  route.append(plan);
  app.append(route);

  const scenario = el("section", "scenario-card");
  scenario.append(el("span", "scenario-icon", "↗"), el("div", "scenario-copy"));
  scenario.querySelector(".scenario-copy").append(el("h3", "", "Сценарий под твою ситуацию"), el("p", "", result.scenario));
  app.append(scenario);

  const gift = el("section", "gift-card");
  gift.append(el("span", "gift-icon", "✦"), el("div", "gift-copy"));
  const channelText = stored.contactChannel === "Instagram" ? "Instagram" : "Telegram";
  gift.querySelector(".gift-copy").append(el("span", "gift-label", "Подарок"), el("h3", "", "Гайд по ИИ-агентам"), el("p", "", `Я посмотрю твои ответы и пришлю гайд лично в ${channelText}. Это не автоматическая рассылка, поэтому сообщение может прийти чуть позже.`));
  app.append(gift);

  app.append(el("p", "thank-you", "Сохрани эту страницу — твой результат останется на этом устройстве."));
}

function scrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

render();
