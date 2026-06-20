import fs from "fs";
import path from "path";
import translate from "google-translate-api-x";

const RU_PATH = "app/(core)/locales/ru.json";
const CACHE_PATH = "scripts/.ru-cache.json";

const MANUAL = {
  Home: "Главная",
  Simulations: "Симуляции",
  Blog: "Блог",
  About: "О нас",
  Contribute: "Внести вклад",
  Easy: "Лёгкий",
  Medium: "Средний",
  Advanced: "Сложный",
  Physics: "Физика",
  Math: "Математика",
  Kinematics: "Кинематика",
  Acceleration: "Ускорение",
  Vectors: "Векторы",
  Forces: "Силы",
  Gravity: "Гравитация",
  Friction: "Трение",
  Collision: "Столкновение",
  Energy: "Энергия",
  Oscillations: "Колебания",
  Springs: "Пружины",
  Waves: "Волны",
  Thermodynamics: "Термодинамика",
  Electromagnetism: "Электромагнетизм",
  Fluids: "Жидкости",
  Optics: "Оптика",
  Relativity: "Относительность",
  Quantum: "Квантовая физика",
  Animations: "Анимации",
  Interactive: "Интерактивный",
  Experimental: "Экспериментальный",
  Dynamics: "Динамика",
  Trigonometry: "Тригонометрия",
  Benchmark: "Бенчмарк",
  Performance: "Производительность",
  Chapter: "Глава",
  language: "Язык",
  "Bouncing Ball": "Прыгающий мяч",
  "Simulation of the ball bouncing off the walls.":
    "Симуляция мяча, отскакивающего от стен.",
  "Vector Operations Calculator": "Калькулятор векторных операций",
};

function collectKeys() {
  const keys = new Set(Object.keys(MANUAL));

  const en = JSON.parse(
    fs.readFileSync("app/(core)/locales/en.json", "utf8")
  );
  Object.keys(en).forEach((k) => keys.add(k));

  const fr = JSON.parse(
    fs.readFileSync("app/(core)/locales/fr.json", "utf8")
  );
  Object.keys(fr).forEach((k) => keys.add(k));

  ["Home", "Simulations", "Blog", "About", "Contribute"].forEach((k) =>
    keys.add(k)
  );

  const articlesDir = "app/(core)/data/articles";
  for (const f of fs.readdirSync(articlesDir)) {
    if (!f.endsWith(".js")) continue;
    const m = fs.readFileSync(path.join(articlesDir, f), "utf8");
    const re =
      /(?:text|title|caption|alt|label|name|desc):\s*"((?:\\.|[^"\\])*)"/g;
    let match;
    while ((match = re.exec(m))) {
      const t = match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      if (t.length > 0) keys.add(t);
    }
  }

  const chaptersFile = fs.readFileSync(
    "app/(core)/data/chapters.js",
    "utf8"
  );
  for (const field of ["name", "desc"]) {
    const fieldRe = new RegExp(`${field}:\\s*"((?:\\\\.|[^"\\\\])*)"`, "g");
    let match;
    while ((match = fieldRe.exec(chaptersFile))) {
      keys.add(match[1].replace(/\\"/g, '"'));
    }
  }

  const tagRe = /name:\s*"([^"]+)"/g;
  let tagMatch;
  while ((tagMatch = tagRe.exec(chaptersFile))) {
    keys.add(tagMatch[1]);
  }

  return [...keys];
}

let cache = {};
if (fs.existsSync(CACHE_PATH)) {
  cache = JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function translateBatch(batch) {
  const pending = batch.filter((key) => !MANUAL[key] && !cache[key]);
  if (pending.length === 0) return;

  try {
    const res = await translate(pending, {
      from: "en",
      to: "ru",
      rejectOnPartialFail: false,
    });
    const results = Array.isArray(res) ? res : [res];
    pending.forEach((key, index) => {
      cache[key] = results[index]?.text || key;
    });
  } catch {
    for (const key of pending) {
      try {
        const res = await translate(key, {
          from: "en",
          to: "ru",
          forceBatch: false,
        });
        cache[key] = res.text;
      } catch {
        cache[key] = key;
      }
      await sleep(200);
    }
  }
}

async function main() {
  const allKeys = collectKeys();
  const batchSize = 12;
  let processed = 0;

  for (let i = 0; i < allKeys.length; i += batchSize) {
    const batch = allKeys.slice(i, i + batchSize);
    await translateBatch(batch);
    processed += batch.length;

    if (processed % 48 === 0 || processed >= allKeys.length) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
      const ru = { ...MANUAL };
      for (const key of allKeys) {
        ru[key] = MANUAL[key] || cache[key] || key;
      }
      fs.writeFileSync(RU_PATH, `${JSON.stringify(ru, null, 2)}\n`);
      console.log(`Progress: ${Math.min(processed, allKeys.length)}/${allKeys.length}`);
    }

    await sleep(300);
  }

  const ru = { ...MANUAL };
  for (const key of allKeys) {
    ru[key] = MANUAL[key] || cache[key] || key;
  }

  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  fs.writeFileSync(RU_PATH, `${JSON.stringify(ru, null, 2)}\n`);
  console.log(`Wrote ${Object.keys(ru).length} entries to ${RU_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
