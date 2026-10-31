# 動感車站・繁體中文版 1.2.3

主入口 `index.html` 現在是完整玩法第一版；原本的單角色測試保留在 `diagnostic.html`，動畫檢視在 `animation.html`。以原始 `actionstation-1.3.apk` 的素材、UI 配置、動畫曲線及反編譯參數為依據，介面改為繁體中文，保留原版音效並加上中文字幕。這是網頁移植，並非重新打包 Android APK。

## 1.2.3 安全提醒版面（2026-10-31）

安全提醒改用隨螢幕換行的獨立版面，修正原版不同尺寸畫布造成的背景與面板溢出，保留三項提醒與原版背景。加入明確的「繼續」按鈕，點擊內文不再啟動 AR；按鈕保留 iOS 動作權限的直接使用者操作流程。

本機 Chrome／WebKit 啟動測試通過，涵蓋 1280×591、844×390、375×610、320×568、1024×768 的版面與按鈕範圍、鍵盤繼續、載入失敗／重試與權限拒絕返回。實體 iPhone／iPad 尚待確認。

## 1.2.2 授權資訊入口（2026-10-31）

移除相機畫面右下角常駐的 8th Wall 版權浮標；「設定 → 使用說明／隱私說明」保留作者、© 2026、XR Engine License Agreement、免責聲明及完整授權連結。引擎分發檔與其授權內容不變。

## 1.2.1 Retina 相機畫面尺寸（2026-10-31）

iPhone 12 Safari 回報 1.2.0 畫面像望遠。已在 DPR 3 模擬重現：2272×1280 drawing buffer 被引擎寫成同尺寸的 inline CSS，但 viewport 只有 1136×640，造成整個相機畫面放大兩倍且被裁切。

修正 canvas 的 CSS 顯示尺寸為容器的 100%，覆蓋引擎 inline 尺寸；高解析度 buffer、相機鏡頭選擇、視角與世界座標不變。回歸測試改用 DPR 3，檢查橫向／直向旋轉後 canvas 實際範圍等於 viewport，並保留離鏡 SLAM、人物點擊、重新辨識與重開相機流程。這是已重現的顯示尺寸問題；實體 iPhone 12 修正後的畫面仍需使用者確認。

## 1.2.0 圖樣離鏡後的空間追蹤（2026-10-31）

