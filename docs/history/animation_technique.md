# 動畫技術備忘 — Math.sin 週期擺動

## 技術說明

用 `Date.now()` 搭配 `Math.sin()` 實現週期性擺動動畫，完全在Canvas每幀繪製，不需要精靈圖或SVG動畫。

### 核心公式

```javascript
// t = 當前時間（毫秒）
const t = Date.now();

// 基本擺動，-1 到 +1 之間週期變化
// period = 週期毫秒數（越小越快）
const swing = Math.sin(t / period);

// 套用到角度（弧度）
const legAngle = baseAngle + swing * maxSwing;

// 套用到位移
const offsetX = swing * maxOffset;
```

### 多腳不同相位

讓腳看起來輪流擺動，用相位偏移（phase offset）：

```javascript
const t = Date.now();
const period = 300; // 300ms一個週期

// 四條腿，相位差 π/2（四分之一週期）
const leg1 = Math.sin(t / period + 0);
const leg2 = Math.sin(t / period + Math.PI / 2);
const leg3 = Math.sin(t / period + Math.PI);
const leg4 = Math.sin(t / period + Math.PI * 1.5);
```

### 實際繪製範例（四條腿）

```javascript
function _drawWalkingLegs(ctx, r, legColor) {
    const t = Date.now();
    const period = 300;
    const maxSwing = 0.4; // 最大擺動角度（弧度）
    const legLen = r * 0.7;

    const phases = [0, Math.PI / 2, Math.PI, Math.PI * 1.5];
    // 腿的基本位置（身體四個方向）
    const legPositions = [
        { bx: -r * 0.5, by: r * 0.6 },  // 左前
        { bx:  r * 0.5, by: r * 0.6 },  // 右前
        { bx: -r * 0.5, by: -r * 0.3 }, // 左後
        { bx:  r * 0.5, by: -r * 0.3 }, // 右後
    ];

    ctx.strokeStyle = legColor || ctx.fillStyle;
    ctx.lineWidth = r * 0.15;
    ctx.lineCap = 'round';

    for (let i = 0; i < 4; i++) {
        const swing = Math.sin(t / period + phases[i]) * maxSwing;
        const { bx, by } = legPositions[i];
        const endX = bx + Math.sin(swing) * legLen;
        const endY = by + Math.cos(swing) * legLen;

        ctx.beginPath();
        ctx.moveTo(bx, by);
        ctx.lineTo(endX, endY);
        ctx.stroke();
    }
}
```

---

## 適用對象

| 對象 | 狀態 | 備注 |
|---|---|---|
| Boss（黑熊/大白鯊/蠍王） | ✅ 待實作 | 形狀確認後再加 |
| 巨人化 | 🔲 待評估 | 視覺感確認後再決定 |
| Alpha | 🔲 待評估 | 視覺感確認後再決定 |

---

## 參數調校參考

| 效果 | period | maxSwing |
|---|---|---|
| 緩慢沉穩（黑熊） | 400~500ms | 0.3~0.4 rad |
| 快速輕盈 | 150~200ms | 0.5~0.6 rad |
| 水中游動（魚尾擺） | 500~600ms | 0.6~0.8 rad |
| 蟲子多腳 | 200~250ms | 0.3~0.5 rad |

---

## 注意事項

- 這個動畫每幀都在計算，確保只在Boss/目標生物**在螢幕範圍內**才呼叫
- 已有 `worldToScreen` 的視窗裁剪，不在視窗內不應呼叫繪製函式，才能安全
- 未來加入巨人化/Alpha時，直接呼叫 `_drawWalkingLegs` 並傳入對應的 `r` 和顏色即可
