const board = {
  width: 760,
  height: 560,
  origin: { x: 380, y: 305 },
  scale: 170,
};

const refs = {
  constructionList: document.getElementById("construction-list"),
  constructionName: document.getElementById("construction-name"),
  diagram: document.getElementById("diagram"),
  nextButton: document.getElementById("next-button"),
  prevButton: document.getElementById("prev-button"),
  progressBar: document.getElementById("progress-bar"),
  startButton: document.getElementById("start-button"),
  stepChip: document.getElementById("step-chip"),
  stepCounter: document.getElementById("step-counter"),
  stepDescription: document.getElementById("step-description"),
  stepNote: document.getElementById("step-note"),
  stepsCopy: document.getElementById("steps-copy"),
  stepsList: document.getElementById("steps-list"),
  stepTitle: document.getElementById("step-title"),
  summaryIdea: document.getElementById("summary-idea"),
  summaryLead: document.getElementById("summary-lead"),
  summaryProof: document.getElementById("summary-proof"),
  summaryTitle: document.getElementById("summary-title"),
  summaryUse: document.getElementById("summary-use"),
};

const palette = {
  main: "#2a6f97",
  accent: "#bd5d38",
  final: "#407a52",
  ink: "#1f2937",
  soft: "#6b7280",
};

const state = {
  constructionIndex: 0,
  stepIndex: 0,
};

function toScreen(point) {
  return {
    x: board.origin.x + point.x * board.scale,
    y: board.origin.y - point.y * board.scale,
  };
}

function distance(pointA, pointB) {
  return Math.hypot(pointB.x - pointA.x, pointB.y - pointA.y);
}

