// 피그마 멀티플레이어 커서처럼 파란 화살표 + "You" 라벨
// 마우스가 있는 기기에서만 켜짐 (휴대폰·태블릿 터치에서는 기본 동작 그대로)
(function () {
  if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;

  const LABEL = "You";
  const COLOR = "#2A8CFF";

  // 사이트 안의 창(iframe, 이력서·자기소개서)에서 열렸을 때: 따로 그리지 않고 바깥 페이지의 커서를 움직임
  let host = null;
  try { if (window.parent !== window && window.parent.ykCursor) host = window.parent.ykCursor; } catch (e) {}
  if (host) {
    const frame = window.frameElement;
    const hide = document.createElement("style");
    hide.textContent = "html, html * { cursor: none !important; }";
    document.head.appendChild(hide);
    addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const r = frame.getBoundingClientRect();
      host.move(r.left + frame.clientLeft + e.clientX, r.top + frame.clientTop + e.clientY);
    }, { passive: true });
    addEventListener("pointerdown", () => host.down(true));
    addEventListener("pointerup", () => host.down(false));
    return;
  }

  const css = document.createElement("style");
  css.textContent = `
    html.yk-cursor, html.yk-cursor * { cursor: none !important; }
    .yk-cur { position: fixed; left: 0; top: 0; z-index: 2147483647; pointer-events: none; opacity: 0; transition: opacity .15s; will-change: transform; }
    .yk-cur.on { opacity: 1; }
    @media print { .yk-cur { display: none; } }
    .yk-cur .in { transform-origin: 0 0; transition: transform .12s cubic-bezier(.3,.7,.4,1.4); }
    .yk-cur.down .in { transform: scale(.9); }
    .yk-cur svg { display: block; width: 22px; height: 22px; filter: drop-shadow(0 1px 2px rgba(0,0,0,.25)); }
    .yk-cur span {
      position: absolute; left: 16px; top: 18px; padding: 3px 9px 4px; border-radius: 7px; white-space: nowrap;
      background: ${COLOR}; color: #fff; font: 600 13px/1.2 "Google Sans", "Pretendard Variable", Pretendard, -apple-system, system-ui, sans-serif;
      box-shadow: 0 2px 6px rgba(0,0,0,.18), inset 0 0 0 1px rgba(255,255,255,.18);
    }
  `;
  document.head.appendChild(css);

  const el = document.createElement("div");
  el.className = "yk-cur";
  el.setAttribute("aria-hidden", "true");
  el.innerHTML = `<div class="in"><svg viewBox="0 0 22 22"><path d="M3 2.2 18.6 9.4c.8.4.7 1.5-.1 1.7l-6.4 1.7-2.9 6c-.4.8-1.5.7-1.7-.1L2.2 3.1c-.2-.6.3-1.1.8-.9z" fill="${COLOR}" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/></svg><span>${LABEL}</span></div>`;
  const mount = () => document.body.appendChild(el);
  document.body ? mount() : addEventListener("DOMContentLoaded", mount);
  document.documentElement.classList.add("yk-cursor");

  let x = -100, y = -100, raf = 0;
  const paint = () => { raf = 0; el.style.transform = `translate(${x - 3}px, ${y - 2}px)`; };
  const move = (nx, ny) => {
    x = nx; y = ny;
    el.classList.add("on");
    if (!raf) raf = requestAnimationFrame(paint);
  };
  const down = on => el.classList.toggle("down", on);
  window.ykCursor = { move, down };   // 같은 사이트의 iframe이 이 커서를 씀
  addEventListener("pointermove", e => { if (e.pointerType === "mouse") move(e.clientX, e.clientY); }, { passive: true });
  addEventListener("pointerdown", () => down(true));
  addEventListener("pointerup", () => down(false));
  document.documentElement.addEventListener("mouseleave", () => el.classList.remove("on"));
  addEventListener("blur", () => el.classList.remove("on"));
})();
