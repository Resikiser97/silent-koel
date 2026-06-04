# ESM 遷移進度追蹤
# 只吃不叫的噪鵑（The Silent Koel）
#
# ⚠️ 三方注意事項：
#   Claude Chat / Claude Code / Codex 每次開始工作前【必須先讀這份文件】
#   每個步驟完成後【必須立即更新這份文件】
#   這份文件是三方的共同記憶，不更新等於讓隊友瞎眼工作

---

## 當前狀態快照

```
所在 Stage   : Stage 2B — ESM 遷移 批次2（systems/ 基礎層）
目前批次     : S2B-1 完成，等待 Codex 靜態檢查
分支狀態     : esm-refactor（已建立）
最後更新     : 2026-06-04
最後操作者   : Claude Code（批次2遷移完成）
```

---

## 各 Stage 完成狀態

### Stage 0 — 準備工作
- [x] S0-1：確認 5 個版本號檔案全部一致
- [x] S0-2：建立 `esm-refactor` 分支
- [x] S0-3：確認所有 ESM 文件套件存在
- [x] S0-4：初始 commit 完成

### Stage 1 — Codex 依賴審計
- [x] S1-1：Codex 執行依賴審計
- [x] S1-2：`docs/dependency_map.md` 產出
- [ ] S1-3：你 + Claude Chat 人工確認內容
- [ ] S1-4：確認批次分工清單正確（更新 ESM_MIGRATION_PLAN.md 附錄）

### Stage 2A — ESM 遷移 批次1（config/ + lang/ + map/）
- [x] S2A-1：Claude Code 執行批次1遷移
- [ ] S2A-2：Codex 靜態語法檢查
- [ ] S2A-3：你開瀏覽器人工測試
- [ ] S2A-4：commit 批次1

### Stage 2B — ESM 遷移 批次2（systems/ 基礎層）
- [x] S2B-1：Claude Code 執行批次2遷移
- [ ] S2B-2：Codex 靜態語法檢查
- [ ] S2B-3：你開瀏覽器人工測試
- [ ] S2B-4：commit 批次2

### Stage 2C — ESM 遷移 批次3（systems/ 核心層 + main.js）
- [ ] S2C-1：Claude Code 執行批次3遷移
- [ ] S2C-2：Codex 靜態語法檢查
- [ ] S2C-3：你開瀏覽器人工測試（完整測試：完成一局遊戲）
- [ ] S2C-4：commit 批次3

### Stage 3 — 架構重構
- [ ] Phase 1：TODO-06 localStorage 統一
- [ ] Phase 1：TODO-04 AudioManager 統一
- [ ] Phase 2：TODO-01 buildSkillTreeOverlay 拆模組
- [ ] Phase 2：TODO-03 變異技能面板統一
- [ ] Phase 3：TODO-02 結算畫面統一
- [ ] Phase 3：TODO-05 設定面板 fromHome 移除
- [ ] Phase 3：TODO-07 gameState 存取控制
- [ ] Phase 4：TODO-08/09/10 收尾清理

### Stage 4 — Branch 對調
- [ ] esm-refactor merge 進 master
- [ ] master merge 進 stable
- [ ] Vercel Production Branch 確認

---

## 事件紀錄（最新在最上方）

### 2026-06-04（Stage 2B S2B-1 完成）
- 狀態：批次2遷移完成，等待 Codex 靜態檢查
- 操作者：Claude Code
- 完成項目：7 個 systems/ 基礎層檔案加入 export/import
  - gameState.js：export DEFAULT_SETTINGS, gameState, canvas, ctx
  - utils.js：import gameState/ctx/wrappedDelta；export 7 個函式
  - audio.js：import AUDIO_FILES/DEFAULT_SETTINGS/gameState；export 4 個
  - camera.js：import gameState/MAP_WIDTH/MAP_HEIGHT/VIEW_W/VIEW_H；export 5 個
  - map.js：import gameState/ctx；export 9 個常數 + 8 個函式
  - mobile.js：import gameState；export 8 個
  - chat.js：import SUPABASE_URL/SUPABASE_KEY/supabaseQuery/GAME_INFO/gameState；export 10 個
- 發現問題：VIEW_W/VIEW_H 為 mutable let，mobile.js 的 _setViewSize 直接賦值（已知問題，Stage 3 修正）
- 下一步：S2B-2 Codex 靜態語法檢查，S2B-3 瀏覽器人工測試

### 2026-06-04（Stage 2A S2A-1 完成）
- 狀態：批次1遷移完成，等待 Codex 靜態檢查
- 操作者：Claude Code
- 完成項目：13 個檔案加入 export/import（config/ + lang/ + map/）
- 發現問題：無
- 下一步：S2A-2 Codex 靜態語法檢查，S2A-3 瀏覽器人工測試

### 2026-06-04（Stage 1 依賴審計）
- 狀態：Stage 1 S1-1 / S1-2 完成
- 操作者：Codex
- 完成項目：分析 37 個本地 JS 檔案，產出 `docs/dependency_map.md`
- 發現問題：實際 JS 清單包含 `config/compendium_data.js`、`systems/mobile.js`、`systems/hud.js`、`systems/chat.js`；另發現多組循環/複雜互依與 `addMutationPoints` 重複定義
- 下一步：S1-3 由你 + Claude Chat 人工確認依賴圖內容

### 2026-06-04（Stage 0 完成）
- 狀態：Stage 0 完成
- 操作者：Claude Code
- 完成項目：建立 esm-refactor 分支、加入 ESM 文件套件
- 發現問題：無
- 下一步：執行 Stage 1 Codex 依賴審計

### 2026-06-04
- 狀態：ESM 遷移計劃完成，準備進入 Stage 0
- 操作者：Claude Chat
- 完成項目：產出 5 份 ESM 文件套件
  - docs/ESM_MIGRATION_PLAN.md
  - docs/ESM_PROJECT_CONTEXT.md
  - docs/ESM_PROGRESS.md（本文件）
  - docs/ESM_CHECKLIST.md
  - .codex/AGENTS.md
- 發現問題：無
- 下一步：把這 5 份檔案加入專案，執行 Stage 0

---

## 回滾紀錄（如果有發生過）

目前無回滾紀錄。

---

## 更新格式範本（每次更新複製這段填寫）

```
### YYYY-MM-DD
- 狀態：[目前在哪個 Stage / 步驟]
- 操作者：[你 / Claude Code / Codex]
- 完成項目：[做了什麼]
- 發現問題：[有沒有遇到問題，沒有就寫「無」]
- 下一步：[下一個要做的事]
```
