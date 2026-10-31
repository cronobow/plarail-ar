export {IMAGE_BOUNDS} from './zh-TW/image-bounds.mjs?v=1.1.0';
// 原始 APK 素材保留不動；中文圖片以相同節點、尺寸及動畫時序替換。
export const IMAGE_LABELS={
 btn_ar_mode:'AR 車站模式：對準圖樣，讓角色登場！點一下角色，就會出現對話！',
 btn_face_photo_mode:'拍照換臉模式：換上自己的臉，變身小乘客！家人照片、插畫也可以！',
 btn_howto:'玩法說明',btn_news:'最新消息',btn_face_creation:'製作臉孔',
 btn_augmented_alignment:'排隊',btn_augmented_boarding:'1 月台上車',btn_augmented_horn:'3 月台語音',
 btn_yes:'開始',btn_terms_of_use:'使用規約',btn_privacy_policy:'隱私說明',btn_camera_change:'切換相機',
 btn_contact_about_app:'應用程式支援',btn_download:'下載辨識圖',btn_contact_about_toy:'玩具支援',
 option_window_download:'下載 AR 辨識圖：AR 車站使用的辨識圖，請下載並列印。',
 text_ar_scene_alignment:'排隊中！',text_ar_scene_caution:'請慢慢移動手機！',
 text_ar_scene_rogo:'請對準 PLARAIL 辨識圖。',text_ar_scene_touch:'點一下角色，看看他們說什麼！',
 text_camera:'請對準臉部框線',text_option_app:'設定',text_plastic_kids_selection:'選擇想換臉的角色！',
 tutorial_01:'1. 主選單說明',tutorial_02:'2. AR 車站玩法',tutorial_03:'3. 拍照換臉（1）',tutorial_04:'3. 拍照換臉（2）',tutorial_05:'4. 設定畫面',
 ...Object.fromEntries(Object.entries({a1:'小男孩',a2:'小鐵',a3:'小 T',b1:'家庭主婦',b2:'上班族 1',b3:'上班族 2',c1:'上班族',d1:'男高中生',e1:'站務員 1',e2:'站務員 2',f1:'站長',g1:'保線員 1',g2:'保線員 2',h1:'女高中生',h2:'小女孩'}).map(([k,v])=>['text_list_plakids_'+k,v]))
};
export function imageKey(url){return url?.split('/').pop().replace(/^.*__/,'').replace(/\.png(?:\?.*)?$/,'').replace(/_push$/,'');}
export function localizedImage(url){const key=imageKey(url);return IMAGE_LABELS[key]?`./zh-TW/${key}.webp?v=1.1.5`:url;}
const TEXT={
 '0:2':'請先閱讀使用規約與隱私說明，\n同意後再開始使用。',
 '4:12':'按鈕',
 '8:15':'請變更 SSID。\n可使用半形英文字母、數字、「-」與「_」。',
 '8:12':'請輸入新的 SSID。','8:11':'變更 SSID',
 '11:12':'1. 請和家長一起遊玩。\n2. 請確認周圍沒有危險物品，避免受傷。\n3. 移動前請抬頭，確認周圍安全後再走動。',
 '11:15':'安全遊玩 AR 的小提醒'
};
export function localizeUI(data){
 for(const [scene,config]of Object.entries(data))for(const node of config.nodes){
  if(node.text&&TEXT[`${scene}:${node.id}`]!==undefined)node.text.value=TEXT[`${scene}:${node.id}`];
 }
 return data;
}
// 每段原音播放期間顯示整句翻譯；不是逐字對齊字幕。
export const AUDIO_CAPTIONS={
 'audio/voice/no14':'請勿奔跑搶上車。',
 'audio/voice/no15':'車門即將關閉，請注意。',
 'audio/voice/no16':'出發前進！',
 'audio/voice/no17':'3 月台的新幹線即將發車。\n請注意即將關閉的車門。',
 'audio/voice/no18':'新幹線即將進入 3 月台。',
 'audio/voice/no19':'3 月台的新幹線開往東京。',
 'audio/voice/no2-2':'請遠離月台門，等候列車。',
 'audio/voice/no20-1':'3 月台的新幹線以本站為終點站。',
 'audio/voice/no20-2':'這班列車不開放搭乘，請注意。',
 'audio/voice/no21':'搭乘新幹線的旅客，\n請前往二樓的 3 月台轉乘。',
 'audio/voice/no22':'搭乘一般鐵路列車的旅客，\n請前往 1、2 月台轉乘。',
 'audio/voice/no23':'1 月台的列車以本站為終點站。',
 'audio/voice/no24':'本站全天禁止吸菸。',
 'audio/voice/no25':'上下車時，請留意腳步。'
};
export function audioCaption(key){return AUDIO_CAPTIONS[key.toLowerCase().replace(/^clip\//,'audio/voice/')]||'';}
