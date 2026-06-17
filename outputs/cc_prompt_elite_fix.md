請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用。

# 背景

上一輪修改（圖鑑大改版，v0.1.25.8）尚未 commit。這次是同一個版本的後半段修正，**不要新增版本號**，直接在現有 v0.1.25.8 的基礎上繼續修改、繼續寫進同一個 v0.1.25.8 區塊。

這次要修正「精英怪」圖鑑條目的多處錯誤，並把相關數值改成從設定檔動態引用，而不是寫死的數字（延續上一輪「typeof 全域偵測 → 明確 import」的精神）。

# 背景知識（已查證的實際機制，不要再重新猜測）

- 精英怪實際運作系統是 `systems/elite.js` 的「靜音獵隊」系統（`_spawnHunterElite`），三張地圖（Easy/Normal/Hard）都是走這套系統，**沒有任何地圖在用** `config/creatures.js` 裡 `ELITE_CONFIG.nights[].xp` 那套舊獎勵數字。
- 簡單/普通難度：開局時用 `initEliteOrder()`（mapSeed 洗牌）決定「幽靈犬／暗影犬／毒霧犬」三者誰落在第一/第二/第三夜，**不是固定**幽靈犬＝第一夜。固定的只有「夜晚→星級」（第1夜★、第2夜★★、第3夜★★★）。三犬本身沒有與生俱來的強弱差異，數值純粹看落在哪一夜（`ELITE_CONFIG.base.hp * EASY_MAP/NORMAL_MAP.elites[i].hpMultiplier * creatureStrength.hostile.hpMultiplier`）。
- 困難難度：開局時 50% 機率整局固定用「三犬」、50% 機率整局固定用「三隼」（`usesFalcon = seededRand() < 0.5`），不會三夜混搭，且哪一隻落在哪一夜也是洗牌決定。困難難度的數值是**綁在種類本身**（`HARD_ELITE_CONFIG`，固定值），不是綁在星級，所以星級標籤只代表出場順序，不代表真實強度（例如毒霧犬最強，但被洗牌排到第一夜時畫面上仍只顯示★）。
- 擊殺獎勵（XP / 技能點 / 變異點）不分難度、只看星級，來源是 `systems/elite.js` 的 `_HUNTER_ELITE_REWARDS`：★=200XP+2技能點+1變異點、★★=350XP+3技能點+2變異點、★★★=500XP+4技能點+3變異點。
- 毒抗：`_spawnHunterElite` 裡目前硬寫 `poisonResist: 0`，靜音獵隊精英怪實際毒抗是 0%，**不是**圖鑑現在寫的 20%（20% 是舊系統 `ELITE_CONFIG.base.poisonResist` 的數字，跟現在的怪物無關）。

驗證用參考數值（你算出來的結果應該要對得上，但正式文字用程式動態算，不要手動寫死）：
- 簡單難度 HP：★250 / ★★375 / ★★★500
- 普通難度 HP：★375 / ★★750 / ★★★1500
- 困難難度三犬固定值：幽靈犬 HP480/傷害20/近戰；暗影犬 HP900/傷害30/近戰；毒霧犬 HP1500/傷害45/近戰＋咬擊附帶中毒
- 困難難度三隼固定值：幽靈隼 HP336/傷害26/遠程，蓄力瞄準後單發精準追蹤；暗影隼 HP630/傷害39/遠程，近距離4連發散彈；毒霧隼 HP1050/傷害58/遠程，雙技能交替：毒牆封路（3顆炮彈）／回旋毒牙，皆附帶中毒

# 修改項目

## 1. config/creatures.js

在 `ELITE_CONFIG` 附近新增兩個具名 export：
- `HUNTER_ELITE_REWARDS`：把 `systems/elite.js` 現有的 `_HUNTER_ELITE_REWARDS` 物件原樣搬過來（`{1:{xp:200,skillPts:2,mutPts:1}, 2:{...}, 3:{...}}`）。
- `HUNTER_ELITE_POISON_RESIST`：值為 `0`，並加註解說明這是靜音獵隊精英怪（犬/隼）的毒抗，跟 `ELITE_CONFIG.base.poisonResist`（舊系統用，已無地圖使用）是兩個獨立數值，不要合併。

## 2. systems/elite.js

- 刪除本地 `const _HUNTER_ELITE_REWARDS = {...}`，改為從 `'../config/creatures.js'` import `HUNTER_ELITE_REWARDS`，並把第207行 `_HUNTER_ELITE_REWARDS[elite.starTier] || _HUNTER_ELITE_REWARDS[1]` 改成使用 import 進來的名稱。
- `_spawnHunterElite` 裡 `poisonResist: 0,` 改成 `poisonResist: HUNTER_ELITE_POISON_RESIST,`（同樣從 creatures.js import）。
- 行為必須完全不變，這只是把寫死的數字搬到具名常數，純粹給圖鑑動態引用用，不要動到任何戰鬥邏輯、CD、傷害計算。

