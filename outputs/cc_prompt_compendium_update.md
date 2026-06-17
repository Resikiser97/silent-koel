請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用（特別留意 compendium 相關 Skill）。

## 任務：更新圖鑑內容，修正與現行遊戲機制不一致 / 遺漏的地方

本次只處理 `config/compendium_data.js` 內容與必要的相關 import / 文件同步，**不要改動無關 UI（樣式、版面、互動邏輯）**。

---

### 1. 修正圖鑑 Boss / 精英怪數值 undefined / NaN（根因修復）

現況：`config/compendium_data.js` 第 9~18 行用
```js
const _boss = (typeof BOSS_CONFIG !== 'undefined') ? BOSS_CONFIG : {};
const _ec   = (typeof ELITE_CONFIG !== 'undefined') ? ELITE_CONFIG : {...};
const _ev   = (typeof EVOLUTION_PATHS !== 'undefined') ? EVOLUTION_PATHS : {};
const _easyBosses   = (typeof EASY_MAP   !== 'undefined' && EASY_MAP.bosses)   ? EASY_MAP.bosses   : [];
const _normalBosses = (typeof NORMAL_MAP !== 'undefined' && NORMAL_MAP.bosses) ? NORMAL_MAP.bosses : [];
const _hardBosses   = (typeof HARD_MAP   !== 'undefined' && HARD_MAP.bosses)   ? HARD_MAP.bosses   : [];
```
這是舊版「讀全域變數」寫法，專案已全面 ESM 化（無全域變數），導致這些 `typeof` 永遠是 `'undefined'`，全部 fallback 成空物件 → 日夜循環、Boss 數值、精英怪數值顯示 undefined / NaN。

請改為明確 import：
```js
import { BOSS_CONFIG, ELITE_CONFIG } from './creatures.js';
import { EASY_MAP } from '../map/easymap.js';
import { NORMAL_MAP } from '../map/normalmap.js';
import { HARD_MAP } from '../map/hardmap.js';
```
（已確認 `BOSS_CONFIG`、`ELITE_CONFIG` 從 `config/creatures.js` export；`EASY_MAP`/`NORMAL_MAP`/`HARD_MAP` 分別從 `map/easymap.js`/`map/normalmap.js`/`map/hardmap.js` export，各自含 `bosses` 陣列。請依實際路徑與檔案內 export 名稱核對，若有出入以代碼為準。）

`EVOLUTION_PATHS` 目前找不到對應 export，請自行確認此全域變數實際定義在哪個檔案（若已不存在或改名，需同步調整 `_ev` 的 fallback 邏輯，不要保留無效的 `typeof` 寫法）。

移除所有 `typeof X !== 'undefined'` 的 safe-read 寫法，改用直接 import 後的變數（保留原有 `|| {}` 等 fallback 以防資料結構缺欄位即可，但不應再用 `typeof` 偵測模組是否存在）。

完成後請確認以下條目不再出現 undefined / NaN：
- 日夜循環（`day_night_cycle` 條目）
- 黑熊 / 大白鯊 / 沙漠蠍王（`black_bear` / `great_white_shark` / `scorpion_king` 條目）
- 精英怪（`elite` 條目）

---

### 2. Boss 隨機機制同步進圖鑑（玩家語言，不寫 seed）

現況：Easy / Normal 難度第四夜 Boss 由 `systems/boss.js` 的 `initBossBiome()` 在遊戲開始時隨機決定 `gameState.bossBiome`，**不是**由玩家當下所在生態區決定。Hard 難度不受影響（固定獵人 Boss）。

請在 Boss 分類說明（或新增一個簡短的機制條目）補充類似文字：
> 「Easy / Normal 難度的第四夜 Boss，會在本局開始時隨機決定，不一定取決於玩家當下所在的生態區。」

明確避免「人在森林就一定出黑熊、人在海洋就一定出大白鯊」這種誤導文字。**不要使用 seed / mapSeed 等技術詞**，全部用玩家能懂的說法。

