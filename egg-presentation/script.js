const geometry = (() => {
  const width = 760;
  const height = 560;
  const origin = { x: 380, y: 320 };
  const scale = 150;

  const worldToScreen = (point) => ({
    x: origin.x + point.x * scale,
    y: origin.y - point.y * scale,
  });

  const intersectCircles = (c0, r0, c1, r1) => {
    const dx = c1.x - c0.x;
    const dy = c1.y - c0.y;
    const d = Math.hypot(dx, dy);
    const a = (r0 ** 2 - r1 ** 2 + d ** 2) / (2 * d);
    const h = Math.sqrt(Math.max(r0 ** 2 - a ** 2, 0));
    const xm = c0.x + (a * dx) / d;
    const ym = c0.y + (a * dy) / d;
    const rx = (-dy * h) / d;
    const ry = (dx * h) / d;

    return [
      { x: xm + rx, y: ym + ry },
      { x: xm - rx, y: ym - ry },
    ];
  };

  const lineCircleIntersections = (p0, p1, center, radius) => {
    const dx = p1.x - p0.x;
    const dy = p1.y - p0.y;
    const fx = p0.x - center.x;
    const fy = p0.y - center.y;
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - radius * radius;
    const disc = Math.sqrt(Math.max(b * b - 4 * a * c, 0));
    const t1 = (-b - disc) / (2 * a);
    const t2 = (-b + disc) / (2 * a);

    return [
      { x: p0.x + t1 * dx, y: p0.y + t1 * dy, t: t1 },
      { x: p0.x + t2 * dx, y: p0.y + t2 * dy, t: t2 },
    ];
  };

  const A = { x: 0, y: 0 };
  const B = { x: 1, y: 0 };
  const D = { x: -1, y: 0 };
  const E = { x: 0, y: 1 };

  const mainRadius = 1;
  const sideRadius = Math.hypot(B.x - D.x, B.y - D.y);

  const F = lineCircleIntersections(E, B, B, sideRadius)
    .sort((p1, p2) => p1.t - p2.t)[0];
  const G = lineCircleIntersections(E, D, D, sideRadius)
    .sort((p1, p2) => p1.t - p2.t)[0];

  return {
    width,
    height,
    scale,
    worldToScreen,
    points: { A, B, D, E, F, G },
    radii: {
      main: mainRadius,
      side: sideRadius,
      topCap: Math.hypot(F.x - E.x, F.y - E.y),
    },
  };
})();

const steps = [
  {
    part: "Часть 1. Основа",
    title: "Шаг 1. Отметь точки A и B",
    description: "Возьми две точки A и B на одной горизонтали. Отрезок AB задает размер будущего построения.",
    note: "На чертеже A находится в центре будущей маленькой окружности, а B — справа от него.",
  },
  {
    part: "Часть 1. Основа",
    title: "Шаг 2. Построй окружность c с центром в A",
    description: "Поставь иглу циркуля в A, установи раствор AB и проведи окружность c.",
    note: "Это центральная окружность, через нее будут получены верхняя точка и левая опорная точка.",
  },
  {
    part: "Часть 1. Основа",
    title: "Шаг 3. Проведи прямую f через B и A",
    description: "Через точки B и A проведи прямую f. Она образует горизонтальную ось построения.",
    note: "На этой прямой лежат обе боковые опорные точки будущего контура.",
  },
  {
    part: "Часть 1. Основа",
    title: "Шаг 4. Найди вторую точку пересечения и обозначь ее D",
    description: "Вторая точка пересечения прямой f с окружностью c — это D. Теперь точки D и B лежат по краям центральной окружности.",
    note: "",
  },
  {
    part: "Часть 2. Большие окружности",
    title: "Шаг 5. Построй окружность d с центром в B через D",
    description: "Поставь иглу в B, возьми раствор BD и проведи большую окружность d.",
    note: "Эта окружность нужна для правой нижней части яйца.",
  },
  {
    part: "Часть 2. Большие окружности",
    title: "Шаг 6. Построй окружность e с центром в D через B",
    description: "Теперь поставь иглу в D, сохрани тот же раствор BD и проведи вторую большую окружность e.",
    note: "Обе большие окружности одинаковые и расположены симметрично.",
  },
  {
    part: "Часть 3. Верхняя точка",
    title: "Шаг 7. Через A проведи перпендикуляр g",
    description: "Через точку A построй прямую g, перпендикулярную f. Ее верхнее пересечение с окружностью c обозначь E.",
    note: "Точка E станет центром маленькой верхней дуги.",
  },
  {
    part: "Часть 3. Направляющие",
    title: "Шаг 8. Проведи прямые DE и EB",
    description: "Соедини точки D и E, а затем точки E и B. Получатся две наклонные направляющие.",
    note: "Именно на них будут найдены точки стыка верхней дуги с боковыми.",
  },
  {
    part: "Часть 4. Точки стыка дуг",
    title: "Шаг 9. Найди точку F",
    description: "На прямой EB отметь вторую точку пересечения с окружностью d. Это точка F.",
    note: "Точка F находится выше E и левее него.",
  },
  {
    part: "Часть 4. Точки стыка дуг",
    title: "Шаг 10. Найди точку G",
    description: "На прямой DE отметь вторую точку пересечения с окружностью e. Это точка G.",
    note: "Точка G симметрична точке F относительно перпендикуляра g и лежит справа.",
  },
  {
    part: "Часть 5. Контур яйца",
    title: "Шаг 11. Проведи нижнюю дугу k",
    description: "Построй дугу окружности c от D до B через низ. Это нижняя часть красного контура.",
    note: "Центр этой дуги — точка A.",
  },
  {
    part: "Часть 5. Контур яйца",
    title: "Шаг 12. Проведи правую боковую дугу p",
    description: "Построй дугу окружности e от B до G. Она поднимается от правой боковой точки к правой верхней точке стыка.",
    note: "Центр этой дуги — точка D.",
  },
  {
    part: "Часть 5. Контур яйца",
    title: "Шаг 13. Проведи верхнюю малую дугу q",
    description: "Построй дугу с центром в E от G до F. Она образует более узкий верх яйца.",
    note: "Именно эта дуга делает верхушку уже, чем в обычном овале.",
  },
  {
    part: "Часть 5. Контур яйца",
    title: "Шаг 14. Проведи левую боковую дугу r",
    description: "Построй дугу окружности d от F до D через левую нижнюю часть. Контур замкнется и получится фигура, как на исходном скрине.",
    note: "Центр этой дуги — точка B.",
  },
];

