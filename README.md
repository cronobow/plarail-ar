# iPad AR 追蹤與動畫測試 0.2

以 HTTPS 部署此資料夾；在 iPad Safari 點選「啟動 AR 相機」。相機影像只在瀏覽器處理，沒有上傳端點。

這是實機追蹤實驗，不是完成的 APK 復刻：使用 MindAR 1.2.5 辨識 `marker.png`，顯示 15 種原版角色之一。角色統一正面、按高度正規化，位置及大小為測試值。已加入 APK 原始 WALK／LOOKING 曲線播放；沒有還原 Animator 轉場、車站座標、原版 UI、排隊、上車、音效、遮擋及 Wikitude 延伸追蹤。遺失標記時角色隱藏。

## 測試錄影

請依序錄下正面辨識、左右移動、拉近拉遠、遮住標記、移開再回來。畫面包含版本、FPS、辨識／遺失次數。記錄 Safari/iPadOS 版本、標記圖案寬度及發生問題的秒數；比較原版行為需要原 APK 錄影。

## 本機驗證

從私人研究 repository `cronobow/plarail` 的根目錄（公開網站 repository 不包含分析工具）：

```sh
npm ci --prefix research/plarail-ar/tools/preview
node scripts/check-animation.mjs
node scripts/check-web.mjs
# 重新編譯原版 marker.png（會改寫 marker.mind）
node scripts/check-web.mjs --compile
```

目前腳本使用 macOS 的 Google Chrome 路徑，驗證合成相機啟動／停止／重啟、合成標記辨識／遺失／重新辨識與 15 個模型載入。桌面測試不能證明 iPad 真實相機的辨識或追蹤品質。

## 素材與依賴

- 角色 GLB、marker 圖像源自原版 APK／官方標記；相關角色與商標屬原權利人。此 repository 未替第三方素材授予開放授權。
- MindAR 1.2.5：<https://github.com/hiukim/mind-ar-js/tree/v1.2.5>；MIT，見 vendor/MINDAR-LICENSE.txt。
- Three.js 0.160.1：<https://github.com/mrdoob/three.js/tree/r160>；MIT，見 vendor/THREE-LICENSE.txt。
- vendor 檔案從 jsDelivr 固定版本下載後本地供應；不依賴執行時 CDN。MindAR Three 包裝器有一項本機修正：保存 resize handler，結束時移除，避免每次重啟累積監聽器。
- `compile.html` 僅供本機編譯 target；不會讀取相機。

GitHub Pages 只發布 web/；APK、SDK 授權字串、原生 binary、完整研究輸出與舊 DrYellow 專案不會進入網站。

## 發布

完整研究 source 保留在私人 `cronobow/plarail`；公開 `cronobow/plarail-ar` 只接收 `web/` subtree，Pages 使用 `main` 根目錄。從私人 repo 執行 `git subtree push --prefix web pages main` 更新網站；不得改成發布整個研究根目錄。

## 0.2 動畫驗證

`animation.html` 提供不開相機的 15 種角色動畫檢視，AR 介面也可選擇走路（原地循環）、張望（單次）及靜止，並重播動作。遺失標記時動畫暫停、角色隱藏；恢復辨識後接續。靜止使用 GLB prefab 原始姿態，尚未證明與原 Animator IDLE default value 完全一致。

`animations/` 的 WALK／LOOKING JSON 與研究匯出逐 byte 相同。播放器直接計算 streamed cubic coefficients，依 GLB 匯出規則轉換 Unity 座標並正規化 quaternion。268 個相鄰曲線端點、15 種模型、循環、單次結束、重設及瀏覽器切換驗證通過；原 APK 的逐幀一致性與新版 iOS 實測仍 pending。

## 第一次測試影片（2026-10-31）

本機 `第一次測試.MP4`，36.48 秒、1126×2436，記錄 0.1 網頁，非原 APK。以每秒影格及 4 秒縮圖檢視：

- 約 2 秒可見 E2；4～9 秒鏡頭移動時反覆遺失／恢復。
- 約 18～20 秒從 E2 切換 G1；兩者幾何與貼圖可見。
- 約 26 秒恢復辨識時 G1 出現翻轉姿態；28 秒再次辨識後恢復。尚不能判定是 target 方向歧義、pose estimation 或其他原因。
- 約 32 秒拉遠後遺失；結尾 HUD 累計辨識 8 次、遺失 8 次。開場啟動中的舊計數殘留已在 0.2 清除。
- 影片可支持此裝置的基本相機、標記辨識、角色顯示及切換有運作；無法確認裝置型號／OS、實體圖案尺寸、延伸追蹤品質或原版行為一致性。

## 第二次錄影

使用新版 `https://plarail.gh.maxlab.tw/`，確認 HUD 版本 0.2。以橫向錄影，保留整個標記及車站、HUD 計數和動作選單：

1. 正面辨識後固定 10 秒，E2 走路；切到張望並按重播，再切靜止。
2. 切 G1，再各錄走路與張望；慢慢繞到標記左右兩側，每側停 5 秒。
3. 慢慢拉近、拉遠各一次，保持完整標記入鏡；若角色翻轉，先保持原角度 3 秒再回正面。
4. 完全遮住標記 3 秒再移開，重複兩次；另將標記完全移出鏡頭 3 秒再回來。
5. 記錄裝置型號、iOS／iPadOS 與 Safari 版本，以及黑框標記的實際寬度。若可取得原 APK，另錄相同站體與角度作為原版定位基準。

以上目的是驗證動畫及定位問題；0.2 尚無延伸追蹤，遮擋時角色消失仍是已知限制。

## 網址

正式測試網域為 `plarail.gh.maxlab.tw`；`CNAME` 隨 web subtree 發布，公開 repository 只包含網頁素材。
