# Phase 4 — 肉系吃屍體 + 殺手化 + 精英/Boss回血

## 開始前必讀
請先讀取 `MAIN.md` 和 `CHANGELOG.md`，確認Phase 1、2、3已完成後再開始。

---

## 本次改動範圍

### 1. 新增：肉系生物吃屍體系統（僅普通地圖）

**檔案：** `systems/creatures.js`

**觸發條件：**
- `gameState.currentMap.features.hostileEatMeat === true`
- 肉系生物（diet='carnivore'）在漫遊/休息狀態時，偵測到附近屍體（半徑60px內）
- 開始吃屍體，切換到 `state: 'eating'`

**吃屍體機制：**
- 每0.5秒一個tick（`eatTickTimer` 累計）
- 需吃6 ticks（3秒）完成一具屍體
- 吃屍體期間：`aggroRange` 暫時×1.5
- 有其他生物進入暫時aggroRange：立刻切換 `state: 'attacking'`，中斷吃屍體（進度重置）
- 吃完一具屍體：
  - 呼叫 `_carnivoreEatCorpse(creature, corpse)`
  - 屍體從 `gameState.corpses` 移除
  - 回復5% maxHP

**吃屍體成長（`_carnivoreEatCorpse`）：**
```javascript
function _carnivoreEatCorpse(creature, corpse) {
    creature.corpseEaten++;
    const bonus = creature.corpseEaten * 0.1; // 每吃1具+10%，不累乘
    creature.hp = Math.min(creature.maxHp, creature.hp + creature.maxHp * 0.05); // 回血5%

    // 成長數值（基礎值×bonus，不累乘）
    creature.maxHp    = creature.baseHp    * (1 + bonus);
    creature.hp       = Math.min(creature.maxHp, creature.hp);
    creature.speed    = creature.baseSpeed * (1 + bonus);
    creature.damage   = creature.baseDamage * (1 + bonus);
    creature.radius   = creature.baseRadius * (1 + bonus);

    // 殺手化觸發檢查
    if (creature.corpseEaten >= 5 && !creature.isKiller &&
        gameState.currentMap.features.killer) {
        _triggerKiller(creature);
    }
}
```

**備注：**
- `baseRadius` 在生物生成時記錄（與 `baseHp`、`baseSpeed`、`baseDamage` 一起）
- 簡單地圖（`hostileEatMeat: false`）：肉系生物不進入 `eating` state，不執行此邏輯

---

### 2. 新增：殺手化系統（僅普通地圖）

**檔案：** `systems/creatures.js`

**觸發：** `creature.corpseEaten >= 5` 且 `features.killer === true`

**殺手化數值（在當前數值基礎上，不累乘，基礎值計算）：**
```javascript
function _triggerKiller(creature) {
    creature.isKiller = true;
    creature.killerCorpseEaten = 0;  // 殺手化後新增吃屍體計數

    // 基礎值計算（不累乘）
    creature.aggroRange = creature.aggroRange * 2;
    creature.damage     = creature.baseDamage * (1 + 0.5 + 0.1 * creature.corpseEaten);   // +50%基礎+之前10%累計
    creature.speed      = creature.baseSpeed  * (1 + 0.3 + 0.1 * creature.corpseEaten);   // +30%基礎+之前10%累計

    creature.killerRegenTimer = 0;  // 每5秒回血1%計時器
}
```

**殺手化行為：**
- 繼續吃屍體：每多吃1具，`damage`/`speed`/`hp`/`radius` 各再+10%基礎值（`killerCorpseEaten`計數）
- 每5秒回復1% maxHP
- 獵殺其他生態區的肉食性：aggroRange內偶然遇到（被動偵測，不主動全圖追蹤）

**殺手化擊殺獎勵（新增 `handleKillerKill`）：**
```javascript
function handleKillerKill(creature) {
    const baseXP = creature.baseDamage * 2;  // 2倍XP（近似原本敵意生物計算×2）
    const xpMultiplier = Math.pow(1.1, creature.killerCorpseEaten);  // 每多吃1具×1.1（累乘）
    const finalXP = Math.round(baseXP * xpMultiplier) + (gameState.playerSkills.hunter || 0) * 10;
    addXP(finalXP);
    showXPPopup(creature.x, creature.y, finalXP);

    // 圓形散落：3份1倍屍體
    const items = [
        { type: 'corpse', data: { multiplier: 1 } },
        { type: 'corpse', data: { multiplier: 1 } },
        { type: 'corpse', data: { multiplier: 1 } },
    ];
    spawnLootCircle(creature.x, creature.y, items);

    // 變異點：100%掉落1個
    // 額外：殺手化後每吸收1具屍體，死亡時+N%機率掉落1~N個（N=killerCorpseEaten）
    addMutationPoints(1);  // 基礎1個
    if (creature.killerCorpseEaten > 0) {
        const extraChance = creature.killerCorpseEaten / 100;  // N%
        if (Math.random() < extraChance) {
            const extraAmount = Math.floor(Math.random() * creature.killerCorpseEaten) + 1;
            addMutationPoints(extraAmount);
        }
    }

    // 屍體掉落（殺手本身）
    gameState.corpses.push({ x: creature.x, y: creature.y, radius: creature.radius, spawnTime: Date.now() });
}
```

**死亡路由：**
在 `systems/combat.js` 的 `handleKill()` 裡，檢查 `creature.isKiller`，若是則走 `handleKillerKill()`。

---

### 3. 新增：精英怪回血（僅普通地圖）

**檔案：** `systems/elite.js`（`updateEliteCreature()`）

