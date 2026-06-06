# 生物繪圖規格文件
> 版本：v0.48.0
> 最後更新：2026-05-23

---

## 旋轉模式

| speciesId | 旋轉模式 |
|---|---|
| moose  | 完整旋轉（`_moveAngle`） |
| beetle | 完整旋轉（`_moveAngle`） |
| croc   | 完整旋轉（`_moveAngle`） |
| camel  | 只左右翻轉（cos 正朝右，cos 負朝左） |
| lynx   | 只左右翻轉（同駱駝） |
| hyena  | 完全不旋轉，永遠朝上 |

---

## 顏色常數

```javascript
const CREATURE_COLORS = {
    moose:      '#8B4513',   // 深棕
    beetle:     '#1ABC9C',   // 青綠
    camel:      '#E8C87A',   // 淺沙白
    lynx:       '#A0826D',   // 灰褐
    croc:       '#6B8E23',   // 橄欖綠
    hyena:      '#8B6914',   // 深咖啡
    // 特殊狀態光暈
    giantized:  '#FF8C00',
    alpha:      '#FFD700',
    killerBase: '#CC2200',
};
```

---

## 主分派函式

```javascript
// moose / beetle / croc：完整旋轉（跟 _moveAngle）
// camel / lynx：只左右翻轉（cos 正朝右，cos 負朝左）
// hyena：完全不旋轉（永遠朝上）
function drawCreatureShape(ctx, creature, sx, sy) {
    const r     = creature.radius;
    const angle = creature._moveAngle || 0;

    ctx.save();
    ctx.translate(sx, sy);

    switch (creature.speciesId) {

        // ── 完整旋轉 ─────────────────────────────────────────
        case 'moose':
            ctx.rotate(angle);
            ctx.fillStyle = CREATURE_COLORS.moose;
            _drawMoose(ctx, r);
            break;

        case 'beetle':
            ctx.rotate(angle);
            ctx.fillStyle = CREATURE_COLORS.beetle;
            _drawBeetle(ctx, r);
            break;

        case 'croc':
            ctx.rotate(angle);
            ctx.fillStyle = CREATURE_COLORS.croc;
            _drawCroc(ctx, r);
            break;

        // ── 只左右翻轉 ────────────────────────────────────────
        case 'camel': {
            const facingRight = Math.cos(angle) >= 0;
            if (!facingRight) ctx.scale(-1, 1);
            ctx.fillStyle = CREATURE_COLORS.camel;
            _drawCamel(ctx, r);
            break;
        }

        case 'lynx': {
            const facingRight = Math.cos(angle) >= 0;
            if (!facingRight) ctx.scale(-1, 1);
            ctx.fillStyle = CREATURE_COLORS.lynx;
            _drawLynx(ctx, r);
            break;
        }

        // ── 完全不旋轉 ────────────────────────────────────────
        case 'hyena':
            ctx.fillStyle = CREATURE_COLORS.hyena;
            _drawHyena(ctx, r);
            break;

        default:
            ctx.fillStyle = '#888888';
            ctx.beginPath();
            ctx.arc(0, 0, r, 0, Math.PI * 2);
            ctx.fill();
    }

    ctx.restore();

    // 特殊狀態光暈（不跟旋轉，固定在世界座標）
    _drawCreatureGlow(ctx, creature, sx, sy);
}
```

---

## 形狀函式

> 所有函式以 `(0,0)` 為中心，`angle=0` 時頭朝右（+x），尾朝左（-x）。

### 駝鹿（moose）

```javascript
// 橢圓身體 + 頭部圓 + 鹿角從頭部往 ±y 兩側展開（完整旋轉）
// 旋轉後：移動方向兩側各一組鹿角，正確左右對稱
function _drawMoose(ctx, r) {
    // 身體橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 頭部小圓（前方 +x）
    ctx.beginPath();
    ctx.arc(r * 1.3, 0, r * 0.42, 0, Math.PI * 2);
    ctx.fill();

    // 鹿角（從頭部往 ±y 兩側展開，旋轉後變成移動方向的兩側）
    ctx.strokeStyle = ctx.fillStyle;
    ctx.lineWidth   = r * 0.18;
    ctx.lineCap     = 'round';

    // ── 上側鹿角（-y 方向）──
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  0);
    ctx.lineTo(r * 1.3, -r * 1.1);   // 主枝
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3, -r * 0.55);
    ctx.lineTo(r * 1.85, -r * 0.9);  // 往後分叉
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3, -r * 0.55);
    ctx.lineTo(r * 0.75, -r * 0.9);  // 往前分叉
    ctx.stroke();

    // ── 下側鹿角（+y 方向，鏡像對稱）──
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  0);
    ctx.lineTo(r * 1.3,  r * 1.1);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  r * 0.55);
    ctx.lineTo(r * 1.85, r * 0.9);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(r * 1.3,  r * 0.55);
    ctx.lineTo(r * 0.75, r * 0.9);
    ctx.stroke();
}
```

