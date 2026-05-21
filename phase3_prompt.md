# Phase 3 — 巨人化系統 + Alpha系統 + 上方血條UI

## 開始前必讀
請先讀取 `MAIN.md` 和 `CHANGELOG.md`，確認Phase 1和Phase 2已完成後再開始。

---

## 本次改動範圍

### 1. 新增：巨人化系統（僅普通地圖）

**檔案：** `systems/creatures.js`

**觸發條件：**
- 草系生物 `fruitsEaten >= 5`
- `gameState.currentMap.features.giantization === true`
- 移除現有的激進化（`diet === 'aggressive'`）邏輯

**觸發後數值變化（在原本數值基礎上修改）：**
```javascript
creature.isGiantized = true;
creature.damage += 20;                          // 攻擊力+20
creature.hp = creature.maxHp * 10;             // 血量×10倍（當前和上限都乘）
creature.maxHp = creature.maxHp * 10;
creature.radius = creature.radius * 1.5;       // 體積×1.5
creature.aggroRange = 150;
creature.diet = 'herbivore';                   // 維持草食性
creature.canFight = true;
creature.fruitsEaten = 0;                      // 重置
creature.giantRegenTimer = 0;                  // 回血計時器
creature.packLeader = false;                   // 是否為隊長
creature.packMembers = [];                     // 隊伍成員（只有隊長維護）
creature.packLeaderRef = null;                 // 指向隊長的reference
```

**巨人化行為：**
- 不再吃果子
- 保護同生態同族草食性（aggroRange內發現敵意生物/肉系，優先攻擊）
- 帶領同族草食性靠近果子（每隔3~5秒，選最近的果子作為移動目標，隊員跟隨）
- 每秒回復1% maxHP（`giantRegenTimer`累計，每1000ms +1% maxHp）

**組隊系統（同族限定）：**
- 巨人化生物自動成為隊長（`packLeader = true`）
- 普通同族草食性在800px內，有20%機率每3秒加入隊伍
- 組隊上限5隻（包含巨人化本身）
- 隊員超出800px時掉隊（從`packMembers`移除，`packLeaderRef`清空）
- 巨人化等待：如果隊員距離>600px，暫停移動等待隊伍
- 隊員跟隨：以隊長為目標，保持在400px內跟隨移動

**攻擊行為：**
- aggroRange內發現敵意生物或肉系生物：主動攻擊
- aggroRange內發現玩家（草食性Lv4+除外）：主動攻擊（視為威脅）
- 攻擊邏輯沿用現有戰鬥系統

---

### 2. 新增：Alpha系統（僅普通地圖）

**檔案：** `systems/creatures.js`

**觸發條件：**
- 某巨人化生物的 `packMembers` 中出現第2隻巨人化時
- 最早成為巨人化的那隻（`packLeader`）升格為Alpha
- 全圖只有1隻Alpha（`gameState.alphaCreature`）
- 已有Alpha時，第2隻巨人化不觸發新Alpha，維持原本巨人化狀態

**Alpha數值（在巨人化數值基礎上再計算）：**
```javascript
creature.isAlpha = true;
creature.damage = creature.damage * 2;          // 攻擊力翻倍
creature.hp = creature.hp * 3;                  // 血量×3
creature.maxHp = creature.maxHp * 3;
creature.radius = creature.radius * 1.5;        // 體積再×1.5
creature.aggroRange = 300;
creature.packFollowRange = 1000;                // 隊伍跟隨範圍改為1000px
creature.giantRegenRate = 0.02;                 // 每秒回復2%（覆蓋巨人化的1%）
```

**Alpha誕生全屏公告：**
```javascript
// 在 systems/ui.js 新增 showAlphaAnnouncement()
// 全屏顯示3秒，文字類似Boss出現的公告格式
// 文字：「⚠️ Alpha [物種名] 誕生了！」
```

**Alpha行為：**
- 繼承所有巨人化行為
- 跟隨範圍擴大到1000px
- 每秒回復2% maxHP

**gameState新增欄位：**
```javascript
gameState.alphaCreature = null;  // 全局只有一隻Alpha的reference
```

---

### 3. 巨人化/Alpha擊殺獎勵

**檔案：** `systems/combat.js`（`handleKill` 或新增 `handleGiantKill`）

**巨人化擊殺獎勵：**
- XP：普通草食性XP（20）× 3 = 60 XP（+獵人本能加成）
- 掉落：呼叫 `spawnLootCircle(x, y, items)`
  - items：`[{ type: 'corpse', data: { multiplier: 2 } }, { type: 'bone', data: {} }]`
- 變異點：100%掉落1個；額外10%機率掉落1~3個（隨機）
  - 呼叫 `addMutationPoints(amount)`（Phase 5實作，這裡先預留呼叫）

**Alpha擊殺獎勵：**
- XP：20 × 10 = 200 XP（+獵人本能加成）
- 掉落：呼叫 `spawnLootCircle(x, y, items)`
  - items：`[{ type: 'corpse', data: { multiplier: 2 } }, { type: 'corpse', data: { multiplier: 2 } }, { type: 'bone', data: {} }, { type: 'bone', data: {} }, { type: 'bone', data: {} }]`
- 變異點：100%掉落1個；額外20%機率掉落1~6個（隨機）
  - 呼叫 `addMutationPoints(amount)`