---

### 3. 新增「成就與永久加成」說明

現況：`config/achievements.js` 共 36 個成就（已確認 `id:` 計數為 36），每個成就含 `bonus` 欄位，永久生效。已觀察到的 bonus 類型包含（不需窮舉，圖鑑只需概述）：攻擊（`attackAdd`/`attackPercent`）、HP（`hpMaxAdd`/`hpMaxPercent`）、速度（`speedAdd`/`speedPercent`）、攻速（`attackSpeedBonus`）、果子 XP（`fruitXpAdd`/`fruitXpPercent`）、擊殺 XP（`killXpPercent`）、特殊技能冷卻（`specialCdReduction`）、器官槽（`organSlotsAdd`）、全屬性（`allStatsPercent`）、變異兌換折扣（`mutationExchangeDiscountPercent`）、暴擊率（`critChanceAdd`）、採集/攻擊範圍（`radiusPercent`/`attackRangePercent`）等。

紅點提示機制：`systems/achievements.js` 第 456~466 行附近，未查看過的成就格子會顯示紅點（`#FF4444` 小圓點），點開查看後清除。

請在「遊戲機制」分類新增一個條目，簡要說明：
- 成就解鎖後提供永久加成（跨局保留）。
- 加成種類舉例即可（攻擊、HP、速度、攻速、果子 XP、擊殺 XP、特殊技能冷卻、器官槽、全屬性、變異兌換折扣等）。
- 成就需要點開查看後才會清除紅點提示。
- 可指引玩家從哪裡查看成就（請自行確認入口位置，例如 HUD 上的成就按鈕，不要猜測文案）。

---

### 4. 新增「角色」說明

現況：`config/characters.js` 定義兩個角色：

- **噪鵑（koel）**：`startEvolution: { type: 'herbivore', level: 1 }`，`attackSpeed: 1000`，`specialSkill: 'dash'`（F 技：瞬間位移 + 短暫無敵，`dashInvincible: 500`）。
- **阿奇爾（archerfish）**：`startEvolution: { type: 'carnivore', level: 1 }`，`startOrgans: [{ id: 'mouthOrgan', level: 3 }]`（起始嘴器 Lv3），`isRanged: true`（遠程攻擊），`attackSpeed: 1500`，`waterSpeedMultiplier: 1.5`（水中速度 ×1.5），`specialSkill: 'archerfishDash'`（F 技：短時間衝刺加速，`dashStunDuration: 500` 可暈眩碰到的敵人）。

請新增「角色」條目（建議放在「遊戲機制」分類，或視現有分類結構決定最合適位置），分別說明兩個角色的起始進化型態、起始器官、基礎攻擊間隔、特殊能力與 F 技效果。

同時修改「基本操作」條目（`basic_controls`，目前第 51~57 行）中「按 F 鍵...瞬間位移並獲得短暫無敵」的描述，改成「F 技依角色不同而有不同效果，詳見角色說明」之類的中性文字，不要只寫閃現（因為阿奇爾的 F 技是衝刺暈眩，不是閃現）。

---

### 5. 補 Player Stats / 採集範圍說明

現況：v0.1.25.6 已在 Player Stats 面板新增「採集範圍」欄位（`config/playerStatsFormula.js` / `systems/achievements.js`），顯示體型 + 器官加成 + 技能加成的合計有效採集距離。

已確認的相關來源：
- 技能：`collectionAddiction`（收集成癮），`lang/zh-TW.js` 第 462 行描述為「收集範圍 +10px（果子、屍體和白骨，每級）」。
- 器官：`config/organs.js` 第 98~105 行「大腦」（`pickupRangeAdd: 10/15/15`，依等級），第 210~212 行「強大的手臂」（隱藏器官，`pickupRangeAdd: 15`）。

