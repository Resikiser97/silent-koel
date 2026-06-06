# 困難難度設計文件 — 靜音獵隊更新
# Hard Map Design — Silent Hunter Squad Update

> **使用說明：** 此文件供 Claude Code 實作參考。
> 實作前必須先閱讀 `MAIN.md` 與 `CHANGELOG.md`。
> 音效檔案位於 `Sound MP3/New sound/` 資料夾。

---

## 一、音效檔案處理指示（Claude Code 優先執行）

實作開始前，請先在 `Sound MP3/New sound/` 資料夾執行以下複製/重命名操作：

| 操作 | 來源檔案 | 目標檔名 | 原因 |
|------|---------|---------|------|
| 複製 | `hunter_sniper_charge.mp3` | `hunter_phase3_charge.mp3` | 第三形態共用蓄力音效 |
| 複製 | `specter_falcon_fire.mp3` | `shadow_falcon_fire.mp3` | 暗影隼共用發射音效 |
| 複製 | `specter_falcon_death.mp3` | `dog_death.mp3` | 三犬共用死亡音效 |
| 複製 | `venom_falcon_spread.mp3` | `venom_dog_bite.mp3` | 毒霧犬咬毒共用音效 |

三犬出現廣播共用同一個 `dog_appear.mp3`。

---

## 二、AUDIO_FILES 新增項目

在 `config/gameConfig.js` 的 `AUDIO_FILES` 物件新增以下項目：

```javascript
// ── 黑色獵人 Boss
hunterDetect:          'Sound MP3/New sound/hunter_detect.mp3',
hunterFootstep:        ['Sound MP3/New sound/hunter_footstep_1.mp3',
                        'Sound MP3/New sound/hunter_footstep_2.mp3'],
hunterSniperAim:       'Sound MP3/New sound/hunter_sniper_aim.mp3',
hunterSniperCharge:    'Sound MP3/New sound/hunter_sniper_charge.mp3',
hunterSniperFire:      'Sound MP3/New sound/hunter_sniper_fire.mp3',
hunterBulletFly:       'Sound MP3/New sound/hunter_bullet_fly.mp3',
hunterBulletHit:       'Sound MP3/New sound/hunter_bullet_hit_terrain.mp3',
hunterShotgunPump:     'Sound MP3/New sound/hunter_shotgun_pump.mp3',
hunterShotgunFire:     'Sound MP3/New sound/hunter_shotgun_fire.mp3',
hunterPelletFly:       ['Sound MP3/New sound/hunter_pellet_fly_1.mp3',
                        'Sound MP3/New sound/hunter_pellet_fly_2.mp3'],
hunterPhase3Charge:    'Sound MP3/New sound/hunter_phase3_charge.mp3',
hunterPhase3Fire:      'Sound MP3/New sound/hunter_phase3_fire.mp3',
hunterPhase2Activate:  'Sound MP3/New sound/hunter_phase2_activate.mp3',
hunterPhase3Activate:  'Sound MP3/New sound/hunter_phase3_activate.mp3',
hunterVoiceIntro:      'Sound MP3/New sound/hunter_voice_intro.mp3',
hunterVoiceDeath:      'Sound MP3/New sound/hunter_voice_death.mp3',
hunterHurt:            ['Sound MP3/New sound/hunter_hurt_1.mp3',
                        'Sound MP3/New sound/hunter_hurt_2.mp3'],

// ── 精英怪：三隼
specterFalconAppear:   'Sound MP3/New sound/specter_falcon_appear.mp3',
specterFalconAim:      'Sound MP3/New sound/specter_falcon_aim.mp3',
specterFalconFire:     'Sound MP3/New sound/specter_falcon_fire.mp3',
specterFalconHurt:     'Sound MP3/New sound/specter_falcon_hurt.mp3',
specterFalconDeath:    'Sound MP3/New sound/specter_falcon_death.mp3',
shadowFalconAppear:    'Sound MP3/New sound/shadow_falcon_appear.mp3',
shadowFalconFire:      'Sound MP3/New sound/shadow_falcon_fire.mp3',  // 複製自 specter_falcon_fire
shadowFalconHurt:      'Sound MP3/New sound/shadow_falcon_hurt.mp3',
shadowFalconDeath:     'Sound MP3/New sound/shadow_falcon_death.mp3',
venomFalconAppear:     'Sound MP3/New sound/venom_falcon_appear.mp3',
venomFalconLaunch:     'Sound MP3/New sound/venom_falcon_launch.mp3',
venomFalconLand:       'Sound MP3/New sound/venom_falcon_land.mp3',
venomFalconSpread:     'Sound MP3/New sound/venom_falcon_spread.mp3',
venomFalconHurt:       'Sound MP3/New sound/venom_falcon_hurt.mp3',
venomFalconDeath:      'Sound MP3/New sound/venom_falcon_death.mp3',

// ── 精英怪：三犬
specterDogAppear:      'Sound MP3/New sound/dog_appear.mp3',
shadowDogAppear:       'Sound MP3/New sound/dog_appear.mp3',          // 共用
venomDogAppear:        'Sound MP3/New sound/dog_appear.mp3',          // 共用
dogAttack:             ['Sound MP3/New sound/dog_attack_1.mp3',
                        'Sound MP3/New sound/dog_attack_2.mp3'],
dogHurt:               ['Sound MP3/New sound/dog_hurt_1.mp3',
                        'Sound MP3/New sound/dog_hurt_2.mp3'],
dogDeath:              'Sound MP3/New sound/dog_death.mp3',
dogAppearFanfare:      'Sound MP3/New sound/dog_appear_fanfare.mp3',
venomDogBite:          'Sound MP3/New sound/venom_dog_bite.mp3',      // 複製自 venom_falcon_spread

// ── 阿奇爾（Archerfish）
archerAttackNormal:    ['Sound MP3/New sound/archer_attackNormal_1.mp3',
                        'Sound MP3/New sound/archer_attackNormal_2.mp3'],
archerAttackCrit:      'Sound MP3/New sound/archer_attackCrit.mp3',
archerChargeAttack:    'Sound MP3/New sound/archer_Chargeattack.mp3',
archerHurt:            ['Sound MP3/New sound/archer_hurt_1.mp3',
                        'Sound MP3/New sound/archer_hurt_2.mp3'],
archerDeath:           'Sound MP3/New sound/archer_death.mp3',
```

