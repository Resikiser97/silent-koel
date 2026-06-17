請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用。

---

# 任務：靜音獵隊精英怪數值機制全面修正（HP/傷害/速度公式統一 + 犬隼差異化 + 獎勵表依難度拆分）

## 背景

困難難度精英怪（幽靈犬/暗影犬/毒霧犬、幽靈隼/暗影隼/毒霧隼）目前 HP/傷害是「綁在身份」上的固定值（`HARD_ELITE_CONFIG[eliteType].hp/damage`），速度也是固定值 3.9（讀取 `tier.speed`，但地圖資料裡欄位其實叫 `speedBonus`，等於永遠讀不到，一律 fallback 3.9）。簡單/普通難度則是依「第幾夜」用倍率公式算出來的。

開發者已確認三項修正，全部一起做、同一個版本：

1. 困難難度的 HP/傷害/速度也改用跟簡單/普通同一套「依夜晚倍率計算」公式，身份不再決定強弱，只決定打法/技能/外觀。連帶把速度公式本身也修正（原本太慢，且困難難度完全沒套用地圖難度倍率）。
2. 困難難度新增「犬／隼」差異化倍率：隼的 HP＝犬 HP×0.7，傷害＝犬傷害×1.3，速度跟犬相同。
3. `HUNTER_ELITE_REWARDS` 從共用單一表，改成依難度（easy/normal/hard）分三張表。

身份落在哪一夜維持現有開局隨機洗牌不變，`initEliteOrder()` 不要動。

## 需要修改的地方

### 1. `map/normalmap.js` — `elites` 陣列 hpMultiplier

把：
```js
elites: [
    { night: 1, hpMultiplier:  5, speedBonus: 0.3, damageMultiplier: 1.5 },
    { night: 2, hpMultiplier: 10, speedBonus: 0.7, damageMultiplier: 2.1 },
    { night: 3, hpMultiplier: 20, speedBonus: 1.5, damageMultiplier: 2.9 },
],
```
改成（只改 hpMultiplier，damageMultiplier/speedBonus 不動）：
```js
elites: [
    { night: 1, hpMultiplier:  6, speedBonus: 0.3, damageMultiplier: 1.5 },
    { night: 2, hpMultiplier: 12, speedBonus: 0.7, damageMultiplier: 2.1 },
    { night: 3, hpMultiplier: 18, speedBonus: 1.5, damageMultiplier: 2.9 },
],
```

### 2. `map/hardmap.js` — `elites` 陣列 hpMultiplier

把：
```js
elites: [
    { night: 1, hpMultiplier:  8, speedBonus: 0.5, damageMultiplier: 2.0 },
    { night: 2, hpMultiplier: 15, speedBonus: 1.0, damageMultiplier: 3.0 },
    { night: 3, hpMultiplier: 25, speedBonus: 2.0, damageMultiplier: 4.0 },
],
```
改成（只改 hpMultiplier，damageMultiplier/speedBonus 不動）：
```js
elites: [
    { night: 1, hpMultiplier:  7, speedBonus: 0.5, damageMultiplier: 2.0 },
    { night: 2, hpMultiplier: 14, speedBonus: 1.0, damageMultiplier: 3.0 },
    { night: 3, hpMultiplier: 21, speedBonus: 2.0, damageMultiplier: 4.0 },
],
```

簡單難度（`map/easymap.js`）的 `elites` 不要動。

### 3. `systems/elite.js` — `_spawnHunterElite()` 函式（目前約第78–98行）

把現有的：
```js
function _spawnHunterElite(nightNum, eliteType) {
    const cfg  = HARD_ELITE_CONFIG[eliteType];
    const map  = gameState.currentMap;
    const tier = map.elites[nightNum - 1];
    const meta = _HUNTER_ELITE_META[eliteType];
    const star = _HUNTER_ELITE_STARS[nightNum - 1] || _HUNTER_ELITE_STARS[0];
    const isHardMap = !!(map.features && map.features.hardElites);

    // 困難地圖：固定數值；Easy/Normal 地圖：依地圖 elites 倍率動態計算
    const strengthMult = (!isHardMap && gameState.currentMap && gameState.currentMap.creatureStrength)
        ? (gameState.currentMap.creatureStrength.hostile.hpMultiplier || 1)
        : 1;
    const hp = isHardMap
        ? cfg.hp
        : Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * strengthMult);
    const damage = isHardMap
        ? cfg.damage
        : Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier);
    const speed  = isHardMap
        ? (tier.speed || 3.9)
        : (ELITE_CONFIG.base.speed + tier.speedBonus);
```

