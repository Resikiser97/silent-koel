## v0.1.28.0

# 只吃不叫的噪鵑（The Silent Koel）— 專案核心背景與進度文檔

> 這份文件是給 Claude Chat 新對話的必讀文件。
> 閱讀後應能立即理解：這個遊戲是什麼、現在開發到哪、下一步做什麼。
> 代碼優先文件——描述與實際代碼衝突時，以代碼為準，回報給開發者修正。

---

## 快速定位（新對話必讀）

**這是什麼：** 單人獨立開發的瀏覽器 Roguelike，HTML + JavaScript，由 Goblinnest 開發，AI（CC + Codex）輔助。

**現在版本:** v0.1.28.0

**當前狀態：** 聊天室多頻道 + GM 多重置頂系統完成（三語言分頻道、pin_slot 1~3 顯示格 + 4+ FIFO 排隊、pin_expires_at 伺服器端到期時間）；三普通 Boss 攻擊節奏、鯊魚衝刺與蠍王毒霧已完成新節奏調整。

**下一步：**
1. 實機測試聊天室多頻道分頁與 GM 置頂功能
2. 實機微調鬣狗包圍圈距離、隊長焦點、Alpha regroup 與三犬精英攻擊手感
3. Boss 攻擊手感實機測試與下一輪技能調整
4. Stage F 批次 3b：拆 evolution / organs / ui 循環
**開發工具：**
- Claude Chat（規劃、審查、寫 Prompt）
- Claude Code / CC（執行代碼修改）
- Codex（靜態審計、唯讀排查，可與 CC 平行）
- Git push：`"C:\AI\Git\bin\git.exe" -C "c:\AI\VS CODE" push origin master`

---

## 一、遊戲核心設計

### 遊戲簡介
一款以 HTML + JavaScript 製作的瀏覽器 Roguelike 生態遊戲。
玩家扮演噪鵑（小黑鳥），在森林／海洋／沙漠三種地形的 8000×8000 無縫循環世界中生存，
透過收集器官進化，擊敗每個夜晚的精英怪，最終在第四個夜晚擊敗 Boss 獲得勝利。

### 核心遊戲循環
```
出生（草食性小鳥）→ 吃果子獲得XP → 選擇器官升級
→ 躲避/攻擊敵意生物 → 夜晚精英怪出現
→ 選擇進化路線 → Boss夜決戰 → 勝利/死亡 → 技能樹繼承
```

### 商業目標
- 第一步：itch.io 免費上架測試市場
- 第二步：投稿 CrazyGames／Poki 廣告分潤
- 第三步：根據反饋決定手機版或 Steam

---

## 二、系統設計決策

### 遊戲基本設定
- 遊戲時間：10 分鐘一局（`timeRemaining = 600`）
- 日夜循環：每 75 秒切換一個時段，共 8 時段（4 白天 4 夜晚）
- 第四個夜晚（phaseIndex 7）：Boss 夜，Boss 在剩餘 150 秒時生成
- 地圖：8000×8000，Tileable Noise 無縫循環，開局固定森林中心（4000, 4000）

### 器官系統
- 初始 5 個槽位，每個器官（含升級）各佔 1 格
- 累積達到槽位上限後觸發進化路線選擇，每次進化後槽位 +3
- 普通器官 15 種（攻擊⚔️／防禦🛡️／靈力🔮各類），各有 Lv1~3
- 隱藏器官 4 種（擊敗精英怪 50% 機率掉落）：強大的心臟、強大的大腿、強大的手臂、強大的眼睛
- 特殊器官：毒囊（雜食性 Lv1 自動給予，白骨素自動升級，共 10 級）
- 死亡後可保留器官數：依「記憶器官」技能等級，預設 0 個（Lv1=1，Lv2=2，Lv3=3）

### 進化系統（各路線 Lv1~5）
- 🌿 草食性：HP 加強、果子 XP、中立生物友善；初始已解鎖 Lv1
- 🥩 肉食性：可吃屍體、攻擊加成、Lv3+ 攻速加成；無前置條件
- ⚖️ 雜食性：需草食≥1 且肉食≥1；速度加強；可吞噬白骨；Lv1 自動給予毒囊
- 進化路線等級每局重置

