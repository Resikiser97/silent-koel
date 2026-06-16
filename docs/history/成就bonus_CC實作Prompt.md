請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、
QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用。

==================================================
任務說明（這是實作任務，不是審計任務）
==================================================

這是「只吃不叫的噪鵑」專案的成就 Bonus 系統實作。所有設計決議已經跟開發者
（Goblinnest）確認完畢，本 Prompt 是最終實作規格。請依本文件實作，過程中
若遇到本文件沒講清楚的情況，請停下來回報，不要自行猜測。

修改完成後請寫 patchnote，並跟代碼放在**同一個 commit**，但**先不要
commit/push**，等開發者看過總結並明確指示後才執行。

==================================================
0. 開工前置檢查（必須先做，不可跳過）
==================================================

開發者記得專案裡可能已經有「成就 bonus 計算」的預留位置（可能是空函式、
TODO 註解、或部分骨架）。請先做以下檢查：

1. 搜尋 config/achievements.js、main.js、systems/ 底下所有檔案，找有沒有
   跟「achievement bonus」「成就加成」「成就效果」相關的既有函式、變數、
   TODO 註解或預留欄位。
2. 如果找到完整或部分的預留計算位置：
   - 優先沿用、補完該位置，不要另外重複造一套新模組。
   - 回報你找到的位置（檔案＋行號＋現有內容摘要）。
3. 如果完全沒有找到任何預留位置，或找到的東西明顯不完整無法沿用：
   - 才新建 systems/achievementBonus.js 作為獨立模組。
4. 不論走哪條路，最終都要符合下面第 1～8 節的規格。

==================================================
1. 整體架構與插入點
==================================================

數值套用管線（沿用現有 main.js initializeGame() 內既有順序）：

loadSavedOrgans()
→ applySkillBonuses()
→ applyEvolutionEffects()
→ 【新增】applyAchievementStatBonuses()
→ applyAllMutationBonuses()

成就 bonus 的加總／套用順序（同一函式內部）：

1. flat add 類加成先套用（attackAdd / hpMaxAdd / speedAdd / critChanceAdd /
   organSlotsAdd 等），直接加在「技能/器官/進化已經套用完」的當下數值上。
2. percent 類加成接著套用（attackPercent / hpMaxPercent / speedPercent /
   attackRangePercent / radiusPercent 等），套用對象是「上一步 flat add
   套用完之後」的當下數值，不是角色最原始 base 值（跟 systems/evolution.js
   既有 radiusPercent 套用方式一致：add = Math.round(currentValue *
   percent)）。同一類型的多個百分比加成先相加成一個總百分比，再一次性
   套用一次，不要逐個連續相乘。
3. mutation（變異）倍率維持目前既有順序，在成就 bonus 套用之後最後套用
   （applyAllMutationBonuses() 不動，只是現在它的輸入值已經包含成就加成）。

同類型加成一律【相加】，不用相乘（攻速雖然底層公式跟其他數值不同，
讀 COMBAT_CONFIG.baseAttackIntervalMs，但疊加規則一樣用相加）。

欄位命名統一（避免實作時誤解）：
- 攻速使用 attackSpeedBonus，套用到 p.attackSpeedBonus。
- 特殊技能 CD 使用 specialCdReduction，正數代表縮短比例。
- 初始器官槽使用 organSlotsAdd，套用到 p.organSlots。
- 不要使用 attackSpeedPercent / specialCdPercent / startSlotAdd。

暴擊率加成單位是「絕對百分點」（例：20%→25%），不是相對倍率，實作時
要注意跟 percent 類欄位（attackPercent 等屬於「乘上去」性質）區分清楚，
不要混用同一套公式。

==================================================
2. XP 三分類（重要：本次新增 corpseXP，沿用既有 addXP 機制）
==================================================

XP bonus 分成三類，分別有獨立的 percent / add 欄位：
- fruitXpPercent / fruitXpAdd（吃果子）
- killXpPercent（擊殺怪物，含 Boss / 殺手化 / 巨人等所有擊殺來源）
- corpseXpPercent（吃屍體，對應 systems/combat.js 約第348行附近的吃屍體
  持續性 XP tick）

目前 36 個成就的 bonus 數值表（見第 7 節）裡沒有任何一項指定 corpseXP
數值，但架構必須完整支援這個欄位（即使目前全部是 0／未使用），供未來
新增成就或開發者後續調整時直接使用，不需要再改架構。

套用順序（沿用既有 mutation XP 機制的模式，不要打亂）：
1. 在呼叫 systems/reward.js 的 addXP(amount) 之前，依照 XP 來源分類
   （fruit / kill / corpse）先把成就的 flat add + percent 加成套用在
   原始 amount 上，算出加成後的數值。
