// 사이트 보호: 복사, 저장, 끌어서 가져가기를 막고 스크린샷 단축키를 누르면 화면을 가림.
// 웹에서 막을 수 있는 범위의 억제 장치이며 완전한 차단은 아님.
(function () {
  const root = document.documentElement;
  const allowed = t => t && t.closest && t.closest('input, textarea, select, [contenteditable="true"], a[href^="mailto:"]');

  const style = document.createElement("style");
  style.textContent = `
    html { -webkit-user-select: none; user-select: none; -webkit-touch-callout: none; }
    input, textarea, [contenteditable="true"], a[href^="mailto:"] { -webkit-user-select: text; user-select: text; }
    img, video { -webkit-user-drag: none; }
    html.guard-hide::after { content: ""; position: fixed; inset: 0; z-index: 2147483647; background: #fff; }
    @media print { html, body { display: none !important; } }
  `;
  (document.head || root).append(style);

  const block = e => { if (!allowed(e.target)) e.preventDefault(); };
  ["copy", "cut", "contextmenu", "selectstart", "dragstart"].forEach(t => document.addEventListener(t, block, true));

  let timer;
  const hide = ms => { root.classList.add("guard-hide"); clearTimeout(timer); timer = setTimeout(() => root.classList.remove("guard-hide"), ms); };

  addEventListener("keydown", e => {
    const mod = e.metaKey || e.ctrlKey, k = (e.key || "").toLowerCase();
    if (e.metaKey && e.shiftKey) hide(3000);                     // 맥 스크린샷 단축키는 Cmd+Shift로 시작
    if (k === "printscreen") { hide(3000); e.preventDefault(); return; }
    if (k === "f12" || (mod && e.shiftKey && ["i", "j", "c"].includes(k)) || (e.metaKey && e.altKey && ["i", "j", "c"].includes(k))) { e.preventDefault(); return; }
    if (mod && ["s", "u", "p"].includes(k)) { e.preventDefault(); return; }
    if (mod && ["c", "x", "a"].includes(k) && !allowed(e.target)) e.preventDefault();
  }, true);
  addEventListener("keyup", e => { if (e.key === "PrintScreen") hide(3000); }, true);  // 윈도우는 keyup만 오는 경우가 있음
})();