---

## 三、困難難度地圖設定（`map/hardmap.js` 新增檔案）

新增 `map/hardmap.js`，參考 `map/normalmap.js` 的結構：

```javascript
const HARD_MAP = {
    name:   '困難',
    nameEn: 'Hard',

    terrain: {
        noiseScale:          0.003,
        forestCenterRadius:  300,
        forestThreshold:     0.2,
        oceanThreshold:     -0.2,
        minBiomeTiles:       250,
        requiredBiomes:      ['forest', 'ocean', 'desert'],
    },

    creatureStrength: {
        neutral: { hpMultiplier: 2.5, speedMultiplier: 2.0, damageMultiplier: 2.5 },
        hostile: { hpMultiplier: 2.5, speedMultiplier: 2.0, damageMultiplier: 2.5 },
    },

    removeHostileCap: true,
    aggroRangeOverride: 600,

    elites: [
        { night: 1, hpMultiplier: 8,  speedBonus: 0.5, damageMultiplier: 2.0 },
        { night: 2, hpMultiplier: 15, speedBonus: 1.0, damageMultiplier: 3.0 },
        { night: 3, hpMultiplier: 25, speedBonus: 2.0, damageMultiplier: 4.0 },
    ],

    // Boss 留空，待血量設計完成後填入
    bosses: [
        { biome: 'forest', name: '🌿 黑熊',      hp: null, speed: null, damage: null, radius: 33, attackRange: 40 },
        { biome: 'ocean',  name: '🌊 大白鯊',    hp: null, speed: null, damage: null, radius: 40, attackRange: 47 },
        { biome: 'desert', name: '🏜️ 沙漠蠍王',  hp: null, speed: null, damage: null, radius: 37, attackRange: 43 },
        // 黑色獵人 Boss（困難地圖專屬）
        { biome: 'hunter', name: '🎯 黑色獵人',  hp: null, speed: null, damage: null, radius: 22, attackRange: 1500 },
    ],

    features: {
        giantization:       true,
        killer:             true,
        eliteRegen:         false,  // 困難地圖精英怪不回血
        bossRegen:          false,  // 困難地圖 Boss 不回血
        hostileEatMeat:     true,
        hardElites:         true,   // 啟用靜音獵隊精英怪系統
        hunterBoss:         true,   // 啟用黑色獵人 Boss 系統
    },
};
```

在 `index.html` 的 `<script>` 區塊加入：
```html
<script src="map/hardmap.js"></script>
```

---

