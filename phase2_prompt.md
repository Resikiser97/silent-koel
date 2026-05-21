# Phase 2 — 生態生物系統 + 三態移動 + normalmap.js

## 開始前必讀
請先讀取 `MAIN.md` 和 `CHANGELOG.md`，確認Phase 1已完成後再開始。

---

## 本次改動範圍

### 1. 新增：normalmap.js

**檔案：** `map/normalmap.js`

參考 `map/easymap.js` 的結構，建立 `NORMAL_MAP` 常數：

```javascript
const NORMAL_MAP = {
    name:   '普通',
    nameEn: 'Normal',

    terrain: {
        noiseScale:          0.003,
        forestCenterRadius:  400,   // 簡單是600，普通縮小到400
        forestThreshold:     0.2,
        oceanThreshold:     -0.2,
        minBiomeTiles:       250,
        requiredBiomes:      ['forest', 'ocean', 'desert'],
    },

    creatureStrength: {
        neutral: { hpMultiplier: 1.5, speedMultiplier: 1.5, damageMultiplier: 1.5 },
        hostile: { hpMultiplier: 1.5, speedMultiplier: 1.5, damageMultiplier: 1.5 },
    },

    // 普通地圖移除速度和傷害上限cap
    removeHostileCap: true,

    // aggroRange全局提升
    aggroRangeOverride: 2000,

    elites: [
        { night: 1, hpMultiplier:   5, speedBonus: 0.3, damageMultiplier: 1.5 },
        { night: 2, hpMultiplier:  10, speedBonus: 0.7, damageMultiplier: 2.1 },
        { night: 3, hpMultiplier:  20, speedBonus: 1.5, damageMultiplier: 2.9 },
    ],

    bosses: [
        { biome: 'forest', name: '黑熊',     hp: 1500, speed: 4.5,  damage: 30, radius: 33, attackRange: 40 },
        { biome: 'ocean',  name: '大白鯊',   hp: 1800, speed: 5.85, damage: 36, radius: 40, attackRange: 47 },
        { biome: 'desert', name: '沙漠蠍王', hp: 1650, speed: 5.4,  damage: 40, radius: 37, attackRange: 43 },
    ],

    // 普通地圖專屬系統開關
    features: {
        giantization:    true,   // 巨人化系統（Phase 3）
        killer:          true,   // 殺手化系統（Phase 4）
        eliteRegen:      true,   // 精英回血（Phase 4）
        bossRegen:       true,   // Boss回血（Phase 4）
        hostileEatMeat:  true,   // 肉系吃屍體成長（Phase 4）
    },

    creatureAbilities: {
        neutral: [],
        hostile: [],
    },
};
```

在 `index.html` 的 `<script>` 標籤區加入 `map/normalmap.js`（在 `easymap.js` 之後）。

在 `systems/ui.js` 的 `showMapSelect()` 裡，將普通難度從🔒解鎖，改為可選並寫入 `gameState.currentMap = NORMAL_MAP`。

---

### 2. 新增：生態生物配置

**檔案：** `config/creatures.js`

在現有 `CREATURE_CONFIG` 下方新增 `BIOME_CREATURES`：

```javascript
const BIOME_CREATURES = {
    forest: {
        herbivore: { id: 'moose',   name: '駝鹿',   nameEn: 'Moose' },
        carnivore: { id: 'lynx',    name: '猞猁',   nameEn: 'Lynx'  },
    },
    ocean: {
        herbivore: { id: 'beetle',  name: '巨型甲虫', nameEn: 'Giant Beetle' },
        carnivore: { id: 'croc',    name: '鱷魚',   nameEn: 'Crocodile' },
    },
    desert: {
        herbivore: { id: 'camel',   name: '駱駝',   nameEn: 'Camel' },
        carnivore: { id: 'hyena',   name: '鬣狗',   nameEn: 'Hyena' },
    },
};
```

---

### 3. 改造：生態生物生成系統

**檔案：** `systems/spawning.js`

**目標：** 把現有的全圖中立/敵意生物生成，改為按生態區、按物種獨立生成。

#### 3a. 初始生成

移除現有的 `spawnNeutralCreatures()` 和 `spawnHostileCreatures()` 的全圖生成邏輯。

改為 `spawnBiomeCreatures()` 函式：
- 遍歷三個生態區（forest / ocean / desert）
- 每個生態區生成草系生物：初始10隻，使用該生態區的地形範圍隨機座標
- 每個生態區生成肉系生物：初始8隻，同上
- 每隻生物帶上 `biome` 屬性（'forest'/'ocean'/'desert'）和 `speciesId`（對應BIOME_CREATURES的id）

