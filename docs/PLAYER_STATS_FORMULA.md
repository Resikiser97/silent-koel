# PLAYER_STATS_FORMULA — calcPlayerStats 完整參考手冊

> 版本：v0.1.23.1
> 對應模組：`config/playerStatsFormula.js`

---

## 1. 概覽

`calcPlayerStats` 是一個**純資料推算函式**，從角色設定與各類存檔資料計算出玩家的 10 個屬性快照。

- **不依賴 runtime / gameState**：只 import `config/` 層資料（`characters.js`、`organs.js`、`evolution.js`）
- **不產生副作用**：每次呼叫皆回傳新物件，不修改傳入參數
- **主要用途**：成就頁屬性面板（`systems/achievements.js`）、未來角色資訊 UI

### 函式簽名

```js
import { calcPlayerStats } from './config/playerStatsFormula.js';

calcPlayerStats(
    charId,          // string
    skills,          // object | null
    organs,          // object | array | null
    hiddenOrgans,    // object | array | null
    mutationLevels   // object | null
) → StatsResult
```

### 參數格式

| 參數 | 型別 | 說明 |
|------|------|------|
| `charId` | `string` | `CHARACTERS` 的 key，例如 `'koel'`、`'archerfish'` |
| `skills` | `{ [skillId]: level }` 或 `null` | 各技能等級（0–5）；傳 `null` 等同空物件 |
| `organs` | `{ [organId]: level }` 或 `[{id, level}]` 或 `null` | localStorage 格式（object）或 runtime 格式（array）皆可 |
| `hiddenOrgans` | `{ [organId]: any }` 或 `[{id}]` 或 `null` | 存在即套用，無等級概念 |
| `mutationLevels` | `{ fang, tail, wing, eye }` 或 `null` | 突變器官等級；傳 `null` 等同全 0 |

### 回傳結構

```js
{
    attack:      { final, base, skillAdd, organAdd, mutMultiplier },
    hpMax:       { final, base, skillAdd, organAdd, mutMultiplier },
    speed:       { final, base, skillAdd, organAdd, evoAdd, mutMultiplier },
    radius:      { final, base, organAdd },
    attackRange: { final, base, organAdd },
    tenacity:    { final, base, organAdd },
    critChance:  { final, base, organAdd },
    critMult:    { final, base, organAdd },
    fruitXP:     { final, base, skillAdd, mutMultiplier },
    killXP:      { final, base, skillAdd, mutMultiplier },
}
```

---

## 2. 資料來源對照表

| 屬性 | 基礎值來源 | 技能來源 | 器官 effect key | Evolution 來源 | Mutation key |
|------|-----------|---------|----------------|---------------|-------------|
| `attack` | 固定 `0`（見已知限制） | `terribleFang` × 2 + fangBonus | `attackAdd` | `attackAdd`（carnivore Lv1 = +2） | `fang`（× 1 + level × 0.01） |
| `hpMax` | `CHARACTERS[id].stats.hp` | `vitality` × 20 | `hpMaxAdd` | `hpMaxAdd`（herbivore 累加） | `tail`（× 1 + level × 0.01） |
| `speed` | `CHARACTERS[id].stats.speed` | `agility` × 0.6 | `speedAdd` | `speedBonus`（omnivore 累加） | `wing`（× 1 + level × 0.01） |
| `radius` | `CHARACTERS[id].stats.radius` | — | `radiusAdd`（逐級） | — | — |
| `attackRange` | `CHARACTERS[id].stats.attackRange` | — | `radiusAdd` 連動計算 | — | — |
| `tenacity` | `0` | — | `tenacityAdd`（上限 1.0） | — | — |
| `critChance` | `CHARACTERS[id].stats.critChance` | — | `critChanceAdd` | — | — |
| `critMult` | `CHARACTERS[id].stats.critMult` | — | `critMultiplierAdd` | — | — |
| `fruitXP` | `5` | `forager` × 3 | — | `fruitXPBonus`（herbivore Lv2+） | `eye`（× 1 + level × 0.01） |
| `killXP` | `10` | `hunter` × 10 | — | — | `eye`（× 1 + level × 0.01） |

