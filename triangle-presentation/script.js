const geometry = (() => {
  const width = 760;
  const height = 560;
  const origin = { x: 380, y: 280 };
  const scale = 180;
  const root3 = Math.sqrt(3);

  const worldToScreen = (point) => ({
    x: origin.x + point.x * scale,
    y: origin.y - point.y * scale,
  });

  const C = { x: 0, y: 0 };
  const D = { x: -1, y: 0 };
  const G = { x: 1, y: 0 };
  const B = { x: -0.5, y: root3 / 2 };
  const E = { x: -0.5, y: -root3 / 2 };
  const A = { x: 0.5, y: root3 / 2 };
  const F = { x: 0.5, y: -root3 / 2 };

  return {
    width,
    height,
    radius: 1,
    worldToScreen,
    points: { A, B, C, D, E, F, G },
  };
})();

const steps = [
  {
    part: "Часть 1. Основная окружность",
    title: "Шаг 1. Отметь центр C и точку D",
    description: "Возьми точку C как центр окружности и отметь на расстоянии радиуса точку D. Отрезок CD задаст размер будущего построения.",
    note: "Этим же раствором циркуля будут отмечаться все нужные точки на окружности.",
  },
  {
    part: "Часть 1. Основная окружность",
    title: "Шаг 2. Построй окружность с центром в C",
    description: "Поставь иглу циркуля в точку C и раствором CD проведи окружность.",
    note: "На этой окружности потом будут отмечены вершины правильного треугольника.",
  },
  {
    part: "Часть 2. Диаметр",
    title: "Шаг 3. Проведи прямую DC и отметь точку G",
    description: "Проведи прямую через точки D и C. Она пересечет окружность с другой стороны. Эту вторую точку пересечения обозначь буквой G.",
    note: "Теперь у нас есть две противоположные точки окружности: D и G.",
  },
  {
    part: "Часть 3. Разметка окружности",
    title: "Шаг 4. Из точки D отметь точки B и E",
    description: "Не меняя раствор циркуля, поставь иглу в точку D и проведи вспомогательную окружность. Ее пересечения с основной окружностью обозначь B и E.",
    note: "Так мы начинаем делить окружность на равные части.",
  },
  {
    part: "Часть 3. Разметка окружности",
    title: "Шаг 5. Из точки G отметь точки A и F",
    description: "Тем же раствором циркуля поставь иглу в точку G и проведи вторую вспомогательную окружность. Ее пересечения с основной окружностью обозначь A и F.",
    note: "Теперь на окружности есть шесть равномерно отмеченных точек, как у правильного шестиугольника.",
  },
  {
    part: "Часть 4. Финал",
    title: "Шаг 6. Соедини точки A, D и F",
    description: "Соедини точки A, D и F. Получится правильный треугольник, потому что выбраны вершины через одну из шести равных точек на окружности.",
    note: "Можно было бы так же соединить и другую тройку через одну, например B, E и G.",
  },
];

const state = { index: 0 };

const refs = {
  viewer: document.getElementById("viewer"),
  diagram: document.getElementById("diagram"),
  stepCounter: document.getElementById("step-counter"),
  progressBar: document.getElementById("progress-bar"),
  stepPart: document.getElementById("step-part"),
  stepChip: document.getElementById("step-chip"),
  stepTitle: document.getElementById("step-title"),
  stepDescription: document.getElementById("step-description"),
  stepNote: document.getElementById("step-note"),
  prevButton: document.getElementById("prev-button"),
  nextButton: document.getElementById("next-button"),
  startButton: document.getElementById("start-button"),
  stepsList: document.getElementById("steps-list"),
};

const colors = {
  main: "#2a6f97",
  key: "#bd5d38",
  triangle: "#1d4ed8",
};

const orderedTriangle = ["A", "D", "F"];

function point(name, className = "point-base") {
  const p = geometry.worldToScreen(geometry.points[name]);
  const offsets = {
    A: { x: 12, y: -10 },
    B: { x: -24, y: -10 },
    C: { x: 12, y: -12 },
    D: { x: -24, y: 24 },
    E: { x: -24, y: 24 },
    F: { x: 12, y: 24 },
    G: { x: 12, y: 24 },
  }[name];

  return `
    <circle class="${className}" cx="${p.x}" cy="${p.y}" r="5.5" />
    <text class="label" x="${p.x + offsets.x}" y="${p.y + offsets.y}">${name}</text>
  `;
}