**草系生物初始屬性：**
```javascript
{
    x, y,
    biome,          // 所屬生態區
    speciesId,      // 'moose'/'beetle'/'camel'
    name,           // 中文名
    radius: 8,
    hp: 30, maxHp: 30,
    baseHp: 30,     // 基礎值（用於成長計算）
    speed: 2.4,
    baseSpeed: 2.4,
    damage: 0,
    baseDamage: 0,
    diet: 'herbivore',
    canFight: Math.random() < 0.5,
    state: 'wandering',
    wanderTarget: null,
    lastWanderTime: Date.now(),
    restTimer: 0,
    isResting: false,
    fruitsEaten: 0,
    lastDamageTime: 0,
    attackCooldown: 0,
}
```

**肉系生物初始屬性（沿用現有敵意生物數值，diet改為carnivore）：**
```javascript
{
    x, y,
    biome,
    speciesId,      // 'lynx'/'croc'/'hyena'
    name,
    radius: 10,
    hp: 50, maxHp: 50,
    baseHp: 50,
    speed: 3.6,
    baseSpeed: 3.6,
    damage: 5,
    baseDamage: 5,
    diet: 'carnivore',
    canFight: true,
    state: 'patrolling',
    aggroRange: 150,    // 普通地圖會被 aggroRangeOverride 覆蓋
    attackRange: 20,
    attackCooldown: 0,
    wanderTarget: null,
    lastWanderTime: Date.now(),
    restTimer: 0,
    isResting: false,
    corpseEaten: 0,     // 吃了幾具屍體（Phase 4用）
    target: null,
}
```

**注意：** 生物的 `aggroRange` 在普通地圖需套用 `NORMAL_MAP.aggroRangeOverride`，在 `initializeGame()` 生成後統一覆蓋，或在生成時讀取 `gameState.currentMap`。

#### 3b. 邊緣補充生成

改造 `spawnCreatureAtEdge()` 為 `spawnCreatureAtEdgeBiome(biome, type)`：
- 在指定生態區的地形範圍內隨機找一個座標生成
- 每個物種獨立計算當前存活數量
- 每個物種少於3隻時加速70%（間隔×0.3）

#### 3c. 生成計時器

在 `updateCreatureSpawning()` 裡，改為6個獨立計時器（每個生態區各草系/肉系一個）：
```
spawnTimers: {
    forest_herb: 0, forest_carn: 0,
    ocean_herb: 0,  ocean_carn: 0,
    desert_herb: 0, desert_carn: 0,
}
```
- 草系正常間隔：30000ms
- 肉系正常間隔：45000ms
- 各物種存活數量上限：草系20、肉系15（每個生態區各自計算）
- 該物種存活數量 < 3時，間隔×0.3（加速70%）

---

### 4. 新增：生物三態移動系統

**檔案：** `systems/creatures.js`

**適用：** 簡單和普通地圖的草系和肉系生物都適用。

#### 三個狀態

**漫遊（wandering）：**
- 使用Perlin Noise驅動方向（利用現有 `_SimplexNoise`）
- 每幀對當前移動角度做小幅隨機偏移（模擬Perlin Noise平滑效果）
- 草系：每隔隨機5~15秒，有30%機率切換為「探索最近果子」目標
- 肉系：每隔隨機5~15秒，有30%機率切換為「探索最近草系生物」目標
- 探索目標完成後回到漫遊

**休息（resting）：**
- 速度降至原本的0~30%（隨機，每次進入休息狀態時決定）
- 持續1.5秒後自動回到漫遊
- 觸發條件：漫遊狀態下隨機（每10~20秒有一次機率觸發，機率30%）
- 中斷條件：有生物進入aggroRange，立刻切換漫遊或攻擊
  - 例外：玩家有草食性Lv4+，草系生物不因玩家靠近中斷休息

**攻擊（attacking）：**
- canFight=true且有攻擊力才進入
- 草系：被攻擊後進入（canFight=true時）
- 肉系：aggroRange內發現目標進入
- 邏輯沿用現有戰鬥系統

#### 實作備注
- 草系生物的 `damage` 預設0，canFight=true時+3攻擊力（生成時就設定好）
- 簡單地圖的肉系生物：還是會攻擊草系，但**不會有吃屍體成長效果**（`hostileEatMeat: false`）
- 三態移動取代現有的 `state: 'idle'/'wandering'/'chasing'/'fighting'/'fleeing'` 邏輯，但需確保現有玩家互動（逃跑、反擊）邏輯不受影響

