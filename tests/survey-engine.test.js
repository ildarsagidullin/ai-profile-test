import test from "node:test";
import assert from "node:assert/strict";
import {
  buildResult,
  calculateDimensions,
  calculateOverall,
  createSubmissionPayload,
  getDynamicQuestion,
  getGrowthPlan,
  getProfile,
  normalizeInstagram,
  normalizeTelegram,
  toggleMultiple
} from "../survey-engine.js";

const minimumAnswers = {
  role: "student", frequency: "none", tools: ["none"], tasks: ["unused"], prompting: "simple",
  verification: "trust", experience: ["nothing"], systemness: "random", goal: "start",
  goalProgress: "nothing", earnings: "none", weeklyTime: "under2", barriers: ["start"], outcome90: "Начать пользоваться ИИ"
};

const maximumAnswers = {
  role: "business", frequency: "constant", tools: ["chatgpt", "claude", "gemini", "code", "automation"],
  tasks: ["automation"], prompting: "systems", verification: "tests", experience: ["agent", "workflow"],
  systemness: "automated", goal: "business", goalProgress: "result", earnings: "regular",
  weeklyTime: "over20", barriers: ["none"], outcome90: "Автоматизировать продажи и поддержку"
};

test("normalizes Telegram formats", () => {
  assert.equal(normalizeTelegram("username"), "@username");
  assert.equal(normalizeTelegram("@user_name"), "@user_name");
  assert.equal(normalizeTelegram("https://t.me/username/"), "@username");
  assert.equal(normalizeTelegram("abc"), null);
  assert.equal(normalizeTelegram("12345"), null);
});

test("normalizes Instagram formats", () => {
  assert.equal(normalizeInstagram("name"), "@name");
  assert.equal(normalizeInstagram("@my.name"), "@my.name");
  assert.equal(normalizeInstagram("https://instagram.com/my_name/"), "@my_name");
  assert.equal(normalizeInstagram("bad..name"), null);
  assert.equal(normalizeInstagram("bad-name"), null);
});

test("exclusive option replaces other multiple choices", () => {
  assert.deepEqual(toggleMultiple(["chatgpt", "claude"], "none", "none"), ["none"]);
  assert.deepEqual(toggleMultiple(["none"], "chatgpt", "none"), ["chatgpt"]);
});

test("calculates all four dimensions at 0 and 100", () => {
  assert.deepEqual(calculateDimensions(minimumAnswers), { understanding: 0, practice: 0, systems: 0, readiness: 0 });
  assert.deepEqual(calculateDimensions(maximumAnswers), { understanding: 100, practice: 100, systems: 100, readiness: 100 });
  assert.equal(calculateOverall(calculateDimensions(minimumAnswers)), 0);
  assert.equal(calculateOverall(calculateDimensions(maximumAnswers)), 100);
});

test("uses the required weighted overall formula", () => {
  assert.equal(calculateOverall({ understanding: 100, practice: 0, systems: 0, readiness: 0 }), 25);
  assert.equal(calculateOverall({ understanding: 0, practice: 100, systems: 0, readiness: 0 }), 30);
  assert.equal(calculateOverall({ understanding: 0, practice: 0, systems: 100, readiness: 0 }), 25);
  assert.equal(calculateOverall({ understanding: 0, practice: 0, systems: 0, readiness: 100 }), 20);
});

test("maps every profile boundary", () => {
  assert.equal(getProfile(0).name, "Наблюдатель");
  assert.equal(getProfile(20).name, "Наблюдатель");
  assert.equal(getProfile(21).name, "Исследователь");
  assert.equal(getProfile(40).name, "Исследователь");
  assert.equal(getProfile(41).name, "Уверенный пользователь");
  assert.equal(getProfile(60).name, "Уверенный пользователь");
  assert.equal(getProfile(61).name, "Практик");
  assert.equal(getProfile(80).name, "Практик");
  assert.equal(getProfile(81).name, "AI-архитектор");
  assert.equal(getProfile(100).name, "AI-архитектор");
});

test("personalizes dynamic question and 30-day route", () => {
  const expectedQuestions = {
    start: /начать разбираться/,
    productivity: /ускорить работу/,
    career: /перехода в профессию/,
    income: /получить доход/,
    clients: /услугах/,
    business: /бизнес-процессы/,
    freedom: /удалённому заработку/
  };
  for (const [goal, expected] of Object.entries(expectedQuestions)) assert.match(getDynamicQuestion({ goal }), expected);
  const plan = getGrowthPlan({ goal: "business", outcome90: "Сэкономить 10 часов" }, "systems");
  assert.equal(plan.length, 3);
  assert.match(plan[0].text, /шаблон/);
  assert.match(plan[1].text, /процесс/);
  assert.match(plan[2].text, /Сэкономить 10 часов/);
});

test("builds a complete 100/100 AI-architect result", () => {
  const result = buildResult(maximumAnswers);
  assert.equal(result.overall, 100);
  assert.equal(result.profile.name, "AI-архитектор");
  assert.equal(result.plan.length, 3);
  assert.match(result.scenario, /операционный помощник/);
  assert.notEqual(result.strongestKey, result.weakestKey);
});

test("puts UTM data and normalized contact into submission", () => {
  const source = { funnelId: "reels", utmSource: "instagram", utmCampaign: "launch", utmContent: "hook-1", referrer: "https://instagram.com/" };
  const { payload } = createSubmissionPayload(maximumAnswers, { name: "Ильдар", channel: "instagram", username: "instagram.com/ildar.ai", consent: true }, source, "submission-1");
  assert.equal(payload.contactHandle, "@ildar.ai");
  assert.equal(payload.utmSource, "instagram");
  assert.equal(payload.utmCampaign, "launch");
  assert.equal(payload.utmContent, "hook-1");
  assert.equal(payload.submissionId, "submission-1");
});