### 毒傷機制（v0.1.17.0 疊加系統完成，重要）
- 毒傷為**疊加層數系統**（`poisonStacks` 陣列），每層獨立計時
- 毒刺三個等級統一持續 5 秒，Lv3 累計 10/s
- 玩家對怪物毒傷使用獨立 stack，不同來源或多次命中會疊加，不覆蓋
- 攻擊命中帶有至少 1 層毒的目標時會引爆即時傷害，並讓所有 stack -1 秒

### 精英怪系統（困難地圖：靜音獵隊）
- 困難地圖精英怪為靜音獵隊：三隼或三犬，順序由 mapSeed 決定
- 幽靈隼：蓄力瞄準，射擊追蹤玩家即時位置，wrappedDelta 角度計算
- 毒霧隼雙技能：
  - 攻擊一（毒牆）：3 顆炮彈垂直封路，CD 3500ms，起手必用
  - 攻擊二（毒牙）：3 根回旋毒牙展開 25°，原路返回，CD 3000ms
- 白天消散時清除 topBarTarget 和 topBarFadeTimer（不走擊殺流程）

### 巨人/Alpha 系統（v0.1.9.0 重寫）
- 巨人化後為無隊伍獨立巨人
- 兩隻無隊伍獨立巨人 300px 內相遇 → hp 較高者升格 Alpha
- Alpha 死後從隊伍 ≥2 隻的巨人隊長中選 hp 最高者升格

### 鬣狗群體系統（v0.1.11.0 重寫）
- 出生帶 packGroup（1~2），物理碰面 300px 才合併，上限 20 隻
- 超出 800px 有 3 秒寬限期，落單優先歸隊
- 車輪戰：同時只有 1 隻鬣狗攻擊，輪替 CD 600ms

### 技能樹（9 種技能）
費用（階梯制）：Lv1=1點，Lv2=2點，Lv3=3點，Lv4=4點，Lv5=5點；全滿需 63 點

技能點來源：
- 精英怪擊殺：第1夜+1，第2夜+1，第3夜+2
- Boss 擊殺：+3
- 時間獎勵（結算時）：`Math.floor((600 - timeRemaining) / 180)`
- 等級獎勵（結算時）：`Math.floor(player.level / 6)`

### 變異器官系統
- 永久解鎖系統，跨局保留，存於 localStorage（`mutationSkills` key）
- addMutationPoints() 由巨人化/Alpha/殺手化擊殺觸發（v0.1.13.0 修復）

### 難度系統
- 簡單（easy）/ 普通（normal）/ 困難（hard）地圖
- 困難地圖：靜音獵隊精英怪、巨人化、殺手化、敵意生物無上限

---

## 三、當前開發狀態

