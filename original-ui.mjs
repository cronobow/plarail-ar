import {localizedImage,imageKey,IMAGE_LABELS,IMAGE_BOUNDS} from './localization.mjs?v=1.1.0';
import {sampleComponent} from './animation.mjs?v=1.0.0';
// 直接使用 APK RectTransform、Sprite、active flag 與 Button event。
const labels={OnClickControlModeButton:'AR 車站',OnClickMortormanModeButton:'拍照換臉',OnClickHowtoButton:'玩法說明',OnClickAppOptionButton:'設定',OnClickNewInfoButton:'最新消息',OnClickPreRideButton:'排隊',OnClickRideButton:'上車',OnClickVoiceButton:'月台語音',OnClickSEButton:'車站廣播',OnClickNext:'下一頁',OnClickPrev:'上一頁',OnClickShootingButton:'拍照',OnClickCameraChangeButton:'切換相機',OnClickNextFaceCamera:'製作角色臉孔',OnClickYesButton:'開始',OnClickCancel:'取消',OnClickOk:'確認',OnClickAgreement:'使用規約',OnClickPrivasy:'隱私說明',OnClickDownloadURL:'下載辨識圖',OnClickSupportApp:'應用程式支援',OnClickSupportToy:'玩具支援'};
export class OriginalUI {
 constructor(host,data,dispatch,clips={}){this.host=host;this.data=data;this.dispatch=dispatch;this.clips=clips;this.elements=new Map();this.layout=new Map();this.groups=[];}
 show(scene){
  this.scene=String(scene);this.host.replaceChildren();this.elements.clear();this.layout.clear();this.groups=[];this.started=performance.now();this.host.classList.toggle('ar-ui',this.scene==='4');
  if(this.scene==='4'){this.showAR();return;}
  const d=this.data[this.scene], byId=new Map(d.nodes.map(n=>[n.transform,n]));
  this.host.style.width=d.reference[0]+'px';this.host.style.height=d.reference[1]+'px';
  this.reference=d.reference;document.body.style.backgroundImage=d.background?`url('${d.background}')`:'none';document.body.style.backgroundSize='512px';
  const build=(id,parent,pw,ph,isRoot=false,cell=null)=>{
   const n=byId.get(id);if(!n)return;
   const el=document.createElement(n.button?'button':'div');el.className='unity-node';el.dataset.go=n.id;el.dataset.name=n.name;
   this.elements.set(n.id,el);el.hidden=!n.active;
   let w=(n.anchorMax.x-n.anchorMin.x)*pw+n.size.x,h=(n.anchorMax.y-n.anchorMin.y)*ph+n.size.y;
   if(isRoot){w=pw;h=ph;Object.assign(el.style,{left:'0px',bottom:'0px'});}
   else Object.assign(el.style,{left:(n.anchorMin.x*pw+n.position.x-n.pivot.x*n.size.x)+'px',bottom:(n.anchorMin.y*ph+n.position.y-n.pivot.y*n.size.y)+'px',transform:`scale(${n.scale.x},${n.scale.y})`,transformOrigin:`${n.pivot.x*100}% ${(1-n.pivot.y)*100}%`});
   if(cell){w=cell.w;h=cell.h;el.style.left=cell.x+'px';el.style.bottom=cell.y+'px';}
   Object.assign(el.style,{width:Math.max(0,w)+'px',height:Math.max(0,h)+'px'});
   this.layout.set(n.id,{node:n,left:parseFloat(el.style.left),bottom:parseFloat(el.style.bottom),scale:[n.scale.x,n.scale.y],rotation:0});
   if(n.image&&(!n.mask||n.maskGraphic)){
    if(n.image.url){const url=localizedImage(n.image.url);const border=n.image.border,sliced=n.image.type===1&&border&&Object.values(border).some(v=>v>0);const img=sliced?document.createElement('div'):new Image();if(sliced){img.classList.add('sliced');img.style.borderStyle='solid';img.style.borderWidth=`${border.w}px ${border.z}px ${border.y}px ${border.x}px`;img.style.borderImageSource=`url('${url}')`;img.style.borderImageSlice=`${border.w} ${border.z} ${border.y} ${border.x} fill`;}else img.src=url;img.draggable=false;img.alt=n.button?'':(IMAGE_LABELS[imageKey(n.image.url)]||'');img.classList.add('unity-sprite');img.style.objectFit=n.image.preserveAspect?'contain':'fill';img.style.opacity=n.image.color.a;
    const bounds=IMAGE_BOUNDS[imageKey(n.image.url)];
    if(bounds&&!sliced){const [iw,ih,x,y,cw,ch]=bounds,scale=Math.min(w/cw,h/ch);Object.assign(img.style,{inset:'auto',width:iw*scale+'px',height:ih*scale+'px',left:((w-cw*scale)/2-x*scale)+'px',top:((h-ch*scale)/2-y*scale)+'px',objectFit:'fill'});}
    el.append(img);}
    else{const c=n.image.color;el.style.background=`rgba(${c.r*255},${c.g*255},${c.b*255},${c.a})`;}
   }
   if(n.text){const text=document.createElement('span');text.className='unity-text';text.textContent=n.text.value;text.style.fontSize=n.text.size+'px';const c=n.text.color;text.style.color=`rgba(${c.r*255},${c.g*255},${c.b*255},${c.a})`;text.style.textAlign=['left','center','right'][n.text.align%3];el.append(text);}
   if(n.mask)el.style.overflow='hidden';
   if(n.button){
    const event=n.button.find(e=>e.method!=='OnShow');
    el.dataset.action=event?.method||'dialog';el.setAttribute('aria-label',labels[event?.method]||(n.name.includes('Back')?'返回':n.name));
    el.onclick=e=>{e.stopPropagation();if(event)this.dispatch(event,n);};
   }
   parent.append(el);
   const children=n.children.filter(id=>byId.has(id));
   if(n.grid){const g=n.grid,cw=g.m_CellSize.x,ch=g.m_CellSize.y,gx=g.m_Spacing.x,gy=g.m_Spacing.y;const cols=Math.max(1,Math.floor((w+gx)/(cw+gx))),rows=Math.ceil(children.length/cols),x=(w-Math.min(cols,children.length)*(cw+gx)+gx)/2,y=(h-rows*(ch+gy)+gy)/2;
    children.forEach((child,i)=>build(child,el,w,h,false,{w:cw,h:ch,x:x+(i%cols)*(cw+gx),y:h-y-ch-Math.floor(i/cols)*(ch+gy)}));
   }else {for(const child of children)build(child,el,w,h);if(n.horizontal)this.groups.push({node:n,children:children.map(id=>byId.get(id).id),width:w,height:h});}
  };
  for(const id of d.roots)build(id,this.host,...d.reference,true);
  this.reflow();this.resize();
 }
 // AR 使用螢幕邊緣版面；保留原節點 ID、按鈕事件及遊戲狀態切換。
 showAR(){
  this.reference=null;this.host.removeAttribute('style');document.body.style.backgroundImage='none';
  const nodes=this.data['4'].nodes;
  const region=name=>{const el=document.createElement('div');el.className=name;this.host.append(el);return el;};
  const top=region('ar-top'),hints=region('ar-hints'),bottom=region('ar-bottom');
  const add=(id,parent,text=null)=>{
   const n=nodes.find(n=>n.id===id),event=n.button?.find(e=>e.method!=='OnShow');
   const el=document.createElement(event?'button':'div');el.dataset.go=id;el.dataset.name=n.name;el.hidden=!n.active;
   if(event){
    el.className='ar-button';el.dataset.action=event.method;el.setAttribute('aria-label',labels[event.method]||'返回');el.onclick=e=>{e.stopPropagation();this.dispatch(event,n);};
    const img=new Image();img.src=localizedImage(n.image.url);img.alt='';img.draggable=false;
    const bounds=IMAGE_BOUNDS[imageKey(n.image.url)];
    if(bounds){const [iw,ih,x,y,cw,ch]=bounds;Object.assign(img.style,{width:iw/cw*100+'%',height:ih/ch*100+'%',left:-x/cw*100+'%',top:-y/ch*100+'%'});}
    el.append(img);
   }else{el.className='ar-hint';el.textContent=text||IMAGE_LABELS[imageKey(n.image.url)];}
   this.elements.set(id,el);parent.append(el);return el;
  };
  const imageHint=(id,sourceId,parent,className)=>{
   const source=nodes.find(n=>n.id===sourceId),key=imageKey(source.image.url);
   const el=add(id,parent,IMAGE_LABELS[key]);el.className='ar-image-hint '+className;el.replaceChildren();
   const img=new Image();img.src=localizedImage(source.image.url);img.alt=IMAGE_LABELS[key];img.draggable=false;
   const [iw,ih,x,y,cw,ch]=IMAGE_BOUNDS[key];
   el.style.aspectRatio=`${cw}/${ch}`;
   Object.assign(img.style,{width:iw/cw*100+'%',height:ih/ch*100+'%',left:-x/cw*100+'%',top:-y/ch*100+'%'});el.append(img);
  };
  add(96,top).classList.add('ar-back');imageHint(83,83,top,'ar-caution-image');
  const scan=region('ar-scan-group');scan.dataset.go='9';scan.hidden=true;this.elements.set(9,scan);
  const stationmaster=new Image();stationmaster.className='ar-stationmaster';stationmaster.src=nodes.find(n=>n.id===92).image.url;stationmaster.alt='站長';stationmaster.draggable=false;scan.append(stationmaster);
  imageHint(67,67,scan,'ar-scan-image');add(61,hints);add(3,hints);
  const boarding=document.createElement('div');boarding.className='ar-boarding';bottom.append(boarding);
  add(82,boarding);add(40,boarding);add(48,bottom);add(69,bottom);
 }
 reflow(){for(const group of this.groups){
  const g=group.node.horizontal,p=g.m_Padding,children=group.children.filter(id=>!this.elements.get(id).hidden);if(!children.length)continue;
  const sizes=children.map(id=>this.layout.get(id).node.size),available=group.width-p.m_Left-p.m_Right,spacing=g.m_Spacing,total=sizes.reduce((a,s)=>a+s.x,0)+spacing*(children.length-1),extra=Math.max(0,available-total),cellExtra=g.m_ChildForceExpandWidth?extra/children.length:0;
  let x=p.m_Left+(g.m_ChildForceExpandWidth?0:extra*(g.m_ChildAlignment%3)/2);
  children.forEach((id,i)=>{const el=this.elements.get(id),size=sizes[i];el.style.left=(x+cellExtra/2)+'px';el.style.bottom=((group.height-size.y)/2)+'px';x+=size.x+cellExtra+spacing;});
 }}
 resize(){if(!this.reference)return;const [w,h]=this.reference;const scale=Math.min(innerWidth/w,innerHeight/h);this.host.style.transform=`translate(-50%,-50%) scale(${scale})`;}
 visible(id,show){const el=this.elements.get(id);if(el&&el.hidden===show){el.hidden=!show;this.reflow();}}
 image(id,url){url=localizedImage(url);const img=this.elements.get(id)?.querySelector(':scope > .unity-sprite');if(img){if(img.tagName==='IMG')img.src=url;else img.style.borderImageSource=`url('${url}')`;}}
 animate(now,lineup=false){
  const seconds=(now-this.started)/1000;
  for(const [name,clip]of Object.entries(this.clips)){
   if(String(clip.scene)!==this.scene)continue;
   if(this.scene==='4'&&name!=='textRogoReading'&&!(lineup&&name==='AlignmentAnimationWait'))continue;
   const time=clip.loop?seconds%clip.duration:Math.min(seconds,clip.duration);
   for(const track of clip.tracks){const item=this.layout.get(track.go),el=this.elements.get(track.go);if(!item||!el)continue;const v=track.components.map(c=>sampleComponent(c,time)),n=item.node;
    switch(track.attribute){
     case 3:item.scale=[v[0],v[1]];break;
     case 4:item.rotation=-v[2];break;
     case 1460864421:el.style.left=(item.left+v[0]-n.position.x)+'px';break;
     case 538195251:el.style.bottom=(item.bottom+v[0]-n.position.y)+'px';break;
     case 2015549526:if(clip.sprites[Math.round(v[0])])this.image(track.go,clip.sprites[Math.round(v[0])]);break;
     case 304273561:el.style.opacity=v[0];break;
     case 2086281974:el.hidden=v[0]<.5;break;
    }
    el.style.transform=`scale(${item.scale[0]},${item.scale[1]}) rotate(${item.rotation}deg)`;
   }
  }
 }
}
