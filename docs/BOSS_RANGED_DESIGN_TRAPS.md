# Boss 與遠程怪設計陷阱手冊

> 本文件記錄在 v0.1.1.x 開發週期實際踩到的 Bug，以及根本原因與解法。
> 目標讀者：未來維護或設計新 Boss / 遠程精英怪的開發者。

---

## 陷阱 1：aggroRange 每幀覆蓋中間狀態（最嚴重）

### 症狀
- Boss 只繞圈、不開槍（Phase 1）
- Boss 站原地播放蓄力音效、不射擊（Phase 2/3）
- 音效每幀重複播放（glitch 音效）

### 根本原因
在 `_updateHunterBoss` 每個 Phase 的第一行：
```javascript
if (dist < boss.aggroRange) boss.state = 'chasing';
```
這行**每幀無條件執行**。當攻擊邏輯設定了中間狀態（`'aiming'`、`'pumping'`）後，下一幀這行就把它蓋回 `'chasing'`，使得：
- Phase 1/3：`'aiming'` 在 frame N 被設定 → frame N+1 變回 `'chasing'` → `if (boss.state === 'aiming')` 判斷 FALSE → 永遠不開槍。但進入 `'aiming'` 的那一幀 **音效已播**，玩家聽到 Charge 聲但看不到任何後續。
- Phase 2：`'pumping'` 被設定 → 下一幀回到 `'chasing'` → 攻擊判斷再次進入 `'pumping'`，`_pumpUntil` 每幀重設 → 永遠不觸發 `now >= _pumpUntil` → 音效每幀重播，Boss 完全不移動不射擊。

### 解法
在每個 Phase 的 aggroRange 判斷加保護：
```javascript
// Phase 1 / Phase 3
if (boss.state !== 'aiming' && dist < boss.aggroRange) boss.state = 'chasing';

// Phase 2
if (boss.state !== 'pumping' && dist < boss.aggroRange) boss.state = 'chasing';
```
**原則：任何「中間戰鬥狀態」都必須明確排除在 aggroRange 覆蓋條件之外。**

### 擴展到精英怪
精英怪（三隼）使用 `_aimTarget`/`_aimUntil` 而非 `elite.state` 表示蓄力，state 始終是 `'chasing'`，所以 aggroRange 覆蓋**對精英怪無害**。但若未來精英怪改用 state 表示中間狀態，同樣需要加保護。

---

## 陷阱 2：Canvas cull 把 Boss 視覺（含攻擊特效）一起剪掉

### 症狀
- Phase 1 Boss 在 1350px 繞圈（off-screen），玩家聽到 Charge 聲但看不到任何紅色雷射線
- 被 Boss 狙擊時毫無警告視覺

### 根本原因
`drawBoss()` 有 canvas cull 判斷：
```javascript
if (s.x < -100 || s.x > VIEW_W + 100 || ...) return;
```
Phase 1 的 `idealDist = 1350`，在 cameraZoom ≈ 0.8 時螢幕距離 ≈ 1080px，超出螢幕邊界（800 + 1080 = 1880 > 1700）。`drawBoss()` 直接 `return`，原本在 `_drawHunter` 內的雷射線也一起被跳過。

### 解法
將任何「對玩家有攻擊預警意義」的視覺（雷射線、準心）**移出 cull 之前獨立繪製**：
```javascript
function drawBoss() {
    const boss = gameState.boss;
    if (!boss || boss.hp <= 0) return;

    // ← 這段在 cull 之前執行
    if (boss.biome === 'hunter' && boss.state === 'aiming' && boss._aimTarget) {
        _drawHunterAimingWarning(boss);
    }

    const s = worldToScreen(boss.x, boss.y);
    if (s.x < -100 || ...) return;  // cull 在此之後
    ...
}
```
`_drawHunterAimingWarning` 從 Boss 世界座標直接繪線到玩家，Canvas 會自動裁切超出畫布的部分，玩家端能看到「從螢幕邊緣射入的紅色雷射線」。同時在玩家頭上繪製脈動準心，提供清楚的「你正在被鎖定」視覺。

**原則：攻擊預警視覺的顯示不應該依賴 Boss 本體是否在螢幕內。**

---

## 陷阱 3：遠程怪蓄力中繼續移動，導致跑出攻擊範圍後永遠不開槍

### 症狀
- 幽靈隼（specterFalcon）播放蓄力音效後立刻移動，有時跑出攻擊範圍導致 fire check 被跳過
- `_aimTarget` 殘留（stale），下次進入攻擊範圍立刻瞬間射擊，沒有蓄力動畫

