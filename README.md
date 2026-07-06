# Catalog_GodzillaPaul｜Netlify 會員版

此版本將登入入口與原 Catalog 分開：

```text
index.html              公開登入入口
login.css / login.js    登入頁樣式與 Identity 流程
login-assets/           登入頁公開品牌素材
catalog/                受 member 角色保護的完整原網站
netlify.toml            Netlify CDN 權限、標頭與 Functions 設定
netlify/functions/      新使用者自動加入 member 角色
package.json            Netlify Identity 伺服器驗證套件
```

## Netlify 後台設定

1. 將整個資料夾推送到 Private GitHub repo，並在 Netlify 建立專案。
2. 到 `Project configuration > Identity` 啟用 Identity。
3. 到 `Identity > Registration preferences` 設為 `Invite only`。
4. 到 `Identity > Users` 邀請會員。
5. 新接受邀請的使用者會由 `identity.mts` 自動取得 `member` 角色。
6. 若帳號是在此功能部署前建立，請進入該使用者明細頁，手動加入 `member` 角色，再登出、重新登入。
7. 入口的「申請使用權」會送到 Netlify `Forms > access-request`；收到申請後，依本名與 Email 確認身分，再到 Identity 寄出邀請。
8. 如需收到新申請通知，可在 Netlify 的 Forms 通知設定中加入你的管理信箱。
9. 「忘記密碼」會寄送 Netlify Identity 重設信；使用者點信件連結設定新密碼後，回入口以新密碼登入。

## 權限行為

- `/`：任何人都能看到登入頁，但看不到 Catalog 內容。
- 登入使用受邀 Email＋密碼；顯示帳號只供管理辨識，不作為登入憑證。
- `/catalog/*`：只有 JWT 包含 `member` 角色的使用者可讀取。
- 未登入者直接輸入 `/catalog/`、子頁、CSS、JS、JSON 或圖片網址，均會回到登入入口。
- Catalog 內原本連到其他 `godzillapaul.github.io` 網站的卡片仍屬外部網站；如需一併保護，必須另外遷移或替各站加上驗證。

## 測試提醒

Netlify Identity 需要 HTTPS 與已啟用的 Netlify 專案。一般本機伺服器可檢查版面，但完整邀請、登入與 CDN 角色規則應在 Netlify 部署網址測試。
