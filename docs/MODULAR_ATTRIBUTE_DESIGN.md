# 屬性模組化架構設計（Attribute Design v1）

> 狀態：設計契約，尚未實作 runtime。
> 目標版本：v0.2.x。
> 原則：先定義資料格式與 crosscheck，不綁定目前 `elite.js` / `boss.js` 的執行位置。

---

## 1. 核心目標

屬性（attribute）是可重複套用到生物、精英怪、Boss 階段的設計單元。

它負責描述：

- 這個屬性提供哪些數值修正
- 這個屬性提供哪些技能 / 攻擊模式
- 這個屬性提供哪些視覺 / 音效提示
- 哪些目標類型可以使用它
- 套用後最終數值與技能是否合理

v1 只做「設計資料格式」，不要求立刻把現有邏輯抽成共用 engine。

---

## 2. 非目標

這份文件目前不要求：

- 立刻新增 `systems/attributes.js`
- 立刻重寫 `systems/elite.js`
- 立刻重寫 `systems/boss.js`
- 立刻把 projectile / puddle / sniper / shotgun 做成通用 runtime
- 立刻改動玩家可感知數值

原因：目前毒霧、幽靈、暗影、黑色獵人技能分散在多個系統內。若直接 runtime 化，會同時碰到 elite、boss、hud、player projectile、audio，風險過高。

---

## 3. Attribute 格式

建議格式：

```js
{
    id: 'venom',
    displayName: '毒霧',
    category: 'element',
    tags: ['poison', 'area-control'],

    appliesTo: {
        creatureKinds: ['elite', 'boss'],
        combatRoles: ['melee', 'ranged'],
        phases: ['any']
    },

    statModifiers: {
        hpMultiplier: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        flatDamageAdd: 0,
        poisonResistAdd: 0
    },

    abilities: [
        {
            id: 'venom_on_hit',
            appliesTo: ['melee', 'ranged'],
            trigger: 'onHit',
            effect: 'applyPoison',
            params: {
                dps: 8,
                durationMs: 3000
            }
        }
    ],

    visualProfile: {
        color: '#1B5E20',
        glowColor: '#66BB6A',
        ring: 'fog'
    },

    audioProfile: {
        appear: null,
        attack: null,
        hit: null,
        death: null
    },

    notes: 'v1 設計資料；runtime 實作位置待 v0.2.x 決定。'
}
```

### 欄位規則

| 欄位 | 必填 | 說明 |
|------|------|------|
| `id` | 是 | 穩定英文 ID，不可用顯示名稱當邏輯判斷 |
| `displayName` | 是 | 顯示名稱，未來應接語言包 |
| `category` | 是 | `element` / `weapon` / `movement` / `phase` 等 |
| `tags` | 是 | 搜尋與分類用，不直接決定數值 |
| `appliesTo` | 是 | 限制可套用對象 |
| `statModifiers` | 是 | 純數值修正 |
| `abilities` | 是 | 技能 / 攻擊模式描述 |
| `visualProfile` | 否 | 視覺設定 |
| `audioProfile` | 否 | 音效設定 |
| `notes` | 否 | 設計備註 |

---

## 4. Ability 格式

```js
{
    id: 'shadow_shotgun',
    appliesTo: ['ranged'],
    trigger: 'attack',
    effect: 'fireProjectilePattern',
    params: {
        pattern: 'spread',
        pellets: 4,
        spreadAngle: 60,
        projectileSpeed: 10,
        maxRange: 650
    }
}
```

### trigger 建議值

| trigger | 說明 |
|---------|------|
| `attack` | 一般攻擊時 |
| `onHit` | 命中時 |
| `onDamaged` | 受到傷害時 |
| `onPhaseStart` | Boss 階段開始 |
| `onDeath` | 死亡時 |
| `interval` | 定時觸發 |

### effect 建議值

| effect | 說明 |
|--------|------|
| `applyPoison` | 套用毒傷 |
| `spawnPuddle` | 產生地面區域效果 |
| `fireProjectile` | 發射單一 projectile |
| `fireProjectilePattern` | 發射散彈 / 多發 projectile |
| `modifyStats` | 暫時修改數值 |
| `playAudioCue` | 播放音效提示 |
| `showWarning` | 顯示預警圈 / 瞄準線 |

注意：v1 只定義名稱，不要求立刻存在對應 engine。

---

## 5. 現有屬性草案

### venom

用途：毒霧 / 毒傷 / 地面區域控制。

