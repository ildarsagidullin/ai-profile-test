/**
 * Отдельный бэкенд для холодного теста из Reels.
 * Старый тест этот скрипт не меняет.
 *
 * 1. Создайте НОВЫЙ проект на script.google.com.
 * 2. Вставьте этот файл вместо стандартного кода.
 * 3. Запустите setupColdSurveyBackend один раз и разрешите доступ.
 * 4. Разверните как веб-приложение: выполнять от вашего имени,
 *    доступ — всем пользователям.
 */

const COLD_SURVEY_FIELDS = [
  ["submittedAt", "Дата и время"],
  ["submissionId", "ID отправки"],
  ["funnelId", "Воронка"],
  ["utmSource", "UTM source"],
  ["utmCampaign", "UTM campaign"],
  ["utmContent", "UTM content"],
  ["referrer", "Страница-источник"],
  ["role", "Работа / ситуация"],
  ["frequency", "Частота использования"],
  ["tools", "Инструменты"],
  ["tasks", "Задачи"],
  ["prompting", "Работа с промптами"],
  ["verification", "Проверка ответов"],
  ["experience", "Практический опыт"],
  ["systemness", "Системность"],
  ["goal", "Цель на 90 дней"],
  ["goalProgress", "Что уже сделал"],
  ["earnings", "Опыт заработка"],
  ["weeklyTime", "Время в неделю"],
  ["barriers", "Препятствия"],
  ["outcome90", "Критерий успеха через 90 дней"],
  ["name", "Имя"],
  ["contactChannel", "Канал связи"],
  ["contactHandle", "Username"],
  ["consent", "Согласие"],
  ["scoreUnderstanding", "Оценка: понимание ИИ"],
  ["scorePractice", "Оценка: практика"],
  ["scoreSystems", "Оценка: системность"],
  ["scoreReadiness", "Оценка: готовность к росту"],
  ["overallScore", "Общий балл"],
  ["profile", "ИИ-профиль"],
  ["strongestDimension", "Сильная сторона"],
  ["weakestDimension", "Точка роста"],
  ["plan30", "План на 30 дней"],
  ["scenario", "Персональный сценарий"]
];

function setupColdSurveyBackend() {
  const properties = PropertiesService.getScriptProperties();
  const existingFormId = properties.getProperty("COLD_SURVEY_FORM_ID");
  if (existingFormId) {
    const existingForm = FormApp.openById(existingFormId);
    const existingSheetId = properties.getProperty("COLD_SURVEY_SHEET_ID");
    console.log("Форма уже создана: " + existingForm.getEditUrl());
    console.log("Таблица: https://docs.google.com/spreadsheets/d/" + existingSheetId + "/edit");
    return;
  }

  const spreadsheet = SpreadsheetApp.create("Лиды из Reels — ИИ-профиль");
  const form = FormApp.create("Лиды из Reels — ИИ-профиль");
  form.setDescription("Служебная форма для приёма ответов с отдельного сайта. Не удаляйте и не переименовывайте поля.");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, spreadsheet.getId());
  COLD_SURVEY_FIELDS.forEach(function(field) {
    form.addParagraphTextItem().setTitle(field[0] + " — " + field[1]).setRequired(false);
  });

  properties.setProperty("COLD_SURVEY_FORM_ID", form.getId());
  properties.setProperty("COLD_SURVEY_SHEET_ID", spreadsheet.getId());
  console.log("Форма: " + form.getEditUrl());
  console.log("Таблица: " + spreadsheet.getUrl());
}

function doPost(event) {
  try {
    const data = JSON.parse(event.postData.contents || "{}");
    validateColdSubmission_(data);
    const formId = PropertiesService.getScriptProperties().getProperty("COLD_SURVEY_FORM_ID");
    if (!formId) throw new Error("Сначала запустите setupColdSurveyBackend");

    const form = FormApp.openById(formId);
    const itemByKey = {};
    form.getItems(FormApp.ItemType.PARAGRAPH_TEXT).forEach(function(item) {
      const key = item.getTitle().split(" — ")[0];
      itemByKey[key] = item.asParagraphTextItem();
    });

    let response = form.createResponse();
    COLD_SURVEY_FIELDS.forEach(function(field) {
      const key = field[0];
      if (itemByKey[key]) response = response.withItemResponse(itemByKey[key].createResponse(String(data[key] || "")));
    });
    response.submit();
    return jsonResponse_({ ok: true, submissionId: data.submissionId });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: String(error.message || error) });
  }
}

function validateColdSubmission_(data) {
  ["submissionId", "name", "contactChannel", "contactHandle", "consent", "profile", "overallScore"].forEach(function(key) {
    if (!String(data[key] || "").trim()) throw new Error("Пропущено поле: " + key);
  });
  if (["Telegram", "Instagram"].indexOf(data.contactChannel) === -1) throw new Error("Некорректный канал связи");
  if (data.contactChannel === "Telegram" && !/^@[A-Za-z][A-Za-z0-9_]{4,31}$/.test(data.contactHandle)) throw new Error("Некорректный Telegram");
  if (data.contactChannel === "Instagram" && !/^@(?!.*\.\.)(?!.*\.$)[A-Za-z0-9_][A-Za-z0-9._]{0,29}$/.test(data.contactHandle)) throw new Error("Некорректный Instagram");
  if (data.consent !== "Да") throw new Error("Нет согласия на связь");
  const score = Number(data.overallScore);
  if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error("Некорректный общий балл");
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
