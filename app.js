import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MindARThree} from './vendor/mindar-image-three.prod.js';
import {CharacterAnimation,loadAnimations} from './animation.mjs?v=0.3.0';
import {createStation} from './station.mjs?v=0.3.0';
const $=id=>document.getElementById(id);
let ar=null, active=false, generation=0, model=null, found=0, lost=0, frames=0, lastFrame=0;
const cache=new Map(), loader=new GLTFLoader();
let clips, stationData, station=null;
let selectedAction='WALK';
window.testState={ready:false,tracking:false};
function status(text){$('state').textContent=text;}
function showMotion(){
 const animation=model?.animation;
 if(!animation){$('motion').textContent='角色載入中…';return;}
 const label={REST:'靜止',WALK:'走路',LOOKING:'張望'}[animation.name];
 if(animation.name==='REST'){$('motion').textContent='動作：靜止';return;}
 const clip=animation.clips[animation.name], duration=clip.stop-clip.start;
 const time=clip.loop?animation.elapsed%duration:Math.min(animation.elapsed,duration);
 const state=!window.testState.tracking?'等待標記':!clip.loop&&animation.elapsed>=duration?'已播完，點張望可重播':'播放中';
 $('motion').textContent=`動作：${label} · ${state} · ${time.toFixed(1)} 秒`;
}
function applyPlacement(){
 if(!model)return;
 const enabled=$('placement').value==='station';
 if(station)station.root.visible=enabled;
 model.position.set(0,0,0);model.rotation.set(Math.PI/2,0,0);
 if(enabled&&station){
  const point=station.points[Number($('slot').value)].points[Number($('point').value)];
  const scale=Number($('station-scale').value), x=Number($('station-x').value), y=Number($('station-y').value);
  station.root.scale.setScalar(scale);station.root.position.set(x,y,0);
  model.position.copy(point.position).multiplyScalar(scale).add(station.root.position);
  model.quaternion.copy(point.quaternion);
 }
 $('placement-note').textContent=enabled?`比例 ${Number($('station-scale').value).toFixed(2)} · 左右 ${Number($('station-x').value).toFixed(2)} · 前後 ${Number($('station-y').value).toFixed(2)}（標記寬度單位，待實體校正）。黃點為原始節點，連線不代表行走邏輯。`:'角色置於標記中央';
}
function updatePoints(){
 $('point').replaceChildren();
 const route=stationData.routes[Number($('slot').value)];
 route.points.forEach((_,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`節點 ${i}`;$('point').append(option);});
 applyPlacement();
}
function applyScale(){if(model)model.scale.setScalar(Number($('scale').value));$('size').value=Number($('scale').value).toFixed(2);}
async function getModel(name){
 if(!cache.has(name))cache.set(name,loader.loadAsync(`./characters/${name}.glb`));
 const gltf=await cache.get(name), scene=gltf.scene.clone(true);
 scene.children[0].quaternion.identity();
 const animation=new CharacterAnimation(scene,clips);
 scene.traverse(o=>{if(o.isMesh)for(const m of Array.isArray(o.material)?o.material:[o.material])m.depthWrite=m.userData.unityDepthWrite===true;});
 const box=new THREE.Box3().setFromObject(scene), size=box.getSize(new THREE.Vector3()), center=box.getCenter(new THREE.Vector3());
 scene.position.set(-center.x,-box.min.y,-center.z);
 const normalized=new THREE.Group();normalized.add(scene);normalized.scale.setScalar(1/size.y);
 const group=new THREE.Group();group.add(normalized);group.rotation.x=Math.PI/2;
 group.animation=animation;
 return group;
}
let selection=0;
async function selectModel(anchor){const ticket=++selection;const next=await getModel($('character').value);if(ticket!==selection||!active)return;if(model)anchor.group.remove(model);model=next;window.testState.model=model;model.animation.play(selectedAction);anchor.group.add(model);applyScale();applyPlacement();showMotion();}
function end(){generation++;selection++;active=false;if(ar){ar.renderer.setAnimationLoop(null);ar.controller?.stopProcessVideo();ar.video?.srcObject?.getTracks().forEach(t=>t.stop());ar.video?.remove();window.removeEventListener('resize',ar.resizeHandler);ar.renderer.dispose();ar.renderer.forceContextLoss();ar=null;}station?.dispose();station=null;window.testState.station=null;$('camera').replaceChildren();model=null;window.testState.model=null;$('hud').hidden=true;$('welcome').hidden=false;$('start').disabled=false;$('start').textContent='啟動 AR 相機';window.testState.tracking=false;}
$('start').onclick=async()=>{
 const run=++generation;$('start').disabled=true;$('error').textContent='';$('metrics').textContent='等待辨識';found=lost=frames=0;lastFrame=performance.now();
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('此瀏覽器無法使用相機，請用 Safari 開啟 HTTPS 網址。');
  active=true;$('welcome').hidden=true;$('hud').hidden=false;status('正在啟動相機…');
  ar=new MindARThree({container:$('camera'),imageTargetSrc:'./marker.mind',maxTrack:1,uiLoading:'no',uiScanning:'no',uiError:'no'});
  ar.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const anchor=ar.addAnchor(0);
  station=createStation(THREE,stationData);anchor.group.add(station.root);window.testState.station=station;
  anchor.onTargetFound=()=>{found++;window.testState.tracking=true;status('已辨識標記');};
  anchor.onTargetLost=()=>{lost++;window.testState.tracking=false;status('標記遺失，請重新對準');};
  await selectModel(anchor);
  $('character').onchange=()=>selectModel(anchor).catch(e=>status('角色載入失敗：'+e.message));
  if(run!==generation)return;const current=ar;await current.start();
  if(run!==generation){current.controller?.stopProcessVideo();current.video?.srcObject?.getTracks().forEach(t=>t.stop());return;}
  status('尋找標記，請讓整張圖案入鏡');
  let previous=performance.now(), lastMotion=0;
  current.renderer.setAnimationLoop(()=>{frames++;const now=performance.now();if(window.testState.tracking)model?.animation.update((now-previous)/1000);previous=now;if(now-lastMotion>100){showMotion();lastMotion=now;}if(now-lastFrame>1000){$('metrics').textContent=`${Math.round(frames*1000/(now-lastFrame))} FPS · 辨識 ${found} 次 · 遺失 ${lost} 次 · ${innerWidth}×${innerHeight}`;frames=0;lastFrame=now;}current.renderer.render(current.scene,current.camera);});
 }catch(e){if(run!==generation)return;end();$('error').textContent=`無法啟動：${e?.message || '相機權限未允許或相機無法啟動'}\n若拒絕相機權限，請在 Safari 網站設定允許相機後重試。`;}
};
for(const id of ['placement','point','station-scale','station-x','station-y'])$(id).oninput=applyPlacement;
$('slot').onchange=updatePoints;
$('reset-placement').onclick=()=>{for(const [id,value] of [['station-scale',1],['station-x',0],['station-y',0]])$(id).value=value;applyPlacement();};
$('stop').onclick=end;$('scale').oninput=applyScale;
for(const button of document.querySelectorAll('[data-action]'))button.onclick=()=>{
 selectedAction=button.dataset.action;
 for(const other of document.querySelectorAll('[data-action]'))other.setAttribute('aria-pressed',String(other===button));
 model?.animation.play(selectedAction);showMotion();
};
window.addEventListener('pagehide',()=>{if(active)end();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)end();});
try{
 clips=await loadAnimations();
 const stationResponse=await fetch('./station.json?v=0.3.0');if(!stationResponse.ok)throw new Error('車站站位讀取失敗');stationData=await stationResponse.json();
 stationData.routes.forEach((r,i)=>{const option=document.createElement('option');option.value=i;option.textContent=`站位 ${r.generator}${r.generator>=15?'（排隊）':''}`;$('slot').append(option);});updatePoints();
 const response=await fetch('./characters/manifest.json');if(!response.ok)throw new Error('角色清單讀取失敗');const entries=await response.json();
 for(const entry of entries){const option=document.createElement('option');option.value=entry.name;option.textContent=entry.name.replace('plakids_','').toUpperCase();$('character').append(option);}
 await getModel(entries[0].name);$('start').disabled=false;$('start').textContent='啟動 AR 相機';window.testState.ready=true;
}catch(e){$('error').textContent=e.message;}
