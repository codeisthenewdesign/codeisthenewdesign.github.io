// 예시 영상: 화면에 보일 때만 재생, 소리는 한 번에 한 편만 켬
(function () {
  const vids = [...document.querySelectorAll(".sn-ph video")];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting && e.target.offsetParent) e.target.play().catch(() => {});
    else e.target.pause();
  }), { threshold: 0.4 });
  vids.forEach(v => io.observe(v));
  document.querySelectorAll(".sn-snd").forEach(b => b.addEventListener("click", () => {
    const v = b.parentElement.querySelector("video"), on = v.muted;
    document.querySelectorAll(".sn-snd").forEach(o => { o.setAttribute("aria-pressed", "false"); o.parentElement.querySelector("video").muted = true; });
    if (on) { v.muted = false; b.setAttribute("aria-pressed", "true"); v.play().catch(() => {}); }
  }));

  // 공정도: 창이 좁으면 옆으로 넘기지 않게 도표째 줄임 (휴대폰은 세로 배치라 그대로)
  const DESIGN = 860;
  const fitPath = () => document.querySelectorAll(".sn-path").forEach(p => {
    const wrap = p.parentElement, cs = getComputedStyle(wrap);
    const w = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (!wrap.offsetParent || innerWidth <= 640 || w >= DESIGN) { p.style.zoom = ""; p.style.width = ""; return; }
    p.style.width = DESIGN + "px";
    p.style.zoom = (w / DESIGN).toFixed(3);
  });

  // 공정도의 선: 칸 위치를 재서 SVG 하나로 그림
  const drawWire = p => {
    const svg = p.querySelector(".wire svg");
    if (!svg || !p.offsetParent || innerWidth <= 640) return;
    const P = p.getBoundingClientRect(), z = parseFloat(p.style.zoom) || 1;
    const box = el => { const r = el.getBoundingClientRect(); return { l: (r.left - P.left) / z, r: (r.right - P.left) / z, t: (r.top - P.top) / z }; };
    const st = [...p.querySelectorAll(".st")].map(box);
    if (st.length < 8) return;
    const Y = parseFloat(getComputedStyle(p).getPropertyValue("--y")), gap = st[1].l - st[0].r;
    const y = s => Math.round(s.t + Y) + .5, xl = st[0].l, xr = st[2].r;
    let solid = "", dash = "";
    const seg = (a, b, yy, head) => {  // a에서 b로: 앞 절반 점선, 뒤 절반 실선
      const m = (a + b) / 2, d = b > a ? 1 : -1;
      dash += `M${a} ${yy}H${m}`;
      solid += `M${m} ${yy}H${b}`;
      if (head) solid += `M${b - 6 * d} ${yy - 4}L${b} ${yy}L${b - 6 * d} ${yy + 4}`;
    };
    const y1 = y(st[0]), y2 = y(st[3]), y3 = y(st[5]);
    seg(st[0].l, st[0].r + gap, y1, true);
    seg(st[1].l, st[1].r + gap, y1, true);
    seg(st[2].l, xr, y1, false);
    solid += `M${xr} ${y1}A${P.right / z - P.left / z - xr} ${(y2 - y1) / 2} 0 0 1 ${xr} ${y2}`;
    seg(xr, st[3].l - gap, y2, true);
    seg(st[4].r, st[4].l - gap, y2, true);
    solid += `M${st[4].l - gap} ${y2}H${xl}A${xl} ${(y3 - y2) / 2} 0 0 0 ${xl} ${y3}`;
    seg(xl, st[5].r + gap, y3, true);
    seg(st[6].l, st[7].l, y3, true);
    svg.innerHTML = `<path class="dash" d="${dash}"/><path d="${solid}"/>`;
  };
  // 기능 화면: 화면의 지점에서 상세 설명까지 선을 그음
  const drawCallouts = fw => {
    const svg = fw.querySelector(".wires"), img = fw.querySelector(".scr img");
    if (!svg || !fw.offsetParent || innerWidth <= 900 || !img.naturalWidth) return;
    const F = fw.getBoundingClientRect(), I = img.getBoundingClientRect();
    let out = "";
    fw.querySelectorAll(".co").forEach(co => {
      const [ax, ay, drop] = co.dataset.at.split(",").map(Number), C = co.getBoundingClientRect();
      const sx = I.left - F.left + I.width * ax, sy = I.top - F.top + I.height * ay;
      const right = C.left - F.left > sx, ex = right ? C.left - F.left - 8 : C.right - F.left + 8;
      const ey = C.top - F.top + 22, edge = right ? I.right - F.left + 6 : I.left - F.left - 6, mx = (edge + ex) / 2;
      // drop: 다른 내용을 가로지르지 않게 먼저 아래로 내려감
      const start = drop ? `M${sx} ${sy}V${sy + drop}` : `M${sx} ${sy}`;
      out += `<path d="${start}H${mx}V${ey}H${ex}"/><circle cx="${sx}" cy="${sy}" r="4"/><circle cx="${ex}" cy="${ey}" r="3"/>`;
    });
    svg.innerHTML = out;
  };
  const layout = () => { fitPath(); document.querySelectorAll(".sn-path").forEach(drawWire); document.querySelectorAll(".sn-fn .fw").forEach(drawCallouts); };
  document.querySelectorAll(".sn-fn img").forEach(i => i.addEventListener("load", () => requestAnimationFrame(layout)));
  layout();
  addEventListener("load", layout);
  addEventListener("resize", layout);
  addEventListener("langchange", () => setTimeout(layout, 50));
  if (document.fonts) document.fonts.ready.then(layout);
})();
