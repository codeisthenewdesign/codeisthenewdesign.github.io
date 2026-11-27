// 이력서·자기소개서: 내용이 A4 한 장을 넘으면 넘치는 부분을 다음 장으로 넘겨서 종이처럼 보여 줌.
// 섹션(경력 등)은 항목 단위로, 자기소개서 항목은 문장 단위까지 나눠서 넘김. 인쇄(PDF)도 이 장 나눔 그대로 나옴
(function () {
  const A4_W = 793.7; // 210mm

  function paginate() {
    const first = document.querySelector("main.paper");
    if (!first || first.closest(".pages")) return;
    const wrap = document.createElement("div");
    wrap.className = "pages";
    first.before(wrap);
    const box = document.createElement("div");  // 줄인 뒤 실제 높이만큼만 자리를 차지하게 감싸는 틀
    wrap.before(box);
    box.append(wrap);
    const blocks = [...first.children];
    first.textContent = "";
    wrap.append(first);
    let page = first;

    // 마지막 블록이 종이 아래 여백 안쪽에서 끝나면 들어간 것
    const fits = () => {
      const last = page.lastElementChild;
      if (!last) return true;
      const pad = parseFloat(getComputedStyle(page).paddingBottom);
      return last.getBoundingClientRect().bottom <= page.getBoundingClientRect().bottom - pad + 0.5;
    };
    const newPage = () => { page = first.cloneNode(false); wrap.append(page); };

    // 나눌 수 있는 블록: 항목 목록(ol/ul), 항목이 여러 개인 섹션
    const partsOf = el => {
      if (el.matches("ol, ul")) return { box: el, items: [...el.children] };
      const box = el.matches(".sec") && el.querySelector(":scope > div");
      const items = box ? [...box.children].filter(c => c.matches(".item")) : [];
      return items.length > 1 ? { box, items } : null;
    };

    // 자기소개서 항목: 이번 장에 들어가는 문장까지 앞쪽에 두고 나머지를 돌려줌. 제목만 남게 되면 항목째 다음 장으로
    const splitItem = (it, box) => {
      const body = it.querySelector(":scope > div");
      const isText = c => c.matches("p:not(.lead), p.sub");  // 항목 중간의 소제목은 본문과 함께 넘어감
      const texts = [...body.children].filter(isText);
      const left = it.cloneNode(true);
      left.classList.add("split");
      const lbody = left.querySelector(":scope > div");
      const copies = [...lbody.children].filter(isText);
      copies.forEach(p => p.remove());
      box.append(left);
      let i = 0, n = 0;
      for (; i < copies.length; i++) {
        if (i && copies[i].matches(".brk")) break;  // 표시된 소제목은 항상 다음 장에서 시작
        lbody.append(copies[i]);
        if (fits()) continue;
        const parts = texts[i].matches(".sub") ? [] : texts[i].textContent.split(/(?<=다\.)\s+/);
        for (n = 0; n < parts.length; n++) {
          copies[i].textContent = parts.slice(0, n + 1).join(" ");
          if (!fits()) break;
        }
        if (n === 1) n = 0;  // 첫 문장 하나만 장 끝에 남기지 않고 문단째 다음 장으로
        if (n) {
          copies[i].textContent = parts.slice(0, n).join(" ");
          texts[i].textContent = parts.slice(n).join(" ");
        } else copies[i].remove();
        break;
      }
      if (!n && i > 0 && copies[i - 1].matches(".sub")) { copies[i - 1].remove(); i--; }  // 소제목만 장 끝에 남기지 않음
      if (!i && !n) { left.remove(); return null; }
      [...body.children].forEach(c => { if (!texts.slice(i).includes(c)) c.remove(); });
      if (!body.children.length) return false;
      it.classList.add("cont");
      return it;
    };

    const place = el => {
      page.append(el);
      if (fits()) return;
      el.remove();
      const parts = partsOf(el);
      if (parts) {
        // 이번 장에 들어가는 만큼만 같은 모양의 껍데기에 옮겨 담음
        const shell = el.cloneNode(true);
        const sbox = parts.box === el ? shell : shell.querySelector(":scope > div");
        sbox.textContent = "";
        page.append(shell);
        let moved = 0;
        for (const it of parts.items) {
          sbox.append(it);
          if (!fits()) {
            it.remove();
            const rest = parts.box.matches(".points") ? splitItem(it, sbox) : null;
            if (rest === false) { moved++; continue; }
            if (rest) moved++;
            parts.box.prepend(rest || it);
            break;
          }
          moved++;
        }
        if (moved) el.classList.add("cont");
        else shell.remove();
      }
      if (!page.children.length) { page.append(el); return; } // 빈 장에도 안 들어가는 큰 블록은 그대로 둠
      newPage();
      place(el);
    };
    blocks.forEach(place);

    // 창이 A4보다 좁으면 장 전체를 비율대로 줄임. zoom은 Safari에서 글자 배치가 달라져 transform으로 줄이고 남는 높이를 걷어 냄
    const fit = () => {
      const k = Math.min(1, (document.documentElement.clientWidth - 24) / A4_W);
      Object.assign(wrap.style, { transform: "", width: "", marginLeft: "" });
      Object.assign(box.style, { height: "", overflow: "" });
      if (k >= 1) return;
      const h = wrap.offsetHeight, w = A4_W + 2;  // 종이 그림자까지
      Object.assign(wrap.style, { width: w + "px", transformOrigin: "0 0", transform: `scale(${k})`,
        marginLeft: Math.max(0, (document.documentElement.clientWidth - w * k) / 2) + "px" });
      Object.assign(box.style, { height: h * k + "px", overflow: "hidden" });
    };
    fit();
    addEventListener("resize", fit);
  }

  window.ykPaginate = paginate;  // 잠긴 자기소개서를 연 뒤 다시 장을 나눌 때 씀
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(paginate);
})();
