import fs from "fs";
import path from "path";

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
  " uploaded successfully!": "Загружено успешно!",
  "Add Callout/Note": "Добавить заметку",
  "Add Code Block": "Добавить блок кода",
  "Add Column": "Добавить столбец",
  "Add Image": "Добавить изображение",
  "Add Item": "Добавить элемент",
  "Add List": "Добавить список",
  "Add Paragraph": "Добавить абзац",
  "Add Row": "Добавить строку",
  "Add Table": "Добавить таблицу",
  "All the blogs": "Все блоги",
  Author: "Автор",
  Back: "Назад",
  "Back to home": "На главную",
  "Back to top": "Наверх",
  Blog: "Блог",
  Close: "Закрыть",
  Contribute: "Внести вклад",
  Contributors: "Участники",
  Copied: "Скопировано",
  "Copy code": "Копировать код",
  Details: "Подробности",
  Discord: "Discord",
  Download: "Скачать",
  Edit: "Редактировать",
  "Explore simulations": "Смотреть симуляции",
  Full: "Полный",
  GitHub: "GitHub",
  "Go to blog": "Перейти в блог",
  "Go to simulation": "Перейти к симуляции",
  "Go to Simulations": "Перейти к симуляциям",
  Home: "Главная",
  Info: "Информация",
  "Interactive Physics Simulations": "Интерактивные физические симуляции",
  "Interactive Simulations": "Интерактивные симуляции",
  "Join our Discord": "Присоединиться к Discord",
  Large: "Большой",
  "Let's begin": "Начнём",
  "List view": "Список",
  "Card view": "Карточки",
  "Compact view": "Компактно",
  Loading: "Загрузка",
  Medium: "Средний",
  Next: "Далее",
  Previous: "Назад",
  Preview: "Предпросмотр",
  "Project Contributors": "Участники проекта",
  "Read more": "Читать далее",
  Save: "Сохранить",
  Search: "Поиск",
  "Search Results": "Результаты поиска",
  "Search...": "Поиск...",
  Small: "Маленький",
  Success: "Успех",
  Tip: "Подсказка",
  Warning: "Предупреждение",
  "Stop memorizing formulas.": "Хватит зубрить формулы.",
  "Start visualizing them.": "Начните визуализировать их.",
  "Explore core physics concepts through real-time, interactive experiments":
    "Изучайте основные физические концепции через интерактивные эксперименты в реальном времени",
  "Open/close menu": "Открыть/закрыть меню",
  "Close menu": "Закрыть меню",
  commit: "коммит",
  commits: "коммитов",
  "Why we built this": "Зачем мы это создали",
  "Built for accuracy": "Создано для точности",
  "See how to contribute": "Как внести вклад",
  "Pinned Blogs": "Избранные блоги",
  "New Blog": "Новый блог",
  "View mode": "Режим просмотра",
  "Nothing found for": "Ничего не найдено для",
  "Time to read": "Время чтения",
  "Related Articles": "Похожие статьи",
  "Next Article": "Следующая статья",
  "Previous Article": "Предыдущая статья",
  "Back to Blog List": "Назад к списку блогов",
  "Bouncing Ball": "Прыгающий мяч",
  "Simulation of the ball bouncing off the walls.":
    "Симуляция мяча, отскакивающего от стен.",
  "Vector Operations Calculator": "Калькулятор векторных операций",
  "Interactive 2D vector calculator — visualize addition, subtraction, and dot products in real time. Free online tool for students learning vector physics.":
    "Интерактивный 2D-калькулятор векторов — визуализируйте сложение, вычитание и скалярное произведение в реальном времени.",
  "What Is Physics? A Visual, Interactive Introduction for Beginners":
    "Что такое физика? Наглядное интерактивное введение для начинающих",
  "Physics explained visually — not just with formulas. Discover the major branches of physics, real-world applications, and explore free interactive simulations to see the science in action.":
    "Физика объяснена наглядно — не только формулами. Откройте основные разделы физики, реальные применения и бесплатные интерактивные симуляции.",
  "Class 12 Physics Complete Guide – All Chapters with Formulas & Examples":
    "Полное руководство по физике 12 класса — все главы с формулами и примерами",
  "Master Class 12 Physics (CBSE 2025–26) with clear explanations, key formulas, derivations, and solved examples — Electrostatics, Magnetism, Optics, Modern Physics and more.":
    "Освойте физику 12 класса с понятными объяснениями, ключевыми формулами, выводами и решёнными примерами.",
};

function collectKeys() {
  const keys = new Set(Object.keys(MANUAL));

  for (const file of ["en.json", "fr.json"]) {
    const data = JSON.parse(
      fs.readFileSync(`app/(core)/locales/${file}`, "utf8")
    );
    Object.keys(data).forEach((k) => keys.add(k));
  }

  const articlesDir = "app/(core)/data/articles";
  for (const f of fs.readdirSync(articlesDir)) {
    if (!f.endsWith(".js")) continue;
    const m = fs.readFileSync(path.join(articlesDir, f), "utf8");
    const re =
      /(?:text|title|caption|alt|label|name|desc):\s*"((?:\\.|[^"\\])*)"/g;
    let match;
    while ((match = re.exec(m))) {
      keys.add(match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'));
    }
  }

  const chaptersFile = fs.readFileSync("app/(core)/data/chapters.js", "utf8");
  for (const field of ["name", "desc"]) {
    const fieldRe = new RegExp(`${field}:\\s*"((?:\\\\.|[^"\\\\])*)"`, "g");
    let match;
    while ((match = fieldRe.exec(chaptersFile))) {
      keys.add(match[1].replace(/\\"/g, '"'));
    }
  }

  return [...keys];
}

const keys = collectKeys();
const ru = {};
for (const key of keys) {
  ru[key] = MANUAL[key] || key;
}
Object.assign(ru, MANUAL);

fs.writeFileSync(
  "app/(core)/locales/ru.json",
  `${JSON.stringify(ru, null, 2)}\n`
);
console.log("Seeded ru.json with", Object.keys(ru).length, "entries");