### 最近完成的工作
- v0.1.28.0：聊天室多頻道 + GM 多重置頂系統 — 三語言分頻道分頁 Tab（全服/中文/Eng，⭐ 設定預設頻道存 localStorage）；pin_slot 1/2/3 同時最多 3 則置頂公告、4+ 為 FIFO 排隊補位；pin_expires_at（timestamptz）伺服器端存期限，解決重整後到期時間重置問題；新增 `_refreshPinnedSlots` / `_promoteQueueToSlot` / `_setDefaultChannel` / `_switchChannel` 輔助函式；UPDATE Realtime 訂閱同步 pin 狀態變更
- v0.1.27.2：大白鯊衝刺警告箭頭改為 cull 前繪製（Boss 本體不在螢幕內時箭頭仍會顯示，避免看起來像瞬移）；箭頭新增充能視覺，warning 階段長度從 0 漸進到滿長
- v0.1.27.1：黑熊暴擊浮動文字亂碼修正；大白鯊衝刺箭頭距離同步修正（charging 開始時重新計算距離，確保狂暴後箭頭與衝刺路徑一致）
- v0.1.27.0：三普通 Boss 攻擊節奏改版 — `BOSS_CONFIG` 新增黑熊/大白鯊/沙漠蠍王 melee 設定，`boss.js` 新增 `_bossMeleeRange()`、`_bossMeleeProfile()`、`_sharkChargeDistance()`，三王普攻改為前搖/命中窗/後搖流程並使用體型命中距離公式；黑熊狂暴後後搖 -500ms；大白鯊衝刺距離 cap 1000px、CD 2500ms、傷害 ×2；蠍王毒霧警告 500ms，tick 命中追加 8 DPS / 3 秒毒 debuff；新增 `tests/systems/boss.test.js` 回歸測試
- v0.1.26.1：黑色獵人 Boss 腳步聲節奏與近戰距離公式調整 — `AUDIO_FILES` 新增 `hunterFootstep1` / `hunterFootstep2` 分別對應 `hunter_footstep_1.mp3` 與 `hunter_footstep_2.mp3`；`_updateHunterBoss()` 改用兩個獨立 timer，第一個腳步聲每 2500ms 播放一次、第二個腳步聲每 1000ms 播放一次；`_bodyMeleeRange()` 與 `_eliteDogMeleeRange()` 改為「怪物半徑 + max(怪物 attackRange, 目標半徑) + rangeBuffer」，命中寬限另加 `hitGraceBuffer`；草食生物補上 `attackRange: 20`；補 `achievements/damage` 測試 mock 與近戰距離公式回歸測試
- v0.1.26.0：生物 AI 手感第一版與隊伍行為第二階段 — `CREATURE_AI_CONFIG` 集中生物分離、近戰前中後搖、鬣狗 pack/包圍、Alpha regroup、三犬精英近戰節奏數值；所有近戰生物攻擊改走 `_tryMeleeAttack()`，前搖可取消、Strike window 結束才做命中判定並閃光、後搖作為攻擊 CD；新增 `_applyCreatureSeparation()` 比例制分離；鬣狗 1~3 隻試探、4+ 隻包圍左右/後方並保留前方缺口，改為 2 隻主攻擊者、本地連通隊伍計數、隊伍人數越多包圍圈越大，玩家攻擊任一鬣狗會觸發本地隊長/pack focus 集火玩家；巨人隊伍低血/離隊成員會往 Alpha 或高血核心 regroup，巨人/Alpha 被玩家攻擊後 5000ms 內會短暫激怒並轉向玩家；三犬精英近戰加入前中後搖與體型命中範圍，傷害沿用主線精英數值公式；草食反擊不追擊離開攻擊距離的玩家
- v0.1.25.9：精英怪數值機制全面修正 — 困難難度 HP/傷害/速度改用與簡單/普通相同的倍率公式（移除 `isHardMap` 固定數值分支）；速度公式補入地圖 `speedMultiplier`；新增隼族差異化（HP×0.7、傷害×1.3）；`HUNTER_ELITE_REWARDS` 拆分為 easy/normal/hard 三張表；犬族近戰傷害改用公式值
- v0.1.25.8：圖鑑 ESM import 修復（移除 `typeof` 全域偵測，改為明確 import `BOSS_CONFIG`/`ELITE_CONFIG`/`EVOLUTION_PATHS`/`EASY_MAP`/`NORMAL_MAP`/`HARD_MAP`，修正 Boss/精英怪數值 undefined/NaN）；新增「角色」（噪鵑/阿奇爾）、「成就與永久加成」、「排行榜與名人堂」、「Boss出現機制」條目；補採集範圍、9種技能列表、F鍵中性描述
- v0.1.25.6：Boss biome 改由 Seed 決定（Easy/Normal，`initBossBiome()` + `gameState.bossBiome`）；Player Stats XP 區加「採集範圍」欄（體型+器官+技能合計）；特殊技能按鈕加圓角邊框、Ready/CD 視覺區分；聊天稱號 toLowerCase 修復
- v0.1.25.5：聊天室間距與稱號同步修復 — `chat.js` 時間／lv／【GM】／稱號／暱稱間距統一改用 margin-right:3px，移除手動插入空白字元（_buildMsgHTML、renderChat 展開版置頂、_parseName）；`syncTitleToServer()` 補上 saveChatSettings() 本地同步，稱號選後立即生效
- v0.1.25.4：手機版 UI 修復 — `achievements.js` 成就面板手機版改直向堆疊（移除 leftCol 寫死 min-width:340px 與 zoom:1.18），修復手機完全無法閱讀的問題；`ui.js` 更新公告手機字級退回 v0.1.25.3 放大前數值；`config/supabase.js` 首頁排行榜側欄 TOP10 改 TOP5（手機桌機一致）

