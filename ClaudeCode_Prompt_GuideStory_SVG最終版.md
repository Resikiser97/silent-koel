# Claude Code Prompt：噪鹃生存記 — 首頁童書 Guide + SVG 動畫插畫

---

## 📋 任務概述

在遊戲首頁（`showStartScreen()`）左上角加入一本「可愛童書」按鈕。
點擊後打開一個 4 頁的劇情教學 Guide（故事書風格 UI），每一頁配有 SVG 動畫插畫。
第一次遊玩的玩家，開啟遊戲時會自動彈出這個 Guide。

---

## 📁 需要修改的檔案

- `systems/ui.js` — 主要修改區（加入童書按鈕 + Guide Story overlay + SVG插畫函式）
- `main.js` — 修改 `window.onload` 邏輯

---

## ✅ 功能需求

### 1. First Time Player 判斷

在 `main.js` 最底部，將：

```javascript
window.onload = showStartScreen;
```

改為：

```javascript
window.onload = () => {
    if (sessionStorage.getItem('autostart')) {
        sessionStorage.removeItem('autostart');
        initializeGame();
        return;
    }
    if (!localStorage.getItem('hasPlayedBefore')) {
        showStartScreen();
        setTimeout(() => showGuideStory(), 300);
    } else {
        showStartScreen();
    }
};
```

### 2. 在 `initializeGame()` 中標記已玩過

在 `systems/ui.js` 的 `initializeGame()` 函式最開頭加入：

```javascript
localStorage.setItem('hasPlayedBefore', 'true');
```

---

## 📖 童書按鈕設計規格

在 `showStartScreen()` 函式內，在 `overlay` append 到 `game-container` 之前，加入以下按鈕：

```javascript
const bookBtn = document.createElement('div');
bookBtn.id = 'story-book-btn';
bookBtn.style.cssText = `
    position: absolute;
    top: 20px;
    left: 20px;
    width: 64px;
    height: 64px;
    background: rgba(255, 220, 130, 0.12);
    border: 2px solid rgba(255, 220, 130, 0.45);
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    pointer-events: all;
    transition: all 0.2s ease;
    z-index: 201;
`;
bookBtn.innerHTML = '<div style="font-size:28px;line-height:1;">📖</div><div style="font-size:11px;color:#FFF5DC;letter-spacing:1px;margin-top:3px;">故事</div>';
bookBtn.onmouseenter = () => {
    bookBtn.style.background = 'rgba(255, 220, 130, 0.28)';
    bookBtn.style.transform = 'scale(1.08)';
    bookBtn.style.borderColor = 'rgba(255, 220, 130, 0.8)';
};
bookBtn.onmouseleave = () => {
    bookBtn.style.background = 'rgba(255, 220, 130, 0.12)';
    bookBtn.style.transform = 'scale(1)';
    bookBtn.style.borderColor = 'rgba(255, 220, 130, 0.45)';
};
bookBtn.onclick = () => showGuideStory();
overlay.appendChild(bookBtn);
```

---

## 📚 `showGuideStory()` 函式完整規格

在 `systems/ui.js` 中加入以下兩個函式：`showGuideStory()` 和 `_getGuideStoryPages()`。

### `showGuideStory()` 主函式