改成所有難度統一公式（移除 `isHardMap` 變數與分支，困難難度不再讀 `cfg.hp`/`cfg.damage`；新增犬／隼差異化倍率；速度公式改成套用地圖 `speedMultiplier`）：
```js
function _spawnHunterElite(nightNum, eliteType) {
    const cfg  = HARD_ELITE_CONFIG[eliteType];
    const map  = gameState.currentMap;
    const tier = map.elites[nightNum - 1];
    const meta = _HUNTER_ELITE_META[eliteType];
    const star = _HUNTER_ELITE_STARS[nightNum - 1] || _HUNTER_ELITE_STARS[0];

    // 地圖難度倍率（三難度統一套用，不分困難/非困難）
    const strength  = (map && map.creatureStrength && map.creatureStrength.hostile) || {};
    const hpMult     = strength.hpMultiplier    || 1;
    const speedMult  = strength.speedMultiplier || 1;

    // 隼族（Falcon）強度差異化：HP ×0.7、傷害 ×1.3；犬族維持 ×1（不影響速度）
    const speciesHpMult  = eliteType.includes('Falcon') ? 0.7 : 1;
    const speciesDmgMult = eliteType.includes('Falcon') ? 1.3 : 1;

    const hp     = Math.round(ELITE_CONFIG.base.hp * tier.hpMultiplier * hpMult * speciesHpMult);
    const damage = Math.round(ELITE_CONFIG.base.damage * tier.damageMultiplier * speciesDmgMult);
    const speed  = ELITE_CONFIG.base.speed * 3 * speedMult + tier.speedBonus;
```

（函式其餘部分，例如 `r = cfg.radius`、`attackRange`、`aggroRange` 等不要動，那些是身份決定的打法/外觀資料，繼續從 `cfg` 讀取。）

確認後新數值對照表（完整三難度×三夜）：

| 難度 | 夜晚 | HP | 傷害 | 速度 |
|---|---|---|---|---|
| 簡單 | ★ | 250 | 12 | 3.3 |
| 簡單 | ★★ | 375 | 14 | 3.5 |
| 簡單 | ★★★ | 500 | 16 | 3.7 |
| 普通 | ★ | 450 | 12 | 4.8 |
| 普通 | ★★ | 900 | 17 | 5.2 |
| 普通 | ★★★ | 1350 | 23 | 6.0 |
| 困難（犬） | ★ | 875 | 16 | 6.5 |
| 困難（犬） | ★★ | 1750 | 24 | 7.0 |
| 困難（犬） | ★★★ | 2625 | 32 | 8.0 |
| 困難（隼） | ★ | 613 | 21 | 6.5 |
| 困難（隼） | ★★ | 1225 | 31 | 7.0 |
| 困難（隼） | ★★★ | 1838 | 42 | 8.0 |

這個數值變動已經跟開發者確認過，請直接套用，不需要再額外調整係數。

**`cfg`（`HARD_ELITE_CONFIG[eliteType]`）其餘欄位維持原樣使用，不要更動**：`radius`、`attackCooldown`、`type`（melee/ranged）、`range`、`bulletSpeed`、`pellets`、`spreadAngle`、毒霧相關參數（`poisonDps`、`puddleRadius` 等）——這些是身份決定的打法/技能，跟強度無關，繼續保留。

### 4. `config/gameConfig.js` — `HARD_ELITE_CONFIG`（約第27–39行）

`hp` 和 `damage` 這兩個欄位修改後不再被 `_spawnHunterElite()` 讀取。**不要整個刪除這個物件**（其餘欄位還在用），但請在 `hp`/`damage` 欄位旁加上註解說明「已不用於戰鬥數值計算，僅供歷史參考，實際強度依 `map.elites[].hpMultiplier`/`damageMultiplier` ＋犬隼差異化倍率計算」，避免未來有人誤改這兩個數字以為會生效。

### 5. `config/creatures.js` — `HUNTER_ELITE_REWARDS` 改為依難度分三表（約第28–32行）

