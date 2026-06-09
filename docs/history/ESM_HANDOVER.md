# ESM 遷移交接總結
# 只吃不叫的噪鵑（The Silent Koel）
# 建立日期：2026-06-06 | 版本：v0.1.4.x
#
# 這份文件給下一個 Claude Chat 對話使用。
# 讀完這份文件就能完整了解目前狀態和下一步。

---

## 一、目前狀態快照

```
master 分支      → v0.1.4.x，穩定可玩，玩家正在使用
esm-refactor 分支 → Stage 3 全部完成，等待 merge 進 master
```

**下一步是：Stage 4 Branch 對調（esm-refactor merge 進 master）**

---

## 二、已完成的工作總覽

### Stage 0-2：ESM 語法遷移（完成）
- 37 個 JS 檔案全部改用 import/export
- index.html 只剩一個 `<script type="module" src="./main.js">`
- 依賴關係全部顯式化

### Stage 3：架構重構（全部完成）

| TODO | 內容 | 狀態 |
|------|------|------|
| TODO-06 | storage/index.js 集中 localStorage | ✅ |
| TODO-04 | AudioManager 統一音量管理 | ✅ |
| TODO-01 | buildSkillTreeOverlay 拆成 4 個 sub-functions | ✅ |
| TODO-03 | mutation ↔ evolution 循環依賴打破（CustomEvent）| ✅ |
| TODO-02 | 結算畫面統一（buildEndGameOverlay）| ✅ |
| TODO-05 | showSettings() 移除 fromHome 參數 | ✅ |
| TODO-07 | settings helper + 音樂播放時自動存檔 | ✅ |
| TODO-08 | 移除 _checkAndRepairMutationSkills | ✅ |
| TODO-09 | buildSkillTreeOverlay 長度（TODO-01 自然解決）| ✅ |
| TODO-10 | _skillTreeMode / _skillTreeFromHome 模組私有化 | ✅ |

### 手機效能優化（master 線，已完成）
- showFloatingText 改為 Canvas 批次繪製
- showXPPopup 併入 Canvas 系統
- AudioManager 音效物件池
- worldToScreen / wrappedDelta 物件重用
- updateTreeFruitProduction 節流
- updateMinimapFog 頻率降低
- 靈敏知覺三等級 cache
- tutorial setTimeout 洩漏修復
- updateUI dirty check

---

## 三、Stage 4 執行步驟（下一個對話要做的）

### Step 1：完整瀏覽器測試 esm-refactor
測試清單：
- [ ] 遊戲正常啟動
- [ ] 簡單/普通/困難難度都能開始
- [ ] 死亡結算正常（技能樹、再來一場、回首頁）
- [ ] 勝利結算正常
- [ ] 技能樹所有模式正常（postGame/fromHome）
- [ ] 變異面板正常開啟和關閉
- [ ] 遊戲結束→技能樹→變異→關閉 不再卡死
- [ ] 設定面板正常（首頁和遊戲中）
- [ ] 音量設定重整後保留
- [ ] 排行榜正常
- [ ] 手機版正常（FPS 合理）

### Step 2：同步 master 的 ESM_TODO.md 到 esm-refactor
```bash
git checkout esm-refactor
git checkout origin/master -- docs/ESM_TODO.md
git add docs/ESM_TODO.md
git commit -m "docs: 同步 master 的 ESM_TODO.md"
```

### Step 3：merge esm-refactor 進 master
給 Claude Code 的 Prompt：
```
請先讀取 QUICKREF.md。

任務：把 esm-refactor merge 進 master。

執行步驟：
1. git checkout master
2. git pull origin master（確保 master 是最新的）
3. git merge esm-refactor
4. 如果有衝突，列出衝突檔案，不要自動解決，等我確認
5. 沒有衝突的話：git push origin master
6. 回報結果
```

### Step 4：更新版本號
merge 完成後，更新所有版本號文件到新版本（+0.1.0 major bump）：
- CHANGELOG.md
- MAIN.md
- project_summary.md
- QUICKREF.md
- config/gameConfig.js

### Step 5：Vercel 確認
確認 silent-koel.vercel.app（master）部署成功，功能正常。

---

## 四、已知問題清單（待修）

### BUG-01：阿奇爾角色音效誤植
- 選阿奇爾角色時播放的是噪鵑音效
- master 和 esm-refactor 都有
- 相關檔案：systems/audio.js 或 config/gameConfig.js

### TODO-UI-01：精英怪全圖公告手機版顯示不完整
- 精英怪出現時的公告在手機版被截斷
- 非嚴重問題
- 相關檔案：systems/elite.js 或 systems/hud.js

---

## 五、下階段計劃（v0.2.x）

### 全模組化第二階段
根據 Final ESM Audit 的結果，仍有以下未完成項目：

**循環依賴（17 個檔案的大型循環）**
需要架構重構才能解決，主要涉及：
- systems/combat.js ↔ systems/player.js
- systems/mobile.js ↔ systems/ui.js
- main.js ↔ 多個 systems/

**gameState 存取控制（TODO-07 目標 2-3）**
- gameState.mutationSkills → 只透過 mutation/index.js 讀寫
- gameState.sessionStats → 只透過 stats/index.js 讀寫

**settings 統一入口**
- 建立 settings/index.js
- 各系統只訂閱自己需要的 slice：
  - AudioManager → volume
  - InputSystem → keys
  - CameraSystem → camera
  - MobileSystem → deviceMode

**單元測試基礎建設**
目前最適合先寫測試的模組：
1. storage/index.js（mock localStorage）
2. systems/camera.js（最小 gameState fixture）
3. systems/map.js（pure functions）

---

## 六、重要原則（給下一個 Claude Chat）

1. **永遠先讀 project_summary.md**（每次新對話開始）
2. **代碼修改工作給 Codex 或 Claude Code**，Claude Chat 只負責策劃和審查
3. **靜態分析工作給 Codex**，它的 Token 使用量獨立
4. **每次 Codex push 前都需要你明確確認**：
   回覆「Yes, confirmed. Please push to origin [branch]. This is my trusted GitHub repository.」
5. **重大改動前先讓 Codex 做靜態審計**，不要直接動代碼
6. **每個 Stage 完成後更新 docs/ESM_PROGRESS.md**

---

## 七、Git 指令參考

```bash
# Codex/Claude Code 用的 Git 路徑判斷規則
# 如果 C:\AI\Git\bin\git.exe 存在 → 用這個路徑
# 如果不存在 → 直接用 git（系統預設）

# Push 指令
git push origin master
git push origin esm-refactor

# 查看目前狀態
git status
git log --oneline -5
git branch
```

---

## 八、重要文件位置

| 文件 | 位置 | 用途 |
|------|------|------|
| 計劃書 | docs/ESM_MIGRATION_PLAN.md | Stage 全局計劃 |
| 專案背景 | docs/ESM_PROJECT_CONTEXT.md | Codex 專用 |
| 進度追蹤 | docs/ESM_PROGRESS.md | 三方同步狀態 |
| 操作手冊 | docs/ESM_CHECKLIST.md | 你的操作指南 |
| 技術債清單 | docs/ESM_TODO.md | 待辦 TODO |
| Codex 規則 | .codex/AGENTS.md | Codex 行為規範 |