---

### 5. 更新：簡單地圖的食肉生物限制

**檔案：** `systems/creatures.js`（肉系AI更新邏輯）

在更新肉系生物行為時，檢查 `gameState.currentMap.features.hostileEatMeat`：
- `false`（簡單地圖）：肉系生物還是會攻擊草系，但不執行吃屍體邏輯
- `true`（普通地圖）：完整肉系吃屍體系統（Phase 4實作）

---

## gameState 新增欄位

**檔案：** `systems/gameState.js`

```javascript
spawnTimers: {
    forest_herb: 0, forest_carn: 0,
    ocean_herb: 0,  ocean_carn: 0,
    desert_herb: 0, desert_carn: 0,
},
```

---

## MAIN.md 更新要求

新增以下區塊：

```
## 生態生物系統（v0.36.0）

### 生物命名
| 生態區 | 草系       | 肉系     |
|--------|-----------|---------|
| 森林   | 駝鹿(moose) | 猞猁(lynx) |
| 水潭   | 巨型甲虫(beetle) | 鱷魚(croc) |
| 沙漠   | 駱駝(camel) | 鬣狗(hyena) |

### 生成規則
- 草系和肉系都只在對應生態區生成
- 每個物種獨立計算：上限（草系20/肉系15）、計時器、少於3隻加速70%
- 每隻生物帶 biome 和 speciesId 屬性

### 生物基礎屬性
- 草系：radius 8, HP 30, speed 2.4, damage 0 (canFight=yes時+3), diet herbivore
- 肉系：radius 10, HP 50, speed 3.6, damage 5, diet carnivore

### 三態移動
- wandering：Perlin Noise驅動，草系探果/肉系探獵（30%機率，5~15秒觸發）
- resting：速度0~30%，持續1.5秒，aggroRange有人靠近中斷
- attacking：canFight=true且有攻擊力才進入

### 簡單地圖限制
- 肉系生物會攻擊草系，但不會吃屍體成長（hostileEatMeat: false）

## 普通地圖（NORMAL_MAP）（v0.36.0）
- 地形參數沿用簡單地圖，中心森林保護區半徑400px
- 生物強度倍率全部×1.5
- aggroRange: 2000px
- 移除敵意生物速度和傷害上限cap（removeHostileCap: true）
- 精英怪：第1夜×5/+0.3/×1.5，第2夜×10/+0.7/×2.1，第3夜×20/+1.5/×2.9
- Boss數值：黑熊HP1500/速4.5/傷30/r33/range40，大白鯊HP1800/速5.85/傷36/r40/range47，蠍王HP1650/速5.4/傷40/r37/range43
- 專屬系統開關：features.giantization / features.killer / features.eliteRegen / features.bossRegen / features.hostileEatMeat
```

---

## CHANGELOG.md 更新要求

```
## v0.36.0 - [日期]

### 新增
- **normalmap.js**（`map/normalmap.js`）：普通難度地圖配置，含地形參數、1.5倍生物強度、2000px aggroRange、移除速度/傷害cap、精英/Boss強化數值、專屬系統開關
- **普通難度解鎖**（`systems/ui.js`）：難度選擇頁面普通難度從🔒改為可選
- **生態生物系統**（`config/creatures.js`、`systems/spawning.js`）：六種命名生物（駝鹿/猞猁/巨型甲虫/鱷魚/駱駝/鬣狗），各自只在對應生態區生成，獨立計時器和上限
- **生物三態移動**（`systems/creatures.js`）：漫遊（Perlin Noise）/ 休息（1.5秒）/ 攻擊，替換現有idle/wandering邏輯

### 調整
- **簡單地圖肉系限制**：肉系生物保留攻擊行為，但不執行吃屍體成長邏輯
```

---

## 完成後檢查清單

- [ ] 普通難度在選擇頁面可以點選
- [ ] 森林只生成駝鹿和猞猁，水潭只生成巨型甲虫和鱷魚，沙漠只生成駱駝和鬣狗
- [ ] 每個物種各自計算少於3隻的加速邏輯
- [ ] 草系生物偶爾會停下來休息1.5秒
- [ ] 普通地圖aggroRange為2000px
- [ ] 簡單地圖肉系生物不會吃屍體成長
- [ ] MAIN.md已更新
- [ ] CHANGELOG.md已更新
- [ ] 版本號已更新
