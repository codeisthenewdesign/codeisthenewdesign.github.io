// First Release: 큰 화면 속 강조(.pv2-mk)에서 확대 화면([data-t])까지, 화면에서 설명(.pv2-co[data-c])까지 점선을 그림
// 선은 일자이거나 90도로 한 번만 꺾임
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const small = matchMedia("(max-width: 900px)");
  const rel = (el, S) => { const R = el.getBoundingClientRect(); return { l: R.left - S.left, r: R.right - S.left, t: R.top - S.top, b: R.bottom - S.top }; };
  // 설명과 이어지는 높이: 키 큰 강조는 윗부분에서 나감
  // data-ay가 있으면 강조 안의 그 높이에서 선이 나감 (화면 속 글자를 피할 때)
  const anc = (T, el) => el && el.dataset.ay ? T.t + (T.b - T.t) * +el.dataset.ay : Math.min((T.t + T.b) / 2, T.t + 20);
  // 설명 안에서 번호 줄의 가운데 높이 (위에 솔루션 칩이 있으면 그만큼 내려감)
  const bo = c => { const b = c.querySelector('b'); return (b ? b.offsetTop : 0) + 11; };

  // a에서 b까지: 같은 줄이면 일자, 아니면 first 방향으로 간 뒤 한 번 꺾음
  function path(a, b, first) {
    // 몇 px 차이는 일자로 맞춤
    if (Math.abs(a.y - b.y) < 4) return `M${a.x},${a.y} H${b.x}`;
    if (Math.abs(a.x - b.x) < 4) return `M${a.x},${a.y} V${b.y}`;
    return first === "h" ? `M${a.x},${a.y} H${b.x} V${b.y}` : `M${a.x},${a.y} V${b.y} H${b.x}`;
  }

  // 설명을 짝이 되는 화면 옆에 놓음: r/l은 바깥 여백에서 높이만 맞추고, in은 확대 화면 왼쪽에 카드로
  function place(sec) {
    const stage = sec.querySelector(".px-stage"), caps = [...sec.querySelectorAll(".px-cap .pv2-co")];
    caps.forEach(c => { c.style.top = ""; c.style.left = ""; });
    if (stage) stage.style.minHeight = "";
    if (!stage || small.matches) return [];
    const mode = sec.dataset.cap, S = stage.getBoundingClientRect(), gap = mode === "in" ? 12 : 22;
    let H = S.height;
    const items = caps.map(c => {
      const k = c.dataset.c;
      const tg = stage.querySelector(`.pv2-pop[data-t="${k}"]`) || stage.querySelector(`.pv2-mk[data-k="${k}"]`);
      if (!tg) return null;
      const T = rel(tg, S);
      return { c, tg, h: c.offsetHeight, T, want: mode === "in" ? T.t : (tg.dataset.out === "top" ? (tg.dataset.up ? H * +tg.dataset.up : T.t - 14) : tg.dataset.out === "bottom" ? T.b + 18 : anc(T, tg)) - bo(c) };
    }).filter(Boolean).sort((a, b) => a.want - b.want);
    // 설명이 화면보다 길면 무대를 늘려 겹치지 않게 함
    const total = items.reduce((a, it) => a + it.h, 0) + gap * Math.max(0, items.length - 1) + 24;
    if (mode !== "in" && total > H) { stage.style.minHeight = total + "px"; H = total; }
    // 위에서부터 겹치지 않게 내리고, 아래로 넘치면 다시 위로 밀어 올림
    // data-stack이 있으면 설명을 무대 그 높이부터 위에서 차례로 쌓음 (선은 꺾여서 번호로)
    let floor = sec.dataset.stack ? H * +sec.dataset.stack : 0;
    // 쌓는 카드라도 data-out="straight"인 설명은 강조 높이에 맞춰 일자로 나가게 둠
    items.forEach(it => { it.top = sec.dataset.stack && it.tg.dataset.out !== "straight" ? floor : Math.max(floor, it.want); floor = it.top + it.h + gap; });
    // 아래로 넘치면 위로 밀지 않고 무대를 늘림 (선이 강조와 같은 높이에서 곧게 나가도록)
    const last = items[items.length - 1];
    if (last && mode !== "in" && last.top + last.h + 24 > H) { H = last.top + last.h + 24; stage.style.minHeight = H + "px"; }
    let ceil = H - 24;
    for (let i = items.length - 1; i >= 0; i--) { const it = items[i]; it.top = Math.max(0, Math.min(it.top, ceil - it.h)); ceil = it.top - gap; }
    items.forEach(it => {
      it.c.style.top = it.top + "px";
      if (mode === "in") it.c.style.left = Math.max(0, it.T.l - 20 - it.c.offsetWidth) + "px";
    });
    return items;
  }

  function draw(sec) {
    let svg = sec.querySelector(":scope > svg.pv2-lines");
    if (!svg) { svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "pv2-lines"); svg.setAttribute("aria-hidden", "true"); sec.appendChild(svg); }
    svg.innerHTML = "";
    if (!sec.offsetParent) return;
    const pairs = sec.classList.contains("px") ? place(sec) : [];
    const S = sec.getBoundingClientRect();
    svg.setAttribute("width", S.width); svg.setAttribute("height", S.height);
    if (S.width < 760 || small.matches) return;
    // 점은 선이 시작하는 강조 테두리 위에 걸쳐 둠: 화면에서 파생되어 나오는 느낌
    const add = (d) => {
      const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); svg.appendChild(p);
      const [x, y] = d.slice(1).split(/[ LHV]/)[0].split(",").map(Number);
      const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 4); svg.appendChild(c);
    };

    // 강조 → 확대 화면
    sec.querySelectorAll(".pv2-mk[data-line]").forEach(m => {
      const t = sec.querySelector(`.pv2-pop[data-t="${m.dataset.k}"]`);
      if (!t) return;
      const f = rel(m, S), g = rel(t, S), fx = (f.l + f.r) / 2, fy = (f.t + f.b) / 2;
      if (g.t > f.b) {
        // 아래에 있음: 가로로 겹치면 수직 일자, 아니면 옆으로 나가 아래로 한 번 꺾음
        const ol = Math.max(f.l, g.l), or = Math.min(f.r, g.r);
        if (or - ol > 8) { const x = (ol + or) / 2, e = { x, y: g.t }; return add(path({ x, y: f.b }, e), e); }
        const right = g.l > fx, e = { x: right ? g.l + 32 : g.r - 32, y: g.t };
        return add(path({ x: right ? f.r : f.l, y: fy }, e, "h"), e);
      }
      // 옆에 있음: 세로로 겹치면 수평 일자, 아니면 위아래로 나가 옆으로 한 번 꺾음
      const ot = Math.max(f.t, g.t), ob = Math.min(f.b, g.b), right = g.l > f.r;
      if (ob - ot > 6) { const y = (ot + ob) / 2, e = { x: right ? g.l : g.r, y }; return add(path({ x: right ? f.r : f.l, y }, e), e); }
      const down = g.t > fy, e = { x: right ? g.l : g.r, y: down ? g.t + 28 : g.b - 28 };
      add(path({ x: fx, y: down ? f.b : f.t }, e, "v"), e);
    });

    // 강조 → 화면 아래 긴 설명: 세로 일자로 내려감
    sec.querySelectorAll(".px-note .pv2-co[data-n]").forEach(c => {
      const m = sec.querySelector(`.pv2-mk[data-k="${c.dataset.n}"]`);
      if (!m) return;
      // 번호 동그라미까지 이어짐: 바로 위면 세로 일자, 아니면 내려와서 한 번 꺾어 번호 옆에 닿음
      const f = rel(m, S), B = rel(c.querySelector("b i") || c, S), bx = (B.l + B.r) / 2, by = (B.t + B.b) / 2;
      if (bx > f.l + 6 && bx < f.r - 6) { const e = { x: bx, y: B.t }; add(path({ x: bx, y: f.b }, e)); return; }
      // 번호가 강조보다 바깥쪽이면 강조 옆면에서 가로로 나와 번호 위로 꺾여 내려감 (화면 속 글자 위를 지나지 않게)
      const e = { x: bx, y: B.t }, fy = (f.t + f.b) / 2;
      add(path({ x: bx < f.l ? f.l : f.r, y: fy }, e, "h"));
    });
    // 화면 → 설명
    const mode = sec.dataset.cap;
    // data-stack: 설명을 위에 쌓은 카드는 화면과 설명 사이 통로에 줄마다 다른 세로 길을 두고 두 번 꺾어 번호로 감
    if (sec.dataset.stack && mode === "r") {
      const scr = rel(sec.querySelector(".px-scr"), S), capL = Math.min(...pairs.map(p => rel(p.c, S).l));
      const order = pairs.slice().sort((a, b) => rel(a.c, S).t - rel(b.c, S).t);
      order.forEach((p, i) => {
        const T = rel(p.tg, S), B = rel(p.c.querySelector("b i") || p.c, S), cy = (B.t + B.b) / 2, sy = anc(T, p.tg);
        const lx = scr.r + (capL - scr.r) * (i + 1) / (order.length + 1), out = p.tg.dataset.out;
        if (out === "top") { const x = T.l + (T.r - T.l) * (+p.tg.dataset.ax || .5); return add(`M${x},${T.t} V${cy} H${B.l}`); }
        if (out === "straight" || Math.abs(sy - cy) < 4) return add(`M${T.r},${cy} H${B.l}`);
        add(`M${T.r},${sy} H${lx} V${cy} H${B.l}`);
      });
      return;
    }
    pairs.forEach(({ c, tg }) => {
      const T = rel(tg, S), B = rel(c.querySelector("b i") || c, S), cy = (B.t + B.b) / 2;
      const toLeft = mode !== "r";               // 설명이 화면 왼쪽에 있음
      // 선은 설명의 번호 동그라미 가장자리까지 닿음
      const e = { x: toLeft ? B.r : B.l, y: cy };
      // data-out="top": 강조 윗변의 data-ax 지점에서 위로 나가 한 번 꺾어 번호로
      if (tg.dataset.out === "top" || tg.dataset.out === "bottom") { const x = T.l + (T.r - T.l) * (+tg.dataset.ax || .5); return add(path({ x, y: tg.dataset.out === "top" ? T.t : T.b }, e, "v")); }
      if (cy > T.t + 2 && cy < T.b - 2) return add(path({ x: toLeft ? T.l : T.r, y: cy }, e), e);
      // 높이가 안 맞으면 강조 옆면에서 가로로 나와 번호 바로 아래(또는 위)에서 꺾어 번호에 닿음: 화면 속 글자를 세로로 지나지 않게
      const sy = anc(T, tg), bx = (B.l + B.r) / 2, end = { x: bx, y: cy < sy ? B.b : B.t };
      add(path({ x: toLeft ? T.l : T.r, y: sy }, end, "h"));
    });
  }
  function all() { document.querySelectorAll(".pv2").forEach(draw); }
  window.addEventListener("load", all);
  window.addEventListener("resize", () => requestAnimationFrame(all));
  addEventListener("langchange", () => setTimeout(all, 50));
  document.querySelectorAll(".pv2 img").forEach(i => i.addEventListener("load", () => requestAnimationFrame(all)));
  if (document.fonts) document.fonts.ready.then(all);
  setTimeout(all, 300);
})();