### 根本原因
精英怪的蓄力邏輯（`_aimTarget`/`_aimUntil`）是在 `_updateHunterEliteChase` 的攻擊判斷塊內：
```javascript
if (dist < elite.attackRange) {
    if (cooldown up) {
        // 設定 _aimTarget, _aimUntil
    }
}
// kiting 移動 ← 永遠執行，不管有沒有在蓄力
if (dist < attackRange * 0.6) moveCreature(... back up ...);
else if (dist > attackRange) moveCreature(... chase ...);
```
kiting 移動沒有豁免蓄力中的怪，所以怪物邊蓄力邊後退，可能跑到 `dist > attackRange` 範圍外，使外層 `if (dist < attackRange)` 判斷失效，`_aimTarget` 殘留。

### 解法
在 kiting 移動之前加入蓄力中凍結保護：
```javascript
// 幽靈隼蓄力中靜止不動
if (elite.eliteType === 'specterFalcon' && elite._aimTarget) return;
// kiting 移動
...
```
**原則：任何需要「站立蓄力」的遠程怪，必須在移動邏輯中明確跳過蓄力中的幀。**

---

## 陷阱 4：遠程怪 3 個 puddle 上限後每幀都觸發攻擊判斷

### 症狀
- 毒霧隼（venomFalcon）放置 3 個腐蝕液體後，一直以最高速率後退（「逃跑」），不攻擊

### 根本原因
```javascript
function _fireVenomFalconShot(elite, p) {
    if (elite._venomPuddleCount >= 3) return;  // 直接 return
    // 以下才有 attackCooldown = Date.now() 和 _postShotTimer 設定
}
```
`return` 後 `attackCooldown` **沒有被更新**。下一幀攻擊判斷：`now - attackCooldown >= 4000` 仍然是 TRUE → 每幀都呼叫 `_fireVenomFalconShot` → 每幀都 `return`。同時 `_postShotTimer` 沒有被設定，kiting 沒有 500ms 停頓，怪物以最高速率連續後退。

### 解法
即使放置上限，也要重置 cooldown 和 postShotTimer：
```javascript
if (elite._venomPuddleCount >= 3) {
    elite.attackCooldown = Date.now();
    elite._postShotTimer = Date.now() + 500;
    return;
}
```
**原則：所有提前 return 的攻擊路徑都需要重置 cooldown，避免每幀觸發。**

---

## 陷阱 5：精英怪箭頭在 Boss 螢幕外時被抑制

### 症狀
- Phase 1 黑色獵人在螢幕外繞圈，同時精英怪也在螢幕外 → 玩家**兩個箭頭都看不到**

### 根本原因
```javascript
function drawEliteArrow() {
    // ...
    if (gameState.boss && gameState.boss.hp > 0) {
        if (bs.x < -20 || bs.x > VIEW_W + 20 || ...) return;  // Boss off-screen → 精英箭頭也不畫
    }
}
```
設計意圖應是「Boss 箭頭優先」，但實際效果是「Boss 箭頭顯示時精英箭頭消失」，Phase 1 的 Boss 恆在螢幕外，導致精英箭頭永遠被抑制。

### 解法
移除 Boss off-screen 抑制，Boss 和精英的箭頭各自獨立顯示：
```javascript
function drawEliteArrow() {
    if (!elite || elite.hp <= 0) return;
    if (elite on-screen) return;  // 只有在螢幕外才顯示
    drawArrow(...);  // 無條件顯示
}
```
**原則：兩個獨立敵人的導航箭頭不應該互相干擾。**

---

## 陷阱 6：飛行子彈視覺使用當前位置插值起點（而非發射位置）

### 症狀
- 毒霧隼的飛行毒球在怪物移動後軌跡跳動、視覺不穩定

### 根本原因
```javascript
// 每幀用 elite.x（當前位置）作為起點
const cx = elite.x + (elite._venomLandPos.x - elite.x) * progress;
```
怪物在後退，所以 `elite.x` 每幀都不同，球的出發點跟著移動。

### 解法
發射時記錄世界座標 `_venomFirePos`，繪製時用固定起點：
```javascript
// 發射時
elite._venomFirePos = { x: elite.x, y: elite.y };

// 繪製時
const fp = elite._venomFirePos || elite;
const cx = fp.x + (elite._venomLandPos.x - fp.x) * progress;
```
**原則：任何需要固定軌跡的飛行視覺，都要在發射那一刻記錄起點位置。**

---

## 設計 Boss / 遠程怪 Checklist

```
□ 所有「中間戰鬥狀態」（aiming / pumping / charging）是否排除在 aggroRange 覆蓋條件之外？
□ 攻擊預警視覺是否依賴 Boss 本體在螢幕內？若是，需移到 cull 判斷之前。
□ 所有提前 return 的攻擊路徑（上限/取消）是否仍然重置 attackCooldown？
□ 遠程怪蓄力期間是否正確凍結移動？
□ 飛行子彈視覺是否使用發射時的固定起點（而非怪物當前位置）？
□ 精英怪箭頭是否會被其他條件意外抑制？
□ 距離超出螢幕可視範圍的 Boss（如 1350px），其攻擊預警如何讓玩家感知？
```
