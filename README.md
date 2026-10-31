# iPad AR 追蹤測試 0.1

以 HTTPS 部署此資料夾；在 iPad Safari 點選「啟動 AR 相機」。相機影像只在瀏覽器處理，沒有上傳端點。

這是實機追蹤實驗，不是完成的 APK 復刻：使用 MindAR 1.2.5 辨識 `marker.png`，顯示 15 種原版角色之一。角色統一正面、按高度正規化，位置及大小為測試值，沒有還原車站座標、原版 UI、角色動畫、排隊、上車、音效、遮擋及 Wikitude 延伸追蹤。遺失標記時角色隱藏。

## 測試錄影

請依序錄下正面辨識、左右移動、拉近拉遠、遮住標記、移開再回來。畫面包含版本、FPS、辨識／遺失次數。記錄 Safari/iPadOS 版本、標記圖案寬度及發生問題的秒數；比較原版行為需要原 APK 錄影。

## 本機驗證

從 repository 根目錄：

```sh
npm ci --prefix research/plarail-ar/tools/preview
node scripts/check-web.mjs
# 重新編譯原版 marker.png（會改寫 marker.mind）
node scripts/check-web.mjs --compile
```

目前腳本使用 macOS 的 Google Chrome 路徑，驗證合成相機啟動／停止／重啟與 15 個模型載入。桌面測試不能證明 iPad 真實相機的辨識或追蹤品質。

## 素材與依賴

- 角色 GLB、marker 圖像源自原版 APK／官方標記；相關角色與商標屬原權利人。此 repository 未替第三方素材授予開放授權。
- MindAR 1.2.5：<https://github.com/hiukim/mind-ar-js/tree/v1.2.5>；MIT，見 vendor/MINDAR-LICENSE.txt。
- Three.js 0.160.1：<https://github.com/mrdoob/three.js/tree/r160>；MIT，見 vendor/THREE-LICENSE.txt。
- vendor 檔案從 jsDelivr 固定版本下載後本地供應；不依賴執行時 CDN。MindAR Three 包裝器有一項本機修正：保存 resize handler，結束時移除，避免每次重啟累積監聽器。
- `compile.html` 僅供本機編譯 target；不會讀取相機。

GitHub Pages 只發布 web/；APK、SDK 授權字串、原生 binary、完整研究輸出與舊 DrYellow 專案不會進入網站。