2. 把算好的數值傳進 addXP()。addXP() 內部既有的
   mutationXpBonus（p.mutationXpBonus）邏輯完全不動，維持「最後乘上去」
   的順序——也就是：原始XP → 套成就XP bonus → 進 addXP() → 套
   mutation XP 倍率 → 實際入帳。

明確規定三種 XP 的來源分類（不要自己猜）：
- fruitXP：systems/player.js 的 _collectFruit（吃果子）
- killXP：systems/damage.js 的 handleGiantKill / handleKillerKill /
  handleKill，以及 systems/boss.js 內 3 個 addXP() 呼叫點（擊殺 Boss）
- corpseXP：systems/combat.js 約第348行附近的吃屍體持續性 XP tick

**不要處理寶箱/寶物相關的 XP**（systems/player.js 的
checkTreasureCollision 那個 XP 來源）——這個物件目前在遊戲裡沒有正式
實裝，本次成就 bonus 系統不需要管它，之後也不要在這個系統裡提到它。

==================================================
3. Player Stats 顯示同步（config/playerStatsFormula.js）
==================================================

calcPlayerStats(charId, skills, organs, hiddenOrgans, mutationLevels) 目前
完全沒有成就加成參數，是一個跟 runtime 平行重算一遍的純資料函式，只用於
面板顯示。必須同步修改：

1. 簽名加入成就相關參數（例如 unlockedAchievements 或等價的已解鎖成就
   bonus 加總物件），具體命名請跟既有參數風格一致。
2. 內部加總邏輯要複製一份跟 runtime（applyAchievementStatBonuses()）
   相同的計算方式與套用順序（flat add → percent → mutation），確保面板
   顯示數值跟玩家實際遊戲內數值一致。
3. 除了攻擊/HP/速度等既有數值，這次也必須讓面板能顯示／計算三種 XP
   bonus：fruitXP、killXP、corpseXP 的加成百分比/數值，供成就頁面或
   其他需要顯示這些資訊的地方使用。

==================================================
4. mutation_500 文案修正
==================================================

config/achievements.js 裡 mutation_500（「我無敵了」）的 description
文字目前寫「累積使用500次變異技能」，是錯的。改成「變異等級達到500」，
跟它實際的 condition（totalMutationLevel>=500）保持一致。其餘 35 個成就
的 description 已逐一核對跟 condition 一致，不需要動。

==================================================
5. evo_5star（forceEvoOnly）詳細規格
==================================================

採用「擴充 systems/organs.js 的 showOrganSelection()，加一個
forceEvoOnly 參數」的做法，不要新建獨立的進化選擇 UI 函式。

明確規定行為（必須跟正常進化選擇效果完全等同，不可有特殊例外）：
- 不假裝器官槽滿（不要去動 organSlotsUsed / p.organSlots 等真實數值，
  只是讓這次呼叫直接走 evoOptions-only 的渲染分支）。
- 不跳過前置條件（例如雜食性在開局生肉食=0時不出現，要跟玩家平常遊玩
  時看到的規則完全一致，不要為了 evo_5star 開特例）。
- 不額外送器官（這次呼叫只給進化選項，不能夾帶任何器官選項或獎勵）。
- 玩家選完之後，要直接呼叫現有的 applyEvolutionLevelEffect(type,
  newLevel)（systems/evolution.js），跟正常進化流程用同一個函式，
  不要另外寫一套套用邏輯。

觸發時機：在 main.js 的 initializeGame() 內，數值套用管線跑完之後
（applyAchievementStatBonuses() / applyAllMutationBonuses() 之後）才
觸發 evo_5star 的強制選擇。注意：不要在呼叫 showOrganSelection(forceEvoOnly)
前手動把 gameState.organSelectionActive 設為 true；showOrganSelection()
內部已負責設定與解除該 flag。若提前設為 true，可能觸發防重入邏輯，
導致畫面不開、只累加 pendingOrganSelections。這個 flag 本身就會讓 main.js
既有的 isGamePaused() 判定為暫停，不需要額外寫暫停計時器的代碼。因為
所有「開始遊戲」入口最終都會經過
startGameWithLoading() → initializeGame()，這個插入點會自動覆蓋首頁開始
／強制開始／再來一局等全部入口，不需要在每個入口分別加邏輯。

額外要補的保護：showOrganSelection() 現有的「無選項提早 return」保護
目前只覆蓋非 slotsFull 的路徑，請順手幫 forceEvoOnly 模式也補一個等價的
空陣列保護（雖然開局三條進化路徑都還沒解鎖，實務上幾乎不會踩到，但要有
防呆）。

