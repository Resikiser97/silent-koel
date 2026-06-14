# 每次更新後檢查清單
基準版本：v0.1.20.1
更新日期：2026-06-14

## 目的

本文件用於每次功能更新、修復、重構後的收尾檢查。它不取代 `.claude/instructions.md` 的 sync-docs 流程，而是補強依賴、事件、文件一致性。

## 適用時機

以下情況必須執行本清單：

- 新增 JS 檔案
- 刪除 JS 檔案
- 修改 import / export
- 新增事件
- 修改核心流程：戰鬥、Boss、玩家、器官、進化、UI、手機操作
- 新增玩家可感知功能
- 修復跨模組 bug

## Step 1：確認修改範圍

列出本次修改檔案：

```text
新增：
修改：
刪除：
```

標記是否涉及：

- `main.js`
- `systems/player.js`
- `systems/combat.js`
- `systems/boss.js`
- `systems/organs.js`
- `systems/evolution.js`
- `systems/ui.js`
- `systems/mobile.js`
- `config/`
- `lang/`

## Step 2：依賴檢查

若本次有 JS import 變更，檢查：

- 是否新增任何 `systems/* -> main.js`
- 是否新增 Layer 1 低層模組 import 高層模組
- 是否新增直接雙向 import
- 是否讓 `main.js` 回到 SCC
- 是否讓 `gameFlow.js`、`feedback.js`、`reward.js`、`loot.js` 回到 SCC
- SCC 檔案數是否變大

若 SCC 變大，必須回報：

```text
SCC 變化：
上次：
本次：
新增進入 SCC 的檔案：
原因：
是否接受：
```

## Step 3：事件檢查

若新增或修改 `CustomEvent`：

- 是否更新 `docs/events.md`
- 是否記錄 dispatch 來源
- 是否記錄 listen 位置
- 是否記錄 payload
- 是否確認沒有多個 listener 重複處理同一流程

若使用事件替代 import，確認：

- 原本 import 是否移除
- 行為是否仍同步正確
- 是否需要防重入

## Step 4：文件同步

依照修改內容更新：

- `ARCH.md`：架構、模組責任、SCC 狀態
- `QUICKREF.md`：檔案地圖、關鍵陷阱、部署資訊
- `MAIN.md`：新增/修改/刪除函式與模組
- `CHANGELOG.md`：版本條目
- `project_summary.md`：最近完成工作與快速定位
- `docs/events.md`：事件變更
- `docs/dependency-rules.md`：依賴規則變更
- file header：修改過的 JS 檔案

注意：

- 純文件計劃可不 bump 版本，除非使用者要求或專案規則要求。
- 實際功能/修復/重構通常需要走版本與 sync-docs。

## Step 5：測試

最少執行：

```text
npm test
```

若涉及 build / itch：

```text
npm run build:itch
```

若涉及 UI / 手機 / canvas：

- 手動測桌面開始遊戲
- 手動測手機模式或窄螢幕
- 測死亡畫面
- 測勝利流程
- 測 Boss / 精英 / 普通擊殺

## Step 6：玩家可感知判斷

判斷是否需要 patchnote：

需要：

- 新功能
- 數值調整
- UI 改動
- 玩家能感受到的 bug 修復
- 新角色 / 新地圖 / 新 Boss / 新器官

通常不需要：

- 純文件
- 純內部重構且行為不變
- file header
- dependency audit

若不確定，先回報使用者。

## Step 7：依賴風險報告

每次涉及 JS import 的更新，回覆中應包含：

```text
依賴檢查：
- main.js 反向依賴：無 / 有
- 新增直接雙向 import：無 / 有
- SCC 變化：無變化 / 縮小 / 變大
- 新增事件：無 / 有
- 低層模組是否仍乾淨：是 / 否
```

## Step 8：提交前確認

commit 前確認：

- 測試通過
- 文件同步完成
- patchnote 判斷完成
- 沒有意外修改 `dist/`
- 沒有意外修改使用者未要求的檔案
- `git status` 已確認

## 給 Claude Code 的固定收尾要求

每次完成修改後，Claude Code 應回報：

```text
完成內容：
測試：
依賴檢查：
文件同步：
Patchnote：
未處理風險：
```

若有任何不確定，不要猜，先列出不確定點。

