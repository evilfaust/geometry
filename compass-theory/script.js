const board = {
  width: 760,
  height: 560,
  origin: { x: 380, y: 300 },
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
  final: "#2f855a",
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

function normalizeAngle(angle) {
  let value = angle;
  while (value <= -Math.PI) value += Math.PI * 2;
  while (value > Math.PI) value -= Math.PI * 2;
  return value;
}

function arcPath(center, radius, startAngle, endAngle) {
  const delta = normalizeAngle(endAngle - startAngle);
  const segments = 24;
  const points = Array.from({ length: segments + 1 }, (_, index) => {
    const angle = startAngle + (delta * index) / segments;
    return toScreen({
      x: center.x + radius * Math.cos(angle),
      y: center.y + radius * Math.sin(angle),
    });
  });

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
}

function intersectCircles(centerA, radiusA, centerB, radiusB) {
  const dx = centerB.x - centerA.x;
  const dy = centerB.y - centerA.y;
  const distanceCenters = Math.hypot(dx, dy);
  const a = (radiusA ** 2 - radiusB ** 2 + distanceCenters ** 2) / (2 * distanceCenters);
  const h = Math.sqrt(Math.max(radiusA ** 2 - a ** 2, 0));
  const xm = centerA.x + (a * dx) / distanceCenters;
  const ym = centerA.y + (a * dy) / distanceCenters;
  const rx = (-dy * h) / distanceCenters;
  const ry = (dx * h) / distanceCenters;

  return [
    { x: xm + rx, y: ym + ry },
    { x: xm - rx, y: ym - ry },
  ];
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
        .line-final { stroke: ${palette.final}; stroke-width: 4; stroke-linecap: round; }
        .circle-main { fill: none; stroke: ${palette.accent}; stroke-width: 2.4; stroke-dasharray: 9 8; opacity: 0.92; }
        .circle-soft { fill: none; stroke: rgba(42, 111, 151, 0.55); stroke-width: 2.2; }
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
    name: "Отрезок на луче",
    button: "Равный отрезок",
    buttonText: "Отложить на луче отрезок, равный данному.",
    lead: "Учебник начинает с самой простой задачи: перенести длину данного отрезка на луч с заданным началом.",
    idea: "Нужно сохранить раствор циркуля, равный данному отрезку BC, и провести окружность с центром в начале луча A.",
    proof: "Если окружность с центром в A построена радиусом BC, то любая ее точка на луче находится от A на расстоянии BC. Значит, AD = BC.",
    use: "Это базовый прием для почти всех следующих построений: переносить длины без измерения линейкой.",
    stepsCopy: "Луч задает направление, а раствор циркуля переносит готовую длину без вычислений.",
    points: {
      A: { x: -1.5, y: -0.35 },
      R: { x: 1.75, y: -0.35 },
      B: { x: -0.4, y: 1.0 },
      C: { x: 0.65, y: 1.0 },
      D: { x: -0.45, y: -0.35 },
    },
    steps: [
      {
        title: "Шаг 1. Даны луч и отрезок",
        description: "На чертеже есть луч с началом A и отрезок BC. Нужно получить на луче точку D так, чтобы AD был равен BC.",
        note: "Линейка здесь нужна только для проведения прямой. Длину переносит циркуль.",
      },
      {
        title: "Шаг 2. Возьми раствор циркуля по отрезку BC",
        description: "Поставь иглы циркуля в точки B и C. Этот раствор и есть длина, которую нужно перенести на луч.",
        note: "Раствор менять нельзя, пока не будет отмечена новая точка на луче.",
      },
      {
        title: "Шаг 3. Проведи окружность с центром в A",
        description: "С тем же раствором поставь иглу в A и проведи окружность. Она пересечет луч в точке D.",
        note: "Точка пересечения окружности с лучом автоматически оказывается на нужном расстоянии от A.",
      },
      {
        title: "Шаг 4. Получился искомый отрезок AD",
        description: "Отрезок AD равен данному отрезку BC, потому что оба являются радиусами окружностей, построенных одним и тем же раствором циркуля.",
        note: "Это и есть готовое построение.",
      },
    ],
    draw(stepIndex) {
      const { A, R, B, C, D } = this.points;
      const radius = distance(B, C);
      const layers = [
        drawSegment(A, R, "line-main", 'marker-end="url(#arrow)"'),
        drawSegment(B, C, "line-main"),
      ];
      const labels = [
        drawPoint("A", A, "main", -20, 24),
        drawPoint("B", B, "key", -22, -10),
        drawPoint("C", C, "key", 12, -10),
      ];

      if (stepIndex >= 1) {
        layers.push(drawCircle(B, radius, "circle-soft"));
      }
      if (stepIndex >= 2) {
        layers.push(drawCircle(A, radius, "circle-main"));
        labels.push(drawPoint("D", D, stepIndex >= 3 ? "final" : "key", 12, 24));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(A, D, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
  {
    name: "Равный угол",
    button: "Перенос угла",
    buttonText: "Построить угол, равный данному.",
    lead: "Чтобы перенести угол в другую точку, учебник использует одинаковые дуги и перенос хорды между их точками пересечения.",
    idea: "Сначала на обоих углах строятся дуги одинакового радиуса. Потом на новой дуге откладывается хорда, равная отрезку между точками на исходном угле.",
    proof: "Одинаковый радиус дает одинаковые дуги, а равная хорда определяет тот же центральный размах. Значит, новый угол равен данному.",
    use: "Этот прием нужен для построения треугольников по элементам и для переноса углов на новые места чертежа.",
    stepsCopy: "Важны две вещи: одинаковый радиус дуг и точный перенос хорды между точками на дуге.",
    points: {
      K: { x: -1.35, y: -0.1 },
      M: { x: -0.2, y: -0.1 },
      N: { x: -0.72, y: 0.95 },
      A: { x: 0.5, y: -0.45 },
      B: { x: 1.75, y: -0.45 },
    },
    steps: [
      {
        title: "Шаг 1. Дан угол K и новый луч с началом A",
        description: "Слева задан угол с вершиной K, а справа подготовлен луч AB. Нужно построить при вершине A угол, равный исходному.",
        note: "Луч AB будет одной стороной нового угла.",
      },
      {
        title: "Шаг 2. Проведи дугу из вершины K",
        description: "Возьми удобный раствор циркуля и опиши дугу с центром в K. Она пересечет стороны угла в точках P и Q.",
        note: "Пока не важно, какой радиус выбран. Важно потом повторить его без изменения.",
      },
      {
        title: "Шаг 3. Повтори такую же дугу из точки A",
        description: "С тем же радиусом проведи дугу с центром в A. Она пересечет луч AB в точке C. Затем от точки C на новой дуге отложи хорду, равную PQ, и получи точку E.",
        note: "Именно перенос хорды PQ задает величину нового угла.",
      },
      {
        title: "Шаг 4. Соедини A и E",
        description: "Вторая сторона нового угла проходит через точку E. Угол EAB равен исходному углу при вершине K.",
        note: "Так строят угол, равный данному, без измерения транспортиром.",
      },
    ],
    draw(stepIndex) {
      const angle = Math.atan2(this.points.N.y - this.points.K.y, this.points.N.x - this.points.K.x);
      const radius = 0.86;
      const pointOnRay = (origin, direction, len) => ({
        x: origin.x + Math.cos(direction) * len,
        y: origin.y + Math.sin(direction) * len,
      });
      const P = pointOnRay(this.points.K, 0, radius);
      const Q = pointOnRay(this.points.K, angle, radius);
      const C = pointOnRay(this.points.A, 0, radius);
      const E = pointOnRay(this.points.A, angle, radius);
      const chord = distance(P, Q);
      const layers = [
        drawSegment(this.points.K, this.points.M, "line-main"),
        drawSegment(this.points.K, this.points.N, "line-main"),
        drawSegment(this.points.A, this.points.B, "line-main", 'marker-end="url(#arrow)"'),
      ];
      const labels = [
        drawPoint("K", this.points.K, "main", -22, 24),
        drawPoint("A", this.points.A, "main", -20, 24),
      ];

      if (stepIndex >= 1) {
        layers.push(drawArc(this.points.K, radius, 0, angle));
        labels.push(drawPoint("P", P, "key", 12, 24));
        labels.push(drawPoint("Q", Q, "key", -22, -10));
      }
      if (stepIndex >= 2) {
        layers.push(drawArc(this.points.A, radius, 0, angle, "arc-main"));
        layers.push(drawCircle(C, chord, "circle-soft"));
        labels.push(drawPoint("C", C, "key", 12, 24));
        labels.push(drawPoint("E", E, stepIndex >= 3 ? "final" : "key", 12, -10));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(this.points.A, E, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
  {
    name: "Биссектриса угла",
    button: "Биссектриса",
    buttonText: "Разделить угол пополам.",
    lead: "Для биссектрисы сначала отмечают на сторонах угла две точки на одинаковом расстоянии от вершины, а потом строят равнобедренный треугольник.",
    idea: "Точки P и Q получаются одной дугой из вершины угла, поэтому OP = OQ. Дальше окружности с центрами P и Q находят точку R, равноудаленную от обеих сторон.",
    proof: "Треугольники OPR и OQR равны по трем сторонам, поэтому угол POR равен углу ROQ. Значит, OR — биссектриса.",
    use: "Биссектриса нужна и сама по себе, и как вспомогательная линия в задачах на равнобедренные треугольники и вписанные фигуры.",
    stepsCopy: "Ключевая идея: из вершины получить две равные стороны, а затем найти точку, одинаково удаленную от концов этих сторон.",
    points: {
      O: { x: -0.3, y: -0.15 },
      A: { x: -1.45, y: -0.15 },
      B: { x: 0.9, y: 0.95 },
    },
    steps: [
      {
        title: "Шаг 1. Дан угол AOB",
        description: "Нужно разделить угол AOB на две равные части.",
        note: "Точка O — вершина угла, именно из нее начинаются все построения.",
      },
      {
        title: "Шаг 2. Проведи дугу из вершины O",
        description: "С центром в O и произвольным радиусом проведи дугу, которая пересечет стороны угла в точках P и Q.",
        note: "После этого на сторонах угла появятся две точки, одинаково удаленные от O.",
      },
      {
        title: "Шаг 3. Из точек P и Q проведи дуги равного радиуса",
        description: "Не меняя раствор циркуля, проведи две дуги с центрами в P и Q. Пусть они пересекутся в точке R внутри угла.",
        note: "Точка R выбрана так, что она одинаково удалена от P и Q.",
      },
      {
        title: "Шаг 4. Соедини O и R",
        description: "Луч OR делит угол пополам. Это и есть биссектриса данного угла.",
        note: "На чертеже хорошо видно, что биссектриса проходит через точку пересечения вспомогательных дуг.",
      },
    ],
    draw(stepIndex) {
      const radius = 0.85;
      const angle = Math.atan2(this.points.B.y - this.points.O.y, this.points.B.x - this.points.O.x);
      const P = { x: this.points.O.x - radius, y: this.points.O.y };
      const Q = {
        x: this.points.O.x + Math.cos(angle) * radius,
        y: this.points.O.y + Math.sin(angle) * radius,
      };
      const auxRadius = 1;
      const [topPoint] = intersectCircles(P, auxRadius, Q, auxRadius)
        .sort((pointA, pointB) => pointB.y - pointA.y);
      const angleFromPToR = Math.atan2(topPoint.y - P.y, topPoint.x - P.x);
      const angleFromQToR = Math.atan2(topPoint.y - Q.y, topPoint.x - Q.x);
      const layers = [
        drawSegment(this.points.O, this.points.A, "line-main"),
        drawSegment(this.points.O, this.points.B, "line-main"),
      ];
      const labels = [
        drawPoint("O", this.points.O, "main", -22, 24),
      ];

      if (stepIndex >= 1) {
        layers.push(drawArc(this.points.O, radius, Math.PI, angle));
        labels.push(drawPoint("P", P, "key", -22, 24));
        labels.push(drawPoint("Q", Q, "key", 12, -10));
      }
      if (stepIndex >= 2) {
        layers.push(drawArc(P, auxRadius, angleFromPToR - 0.8, angleFromPToR + 0.28));
        layers.push(drawArc(Q, auxRadius, angleFromQToR - 0.2, angleFromQToR + 0.85));
        labels.push(drawPoint("R", topPoint, stepIndex >= 3 ? "final" : "key", 12, -10));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(this.points.O, topPoint, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
  {
    name: "Перпендикуляр через точку",
    button: "Перпендикуляр",
    buttonText: "Провести через точку прямую, перпендикулярную данной.",
    lead: "Классическое построение строит на данной прямой две симметричные точки, а потом соединяет данную точку с пересечением вспомогательных дуг.",
    idea: "Сначала точка A отмечает на прямой две точки B и C на одинаковом расстоянии. Потом из B и C строятся пересекающиеся дуги.",
    proof: "Треугольник BDC равнобедренный, а AD проходит через вершину и середину основания BC. Значит, AD — высота, то есть перпендикуляр к прямой BC.",
    use: "Так проводят перпендикуляр к прямой через уже заданную точку, например при построении высот и осей симметрии.",
    stepsCopy: "Нужно получить на прямой две точки, равноудаленные от данной точки, а затем найти точку пересечения вспомогательных дуг.",
    points: {
      L1: { x: -1.8, y: 0 },
      L2: { x: 1.8, y: 0 },
      A: { x: 0, y: 0.92 },
      B: { x: -0.7, y: 0 },
      C: { x: 0.7, y: 0 },
      D: { x: 0, y: -0.78 },
    },
    steps: [
      {
        title: "Шаг 1. Даны прямая и точка A вне ее",
        description: "Нужно провести через точку A прямую, перпендикулярную данной прямой.",
        note: "Точка A не лежит на прямой, поэтому сначала нужно найти на прямой удобные опорные точки.",
      },
      {
        title: "Шаг 2. Окружность с центром в A отметит точки B и C",
        description: "Проведи окружность с центром в A так, чтобы она пересекла данную прямую в точках B и C.",
        note: "По построению AB = AC, поэтому B и C симметричны относительно будущего перпендикуляра.",
      },
      {
        title: "Шаг 3. Из B и C проведи дуги одинакового радиуса",
        description: "Возьми радиус больше половины BC и проведи дуги с центрами в B и C. Пусть они пересекутся в точке D.",
        note: "Точка D лежит под прямой, но можно было бы взять и верхнее пересечение.",
      },
      {
        title: "Шаг 4. Соедини A и D",
        description: "Прямая AD и есть искомый перпендикуляр к данной прямой.",
        note: "Получилась линия, которая делит основание BC пополам и пересекает его под прямым углом.",
      },
    ],
    draw(stepIndex) {
      const radius = distance(this.points.A, this.points.B);
      const auxRadius = distance(this.points.B, this.points.D);
      const layers = [
        drawSegment(this.points.L1, this.points.L2, "line-main"),
        drawPoint("A", this.points.A, "main", 12, -10),
      ];
      const labels = [];

      if (stepIndex >= 1) {
        layers.push(drawCircle(this.points.A, radius, "circle-main"));
        labels.push(drawPoint("B", this.points.B, "key", -22, 24));
        labels.push(drawPoint("C", this.points.C, "key", 12, 24));
      }
      if (stepIndex >= 2) {
        layers.push(drawCircle(this.points.B, auxRadius, "circle-soft"));
        layers.push(drawCircle(this.points.C, auxRadius, "circle-soft"));
        labels.push(drawPoint("D", this.points.D, stepIndex >= 3 ? "final" : "key", 12, 24));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(this.points.A, this.points.D, "line-final"));
      }

      return makeSvg(this.steps[stepIndex].title, layers, labels);
    },
  },
  {
    name: "Серединный перпендикуляр",
    button: "Серединный перпендикуляр",
    buttonText: "Построить серединный перпендикуляр к отрезку.",
    lead: "Эта конструкция сразу решает две задачи: находит середину отрезка и проводит через нее перпендикуляр.",
    idea: "Из концов отрезка A и B строятся окружности равного радиуса. Их точки пересечения P и Q одинаково удалены от A и B.",
    proof: "Линия PQ состоит из точек, равноудаленных от A и B. Поэтому она проходит через середину AB и перпендикулярна этому отрезку.",
    use: "Серединный перпендикуляр нужен при поиске центра окружности, построении осей симметрии и равных треугольников.",
    stepsCopy: "Две окружности одинакового радиуса дают две точки, из которых одинаково видны концы отрезка.",
    points: {
      A: { x: -0.95, y: 0 },
      B: { x: 0.95, y: 0 },
      P: { x: 0, y: 0.92 },
      Q: { x: 0, y: -0.92 },
      M: { x: 0, y: 0 },
    },
    steps: [
      {
        title: "Шаг 1. Дан отрезок AB",
        description: "Нужно построить прямую, которая проходит через середину отрезка AB и перпендикулярна ему.",
        note: "Иначе говоря, надо одновременно найти середину и провести к отрезку прямой угол.",
      },
      {
        title: "Шаг 2. Из точек A и B проведи окружности равного радиуса",
        description: "Выбери радиус больше половины AB и построй две окружности с центрами в A и B.",
        note: "Тогда окружности пересекутся в двух точках по разные стороны от отрезка.",
      },
      {
        title: "Шаг 3. Отметь точки пересечения P и Q",
        description: "Окружности пересекутся в точках P и Q. Обе эти точки равноудалены от A и B.",
        note: "Именно поэтому линия через P и Q будет особенной для отрезка AB.",
      },
      {
        title: "Шаг 4. Проведи прямую PQ",
        description: "Прямая PQ — это серединный перпендикуляр к отрезку AB. Она пересечет AB в его середине M.",
        note: "На чертеже видно, что середина появляется как точка пересечения двух главных линий.",
      },
    ],
    draw(stepIndex) {
      const radius = distance(this.points.A, this.points.P);
      const top = { x: 0, y: 1.45 };
      const bottom = { x: 0, y: -1.45 };
      const layers = [
        drawSegment(this.points.A, this.points.B, "line-main"),
      ];
      const labels = [
        drawPoint("A", this.points.A, "main", -22, 24),
        drawPoint("B", this.points.B, "main", 12, 24),
      ];

      if (stepIndex >= 1) {
        layers.push(drawCircle(this.points.A, radius, "circle-main"));
        layers.push(drawCircle(this.points.B, radius, "circle-main"));
      }
      if (stepIndex >= 2) {
        labels.push(drawPoint("P", this.points.P, "key", 12, -10));
        labels.push(drawPoint("Q", this.points.Q, "key", 12, 24));
      }
      if (stepIndex >= 3) {
        layers.push(drawSegment(bottom, top, "line-final"));
        labels.push(drawPoint("M", this.points.M, "final", 12, -10));
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
