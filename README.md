# Action Station 原 APK 復刻第一版 1.0.0

主入口 `index.html` 現在是完整玩法第一版；原本的單角色測試保留在 `diagnostic.html`，動畫檢視在 `animation.html`。以原始 `actionstation-1.3.apk` 的素材、UI 配置、動畫曲線及反編譯參數為依據，保留日文原畫面與音效。這是網頁移植，並非重新打包 Android APK。

## 已接上的主流程

- 原版主選單、選單動畫、五頁玩法說明與設定入口。
- 四種原版可換臉角色：拍照、切換相機、確認、儲存、返回；另提供照片匯入與刪除本機臉孔。依原版 256×256 裁切、亮度 +100、遮罩與膚色處理。
- AR 車站：15 種角色、原版站位與移動路徑、生成、走路／張望、點擊台詞、排隊、上車、補充乘客。
- 原版 286 句台詞依角色、時段與候車狀態選取；原版背景音樂、月台語音和三組車站廣播。
- 原版站體深度遮擋模型；辨識遺失暫停、恢復、返回與相機重新啟動。
- 辨識圖下載；原外部消息／支援入口顯示說明，沒有重建外部伺服器。

參數保留：走路 2／上車 1 世界單位每秒、上車終點 Z=13、生成計時 10 秒、待機 1～8 秒、排隊完成等候 1 秒，以及 APK 的角色分組與站位配置。`scripts/export-replica.py` 匯出原版 UI、音效、曲線與站體，`scripts/export-station.py` 匯出站位。

## 本機執行與驗證

```sh
python3 -m http.server 8771 --bind 127.0.0.1 --directory web
# http://127.0.0.1:8771/
node scripts/check-passengers.mjs
node scripts/check-station.mjs
node scripts/check-animation.mjs
node scripts/check-replica.mjs
node scripts/check-replica.mjs --webkit
node scripts/check-web.mjs
node scripts/check-web.mjs --webkit --animation-only
```

2026-10-31 本機：乘客狀態／來源座標／15 種角色動畫測試通過；Chrome 第一版端對端流程（含實際角色點擊）與舊診斷頁回歸通過；WebKit 主選單／五頁教學／設定／四種換臉入口／照片匯入儲存，以及非相機動畫測試通過；相機拒絕由 stub 模擬，AR 追蹤未驗證。Chrome 整合驗證使用合成相機；WebKit 分開驗證 UI 與照片匯入，不能當作 iPad 真實相機通過。實機需要 HTTPS；本機 localhost 可用相機。相機影像不會上傳，臉孔只儲存在此瀏覽器。

## 尚待實機比對的差異

第一版主流程已整合，但沒有宣稱與 APK 逐幀一致。MindAR 取代原 Wikitude；標記單位／方向、第二次錄影的倒置、追蹤穩定度與延伸追蹤尚未解決。鄰近乘客交談判定、部分狀態轉場、對話泡泡與拍照確認視窗仍是網頁實作，未全部完成原生行為比對；啟動直接進主選單，未播放原版開場／條款流程。第三方服務未復建。這些與後續優化分開記錄，不以合成測試宣稱已驗證真實車站定位。

1.0.0 於 2026-10-31 準備發布至既有 GitHub Pages 測試網站，公開內容僅限 web/。以下 0.1～0.3 是歷史診斷紀錄，不代表第一版目前功能範圍。

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

使用新版 `https://plarail.gh.maxlab.tw/`，確認 HUD 版本 0.2.1。以橫向錄影，保留整個標記及車站、HUD 計數和動作按鈕：

1. 正面辨識後固定 10 秒，E2 走路；按張望，再按一次重播，再切靜止。
2. 切 G1，再各錄走路與張望；慢慢繞到標記左右兩側，每側停 5 秒。
3. 慢慢拉近、拉遠各一次，保持完整標記入鏡；若角色翻轉，先保持原角度 3 秒再回正面。
4. 完全遮住標記 3 秒再移開，重複兩次；另將標記完全移出鏡頭 3 秒再回來。
5. 記錄裝置型號、iOS／iPadOS 與 Safari 版本，以及黑框標記的實際寬度。若可取得原 APK，另錄相同站體與角度作為原版定位基準。

以上目的是驗證動畫及定位問題；0.2 尚無延伸追蹤，遮擋時角色消失仍是已知限制。

## 網址

正式測試網域為 `plarail.gh.maxlab.tw`；`CNAME` 隨 web subtree 發布，公開 repository 只包含網頁素材。

## 0.2.1 動作無反應回報

收到實機「點走路／張望人物不動」回報。Chrome 與桌面 WebKit 對 0.2 線上動畫頁的連續取樣可見 elapsed、模型姿態變動；Chrome 合成相機亦可見變動，尚未取得回報裝置的執行紀錄，不能宣稱已證實該裝置的根因。

