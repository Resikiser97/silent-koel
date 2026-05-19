# Claude Code 自動讀取指引

每次對話開始前必須依序讀取以下檔案：
1. MAIN.md - 專案結構、模組分佈、所有函式說明
2. CHANGELOG.md - 目前版本和最近改動記錄
3. VERSION_RULES.md - 版本號更新規則

## 開發規則（每次必須遵守）
- gameLoop 裡絕對不能出現字面上的 \n 字符
- 每次修改完必須更新 CHANGELOG.md 和版本號
- 新增任何函式或功能必須更新 MAIN.md 對應模組說明
- 函式如果已被移除或合併到其他模組，必須從 MAIN.md 對應區塊刪除
- 修改數值只能在 config\ 資料夾對應檔案修改
- 不使用 ES Modules，全部用傳統 script 標籤

## 修改完成後的固定流程
1. 更新 MAIN.md（新增函式、移除函式、修改功能、新模組）
2. 更新 CHANGELOG.md
3. 更新 gameConfig.js 裡的版本號
4. git commit
5. 推送到 GitHub（見下方自動推送規則）

## 自動推送規則（每次必須執行）
每次完成 git commit 後，必須立刻執行以下指令推送到 GitHub：
```
"C:\AI\Git\bin\git.exe" -C "c:\AI\VS CODE" push origin master
```
推送完成後在回覆摘要裡確認「已推送到 GitHub」。
如果推送失敗，告訴用戶錯誤原因。