## 3. config/compendium_data.js

補 import：
- `HARD_ELITE_CONFIG`（from `./gameConfig.js`，已存在的 export，只差這行 import）
- `HUNTER_ELITE_REWARDS`、`HUNTER_ELITE_POISON_RESIST`（from `./creatures.js`，上面新增的）

「精英怪」條目（`id: 'elite'`）整篇重寫，要求：
- 標題改成 `{ 'zh-TW': '⭐精英怪', 'en': '⭐ Elite Creatures' }`
- 拿掉「★ 幽靈犬（第一夜）／★★ 暗影犬（第二夜）／★★★ 毒霧犬（第三夜）」這種把種類綁死在特定夜晚的寫法
- 改成說明：簡單/普通難度每局開始時，三犬出現順序由本局種子隨機決定，星級固定對應夜晚順序（第1夜★／第2夜★★／第3夜★★★），但哪隻犬落在哪一夜是隨機的
- 簡單難度、普通難度**分別**列出★/★★/★★★三級的 HP 數值（用 `ELITE_CONFIG.base.hp * EASY_MAP.elites[i].hpMultiplier * EASY_MAP.creatureStrength.hostile.hpMultiplier` 這類運算動態算出，NORMAL_MAP 同理，不要手動填數字）
- 擊殺獎勵用 `HUNTER_ELITE_REWARDS` 動態列出三個星級各自的 XP/技能點/變異點（兩難度共用同一套，講清楚跟難度無關）
- 毒抗用 `HUNTER_ELITE_POISON_RESIST * 100` 動態算出並顯示百分比
- 困難難度段落：說明開局時 50% 機率整局固定犬隊、50% 機率整局固定隼隊，不會混搭；列出三犬與三隼各自固定數值（用 `HARD_ELITE_CONFIG.specterDog/shadowDog/venomDog/specterFalcon/shadowFalcon/venomFalcon` 動態引用 hp/damage）與技能行為（犬＝近戰，毒霧犬咬擊附帶中毒；隼＝遠程，幽靈隼蓄力單發、暗影隼散彈、毒霧隼雙技能輪替）；註明星級標籤只代表該局出場順序，不代表真實強度排名
- 困難難度精英怪不回血（沿用現有文字即可）
- 中英文（zh-TW / en）都要改，內容對應一致
- 全篇禁止出現「seed」、「mapSeed」這類技術字眼，要用「本局種子」「開局時隨機決定」這種玩家能懂的說法（沿用前一輪 Boss 條目的用語風格）

## 4. 文件同步

- `ARCH.md`、`QUICKREF.md`：兩處列 `creatures.js` export 的那一行（`CREATURE_CONFIG、ELITE_CONFIG、BOSS_CONFIG`），補上 `HUNTER_ELITE_REWARDS`、`HUNTER_ELITE_POISON_RESIST`
- `MAIN.md`：第120行附近寫 elite.js 本地有 `_HUNTER_ELITE_REWARDS`（顯示常數），改成說明已搬到 `config/creatures.js`，elite.js 改為 import 使用
- `CHANGELOG.md`、`config/patchnotes.js`：**不要新增版本區塊**，直接在現有 v0.1.25.8 的 added/fixed 陣列裡補上這次的修正項目（例如：精英怪條目修正隨機機制描述、擊殺獎勵數字、毒抗數值、困難難度犬隼混淆；`HUNTER_ELITE_REWARDS`/`HUNTER_ELITE_POISON_RESIST` config 化）
- `project_summary.md`：「當前狀態」一併更新成同時反映這兩階段的修改內容
- `docs/history/dependency_map.md` 是歷史快照文件，這次不用動

# 驗證（請在報告中明確列出每一項的結果，不要省略）

1. 搜尋整個圖鑑輸出內容（`COMPENDIUM_DATA` 渲染後的 zh-TW / en 字串）有沒有 `undefined` 或 `NaN`
2. 跑 `npm test`，回報通過/失敗與測試數
3. 跑 `npm run build:itch`，回報成功/失敗
4. 確認 `systems/elite.js` 的戰鬥行為（CD、傷害、毒效果）跟修改前完全一致，只是數字來源從本地常數變成 import

# 注意事項

- 不要動任何跟這次任務無關的 UI、版面、互動邏輯
- 修改完成後**不要 commit**，整理 sync-docs 報告給開發者看，等開發者確認後才下 commit / push 指令