**觸發條件：** `gameState.currentMap.features.eliteRegen === true`

**回血邏輯：**
```javascript
// 在 updateEliteCreature() 裡新增
if (gameState.currentMap?.features?.eliteRegen) {
    const regenRate  = [0.01, 0.02, 0.03][tierIndex];  // 第1/2/3夜 1%/2%/3%
    const regenInterval = 5000;  // 每5秒
    if (now - (elite.regenTimer || 0) >= regenInterval) {
        elite.regenTimer = now;
        elite.hp = Math.min(elite.maxHp, elite.hp + elite.maxHp * regenRate);
    }
}
```

精英怪的 `tierIndex`（0/1/2）在 `spawnEliteCreature(nightNum)` 時記錄到 `elite.tierIndex = nightNum - 1`。

---

### 4. 新增：精英怪死亡掉落

**檔案：** `systems/organs.js`（`handleEliteKill()`）

在現有 `handleEliteKill()` 裡新增掉落：
```javascript
// 呼叫圓形散落
spawnLootCircle(c.x, c.y, [
    { type: 'corpse', data: { multiplier: 1 } },
    { type: 'bone', data: {} },
    { type: 'bone', data: {} },
    { type: 'bone', data: {} },
    { type: 'bone', data: {} },
]);
```

---

### 5. 新增：Boss回血（僅普通地圖）

**檔案：** `systems/boss.js`（`updateBoss()`）

**觸發條件：** `gameState.currentMap.features.bossRegen === true`

**回血邏輯：**
```javascript
// 在 updateBoss() 裡新增
if (gameState.currentMap?.features?.bossRegen) {
    const regenInterval = 10000;  // 每10秒
    const regenRate = 0.10;       // 10%
    if (now - (boss.regenTimer || 0) >= regenInterval) {
        boss.regenTimer = now;
        boss.hp = Math.min(boss.maxHp, boss.hp + boss.maxHp * regenRate);
    }
}
```

---

## MAIN.md 更新要求

新增以下區塊：

```
## 肉系吃屍體系統（v0.38.0，僅普通地圖）

### 機制
- 肉系生物偵測60px內屍體進入eating狀態
- 每0.5秒一tick，6 ticks（3秒）完成一具
- 吃屍體期間aggroRange×1.5，有生物進入立刻中斷
- 吃完回復5% maxHP

### 成長（不累乘，基礎值計算）
- 每吃1具：HP/速度/攻擊力/體積各+10%基礎值
- corpseEaten計數

## 殺手化系統（v0.38.0，僅普通地圖）

### 觸發
- 肉系生物吃滿5具屍體觸發
- isKiller=true，killerCorpseEaten獨立計數

### 殺手化數值（基礎值計算，不累乘）
- aggroRange翻倍
- 攻擊力+50%基礎+之前10%累計
- 速度+30%基礎+之前10%累計
- 每5秒回復1% maxHP
- 繼續吃屍體：每具再+10%基礎值

### 獵殺其他生態肉食性
- aggroRange內被動偵測（不主動全圖追蹤）

### 擊殺獎勵
- XP×2（累乘：每多吃1具×1.1）
- spawnLootCircle：3份1倍屍體
- 100%掉落1個變異點
- killerCorpseEaten=N → N%機率額外掉落1~N個變異點（死亡時結算一次）

## 精英/Boss回血（v0.38.0，僅普通地圖）

### 精英
- 第1夜：每5秒+1% maxHP
- 第2夜：每5秒+2% maxHP
- 第3夜：每5秒+3% maxHP
- elite.tierIndex 記錄夜晚等級（0/1/2）

### Boss
- 每10秒+10% maxHP

## 精英怪掉落（v0.38.0）
- 死亡掉1個1倍屍體+4具白骨（spawnLootCircle）
- 兩個難度都適用
```

---

## CHANGELOG.md 更新要求

```
## v0.38.0 - [日期]

### 新增
- **肉系吃屍體系統**（`systems/creatures.js`）：普通地圖肉系生物吃屍體成長（每具+10%基礎值，不累乘），0.5s tick / 3秒完成，吃屍體期間aggroRange×1.5，完成回血5%
- **殺手化系統**（`systems/creatures.js`）：吃滿5具觸發，aggroRange翻倍、攻擊+50%、速度+30%、每5秒回血1%；繼續吃屍體每具+10%；獵殺其他生態肉食性（被動）；擊殺XP×2（累乘）+3份屍體+變異點
- **精英怪回血**（`systems/elite.js`）：普通地圖，第1/2/3夜分別每5秒回復1/2/3% maxHP
- **Boss回血**（`systems/boss.js`）：普通地圖，每10秒回復10% maxHP
- **精英怪死亡掉落**（`systems/organs.js`）：死亡圓形散落1個1倍屍體+4具白骨
```

---

## 完成後檢查清單

- [ ] 普通地圖肉系生物發現屍體會靠近並開始吃
- [ ] 吃屍體期間有生物靠近會中斷並追擊
- [ ] 吃滿5具後aggroRange變大，行為改變
- [ ] 殺手化生物會攻擊其他生態的肉食性（在aggroRange內）
- [ ] 擊殺殺手化有圓形散落的3份屍體
- [ ] 普通地圖精英怪血量會緩慢回復
- [ ] 普通地圖Boss血量會緩慢回復
- [ ] 精英怪死亡有屍體和白骨圓形散落
- [ ] 簡單地圖沒有以上任何普通地圖專屬效果
- [ ] MAIN.md已更新
- [ ] CHANGELOG.md已更新
- [ ] 版本號已更新
