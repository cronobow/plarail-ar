import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MindARThree} from './vendor/mindar-image-three.prod.js';
import {CharacterAnimation,loadAnimations} from './animation.mjs';
const $=id=>document.getElementById(id);
let ar=null, active=false, generation=0, model=null, found=0, lost=0, frames=0, lastFrame=0;
const cache=new Map(), loader=new GLTFLoader();
let clips;
window.testState={ready:false,tracking:false};
function status(text){$('state').textContent=text;}
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
async function selectModel(anchor){const ticket=++selection;const next=await getModel($('character').value);if(ticket!==selection||!active)return;if(model)anchor.group.remove(model);model=next;model.animation.play($('action').value);anchor.group.add(model);applyScale();}
function end(){generation++;selection++;active=false;if(ar){ar.renderer.setAnimationLoop(null);ar.controller?.stopProcessVideo();ar.video?.srcObject?.getTracks().forEach(t=>t.stop());ar.video?.remove();window.removeEventListener('resize',ar.resizeHandler);ar.renderer.dispose();ar.renderer.forceContextLoss();ar=null;}$('camera').replaceChildren();model=null;$('hud').hidden=true;$('welcome').hidden=false;$('start').disabled=false;$('start').textContent='啟動 AR 相機';window.testState.tracking=false;}
$('start').onclick=async()=>{
 const run=++generation;$('start').disabled=true;$('error').textContent='';$('metrics').textContent='等待辨識';found=lost=frames=0;lastFrame=performance.now();
 try{
  if(!navigator.mediaDevices?.getUserMedia)throw new Error('此瀏覽器無法使用相機，請用 Safari 開啟 HTTPS 網址。');
  active=true;$('welcome').hidden=true;$('hud').hidden=false;status('正在啟動相機…');
  ar=new MindARThree({container:$('camera'),imageTargetSrc:'./marker.mind',maxTrack:1,uiLoading:'no',uiScanning:'no',uiError:'no'});
  ar.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  const anchor=ar.addAnchor(0);
  anchor.onTargetFound=()=>{found++;window.testState.tracking=true;status('已辨識標記');};
  anchor.onTargetLost=()=>{lost++;window.testState.tracking=false;status('標記遺失，請重新對準');};
  await selectModel(anchor);
  $('character').onchange=()=>selectModel(anchor).catch(e=>status('角色載入失敗：'+e.message));
  if(run!==generation)return;const current=ar;await current.start();
  if(run!==generation){current.controller?.stopProcessVideo();current.video?.srcObject?.getTracks().forEach(t=>t.stop());return;}
  status('尋找標記，請讓整張圖案入鏡');
  let previous=performance.now();
  current.renderer.setAnimationLoop(()=>{frames++;const now=performance.now();if(window.testState.tracking)model?.animation.update((now-previous)/1000);previous=now;if(now-lastFrame>1000){$('metrics').textContent=`${Math.round(frames*1000/(now-lastFrame))} FPS · 辨識 ${found} 次 · 遺失 ${lost} 次 · ${innerWidth}×${innerHeight}`;frames=0;lastFrame=now;}current.renderer.render(current.scene,current.camera);});
 }catch(e){if(run!==generation)return;end();$('error').textContent=`無法啟動：${e?.message || '相機權限未允許或相機無法啟動'}\n若拒絕相機權限，請在 Safari 網站設定允許相機後重試。`;}
};
$('stop').onclick=end;$('scale').oninput=applyScale;
$('action').onchange=()=>model?.animation.play($('action').value);
$('replay').onclick=()=>model?.animation.play($('action').value);
window.addEventListener('pagehide',()=>{if(active)end();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&active)end();});
try{
 clips=await loadAnimations();
 const response=await fetch('./characters/manifest.json');if(!response.ok)throw new Error('角色清單讀取失敗');const entries=await response.json();
 for(const entry of entries){const option=document.createElement('option');option.value=entry.name;option.textContent=entry.name.replace('plakids_','').toUpperCase();$('character').append(option);}
 await getModel(entries[0].name);$('start').disabled=false;$('start').textContent='啟動 AR 相機';window.testState.ready=true;
}catch(e){$('error').textContent=e.message;}