### 巨型甲虫（beetle）

```javascript
// 橢圓身體 + 橫向甲殼線 + 前方對稱彎鉤夾鉗（完整旋轉）
function _drawBeetle(ctx, r) {
    // 身體橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.1, r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();

    // 甲殼橫中線
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth   = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 1.0, 0);
    ctx.lineTo( r * 1.0, 0);
    ctx.stroke();

    // 上夾鉗（彎鉤，前方右側）
    ctx.strokeStyle = CREATURE_COLORS.beetle;
    ctx.lineWidth   = r * 0.18;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.8, -r * 0.3);
    ctx.quadraticCurveTo(r * 1.6, -r * 0.3, r * 1.5, r * 0.4);
    ctx.stroke();

    // 下夾鉗（對稱）
    ctx.beginPath();
    ctx.moveTo(r * 0.8,  r * 0.3);
    ctx.quadraticCurveTo(r * 1.6, r * 0.3, r * 1.5, -r * 0.4);
    ctx.stroke();
}
```

### 鱷魚（croc）

```javascript
// 菱形頭 + 小圓身體 + 長三角尾（完整旋轉）
// 比例：頭1 : 身1 : 尾2.2
function _drawCroc(ctx, r) {
    const unit = r;

    // 尾巴三角（左側，尖端朝左）
    const tailLen  = unit * 2.2;
    const tailBase = unit * 0.55;
    ctx.beginPath();
    ctx.moveTo(-unit * 0.5, -tailBase);
    ctx.lineTo(-unit * 0.5,  tailBase);
    ctx.lineTo(-unit * 0.5 - tailLen, 0);
    ctx.closePath();
    ctx.fill();

    // 身體小圓（中間）
    ctx.beginPath();
    ctx.arc(0, 0, unit * 0.6, 0, Math.PI * 2);
    ctx.fill();

    // 頭部菱形（右側，緊接身體）
    const hx = unit * 0.8;   // 菱形中心 x
    const hw = unit * 0.9;   // 半長（x 方向）
    const hh = unit * 0.45;  // 半寬（y 方向）
    ctx.beginPath();
    ctx.moveTo(hx + hw, 0);
    ctx.lineTo(hx,      -hh);
    ctx.lineTo(hx - hw,  0);
    ctx.lineTo(hx,       hh);
    ctx.closePath();
    ctx.fill();
}
```

### 駱駝（camel）

```javascript
// 扁橢圓身體 + 兩個駝峰 + 長頸 + 頭部（只左右翻轉）
function _drawCamel(ctx, r) {
    // 身體扁橢圓
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.75, 0, 0, Math.PI * 2);
    ctx.fill();

    // 駝峰左（半圓，上方偏左）
    ctx.beginPath();
    ctx.arc(-r * 0.4, -r * 0.7, r * 0.35, Math.PI, 0);
    ctx.fill();

    // 駝峰右（半圓，上方偏右）
    ctx.beginPath();
    ctx.arc(r * 0.25, -r * 0.7, r * 0.35, Math.PI, 0);
    ctx.fill();

    // 長頸（右側細長矩形）
    ctx.beginPath();
    ctx.roundRect(r * 1.0, -r * 0.55, r * 0.3, r * 0.7, r * 0.1);
    ctx.fill();

    // 頭部小圓（頸頂）
    ctx.beginPath();
    ctx.arc(r * 1.15, -r * 0.75, r * 0.32, 0, Math.PI * 2);
    ctx.fill();

    // 輪廓描邊（避免跟沙漠混色）
    ctx.strokeStyle = '#8B6914';
    ctx.lineWidth   = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 1.3, r * 0.75, 0, 0, Math.PI * 2);
    ctx.stroke();
}
```