- 原 APK 的 Wikitude ImageTrackable 啟用 `_extendedTracking=1`，追蹤目標 `*`；ImageTracker 使用內建 marker.wtc，並非僅在圖樣可見時顯示人物。官方[產品介紹](https://www.takaratomy.co.jp/products/plarail/tettei/set/action/)與[發表資料](https://www.takaratomy.co.jp/product_release/pdf/p170626.pdf)也描述角色在實體車站各區域活動，以及以內建車站 3D 模型限制位置。
- 主入口改用 8th Wall distributed engine 1.0.0 的圖樣辨識與 SLAM。首次掃到原辨識圖後，車站放在世界座標；離鏡後，相機繼續依周遭特徵更新，人物動畫、點擊對話、排隊與上車持續。再次辨識會更新車站位置；返回選單或切到背景會結束場次並清除定位。
- 請使用手機／平板的 Safari 或 Android Chrome，允許相機與動作／方向存取。先完整掃到辨識圖，再緩慢移動鏡頭，讓周遭有紋理的物體進入畫面。定位不穩時提示重新對準；遊戲狀態仍繼續，但缺乏視覺特徵時不能保證車站不漂移。
- 引擎與 target 在網站自行供應，進入 AR 才載入；不需要 API key。原始 binary、LICENSE 與雜湊見 [vendor/xr8](vendor/xr8/README.md)。新引擎 binary 使用其專用授權，並非 MIT；舊 MindAR 僅供歷史診斷頁使用。
- 本機 Chrome 真實 XR8 binary + 合成相機測試通過：標記辨識、移除標記後的世界錨點不變、周遭視差造成相機座標與畫面投影改變、SLAM NORMAL、遊戲時間前進、實際骨架動作、點擊人物、排隊／上車、重新辨識及新場次清除定位。Chrome／WebKit 的選單、換臉與啟動失敗／重試／逾時測試另行驗證。
- 合成相機含固定 IMU，不能當作手機實測。真實 iPhone／iPad 的權限流程、車站尺度／方向、長時間漂移、效能與原 Wikitude 品質仍待實機驗證；WebKit AR 未列為通過。以下舊版段落是歷史紀錄，不代表主入口目前仍只保留最後姿態。

來源建置與驗證（在私人 source repository 執行）：

```sh
node scripts/prepare-world-tracking.mjs
sh scripts/build-browser.sh
node scripts/check-world-tracking.mjs
node scripts/check-replica.mjs
node scripts/check-replica.mjs --webkit
node scripts/check-startup.mjs
node scripts/check-startup.mjs --webkit
```

## 1.1.6 原版臉孔恢復操作（2026-10-31）

- 已儲存臉孔的角色卡片顯示紅色「恢復」；點一下直接清除該角色照片、還原縮圖並回到「製作臉孔」，不進入相機、不另外確認。未製作的角色維持拍照入口。
- 依原 APK `FaceSelectionController.CreateFaceTexture` 的 `SetFaceViewResetImages` 及 `OnClickNextFaceCamera` 的 `SetFaceViewCreatedImages`／`ResetSaveData` 分支還原；繁中紅色按鈕以 CSS 呈現。
- 移除拍照頁額外的恢復按鈕，隱私說明改指向角色選擇頁；照片匯入入口保留。
- 本機 Chrome 完整合成相機／AR 玩法、WebKit 照片匯入流程及兩引擎啟動測試通過；四種角色皆驗證重新整理後狀態、直接恢復、原始縮圖、其他角色資料保留、不啟動相機及再次製作入口。中文化、語法與 diff 檢查通過，已檢視恢復按鈕畫面。WebKit AR 與真實 iPhone／iPad 相機仍待實測。

## 1.1.5 中文圖片傳輸最佳化（2026-10-31 測試發布版本）

1.1.4 實機已進入選單，但中文按鈕未完整載入。主選單四張中文 PNG 合計約 7.1 MB，為已確認的傳輸負擔；不能僅憑截圖確定手機當時的網路吞吐量。

- 網頁改用 WebP 傳輸檔，原始 PNG 保留；不改圖片尺寸或透明度。
- 建置與載入效能測試見 [中文素材說明](zh-TW/README.md)。
- 43 張圖片由 53,382,527 降到 4,942,392 bytes（減少 90.7%）；主選單四張由 7,112,667 降到 642,092 bytes。
- 本機同一 Chrome、模擬 4 Mbps／150 ms 延遲，主選單四張圖完整載入由 17.2 秒降到 4.1 秒（單次比較，含啟動程式與其他選單請求；不是手機實測）。Chrome／WebKit 全部 43 張圖片解碼、啟動／重試／逾時測試、中文化檢查及 WebKit 教學／照片匯入儲存回歸通過；另已檢視實際選單截圖。
- iPhone／iPad 實機載入速度仍待驗證；本次未重跑 AR 合成追蹤。

## 1.1.4 啟動等待拆分（2026-10-31 測試發布版本）

iPhone 回報 1.1.3 仍在 30 秒後逾時；截圖無法判定是哪個請求或解碼步驟停住。

- 主選單與換臉不再等待 15 個角色模型、車站模型、角色動畫及 AR 資料；進入 AR 後才載入，並提供素材逾時提示與返回選單。
- 啟動畫面顯示待完成項目，逾時列出檔名；不再僅以一般網路提示推斷原因。
- 本機 Chrome／WebKit 啟動測試通過：正常啟動、模組／素材失敗、重試、逾時檔名，以及 AR 模型停滯時仍能進入換臉選單。WebKit 照片匯入與儲存回歸通過；iPhone／iPad 實機根因及修正效果仍待驗證。

## 1.1.3 啟動程式封裝（2026-10-31 測試發布版本）

iPhone Safari 截圖確認錯誤為 `Importing a module script failed`，尚無法從通用錯誤確定是哪一個相依模組或網路／快取狀態造成。

- 首頁改載入 `replica.bundle.mjs`，將啟動所需的 Three.js、GLTFLoader 與本機模組整合成單一約 568 KiB 檔案；AR 追蹤仍延後載入。載入畫面標示版本，保留逾時與重新載入提示。
- 修改主程式或相依模組後，執行 `sh scripts/build-browser.sh` 更新發布檔案；使用固定 `esbuild@0.25.12`，來源程式仍維持原本分檔。
- 啟動測試會確認進入選單前沒有額外模組請求；尚待回報 iPhone 的實際結果，不能僅以桌面測試宣稱實機根因已修復。

## 1.1.2 啟動載入保護（2026-10-31 測試發布版本）

iPhone Safari 回報停在「正在載入車站素材」，桌面 WebKit 尚未重現，實機根因未確認。

- 將啟動保護直接放入 HTML（不依賴另一個腳本請求），捕捉整個模組載入失敗；超過 30 秒會顯示網路提示與重新載入按鈕。保留原有本機臉孔，不清除儲存資料。
- MindAR 改在進入 AR 時載入，避免追蹤程式阻擋主選單及拍照；AR 模組載入也設 30 秒逾時，失敗可返回選單。
- 新增 `node scripts/check-startup.mjs` 與 `--webkit`：檢查正常啟動、延後載入、模組／素材失敗、重新載入及逾時提示。桌面結果不能替代 iPhone 實機驗證。

## 1.1.1 臉孔套用與前鏡頭鏡像（2026-10-31 測試發布版本）

- 修正照片儲存後未套用角色：實際 GLB 臉部材質為 `*_tex01`，舊程式搜尋 `face` 無法命中；現在只替換臉部，保留身體 `*_tex00`。既有儲存照片可直接使用。角色選單縮圖也改用實際存在的 `Plakids` 節點，修正儲存後未更新。
- 前鏡頭預覽左右鏡像，拍照結果保留相同方向；後鏡頭與照片匯入不鏡像。依串流回報的鏡頭方向判定，未回報時採請求方向。相機啟動完成前停用拍照。
- `node scripts/check-replica.mjs --photo-only` 可驗證四種角色拍照、切換鏡頭、鏡像像素與儲存；完整模式另驗證四種實際 AR 模型的臉部貼圖與身體材質。WebKit 模式驗證相機不可用時的照片匯入流程。
- 本機驗證：Chrome 合成相機完整玩法、四種角色貼圖／縮圖與鏡像像素檢查通過；WebKit 四種角色照片匯入／儲存／縮圖通過；語法、diff 與中文化檢查通過。WebKit AR 及 iPhone／iPad 真實相機尚未驗證。

## 1.1.0 中文化

- 43 張選單、按鈕、角色名稱、提示與五頁教學圖片依原風格重製；原始素材未覆蓋。詳見 [中文素材與提示規格](zh-TW/README.md)。
- 286 筆角色對話提供繁中版本（含 18 筆保留的純顏文字），選句規則不變。
- 14 段日文廣播對應中文字幕；播放整段期間顯示，換音效、播完或離開場景清除。
- 標題、安全提醒、設定文字及無障礙按鈕名稱中文化；品牌背景商標與功能性辨識圖保留。
- 圖片使用相近圓體；動態文字優先使用 PingFang TC 等繁中字體。透明留白依內容邊界排版，避免文字變形。

新增檢查：`node scripts/check-localization.mjs`。Chrome 主流程與字幕／AR 合成相機、WebKit UI／照片匯入、兩引擎動畫回歸，以及乘客／站位／動畫資料測試通過。WebKit AR 追蹤與 iPhone／iPad 實機相機仍待驗證，不以桌面測試替代。

## 已接上的主流程

- 原版主選單、選單動畫、五頁玩法說明與設定入口。
- 四種原版可換臉角色：拍照、切換相機、確認、儲存、返回；另提供照片匯入與刪除本機臉孔。依原版 256×256 裁切、亮度 +100、遮罩與膚色處理。
- AR 車站：15 種角色、原版站位與移動路徑、生成、走路／張望、點擊台詞、排隊、上車、補充乘客。
- 原版 286 句台詞依角色、時段與候車狀態選取；原版背景音樂、月台語音和三組車站廣播。
- 原版站體深度遮擋模型；首次辨識後保留位置與玩法，重新入鏡校正、返回與相機重新啟動。
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

## 1.0.1 原 APK 站位／互動校對（2026-10-31 測試發布）

第三次錄影顯示多角色與台詞可出現，但不能證明定位及完整上車流程正確。這輪不調整直向版面，也不依影片目測改寫站位。

- 19 組站位、32 個路徑節點與完整父子 Transform 鏈核對一致；正式玩法用的 transforms 與原資料一致。站位 10～12 的原始局部高度為 8、13～14 的 Z 為 -31，原版就包含上層／後場。
- 修正 A2 保留 prefab 的約 -2.087 X 偏移與 180 度旋轉：原生 `CreatePlakids` 0x976c34／0x976cb0 會覆寫根旋轉與位置。現在重設真正的角色根節點，而非外層 GLTF scene。
- 生成點改成原生 0x976c4c 的路徑節點隨機抽選；走路重新選最近節點，避免被其他互動打斷後沿用過期節點。
- 排隊先對現有人物執行 `PreRideInit`，歸位並完成 1 秒等待後才執行 `CreateLineupPlakids`；依 `[16,15,5]`、`[17,6]`、`[18,7]` 補入可用角色，不再按下整列就立即補人。對應 0x9787cc、0x9786d8、0x977a80；新生成第 5 站位依 `PreRideEnd` 0x99f5ec 回到第 0 節點。
- 原 `OnLost` 0x99c310 只清除台詞視窗，不重設人物狀態；移除網頁額外的 Neutral 重設。網頁失去追蹤暫停仍是 MindAR 配接限制。
- 角色點擊改在按下時觸發，對照 `met_Run` 的 TouchPhase.Began；移除整列／上車按鈕自行附加的 no20 語音，原按鈕 handler 沒有這兩個呼叫，語音仍由原月台按鈕順序播放。

驗證：來源座標／角色曲線／乘客測試、Chrome 合成相機完整流程通過；新增 A2 實際渲染根節點、延後補人、三列順序、無現有候車乘客、角色名額耗盡與追蹤中斷的回歸案例。尚未以原 APK 實際執行逐幀比對；Wikitude→MindAR 的標記尺度／方向、站體物理碰撞貼地（原 SphereCast）、Guide／Talk 全部轉移與真實手機定位仍待驗證，不能宣稱第三次錄影的所有偏移已解決。


1.0.1 發布審查範圍為 1.0.0（研究提交 ba43b78）之後的完整變更；未發現新增的阻擋發布問題。專案沒有自訂 CI workflow、lint、型別檢查或安全掃描腳本；依現有文件執行全部驗證入口，包含語法、APK 資料往返、GLB validator／預覽、乘客／站位／動畫、Chrome 完整玩法與診斷頁、WebKit UI／照片匯入與非相機動畫。WebKit AR 合成追蹤及真實手機相機仍未驗證，不能將其列為通過。遠端發布使用既有 GitHub Pages build/deploy；只推送 web/，研究檔案不進公開網站。

## 1.0.2 圖樣離鏡後保留玩法

主入口將「目前辨識到圖樣」與「本次已完成定位」分開。首次辨識前仍等待圖樣；辨識成功後，以獨立場景節點保存每次有效矩陣，避免 MindAR 遺失時隱藏 anchor、清空矩陣而讓角色消失。離鏡期間角色動畫、點擊、排隊與上車持續；圖樣再次入鏡就更新位置。返回選單、背景暫停或重新啟動會清除定位。舊 diagnostic.html 保持診斷用的遺失暫停行為。

這是最後姿態保留，**不是環境空間追蹤或 SLAM**：圖樣離鏡後，場景相對相機的位置固定，手機繼續移動會與實體車站偏移。畫面會提示重新對準校正；仍未解決原有標記方向、尺度與真實手機追蹤品質問題。

新增 Chrome 合成相機回歸：離鏡後矩陣保留、人物仍繪出、遊戲時間前進、排隊／上車、標記移位後重新定位，以及新場次在首次辨識前不沿用舊姿態。實體 iPhone／iPad 相機與自由移動後的車站對位仍待實測。

1.0.2 本機 review（base `c490f5c`）：未發現本次新增的阻擋發布問題。語法／diff、APK 82 項 CRC 與 812 元件往返、15 GLB（0 errors／warnings）及預覽、乘客／站位／動畫、Chrome 主流程與診斷頁、WebKit UI／照片匯入與非相機動畫均通過。`node scripts/check-web.mjs --webkit` 在診斷頁首次辨識等待 60 秒逾時，與既有問題一致，該頁、測試與追蹤 vendor 本次無變更；主流程 WebKit AR 與真實手機相機仍未驗證。沒有專案自訂 lint、型別、安全掃描、build 或 CI workflow，不能將部分通過稱為完整跨瀏覽器 AR 通過。線上主入口可用 `node scripts/check-replica.mjs --live` 重跑合成相機流程。