資料來源檔案：
- 角色基礎值：`config/characters.js` → `CHARACTERS[id].stats`
- 器官效果：`config/organs.js` → `ORGANS[id].levels[i].effects`
- 隱藏器官效果：`config/organs.js` → `HIDDEN_ORGANS[id].effects`
- 進化路線效果：`config/evolution.js` → `EVOLUTION_PATHS[type].levels[i]`
- 技能加成：`config/evolution.js` → `SKILLS[id]`（等級倍率，函式內硬算）

---

## 3. 計算順序

### 3.1 器官前處理

```
1. _normalizeOrgans(organs)       → organMap（統一為 {id: level} object）
2. _normalizeHiddenOrgans(hidden) → hiddenMap（統一為 {id: true} object）
3. startOrganMap ← CHARACTERS[charId].startOrgans（永遠套用）
4. savedOrganMap ← organMap 中排除已在 startOrganMap 的 ID  ← Fix 2
5. combinedOrganMap = { ...startOrganMap, ...savedOrganMap }
```

**startOrgans vs savedOrgans 規則**：同一 ID 的器官，`startOrgans` 優先，`savedOrgans` 中的同 ID 項目跳過。理由：runtime `loadSavedOrgans` 的行為也是如此。

### 3.2 radiusAdd 逐級套用（Fix 1）

```
state = { r: char.stats.radius, ar: char.stats.attackRange }

for each (id, level) in combinedOrganMap:
    for i = 0 to level-1:
        radAdd = ORGANS[id].levels[i].effects.radiusAdd ?? 0
        if radAdd == 0: continue
        state.ar += Math.round(radAdd / Math.max(state.r, 1) * state.ar)
        state.r  += radAdd
```

每一級都用**當下的 r**來計算 `rangeIncrease`，而非先加總再套用。這是因為 runtime `applyOrganEffects` 每次升一級呼叫一次，使用的是升級後的即時 radius。

### 3.3 startEvolution 分支（Fix A）

```
function _startEvoEffect(char, key):
    if no startEvolution: return 0
    type  = char.startEvolution.type
    level = char.startEvolution.level
    path  = EVOLUTION_PATHS[type]

    if type == 'carnivore':
        return path.levels[level-1][key] ?? 0   // 只取最高那一級

    // herbivore / omnivore：逐級累加
    sum = 0
    for i = 0 to level-1:
        sum += path.levels[i][key] ?? 0
    return sum
```

| 進化類型 | 行為 | 理由 |
|---------|------|------|
| `carnivore` | 只取最高那一級（固定值覆蓋） | runtime `applyEvolutionEffects` 對 carnivore 是 override |
| `herbivore` | 逐級累加 | runtime 使用 for loop 逐級加成 |
| `omnivore` | 逐級累加（同 herbivore） | runtime 同上 |

### 3.4 terribleFang fangBonus 雙算防護（Fix B/C）

```
fangBonusLv = terribleFang >= 5 ? 2 : terribleFang >= 3 ? 1 : 0
terribleFangBonus =
    (fangBonusLv > 0 && !('fang' in combinedOrganMap))
    ? _fangOrganBonus(fangBonusLv)   // 從 ORGANS.fang.levels 推導（Fix 7）
    : 0
```

若 `fang` 已在 `combinedOrganMap`（無論來自 startOrgans 或 savedOrgans），器官的 `attackAdd` 已透過 `_sumEffects` 計算進 `atkOrganAdd`，不再補加 `terribleFangBonus`。

### 3.5 各屬性計算公式

**攻擊**
```
atkFinal = Math.round(
    (0 + tfSkillAdd + terribleFangBonus + atkOrganAdd + atkEvoAdd) × atkMut
)
```