function line(name1, name2, className = "line-base") {
  const p1 = geometry.worldToScreen(geometry.points[name1]);
  const p2 = geometry.worldToScreen(geometry.points[name2]);
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function circle(centerName, radius, className = "circle-base") {
  const center = geometry.worldToScreen(geometry.points[centerName]);
  return `<circle class="${className}" cx="${center.x}" cy="${center.y}" r="${radius * 180}" />`;
}

function polygonPath(names) {
  return names
    .map((name, index) => {
      const pointData = geometry.worldToScreen(geometry.points[name]);
      return `${index === 0 ? "M" : "L"} ${pointData.x} ${pointData.y}`;
    })
    .join(" ");
}

function buildDiagram(stepIndex) {
  const visiblePoints = new Set(["C", "D"]);
  const layers = [];

  if (stepIndex >= 1) layers.push(circle("C", geometry.radius, "circle-main"));
  if (stepIndex >= 2) {
    layers.push(line("D", "G", "line-main"));
    visiblePoints.add("G");
  }
  if (stepIndex >= 3) {
    layers.push(circle("D", geometry.radius, "circle-key"));
    visiblePoints.add("B");
    visiblePoints.add("E");
  }
  if (stepIndex >= 4) {
    layers.push(circle("G", geometry.radius, "circle-key"));
    visiblePoints.add("A");
    visiblePoints.add("F");
  }
  if (stepIndex >= 5) {
    layers.push(`<path class="polygon-main" d="${polygonPath([...orderedTriangle, orderedTriangle[0]])}" />`);
  }

  const pointsMarkup = Array.from(visiblePoints)
    .sort()
    .map((name) => point(name, name === "C" ? "point-base" : "point-key"))
    .join("");

  return `
    <svg viewBox="0 0 ${geometry.width} ${geometry.height}" role="img" aria-label="${steps[stepIndex].title}">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(107, 114, 128, 0.08)" stroke-width="1" />
        </pattern>
      </defs>
      <rect width="${geometry.width}" height="${geometry.height}" fill="url(#grid)" />
      <style>
        .line-main { stroke: ${colors.main}; stroke-width: 2.4; stroke-linecap: round; opacity: 0.82; }
        .circle-main { fill: none; stroke: rgba(31, 41, 55, 0.74); stroke-width: 2.6; }
        .circle-key { fill: none; stroke: ${colors.key}; stroke-width: 2.4; stroke-dasharray: 9 8; opacity: 0.9; }
        .point-base { fill: ${colors.main}; }
        .point-key { fill: ${colors.key}; }
        .label { fill: #1f2937; font-family: Manrope, sans-serif; font-size: 18px; font-weight: 800; }
        .polygon-main { fill: rgba(29, 78, 216, 0.12); stroke: ${colors.triangle}; stroke-width: 4; stroke-linejoin: round; }
      </style>
      ${layers.join("")}
      ${pointsMarkup}
    </svg>
  `;
}

function renderStepsList() {
  refs.stepsList.innerHTML = steps
    .map((step, index) => `
      <li class="${index === state.index ? "is-active" : ""}" data-index="${index}" tabindex="0" aria-current="${index === state.index ? "step" : "false"}">
        <span class="steps__number">${index + 1}</span>
        <strong>${step.title}</strong>
        <p>${step.description}</p>
      </li>
    `)
    .join("");

  refs.stepsList.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => goToStep(Number(item.dataset.index)));
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        goToStep(Number(item.dataset.index));
      }
    });
  });
}

function render() {
  const step = steps[state.index];
  refs.diagram.innerHTML = buildDiagram(state.index);
  refs.stepCounter.textContent = `${state.index + 1} / ${steps.length}`;
  refs.progressBar.style.width = `${((state.index + 1) / steps.length) * 100}%`;
  refs.stepPart.textContent = step.part;
  refs.stepChip.textContent = `Шаг ${state.index + 1}`;
  refs.stepTitle.textContent = step.title;
  refs.stepDescription.textContent = step.description;
  refs.stepNote.textContent = step.note || "";
  refs.prevButton.disabled = state.index === 0;
  refs.nextButton.disabled = state.index === steps.length - 1;
  renderStepsList();
}

function goToStep(index) {
  state.index = Math.max(0, Math.min(index, steps.length - 1));
  render();
}

refs.prevButton.addEventListener("click", () => goToStep(state.index - 1));
refs.nextButton.addEventListener("click", () => goToStep(state.index + 1));
refs.startButton.addEventListener("click", () => {
  goToStep(0);
  refs.viewer.scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") goToStep(state.index - 1);
  if (event.key === "ArrowRight") goToStep(state.index + 1);
});

render();