**備注：** `addMutationPoints()` 在Phase 5實作，這裡先寫空函式佔位：
```javascript
function addMutationPoints(amount) {
    // TODO: Phase 5 實作
    console.log('[Mutation] +' + amount + ' points (pending Phase 5)');
}
```

---

### 4. 新增：上方血條UI系統（簡單+普通地圖）

**檔案：** `systems/ui.js`

**顯示條件：**
- 玩家為中心2000px內存在以下任一目標：精英怪、Boss、巨人化生物、Alpha
- 普通生物不顯示
- 同時存在2個以上目標時，顯示最後被玩家**普通攻擊**命中的那隻（不含毒傷tick）

**追蹤邏輯：**
在 `systems/combat.js` 的 `playerAttack()` 裡，命中特殊目標（精英/Boss/巨人化/Alpha）時：
```javascript
gameState.topBarTarget = c;  // 記錄最後被攻擊的特殊目標
```
毒傷tick不更新此值。

**UI設計：**
- 位置：畫面頂部中央
- 寬度：400px，高度：約50px
- 內容由上到下：
  - 目標名稱（中文，例如「駝鹿（巨人化）」或「★★精英」或「黑熊」）
  - 血條（帶顏色，各目標顏色不同）
  - HP數值（當前/最大）
- 只在目標存活且在2000px內時顯示
- 目標死亡或離開2000px時淡出消失（0.5秒淡出）

**血條顏色建議：**
- 精英怪：紫色（沿用現有精英顏色）
- Boss：深紅色
- 巨人化：橙色
- Alpha：金色

**gameState新增欄位：**
```javascript
gameState.topBarTarget = null;      // 最後被攻擊的特殊目標reference
gameState.topBarFadeTimer = 0;      // 淡出計時器
```

---

## MAIN.md 更新要求

新增以下區塊：

```
## 巨人化系統（v0.37.0，僅普通地圖）

### 觸發
- 草系生物吃滿5顆果子觸發
- 移除舊版激進化（diet=aggressive）邏輯

### 巨人化數值（在原本基礎上）
- 攻擊力+20，血量×10倍，體積×1.5，aggroRange 150
- 每秒回復1% maxHP
- 不再吃果子

### 組隊（同族限定）
- 隊長制，上限5隻，跟隨範圍800px
- 普通同族草食性20%機率每3秒加入
- 超出800px掉隊，巨人化停下等待600px外的隊員

### 擊殺獎勵
- XP×3（基礎20×3=60）
- spawnLootCircle：1個2倍屍體+1具白骨
- 100%掉落1個變異點，10%額外1~3個

## Alpha系統（v0.37.0，僅普通地圖）

### 觸發
- 同一隊伍出現第2隻巨人化時，第1隻升格為Alpha
- gameState.alphaCreature，全圖只有1隻
- 誕生時全屏公告

### Alpha數值（巨人化基礎上）
- 攻擊力翻倍，血量×3，體積×1.5，aggroRange 300
- 跟隨範圍1000px，每秒回復2% maxHP

### 擊殺獎勵
- XP×10（基礎20×10=200）
- spawnLootCircle：2個2倍屍體+3具白骨
- 100%掉落1個變異點，20%額外1~6個

## 上方血條UI（v0.37.0）
- 玩家2000px內有精英/Boss/巨人化/Alpha時顯示
- 同時存在多隻：顯示最後被玩家普通攻擊命中的（不含毒傷）
- gameState.topBarTarget 記錄目標
- 目標死亡或離開2000px時0.5秒淡出
```

---

## CHANGELOG.md 更新要求

```
## v0.37.0 - [日期]

### 新增
- **巨人化系統**（`systems/creatures.js`）：草系生物吃滿5顆果子觸發，攻擊力+20、血量×10、體積×1.5、aggroRange 150、每秒回復1%血、組隊系統（同族上限5隻/800px）；移除舊版激進化邏輯
- **Alpha系統**（`systems/creatures.js`）：隊伍第2隻巨人化觸發第1隻升格Alpha，全圖唯一，攻擊力翻倍/血量×3/體積×1.5/aggroRange 300/每秒回復2%血；誕生全屏公告
- **上方血條UI**（`systems/ui.js`）：玩家2000px內有特殊目標時頂部顯示血條，追蹤最後被普通攻擊命中的目標，0.5秒淡出

### 調整
- 移除草系生物的激進化邏輯（diet=aggressive），由巨人化系統取代
```

---

## 完成後檢查清單

- [ ] 草系生物吃5顆果子後變大，血條增加，開始攻擊敵人
- [ ] 普通草食性會靠近巨人化生物跟隨
- [ ] 同族組隊上限5隻，超出800px掉隊
- [ ] 隊伍出現第2隻巨人化時，第1隻升格Alpha，全屏公告
- [ ] Alpha數值明顯比巨人化更大
- [ ] 擊殺巨人化有XP獎勵和屍體/白骨掉落（圓形散落）
- [ ] 玩家攻擊精英怪後，上方出現血條
- [ ] 玩家攻擊Alpha後，上方血條切換為Alpha
- [ ] 目標死亡後血條淡出
- [ ] 簡單地圖沒有巨人化和Alpha（features.giantization=false）
- [ ] MAIN.md已更新
- [ ] CHANGELOG.md已更新
- [ ] 版本號已更新
