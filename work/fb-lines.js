// 기능 흐름 보드(.fb): 앞 단계 화면의 한 점에서 다음 단계 화면까지 점선을 그림
// 점은 도착 쪽(다음 단계 화면)에만 찍어 흐름 방향을 보여 줌
// data-to: 이어질 대상(.fb-s의 클래스 이름 또는 mk = 강조 표시), data-from: 출발점(대상 상자 안 비율 x,y), data-at: 도착 높이 비율
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const small = matchMedia("(max-width: 900px)");
  const rel = (el, S) => { const R = el.getBoundingClientRect(); return { l: R.left - S.left, r: R.right - S.left, t: R.top - S.top, b: R.bottom - S.top, w: R.width, h: R.height }; };

  function draw(sec) {
    let svg = sec.querySelector(":scope > svg.fb-lines");
    if (!svg) { svg = document.createElementNS(NS, "svg"); svg.setAttribute("class", "fb-lines"); svg.setAttribute("aria-hidden", "true"); sec.appendChild(svg); }
    svg.innerHTML = "";
    if (!sec.offsetParent || small.matches) return;
    const S = sec.getBoundingClientRect();
    svg.setAttribute("width", S.width); svg.setAttribute("height", S.height);

    // 강조 표시: 화면 이미지 위 비율 위치에 둠
    sec.querySelectorAll(".fb-mk[data-on]").forEach(m => {
      const img = sec.querySelector(`.fb-s.${m.dataset.on} .fb-f img`);
      if (!img) return;
      const I = rel(img, S), [x, y, w, h] = m.dataset.box.split(",").map(Number);
      Object.assign(m.style, { left: I.l + I.w * x - 5 + "px", top: I.t + I.h * y - 5 + "px", width: I.w * w + 10 + "px", height: I.h * h + 10 + "px" });
    });

    const add = (d, x, y) => {
      const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); svg.appendChild(p);
      const c = document.createElementNS(NS, "circle"); c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 4); svg.appendChild(c);
    };
    sec.querySelectorAll("[data-to]").forEach(src => {
      const box = src.querySelector(".fb-f img") || src;
      const tgt = src.dataset.to === "mk" ? sec.querySelector(".fb-mk") : sec.querySelector(`.fb-s.${src.dataset.to} .fb-f`);
      if (!tgt) return;
      const A = rel(box, S), T = rel(tgt, S);
      const [fx, fy] = (src.dataset.from || "1,0.5").split(",").map(Number), at = +(src.dataset.at || 0.5);
      // data-dir="down": 아래 화면으로 — 출발 화면 아래 변에서 내려가 가운데 높이에서 꺾고 도착 화면 윗변으로
      if (src.dataset.dir === "down") {
        const [dx] = (src.dataset.from || "0.5,1").split(",").map(Number), at = +(src.dataset.at || 0.5);
        // 화면 아래 설명 카드까지 지나서 나가도록 출발 높이는 figure 아래 변
        const F = rel(src, S), sx = A.l + A.w * dx, sy = F.b, ex = T.l + T.w * at, ey = T.t, my = (sy + ey) / 2;
        return add(Math.abs(sx - ex) < 3 ? `M${sx},${sy} V${ey}` : `M${sx},${sy} V${my} H${ex} V${ey}`, ex, ey);
      }
      const right = T.l >= A.r - 2;
      const sx = A.l + A.w * fx, sy = A.t + A.h * fy;
      const ex = right ? T.l : T.r, ey = T.t + T.h * at;
      // 출발점에서 가로로 나와 두 상자 사이 가운데에서 꺾어 도착 높이로, 다시 가로로 도착
      const mx = right ? (Math.max(sx, A.r) + T.l) / 2 : (Math.min(sx, A.l) + T.r) / 2;
      add(Math.abs(sy - ey) < 3 ? `M${sx},${sy} H${ex}` : `M${sx},${sy} H${mx} V${ey} H${ex}`, ex, ey);
    });
  }
  function all() { document.querySelectorAll(".fb").forEach(draw); }
  addEventListener("load", all);
  addEventListener("resize", () => requestAnimationFrame(all));
  addEventListener("langchange", () => setTimeout(all, 50));
  document.querySelectorAll(".fb img").forEach(i => i.addEventListener("load", () => requestAnimationFrame(all)));
  if (document.fonts) document.fonts.ready.then(all);
  setTimeout(all, 300);
})();