```js
{
    id: 'venom',
    displayName: '毒霧',
    category: 'element',
    tags: ['poison', 'area-control'],
    appliesTo: {
        creatureKinds: ['elite', 'boss'],
        combatRoles: ['melee', 'ranged'],
        phases: ['any']
    },
    statModifiers: {
        hpMultiplier: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        flatDamageAdd: 0,
        poisonResistAdd: 0
    },
    abilities: [
        {
            id: 'venom_on_hit',
            appliesTo: ['melee'],
            trigger: 'onHit',
            effect: 'applyPoison',
            params: { dps: 8, durationMs: 3000 }
        },
        {
            id: 'venom_fang',
            appliesTo: ['ranged'],
            trigger: 'attack',
            effect: 'fireProjectile',
            params: { projectileType: 'venomFang' }
        },
        {
            id: 'venom_puddle',
            appliesTo: ['ranged', 'boss'],
            trigger: 'attack',
            effect: 'spawnPuddle',
            params: { radius: 80, durationMs: 4000, maxActive: 6 }
        }
    ],
    visualProfile: {
        color: '#1B5E20',
        glowColor: '#66BB6A',
        ring: 'fog'
    }
}
```

現有對應：

- 毒霧犬：`venom + melee`
- 毒霧隼：`venom + ranged`
- 沙漠蠍王毒池：可視為 `venom + boss`

### specter

用途：精準遠程 / 幽靈感視覺。

```js
{
    id: 'specter',
    displayName: '幽靈',
    category: 'element',
    tags: ['ranged', 'precision'],
    appliesTo: {
        creatureKinds: ['elite'],
        combatRoles: ['melee', 'ranged'],
        phases: ['any']
    },
    statModifiers: {
        hpMultiplier: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        flatDamageAdd: 0,
        poisonResistAdd: 0
    },
    abilities: [
        {
            id: 'specter_sniper',
            appliesTo: ['ranged'],
            trigger: 'attack',
            effect: 'fireProjectile',
            params: {
                pattern: 'single',
                projectileSpeed: 14,
                maxRange: 1000,
                aimDurationMs: 300
            }
        }
    ],
    visualProfile: {
        color: '#243B80',
        glowColor: '#6677FF',
        ring: 'pulse'
    }
}
```

現有對應：

- 幽靈犬：`specter + melee`
- 幽靈隼：`specter + ranged`

### shadow

用途：暗影高速 / 散彈 / 壓迫感視覺。

```js
{
    id: 'shadow',
    displayName: '暗影',
    category: 'element',
    tags: ['burst', 'spread-shot'],
    appliesTo: {
        creatureKinds: ['elite'],
        combatRoles: ['melee', 'ranged'],
        phases: ['any']
    },
    statModifiers: {
        hpMultiplier: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        flatDamageAdd: 0,
        poisonResistAdd: 0
    },
    abilities: [
        {
            id: 'shadow_fast_melee',
            appliesTo: ['melee'],
            trigger: 'attack',
            effect: 'modifyStats',
            params: { attackCooldownMultiplier: 0.8 }
        },
        {
            id: 'shadow_shotgun',
            appliesTo: ['ranged'],
            trigger: 'attack',
            effect: 'fireProjectilePattern',
            params: {
                pattern: 'spread',
                pellets: 4,
                spreadAngle: 60,
                projectileSpeed: 10,
                maxRange: 650
            }
        }
    ],
    visualProfile: {
        color: '#212121',
        glowColor: '#FF7043',
        ring: 'rotate'
    }
}
```

現有對應：

- 暗影犬：`shadow + melee`
- 暗影隼：`shadow + ranged`

---

## 6. Boss Phase Attribute 草案

Boss phase attribute 可以沿用相同格式，但 `category` 建議用 `weapon` 或 `phase`。

### sniper

```js
{
    id: 'sniper',
    displayName: '狙擊槍',
    category: 'weapon',
    tags: ['ranged', 'precision', 'warning-line'],
    appliesTo: {
        creatureKinds: ['boss'],
        combatRoles: ['ranged'],
        phases: ['phase1', 'phase3']
    },
    statModifiers: {
        hpMultiplier: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        flatDamageAdd: 0,
        poisonResistAdd: 0
    },
    abilities: [
        {
            id: 'sniper_shot',
            appliesTo: ['boss'],
            trigger: 'attack',
            effect: 'fireProjectile',
            params: {
                pattern: 'single',
                projectileSpeed: 18,
                aimDurationMs: null
            }
        }
    ],
    visualProfile: {
        warning: 'aimLine'
    }
}
```

### shotgun

```js
{
    id: 'shotgun',
    displayName: '霰彈槍',
    category: 'weapon',
    tags: ['ranged', 'spread-shot', 'close-pressure'],
    appliesTo: {
        creatureKinds: ['boss'],
        combatRoles: ['ranged'],
        phases: ['phase2', 'phase3']
    },
    statModifiers: {
        hpMultiplier: 1,
        damageMultiplier: 1,
        speedMultiplier: 1,
        flatDamageAdd: 0,
        poisonResistAdd: 0
    },
    abilities: [
        {
            id: 'shotgun_spread',
            appliesTo: ['boss'],
            trigger: 'attack',
            effect: 'fireProjectilePattern',
            params: {
                pattern: 'spread',
                pellets: null,
                spreadAngle: null,
                projectileSpeed: 12
            }
        }
    ]
}
```

