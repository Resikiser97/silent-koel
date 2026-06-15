---
name: doc-audit
description: Audit silent-koel project documents against actual code behavior and document priority rules; classify mismatches by type and severity, then wait for explicit confirmation before editing.
---

# SKILL — doc-audit

> 呼叫方式：
> - 「執行 doc-audit 全部」→ 審計所有 .md 文件
> - 「執行 doc-audit MAIN.md」→ 只審計單一文件

---

## 執行前必讀
1. DOC_INTEGRITY.md（了解優先級規則）
2. ARCH.md（了解實際架構，作為代碼優先文件的對照基準）
3. 若審查涉及版本號、同步流程或 changelog，必讀 VERSION_RULES.md、CHANGELOG.md、QUICKREF.md。

---

本 Skill 採四階段審查：讀文件 → 確認文件優先級屬性 → 逐項比對代碼 → 輸出報告等待確認。

## 執行步驟

### Step 1 — 確認掃描範圍
依照呼叫方式決定審計的文件清單。
預設全部：MAIN.md、QUICKREF.md、ARCH.md、.claude/instructions.md

### Step 2 — 代碼優先文件審計
對 MAIN.md、QUICKREF.md、ARCH.md：
1. 逐章節讀取描述
2. 找對應的實際代碼驗證
3. 記錄衝突：
   - [過期] 文件說 X，代碼說 Y → 建議修正文件
   - [正確] ✅ 一致

### Step 3 — 文件優先文件審計
對 .claude/instructions.md、DOC_INTEGRITY.md、VERSION_RULES.md：
1. 逐條讀取規範
2. 找對應代碼驗證是否遵守
3. 記錄偏差：
   - [違規] 規範說 X，代碼做了 Y → 回報開發者，不自行修改
   - [遵守] ✅ 一致

### Step 4 — 輸出報告，等待確認

```
── doc-audit 報告 ──
審計範圍：[X 個文件]

✅ 無問題：[文件列表]

⚠️ 需要處理：
[文件名] L[行號]
  [severity][類型] 標籤說明如下：
  severity = [blocking] / [important] / [nit] / [suggestion]
  類型    = [過期] / [違規] / [不確定]
  文件說：...
  代碼說：...
  建議：[修正文件 / 回報開發者 / 需確認]

範例：
  [important][過期] ARCH.md:42
    文件說：systems/achievements.js 只依賴 storage/config/lang
    代碼說：已 import config/playerStatsFormula.js
    建議：更新 ARCH.md 模組職責與依賴描述

  [blocking][違規] VERSION_RULES.md:10
    文件說：y 只有在新功能或重構時進位
    代碼說：commit 紀錄顯示 bug fix 進位了 y
    建議：回報開發者確認，不自行修改

  [nit][不確定] QUICKREF.md:80
    文件說：...
    代碼說：...
    建議：需開發者確認 source of truth

待處理共 X 個問題
────────────────────
是否要我現在修正？（請回覆「確認修正」才執行）
```

## Severity 定義

- [blocking]：違反文件優先規則（DOC_INTEGRITY.md / VERSION_RULES.md 明確條文被破壞），或會直接誤導後續 AI 架構判斷
- [important]：代碼優先文件（ARCH.md / QUICKREF.md）描述過期，影響維護性或擴充性
- [nit]：小型描述不一致，不影響任務理解
- [suggestion]：可補充但非錯誤

注意：severity 是優先級，[過期]/[違規]/[不確定] 是判斷類型，兩者解決不同問題，不能互相取代。

## What Not To Review

- 不做純文字潤稿，除非影響理解
- 不回頭改 CHANGELOG.md 舊版本內容
- 不把未完成 roadmap 當成錯誤
- 不猜測未記錄的設計意圖
- 不因文件過期直接改程式；先根據文件優先級判斷誰是 source of truth
- 不確定就標記 [不確定]，不要猜

### Step 5 — 等開發者回覆「確認修正」後才執行

---

## 觸發時機
- 大型功能完成後
- 懷疑文件有過期描述時
- 每 5 個 y 版本一次定期維護