## 四、黑色獵人 Boss 系統設計

### 4.1 世界觀背景

**靜音獵隊**是淨音軍旗下的精銳執行部隊，專門追蹤並消滅被列入「必除名單」的危險噪鵑個體。不同於普通淨音軍的地毯式掃蕩，靜音獵隊的行動方式是精準、無聲、不留痕跡。

**黑色獵人**是靜音獵隊中派出的頂級獵手——一個沉默的牛仔輪廓，帶著他馴養的三種爪牙（幽靈隼、暗影隼、毒霧隼），在確認獵物後才發動致命攻擊。他的出現意味著獵物已被列為最高威脅等級。

### 4.2 血條系統（5管制）

黑色獵人採用**5管血條系統**，顯示在畫面頂部（參考現有 Boss 血條位置）：

```
顯示格式：  x4 ████████████████████  (第二管時)
            消滅一管後變成 x3 ████...
            最後一管不顯示 xN，直接顯示血條
```

| 血管 | 顯示 | 形態 | 血條顏色 |
|------|------|------|---------|
| 5管（第5管） | x5 | 第一形態 | 冰藍色 `#4FC3F7` |
| 4管（第4管） | x4 | 第一形態 | 藍色 `#1976D2` |
| 3管（第3管） | x3 | 第二形態 | 橘色 `#FF9800` |
| 2管（第2管） | x2 | 第二形態 | 暗橘紅 `#E64A19` |
| 1管（最後管） | 不顯示xN | 第三形態 | 紅色+白光脈衝 `#FF1744` + glow |

**實作方式：**
- `boss.maxHpPerBar`：每管血量（待數值設計後填入）
- `boss.barsRemaining`：剩餘血管數（初始 5）
- `boss.hp`：當前血管的血量
- 每次 `boss.hp <= 0` 時：`barsRemaining--`，`hp` 重置為 `maxHpPerBar`，觸發形態切換判斷

### 4.3 外觀繪製（Canvas）

在 `systems/boss.js` 的 `drawBossShape()` 新增 `hunter` 分支：

```
function _drawHunter(ctx, r, t, boss) {
    // 方向計算（根據 boss.lastMoveDir 或攻擊目標方向）
    const facingRight = (boss.lastMoveDir && boss.lastMoveDir.dx >= 0);

    // ── 牛仔帽（固定正上方）
    // 帽沿：橢圓，寬 r*1.4，高 r*0.25，位置 y = -r*0.9
    // 帽頂：矩形圓角，寬 r*0.8，高 r*0.5，位置 y = -r*1.35
    // 顏色：深棕 #3E2723，帽帶：金色線條

    // ── 槍（跟隨移動/攻擊方向，把手永遠朝下）
    // 槍身：長方形，長 r*1.6，寬 r*0.18
    // facingRight = true：槍頭朝右（+x 方向），把手在左下
    // facingRight = false：左右鏡射
    // 攻擊時槍頭方向指向玩家

    // ── 形態邊框（ctx.strokeStyle 光環環繞圓形）
    // 第一形態（barsRemaining 5~4）：Racing Blue #1565C0，lineWidth 3
    // 第二形態（barsRemaining 3~2）：灰橘雙色交替脈動 #B0BEC5 / #FF7043
    // 第三形態（barsRemaining 1）：紅色 #FF1744 + 白色漫光 shadowBlur 20
}
```

**形態顏色常數（加入 BOSS_COLORS）：**
```javascript
hunter: {
    hat:         '#3E2723',
    hatBrim:     '#4E342E',
    hatBand:     '#FFD700',
    gun:         '#212121',
    gunDetail:   '#424242',
    // 形態邊框
    phase1Glow:  '#1565C0',
    phase2GlowA: '#B0BEC5',
    phase2GlowB: '#FF7043',
    phase3Glow:  '#FF1744',
    phase3White: '#FFFFFF',
}
```

### 4.4 攻擊機制

#### 第一形態：Sniper（狙擊）
- **觸發距離：** 1500px（進入範圍後切換 `state: 'aiming'`）
- **站立蓄力：** 進入瞄準模式後停止移動 0.3 秒
- **預警線：** 從槍頭到玩家畫一條紅色激光線，線會跟隨玩家移動
  ```javascript
  // 紅色半透明直線
  ctx.strokeStyle = 'rgba(255, 50, 50, 0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 4]);  // 虛線感
  ```
