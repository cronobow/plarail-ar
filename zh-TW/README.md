# 繁體中文素材（1.1.0）

43 張中文 PNG 使用內建 imagegen 逐張重製；原始參考圖保留在 `../original/sprites/`，沒有覆蓋。圖片字體沿用原圖的圓角粗黑體、白色描邊或棕色外框風格；動態文字使用 PingFang TC／Noto Sans TC／Microsoft JhengHei。

`dialogs.json` 包含 286 筆角色對話，保留日文來源、ID、角色、時段及狀態。18 筆純顏文字沿用原樣。廣播保留原音，14 段中文翻譯定義在 `../localization.mjs`，依音檔播放／結束／中斷顯示或清除，採整段字幕，並非逐字時間軸。

PLARAIL 品牌圖樣、背景商標、功能性辨識圖與角色造型保留；辨識圖不可翻譯重畫，否則會影響既有 marker.mind 的辨識。

## 重製提示規格

工具：內建 imagegen（非 CLI）。每張均提供原始 PNG 作為編輯參考；完整中文文案與素材鍵見 `../localization.mjs` 的 `IMAGE_LABELS`。

共通提示：`Use case: text-localization. Recreate the original game UI sprite in Traditional Chinese (Taiwan). Preserve the original layout, aspect ratio, rounded frame, gradients, pattern, colors and illustration. Use a similar rounded bold Chinese sans-serif font. Replace all Japanese text, including phonetic ruby, with the supplied exact Chinese text. Keep transparent outer corners; no extra objects or margins.`

- 主選單：藍色「AR 車站／模式」、綠色「拍照換臉／模式」，保留底部約 40% 空間供原版人物動畫覆蓋。綠色面板的整個內部要求不透明；網頁另加綠色底層修正生成去背留下的局部透明。
- 按鈕：保留藍／紅／橘漸層、立體邊框與圖示，置換為 `IMAGE_LABELS` 所列中文。月台語音保留黑底白色「3」。
- 角色名稱與提示文字：`Single horizontal line, same color, rounded bold font, outline and shadow, transparent background, tight bounds, no extra decoration.`
- 五頁教學：保留藍色鐵軌紋背景、白色圓角面板、黃色標題列、珊瑚色標題與灰色內文；連同內嵌畫面翻譯。標題依序為「1. 主選單說明」「2. AR 車站玩法」「3. 拍照換臉（1）」「3. 拍照換臉（2）」「4. 設定畫面」。說明文字與現在網頁可用的下載、拍照確認及恢復臉孔流程對齊。

`image-bounds.mjs` 由 `python3 scripts/update-localized-bounds.py` 從圖片不透明區域計算，讓文字以正常比例呈現；此腳本只讀取圖片，不修改像素。

## 網頁傳輸格式（1.1.5）

網頁使用同名 WebP，原始 PNG 保留供後續編輯。執行 `python3 scripts/build-web-images.py` 產生傳輸檔案（需要 `cwebp` 與 Pillow）：品質 85、透明度無損、不縮放。腳本逐張確認尺寸與 alpha 完全一致；`image-bounds.mjs` 繼續使用原尺寸座標。

`node scripts/check-image-loading.mjs` 使用 Chrome 模擬 4 Mbps／150 ms 延遲，比較主選單四張中文圖片完整載入的時間；加 `--png` 使用原 PNG 作為基準，加 `--webkit` 驗證 WebKit 解碼。測試另檢查全部 43 張 WebP 可解碼，以及主選單中文圖片合計不超過 1 MiB。
