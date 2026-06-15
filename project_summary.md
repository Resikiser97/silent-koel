## v0.1.23.1

# 只吃不叫的噪鵑（The Silent Koel）— 專案核心背景與進度文檔

> 這份文件是給 Claude Chat 新對話的必讀文件。
> 閱讀後應能立即理解：這個遊戲是什麼、現在開發到哪、下一步做什麼。
> 代碼優先文件——描述與實際代碼衝突時，以代碼為準，回報給開發者修正。

---

## 快速定位（新對話必讀）

**這是什麼：** 單人獨立開發的瀏覽器 Roguelike，HTML + JavaScript，由 Goblinnest 開發，AI（CC + Codex）輔助。

**現在版本:** v0.1.23.1

**當前狀態：** 成就觸發接入（Phase D）完成：achievementTriggers.js 監聽 20+ CustomEvent，SCC 檔案零新增 import；146/146 測試通過

**下一步：**
1. Stage F 批次 3b：拆 evolution / organs / ui 循環
2. 地獄難度地圖
3. 遊戲說明 / 圖鑑更新

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
- v0.1.23.0：成就觸發接入（Phase D）— 新建 `systems/achievementTriggers.js`；SCC 檔案（boss/evolution/organs/player/combat）僅新增 dispatch 行、零新增 import；damage.js 新增 killCountUpdated 累積計數；storage 新增 4 個 key；achievements.js 補上 veteran_days / all_achievements 自動觸發；146/146 測試通過
- v0.1.22.1：成就 UI（Phase B/C）— 首頁成就導航按鈕；成就 Overlay（3×3 格、4 頁翻頁、右欄說明、hidden 未解鎖顯示 ???）；稱號選擇 pop-up（已登入選稱號 / 未登入提示登入）；syncTitleToServer 同步至 Supabase；132/132 測試通過
- v0.1.22.0：config/achievements.js（36 成就定義）/ systems/achievements.js（讀寫入口）/ config/attributes.js；storage 新增 ACHIEVEMENTS / FIRST_PLAY_DATE key；chat.js username 正規化 + GOBLINNEST 過濾；132/132 測試通過
- v0.1.21.3：Stage F 3a 回歸測試 — 新增 `tests/systems/damage.test.js`，永久保護 `handleKill` / `eliteKilled` / `bossKilled` / `applyDamageToPlayer` / `showSkillTree` dispatch / `setRangedAttackCallback`；同步修正 `handleKill` 擊殺後移除生物與精英事件 dispatch；114/114 測試通過
- v0.1.21.2：Dead Import 清理 — 10 個系統檔案共移除 22 個未使用 import（boss/combat/elite/evolution/hud/leaderboard/mutation/organs/player/tutorial）；103/103 測試通過
- v0.1.21.1：damage.js 移除 organs.js Layer 1 違規 import，改用 CustomEvent('eliteKilled')；MAIN/QUICKREF/ARCH 文件補齊
- v0.1.20.1：Stage F 批次 2 第二波 — reward.js + loot.js + Boss kill 事件化 + utils/loot 拆分
- v0.1.17.1：修復毒 debuff 圖示（hud.js/boss.js）、名人堂排名查詢效能（supabase.js）、排行榜 UI 重構（預設名人堂、三按鈕永遠顯示、趣味榜嵌入）；新增趣味排行榜「🦴 白骨精」類別（bone_count）
- v0.1.17.0：毒刺數值調整（Lv3 累計 10/s，三等級統一持續 5 秒）；玩家對怪物毒傷改為 `poisonStacks[]` 獨立疊加，攻擊命中可引爆即時傷害並讓所有 stack -1 秒；提交分數新增 `bone_count`；新增 hall_of_fame 名人堂（2×3 Showcase、Top 10、個人排名）；排行榜改為 Top 100 可捲動
- v0.1.16.3：修復 Vercel Vite build 遺漏 `sounds/` 資源導致線上音效 404；新增 `vercel.json` 和 `scripts/copy-sounds.js`，讓 Vercel / itch.io 共用 `dist/sounds/` 輸出結構
- v0.1.16.2：修復 iOS 音效根本問題（preload 補跑、unlock 錯誤可見、intro 等 unlock）；雲端同步公式改為 `totalPointsEarned × 10.01 + skillPoints`；浮動文字延長至 1200ms；傷害數字加入 noMerge 機制；Dev Mode 新增 HP 數字與 AI 狀態開關；肉食怪 HP 成長統一為 scaledBase 系統
- v0.1.16.1：hotfix 手機版音效 unlock、Boss debuff 圖示靠左、變異紅點殘留、鬣狗圍圈切線移動抖動、手機版公告位置與 GameInfo 兩行顯示，並限制手機版 Boss HP Bar 寬度 55%

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
- Stage F 3a：新建 systems/damage.js，boss↔combat / combat↔player 核心依賴解除（v0.1.21.0）

### 🔄 進行中
- Stage F 批次 2：核心戰鬥耦合拆分（規劃中）

### ⏳ 計劃中（按優先順序）
1. 地獄難度地圖
2. 遊戲說明 / 圖鑑更新

### 💡 長期想法（未排入計劃）
- 遊戲幣系統（角色購買）
- 故事模式第一章：反攻人族淨音軍
- Steam 版本