- **子彈飛行：** 發射後子彈以直線飛行，射程 = 觸發距離 × 2 = 3000px
- **音效順序：** `hunterSniperAim` → `hunterSniperCharge`（持續）→ `hunterSniperFire` + `hunterBulletFly`
- **子彈物件結構：**
  ```javascript
  {
      type: 'sniper',
      x, y, vx, vy,
      speed: 18,          // 飛行速度（快，有壓迫感）
      damage: null,       // 待數值設計
      maxRange: 3000,
      distTraveled: 0,
      owner: 'hunter'
  }
  ```

#### 第二形態：Shotgun（散彈）
- **觸發距離：** 800px（比 Sniper 短）
- **上膛預警：** 發射前播放 `hunterShotgunPump`，停頓 0.4 秒
- **扇形散射：** 80度扇形，隨機射出 6 發散彈
- **每發傷害：** 命中 3 發 = Sniper 一發傷害（即每發 = Sniper傷害 ÷ 3）
- **攻擊頻率：** 比 Sniper 快 1.5 倍
- **音效順序：** `hunterShotgunPump` → `hunterShotgunFire` + `hunterPelletFly`（多發疊加）
- **子彈物件結構：**
  ```javascript
  {
      type: 'shotgun_pellet',
      x, y, vx, vy,
      speed: 12,
      damage: null,       // 待數值設計（= sniper_dmg / 3）
      maxRange: 900,
      distTraveled: 0,
      angleOffset: Math.random() * 80 - 40,  // -40° ~ +40°
      owner: 'hunter'
  }
  ```

#### 第三形態：融合技能（Sniper + Shotgun）
- **觸發距離：** 1500px（同 Sniper）
- **蓄力預警：**
  - 對準玩家的紅色瞄準線（同 Sniper）
  - 同時出現 5 條隨機方向的橘色散射預警線
  - 蓄力時間 0.5 秒（比第一形態長）
- **發射：** 1 發 Sniper 子彈（直線，對準玩家）+ 隨機散射 5 發散彈（非瞄準方向）
- **傷害：** Sniper 子彈傷害同第一形態；散彈傷害同第二形態每發
- **音效順序：** `hunterSniperAim` + `hunterPhase3Charge` → `hunterPhase3Fire`（Sniper+Shotgun 混合音）

#### 子彈系統整合
- 黑色獵人的子彈加入 `gameState.projectiles` 陣列（與阿奇爾的子彈共用陣列）
- 在 `updateProjectiles()` 中新增 `owner: 'hunter'` 的判斷：命中玩家時對玩家造成傷害
- 子彈命中地形消失，播放 `hunterBulletHit`

### 4.5 移動行為

| 形態 | 移動模式 |
|------|---------|
| 第一形態 | 保持距離在 1200~1500px，繞圈移動（strafing） |
| 第二形態 | 主動接近至 600px，快速來回走位 |
| 第三形態 | 混合：先退至 1200px 發動融合技，再衝近 400px 補散彈 |

### 4.6 台詞系統

台詞以畫面左下角字幕方式顯示（黑底白字，3秒後淡出）。

**開場台詞（進入 Boss 戰時觸發）：**
```
「...鎖定目標。」
```

**話癆循環台詞（每 5~10 秒隨機播一條，第一形態）：**
```
「風速正常。」
「移動速度...已記錄。」
「有趣的移動模式。」
「預測路徑...完成。」
「還差得遠。」
```

**第二形態切換台詞（血條切換到 x3 時觸發）：**
```
「...換彈。繼續。」
```

**第二形態話癆（隨機循環）：**
```
「開始讓我有點感興趣了。」
「距離太近了嗎？這才剛開始。」
「不錯的反應速度。」
「你讓我想起了某個獵物...牠也跑得很快。」
```

**第三形態切換台詞（最後一管時觸發，語氣開始有些失控）：**
```
「...沒想到能讓我走到這一步。好。真的好。」
```

**第三形態話癆（情緒更激動）：**
```
「跑啊！」
「這才對！這才叫做狩獵！」
「讓我看看你還有多少！」
「哈——！」
```

**死亡台詞：**
```
「...了不起。不過下一位...不會像我這樣手下留情。」
```

**台詞實作建議：**
```javascript
// boss 物件新增
boss.dialogueTimer = 0;
boss.dialogueInterval = 5000 + Math.random() * 5000;  // 5~10秒隨機

// 台詞陣列依形態分組
const HUNTER_DIALOGUE = {
    phase1: ['風速正常。', '移動速度...已記錄。', ...],
    phase2: ['開始讓我有點感興趣了。', ...],
    phase3: ['跑啊！', '這才對！這才叫做狩獵！', ...],
};
```