### 猞猁（lynx）

```javascript
// 正立貓形：圓頭 + 三角耳 + 三角身體 + 彎尾（只左右翻轉）
// 頭在上（-y），身體往下（+y），尾巴預設在左側（-x），scale(-1,1) 後自動換到右側
function _drawLynx(ctx, r) {
    // 身體：圓潤三角（正立，底邊在下）
    ctx.beginPath();
    ctx.moveTo(0,        -r * 0.35);   // 頂點（頸部）
    ctx.lineTo(-r * 0.9,  r * 1.05);  // 左下腳
    ctx.lineTo( r * 0.9,  r * 1.05);  // 右下腳
    ctx.closePath();
    ctx.fill();

    // 頭部圓形（上方）
    ctx.beginPath();
    ctx.arc(0, -r * 0.85, r * 0.52, 0, Math.PI * 2);
    ctx.fill();

    // 左耳三角
    ctx.beginPath();
    ctx.moveTo(-r * 0.52, -r * 1.28);
    ctx.lineTo(-r * 0.68, -r * 1.75);
    ctx.lineTo(-r * 0.1,  -r * 1.35);
    ctx.closePath();
    ctx.fill();

    // 右耳三角
    ctx.beginPath();
    ctx.moveTo( r * 0.52, -r * 1.28);
    ctx.lineTo( r * 0.68, -r * 1.75);
    ctx.lineTo( r * 0.1,  -r * 1.35);
    ctx.closePath();
    ctx.fill();

    // 彎尾（左側 -x，預設尾在後方；scale(-1,1) 後自動換到右側）
    ctx.strokeStyle = CREATURE_COLORS.lynx;
    ctx.lineWidth   = r * 0.22;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.8, r * 0.75);
    ctx.quadraticCurveTo(-r * 1.55, r * 0.25, -r * 1.3, -r * 0.55);
    ctx.stroke();
}
```

### 鬣狗（hyena）

```javascript
// 圓臉 + 兩個圓耳 + 鼻子（永遠朝上，不旋轉）
function _drawHyena(ctx, r) {
    // 臉部圓形
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();

    // 左圓耳
    ctx.beginPath();
    ctx.arc(-r * 0.65, -r * 0.85, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // 右圓耳
    ctx.beginPath();
    ctx.arc(r * 0.65, -r * 0.85, r * 0.38, 0, Math.PI * 2);
    ctx.fill();

    // 鼻子小點
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(0, r * 0.2, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
}
```

---

## 特殊狀態光暈

```javascript
// 不跟著旋轉，以世界座標（sx, sy）繪製
function _drawCreatureGlow(ctx, creature, sx, sy) {
    let glowColor  = null;
    let glowRadius = creature.radius + 4;

    if (creature.isAlpha) {
        glowColor  = CREATURE_COLORS.alpha;
        glowRadius = creature.radius + 6;
    } else if (creature.isGiantized) {
        glowColor  = CREATURE_COLORS.giantized;
        glowRadius = creature.radius + 4;
    } else if (creature.isKiller) {
        const lv = creature.killerLevel || 0;
        const t  = Math.min(lv / 10, 1.0);
        const rv = Math.round(204 - t * 102);
        const gv = Math.round(34  - t * 34);
        glowColor  = `rgb(${rv},${gv},0)`;
        glowRadius = creature.radius + 2;
    }

    if (!glowColor) return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(sx, sy, glowRadius, 0, Math.PI * 2);
    ctx.strokeStyle = glowColor;
    ctx.lineWidth   = 3;
    ctx.globalAlpha = 0.8;
    ctx.stroke();
    ctx.restore();
}
```

---

## 設計備注

- 所有形狀以 `(0,0)` 為中心，頭朝右（+x），尾朝左（-x）
- 翻轉和旋轉由 `drawCreatureShape` 主分派函式處理
- 駱駝和猞猁用 `ctx.scale(-1, 1)` 實現左右翻轉
- 鬣狗永遠朝上，不受 `_moveAngle` 影響
- 猞猁尾巴永遠在移動反方向（翻轉後自動換邊）
- `_drawDirectionArrow` 為測試用函式，正式版已移除呼叫（函式定義保留）
- `_moveAngle` 在所有追擊、逃跑、跟隨移動處均即時更新，確保旋轉方向正確