**血量上限**
```
hpFinal = Math.round(
    (hp_base + vitality×20 + hpStartEvo + hpOrganAdd) × hpMut
)
```

**速度**
```
spdFinal = parseFloat(
    ((speed_base + agility×0.6 + spdOrganAdd + spdEvoAdd) × spdMut).toFixed(2)
)
```

**韌性**
```
tenFinal = Math.min(1.0, Σ tenacityAdd from combinedOrganMap)
// hiddenOrgans 不計韌性
```

**Mutation 倍率**
```
atkMut  = 1 + (mut.fang  ?? 0) × 0.01
hpMut   = 1 + (mut.tail  ?? 0) × 0.01
spdMut  = 1 + (mut.wing  ?? 0) × 0.01
xpMut   = 1 + (mut.eye   ?? 0) × 0.01  // 同時套用 fruitXP 和 killXP
```

---

## 4. 已知限制與未來擴展點

### char.stats.attack 存在但 base = 0

`CHARACTERS[id].stats.attack` 欄位存在，但 runtime 的攻擊基礎值為 `0`（攻擊全部由技能與器官組成）。`calcPlayerStats` 也以 `0` 為基底，不讀取 `char.stats.attack`。若未來有角色需要非零基礎攻擊，須同步修改此函式。

### agility 數值不一致

`config/evolution.js` SKILLS.agility 的 desc 標示每級 +0.2 速度，但實際 runtime 實裝為每級 +0.6（×3）。`calcPlayerStats` 沿用 runtime 實作值（`× 0.6`），文件描述為已知不一致，無需修復。

### evolution radiusPercent 未納入

herbivore Lv4/Lv5 包含 `radiusPercent` 欄位（百分比體型加成），目前 `_startEvoEffect` 只處理加法欄位，未計算此項。若未來有角色 startEvolution 達 Lv4 以上，需補入乘法分支。

### 成就加成預留

`calcPlayerStats` 回傳結構有充裕空間擴展 achievement bonus，目前 `systems/achievements.js` 顯示「尚未解鎖（待 v0.2.x）」靜態文字，公式端無需改動。

### 新增角色注意事項

- `startOrgans` 必須定義於 `config/characters.js`；若為空陣列請明確寫 `[]`
- `startEvolution` 若 `null` 表示無初始進化加成；若有，必須指定 `{ type, level }`
- 函式嚴禁寫死 charId 字串，所有邏輯應從 `CHARACTERS[charId]` config 推導

---

## 5. 引用此模組的方法

```js
// 靜態 import（ESM 模組）
import { calcPlayerStats } from '../config/playerStatsFormula.js';

// 從 localStorage 讀取資料後呼叫
import { storageGet, storageGetJSON, STORAGE_KEYS } from '../storage/index.js';

const charId       = storageGet(STORAGE_KEYS.LAST_CHARACTER) || 'koel';
const skills       = storageGetJSON(STORAGE_KEYS.PLAYER_SKILLS)       || {};
const organs       = storageGetJSON(STORAGE_KEYS.SAVED_ORGANS)        || {};
const hiddenOrgans = storageGetJSON(STORAGE_KEYS.SAVED_HIDDEN_ORGANS) || {};
const mutData      = storageGetJSON(STORAGE_KEYS.MUTATION_DATA)       || {};
const mutLevels    = mutData.levels || {};

const st = calcPlayerStats(charId, skills, organs, hiddenOrgans, mutLevels);

// 存取範例
console.log(st.hpMax.final);         // → 130（koel 無技能器官）
console.log(st.attack.skillAdd);     // → 技能加值
console.log(st.speed.evoAdd);        // → startEvolution speedBonus（omnivore 用）
console.log(st.tenacity.organAdd);   // → 原始累計韌性（未 clamp）
```

---

*本文件由 Claude Code 自動生成，最後更新：v0.1.23.1*