function arcPath(center, radius, startAngle, endAngle) {
  const start = toScreen({
    x: center.x + radius * Math.cos(startAngle),
    y: center.y + radius * Math.sin(startAngle),
  });
  const end = toScreen({
    x: center.x + radius * Math.cos(endAngle),
    y: center.y + radius * Math.sin(endAngle),
  });
  const delta = ((endAngle - startAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
  const largeArc = delta > Math.PI ? 1 : 0;
  const sweep = endAngle > startAngle ? 0 : 1;
  const radiusPx = radius * board.scale;
  return `M ${start.x} ${start.y} A ${radiusPx} ${radiusPx} 0 ${largeArc} ${sweep} ${end.x} ${end.y}`;
}

function makeSvg(title, layers, labels) {
  return `
    <svg viewBox="0 0 ${board.width} ${board.height}" role="img" aria-label="${title}">
      <defs>
        <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(107, 114, 128, 0.08)" stroke-width="1" />
        </pattern>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="${palette.main}" />
        </marker>
      </defs>
      <rect width="${board.width}" height="${board.height}" fill="url(#grid)" />
      <style>
        .line-main { stroke: ${palette.main}; stroke-width: 2.6; stroke-linecap: round; }
        .line-soft { stroke: ${palette.soft}; stroke-width: 2.2; stroke-dasharray: 8 7; stroke-linecap: round; opacity: 0.8; }
        .line-final { stroke: ${palette.final}; stroke-width: 4; stroke-linecap: round; stroke-linejoin: round; }
        .circle-main { fill: none; stroke: ${palette.accent}; stroke-width: 2.5; stroke-dasharray: 9 8; opacity: 0.92; }
        .arc-main { fill: none; stroke: ${palette.accent}; stroke-width: 3; stroke-linecap: round; }
        .point-main { fill: ${palette.main}; }
        .point-key { fill: ${palette.accent}; }
        .point-final { fill: ${palette.final}; }
        .label {
          fill: ${palette.ink};
          font-family: Manrope, sans-serif;
          font-size: 18px;
          font-weight: 800;
        }
      </style>
      ${layers.join("")}
      ${labels.join("")}
    </svg>
  `;
}

function drawPoint(name, point, kind = "main", dx = 12, dy = -10) {
  const screen = toScreen(point);
  const className = kind === "final" ? "point-final" : kind === "key" ? "point-key" : "point-main";
  return `
    <circle class="${className}" cx="${screen.x}" cy="${screen.y}" r="5.5" />
    <text class="label" x="${screen.x + dx}" y="${screen.y + dy}">${name}</text>
  `;
}

function drawSegment(pointA, pointB, className = "line-main", marker = "") {
  const a = toScreen(pointA);
  const b = toScreen(pointB);
  return `<line class="${className}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" ${marker} />`;
}

function drawCircle(center, radius, className = "circle-main") {
  const c = toScreen(center);
  return `<circle class="${className}" cx="${c.x}" cy="${c.y}" r="${radius * board.scale}" />`;
}

function drawArc(center, radius, startAngle, endAngle, className = "arc-main") {
  return `<path class="${className}" d="${arcPath(center, radius, startAngle, endAngle)}" />`;
}

const constructions = [
  {
    name: "По трем сторонам (SSS)",
    button: "SSS",
    buttonText: "Известны три стороны будущего треугольника.",
    lead: "Этот случай прямо разбирается в учебнике: одна сторона откладывается на прямой, а третья вершина находится как пересечение двух окружностей.",
    idea: "Заданы три отрезка: AB, AC и BC. Сначала выбирают одну сторону как основание, а остальные две переносят окружностями с центрами в концах основания.",
    proof: "Если точка C лежит одновременно на окружности с центром A и радиусом AC и на окружности с центром B и радиусом BC, то автоматически AC и BC имеют нужные длины, а AB уже отложен.",
    use: "Нужно проверить неравенство треугольника: сумма любых двух сторон должна быть больше третьей.",
    stepsCopy: "Одна сторона становится основанием, а две другие стороны появляются как радиусы окружностей.",
    points: {
      A: { x: -1.1, y: -0.4 },
      B: { x: 0.65, y: -0.4 },
      C: { x: -0.12, y: 0.86 },
    },
    steps: [
      {
        title: "Шаг 1. Отложи основание AB",
        description: "На прямой отложи одну из заданных сторон и обозначь ее концы A и B.",
        note: "Обычно удобно брать за основание самую длинную из трех сторон.",
      },
      {
        title: "Шаг 2. Построй окружность с центром в A",
        description: "С центром в A проведи окружность радиусом, равным второй заданной стороне, например AC.",
        note: "Третья вершина треугольника должна лежать где-то на этой окружности.",
      },
      {
        title: "Шаг 3. Построй окружность с центром в B",
        description: "С центром в B проведи вторую окружность радиусом, равным стороне BC. Точка их пересечения обозначается C.",
        note: "Можно получить две симметричные точки пересечения, если обе окружности пересекаются.",
      },
      {
        title: "Шаг 4. Соедини вершину C с A и B",
        description: "Треугольник ABC построен: его стороны равны трем заданным отрезкам.",
        note: "Если окружности не пересеклись, то построение невозможно.",
      },
    ],
    draw(stepIndex) {
      const radiusA = distance(this.points.A, this.points.C);
      const radiusB = distance(this.points.B, this.points.C);
      const layers = [
        drawSegment({ x: -1.7, y: -0.4 }, { x: 1.45, y: -0.4 }, "line-soft"),
        drawSegment(this.points.A, this.points.B, "line-main"),
      ];
      const labels = [
        drawPoint("A", this.points.A, "main", -20, 24),
        drawPoint("B", this.points.B, "main", 12, 24),
      ];

      if (stepIndex >= 1) {
        layers.push(drawCircle(this.points.A, radiusA));
      }
      if (stepIndex >= 2) {
        layers.push(drawCircle(this.points.B, radiusB));
        labels.push(drawPoint("C", this.points.C, stepIndex >= 3 ? "final" : "key", 12, -10));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(this.points.A, this.points.C, "line-final"));
        layers.push(drawSegment(this.points.B, this.points.C, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
  {
    name: "По двум сторонам и углу между ними (SAS)",
    button: "SAS",
    buttonText: "Известны две стороны и угол между ними.",
    lead: "Здесь треугольник строится из одной вершины: от нее сразу задаются одна сторона, вторая сторона и угол между ними.",
    idea: "Нужно отложить основание AB, построить при вершине A заданный угол и на его луче отметить точку C так, чтобы AC равнялся второй заданной стороне.",
    proof: "Основание AB уже задано, угол BAC построен, а точка C выбрана на расстоянии AC от A. Значит, треугольник определяется однозначно.",
    use: "Этот случай всегда разрешим, если длины сторон положительны и угол больше 0° и меньше 180°.",
    stepsCopy: "Одна сторона задает основание, угол определяет направление второй стороны, а окружность фиксирует ее длину.",
    points: {
      A: { x: -1.0, y: -0.55 },
      B: { x: 0.9, y: -0.55 },
      C: { x: 0.02, y: 0.87 },
    },
    steps: [
      {
        title: "Шаг 1. Отложи сторону AB",
        description: "Построй отрезок AB, равный первой заданной стороне.",
        note: "Этот отрезок станет основанием будущего треугольника.",
      },
      {
        title: "Шаг 2. Построй заданный угол при вершине A",
        description: "С помощью циркуля и линейки перенеси нужный угол при вершину A и проведи второй луч.",
        note: "На этом луче будет лежать точка C.",
      },
      {
        title: "Шаг 3. Отложи на луче длину AC",
        description: "С центром в A проведи окружность радиусом, равным второй заданной стороне AC. Ее пересечение с лучом даст точку C.",
        note: "Так фиксируется сразу и длина AC, и положение точки C.",
      },
      {
        title: "Шаг 4. Соедини точки C и B",
        description: "Получится треугольник ABC по двум сторонам и углу между ними.",
        note: "Этот способ задает треугольник однозначно.",
      },
    ],
    draw(stepIndex) {
      const angle = Math.atan2(this.points.C.y - this.points.A.y, this.points.C.x - this.points.A.x);
      const radius = distance(this.points.A, this.points.C);
      const rayEnd = { x: this.points.A.x + Math.cos(angle) * 2.2, y: this.points.A.y + Math.sin(angle) * 2.2 };
      const layers = [
        drawSegment(this.points.A, this.points.B, "line-main"),
      ];
      const labels = [
        drawPoint("A", this.points.A, "main", -20, 24),
        drawPoint("B", this.points.B, "main", 12, 24),
      ];

      if (stepIndex >= 1) {
        layers.push(drawSegment(this.points.A, rayEnd, "line-main", 'marker-end="url(#arrow)"'));
        layers.push(drawArc(this.points.A, 0.45, angle, 0));
      }
      if (stepIndex >= 2) {
        layers.push(drawCircle(this.points.A, radius));
        labels.push(drawPoint("C", this.points.C, stepIndex >= 3 ? "final" : "key", 12, -10));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(this.points.B, this.points.C, "line-final"));
        layers.push(drawSegment(this.points.A, this.points.C, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
  {
    name: "По стороне и двум прилежащим углам (ASA)",
    button: "ASA",
    buttonText: "Известна сторона и два прилежащих к ней угла.",
    lead: "В этом случае основание известно сразу, а третья вершина находится как точка пересечения двух лучей, построенных по данным углам.",
    idea: "Нужно построить сторону AB, затем при вершинах A и B отложить заданные прилежащие углы. Лучи пересекутся в точке C.",
    proof: "Сторона AB дана, а направления AC и BC однозначно задаются построенными углами. Значит, их пересечение и дает единственную вершину C.",
    use: "Сумма двух прилежащих углов должна быть меньше 180°, иначе лучи не образуют треугольник.",
    stepsCopy: "Основание уже известно, остается задать два направления к третьей вершине.",
    points: {
      A: { x: -1.05, y: -0.45 },
      B: { x: 1.0, y: -0.45 },
      C: { x: 0.08, y: 0.98 },
    },
    steps: [
      {
        title: "Шаг 1. Отложи сторону AB",
        description: "Построй отрезок AB, равный заданной стороне.",
        note: "Углы потом будут откладываться именно к этой стороне.",
      },
      {
        title: "Шаг 2. Построй угол при вершине A",
        description: "На одной стороне основания AB построй при вершине A заданный прилежащий угол.",
        note: "Луч из A направляет будущую сторону AC.",
      },
      {
        title: "Шаг 3. Построй угол при вершине B",
        description: "При вершине B построй второй заданный прилежащий угол. Лучи из A и B пересекутся в точке C.",
        note: "Если лучи параллельны или расходятся, такого треугольника нет.",
      },
      {
        title: "Шаг 4. Соедини вершину C с концами основания",
        description: "Получится треугольник ABC, построенный по стороне и двум прилежащим углам.",
        note: "Этот случай тоже задает фигуру однозначно.",
      },
    ],
    draw(stepIndex) {
      const angleA = Math.atan2(this.points.C.y - this.points.A.y, this.points.C.x - this.points.A.x);
      const angleB = Math.atan2(this.points.C.y - this.points.B.y, this.points.C.x - this.points.B.x);
      const rayA = { x: this.points.A.x + Math.cos(angleA) * 2.0, y: this.points.A.y + Math.sin(angleA) * 2.0 };
      const rayB = { x: this.points.B.x + Math.cos(angleB) * 2.0, y: this.points.B.y + Math.sin(angleB) * 2.0 };
      const layers = [
        drawSegment(this.points.A, this.points.B, "line-main"),
      ];
      const labels = [
        drawPoint("A", this.points.A, "main", -20, 24),
        drawPoint("B", this.points.B, "main", 12, 24),
      ];

      if (stepIndex >= 1) {
        layers.push(drawSegment(this.points.A, rayA, "line-main", 'marker-end="url(#arrow)"'));
        layers.push(drawArc(this.points.A, 0.45, angleA, 0));
      }
      if (stepIndex >= 2) {
        layers.push(drawSegment(this.points.B, rayB, "line-main", 'marker-end="url(#arrow)"'));
        layers.push(drawArc(this.points.B, 0.42, Math.PI, angleB));
        labels.push(drawPoint("C", this.points.C, stepIndex >= 3 ? "final" : "key", 12, -10));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(this.points.A, this.points.C, "line-final"));
        layers.push(drawSegment(this.points.B, this.points.C, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
];

function renderConstructionList() {
  refs.constructionList.innerHTML = constructions
    .map((construction, index) => `
      <button
        class="topic-switcher__button ${index === state.constructionIndex ? "is-active" : ""}"
        data-index="${index}"
        type="button"
      >
        <strong>${construction.button}</strong>
        <span>${construction.buttonText}</span>
      </button>
    `)
    .join("");

  refs.constructionList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      state.constructionIndex = Number(button.dataset.index);
      state.stepIndex = 0;
      render();
    });
  });
}

function renderStepsList(current) {
  refs.stepsList.innerHTML = current.steps
    .map((step, index) => `
      <li class="${index === state.stepIndex ? "is-active" : ""}" data-index="${index}" tabindex="0" aria-current="${index === state.stepIndex ? "step" : "false"}">
        <span class="steps__number">${index + 1}</span>
        <strong>${step.title}</strong>
        <p>${step.description}</p>
      </li>
    `)
    .join("");

  refs.stepsList.querySelectorAll("li").forEach((item) => {
    item.addEventListener("click", () => {
      state.stepIndex = Number(item.dataset.index);
      render();
    });
    item.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        state.stepIndex = Number(item.dataset.index);
        render();
      }
    });
  });
}

function render() {
  const current = constructions[state.constructionIndex];
  const step = current.steps[state.stepIndex];

  renderConstructionList();
  renderStepsList(current);

  refs.constructionName.textContent = current.name;
  refs.diagram.innerHTML = current.draw(state.stepIndex);
  refs.nextButton.disabled = state.stepIndex === current.steps.length - 1;
  refs.prevButton.disabled = state.stepIndex === 0;
  refs.progressBar.style.width = `${((state.stepIndex + 1) / current.steps.length) * 100}%`;
  refs.stepChip.textContent = `Шаг ${state.stepIndex + 1}`;
  refs.stepCounter.textContent = `${state.stepIndex + 1} / ${current.steps.length}`;
  refs.stepTitle.textContent = step.title;
  refs.stepDescription.textContent = step.description;
  refs.stepNote.textContent = step.note || "";
  refs.stepsCopy.textContent = current.stepsCopy;
  refs.summaryTitle.textContent = current.name;
  refs.summaryLead.textContent = current.lead;
  refs.summaryIdea.textContent = current.idea;
  refs.summaryProof.textContent = current.proof;
  refs.summaryUse.textContent = current.use;
}

function goToStep(nextIndex) {
  const current = constructions[state.constructionIndex];
  state.stepIndex = Math.max(0, Math.min(nextIndex, current.steps.length - 1));
  render();
}

refs.prevButton.addEventListener("click", () => goToStep(state.stepIndex - 1));
refs.nextButton.addEventListener("click", () => goToStep(state.stepIndex + 1));
refs.startButton.addEventListener("click", () => {
  state.constructionIndex = 0;
  state.stepIndex = 0;
  render();
  document.getElementById("viewer").scrollIntoView({ behavior: "smooth", block: "start" });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") goToStep(state.stepIndex - 1);
  if (event.key === "ArrowRight") goToStep(state.stepIndex + 1);
});

render();
