# DOC_INTEGRITY — 文件完整性規範與進度

> 每次開始任何任務前，CC 和 Codex 都必須先讀這份文件。
> 這份文件本身是「文件優先」，內容由開發者 Goblinnest 人工維護。

## ⚠️ 為什麼文件準確性是嚴重問題

這個專案由 AI（CC + Codex）協助開發。
AI 沒有記憶，每次工作只能依賴文件理解專案。

如果文件過期或錯誤：
- AI 會基於錯誤的理解做出錯誤的修改
- 錯誤會被累積，不會被發現
- 後期修復成本是現在的 10 倍以上
- 已發生的例子：MAIN.md 寫「不使用 ESM」，
  但專案在 v0.1.5.0 就已全面 ESM 化，
  導致所有文件描述與實際代碼脫節

**文件錯誤 = 對未來所有 AI 工作下毒。**

## 文件優先級規則（Source of Truth）

| 文件 | 類型 | 優先級 | 說明 |
|------|------|--------|------|
| `.claude/instructions.md` | 開發規範 | 文件優先 | SOP、版本規則、架構決策 |
| `Version_rules.md` | 版本規範 | 文件優先 | 版本號格式，人工維護 |
| `DOC_INTEGRITY.md` | 完整性規範 | 文件優先 | 本文件，人工維護 |
| `ARCH.md` | 架構說明 | 代碼優先 | 描述遊戲實際運作，跟著代碼走 |
| `MAIN.md` | 運作說明 | 代碼優先 | 給 AI/開發者看遊戲怎麼運作 |
| `QUICKREF.md` | 速查 | 代碼優先 | 函式簽名，跟著代碼走 |
| `CHANGELOG.md` | 歷史記錄 | 只增不改 | 版本變更，不回頭修改 |
| 各檔案 file header | 模組說明 | 代碼優先 | 每次改代碼必須同步 |

**代碼優先** = 文件描述有誤時，以實際代碼為準，修正文件。
**文件優先** = 代碼行為有誤時，以文件規範為準，修正代碼。

## 強制規則

每次任務完成後，必須同步：
1. 修改的檔案 file header
2. QUICKREF.md 對應函式（如有新增/修改）
3. CHANGELOG.md 新增版本條目
4. 如架構本身改變，更新 ARCH.md

違反以上規則 = 這次任務未完成。

## doc-audit 執行規則

發現文件與代碼衝突時：
- 代碼優先文件 → 修正文件，不動代碼
- 文件優先文件 → 回報給開發者決定，不自行修改代碼
- 任何衝突都必須回報，不能假裝沒看到
- 不確定的地方說不確定，不要猜

## 版本號規則

詳細規則見 Version_rules.md，摘要如下：

格式：v0.x.y.z

v0 = 開發階段，由 Goblinnest 決定
x  = 賽季版本，由 Goblinnest 決定，升級後排行榜重置競爭
y  = 功能版本，AI 可進位（新功能 / 重構）
z  = 修復版本，AI 可進位（bug fix）

以 v0.1.11.0 為例：
- v0 = 開發中
- x=1 = 第一賽季
- y=11 = 第 11 個功能版本
- z=0 = 無修復

**AI 只能改 y 和 z，不得碰 v0 和 x。**

## 當前文件整備進度

### ✅ 已完成
- ESM 全模組化（v0.1.5.0）
- CHANGELOG.md 格式規範
- file-header Skill 建立
- Version_rules.md 建立
- Codex 架構掃描報告（v0.1.11.0 基準）

### 🔄 進行中
- ARCH.md 新建（基於 Codex 掃描報告）
- .claude/instructions.md 更新（加入 Priority Table + SOP）
- MAIN.md 清理過期內容
- doc-audit Skill 建立

### ⏳ 待處理
- QUICKREF.md 過期內容清理
- Dead code 清理（combat.js、hud.js、creatures.js）
- Stage F：核心循環依賴打破

### ❌ 已知嚴重過期（不要相信這些描述）
- MAIN.md Line 1014：「不使用 ESM」→ 實際已全面 ESM
- QUICKREF.md：ESM 相關描述 → 全部過期
- .claude/instructions.md：ESM 規則 → 過期

*最後更新：v0.1.11.0 / Goblinnest*