==================================================
6. 技能點換變異點（mutationConfig.js）
==================================================

新建 config/mutationConfig.js，把目前寫死在兩個地方的「100 技能點 →
10 變異點」裸數字搬進去。解鎖 skill_master 成就後，技能點消耗從
100 折扣為 90（變異點產出仍是 10 不變）。

必須同時修改兩條路徑，確保兩邊永遠讀同一份 config，不能只改一邊：
- 首頁技能樹／變異面板路徑：systems/evolution.js（約第860~900行附近的
  變異面板 UI 邏輯）
- 遊戲內變異器官面板路徑：systems/mutation.js 的 showMutationPanel()
  （約第370~415行附近）

==================================================
7. 成就 bonus 數值表（依此實作 config/achievements.js 的 bonus 欄位）
==================================================

說明：以下表格的數值欄位，凡是沒有「%」符號的（例：攻擊 +1、HP上限 +2）
一律是 flat add；有「%」符號的一律是百分比加成（percent，依第1節順序
套用）；「個百分點」是絕對值加成（critChanceAdd），不是乘數。

【容易達成】
- first_play：無 bonus（null）
- tutorial_done：{ attackAdd: 1 }
- first_death：{ hpMaxAdd: 1 }
- first_clear：{ fruitXpAdd: 1 }
- clear_normal：{ hpMaxAdd: 2 }

【中等難度】
- clear_10：{ speedAdd: 0.5 }
- kill_black_bear：{ hpMaxAdd: 3 }
- kill_scorpion：{ speedAdd: 0.5 }
- kill_shark：{ attackAdd: 3 }
- kill_hunter：{ attackSpeedBonus: 0.05 }
- speed_kill_boss：{ attackSpeedBonus: 0.05 }
- organ_collector：{ critChanceAdd: 0.05 }（絕對百分點）
- bone_500：{ critChanceAdd: 0.05 }（絕對百分點）
- fruit_2000：{ fruitXpPercent: 0.05, killXpPercent: 0.05 }
- level_50：{ attackPercent: 0.10 }
- evo_5star：{ special: 'forceEvoChoice' }（無數值，見第5節）
- veteran_days：{ hpMaxPercent: 0.05 }
- win_streak_5：{ hpMaxAdd: 10 }
- night_owl：{ attackAdd: 1 }

【高難度】
- clear_hard：{ attackPercent: 0.05 }
- hunter_slayer：{ killXpPercent: 0.10 }
- speed_clear：{ speedPercent: 0.10 }
- kill_10000：{ killXpPercent: 0.25 }
- kill_100_killer：{ attackPercent: 0.05 }
- kill_100_giant：{ radiusPercent: 0.20 }
- no_damage_clear：{ specialCdReduction: 0.10 }（特殊技能CD縮短10%）
- no_regen_clear：{ hpMaxAdd: 20 }
- clear_100：{ fruitXpPercent: 0.10, killXpPercent: 0.10 }
- skill_master：{ mutationExchangeDiscountPercent: 0.10 }（對應100→90，
  讀 config/mutationConfig.js）
- koel_50：{ attackRangePercent: 0.10 }（全域，不分角色）
- archer_50：{ attackRangePercent: 0.10 }（全域，不分角色）
- mutation_100：{ radiusPercent: 0.20 }

【特殊/隱藏】
- pioneer：{ allStatsPercent: 0.05 }，範圍**只展開為**
  attackPercent +0.05、hpMaxPercent +0.05、speedPercent +0.05 三項，
  **不包含**體型（radiusPercent）、攻擊範圍（attackRangePercent）、
  暴擊（critChanceAdd）、任何 XP 加成、攻速（attackSpeedBonus）、
  特殊技能CD（specialCdReduction）。
- mutation_500：{ specialCdReduction: 0.10 }（description 同步修正，
  見第4節）
- all_achievements：{ organSlotsAdd: 1, fruitXpPercent: 0.05,
  killXpPercent: 0.05 }
- clear_hell：無 bonus（null，地獄難度未做）

==================================================
8. 完成後動作
==================================================

1. 修改完成後，寫一份 patchnote（跟版本號規則一致，y 或 z 進位由你判斷
   屬於新功能還是 bug fix），跟代碼放在同一個 commit 內準備好。
2. **不要執行 commit / push**，先停下來，把修改總結回報給開發者，等開發者
   確認後才執行。
3. 如果實作過程中發現本文件以外的衝突、矛盾，或第 0 節檢查發現的預留
   位置跟本文件規格有衝突，請停下來回報，不要自行決定怎麼處理。