const state = {
  index: 0,
};

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
  soft: "#6b7280",
  final: "#c0392b",
  finalFill: "rgba(192, 57, 43, 0.08)",
};

function toScreen(name) {
  return geometry.worldToScreen(geometry.points[name]);
}

function fullLineHorizontal(y, className = "line-base") {
  const p1 = geometry.worldToScreen({ x: -2.8, y });
  const p2 = geometry.worldToScreen({ x: 2.8, y });
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function fullLineVertical(x, className = "line-base") {
  const p1 = geometry.worldToScreen({ x, y: -2.1 });
  const p2 = geometry.worldToScreen({ x, y: 2.85 });
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function line(name1, name2, className = "line-base") {
  const p1 = toScreen(name1);
  const p2 = toScreen(name2);
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function ray(name1, name2, extension = 1, className = "line-base") {
  const p1 = geometry.points[name1];
  const p2 = geometry.points[name2];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const target = {
    x: p1.x + dx * extension,
    y: p1.y + dy * extension,
  };
  const s1 = geometry.worldToScreen(p1);
  const s2 = geometry.worldToScreen(target);
  return `<line class="${className}" x1="${s1.x}" y1="${s1.y}" x2="${s2.x}" y2="${s2.y}" />`;
}

function infiniteLine(name1, name2, extension = 3.2, className = "line-base") {
  const p1 = geometry.points[name1];
  const p2 = geometry.points[name2];
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const start = {
    x: p1.x - dx * extension,
    y: p1.y - dy * extension,
  };
  const end = {
    x: p1.x + dx * extension,
    y: p1.y + dy * extension,
  };
  const s1 = geometry.worldToScreen(start);
  const s2 = geometry.worldToScreen(end);
  return `<line class="${className}" x1="${s1.x}" y1="${s1.y}" x2="${s2.x}" y2="${s2.y}" />`;
}

function circle(centerName, radius, className = "circle-base") {
  const center = toScreen(centerName);
  return `<circle class="${className}" cx="${center.x}" cy="${center.y}" r="${radius * geometry.scale}" />`;
}

function point(name, className = "point-base") {
  const p = toScreen(name);
  const offsets = {
    A: { x: -22, y: 22 },
    B: { x: 12, y: 24 },
    D: { x: -24, y: 24 },
    E: { x: 12, y: -12 },
    F: { x: 12, y: -10 },
    G: { x: -24, y: -10 },
  }[name];

  return `
    <circle class="${className}" cx="${p.x}" cy="${p.y}" r="5.5" />
    <text class="label" x="${p.x + offsets.x}" y="${p.y + offsets.y}">${name}</text>
  `;
}

function sampleArcPoints(centerName, radius, fromName, toName, direction, segments = 44) {
  const center = geometry.points[centerName];
  const from = geometry.points[fromName];
  const to = geometry.points[toName];
  const start = Math.atan2(from.y - center.y, from.x - center.x);
  const end = Math.atan2(to.y - center.y, to.x - center.x);

  let delta = end - start;
  if (direction === "ccw" && delta <= 0) delta += Math.PI * 2;
  if (direction === "cw" && delta >= 0) delta -= Math.PI * 2;

  const points = [];
  for (let index = 0; index <= segments; index += 1) {
    const angle = start + (delta * index) / segments;
    points.push({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  }
  return points;
}

function sampleArc(centerName, radius, fromName, toName, direction, className) {
  const points = sampleArcPoints(centerName, radius, fromName, toName, direction);
  const d = points
    .map((pointData, index) => {
      const screenPoint = geometry.worldToScreen(pointData);
      return `${index === 0 ? "M" : "L"} ${screenPoint.x} ${screenPoint.y}`;
    })
    .join(" ");
  return `<path class="${className}" d="${d}" />`;
}

function buildClosedOutlinePath() {
  const points = [
    ...sampleArcPoints("A", geometry.radii.main, "D", "B", "ccw"),
    ...sampleArcPoints("D", geometry.radii.side, "B", "G", "ccw").slice(1),
    ...sampleArcPoints("E", geometry.radii.topCap, "G", "F", "ccw").slice(1),
    ...sampleArcPoints("B", geometry.radii.side, "F", "D", "ccw").slice(1),
  ];

  return points
    .map((pointData, index) => {
      const screenPoint = geometry.worldToScreen(pointData);
      return `${index === 0 ? "M" : "L"} ${screenPoint.x} ${screenPoint.y}`;
    })
    .join(" ") + " Z";
}

function buildDiagram(stepIndex) {
  const visiblePoints = new Set(["A", "B"]);
  const layers = [];

  if (stepIndex >= 1) layers.push(circle("A", geometry.radii.main, "circle-main"));
  if (stepIndex >= 2) layers.push(fullLineHorizontal(0, "line-main"));
  if (stepIndex >= 3) visiblePoints.add("D");
  if (stepIndex >= 4) layers.push(circle("B", geometry.radii.side, "circle-guide"));
  if (stepIndex >= 5) layers.push(circle("D", geometry.radii.side, "circle-guide"));
  if (stepIndex >= 6) {
    layers.push(fullLineVertical(0, "line-main"));
    visiblePoints.add("E");
  }
  if (stepIndex >= 7) {
    layers.push(infiniteLine("D", "E", 3.2, "line-guide"));
    layers.push(infiniteLine("E", "B", 3.2, "line-guide"));
  }
  if (stepIndex >= 8) visiblePoints.add("F");
  if (stepIndex >= 9) visiblePoints.add("G");
  if (stepIndex >= 10) layers.push(sampleArc("A", geometry.radii.main, "D", "B", "ccw", "outline-main"));
  if (stepIndex >= 11) layers.push(sampleArc("D", geometry.radii.side, "B", "G", "ccw", "outline-main"));
  if (stepIndex >= 12) layers.push(sampleArc("E", geometry.radii.topCap, "G", "F", "ccw", "outline-main"));
  if (stepIndex >= 13) {
    layers.push(`<path class="outline-fill" d="${buildClosedOutlinePath()}" />`);
    layers.push(sampleArc("B", geometry.radii.side, "F", "D", "ccw", "outline-main"));
  }

  const pointsMarkup = Array.from(visiblePoints)
    .sort()
    .map((name) => point(name, ["E", "F", "G"].includes(name) ? "point-key" : "point-base"))
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
        .line-main { stroke: ${colors.main}; stroke-width: 2.2; stroke-linecap: round; opacity: 0.78; }
        .line-guide { stroke: ${colors.soft}; stroke-width: 2.2; stroke-dasharray: 8 7; opacity: 0.85; }
        .circle-main { fill: none; stroke: rgba(31, 41, 55, 0.72); stroke-width: 2.5; }
        .circle-guide { fill: none; stroke: rgba(31, 41, 55, 0.72); stroke-width: 2.5; }
        .point-base { fill: ${colors.main}; }
        .point-key { fill: ${colors.key}; }
        .label {
          fill: #1f2937;
          font-family: Manrope, sans-serif;
          font-size: 18px;
          font-weight: 800;
        }
        .outline-main {
          fill: none;
          stroke: ${colors.final};
          stroke-width: 4;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .outline-fill {
          fill: ${colors.finalFill};
          stroke: none;
        }
      </style>

      ${layers.join("")}
      ${pointsMarkup}
    </svg>
  `;
}

function renderStepsList() {
  refs.stepsList.innerHTML = steps
    .map((step, index) => `
      <li
        class="${index === state.index ? "is-active" : ""}"
        data-index="${index}"
        tabindex="0"
        aria-current="${index === state.index ? "step" : "false"}"
      >
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