### 4.7 形態切換特效

**第二形態啟動（血條 x3）：**
- 停止移動 0.8 秒
- 播放 `hunterPhase2Activate`
- 邊框顏色漸變：藍 → 灰橘交替脈動
- 顯示切換台詞

**第三形態啟動（最後一管）：**
- 停止移動 1.2 秒（儀式感）
- 播放 `hunterPhase3Activate`
- 全畫面短暫紅色閃光（`rgba(255,0,0,0.2)` 疊加 1 幀）
- 邊框切換為紅色 + 白色漫光
- 顯示切換台詞

---

## 五、靜音獵隊精英怪系統

### 5.1 精英怪類型總覽

困難地圖的精英怪為**靜音獵隊成員**，取代原有的通用精英怪，分為兩大族群六種變體：

| 族群 | 名稱 | 星級 | 攻擊類型 | 外觀 |
|------|------|------|---------|------|
| 隼族 | 幽靈隼 | ★ | Sniper遠程 | 深藍/靛紫，脈衝光環 |
| 隼族 | 暗影隼 | ★★ | Shotgun遠程 | 純黑橘邊，旋轉虛線環 |
| 隼族 | 毒霧隼 | ★★★ | 毒霧炮 | 暗綠，霧氣擴散光環 |
| 犬族 | 幽靈犬 | ★ | 近戰 | 深藍/靛紫，脈衝光環 |
| 犬族 | 暗影犬 | ★★ | 近戰 | 純黑橘邊，旋轉虛線環 |
| 犬族 | 毒霧犬 | ★★★ | 近戰+毒 | 暗綠，霧氣擴散光環 |

**出現規則：**
- 第一夜（★）：隨機出現幽靈隼 **或** 幽靈犬
- 第二夜（★★）：隨機出現暗影隼 **或** 暗影犬
- 第三夜（★★★）：隨機出現毒霧隼 **或** 毒霧犬

### 5.2 出場廣播系統

精英怪出現時，在畫面頂部顯示名稱廣播（取代現有的 `t('eliteAppeared')` 文字），格式：

```
⚠️ 靜音獵隊成員出現：幽靈隼
```

同時播放對應的 appear 音效 + `dogAppearFanfare`（底部警報音）。

### 5.3 幽靈隼（Specter Falcon）

**外觀：**
- 深藍/靛紫色橢圓主體（細長感），radius 16
- 光環：間歇性脈衝環（`Math.sin(t/400)` 控制透明度 0.3~0.8）
- 頭部前方有小型「＋」瞄準十字常駐（攻擊時變紅）

**攻擊機制（Sniper型簡化版）：**
- 觸發距離：900px
- 蓄力：0.3 秒站立，播放 `specterFalconAim`
- 發射：單發直線子彈，飛行速度 14，射程 1000px
- 無預警線（比 Boss 簡單）
- 攻擊冷卻：3 秒
- 音效：`specterFalconAim` → `specterFalconFire`

### 5.4 暗影隼（Shadow Falcon）

**外觀：**
- 純黑主體，橘色光邊，radius 16
- 光環：旋轉虛線環（每幀旋轉角度 += 0.03）
- 攻擊時光環變紅

**攻擊機制（Shotgun型簡化版）：**
- 觸發距離：600px
- 無蓄力，直接發射
- 扇形 60 度，隨機 4 發散彈，飛行速度 10，射程 650px
- 攻擊冷卻：2 秒
- 音效：`shadowFalconFire`

### 5.5 毒霧隼（Venom Falcon）

**外觀：**
- 暗綠色主體，radius 16
- 光環：霧氣擴散型（半透明圓形擴散後消散，循環，`globalAlpha` 從 0.5 → 0 週期變化）

**攻擊機制（毒霧炮）：**
- 觸發距離：700px
- 拋射物：毒霧炮以拋物線飛行，落在玩家當前位置（預判落點，不追蹤）
- 落地後：在地面展開一灘腐蝕液體區域，radius 80px
- 液體效果：玩家站在範圍內每 0.5 秒受毒傷（數值待定）
- 液體持續時間：6 秒後消散
- 最多同時存在 3 灘液體
- 攻擊冷卻：4 秒
- 音效：`venomFalconLaunch` → `venomFalconLand` → `venomFalconSpread`（持續到消散）

