const geometry = (() => {
  const width = 760;
  const height = 560;
  const origin = { x: 340, y: 300 };
  const scale = 180;

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

  const A = { x: 0, y: 0 };
  const B = { x: 1, y: 0 };
  const C = { x: -1, y: 0 };
  const E = { x: 0, y: 1 };
  const D = { x: 0.5, y: 0 };
  const radiusDE = Math.hypot(E.x - D.x, E.y - D.y);
  const xInner = D.x - radiusDE;
  const xOuter = D.x + radiusDE;
  const F = { x: xInner, y: 0 };
  const G = { x: xOuter, y: 0 };
  const side = Math.hypot(E.x - F.x, E.y - F.y);
  const [upperLeft, upperRight] = intersectCircles(A, 1, E, side).sort((p1, p2) => p1.x - p2.x);
  const H = upperLeft;
  const I = upperRight;
  const [k1, k2] = intersectCircles(A, 1, H, side);
  const K = k1.y < 0 ? k1 : k2;
  const [j1, j2] = intersectCircles(A, 1, I, side);
  const J = j1.y < 0 ? j1 : j2;

  return {
    width,
    height,
    worldToScreen,
    points: { A, B, C, D, E, F, G, H, I, J, K },
    side,
    radiusDE,
  };
})();

const steps = [
  {
    part: "Часть 1. Основная окружность",
    title: "Шаг 1. Отметь точки A и B",
    description: "Возьми две точки на удобном расстоянии. В интерактивном чертеже A будет центром будущей окружности, а B — точкой на окружности.",
    note: "Лучше брать 5-7 см: так все вспомогательные линии будут хорошо видны.",
  },
  {
    part: "Часть 1. Основная окружность",
    title: "Шаг 2. Построй окружность c с центром в A",
    description: "Установи раствор циркуля равным AB и проведи основную окружность c. Именно в нее потом впишется пятиугольник.",
    note: "Точка B уже лежит на окружности, потому что AB — ее радиус.",
  },
  {
    part: "Часть 1. Основная окружность",
    title: "Шаг 3. Проведи f и g",
    description: "Через A и B проведи прямую f. Через A построй перпендикуляр g. Эти две оси помогут найти все ключевые точки.",
    note: "Прямая f проходит через центр, значит пересечет окружность в концах диаметра.",
  },
  {
    part: "Часть 2. Ключевые точки",
    title: "Шаг 4. Отметь точку C",
    description: "Найди вторую точку пересечения прямой f с окружностью c. Это точка C, противоположная B.",
    note: "Отрезок BC — диаметр окружности.",
  },
  {
    part: "Часть 2. Ключевые точки",
    title: "Шаг 5. Найди середину AB и обозначь ее D",
    description: "Построй середину радиуса AB стандартным способом и обозначь ее буквой D. Эта точка нужна для главного шага построения.",
    note: "Именно середина AB дает правильную длину стороны пятиугольника.",
  },
  {
    part: "Часть 2. Ключевые точки",
    title: "Шаг 6. Отметь верхнюю точку E",
    description: "Точка E — пересечение перпендикуляра g с основной окружностью c над центром A.",
    note: "Теперь у нас есть все опорные точки для поиска стороны пятиугольника.",
  },
  {
    part: "Часть 3. Сторона пятиугольника",
    title: "Шаг 7. Проведи окружность d с центром в D",
    description: "Установи раствор циркуля по отрезку DE и проведи окружность d. Она пересечет прямую f в двух точках.",
    note: "Это ключевая окружность: она помогает получить длину стороны правильного пятиугольника.",
  },
  {
    part: "Часть 3. Сторона пятиугольника",
    title: "Шаг 8. Отметь точки F и G",
    description: "Обозначь точки пересечения окружности d с прямой f. Для стороны пятиугольника используется внутренняя точка F, лежащая между C и A. Вторая точка G остается как вспомогательная.",
    note: "Отрезок EF равен стороне вписанного правильного пятиугольника.",
  },
  {
    part: "Часть 4. Разметка вершин",
    title: "Шаг 9. Проведи окружность e с центром в E",
    description: "Оставь раствор циркуля равным EF и из точки E проведи окружность e. Она пересечет основную окружность в двух будущих вершинах.",
    note: "Мы начинаем откладывать по окружности длину стороны пятиугольника.",
  },
  {
    part: "Часть 4. Разметка вершин",
    title: "Шаг 10. Отметь вершины H и I",
    description: "Точки пересечения окружностей e и c — это вершины H и I. Они симметричны относительно прямой g.",
    note: "Уже видны три верхние вершины: H, E и I.",
  },
  {
    part: "Часть 4. Разметка вершин",
    title: "Шаг 11. Проведи окружность h из точки H",
    description: "Поставь иглу в H, сохрани раствор EF и проведи окружность h. Она должна дать еще одну вершину на основной окружности.",
    note: "Откладываем ту же самую длину стороны, без пересчета и без изменений раствора.",
  },
  {
    part: "Часть 4. Разметка вершин",
    title: "Шаг 12. Отметь вершину K",
    description: "Второе пересечение окружностей h и c — это точка K, нижняя левая вершина пятиугольника.",
    note: "Одна нижняя вершина уже найдена. Осталась симметричная справа.",
  },
  {
    part: "Часть 4. Разметка вершин",
    title: "Шаг 13. Проведи окружность k из точки I",
    description: "Поставь иглу в I, оставь прежний раствор EF и проведи окружность k.",
    note: "Этот шаг полностью симметричен шагу 11.",
  },
  {
    part: "Часть 4. Разметка вершин",
    title: "Шаг 14. Отметь вершину J",
    description: "Второе пересечение окружностей k и c — это точка J, нижняя правая вершина пятиугольника.",
    note: "Теперь все пять вершин построены: I, E, H, K и J.",
  },
  {
    part: "Часть 5. Финал",
    title: "Шаг 15. Соедини вершины по порядку",
    description: "Соедини точки I → E → H → K → J → I. Получится правильный пятиугольник, вписанный в окружность.",
    note: "Все вспомогательные построения можно оставить на чертеже, как требует задание.",
  },
  {
    part: "Часть 5. Бонус",
    title: "Шаг 16. Построй пентаграмму",
    description: "Если соединить вершины через одну, получится красивая пентаграмма: I → H → J → E → K → I.",
    note: "Это необязательный, но наглядный дополнительный шаг.",
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
  pentagon: "#407a52",
  bonus: "#8b5cf6",
};

const orderedPoints = ["I", "E", "H", "K", "J"];
const bonusPoints = ["I", "H", "J", "E", "K"];

function line(name1, name2, className = "line-base") {
  const p1 = geometry.worldToScreen(geometry.points[name1]);
  const p2 = geometry.worldToScreen(geometry.points[name2]);
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function fullLineHorizontal(y, className = "line-base") {
  const p1 = geometry.worldToScreen({ x: -1.9, y });
  const p2 = geometry.worldToScreen({ x: 1.9, y });
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function fullLineVertical(x, className = "line-base") {
  const p1 = geometry.worldToScreen({ x, y: -1.45 });
  const p2 = geometry.worldToScreen({ x, y: 1.45 });
  return `<line class="${className}" x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" />`;
}

function circle(centerName, radius, className = "circle-base") {
  const center = geometry.worldToScreen(geometry.points[centerName]);
  return `<circle class="${className}" cx="${center.x}" cy="${center.y}" r="${radius * 180}" />`;
}

function point(name, className = "point-base") {
  const p = geometry.worldToScreen(geometry.points[name]);
  const labelOffsets = {
    A: { x: -22, y: 22 },
    B: { x: 14, y: 24 },
    C: { x: -24, y: 24 },
    D: { x: 12, y: -10 },
    E: { x: 12, y: -12 },
    F: { x: -26, y: 24 },
    G: { x: 10, y: 24 },
    H: { x: -26, y: -8 },
    I: { x: 12, y: -8 },
    J: { x: 12, y: 24 },
    K: { x: -24, y: 24 },
  }[name];

  return `
    <circle class="${className}" cx="${p.x}" cy="${p.y}" r="5.5" />
    <text class="label" x="${p.x + labelOffsets.x}" y="${p.y + labelOffsets.y}">${name}</text>
  `;
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
  const visiblePoints = new Set();
  const layers = [];

  if (stepIndex >= 0) visiblePoints.add("A");
  if (stepIndex >= 0) visiblePoints.add("B");

  if (stepIndex >= 1) layers.push(circle("A", 1, "circle-main"));
  if (stepIndex >= 2) {
    layers.push(fullLineHorizontal(0, "line-main"));
    layers.push(fullLineVertical(0, "line-main"));
  }
  if (stepIndex >= 3) visiblePoints.add("C");
  if (stepIndex >= 4) {
    visiblePoints.add("D");
    layers.push(line("A", "B", "segment-guide"));
  }
  if (stepIndex >= 5) visiblePoints.add("E");
  if (stepIndex >= 6) layers.push(circle("D", geometry.radiusDE, "circle-key"));
  if (stepIndex >= 7) {
    visiblePoints.add("F");
    visiblePoints.add("G");
    layers.push(line("E", "F", "segment-side"));
  }
  if (stepIndex >= 8) layers.push(circle("E", geometry.side, "circle-key"));
  if (stepIndex >= 9) {
    visiblePoints.add("H");
    visiblePoints.add("I");
  }
  if (stepIndex >= 10) layers.push(circle("H", geometry.side, "circle-key"));
  if (stepIndex >= 11) visiblePoints.add("K");
  if (stepIndex >= 12) layers.push(circle("I", geometry.side, "circle-key"));
  if (stepIndex >= 13) visiblePoints.add("J");
  if (stepIndex >= 14) {
    layers.push(`<path class="polygon-main" d="${polygonPath([...orderedPoints, orderedPoints[0]])}" />`);
  }
  if (stepIndex >= 15) {
    layers.push(`<path class="polygon-bonus" d="${polygonPath([...bonusPoints, bonusPoints[0]])}" />`);
  }

  const allPoints = Array.from(visiblePoints)
    .sort()
    .map((name) => point(name, name === "E" || orderedPoints.includes(name) ? "point-key" : "point-base"))
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
        .line-base { stroke: ${colors.main}; stroke-width: 2; stroke-linecap: round; opacity: 0.64; }
        .segment-guide { stroke: ${colors.soft}; stroke-width: 2.2; stroke-dasharray: 8 7; opacity: 0.75; }
        .segment-side { stroke: ${colors.key}; stroke-width: 3.2; stroke-linecap: round; }
        .circle-main { fill: none; stroke: ${colors.main}; stroke-width: 3; }
        .circle-key { fill: none; stroke: ${colors.key}; stroke-width: 2.6; stroke-dasharray: 9 8; opacity: 0.9; }
        .point-base { fill: ${colors.main}; }
        .point-key { fill: ${colors.key}; }
        .label {
          fill: ${colors.ink || "#1f2937"};
          font-family: Manrope, sans-serif;
          font-size: 18px;
          font-weight: 800;
        }
        .polygon-main {
          fill: rgba(64, 122, 82, 0.12);
          stroke: ${colors.pentagon};
          stroke-width: 4;
          stroke-linejoin: round;
        }
        .polygon-bonus {
          fill: none;
          stroke: ${colors.bonus};
          stroke-width: 3.2;
          stroke-linejoin: round;
          stroke-dasharray: 7 7;
        }
      </style>

      ${layers.join("")}
      ${allPoints}
    </svg>
  `;
}

function renderStepsList() {
  refs.stepsList.innerHTML = steps
    .map((step, index) => {
      return `
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
      `;
    })
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
