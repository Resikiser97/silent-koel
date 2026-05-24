# Boss / 生物動畫實作指南

> 版本：v0.49.0（2026-05-23）  
> 基於黑熊 Boss 重製（boss-canvas-redesign 分支）的完整技術備忘  
> 所有動畫均以純 Canvas 2D API 實作，不依賴 SVG、精靈圖或外部動畫庫

---

## 目錄

1. [移動動畫規範](#一移動動畫規範)
2. [攻擊動畫規範](#二攻擊動畫規範)
3. [特效規範](#三特效規範)
4. [Z 軸繪圖順序規範](#四z-軸繪圖順序規範)
5. [顏色設計原則](#五顏色設計原則)
6. [給未來開發者的使用說明](#六給未來開發者的使用說明)

---

## 一、移動動畫規範

### 1-1 踏步動畫（黑熊後腿）

黑熊的後腿使用 **橢圓縮放 + y 位移** 模擬踩踏動感，不旋轉。

```javascript
// 速度連動：追擊時加快踏步頻率
const speedMult = (boss.state === 'chasing') ? 1.9 : 1.0;
const period    = 450 / speedMult;   // 單位：毫秒

// 左右腿相位差 π → 一踩一抬
const stompL = Math.sin(t / period);
const stompR = Math.sin(t / period + Math.PI);

// scale > 1：腿被壓扁（踩地）；scale < 1：腿拉長（抬起）
const scaleL = 1.0 + stompL * 0.38;  // 範圍 0.62 ~ 1.38
const scaleR = 1.0 + stompR * 0.38;

// 踩地時腿橢圓輕微往下偏移
const offL = stompL * r * 0.09;
const offR = stompR * r * 0.09;

// 繪製（ry 乘以 scale 實現壓縮/拉伸效果）
ctx.ellipse(-r * 0.52, r * 0.68 + offL, r * 0.27, r * 0.55 * scaleL, 0, 0, Math.PI * 2);
ctx.ellipse( r * 0.52, r * 0.68 + offR, r * 0.27, r * 0.55 * scaleR, 0, 0, Math.PI * 2);
```

#### 可調整參數

| 參數 | 說明 | 建議範圍 | 黑熊值 |
|------|------|----------|--------|
| `period`（基礎） | 一個完整踏步的毫秒數 | 250ms（快）～ 600ms（慢） | 450ms |
| `speedMult` | 追擊時的速度倍率 | 1.5 ～ 2.5 | 1.9 |
| `0.38`（scale 幅度） | 踏步時腿的形變比例 | 0.2（細微）～ 0.5（誇張） | 0.38 |
| `r * 0.09`（off 幅度） | 踩地時的垂直位移比例 | r×0.05 ～ r×0.15 | r×0.09 |

---

### 1-2 尾鰭擺動動畫（大白鯊）

大白鯊的尾鰭使用 **旋轉角度 Math.sin** 實現左右搖擺。

```javascript
const speedMult = (boss.state === 'chasing') ? 1.9 : 1.0;
const period    = 550 / speedMult;
const tailSwing = Math.sin(t / period) * 0.5;  // 單位：弧度，±0.5rad ≈ ±28.6°

ctx.save();
ctx.translate(-r * 1.3, 0);  // 尾鰭根部位置
ctx.rotate(tailSwing);
// ... 繪製三角形尾鰭
ctx.restore();
```

#### 可調整參數

| 參數 | 說明 | 建議範圍 |
|------|------|----------|
| `period`（基礎） | 一次擺動毫秒數 | 400ms（急促）～ 700ms（悠緩） |
| `0.5`（maxSwing） | 最大擺動角度（弧度） | 0.3（細微）～ 0.8（誇張） |

---

### 1-3 面向翻轉（大白鯊）

鯊魚頭部永遠面向玩家，使用 `ctx.scale(-1, 1)` 水平翻轉。

```javascript
// 不需要 moveAngle，直接比較世界座標
const facingLeft = gameState.player && gameState.player.x < boss.x;
if (facingLeft) ctx.scale(-1, 1);
// 之後所有繪圖自動翻轉，包含尾鰭、鰭、眼睛
```

> ⚠️ `ctx.scale(-1, 1)` 必須在 `ctx.save()` → `ctx.translate(sx, sy)` 之後呼叫，
> 並在對應的 `ctx.restore()` 前有效，不會污染外層 context。

---

### 1-4 三腳步法（沙漠蠍王，六條腿）

六條腿分兩群，每群三腿交替邁步，組內後腿先出，相位差 10%。

```javascript
const step = Math.PI * 0.2;  // 10% × 2π
const legPhases = [
    step * 2,           // 0: 左前 — 群A，第三出
    Math.PI + step,     // 1: 左中 — 群B，第二出
    0,                  // 2: 左後 — 群A，第一出（最先）
    Math.PI + step * 2, // 3: 右前 — 群B，第三出
    step,               // 4: 右中 — 群A，第二出
    Math.PI,            // 5: 右後 — 群B，第一出
];

// 末端 y 位移動畫（非旋轉）
const swing    = Math.sin(t / legPeriod + legPhases[i]);
const ey_anim  = ey - swing * r * 0.3;  // swing > 0 時腳往上抬

// 粗細切換：抬腳時細線（在空中），落地時粗線（支撐重量）
ctx.lineWidth = swing > 0 ? r * 0.09 : r * 0.14;
```

---

## 二、攻擊動畫規範

### 2-1 攻擊計時器原理

攻擊動畫基於 **`boss.attackCooldown`**（攻擊發動時刻的時間戳記）實作，不需要額外的動畫計時器欄位。

```javascript
// 在 updateBoss() 中，攻擊發動時記錄
boss.attackCooldown = Date.now();  // 設為當前時刻

// 在繪圖函式中，根據距離計算動畫進度
const t         = Date.now();              // 當前時間（由 drawBossShape 傳入）
const sinceAtk  = Math.max(0, t - (boss.attackCooldown || 0));  // 距上次攻擊的毫秒數
const windowMs  = 450;                     // 動畫持續視窗（毫秒）
const isAtk     = sinceAtk < windowMs && boss.attackCooldown > 0;

// 使用 Math.sin 製造 0→1→0 的弧線進度（比線性更自然）
const atkPhase  = isAtk ? Math.sin(sinceAtk / windowMs * Math.PI) : 0;
// atkPhase: 0（開始）→ 1（高峰，在 windowMs/2 時）→ 0（結束）
```

#### 為何使用 Math.sin 弧線

- `sinceAtk / windowMs` 產生 `0→1` 的線性進度
- 再乘以 `Math.PI`，輸入 `Math.sin()` 得到 `0→1→0` 的鐘形曲線
- 比 `atkPhase = 1 - sinceAtk/windowMs`（線性）更有**慢起、快衝、慢收**的揮擊感

```
atkPhase
  1.0 │       ╭─╮
  0.5 │     ╭╯   ╰╮
  0.0 │─────╯       ╰──── 時間
      0    windowMs/2  windowMs
```

---

### 2-2 黑熊手臂狀態機

手臂依 `isChasing` 和 `isAtk` 分三種狀態：

```javascript
const getArm = (side, phase) => {
    // side: -1=左臂, +1=右臂
    // isAtkArm: 此臂是否為本次攻擊的揮砍臂
    const isAtkArm = isAtk && (isCrit || ((atkLeg === 'left') === (side > 0)));
    //  atkLeg==='left'  → 左腳踩地 → 右臂(side=+1)攻擊 → "/" 軌跡
    //  atkLeg==='right' → 右腳踩地 → 左臂(side=-1)攻擊 → "\" 軌跡
    //  isCrit           → 兩臂同時攻擊 → "X" 軌跡

    if (isAtkArm) {
        // 攻擊：從高舉位橫掃（肩膀向對側推移，角度大幅翻轉）
        return {
            sx:    side * r * (0.70 - phase * 0.90),  // 肩膀向中線推進
            sy:    -r * 0.45 + phase * r * 0.75,      // 從高位下落
            angle: side * (1.20 - phase * 3.00)       // 大角度翻轉產生揮砍感
        };
    } else if (isChasing) {
        // 追擊蓄力：雙臂高舉外展（angle=±1.2rad ≈ ±69°）
        return { sx: side * r * 0.70, sy: -r * 0.45, angle: side * 1.20 };
    } else {
        // 閒置：手臂垂至身體下外側
        return { sx: side * r * 0.80, sy: r * 0.45, angle: side * 0.10 };
    }
};
```

#### 攻擊腳判斷（記錄時機：攻擊發動瞬間）

```javascript
// 在 updateBoss() 的攻擊發動區塊中
boss.attackCooldown = now;
boss.lastAttackCrit = isCrit;
// 記錄當前踏步相位（哪腳踩地）
const atkPeriod = 450 / 1.9;  // 追擊速度下的踏步週期
boss.lastAttackLeg = Math.sin(now / atkPeriod) > 0 ? 'left' : 'right';
```

---

### 2-3 手臂殘影（Ghost Trail）

在主手臂之前繪製 2 層半透明「過去位置」，呈現高速掃擊的殘影感。

```javascript
// 殘影只在攻擊時繪製
if (isAtk) {
    // 計算「稍早的 atkPhase 值」
    const trailPhases = [Math.max(0, atkPhase - 0.35), Math.max(0, atkPhase - 0.18)];
    const trailAlphas = [0.10, 0.22];  // 較遠的殘影更透明

    for (let ti = 0; ti < 2; ti++) {
        // 僅繪製攻擊臂的殘影（非攻擊臂不需要）
        if (isCrit || atkLeg === 'right') drawArm(-1, trailPhases[ti], trailAlphas[ti]);
        if (isCrit || atkLeg === 'left')  drawArm( 1, trailPhases[ti], trailAlphas[ti]);
    }
}
// 主體手臂（完整不透明度）
drawArm(-1, atkPhase, 1.0);
drawArm( 1, atkPhase, 1.0);
ctx.globalAlpha = 1.0;  // 務必還原，避免影響後續繪圖
```

#### 殘影層數與透明度建議

| 層數 | phase 偏移 | alpha | 視覺效果 |
|------|-----------|-------|---------|
| 第 1 層（最遠） | -0.35 | 0.10 | 極淡的殘影輪廓 |
| 第 2 層 | -0.18 | 0.22 | 稍明顯的中間殘影 |
| 主體 | 0 | 1.0 | 完整手臂 |

---

## 三、特效規範

### 3-1 爪痕特效（黑熊攻擊）

爪痕以 **ctx.stroke 漸長線段** 實現，繪於身體之上、頭部之下，確保無論手臂橢圓位置如何都能清楚可見。

```javascript
if (isAtk && atkPhase > 0.05) {
    ctx.save();
    // 透明度跟隨 atkPhase：鐘形曲線，起始與結束都淡
    ctx.globalAlpha = Math.sin(sinceAtk / 450 * Math.PI) * 0.90;
    ctx.strokeStyle = isCrit ? '#ff8800' : '#dd2200';  // 暴擊橙紅 / 普攻深紅
    ctx.lineWidth   = r * 0.12;                         // 建議範圍：r×0.08 ～ r×0.18
    ctx.lineCap     = 'round';

    // 普攻：單側 3 條；暴擊：雙側 6 條（形成 X）
    const clawSides = isCrit ? [1, -1] : [atkLeg === 'left' ? 1 : -1];

    for (const side of clawSides) {
        for (let ci = -1; ci <= 1; ci++) {
            const ox  = ci * r * 0.13;          // 三條爪痕之間的水平間距
            const cx1 = side * r * 0.50 + ox;  // 起點 x（身體上方偏一側）
            const cy1 = -r * 0.35;              // 起點 y（身體上方）
            const cx2 = -side * r * 0.28 + ox; // 終點 x（斜向對側）
            const cy2 = r * 0.48;               // 終點 y（身體中下方）

            // 漸長：從起點到 atkPhase 進度處的位置
            ctx.beginPath();
            ctx.moveTo(cx1, cy1);
            ctx.lineTo(
                cx1 + (cx2 - cx1) * atkPhase,
                cy1 + (cy2 - cy1) * atkPhase
            );
            ctx.stroke();
        }
    }
    ctx.restore();
}
```

#### 爪痕可調整參數

| 參數 | 說明 | 建議值 |
|------|------|--------|
| `windowMs`（450） | 特效持續毫秒數 | 350ms（快猛）～ 600ms（重慢） |
| `lineWidth = r * 0.12` | 爪痕線寬 | r×0.08 ～ r×0.18 |
| `ci * r * 0.13` | 三條爪痕的間距 | r×0.09 ～ r×0.18 |
| `cx1 / cy1` | 起點（通常在身體上方） | 依生物形狀調整 |
| `cx2 / cy2` | 終點（通常在身體對角） | 依生物形狀調整 |
| 普攻色 `'#dd2200'` | 深紅 | 可換為任意鮮色 |
| 暴擊色 `'#ff8800'` | 橙紅 | 應比普攻更亮 |

---

### 3-2 眼睛脈動發光

Boss 眼睛用 `Math.sin` 實現週期性透明度變化，製造「呼吸感」。

```javascript
// 黑熊眼睛（慢脈動）
const glowPulse = 0.7 + Math.sin(t / 700) * 0.3;  // 範圍 0.4 ~ 1.0

// 蠍王眼睛（稍快，更強烈）
const glowPulse = 0.65 + Math.sin(t / 900) * 0.35;  // 範圍 0.30 ~ 1.00

ctx.globalAlpha = glowPulse;
ctx.fillStyle = C.eye;
ctx.arc(眼睛位置...);
ctx.fill();
ctx.globalAlpha = 1.0;  // 務必還原
```

#### 脈動參數建議

| 效果 | period | amplitude | 說明 |
|------|--------|-----------|------|
| 緩慢呼吸（黑熊） | 700ms | 0.30 | 柔和、穩重 |
| 中等（蠍王） | 900ms | 0.35 | 稍顯詭異 |
| 急促（狂暴狀態） | 300ms | 0.45 | 高張力感 |
| 很慢（休眠狀態） | 1500ms | 0.20 | 幾乎靜止 |

---

### 3-3 光暈環（Boss 召喚特效）

Boss 外圍光環在 `drawBoss()` 中以 `ctx.shadowBlur` 實作，與形狀繪製分開。

```javascript
ctx.save();
ctx.shadowColor = boss.glowColor || '#8B4513';
ctx.shadowBlur  = 10 + flicker * 12;  // flicker = Math.sin(Date.now() * 0.006) * 0.4 + 0.7
ctx.globalAlpha = 0.55 + flicker * 0.35;
ctx.strokeStyle = boss.glowColor;
ctx.lineWidth   = 4;
ctx.beginPath();
ctx.arc(s.x, s.y, r + 5, 0, Math.PI * 2);
ctx.stroke();
ctx.restore();
// ⚠️ 在 ctx.restore() 之後才呼叫 drawBossShape()，確保 shadowBlur 不影響形狀填色
drawBossShape(ctx, boss, s.x, s.y);
```

---

## 四、Z 軸繪圖順序規範

### 黑熊完整繪圖順序

```
1. 後腿橢圓（先畫，被身體蓋住根部 → 關節無縫接合）
2. 身體主橢圓（蓋住後腿根部）
3. 前臂殘影（攻擊時，半透明）← isAtk 條件下才畫
4. 前臂主體（不透明）
5. 爪痕特效（攻擊時，stroke 線段）← isAtk 條件下才畫
6. 頭部（覆蓋前臂根部 → 關節無縫接合）
7. 耳朵（頭部顏色，疊在頭上）
8. 眼睛（最後畫，確保清晰可見）
```

### 關鍵原則：肢體根部必須在身體橢圓內

若要讓身體蓋住關節根部，需驗算根部座標是否在身體橢圓內：

```
身體橢圓：center=(cx, cy), 半軸 rx, ry
根部座標(x, y)在橢圓內的條件：
    ((x - cx) / rx)² + ((y - cy) / ry)² < 1

// 黑熊身體：center=(0, r*0.2), rx=r*1.2, ry=r*0.75
// 後腿根部在(-r*0.52, r*0.68)：
//   ((-0.52)/1.2)² + ((0.68-0.2)/0.75)² = 0.188 + 0.410 = 0.598 < 1 ✓
```

> ⚠️ 手臂顏色切勿與身體相同！  
> 若 `limbs` 顏色 = `body` 顏色，手臂橢圓落在身體橢圓範圍內時會完全不可見。  
> 解法：`limbs` 使用明顯較淺的同色系（如 body `#2a1808` → limbs `#7a3d0c`）

---

## 五、顏色設計原則

### Boss 顏色常數結構

```javascript
const BOSS_COLORS = {
    bear: {
        body:  '#2a1808',   // 深色，身體主色
        head:  '#301c0a',   // 比 body 略淺，突出頭部層次
        limbs: '#7a3d0c',   // 明顯淺於 body！確保肢體可見
        eye:   '#cc4400',   // 高對比亮色，醒目
        pupil: '#1a0000',   // 深色瞳孔，與眼睛對比
    },
    // shark / scorp 結構相同...
};
```

### 可見性法則

| 情境 | 問題 | 解法 |
|------|------|------|
| 肢體與身體同色 | 肢體消失（不可見） | limbs 改為亮 15~30% 的同色系 |
| 肢體落在身體橢圓內 | 只看到外緣（如果有的話） | 調整肢體角度使中心落在橢圓外 |
| 攻擊特效被身體覆蓋 | 攻擊看不見 | 改用 ctx.stroke（不依賴填色位置）繪製特效 |

---

## 六、給未來開發者的使用說明

### 6-1 幫其他生物套用踏步動畫

複製此樣板，修改 `period` 和 `scaleAmp` 即可：

```javascript
function _drawMyCreature(ctx, r, t, creature) {
    const isChasing = creature && creature.state === 'chasing';
    const speedMult = isChasing ? 1.6 : 1.0;  // 依生物調整追擊倍率
    const period    = 400 / speedMult;          // ← 調整踏步速度（毫秒）
    const scaleAmp  = 0.30;                     // ← 調整踩踏幅度（0.2～0.5）

    const stompL = Math.sin(t / period);
    const stompR = Math.sin(t / period + Math.PI);
    const scaleL = 1.0 + stompL * scaleAmp;
    const scaleR = 1.0 + stompR * scaleAmp;
    const offL   = stompL * r * 0.08;
    const offR   = stompR * r * 0.08;

    // 繪製後腿
    ctx.fillStyle = MY_CREATURE_COLORS.limbs;
    ctx.beginPath();
    ctx.ellipse(-r * 0.45, r * 0.60 + offL, r * 0.20, r * 0.40 * scaleL, 0, 0, Math.PI * 2);
    ctx.fill();
    // ... 右腿對稱
}
```

---

### 6-2 幫其他生物套用攻擊爪痕特效

精英怪（`elite` 物件）或普通生物同樣可以使用 `attackCooldown` 時間戳記方式：

```javascript
// 在生物攻擊觸發時（updateEliteCreature / updateHostileCreature）：
creature.attackCooldown = Date.now();  // 已有此欄位，無需新增

// 在繪圖函式中：
function _drawMyCreatureAttackFX(ctx, r, t, creature, color = '#dd2200') {
    const sinceAtk = Math.max(0, t - (creature.attackCooldown || 0));
    const windowMs = 350;  // ← 調整特效持續毫秒
    if (sinceAtk >= windowMs || !creature.attackCooldown) return;

    const atkPhase = Math.sin(sinceAtk / windowMs * Math.PI);

    ctx.save();
    ctx.globalAlpha = atkPhase * 0.85;
    ctx.strokeStyle = color;
    ctx.lineWidth   = r * 0.11;  // ← 調整線寬
    ctx.lineCap     = 'round';

    // 3 條爪痕（可依需要改為 1 條或其他數量）
    for (let ci = -1; ci <= 1; ci++) {
        const ox = ci * r * 0.12;
        ctx.beginPath();
        ctx.moveTo(r * 0.4 + ox, -r * 0.3);
        ctx.lineTo(
            (r * 0.4 + ox) + (-r * 0.6) * atkPhase,  // ← 調整爪痕起點 / 方向
            -r * 0.3 + r * 0.6 * atkPhase
        );
        ctx.stroke();
    }
    ctx.restore();
}
```

---

### 6-3 幫生物加入面向翻轉

適用於左右對稱、頭部有明確方向的生物（如鯊魚、駝鹿）：

```javascript
function drawMyCreatureShape(ctx, creature, sx, sy) {
    ctx.save();
    ctx.translate(sx, sy);
    const r = creature.radius;
    const t = Date.now();

    // 面向翻轉：玩家在左 → 翻轉；玩家在右 → 不翻轉
    const facingLeft = gameState.player && gameState.player.x < creature.x;
    if (facingLeft) ctx.scale(-1, 1);

    _drawMyCreature(ctx, r, t, creature);
    ctx.restore();
}
```

> ⚠️ 不適用於全旋轉模式（如駝鹿）。全旋轉生物應使用 `ctx.rotate(creature._moveAngle)`。

---

### 6-4 手臂/附肢動畫建議流程

1. 確認附肢根部是否在身體橢圓**內部**（用橢圓方程式驗算）
2. 附肢先畫，身體後畫 → 身體自然蓋住根部
3. 附肢顏色必須與身體有明顯差異（亮度差 ≥ 20%）
4. 需要確保可見性時，加爪痕（stroke）特效作為保險

```
// 安全繪製順序模板
附肢（先） → 身體（蓋住根部） → 特效 → 頭部（蓋住前臂根部） → 眼睛
```

---

## 參數速查表

### 踏步動畫

| 生物類型 | period（ms） | speedMult | scaleAmp |
|---------|-------------|-----------|----------|
| 黑熊（現有） | 450 | 1.9 | 0.38 |
| 小型生物（參考） | 250 | 1.5 | 0.25 |
| 重型慢速（參考） | 600 | 1.3 | 0.45 |

### 攻擊視窗

| 攻擊類型 | windowMs | 說明 |
|---------|---------|------|
| 快速普攻 | 300～350ms | 敏捷型生物 |
| 黑熊重擊 | 450ms | 重型生物 |
| 蠍王鉗擊 | 700ms | 緩慢但強力 |

### 爪痕特效顏色

| 情境 | 建議色 |
|------|--------|
| 普通攻擊 | `#dd2200`（深紅） |
| 暴擊 | `#ff8800`（橙紅） |
| 毒攻擊 | `#88cc00`（毒綠） |
| 冰凍攻擊 | `#44aaff`（冰藍） |
| 火焰攻擊 | `#ff4400`（火橙） |