**毒霧液體物件（加入 `gameState.venomPuddles`，與蠍王共用陣列）：**
```javascript
{
    x, y,
    radius: 80,
    damage: null,          // 待數值設計
    tickInterval: 500,
    lastTick: Date.now(),
    expireAt: Date.now() + 6000,
    owner: 'venomFalcon',
    color: 'rgba(50, 180, 50, 0.35)'
}
```

### 5.6 幽靈犬（Specter Dog）

**外觀：**
- 深藍/靛紫色圓形主體，radius 14
- 光環：間歇性脈衝環（同幽靈隼風格）

**攻擊機制（近戰）：**
- 追擊速度：參考 HARD_MAP 精英怪速度設定
- 攻擊距離：20px
- 攻擊冷卻：1.2 秒
- 音效：`dogAttack`（隨機二選一）受傷：`dogHurt` 死亡：`dogDeath`

### 5.7 暗影犬（Shadow Dog）

**外觀：**
- 純黑主體，橘色光邊，radius 14
- 光環：旋轉虛線環（同暗影隼風格）

**攻擊機制（近戰，比幽靈犬快）：**
- 攻擊冷卻：0.9 秒
- 其餘同幽靈犬

### 5.8 毒霧犬（Venom Dog）

**外觀：**
- 暗綠色主體，radius 14
- 光環：霧氣擴散型（同毒霧隼風格）

**攻擊機制（近戰+毒）：**
- 攻擊冷卻：1.5 秒（較慢，但每次咬中附帶毒效果）
- 毒效果：每 1 秒造成毒傷，持續 3 秒
- 音效：`dogAttack` + `venomDogBite`（咬中時疊加播放）

---

## 六、地圖選擇介面更新

在 `systems/ui.js` 的 `showMapSelect()` 中，解鎖困難難度按鈕（目前應為 🔒 狀態）：

```javascript
// 困難地圖選項從 🔒 改為可選
{ map: HARD_MAP, label: t('diffHard'), available: true }
```

同時在語言包 `lang/zh-TW.js` 和 `lang/en.js` 確認 `diffHard` 鍵存在。

---

## 七、CHANGELOG 版本記錄

版本號：在當前版本基礎上 **+v0.1.0**（主要新內容版本）

```markdown
## v0.X.X - YYYY-MM-DD

### 新增
- **困難難度地圖**（`map/hardmap.js`）：生物強度 ×2.5，攻擊距離更廣，精英怪不回血
- **黑色獵人 Boss**（`systems/boss.js`）：5管血條制、三形態、Sniper/Shotgun/融合攻擊、台詞系統、Canvas 牛仔帽+槍外觀
- **靜音獵隊精英怪系統**（`systems/elite.js`）：困難地圖專屬，隼族（遠程）+犬族（近戰）各三變體
  - 幽靈隼（★）：Sniper型遠程
  - 暗影隼（★★）：Shotgun型遠程
  - 毒霧隼（★★★）：毒霧炮+地面腐蝕液體
  - 幽靈犬（★）/ 暗影犬（★★）/ 毒霧犬（★★★）：近戰三變體
- **精英怪出場廣播**：出現時顯示名稱字幕並播放警報音效
- **阿奇爾音效整合**（`config/gameConfig.js`）：新增 `archerAttackNormal` / `archerAttackCrit` / `archerChargeAttack` / `archerHurt` / `archerDeath`
- **音效系統擴充**：新增黑色獵人 Boss 及六種精英怪完整音效（共約 51 種，位於 `Sound MP3/New sound/`）

### 調整
- 地圖選擇介面：困難難度從 🔒 解鎖為可選
```

---

## 八、待定數值（留空，日後補充）

以下數值在此設計文件中**刻意留空**，待後續平衡測試後填入：

| 項目 | 說明 |
|------|------|
| `HARD_MAP.bosses` 各 Boss hp/speed/damage | 困難難度Boss血量設計 |
| 黑色獵人每管血量 (`maxHpPerBar`) | 5管 × ? HP |
| 黑色獵人 Sniper 傷害 | 影響 Shotgun 每發傷害（= Sniper ÷ 3） |
| 各精英怪基礎血量 | 參考 HARD_MAP elites 倍率計算 |
| 毒霧隼/毒霧犬毒傷數值 | 每tick傷害 |

---

*設計文件版本：v1.0 | 對應遊戲版本：v0.0.67.1+*
