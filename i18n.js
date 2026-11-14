// 한/영 전환. 기본은 한국어, 고른 언어는 브라우저에 기억해 둠
// 쓰는 법: 같은 자리에 <span data-l="ko">한국어</span><span data-l="en">English</span>를 나란히 두면 고른 언어만 보임
(function () {
  const KEY = "yk-lang";
  let lang = "ko";
  try { if (localStorage.getItem(KEY) === "en") lang = "en"; } catch (e) {}

  const css = document.createElement("style");
  css.textContent = `
    html[data-lang="ko"] [data-l="en"], html[data-lang="en"] [data-l="ko"] { display: none !important; }
    .lang-seg { display: inline-flex; padding: 2px; border-radius: 9px; background: rgba(0,0,0,.06); }
    .lang-seg button { padding: 4px 10px; border: 0; border-radius: 7px; background: none; font: 600 12px/1.2 "Google Sans", "Pretendard Variable", Pretendard, system-ui, sans-serif; color: rgba(0,0,0,.5); cursor: pointer; transition: background .15s, color .15s, box-shadow .15s; }
    .lang-seg button:hover { color: rgba(0,0,0,.8); }
    .lang-seg button[aria-pressed="true"] { background: #fff; color: #000; box-shadow: 0 1px 3px rgba(0,0,0,.14), 0 0 0 .5px rgba(0,0,0,.06); }
  `;
  document.head.appendChild(css);

  const apply = () => {
    document.documentElement.dataset.lang = lang;
    document.documentElement.lang = lang;
    document.querySelectorAll("[data-set-lang]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.setLang === lang)));
  };
  apply();

  window.ykLang = () => lang;
  window.ykT = (ko, en) => (lang === "en" ? en : ko);
  window.ykSetLang = l => {
    if (l !== "ko" && l !== "en" || l === lang) return;
    lang = l;
    try { localStorage.setItem(KEY, l); } catch (e) {}
    apply();
    dispatchEvent(new CustomEvent("langchange", { detail: l }));
  };

  // 언어 버튼: <div class="lang-seg"><button data-set-lang="ko">한국어</button><button data-set-lang="en">English</button></div>
  // 한/영 키: <button data-toggle-lang>. 누를 때마다 언어가 바뀜
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-set-lang]");
    if (b) window.ykSetLang(b.dataset.setLang);
    const t = e.target.closest("[data-toggle-lang]");
    if (t) {
      window.ykSetLang(lang === "ko" ? "en" : "ko");
      // 키보드(Enter·Space)로 눌러도 쑥 들어가는 모습이 보이게
      t.classList.add("down"); setTimeout(() => t.classList.remove("down"), 110);
    }
  });
  document.addEventListener("DOMContentLoaded", apply);
})();