本次修正可確認的缺口：HTML、app.js、animation.mjs 與 CSS 現在以版本網址配對，避免新 HTML 搭配舊版程式快取；動作改用直接按鈕，重按同一動作可重播，避免單次張望在原生選單仍開啟時已播完，並顯示播放／等待標記／播完狀態及動作秒數。

瀏覽器測試新增真實 render loop 的頭部／腿部 local matrix 變動、canvas 像素變動、重播、單次播完、靜止、標記遺失暫停及恢復續播；另先保留舊的無版本模組快取，再驗證新版仍可載入。這些測試補足 0.2 只檢查手動推進與控制項、不驗證實際連續播放的缺口。實際 iPhone／iPad Safari 回報仍待更新後確認。

WebKit 本機驗證（需先安裝對應瀏覽器）：

```sh
node research/plarail-ar/tools/preview/node_modules/playwright/cli.js install webkit
node scripts/check-web.mjs --webkit --animation-only
```

發布後可用 `node scripts/check-web.mjs --live` 驗證正式站的合成相機／動畫；不使用真實相機、不傳送使用者影像。公開 Pages 與研究 repo 的歷史分開；若 subtree push 因網域設定提交而分歧，須在只含 web subtree 的獨立 checkout 合併遠端歷史、確認最終 tree 與待發布 web 一致再推送，不 force push，也不得推送研究根目錄。

0.2.1 驗證紀錄：Chrome 完整網頁測試（合成相機、標記、AR 動作與獨立動畫頁）通過；桌面 WebKit 的合成串流可播放，但 60 秒內未辨識標記，該項為失敗／待調查，不代表真實 Safari 相機已測試。WebKit 的不開相機動畫範圍以 `--animation-only` 另行驗證，不將它當成完整 AR 通過。

## 第二次測試影片與 0.3.0（本機，尚未發布）

`第2次測試.MP4` 長 65.73 秒，1126×2436、60 fps；錄下 0.2.1 直向 Safari。以每 4 秒縮圖檢視全段，另對 7～10 秒與 49～56 秒密集擷取影格：

- A1 的走路／張望姿態及動作計時有變化；約 52 秒重播張望，約 54 秒顯示播完。此證據只涵蓋錄到的角色與操作。
- 約 7～10 秒人物倒置，HUD 仍顯示已辨識，期間辨識 1 次、遺失 0 次；因此不能只歸因於重新辨識瞬間。影片本身無 pose matrix，尚無法區分追蹤姿態、平面方向歧義與座標轉換原因。
- 遮住標記時角色消失，恢復後重現；結尾為辨識 16 次、遺失 15 次。取樣可見約 29～48 FPS，不是完整效能統計。
- 不以此錄影推定裝置型號、OS 版本、原版 APK 一致性或延伸追蹤成功。

0.3.0 接續還原站位資料，尚未解決倒置或完成車站玩法：

- `station.json` 由 `python3 scripts/export-station.py` 產生，只包含 19 組站位、32 個節點與必要 Transform 父子鏈；未攜帶 SDK 設定或授權字串。
- 「車站站位校正（實驗）」→「原版站位」可選站位／節點。黃點與青色連線只供校對，連線順序不代表已驗證的乘客移動邏輯；15～18 排隊站位保留。
- 原始 Unity 座標先完整合成，沿 X 鏡射，再轉入標記平面。初始假設為 Trackable 17.5 單位對應一個標記寬度，**不是已確認的 Wikitude → MindAR 單位換算**。比例、左右及前後滑桿只作用於獨立校正層，不改寫來源。
- 角色大小仍為診斷用正規化高度，沒有還原原版生成時的縮放與所有朝向。校正值僅留在本次頁面，重新整理即重設。
- 展開面板可切換，收合後保留選擇；原本標記中央模式、走路／張望／靜止均保留。

驗證命令：

```sh
python3 scripts/export-station.py
node scripts/check-station.mjs
node scripts/check-animation.mjs
node scripts/check-web.mjs
node scripts/check-web.mjs --webkit --animation-only
```

本機驗證涵蓋來源座標一致、32 節點的獨立矩陣換算、排隊站位、站位與角色同步校正、角色切換保留站位、回到標記中央、375×610 可捲動版面，以及既有合成相機／動畫回歸。Chrome 全項通過；桌面 WebKit 非相機動畫通過，WebKit AR 本次未執行（既有合成標記辨識失敗仍待調查）。實體車站校正、iPad 相機、遮擋模型、原版狀態機、排隊／上車與延伸追蹤仍 pending。此次未 commit、push 或部署。
