# Phase 1 — Bug修復 + 毒傷減免 + 圓形散落全局函式

## 開始前必讀
請先讀取 `MAIN.md` 和 `CHANGELOG.md`，了解當前專案架構後再開始工作。

---

## 本次改動範圍

### 1. Bug修復：Boss毒傷未生效

**檔案：** `systems/combat.js`

**問題：** `updateStatusEffects()` 的 loop 只包含 `hostileCreatures`、`neutralCreatures`、`eliteArr`，Boss完全不在loop裡，導致毒傷tick不執行，Boss天然免疫毒傷。

**修復：** 把 `gameState.boss`（hp > 0時）加入 `updateStatusEffects()` 的loop。

注意：Boss的毒傷處理需要考慮毒傷減免（見下方毒傷減免系統），並且Boss死亡時走 `showVictory()`，不走 `handleKill()`。

---

### 2. Bug修復：念力波擊殺XP寫死

**檔案：** `systems/player.js`

**問題：** `updatePassiveOrgans()` 裡念力波擊殺敵意生物後直接寫死 `addXP(30)`，沒有走 `handleKill()`，導致：
- 沒有獵人本能加成
- 沒有屍體生成
- 沒有`showXPPopup`

**修復：** 念力波擊殺後統一走 `handleKill(c, true)`，移除寫死的 `addXP(30)` 和相關手動 `corpses.push`。

---

### 3. 新增：毒傷減免系統

**檔案：** `systems/combat.js`（`updateStatusEffects()`）

**規則：**
- 一般生物：0%減免（不變）
- 精英怪：20%減免（受100毒傷 → 實際扣80）
- Boss通用：30%減免
- 沙漠蠍王（`gameState.boss.name === '沙漠蠍王'`）：額外+20%，共50%減免

**實作方式：**
在 `updateStatusEffects()` 的毒傷tick扣血時，根據目標類型計算減免後的實際傷害值：
```javascript
// 偽代碼
let poisonResist = 0;
if (isElite) poisonResist = 0.2;
if (isBoss) poisonResist = 0.3;
if (isBoss && boss.name === '沙漠蠍王') poisonResist = 0.5;
const actualPoison = Math.round(poisonAmt * (1 - poisonResist));
```

浮動文字顯示實際扣血值（減免後），不顯示原始值。

---

### 4. 新增：圓形平均角度散落全局函式

**檔案：** `systems/combat.js` 或新增 `systems/utils.js`（放在現有 `drawArrow` 等工具函式旁）

**函式簽名：**
```javascript
function spawnLootCircle(cx, cy, items)
```

**參數：**
- `cx`, `cy`：散落中心點（死亡位置）
- `items`：陣列，每個元素為 `{ type, data }` 的掉落物描述
  - type可以是：`'corpse'`、`'bone'`、`'mutation'`（之後Phase用到）

**邏輯：**
- 計算每個item的角度：`angle = (2π / items.length) * index`
- 距離：中點往外隨機 10~25px
- 每個item的實際座標：`x = cx + cos(angle) * dist`、`y = cy + sin(angle) * dist`
- 不重疊（角度平均分配已保證）
- 支援item數量為1時直接隨機角度散落

**目前支援的掉落type：**
- `'corpse'`：`data = { multiplier }` → 生成屍體，radius根據multiplier縮放（1倍=正常，2倍=radius×1.5）
- `'bone'`：`data = {}`→ 直接呼叫 `_spawnBone(x, y, radius)`

**備注：** 之後Phase 3/4會傳入更多type，請確保函式容易擴充。

---

## MAIN.md 更新要求

請在 `MAIN.md` 的適當位置新增或更新以下內容：

**毒傷減免系統（新增區塊）：**
```
## 毒傷減免系統（v0.35.0）
- 精英怪：20%減免
- Boss通用：30%減免
- 沙漠蠍王：50%減免（通用30% + 專屬20%）
- 減免在 updateStatusEffects() 的毒傷tick扣血時計算
- 浮動數字顯示減免後實際值
```

**圓形散落函式（新增區塊）：**
```
## 圓形散落全局函式 spawnLootCircle(cx, cy, items)
- 位置：systems/utils.js
- 所有掉落物統一經過此函式
- 圓形平均角度，距中點10~25px隨機
- 支援type：corpse（含multiplier）、bone、mutation（待Phase 5）
```

---

## CHANGELOG.md 更新要求

新增版本條目（版本號接續當前最新版本+0.1）：

```
## v0.35.0 - [日期]

### 修復
- **Boss毒傷未生效**（`systems/combat.js`）：`updateStatusEffects()` 的loop加入 Boss，修復Boss天然免疫毒傷的問題；Boss死亡時走 `showVictory()`
- **念力波擊殺XP**（`systems/player.js`）：念力波擊殺統一走 `handleKill(c, true)`，移除寫死的 +30 XP，補齊獵人本能加成、屍體生成、XP浮動文字

### 新增
- **毒傷減免系統**（`systems/combat.js`）：精英怪20%、Boss通用30%、沙漠蠍王50%；浮動數字顯示實際扣血值
- **圓形散落全局函式 `spawnLootCircle`**（`systems/utils.js`）：所有掉落物統一經過此函式，圓形平均角度散落，距中點10~25px
```

---

## 完成後檢查清單

- [ ] Boss被毒刺攻擊後，毒傷每秒正常tick
- [ ] 沙漠蠍王毒傷浮動數字為原始值×50%
- [ ] 念力波擊殺敵意生物後有屍體掉落且XP正確
- [ ] `spawnLootCircle` 傳入2個item時，兩個item以180度分布散落
- [ ] MAIN.md已更新
- [ ] CHANGELOG.md已更新
- [ ] 版本號已更新