請在 XP / 器官 / Player Stats 相關位置（建議在現有 `organ_system` 或 `xp_and_level` 條目補充，或視內容篇幅另開小條目）補充：
- 採集範圍影響果子、屍體、白骨的拾取距離。
- 來源包含體型（body size）、器官效果、技能效果。
- 相關技能：收集成癮每級 +10px。
- 相關器官例子：大腦、強大的手臂等（可視篇幅再列其他有 `pickupRangeAdd` 的器官，請自行搜尋 `config/organs.js` 確認是否有遺漏）。

---

### 6. 技能樹說明補完整導引

現況：圖鑑目前 `skill_tree` 條目（第 107~113 行）只列 3 個推薦技能（強壯體魄、採集專家、記憶器官）。完整 9 種技能定義在 `lang/zh-TW.js` 第 455~463 行：

```
強壯體魄（vitality）、敏捷身手（agility）、採集專家（forager）、獵人本能（hunter）、
頑強意志（tenacity）、記憶器官（organMemory）、幸運重選（luckyReroll）、
收集成癮（collectionAddiction）、恐怖之牙（terribleFang）
```

請保留現有推薦技能的描述，並補上完整 9 種技能名稱列表（不需重複展開每級數值，註明可在「進化系統 > 技能樹」分頁查看詳細等級數值即可）。

---

### 7. 新增「排行榜 / 名人堂」說明

現況：`config/supabase.js` 已實作：
- 一般排行榜（依難度）。
- 趣味榜（九種特殊統計，例如最速通關、最速死亡、巨人獵人、殺手獵人、殺手克星、最快擊殺 Boss、最高等級、最快擊殺黑色獵人、最佳果王、最強獵戶、白骨精，詳見檔案開頭註解第 12~22 行）。
- 名人堂（`fetchHallOfFameShowcase` / `fetchHallOfFameTop10` / `fetchHallOfFameMyRank`）。
- 首頁排行榜側欄目前顯示 TOP5（v0.1.25.4 由 TOP10 改為 TOP5，手機桌機一致）。

請新增短條目（建議放在「遊戲機制」分類）說明：
- 排行榜用於查看不同難度的通關 / 分數紀錄。
- 趣味榜顯示特殊分類紀錄（不需窮舉全部九種，可舉 2~3 例）。
- 名人堂保存玩家代表性紀錄。
- 首頁目前顯示 TOP5 摘要。

---

## 驗證

1. 搜尋 `config/compendium_data.js` 產出的中文內容（可寫一個簡單 node 腳本 import 該檔案並印出所有 `content['zh-TW']` 字串），確認不再出現 `undefined` 或 `NaN`。
2. `npm test`，確認全部通過。
3. `npm run build:itch`，確認 build 無錯誤。
4. 若有文件版本 / patchnote 規則需要同步，請依 `VERSION_RULES.md` / `DOC_INTEGRITY.md` 處理（更新 `gameConfig.js` 版本號、`CHANGELOG.md`、`patchnotes.js`），但不要順手改無關內容。本次屬於 bug fix（修 undefined/NaN）+ 內容補完（新增多個圖鑑條目），請依 `VERSION_RULES.md` 的「混合情況」規則判斷（新增功能/內容優先於修 Bug，y +1，z 歸零），並在處理前列出你判斷的版本號，等開發者確認後才寫入。

## 注意事項

- 全部使用繁體中文文案。
- Boss 隨機機制只能用玩家語言描述，不可出現 seed / mapSeed 等技術詞。
- 不要改動 UI layout、樣式或互動邏輯，本次只處理圖鑑內容資料與必要的 import 修正。
- 若任何一項在代碼中發現與本 Prompt 描述不符（例如某個 export 名稱不同、某個機制已變更），請依 DOC_INTEGRITY.md 規則回報，不要自行假設後硬寫。
- **代碼修改完成後不要 commit**，整理完成後回報修改摘要，等開發者確認後才下指令 commit/push。
