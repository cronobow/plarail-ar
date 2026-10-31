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

// 以 Enpedia 列出的日文廣播原句及其餘台詞的核心詞比對，不要求辨識逐字一致。
const SPEECH_PHRASES={
 'no14':['駆け込み乗車はおやめください','駆け込み乗車は危険です','駆け込み乗車はご遠慮ください'],
 'no15':['ドア閉まりますご注意ください','ドアが閉まりますご注意ください'],
 'no16':['出発進行'],
 'no17':['3番線から新幹線が発車します閉まるドアにご注意ください','三番線から新幹線が発車します閉まるドアにご注意ください'],
 'no18':['まもなく3番線に新幹線がまいりますホームドアから離れてお待ちください','まもなく三番線に新幹線がまいりますホームドアから離れてお待ちください'],
 'no19':['3番線に停車中の列車は東京行きです','三番線に停車中の列車は東京行きです'],
 'no2-2':['まもなく1番線に電車が参りますホームドアから離れてお待ちください','まもなく一番線に電車が参りますホームドアから離れてお待ちください'],
 'no20-1':['3番線の新幹線は当駅止まりです','三番線の新幹線は当駅止まりです'],
 'no20-2':['ご乗車になれませんのでご注意ください'],
 'no21':['新幹線をご利用の方は2階の3番線ホームへお乗り換えください','新幹線をご利用の方は2階の三番線ホームへお乗り換えください'],
 'no22':['在来線をご利用の方は1・2番線ホームへお乗り換えください','在来線をご利用の方は1番2番線ホームへお乗り換えください','在来線をご利用の方は1番線2番線ホームへお乗り換えください','在来線をご利用の方は1番線と2番線ホームへお乗り換えください','在来線をご利用の方は一番二番線ホームへお乗り換えください','在来線をご利用の方は一番線と二番線ホームへお乗り換えください'],
 'no23':['1番線の電車は当駅止まりです','一番線の電車は当駅止まりです'],
 'no24':['当駅は終日禁煙です','駅構内は終日禁煙です','構内では終日禁煙です','終日禁煙'],
 'no25':['乗り降りの際は足元にご注意ください','お乗り降りの際は足元にご注意ください','足元にご注意ください']
};
function normalizeJapaneseSpeech(value){
 return String(value).normalize('NFKC').replace(/[、。，．！？!?・「」『』（）()\s]/g,'').replace(/[ァ-ヶ]/g,c=>String.fromCharCode(c.charCodeAt(0)-0x60));
}
const NORMALIZED_SPEECH_PHRASES=Object.entries(SPEECH_PHRASES).flatMap(([key,phrases])=>phrases.map(phrase=>({key,phrase:normalizeJapaneseSpeech(phrase)}))).sort((a,b)=>b.phrase.length-a.phrase.length);
export function matchSpeechCaptions(transcripts){
 const hits=new Map();
 for(const transcript of transcripts||[]){
  const text=normalizeJapaneseSpeech(transcript);
  for(const {key,phrase} of NORMALIZED_SPEECH_PHRASES){const index=text.indexOf(phrase);if(index>=0&&(!hits.has(key)||index<hits.get(key)))hits.set(key,index);}
 }
 return [...hits].sort((a,b)=>a[1]-b[1]).map(([key])=>AUDIO_CAPTIONS[`audio/voice/${key}`]).filter(Boolean);
}