```javascript
function showGuideStory() {
    applyDeviceMode();
    if (document.getElementById('guide-story-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'guide-story-overlay';
    overlay.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 250;
        pointer-events: all;
        font-family: Georgia, serif;
    `;

    const book = document.createElement('div');
    book.style.cssText = `
        background: #f5ead8;
        border-radius: 16px;
        width: 90%;
        max-width: 660px;
        max-height: 88vh;
        padding: 0;
        box-sizing: border-box;
        box-shadow: 0 8px 48px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(160,120,60,0.25);
        position: relative;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        border-left: 8px solid rgba(130,80,20,0.45);
    `;

    // ── 插畫區（上半部）
    const illustrationArea = document.createElement('div');
    illustrationArea.style.cssText = `
        width: 100%;
        height: 180px;
        overflow: hidden;
        flex-shrink: 0;
        border-radius: 8px 8px 0 0;
        background: #0a0f08;
    `;

    // ── 文字區（下半部）
    const textArea = document.createElement('div');
    textArea.style.cssText = `
        padding: 20px 32px 12px;
        flex: 1;
        overflow-y: auto;
        min-height: 0;
    `;

    const chapterHeader = document.createElement('div');
    chapterHeader.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:12px;';
    const chapterIcon = document.createElement('div');
    chapterIcon.style.cssText = 'font-size:26px;line-height:1;flex-shrink:0;';
    const chapterTitle = document.createElement('div');
    chapterTitle.style.cssText = 'font-size:20px;font-weight:bold;color:#4a2808;letter-spacing:1px;';
    chapterHeader.appendChild(chapterIcon);
    chapterHeader.appendChild(chapterTitle);

    const storyText = document.createElement('div');
    storyText.style.cssText = `
        font-size: 13.5px;
        line-height: 1.85;
        color: #3a2208;
        white-space: pre-wrap;
        word-break: break-word;
        font-family: Georgia, serif;
    `;

    textArea.appendChild(chapterHeader);
    textArea.appendChild(storyText);

    // ── 分隔線 + 底部導航
    const divider = document.createElement('div');
    divider.style.cssText = 'width:100%;height:1px;background:linear-gradient(90deg,transparent,rgba(130,80,20,0.25),transparent);margin:0;flex-shrink:0;';

    const navArea = document.createElement('div');
    navArea.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:12px 28px 16px;flex-shrink:0;';

    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '&#9664;';
    prevBtn.style.cssText = `
        width:38px;height:38px;border-radius:50%;
        border:2px solid rgba(130,80,20,0.35);
        background:rgba(255,220,130,0.15);
        color:#5a3010;font-size:13px;cursor:pointer;
        transition:all 0.2s;pointer-events:all;
    `;

    const dots = document.createElement('div');
    dots.style.cssText = 'display:flex;gap:7px;align-items:center;';

    const nextBtn = document.createElement('button');
    nextBtn.style.cssText = `
        padding:9px 18px;border-radius:18px;
        border:2px solid rgba(130,80,20,0.4);
        background:rgba(255,220,130,0.22);
        color:#4a2808;font-size:13px;font-weight:bold;
        cursor:pointer;transition:all 0.2s;
        font-family:Georgia,serif;pointer-events:all;
    `;

    navArea.appendChild(prevBtn);
    navArea.appendChild(dots);
    navArea.appendChild(nextBtn);

    // ── 關閉按鈕
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕';
    closeBtn.style.cssText = `
        position:absolute;top:12px;right:14px;
        background:rgba(0,0,0,0.45);border:none;
        font-size:16px;color:rgba(255,255,255,0.6);
        cursor:pointer;padding:4px 8px;border-radius:4px;
        transition:color 0.2s;z-index:5;pointer-events:all;
        font-family:Arial,sans-serif;
    `;
    closeBtn.onmouseenter = () => closeBtn.style.color = 'rgba(255,255,255,0.95)';
    closeBtn.onmouseleave = () => closeBtn.style.color = 'rgba(255,255,255,0.6)';
    closeBtn.onclick = () => overlay.remove();

    book.appendChild(closeBtn);
    book.appendChild(illustrationArea);
    book.appendChild(textArea);
    book.appendChild(divider);
    book.appendChild(navArea);
    overlay.appendChild(book);
    document.getElementById('game-container').appendChild(overlay);

    const PAGES = _getGuideStoryPages();
    let currentPage = 0;

    function renderPage(idx) {
        const page = PAGES[idx];

        // 插畫切換（淡出 → 替換 → 淡入）
        illustrationArea.style.transition = 'opacity 0.3s ease';
        illustrationArea.style.opacity = '0';
        setTimeout(() => {
            illustrationArea.innerHTML = page.svgIllustration;
            illustrationArea.style.opacity = '1';
        }, 300);

        // 標題
        chapterIcon.textContent = page.icon;
        chapterTitle.textContent = page.title;

        // 文字淡入
        storyText.style.transition = 'opacity 0.3s ease';
        storyText.style.opacity = '0';
        setTimeout(() => {
            storyText.textContent = page.content;
            storyText.style.opacity = '1';
        }, 200);

        textArea.scrollTop = 0;

        // 進度點
        dots.innerHTML = '';
        for (let i = 0; i < PAGES.length; i++) {
            const dot = document.createElement('div');
            dot.style.cssText = `
                width:${i === idx ? '20px' : '8px'};
                height:8px;border-radius:4px;
                background:${i === idx ? '#7a4a10' : 'rgba(122,74,16,0.28)'};
                transition:all 0.3s ease;
            `;
            dots.appendChild(dot);
        }

        // 按鈕狀態
        prevBtn.style.opacity = idx === 0 ? '0.3' : '1';
        prevBtn.style.cursor = idx === 0 ? 'not-allowed' : 'pointer';

        if (idx === PAGES.length - 1) {
            nextBtn.textContent = '⚔️  開始冒險';
            nextBtn.style.background = 'rgba(80,160,40,0.25)';
            nextBtn.style.borderColor = 'rgba(60,130,20,0.5)';
            nextBtn.style.color = '#2a5008';
        } else {
            nextBtn.textContent = '下一頁 ▶';
            nextBtn.style.background = 'rgba(255,220,130,0.22)';
            nextBtn.style.borderColor = 'rgba(130,80,20,0.4)';
            nextBtn.style.color = '#4a2808';
        }
    }

    prevBtn.onclick = () => { if (currentPage > 0) { currentPage--; renderPage(currentPage); } };
    nextBtn.onclick = () => {
        if (currentPage < PAGES.length - 1) {
            currentPage++;
            renderPage(currentPage);
        } else {
            overlay.remove();
            localStorage.setItem('hasPlayedBefore', 'true');
            initializeGame();
        }
    };

    renderPage(0);
}
```

---

## 🎨 `_getGuideStoryPages()` — 4 頁內容（含 SVG 插畫）

```javascript
function _getGuideStoryPages() {
    const svgStyle = `<style>
@keyframes _blink{0%,90%,100%{opacity:1}95%{opacity:.1}}
@keyframes _drift{0%{transform:translateX(0)}100%{transform:translateX(18px)}}
@keyframes _rpulse{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes _twinkle{0%,100%{opacity:.3}50%{opacity:.9}}
@keyframes _gflash{0%,100%{opacity:0}8%,12%{opacity:1}}
@keyframes _ppulse{0%,100%{opacity:.5}50%{opacity:1}}
@keyframes _vglow{0%,100%{opacity:.2}50%{opacity:.55}}
@keyframes _fdrip{0%,60%{opacity:0}65%{opacity:.9}80%{transform:translateY(0)}100%{transform:translateY(8px);opacity:0}}
@keyframes _breath{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.03)}}
@keyframes _bfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes _sway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
@keyframes _fall{0%{transform:translateY(0) rotate(0deg);opacity:.8}100%{transform:translateY(12px) rotate(15deg);opacity:0}}
@keyframes _warmP{0%,100%{opacity:.15}50%{opacity:.3}}
@keyframes _hbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}
@keyframes _emerge{0%{opacity:.15}100%{opacity:.75}}
@keyframes _eglow{0%,100%{opacity:.6}50%{opacity:1}}
@keyframes _wripple{0%{transform:scaleX(1)}50%{transform:scaleX(1.04)}100%{transform:scaleX(1)}}
@keyframes _tsway{0%,100%{transform:rotate(-8deg)}50%{transform:rotate(8deg)}}
</style>`;

    return [
        {
            icon: '🌑',
            title: '第一章 — 破曉',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="180" fill="#0a1208"/>
<ellipse cx="90" cy="95" rx="70" ry="52" fill="#111f0e"/>
<ellipse cx="95" cy="88" rx="50" ry="36" fill="#162a12"/>
<polygon points="30,180 80,180 55,145" fill="#0e1a0c"/>
<polygon points="60,180 110,180 85,148" fill="#0e1a0c"/>
<polygon points="100,180 145,180 122,150" fill="#0e1a0c"/>
<polygon points="135,180 175,180 155,152" fill="#0e1a0c"/>
<polygon points="320,180 370,180 345,138" fill="#0c1a0a"/>
<polygon points="360,180 410,180 385,140" fill="#0c1a0a"/>
<polygon points="400,180 450,180 425,142" fill="#0c1a0a"/>
<polygon points="440,180 490,180 465,145" fill="#0c1a0a"/>
<g style="animation:_drift 8s ease-in-out infinite alternate">
  <ellipse cx="250" cy="88" rx="52" ry="26" fill="#0d1f1a"/>
  <ellipse cx="250" cy="82" rx="44" ry="21" fill="#152a20"/>
  <path d="M198 82 Q210 65 230 67 Q220 80 205 85Z" fill="#0d1f1a"/>
  <path d="M295 70 Q310 60 325 65 Q315 75 298 77Z" fill="#0d1f1a"/>
  <path d="M240 102 Q250 112 265 109 Q260 102 248 100Z" fill="#0d1f1a"/>
  <path d="M225 94 Q215 102 210 100 Q215 94 225 92Z" fill="#1a3030"/>
  <path d="M225 94 Q222 98 218 97" stroke="#7fd967" stroke-width="1.2" fill="none"/>
  <ellipse style="animation:_blink 4s ease-in-out infinite" cx="220" cy="81" rx="4.5" ry="4" fill="#cc2200" opacity="0.9"/>
  <ellipse cx="220" cy="81" rx="1.8" ry="1.6" fill="#1a0000"/>
</g>
<circle style="animation:_twinkle 2.1s ease-in-out infinite" cx="400" cy="28" r="1.2" fill="#c8e8a0"/>
<circle style="animation:_twinkle 3.3s ease-in-out infinite .7s" cx="440" cy="16" r="1" fill="#c8e8a0"/>
<circle style="animation:_twinkle 1.8s ease-in-out infinite 1.2s" cx="470" cy="36" r="1.4" fill="#c8e8a0"/>
<circle style="animation:_twinkle 2.5s ease-in-out infinite .4s" cx="350" cy="20" r="0.9" fill="#c8e8a0"/>
<circle style="animation:_twinkle 2.8s ease-in-out infinite .9s" cx="490" cy="24" r="1.1" fill="#c8e8a0"/>
<g style="animation:_gflash 5s ease-in-out infinite 2s">
  <circle cx="488" cy="55" r="6" fill="#ffee88" opacity=".9"/>
  <circle cx="488" cy="55" r="10" fill="#ffaa22" opacity=".4"/>
  <line x1="488" y1="48" x2="488" y2="42" stroke="#ffee88" stroke-width="1.5" opacity=".7"/>
  <line x1="481" y1="51" x2="475" y2="47" stroke="#ffee88" stroke-width="1.5" opacity=".7"/>
  <line x1="495" y1="51" x2="501" y2="47" stroke="#ffee88" stroke-width="1.5" opacity=".7"/>
</g>
<text x="260" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#4a7a38" opacity=".7">遠方傳來槍聲。你孤身一人。</text>
</svg>`,
            content: `你睜開了眼睛。

紅色的眼眸在黑暗中閃爍。
你的身體比任何野生噪鹃都龐大，
蘋果綠色的喙，已經長出了獠牙。

你不知道自己從哪裡來。
你只記得——
一對大嘴烏鸦，用牠們的智慧把你撫養長大。

牠們教你計算、教你躲藏、教你思考。
但那是很久以前的事了。

遠方傳來槍聲。

現在，你孤身一人。
養父母已經死了——被人類獵人的毒箭。

牠們最後說的話還在迴盪：
「用腦子去活。用腦子去贏。」

這片森林很陌生。
你不知道哪裡有食物，
你只知道——
獵人還在追殺你，還有三天三夜。

你必須活下去。`
        },
        {
            icon: '🐦‍⬛',
            title: '第二章 — 孤兒',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="180" fill="#1a1005"/>
<ellipse style="animation:_warmP 3s ease-in-out infinite" cx="260" cy="150" rx="160" ry="45" fill="#c8640a" opacity=".2"/>
<ellipse cx="260" cy="150" rx="78" ry="20" fill="#2a1a06"/>
<path d="M185 150 Q200 124 230 122 Q260 119 290 122 Q320 124 335 150Z" fill="#3a2508"/>
<path d="M205 148 L215 140 L220 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<path d="M295 148 L305 140 L310 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<path d="M240 147 L248 139 L256 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<path d="M270 147 L278 139 L286 147" stroke="#4a3010" stroke-width="1.5" fill="none"/>
<ellipse cx="260" cy="142" rx="20" ry="7" fill="#c87820" opacity=".5"/>
<g style="animation:_hbob 2.5s ease-in-out infinite;transform-origin:195px 88px">
  <ellipse cx="195" cy="92" rx="26" ry="18" fill="#1a2018"/>
  <ellipse cx="195" cy="85" rx="20" ry="14" fill="#222820"/>
  <path d="M175 82 Q180 69 192 71 Q185 80 178 84Z" fill="#1a2018"/>
  <path d="M205 73 Q215 65 220 69 Q212 75 206 77Z" fill="#1a2018"/>
  <path d="M190 96 Q195 104 205 102 Q200 96 192 94Z" fill="#1a2018"/>
  <path d="M173 93 Q165 97 163 94 Q167 90 174 91Z" fill="#222820"/>
  <path d="M173 93 Q170 96 166 95" stroke="#555" stroke-width="1" fill="none"/>
  <circle cx="170" cy="84" r="3" fill="#1a1a1a"/>
  <circle cx="169" cy="83.5" r="1" fill="#555" opacity=".7"/>
</g>
<g style="animation:_hbob 2.5s ease-in-out infinite .8s;transform-origin:325px 85px">
  <ellipse cx="325" cy="89" rx="24" ry="17" fill="#1a2018"/>
  <ellipse cx="325" cy="83" rx="18" ry="13" fill="#222820"/>
  <path d="M348 81 Q353 69 342 70 Q348 79 350 83Z" fill="#1a2018"/>
  <path d="M316 72 Q308 65 304 70 Q311 76 314 77Z" fill="#1a2018"/>
  <path d="M318 97 Q315 105 306 103 Q309 97 316 95Z" fill="#1a2018"/>
  <path d="M348 89 Q356 93 357 90 Q353 86 347 88Z" fill="#222820"/>
  <circle cx="350" cy="81" r="3" fill="#1a1a1a"/>
</g>
<g style="animation:_hbob 2s ease-in-out infinite .5s;transform-origin:260px 115px">
  <ellipse cx="260" cy="122" rx="14" ry="10" fill="#152a20"/>
  <ellipse cx="260" cy="117" rx="10" ry="8" fill="#1d3828"/>
  <path d="M250 115 Q253 108 258 109 Q255 114 252 117Z" fill="#152a20"/>
  <path d="M263 107 Q268 102 271 105 Q267 109 264 111Z" fill="#152a20"/>
  <path d="M253 124 Q258 130 265 128 Q262 123 255 122Z" fill="#152a20"/>
  <path d="M250 118 Q245 121 243 119 Q246 116 251 117Z" fill="#1a3228"/>
  <path d="M250 118 Q247 120 244 119" stroke="#7fd967" stroke-width="1" fill="none"/>
  <circle cx="247" cy="114" r="2.5" fill="#cc2200" opacity=".85"/>
</g>
<path style="animation:_fall 3s ease-in infinite" d="M230 65 Q228 70 232 73 Q230 75 228 71Z" fill="#333" opacity=".6"/>
<path style="animation:_fall 3s ease-in infinite 1.4s" d="M290 60 Q288 65 292 68 Q290 70 288 66Z" fill="#333" opacity=".5"/>
<text x="260" y="172" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#8a6030" opacity=".8">牠們咬著你，叼進了自己的巢。</text>
</svg>`,
            content: `你很小很小的時候，
人類帶著槍聲進入了那片樹林。

你掉進了樹洞裡，發不出聲音。
就在你以為自己要死在黑暗中的時候——

一對黑色的翅膀遮住了樹洞的光。

那兩隻大嘴烏鸦沒有猶豫，
叼著你，把你帶進了自己的巢。

🧮 牠們用算術教你躲避危險：
  三個獵人進木屋，只有兩個出來——
  那麼裡面還藏著一個。
  數字，就是活著的方法。

🔧 牠們用工具教你生存：
  野生噪鹃只用嘴吃現成的果子。
  但你學會了用爪子配合，用腦子創造方法。

後來，一根毒箭穿過了牠們的身體。

在最後一聲淒厲的叫聲中，
養父說：
「孩子，不要像野生噪鹃那樣愚蠢地送死……
  用你的腦子去活下去。用腦子去贏。」

你咬著牠們的羽毛，感受到體溫漸漸消散。
那一刻，你發誓：
要用牠們教你的智慧，活著走出這片森林。`
        },
        {
            icon: '☠️',
            title: '第三章 — 蛻變',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
<rect x="0" y="0" width="520" height="180" fill="#0c0a15"/>
<ellipse style="animation:_vglow 2s ease-in-out infinite" cx="180" cy="95" rx="75" ry="52" fill="#6030c0" opacity=".2"/>
<g style="animation:_breath 3s ease-in-out infinite;transform-origin:180px 95px">
  <ellipse cx="180" cy="98" rx="55" ry="30" fill="#0d1a18"/>
  <ellipse cx="178" cy="90" rx="42" ry="25" fill="#152a22"/>
  <path d="M138 88 Q148 70 165 72 Q155 85 142 90Z" fill="#0d1a18"/>
  <path d="M215 73 Q228 63 236 68 Q225 77 218 80Z" fill="#0d1a18"/>
  <path d="M172 120 Q180 132 196 129 Q190 120 175 118Z" fill="#0d1a18"/>
  <path d="M138 102 Q125 109 122 106 Q127 100 139 101Z" fill="#1a2e26"/>
  <path d="M138 102 Q133 106 127 105" stroke="#7fd967" stroke-width="1.2" fill="none"/>
  <circle cx="132" cy="90" r="5" fill="#cc2200"/>
  <circle cx="131" cy="89" r="2" fill="#1a0000"/>
</g>
<ellipse style="animation:_vglow 2s ease-in-out infinite" cx="165" cy="114" rx="18" ry="10" fill="#8040e0" opacity=".4"/>
<ellipse cx="165" cy="114" rx="12" ry="7" fill="#5020a0" opacity=".8"/>
<ellipse cx="165" cy="114" rx="7" ry="4" fill="#9060e8" opacity=".9"/>
<circle style="animation:_ppulse 2s ease-in-out infinite" cx="165" cy="114" r="7" fill="none" stroke="#b080ff" stroke-width="1" opacity=".7"/>
<path d="M148 100 Q145 107 148 112 Q152 118 158 114" stroke="#9060c8" stroke-width="1" fill="none" opacity=".6"/>
<path d="M124 105 Q116 112 114 110 Q118 104 125 105" fill="#1a3030" opacity=".8"/>
<circle style="animation:_fdrip 3.5s ease-in infinite" cx="120" cy="118" r="2" fill="#b080ff"/>
<circle style="animation:_fdrip 3.5s ease-in infinite 1.8s" cx="115" cy="121" r="1.5" fill="#9060c8"/>
<g style="animation:_bfloat 2.5s ease-in-out infinite">
  <rect x="310" y="118" width="58" height="7" rx="3.5" fill="#c8c0a8" opacity=".85"/>
  <circle cx="310" cy="121" r="6.5" fill="#d8d0b8" opacity=".85"/>
  <circle cx="368" cy="121" r="6.5" fill="#d8d0b8" opacity=".85"/>
</g>
<g style="animation:_bfloat 2.5s ease-in-out infinite 1.2s">
  <rect x="335" y="142" width="40" height="6" rx="3" fill="#c0b89a" opacity=".7"/>
  <circle cx="335" cy="145" r="5" fill="#d0c8aa" opacity=".7"/>
  <circle cx="375" cy="145" r="5" fill="#d0c8aa" opacity=".7"/>
</g>
<path d="M205 118 Q240 118 290 124" stroke="#9060c8" stroke-width=".8" fill="none" stroke-dasharray="3 4" opacity=".5"/>
<circle cx="420" cy="35" r="1.2" fill="#a080d0" opacity=".5"/>
<circle cx="455" cy="22" r="1" fill="#a080d0" opacity=".4"/>
<circle cx="480" cy="44" r="1.1" fill="#a080d0" opacity=".6"/>
<text x="260" y="170" text-anchor="middle" font-family="Georgia,serif" font-size="11" fill="#9060c8" opacity=".8">白骨素不是詛咒。是生存的證明。</text>
</svg>`,
            content: `每一口果子，是為了活著。
每一次進化，是為了更強壯。

但有一種力量，不是你選擇的——

那是白骨。

你咬下去，感到了噁心。
那不是養父母教你的食物，
那是腐肉，是死亡的味道。

每一次吞下白骨，
你的肌肉在增長，
你的獠牙在發出微弱的紫光，
你的毒囊在進化。

這不是你選擇的。
這是你的身體，在黑暗環境下的自然反應。

你看著自己的爪子——
牠們已經是獵手的爪子了。
怪物的爪子。

但這個怪物，會活著。
有時候，活著本身，
就需要變成你害怕的樣子。`
        },
        {
            icon: '⚔️',
            title: '第四章 — 試煉',
            svgIllustration: svgStyle + `<svg width="100%" viewBox="0 0 520 180" xmlns="http://www.w3.org/2000/svg">
<defs>
  <radialGradient id="_bg" cx="50%" cy="50%"><stop offset="0%" stop-color="#141810"/><stop offset="100%" stop-color="#060806"/></radialGradient>
  <radialGradient id="_bg1" cx="50%" cy="50%"><stop offset="0%" stop-color="#5a3010" stop-opacity=".45"/><stop offset="100%" stop-color="#5a3010" stop-opacity="0"/></radialGradient>
  <radialGradient id="_bg2" cx="50%" cy="50%"><stop offset="0%" stop-color="#103858" stop-opacity=".45"/><stop offset="100%" stop-color="#103858" stop-opacity="0"/></radialGradient>
  <radialGradient id="_bg3" cx="50%" cy="50%"><stop offset="0%" stop-color="#3a1050" stop-opacity=".45"/><stop offset="100%" stop-color="#3a1050" stop-opacity="0"/></radialGradient>
</defs>
<rect x="0" y="0" width="520" height="180" fill="url(#_bg)"/>
<ellipse cx="85" cy="100" rx="65" ry="52" fill="url(#_bg1)"/>
<ellipse cx="260" cy="128" rx="78" ry="38" fill="url(#_bg2)"/>
<ellipse cx="435" cy="95" rx="65" ry="52" fill="url(#_bg3)"/>
<g style="animation:_emerge 3s ease-out forwards">
  <ellipse cx="85" cy="108" rx="40" ry="26" fill="#2a1808"/>
  <ellipse cx="85" cy="94" rx="27" ry="23" fill="#301c0a"/>
  <ellipse cx="69" cy="79" rx="9" ry="9" fill="#2a1808"/>
  <ellipse cx="102" cy="79" rx="9" ry="9" fill="#2a1808"/>
  <ellipse cx="56" cy="122" rx="9" ry="14" fill="#2a1808"/>
  <ellipse cx="114" cy="122" rx="9" ry="14" fill="#2a1808"/>
  <ellipse cx="68" cy="140" rx="8" ry="12" fill="#2a1808"/>
  <ellipse cx="102" cy="140" rx="8" ry="12" fill="#2a1808"/>
  <circle style="animation:_eglow 2s ease-in-out infinite" cx="77" cy="91" r="3.5" fill="#cc4400"/>
  <circle style="animation:_eglow 2s ease-in-out infinite .3s" cx="94" cy="91" r="3.5" fill="#cc4400"/>
  <circle cx="77" cy="91" r="1.5" fill="#1a0000"/>
  <circle cx="94" cy="91" r="1.5" fill="#1a0000"/>
</g>
<text x="85" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#8a4820" opacity=".85">🐻 黑熊</text>
<g style="animation:_emerge 3s ease-out forwards .5s;opacity:.15">
  <g style="animation:_wripple 2s ease-in-out infinite;transform-origin:260px 132px">
    <ellipse cx="260" cy="132" rx="72" ry="10" fill="#0a2038" opacity=".9"/>
  </g>
  <path d="M215 128 Q240 94 260 91 Q280 94 305 128Z" fill="#1a3050"/>
  <path d="M255 91 Q260 76 265 91Z" fill="#1a3050"/>
  <g style="animation:_tsway 1.5s ease-in-out infinite;transform-origin:305px 128px">
    <path d="M305 128 Q320 116 330 123 Q325 132 305 132Z" fill="#162840"/>
  </g>
  <circle style="animation:_eglow 2.4s ease-in-out infinite .6s" cx="238" cy="112" r="3" fill="#88ccff"/>
  <circle cx="238" cy="112" r="1.3" fill="#001830"/>
</g>
<text x="260" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#3870a8" opacity=".85">🦈 大白鯊</text>
<g style="animation:_emerge 3s ease-out forwards 1s;opacity:.15">
  <ellipse cx="435" cy="108" rx="22" ry="13" fill="#1a0828"/>
  <ellipse cx="435" cy="100" rx="16" ry="11" fill="#22103a"/>
  <ellipse cx="435" cy="96" rx="12" ry="8" fill="#2a1445"/>
  <path d="M413 108 Q408 100 404 104 Q406 110 413 110Z" fill="#1a0828"/>
  <path d="M457 108 Q462 100 466 104 Q464 110 457 110Z" fill="#1a0828"/>
  <path d="M418 112 Q410 120 406 118 Q408 112 418 110Z" fill="#1a0828"/>
  <path d="M452 112 Q460 120 464 118 Q462 112 452 110Z" fill="#1a0828"/>
  <path d="M435 94 Q445 80 455 70 Q452 80 458 88 Q448 85 435 94Z" fill="#22103a"/>
  <ellipse cx="458" cy="70" rx="4" ry="3" fill="#9030c0" opacity=".9"/>
  <circle style="animation:_eglow 1.8s ease-in-out infinite 1s" cx="428" cy="94" r="2.8" fill="#cc00ff"/>
  <circle style="animation:_eglow 1.8s ease-in-out infinite 1.4s" cx="442" cy="94" r="2.8" fill="#cc00ff"/>
  <circle cx="428" cy="94" r="1.2" fill="#1a0020"/>
  <circle cx="442" cy="94" r="1.2" fill="#1a0020"/>
</g>
<text x="435" y="165" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#8830b0" opacity=".85">🦂 沙漠蠍王</text>
<text x="260" y="14" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#506040" opacity=".6">三個威脅，從黑暗中浮現</text>
<text x="260" y="177" text-anchor="middle" font-family="Georgia,serif" font-size="10" fill="#506040" opacity=".65">用腦子去贏。</text>
</svg>`,
            content: `這片廣東的森林，隱藏著三個威脅。

🐻  北方密林 — 黑熊
  體型最龐大的陸生獵食者。
  眼睛不好，但嗅覺敏銳。
  用毒與智謀，你有機會讓牠自取滅亡。

🦈  南方水澤 — 大白鯊
  潛伏水中的幽靈，代表無處可逃的恐懼。
  利用牠對水的依賴——
  離開了水，牠就什麼都不是。

🦂  西方荒地 — 沙漠蠍王
  比你更毒的毒液，比你更快的速度。
  但速度和力量，從來不是唯一的答案。

養父母曾說：
「與其和敵人硬碰硬，不如讓敵人自相殘殺。」

————

吃果子，是在儲存生存的力量。
選擇器官，是在決定進化的方向。
擊敗 Boss，是在掌控一片區域的生態。

每一次勝利，都是朝著復仇更近一步。

現在，輪到你改寫這片森林。

「用腦子去贏。」`
        }
    ];
}
```

---

## 🔧 手機端適配

在 `showGuideStory()` 中，`book` 創建後加入：

```javascript
if (_effectiveMobile && _effectiveMobile()) {
    book.style.maxWidth = '98%';
    illustrationArea.style.height = '140px';
    textArea.style.padding = '14px 20px 8px';
    storyText.style.fontSize = '12.5px';
}
```

---

## 🚨 注意事項

1. **不使用 ES Modules**，全部用傳統函式，放在 `systems/ui.js`
2. `showGuideStory()` 加入 **`MAIN.md` 函式清單**
3. `_getGuideStoryPages()` 為內部輔助函式，**命名加底線前綴**
4. 修改完畢後更新 **`CHANGELOG.md`** 和版本號
5. `localStorage.setItem('hasPlayedBefore', 'true')` 在兩個地方呼叫：
   - `initializeGame()` 開頭
   - Guide Story 最後一頁點「開始冒險」時
6. `guide-story-overlay` 的 `z-index` 使用 **250**，高於 `start-screen` 的 200
7. SVG 動畫使用私有命名（`_blink`、`_drift` 等）**避免與遊戲現有 CSS 衝突**

---

## 📝 CHANGELOG 更新範本

```markdown
## v0.X.X - 2026-05-XX

### 新增
- **首頁童書故事按鈕**：首頁左上角新增 📖 圖示按鈕，暖黃色半透明設計，hover 輕微放大，點擊觸發 `showGuideStory()`
- **噪鹃生存記 Guide Story 系統**：新增 `showGuideStory()` 和 `_getGuideStoryPages()`；童書風格 UI（米黃紙質背景、深棕文字），4 頁故事各附 SVG 動畫插畫（破曉/孤兒/蛻變/試煉），翻頁進度點導航
- **First Time Player 判斷**：`window.onload` 改為檢查 `localStorage.hasPlayedBefore`；首次玩家自動彈出 Guide Story；`initializeGame()` 開頭自動寫入標記
```

---

## ✅ 完成驗收清單

- [ ] 首頁左上角出現 📖 故事按鈕，hover 有放大效果
- [ ] 點擊按鈕打開童書風格 Overlay（米黃背景，左側深棕邊線）
- [ ] 每頁上半部顯示 SVG 動畫插畫，切頁時有淡入淡出
- [ ] 每頁下半部顯示故事文字，切頁時有淡入效果
- [ ] 翻頁按鈕、進度點（變長條）、關閉按鈕均正常運作
- [ ] 第 4 頁「⚔️ 開始冒險」按鈕顏色變綠色，正確觸發 `initializeGame()`
- [ ] 清除 `localStorage` 後刷新頁面，Guide Story 自動彈出
- [ ] 玩過一次後刷新頁面，直接進入普通首頁，不再自動彈出
- [ ] 手機版插畫區縮小至 140px 高，文字大小適當縮小
- [ ] `MAIN.md` 已更新函式清單
- [ ] `CHANGELOG.md` 已更新，版本號已更新
