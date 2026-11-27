// 상세 페이지 창 동작: 빨간·노란 버튼과 Esc는 창을 닫고 홈으로, 초록 버튼은 전체 화면 전환
(function () {
  const win = document.querySelector(".window");
  const slug = document.body.dataset.slug;
  const home = "../index.html";

  function close() {
    // 홈 화면이 이 값을 보고 창이 폴더로 들어가는 효과를 재생함
    try { sessionStorage.setItem("yk-return", slug); } catch (e) {}
    top.location.href = home;
  }
  document.querySelectorAll("[data-close]").forEach(b => b.addEventListener("click", close));
  // 휴대폰: 축소된 화면에서도 상단바가 실제 크기로 보이도록 화면 1px에 해당하는 길이를 계산
  if (document.documentElement.classList.contains("as-web")) {
    const size = () => {
      const w = matchMedia("(orientation: landscape)").matches ? Math.max(screen.width, screen.height) : Math.min(screen.width, screen.height);
      document.documentElement.style.setProperty("--u", (innerWidth / w).toFixed(3) + "px");
    };
    size();
    addEventListener("resize", size);
    addEventListener("orientationchange", size);
  }
  // fit.html 안에 있을 때 다른 페이지로 가는 링크는 바깥 창에서 열어 주소를 맞춤
  if (top !== self) document.querySelectorAll('a[href$=".html"]').forEach(a => { a.target = "_top"; });
  document.querySelector("[data-zoom]").addEventListener("click", () => win.classList.toggle("zoomed"));
  document.addEventListener("keydown", e => { if (e.key === "Escape") close(); });

  // 커버 이미지가 없으면 자리표시를 보여 줌
  document.querySelectorAll(".cover img").forEach(img => {
    const fail = () => { img.hidden = true; img.nextElementSibling && (img.nextElementSibling.hidden = false); };
    if (img.complete && !img.naturalWidth) fail(); else img.addEventListener("error", fail);
  });
})();

// 유튜브 고화질 썸네일이 없는 영상은 기본 썸네일로
document.querySelectorAll("img[data-fallback]").forEach(img => {
  const swap = () => { if (img.src !== img.dataset.fallback) img.src = img.dataset.fallback; };
  img.addEventListener("error", swap);
  // maxresdefault가 없으면 120x90 회색 이미지가 오기도 함
  img.addEventListener("load", () => { if (img.naturalWidth <= 120) swap(); });
});

// 화면 캡처가 아직 없으면 자리표시를 보여 줌
document.querySelectorAll(".shot img").forEach(img => {
  const fail = () => { img.hidden = true; const ph = img.nextElementSibling; if (ph) ph.hidden = false; };
  if (img.complete && !img.naturalWidth) fail(); else img.addEventListener("error", fail);
});

// 섹션 목차: 지금 읽는 섹션 표시 (한/영 목차가 따로 있어서 각각 처리)
(function () {
  const root = document.querySelector(".scroll");
  const tocs = [...document.querySelectorAll(".toc")];
  if (!root || !tocs.length) return;
  root.style.scrollBehavior = "smooth";
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      // data-toc에 값이 있으면 그 목차 항목을 켬 (여러 섹션이 한 단계에 묶일 때)
      const key = en.target.dataset.toc || en.target.id;
      tocs.forEach(toc => toc.querySelectorAll("a").forEach(a => {
        const on = a.getAttribute("href") === "#" + key;
        a.classList.toggle("on", on);
        // 목차 줄만 가로로 맞춤 (본문 스크롤은 건드리지 않음)
        if (on && toc.offsetParent) toc.scrollTo({ left: a.offsetLeft - toc.clientWidth / 2 + a.offsetWidth / 2, behavior: "smooth" });
      }));
    });
  }, { root, rootMargin: "-30% 0px -60% 0px" });
  document.querySelectorAll(".chapter[id], .stage[id], [data-toc][id]").forEach(s => io.observe(s));
  // 언어를 바꾸면 맨 위로
  addEventListener("langchange", () => { root.style.scrollBehavior = "auto"; root.scrollTop = 0; root.style.scrollBehavior = "smooth"; });
})();
