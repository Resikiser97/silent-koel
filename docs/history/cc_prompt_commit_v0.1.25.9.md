請先讀取 DOC_INTEGRITY.md、ARCH.md、CHANGELOG.md、QUICKREF.md、VERSION_RULES.md。
確認 .claude/skills/ 下有哪些 Skill 可用。

---

# 任務：v0.1.25.9 commit + push

## 背景

v0.1.25.9（靜音獵隊精英怪數值機制修正：HP/傷害/速度公式統一、犬隼差異化倍率、HUNTER_ELITE_REWARDS 依難度拆表）的代碼修改已由你之前執行完成，開發者已審查確認正確。
另外 `config/compendium_data.js` 的「⭐精英怪」圖鑑文案，是由 Claude（規劃端）直接修改的（同步更新困難難度的⭐犬／⭐隼動態數值顯示、修正困難難度敘述、修正簡單/普通/困難三段的擊殺獎勵顯示），尚未 commit。

開發者現在確認可以 commit 並 push 了。

## 請執行

1. 跑 `git status` 確認目前所有未 commit 的變更，預期應包含但不限於：
   - `map/normalmap.js`、`map/hardmap.js`
   - `systems/elite.js`
   - `config/gameConfig.js`、`config/creatures.js`、`config/patchnotes.js`、`config/compendium_data.js`
   - `CHANGELOG.md`、`project_summary.md`、`QUICKREF.md`（或其他你之前同步更新的文件檔案）

2. 跑 `git diff` 快速核對這些變更內容是否都屬於 v0.1.25.9 這個任務範圍內（不應該有不相關的變更混進來）。如果發現不屬於這次任務的變更，先回報給開發者，不要直接 commit。

3. 確認 `config/compendium_data.js` 的變更存在且語法正確（IIFE 內的 `HARD_MAP`、`hDogHp`/`hDogDmg`/`hFalconHp`/`hFalconDmg`、`HUNTER_ELITE_REWARDS.easy/normal/hard` 等引用都有對應到現有的 import 與資料結構，沒有 ReferenceError 風險）。

4. 確認 patchnote（`config/patchnotes.js`）跟代碼變更在同一個 commit 裡（這是專案鐵則，不能分開 push）。

5. 全部確認沒問題後，`git add` 相關檔案、撰寫一個清楚的 commit message（中文，說明這個版本做了什麼：精英怪數值公式統一、犬隼差異化、獎勵表拆分、圖鑑文案同步更新），執行 commit，然後 push。

6. Commit/push 完成後，回報：commit hash、包含的檔案清單、push 是否成功。

## 注意

- `_worktrees/` 不在這次範圍內，不要動。
- 如果 `git status` 顯示的變更跟上面預期清單差異很大，先停下來回報，不要自行猜測要不要一起 commit。
