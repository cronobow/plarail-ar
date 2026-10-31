import * as THREE from 'three';

let sdkPromise;
export function loadWorldTracking() {
 if(sdkPromise)return sdkPromise;
 sdkPromise=new Promise((resolve,reject)=>{
  let script,timer;
  const cleanup=()=>{clearTimeout(timer);window.removeEventListener('xrloaded',loaded);};
  const failed=()=>{cleanup();script?.remove();reject(new Error('空間追蹤引擎載入失敗，請重新載入後再試。'));};
  const loaded=()=>{cleanup();resolve(window.XR8);};
  if(window.XR8){loaded();return;}
  // XR8 的 Three.js 配接器使用全域 THREE；與角色及場景共用同一版本。
  window.THREE=THREE;
  window.addEventListener('xrloaded',loaded);
  script=document.createElement('script');script.src='./vendor/xr8/xr.js';script.async=true;
  script.onerror=failed;timer=setTimeout(failed,45000);document.head.append(script);
 }).then(async XR8=>{
  let timer;
  await Promise.race([XR8.loadChunk('slam'),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('空間追蹤素材載入逾時，請重新載入後再試。')),45000);})]).finally(()=>clearTimeout(timer));
  return XR8;
 }).catch(error=>{sdkPromise=null;throw error;});
 return sdkPromise;
}
export function requestMotionPermission() {
 // 兩種感測器的權限皆在同一次使用者手勢內請求。
 return Promise.all([window.DeviceOrientationEvent,window.DeviceMotionEvent].map(type=>{
  if(!type?.requestPermission)return;
  return type.requestPermission().then(result=>{
   if(result!=='granted')throw new Error('請允許動作與方向存取，才能在圖樣離鏡後持續定位。');
  });
 }));
}

// placement 位於 SLAM 世界座標。離鏡不改矩陣，鏡頭則持續由 XR8 更新。
export class WorldTracking {
 constructor(XR8,{container,target,onChange=()=>{},onFrame=()=>{},onError=()=>{}}) {
  Object.assign(this,{XR8,container,target,onChange,onFrame,onError});
  this.placement=new THREE.Group();this.placement.matrixAutoUpdate=false;this.placement.visible=false;
  this.placed=false;this.tracking=false;this.status='LIMITED';this.closed=false;
  this.canvas=document.createElement('canvas');this.canvas.className='world-camera';
  container.append(this.canvas);
 }
 image({detail}) {
  if(this.closed||detail.name!==this.target.name)return;
  const {position:p,rotation:q,scale,scaledWidth}=detail;
  const width=scale*scaledWidth*this.target.metadata.markerWidthToTargetWidth;
  if(!p||!q||![p.x,p.y,p.z,q.x,q.y,q.z,q.w,width].every(Number.isFinite)||width<=0)return;
  // 以 target metadata 換算，1 單位為完整原始 marker 寬度。
  this.placement.matrix.compose(new THREE.Vector3(p.x,p.y,p.z),new THREE.Quaternion(q.x,q.y,q.z,q.w).normalize(),new THREE.Vector3(width,width,width));
  this.placement.matrixWorldNeedsUpdate=true;this.placement.visible=true;
  this.tracking=true;this.placed=true;this.onChange(this);
 }
 start() {
  const XR8=this.XR8;
  return new Promise((resolve,reject)=>{
   if(!XR8.XrDevice.isDeviceBrowserCompatible({allowedDevices:XR8.XrConfig.device().MOBILE})){
    reject(new Error('空間追蹤需要手機或平板，請用 iPhone／iPad Safari 或 Android Chrome 開啟。'));return;
   }
   this.rejectStart=reject;
   const failure=error=>{if(this.closed)return;clearTimeout(this.timer);const e=error instanceof Error?error:new Error(String(error));reject(e);this.onError(e);};
   this.timer=setTimeout(()=>failure(new Error('相機或空間追蹤啟動逾時，請返回選單後重試。')),45000);
   XR8.XrController.configure({disableWorldTracking:false,imageTargetData:[this.target],enableWorldPoints:false,scale:'responsive'});
   XR8.Threejs.configure({renderCameraTexture:false});
   const size=()=>{const ratio=Math.min(devicePixelRatio,2);this.canvas.width=Math.round(innerWidth*ratio);this.canvas.height=Math.round(innerHeight*ratio);};
   size();this.resize=size;window.addEventListener('resize',size);
   XR8.addCameraPipelineModules([
    XR8.GlTextureRenderer.pipelineModule(),XR8.Threejs.pipelineModule(),XR8.XrController.pipelineModule(),
    {name:'plarail-world',
     onStart:()=>{
      if(this.closed)return;
      Object.assign(this,XR8.Threejs.xrScene());this.scene.add(this.placement);
      XR8.XrController.updateCameraProjectionMatrix({origin:this.camera.position,facing:this.camera.quaternion});
      this.previous=performance.now();clearTimeout(this.timer);resolve();
     },
     onUpdate:({processCpuResult})=>{
      if(this.closed||!this.camera)return;
      const status=processCpuResult?.reality?.trackingStatus;
      if(status&&status!==this.status){this.status=status;this.onChange(this);}
      const now=performance.now(),dt=Math.min((now-this.previous)/1000,.1);this.previous=now;
      this.onFrame(dt,this.camera);
     },
     onCameraStatusChange:({status})=>{if(status==='failed')failure(new Error('無法開啟相機，請確認瀏覽器相機權限。'));},
     onException:failure,
     listeners:[
      {event:'reality.imagefound',process:event=>this.image(event)},
      {event:'reality.imageupdated',process:event=>this.image(event)},
      {event:'reality.imagelost',process:({detail})=>{if(!this.closed&&detail.name===this.target.name){this.tracking=false;this.onChange(this);}}},
     ],
    },
   ]);
   Promise.resolve(XR8.run({canvas:this.canvas,allowedDevices:XR8.XrConfig.device().MOBILE})).catch(failure);
  });
 }
 stop() {
  if(this.closed)return;
  this.closed=true;clearTimeout(this.timer);window.removeEventListener('resize',this.resize);
  this.rejectStart?.(new Error('已結束相機'));
  this.XR8.stop();this.XR8.clearCameraPipelineModules();
  this.renderer?.dispose();this.renderer?.forceContextLoss();this.canvas.remove();
  this.placed=false;this.tracking=false;this.placement.visible=false;
 }
}