黑色獵人現有對應：

- Phase 1 = `sniper`
- Phase 2 = `shotgun`
- Phase 3 = `sniper + shotgun`

---

## 7. Crosscheck 表

每次新增或調整 attribute，都必須填 crosscheck。

### 生物 / 精英怪 Crosscheck

| 生物 | 基礎類型 | 套用 attributes | 基礎 HP | 最終 HP | 基礎傷害 | 最終傷害 | 基礎速度 | 最終速度 | 獲得技能 | 視覺 | 音效 | 備註 |
|------|----------|-----------------|---------|---------|----------|----------|----------|----------|----------|------|------|------|
| 毒霧隼 | ranged elite | venom | X | X | X | X | X | X | venom_fang, venom_puddle | fog ring | venomFalcon* | 需確認 puddle 上限 |

### Boss Phase Crosscheck

| Boss | Phase | 套用 attributes | HP / bar | 傷害來源 | projectile | 預警 | 音效 | 玩家可見差異 | 備註 |
|------|-------|-----------------|----------|----------|------------|------|------|--------------|------|
| 黑色獵人 | Phase 3 | sniper + shotgun | X | sniperDamage / shotgunDamage | single + spread | aimLine | hunterPhase3* | 白色漫光 + 混合攻擊 | 需確認兩套攻擊 CD |

### Crosscheck 必填規則

1. `最終 HP`、`最終傷害`、`最終速度` 不可空白。
2. `獲得技能` 必須列 ability id，不只寫中文描述。
3. 如果 attribute 提供 projectile，必須列 projectile 類型與來源。
4. 如果 attribute 提供 puddle / area effect，必須列半徑、持續時間、上限。
5. 如果 attribute 改變視覺或音效，必須列出對應 profile 或音效 key。
6. 若數值沿用現有 config，填「沿用 config: 欄位名」，不要填模糊文字。

---

## 8. 實作階段建議

### Phase A：Design-only（可現在做）

只做文件 / config 草案：

- 定義 attribute 格式
- 定義 ability 格式
- 補 crosscheck 表
- 將現有毒霧 / 幽靈 / 暗影 / sniper / shotgun 映射到 attribute 草案

不改 runtime。

### Phase B：Config-only（低到中風險）

新增純資料檔，例如：

```text
config/attributes.js
```

內容只 export attribute 定義，不讓現有系統 import。

可加測試：

- attribute id 不重複
- ability id 不重複
- 必填欄位存在
- `appliesTo` 不為空

### Phase C：Runtime bridge（中到高風險，建議 v0.2.x）

新增 helper 只負責查詢，不改行為：

```text
systems/attributeResolver.js
```

可能函式：

- `resolveAttributes(entityConfig)`
- `getAttributeAbilities(attributes, role)`
- `getAttributeVisualProfile(attributes)`

此階段仍不重寫 elite / boss 主流程。

### Phase D：Full runtime（高風險）

逐步讓 elite / boss 使用 attribute resolver。

建議順序：

1. 先接 visualProfile
2. 再接 statModifiers
3. 再接 ability 查詢
4. 最後才重構 projectile / puddle runtime

---

## 9. 與 Stage F 3b / 3c 的關係

現在先定義 attribute 格式是安全的，但要遵守兩條線：

- v1 不指定「由哪個 systems 檔案執行」
- v1 不直接 import 現有高層模組

Stage F 3b / 3c 之後可能調整：

- tooltip / overlay 類欄位可能搬到 `overlayUi` 或 `tooltip`
- 器官效果與進化規則可能搬到 `organEffects` / `evolutionRules`
- mobile/input 事件邊界可能改名

但 attribute 的核心資料欄位（id、appliesTo、statModifiers、abilities、visualProfile、audioProfile、crosscheck）應可保留。

---

## 10. Claude Code 實作提示

若要交給 Claude Code，建議 prompt：

```text
請先讀取 docs/MODULAR_ATTRIBUTE_DESIGN.md。
本次只做 Attribute Design v1 的 design-only / config-only 工作，不接入 runtime。

允許：
- 補充 attribute 草案
- 新增 config/attributes.js（純資料）
- 新增 tests/config/attributes.test.js（驗證資料完整性）

禁止：
- 修改 systems/elite.js
- 修改 systems/boss.js
- 修改 systems/player.js
- 修改 systems/hud.js
- 改變任何玩家可感知數值或玩法

完成後跑 npm test。
```
