---
name: file-header
description: Audit and update silent-koel file headers so public exports, dependencies, module responsibilities, and side effects match the actual code; report findings with severity and wait for explicit confirmation before editing.
---

# SKILL — File Header 維護 SOP

> 呼叫方式：
> - 「執行 file-header 全部」→ 掃描所有 JS 檔案
> - 「執行 file-header systems/」→ 只掃 systems/ 資料夾
> - 「執行 file-header [檔名]」→ 只掃單一檔案

---

## 執行前必讀
1. DOC_INTEGRITY.md（了解文件規範）
2. ARCH.md（了解模組結構）

---

本 Skill 採四階段審查：讀文件與目標檔 → 掃描檔案事實（imports/exports/side effects）→ 比對 header → 輸出報告等待確認。

## 與 instructions.md 的分工

`.claude/instructions.md` 規定每次修改後必須同步 file header（日常維護）。
本 Skill 用於定期審查 header 是否已經漂移，與日常維護是不同層次的工作。
執行本 Skill 不代表每次任務完成後都要額外跑一次完整審查。

---

## 執行步驟

### Step 1 — 確認掃描範圍
依照呼叫方式決定要處理的檔案清單。

預設掃描：systems/*.js、map/*.js（排除 map.md）、main.js、lang.js
可選掃描：具函式 / public API 的 config/*.js（需使用者明確指定，例如 config/playerStatsFormula.js）
預設排除：lang/（語言包結構固定，header 意義不大）、純資料型 config/（如 bossConfig.js、characterConfig.js）

### Step 2 — A 檢查（漏列檢查）
對範圍內每個檔案：
1. 掃描檔案內所有非 `_` 開頭的 `export function` 宣告（ESM）
2. 對比頭部【對外公開函式】區塊
3. 找出「在程式碼裡存在、但頭部沒列到」的函式
4. 記錄為「A類問題：漏列」

### Step 3 — B 檢查（過時檢查）
對範圍內每個檔案：
1. 讀取頭部【依賴的跨檔案函式】區塊列出的所有函式名
2. 用 grep 在該檔案內搜尋每個函式名是否出現
3. 找出「頭部列了、但程式碼裡找不到呼叫」的函式
4. 記錄為「B類問題：過時」

### Step 4 — 輸出報告，等待確認
輸出以下格式，不要自動修改：

```
── File Header 檢查報告 ──
掃描範圍：[X 個檔案]

✅ 無問題：[檔案列表]

⚠️ 需要更新：
[severity][類型] [檔名] L[行號]
  A類（漏列）：functionA、functionB
  B類（過時）：functionC

範例：
  [important][漏列] systems/reward.js:1
    Header 列出：addXP / checkLevelUp
    實際新增：export getXpPreview
    建議：header 對外公開函式補上 getXpPreview

  [blocking][錯誤描述] systems/combat.js:1
    Header 說：純資料模組，無 side effect
    實際：import gameState 並直接修改 gameState.player
    建議：修正職責描述，補上 side effect 說明

待修正共 X 個檔案
────────────────────
是否要我現在修正以上問題？（請回覆「確認修正」才執行）
```

## Severity 定義

- [blocking]：header 聲稱「純資料 / 無 side effect」但實際有 import systems 或修改 gameState
- [important]：export 清單缺漏、依賴清單過期、職責描述錯誤
- [nit]：格式或措辭不一致，不影響理解
- [suggestion]：可補充載入順序或架構注意事項，非錯誤

## What Not To Review

- 不審查函式內部邏輯，除非 header 明顯說錯
- 不要求每個 private helper 都列在 header
- 不重寫整個檔案註解風格
- 不因單次小變更要求大幅擴寫 header
- 不處理 formatter / lint
- 不確定就標記「需確認」，不要猜

### Step 5 — 等用戶回覆「確認修正」後才執行修改

---

## 觸發時機

以下情況建議執行：
- 新增 JS 檔案後
- 刪除或合併函式後
- 大型重構完成後
- 定期維護（每 5 個 y 版本一次）