### 已知問題（待修）
- 目前無已確認且仍未解決的條目

---

## 四、里程碑進度

### ✅ 已完成
- 新手教學系統
- 海洋和沙漠專屬生物差異化
- 多語系（繁中／英文）
- 排行榜系統（Supabase）
- 手機版支援
- 音效系統（Web Audio API）
- 變異器官系統
- 雲端帳號存檔系統
- 聊天室系統
- 困難難度地圖（v0.1.0.0）
- ESM 全模組化（v0.1.5.0）
- Web Audio API 遷移，解決 iOS Safari 音效卡頓（v0.1.7.0）
- 精英怪出現規則重構（v0.1.8.0）
- Loading 畫面（v0.1.9.0）
- 巨人/Alpha 系統重寫（v0.1.9.0）
- 毒霧隼雙技能、毒傷疊加、鬣狗車輪戰（v0.1.11.0）
- 文件架構建立（v0.1.12.0~v0.1.13.3）
- 修復手機瀏覽器工具列、iOS Safe Area、Android 虛擬按鍵遮擋與雙擊縮放造成的畫面跑版問題（v0.1.13.7）
- 統一 Letterbox 縮放 + Chat panels 移入遊戲容器（v0.1.14.0）
- 修復首頁技能樹變異頁關閉後聊天室不恢復、開發者工具被 Letterbox 裁出畫面外的問題（v0.1.14.1）
- 修復草食性 Lv4/5 巨人不攻擊玩家、巨人卡死在果子旁、困難模式再來一次變簡單、箭頭無 outline（v0.1.14.2）
- 修復黑色獵人血管擊破後跳白天問題，補上 x5 HUD 顏色階段顯示（v0.1.14.3）
- 修復困難模式 reload 後難度失效與小地圖難度標籤錯誤（v0.1.14.4）
- 毒霧隼炮彈計數修復、鬣狗圍攻持續繞圈與難度攻速、巨人隊員自由漫遊與卡住保護、Alpha 帶隊範圍加大、Boss HP Bar 顏色共用、公告與字幕位置調整（v0.1.16.0）
- itch.io 正式上架（已完成，Vite 打包 pipeline 建立）
- Stage D：中層系統重構（v0.1.18.3，5 個系統依賴注入，33 個測試）
- Stage F 批次 1：main.js 反向依賴解除（v0.1.19.0，新建 gameFlow.js，5 個高嚴重度循環消除）
- Stage F 批次 2：reward.js + loot.js + Boss kill 事件化 + utils/loot 拆分（v0.1.20.1）
- damage.js 違規 import 清理 + Dead Import 10 檔案清理 + Stage F 3a 回歸測試（v0.1.21.1～v0.1.21.3，114/114 測試）
- Stage F 3a：新建 systems/damage.js，boss↔combat / combat↔player 核心依賴解除（v0.1.21.0）
- XP 常數 config 化（新增 xpConfig.js）、hostile 擊殺 XP 公式搬移至 config，不改遊戲行為（v0.1.24.5～v0.1.24.6）
- 成就 Bonus 系統上線（36 個成就 bonus 欄位）、5 項 Bonus bug 修復、Player Stats/成就紅點/更新公告版面調整（v0.1.25.0～v0.1.25.2）

### 🔄 進行中
- Stage F 批次 2：核心戰鬥耦合拆分（規劃中）

### ⏳ 計劃中（按優先順序）
1. 地獄難度地圖
2. 遊戲說明 / 圖鑑更新

### 💡 長期想法（未排入計劃）
- 遊戲幣系統（角色購買）
- 故事模式第一章：反攻人族淨音軍
- Steam 版本