把：
```js
export const HUNTER_ELITE_REWARDS = {
    1: { xp: 200, skillPts: 2, mutPts: 1 },
    2: { xp: 350, skillPts: 3, mutPts: 2 },
    3: { xp: 500, skillPts: 4, mutPts: 3 },
};
```
改成：
```js
export const HUNTER_ELITE_REWARDS = {
    easy: {
        1: { xp: 200, skillPts: 1, mutPts: 0 },
        2: { xp: 350, skillPts: 2, mutPts: 0 },
        3: { xp: 500, skillPts: 3, mutPts: 0 },
    },
    normal: {
        1: { xp: 200, skillPts: 2, mutPts: 1 },
        2: { xp: 350, skillPts: 3, mutPts: 2 },
        3: { xp: 500, skillPts: 4, mutPts: 3 },
    },
    hard: {
        1: { xp: 200, skillPts: 3, mutPts: 2 },
        2: { xp: 350, skillPts: 4, mutPts: 3 },
        3: { xp: 500, skillPts: 5, mutPts: 4 },
    },
};
```

簡單難度故意不給變異點（`mutPts: 0`），這是開發者確認過的設計，不是漏寫。

### 6. `systems/elite.js` — `_handleHunterEliteKill()`（約第201–217行）查表邏輯改依難度

把：
```js
export function _handleHunterEliteKill(elite) {
    const rewards = HUNTER_ELITE_REWARDS[elite.starTier] || HUNTER_ELITE_REWARDS[1];
```
改成：
```js
export function _handleHunterEliteKill(elite) {
    const difficulty = (gameState.currentMap && gameState.currentMap.difficulty) || 'easy';
    const table   = HUNTER_ELITE_REWARDS[difficulty] || HUNTER_ELITE_REWARDS.easy;
    const rewards = table[elite.starTier] || table[1];
```
其餘函式內容（`gameState.skillPoints += rewards.skillPts;` 等）不要動，邏輯不變，只是 `rewards` 的來源改了。

`gameState.currentMap.difficulty` 已存在於三張地圖設定（`easymap.js`/`normalmap.js`/`hardmap.js`），值分別是 `'easy'`/`'normal'`/`'hard'`，不需要新增。

### 7. 修改前請先搜尋確認

請搜尋整個專案是否有其他地方讀取：
- `HARD_ELITE_CONFIG[xxx].hp` 或 `.damage`（例如 UI 顯示、圖鑑、測試檔案）
- `HUNTER_ELITE_REWARDS[數字]`（舊的單層 key 用法，例如圖鑑頁面顯示獎勵預覽）

若有找到，請一併確認並同步改成依難度查表的新結構，不要假設只有 `elite.js` 用到。

### 8. 不要修改的部分

- `initEliteOrder()`（身份出現順序的開局隨機洗牌邏輯）完全不要動。
- `config/compendium_data.js` 的精英怪圖鑑文案**不要動**，開發者會自己另外處理。

## 版本與文件同步

- 版本號：v0.1.25.8 → **v0.1.25.9**（z+1，bug fix／數值調整類別，已確認）。
- 同步更新 `CHANGELOG.md`、`project_summary.md`、`QUICKREF.md`、`config/gameConfig.js`（若有版本常數）等慣例上會記錄版本號的檔案。
- `CHANGELOG.md` 開發者向條目請清楚寫明三項修正各自的內容（困難難度 HP/傷害/速度公式統一、速度公式新增地圖難度倍率、犬隼差異化倍率、HUNTER_ELITE_REWARDS 依難度拆表），並附上修正前後數值對照表。
- `config/patchnotes.js` 玩家向條目請用平易語氣描述（**不要出現 seed / mapSeed 等技術字眼**），例如類似：「修正靜音獵隊精英怪數值機制：強度改為依出場夜晚與難度決定，跟簡單/普通難度精英怪採用相同規則，身份只影響打法與技能；隼族精英怪血量較低但攻擊較高；同步調整精英怪擊殺獎勵，依難度給予不同技能點/變異點。」可依實際修改潤飾文字，但語氣需跟現有 patchnotes 風格一致。
- Patchnote 必須與代碼在同一個 commit。

## 重要：不要 commit / push

代碼與文件修改完成後，**不要執行 git commit 或 push**。請完成修改、跑一次基本檢查（語法、有無其他地方引用到改動的欄位）後，把修改摘要回報給開發者，等開發者親自審查後才會下指令 commit。
