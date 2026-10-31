import {localizeUI,audioCaption} from './localization.mjs?v=1.1.0';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {CharacterAnimation,loadAnimations} from './animation.mjs?v=1.1.0';
import {OriginalUI} from './original-ui.mjs?v=1.1.0';
import {Passengers,CHARACTERS,RULES} from './passengers.mjs?v=1.1.0';
const $=id=>document.getElementById(id), loader=new GLTFLoader();
const state=window.replica={ready:false,scene:'loading',tracking:false,placed:false,engine:null,error:null,version:'1.1.6'};
let data,ui,clips,templates,occluder,ar=null,world=null,engine=null,run=0,photoStream=null,photoFacing='user',faceCharacter='a1',tutorial=0,clickedCharacter=false;
let faceMask;
const views=new Map(),audioPlayers=new Set();let voiceIndex=0,broadcastIndex=0,effectAudio=null,captionAudio=null;
const LINE_VOICE=['audio/se/no19','audio/voice/no17','audio/voice/no18','audio/voice/no2-2','audio/voice/no19','audio/se/no19','audio/voice/no20-1','audio/voice/no20-2'];
const BROADCAST=['audio/se/no14','audio/se/no15','audio/se/no16'].flatMap(first=>[first,'audio/voice/no14','audio/voice/no15','audio/se/no17','audio/voice/no16']);
function clearCaption(audio){if(!audio||captionAudio===audio){captionAudio=null;$('audio-caption').textContent='';$('audio-caption').hidden=true;}}
function playEffect(key){if(effectAudio){effectAudio.pause();audioPlayers.delete(effectAudio);clearCaption(effectAudio);}effectAudio=play(key);}
const sprite=name=>{const paths=Object.values(data.ui).flatMap(s=>s.nodes).map(n=>n.image?.url).filter(Boolean);return paths.find(p=>p.endsWith('__'+name+'.png'))||'./original/sprites/'+name;};
function modal(title,body,buttons=[['關閉',()=>{}]]){
 $('dialog-title').textContent=title;$('dialog-body').replaceChildren();
 if(body instanceof Node)$('dialog-body').append(body);else $('dialog-body').textContent=body;
 $('dialog-buttons').replaceChildren();for(const [text,fn]of buttons){const b=document.createElement('button');b.textContent=text;b.onclick=()=>{$('dialog').close();Promise.resolve().then(fn).catch(fail);};$('dialog-buttons').append(b);}
 if(!$('dialog').open)$('dialog').showModal();
}
function fail(error){state.error=error.message||String(error);$('loading').hidden=true;modal('無法完成操作',state.error,[['返回選單',()=>show(3)]]);}
function play(key,loop=false){
 const url=data.audio[key.toLowerCase()];if(!url)return;
 const audio=new Audio(url);audio.loop=loop;audio.volume=loop?.35:.8;audioPlayers.add(audio);
 const caption=audioCaption(key);
 audio.onplaying=()=>{if(caption&&audioPlayers.has(audio)&&!audio.paused){captionAudio=audio;$('audio-caption').textContent=caption;$('audio-caption').hidden=false;}};
 const finish=()=>{audioPlayers.delete(audio);clearCaption(audio);};
 audio.onended=finish;audio.onerror=finish;audio.onpause=()=>clearCaption(audio);audio.play().catch(finish);return audio;
}
function stopAudio(){clearCaption();effectAudio=null;for(const a of audioPlayers){a.pause();a.src='';}audioPlayers.clear();}
function readFace(name){try{return localStorage.getItem('plarail-face-'+name);}catch{return null;}}
function stopCamera(){
 run++;state.tracking=false;state.placed=false;$('tracking-note').hidden=true;engine?.setTracking(false);
 if(ar){ar.renderer.setAnimationLoop(null);ar.controller?.stopProcessVideo();ar.video?.srcObject?.getTracks().forEach(t=>t.stop());ar.video?.remove();window.removeEventListener('resize',ar.resizeHandler);ar.renderer.dispose();ar.renderer.forceContextLoss();ar=null;}
 state.occluder?.traverse(o=>{if(o.isMesh)o.material.dispose();});state.occluder=null;
 for(const v of views.values())disposeView(v);views.clear();world=null;engine=null;state.engine=null;state.render=null;
 $('camera').replaceChildren();$('bubbles').replaceChildren();
 photoStream?.getTracks().forEach(t=>t.stop());photoStream=null;$('portrait-camera').srcObject=null;$('portrait-camera').hidden=true;
 document.querySelector('.face-actions')?.remove();stopAudio();
}
function show(scene){
 stopCamera();state.scene=String(scene);ui.show(scene);$('loading').hidden=true;
 if(scene===11){const panel=ui.elements.get(11);panel.style.pointerEvents='auto';panel.setAttribute('role','button');panel.setAttribute('aria-label','開始 AR');panel.tabIndex=0;panel.onclick=()=>startAR().catch(fail);panel.onkeydown=e=>{if(e.key==='Enter')startAR().catch(fail);};}
 if(scene===9)showTutorial();
 if(scene===10)updateFaceCards();
 if(scene===8){ui.visible(9,false);}
}
function showTutorial(){const ids=[10,16,13,9,3];ids.forEach((id,i)=>ui.visible(id,i===tutorial));ui.elements.get(11).disabled=tutorial===0;ui.elements.get(5).disabled=tutorial===4;}
function updateFaceCards(){
 for(const n of data.ui['10'].nodes.filter(n=>n.name.startsWith('CharaFaceFlame'))){
  const c=n.name.replace('CharaFaceFlame','').toLowerCase(),face=readFace(c);if(!face)continue;
  const el=ui.elements.get(n.id),button=el?.querySelector('[data-action="OnClickNextFaceCamera"]');
  if(button){button.classList.add('face-reset');button.setAttribute('aria-label','恢復');const label=document.createElement('span');label.className='face-reset-label';label.textContent='恢復';button.append(label);}
  const icon=el?.querySelector(':scope > [data-name="Plakids"] > img');if(icon){icon.src=face;icon.style.objectFit='contain';icon.alt='已儲存的角色臉孔';}
 }
}
async function dispatch(event,node){
 const m=event.method;
 if(m==='OnClickControlModeButton'){show(11);return;}
 if(m==='OnClickYesButton'&&state.scene==='11'){await startAR();return;}
 if(['OnClickBackMenuButton','OnClickBackMenu','OnClickBack'].includes(m)){show(state.scene==='6'?10:3);return;}
 if(m==='OnClickMortormanModeButton'){show(10);return;}
 if(m==='OnClickHowtoButton'){tutorial=0;show(9);return;}
 if(m==='OnClickAppOptionButton'){show(8);return;}
 if(m==='OnClickNext'){tutorial=Math.min(4,tutorial+1);showTutorial();return;}
 if(m==='OnClickPrev'){tutorial=Math.max(0,tutorial-1);showTutorial();return;}
 if(m==='OnClickPreRideButton'){engine?.lineUp();refreshARUI();return;}
 if(m==='OnClickRideButton'){engine?.board();refreshARUI();return;}
 if(m==='OnClickVoiceButton'){playEffect(LINE_VOICE[voiceIndex++%LINE_VOICE.length]);return;}
 if(m==='OnClickSEButton'){playEffect(BROADCAST[broadcastIndex++%BROADCAST.length]);return;}
 if(m==='OnClickNextFaceCamera'){
  const target=data.ui['10'].nodes.find(n=>n.id===event.object);faceCharacter=target.name.replace('CharaFaceFlame','').toLowerCase();
  if(readFace(faceCharacter)){localStorage.removeItem('plarail-face-'+faceCharacter);show(10);return;}
  await startPhoto();return;
 }
 if(m==='OnClickCameraChangeButton'){photoFacing=photoFacing==='user'?'environment':'user';await startPhoto();return;}
 if(m==='OnClickShootingButton'){captureFace();return;}
 if(m==='OnClickNewInfoButton'){modal('最新消息','原版此按鈕連往外部消息服務。離線復刻版保留入口，未連線至已停服的服務。');return;}
 if(m==='OnClickAgreement'||m==='OnClickPrivasy'){modal(m==='OnClickAgreement'?'使用說明':'隱私說明','這是非官方原版 APK 復刻。角色與音效沿用原始素材；介面圖片與文字已製作繁體中文版本。相機影像只在裝置上處理；製作的臉孔只儲存在此瀏覽器，可在角色選擇頁按「恢復」清除。');return;}
 if(m==='OnClickDownloadURL'){const link=document.createElement('a');link.href='./marker.png';link.download='action-station-marker.png';link.textContent='下載原版辨識圖';modal('辨識圖下載',link);return;}
 if(['OnClickSupportApp','OnClickSupportToy'].includes(m)){modal('原版外部服務','此入口原本通往官方支援或下載服務，復刻版未重建外部伺服器。');return;}
 if(['OnClickCancel','OnClickOk'].includes(m)){show(8);return;}
 modal('操作尚未接上',m);
}
function originalTransforms(){
 const nodes=new Map();for(const t of data.transforms){const n=new THREE.Group(),p=t.position,q=t.rotation,s=t.scale;n.position.set(-p.x,p.y,p.z);n.quaternion.set(q.x,-q.y,-q.z,q.w);n.scale.set(s.x,s.y,s.z);nodes.set(t.id,n);}
 const root=new THREE.Group();for(const t of data.transforms)(nodes.get(t.parent)||root).add(nodes.get(t.id));root.updateMatrixWorld(true);return nodes;
}
function setMotion(view,name){
 if(view.action===name)return;
 view.from=[...view.animation.nodes.values()].map(({node})=>({position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone()}));
 view.blend=0;view.blendDuration=view.action==='LOOKING'&&name==='REST'?.1:.25;view.action=name;view.animation.play(name);
}
function newView(p){
 const model=templates.get(p.character).scene.clone(true),holder=new THREE.Group();holder.add(model);world.add(holder);
 // 原版 CreatePlakids 使用 station root localScale（1），不按角色高度正規化。
 const prefab=model.getObjectByName('plakids_'+p.character);
 if(!prefab)throw new Error('缺少原版角色根節點：'+p.character);
 // CreatePlakids 0x976c34 / 0x976cb0 覆寫 prefab 根的旋轉／位置。
 prefab.position.set(0,0,0);prefab.quaternion.identity();prefab.scale.setScalar(1);
 const materials=[];model.traverse(o=>{if(o.isMesh){const copies=(Array.isArray(o.material)?o.material:[o.material]).map(m=>{const copy=m.clone();copy.depthWrite=true;materials.push(copy);return copy;});o.material=Array.isArray(o.material)?copies:copies[0];}});
 const animation=new CharacterAnimation(model,clips),view={holder,model,animation,materials,action:null,person:p,faceTexture:null};
 const saved=readFace(p.character);if(saved){const tex=new THREE.TextureLoader().load(saved);tex.flipY=false;tex.colorSpace=THREE.SRGBColorSpace;view.faceTexture=tex;model.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(/_tex01$/.test(m.name))m.map=tex;});}
 const bubble=document.createElement('button');bubble.className='speech';bubble.hidden=true;bubble.onclick=()=>{p.dialog=null;engine.state(p,'Neutral');};$('bubbles').append(bubble);view.bubble=bubble;
 views.set(p.id,view);return view;
}
function disposeView(v){v.bubble.remove();for(const m of v.materials)m.dispose();v.faceTexture?.dispose();v.holder.removeFromParent();}
function updateViews(dt,camera){
 for(const p of engine.people){
  const v=views.get(p.id)||newView(p);v.holder.position.fromArray(p.position);v.holder.rotation.y=p.angle;
  let motion=['Walk','Ride'].includes(p.state)||p.state==='PreRide'&&!p.ready?'WALK':p.state==='Looking'?'LOOKING':'REST';setMotion(v,motion);
  v.animation.update(dt);
  if(v.from&&v.blend<v.blendDuration){v.blend+=dt;const t=Math.min(1,v.blend/v.blendDuration);[...v.animation.nodes.values()].forEach(({node},i)=>{const target={position:node.position.clone(),quaternion:node.quaternion.clone(),scale:node.scale.clone()};node.position.copy(v.from[i].position).lerp(target.position,t);node.quaternion.copy(v.from[i].quaternion).slerp(target.quaternion,t);node.scale.copy(v.from[i].scale).lerp(target.scale,t);});}
  for(const m of v.materials)m.opacity=p.alpha;
  v.bubble.hidden=!state.placed||!p.dialog;
  if(p.dialog){v.bubble.textContent=p.dialog;v.holder.updateWorldMatrix(true,true);const pos=new THREE.Vector3(0,4,0);v.holder.localToWorld(pos);pos.project(camera);v.bubble.hidden=pos.z>1||pos.z< -1||!state.placed;v.bubble.style.left=(pos.x*.5+.5)*innerWidth+'px';v.bubble.style.top=(-pos.y*.5+.5)*innerHeight+'px';}
 }
 for(const [id,v]of views)if(!engine.people.some(p=>p.id===id)){disposeView(v);views.delete(id);}
}
function refreshARUI(){
 if(state.scene!=='4'||!engine)return;
 ui.visible(9,!state.placed);ui.visible(61,state.placed&&!clickedCharacter);
 $('tracking-note').hidden=!state.placed||state.tracking;
 ui.visible(82,state.placed&&engine.mode==='Normal');ui.visible(40,state.placed&&engine.mode==='Ready');
 ui.visible(3,state.placed&&engine.mode==='PreRide');const speech=ui.elements.get(3);if(speech)speech.style.transform='scale(1)';
}
const fetchJSON=async path=>{const r=await fetch(path);if(!r.ok)throw new Error('素材讀取失敗：'+path);return r.json();};
let arAssets;
function loadARAssets(){
 if(!arAssets)arAssets=(async()=>{
  const [dialogs,transforms,routes,animations,models,station]=await Promise.all([
   fetchJSON('./zh-TW/dialogs.json?v=1.1.0'),fetchJSON('./original/transforms.json'),fetchJSON('./station.json'),loadAnimations(),
   Promise.all(CHARACTERS.map(async c=>[c,await loader.loadAsync(`./characters/plakids_${c}.glb`)])),loader.loadAsync('./original/station.glb')]);
  Object.assign(data,{dialogs,transforms,routes});clips=animations;templates=new Map(models);occluder=station;
 })().catch(error=>{arAssets=null;throw error;});
 return arAssets;
}
async function startAR(){
 show(4);state.scene='4';voiceIndex=broadcastIndex=0;$('loading').hidden=false;$('loading').textContent='正在啟動相機…';const token=run;
 try{
  $('loading').textContent='正在載入 AR 追蹤程式…';
  let timeout;
  const {MindARThree}=await Promise.race([
   import('./vendor/mindar-image-three.prod.js'),
   new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('AR 追蹤程式載入逾時，請返回選單後重試。')),30000);})
  ]).finally(()=>clearTimeout(timeout));
  if(token!==run)return;
  $('loading').textContent='正在載入 AR 角色與車站素材…';
  await Promise.race([
   loadARAssets(),
   new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error('AR 素材載入超過 30 秒，請返回選單後重試。')),30000);})
  ]).finally(()=>clearTimeout(timeout));
  if(token!==run)return;
  $('loading').textContent='正在啟動相機…';
  const current=new MindARThree({container:$('camera'),imageTargetSrc:'./marker.mind',maxTrack:1,uiLoading:'no',uiScanning:'no',uiError:'no'});ar=current;
  current.cssRenderer.domElement.style.pointerEvents='none';
  current.renderer.setPixelRatio(Math.min(devicePixelRatio,2));const anchor=current.addAnchor(0);
  // MindAR 遺失時會隱藏 anchor 並清空矩陣；另存最後的有效姿態，保留玩法。
  const placement=new THREE.Group();placement.matrixAutoUpdate=false;placement.visible=false;current.scene.add(placement);
  world=new THREE.Group();world.rotation.x=Math.PI/2;world.scale.setScalar(1/17.5);placement.add(world);
  const transforms=originalTransforms();
  const station=occluder.scene.clone(true),stationParent=new THREE.Group();stationParent.matrix.copy(transforms.get(168).matrixWorld);stationParent.matrixAutoUpdate=false;stationParent.add(station);world.add(stationParent);
  station.traverse(o=>{if(o.isMesh){o.material=new THREE.MeshBasicMaterial({colorWrite:false,depthWrite:true,depthTest:true});o.renderOrder=-1;}});
  state.occluder=station;
  const routes=data.routes.routes.map(r=>r.points.map(id=>transforms.get(id).getWorldPosition(new THREE.Vector3()).toArray()));
  engine=new Passengers(routes,data.dialogs,{faces:CHARACTERS.filter(c=>readFace(c))});engine.initialize();state.engine=engine;state.render={camera:current.camera,world,views,placement};clickedCharacter=false;
  anchor.onTargetUpdate=()=>{
   if(token!==run)return;
   state.tracking=anchor.visible;
   if(anchor.visible){
    placement.matrix.copy(anchor.group.matrix);placement.matrixWorldNeedsUpdate=true;placement.visible=true;
    if(!state.placed){state.placed=true;engine.setTracking(true);}
   }
   refreshARUI();
  };refreshARUI();
  await current.start();if(token!==run){current.controller?.stopProcessVideo();current.video?.srcObject?.getTracks().forEach(t=>t.stop());current.video?.remove();return;}
  play('clip/armodebgm00',true);$('loading').hidden=true;
  const raycaster=new THREE.Raycaster();current.renderer.domElement.addEventListener('pointerdown',event=>{
   if(!state.placed)return;const rect=current.renderer.domElement.getBoundingClientRect();const pointer=new THREE.Vector2((event.clientX-rect.left)/rect.width*2-1,-(event.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,current.camera);
   const hits=raycaster.intersectObjects([...views.values()].map(v=>v.holder),true);if(!hits.length)return;
   for(const [id,v]of views){let n=hits[0].object;while(n&&n!==v.holder)n=n.parent;if(n){engine.touch(id);clickedCharacter=true;refreshARUI();break;}}
  });
  let previous=performance.now();current.renderer.setAnimationLoop(()=>{
   const now=performance.now(),dt=Math.min((now-previous)/1000,.1);previous=now;
   engine.update(dt);updateViews(state.placed?dt:0,current.camera);engine.drain();refreshARUI();current.renderer.render(current.scene,current.camera);
  });
 }catch(error){if(token===run){stopCamera();fail(error);}}
}
async function startPhoto(){
 show(6);const token=run,video=$('portrait-camera');video.hidden=false;video.dataset.mirrored='false';
 const shutter=ui.elements.get(4);shutter.disabled=true;
 const actions=document.createElement('div');actions.className='face-actions';
 const choose=document.createElement('button');choose.textContent='從照片選擇';choose.onclick=()=>$('face-file').click();actions.append(choose);document.body.append(actions);
 try{const stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:photoFacing},audio:false});if(token!==run){stream.getTracks().forEach(t=>t.stop());return;}photoStream=stream;video.dataset.mirrored=String((stream.getVideoTracks()[0]?.getSettings().facingMode||photoFacing)==='user');video.srcObject=stream;await video.play();if(token===run)shutter.disabled=false;}catch(e){if(token===run)modal('相機未啟動','可允許相機後重試，或從照片選擇製作臉孔。');}
}
function cropFace(source,mirrored=false){
 const w=source.videoWidth||source.naturalWidth,h=source.videoHeight||source.naturalHeight;if(!w||!h)throw new Error('相機尚未準備好');
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d'),size=Math.min(256,w,h);
 // goWebCamTexture.Shooting: 中心 256×256、Y +20（Unity 底部原點）、RGB +100；遮罩外填原版膚色。
 if(mirrored){ctx.translate(256,0);ctx.scale(-1,1);}
 ctx.drawImage(source,(w-size)/2,Math.max(0,(h-size)/2-20),size,size,0,0,256,256);
 const pixels=ctx.getImageData(0,0,256,256);const mask=document.createElement('canvas');mask.width=mask.height=256;const m=mask.getContext('2d');m.drawImage(faceMask,0,0,256,256);const alpha=m.getImageData(0,0,256,256).data;
 for(let i=0;i<pixels.data.length;i+=4){if(alpha[i+3]===0){pixels.data.set([254,225,183,255],i);}else for(let c=0;c<3;c++)pixels.data[i+c]=Math.min(255,pixels.data[i+c]+100);}
 ctx.putImageData(pixels,0,0);return canvas.toDataURL('image/png');
}
function confirmFace(url){const img=new Image();img.src=url;modal('使用這張臉孔？',img,[['重拍',()=>{}],['使用',()=>{localStorage.setItem('plarail-face-'+faceCharacter,url);show(10);}]]);}
function captureFace(){try{play('clip/camerashutter');confirmFace(cropFace($('portrait-camera'),$('portrait-camera').dataset.mirrored==='true'));}catch(e){fail(e);}}
$('face-file').onchange=async()=>{const file=$('face-file').files[0];if(!file)return;const url=URL.createObjectURL(file);try{const image=new Image();image.src=url;await image.decode();confirmFace(cropFace(image));}catch(e){fail(e);}finally{URL.revokeObjectURL(url);$('face-file').value='';}};
window.addEventListener('resize',()=>ui?.resize());window.addEventListener('pagehide',stopCamera);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&['4','6'].includes(state.scene)){stopCamera();modal('已暫停','返回後點選繼續。',[['返回選單',()=>show(3)],['繼續',()=>state.scene==='4'?startAR():startPhoto()]]);}});
try{
 const track=(name,task)=>window.stationBoot?.track?window.stationBoot.track(name,task):task();
 const [uiData,audio,uiClips]=await Promise.all([
  ...['./original/ui.json','./original/audio.json','./original/ui-animations.json'].map(path=>track(path,()=>fetchJSON(path))),
  track('換臉遮罩',async()=>{faceMask=new Image();faceMask.src='./original/textures/resources.assets__60__cut_face.png';await faceMask.decode();})]);
 localizeUI(uiData);data={ui:uiData,audio};
 ui=new OriginalUI($('original-ui'),uiData,(event,node)=>dispatch(event,node).catch(fail),uiClips);state.ready=true;show(3);window.stationBoot?.ready();
 // 只供本機端對端測試觀察，不改變遊戲的參數或時序。
 state.ui=ui;state.startAR=startAR;state.show=show;
 const animateUI=now=>{ui.animate(now,engine?.mode==='PreRide');requestAnimationFrame(animateUI);};requestAnimationFrame(animateUI);
}catch(e){if(window.stationBoot)window.stationBoot.fail(e);else fail(e);}
