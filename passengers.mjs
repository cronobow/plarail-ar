// 參數取自 PlakidsInfo 與 goPlakids／PlakidsManager 的 ARM64 實作。
// 世界座標沿 X 鏡射；速度和時間保留原值，標記換算由 renderer 處理。
export const RULES=Object.freeze({spawnSeconds:10,populationThreshold:10,walkSpeed:2,rideSpeed:1,rideEndZ:13,arrivalEpsilon:.05,neutral:[1,8],talk:[2,5],attention:[2,4],preRideWait:1,fadeSeconds:1,queue:[[16,15,5],[17,6],[18,7]],riding:[5,6,7,15,16,17,18],drivers:[4,8,11],linemen:[0,1],backyard:[13,14],facePositions:[2,3,9,10,12]});
export const CHARACTERS=['a1','a2','a3','b1','b2','b3','c1','d1','h1','h2','e1','e2','f1','g1','g2'];
export function timeOfDay(hour){return hour>=5&&hour<11?'朝':hour>=11&&hour<18?'昼':'晩';}
const distance=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
export class Passengers {
 constructor(routes,dialogs,{random=Math.random,hour=()=>new Date().getHours(),faces=[]}={}){
  this.routes=routes;this.dialogs=dialogs;this.random=random;this.hour=hour;this.faces=faces;this.people=[];this.events=[];this.elapsed=0;this.spawnClock=0;this.mode='Normal';this.tracking=false;this.serial=0;
 }
 pick(list){return list[Math.min(list.length-1,Math.floor(this.random()*list.length))];}
 range([min,max]){return min+(max-min)*this.random();}
 availableCharacters(){return CHARACTERS.filter(c=>!this.people.some(p=>p.character===c));}
 availableSlots(slots){return slots.filter(s=>!this.people.some(p=>p.slot===s));}
 create(character,slot,permanent=false){
  if(!character||slot===undefined||this.people.some(p=>p.slot===slot||p.character===character))return null;
  const path=this.routes[slot];if(!path?.length)return null;
  const p={id:++this.serial,character,slot,path,position:[...path[0]],state:'Neutral',time:0,wait:this.range(RULES.neutral),alpha:0,permanent,point:0,target:0,angle:0,dialog:null,talkCooldown:0};
  this.people.push(p);this.events.push({type:'create',person:p});return p;
 }
 initialize(){
  for(const c of this.faces.filter(c=>['a1','h2','b2'].includes(c)))this.create(c,this.pick(this.availableSlots(RULES.facePositions)),true);
  const ordinary=()=>this.pick(this.availableCharacters().filter(c=>CHARACTERS.indexOf(c)<10));
  this.create(ordinary(),this.pick(RULES.backyard));
  for(const slot of [5,6,7])this.create(ordinary(),slot);
  this.create('f1',this.pick(RULES.drivers),true);
  const extra=1+Math.floor(this.random()*2);for(let i=0;i<extra;i++)this.spawn();
 }
 spawn(){
  const available=this.availableCharacters();if(!available.length)return;
  const c=this.pick(available),id=CHARACTERS.indexOf(c);
  const slots=id>=10&&id<=12?RULES.drivers:id>=13?RULES.linemen:[2,3,5,6,7,9,10,12,13,14];
  return this.create(c,this.pick(this.availableSlots(slots)),id>=10&&id<=12);
 }
 state(p,state){p.state=state;p.time=0;p.dialog=null;if(state==='Neutral')p.wait=this.range(RULES.neutral);if(state==='Looking')p.wait=1.9666667+this.range([0,2]);this.events.push({type:'state',person:p});}
 setTracking(value){
  this.tracking=value;
  if(!value){for(const p of this.people){p.dialog=null;if(['Attention','Guide','Talk','Spoken'].includes(p.state))this.state(p,'Neutral');}this.events.push({type:'lost'});}
 }
 action(p){
  const n=Math.floor(this.random()*100);
  if(n<50){p.target=Math.floor(this.random()*p.path.length);this.state(p,'Walk');}
  else if(n<95)this.state(p,'Looking');
  else if(!p.permanent)this.state(p,'Exit');
  else this.state(p,'Neutral');
 }
 message(p){
  const list=this.dialogs.filter(d=>d.character.toLowerCase()===p.character&&d.state===(this.mode==='Normal'?'通常':'電車待ち')&&d.time===timeOfDay(this.hour()));
  return this.pick(list)?.ja.replace(/\\n/g,'\n')||'';
 }
 touch(id){
  const p=this.people.find(p=>p.id===id);
  if(!this.tracking||!p||['Ride','Exit','PreRide'].includes(p.state))return false;
  this.state(p,'Guide');p.dialog=this.message(p);p.wait=5;this.events.push({type:'dialog',person:p});return true;
 }
 lineUp(){
  if(!this.tracking||this.mode!=='Normal')return false;
  this.mode='PreRide';
  for(const slot of RULES.riding){
   let p=this.people.find(p=>p.slot===slot);
   if(!p)p=this.create(this.pick(this.availableCharacters().filter(c=>CHARACTERS.indexOf(c)<10)),slot);
   if(!p)continue;
   p.target=0;p.point=this.nearest(p);p.ready=false;this.state(p,'PreRide');
  }
  this.events.push({type:'lineup'});return true;
 }
 board(){
  if(!this.tracking||this.mode!=='Ready')return false;
  this.mode='Ride';
  for(const p of this.people.filter(p=>RULES.riding.includes(p.slot)))this.state(p,'Ride');
  this.events.push({type:'board'});return true;
 }
 nearest(p){let best=0;for(let i=1;i<p.path.length;i++)if(distance(p.position,p.path[i])<distance(p.position,p.path[best]))best=i;return best;}
 move(p,dt){
  const end=p.path[p.point];const d=distance(p.position,end);
  if(d<RULES.arrivalEpsilon){p.position=[...end];if(p.point===p.target)return true;p.point+=Math.sign(p.target-p.point);return false;}
  const delta=end.map((v,i)=>v-p.position[i]);p.angle=Math.atan2(delta[0],delta[2]);
  const step=Math.min(1,RULES.walkSpeed*dt/d);p.position=p.position.map((v,i)=>v+delta[i]*step);return false;
 }
 remove(p){this.people=this.people.filter(x=>x!==p);this.events.push({type:'remove',person:p});}
 update(dt){
  if(!this.tracking||!Number.isFinite(dt)||dt<=0)return;
  this.elapsed+=dt;
  for(const p of [...this.people]){
   p.time+=dt;p.talkCooldown=Math.max(0,p.talkCooldown-dt);p.alpha=Math.min(1,p.alpha+dt/RULES.fadeSeconds);
   switch(p.state){
    case 'Neutral':if(p.time>=p.wait)this.action(p);break;
    case 'Walk':if(this.move(p,dt))this.state(p,'Neutral');break;
    case 'Looking':if(p.time>=p.wait)this.state(p,'Neutral');break;
    case 'Talk':case 'Spoken':if(p.time>=p.wait){p.talkCooldown=3;this.state(p,'Neutral');}break;
    case 'Attention':if(p.time>=p.wait)this.state(p,'Neutral');break;
    case 'Guide':if(p.time>=p.wait)this.state(p,'Neutral');break;
    case 'PreRide':if(!p.ready){if(this.move(p,dt)){p.ready=true;p.time=0;p.angle=0;}}break;
    case 'Ride':p.position[2]+=RULES.rideSpeed*dt;p.angle=0;if(p.position[2]>=RULES.rideEndZ)this.remove(p);break;
    case 'Exit':p.alpha=Math.max(0,1-p.time/RULES.fadeSeconds);if(p.alpha===0)this.remove(p);break;
   }
  }
  if(this.mode==='PreRide'&&this.people.filter(p=>RULES.riding.includes(p.slot)).every(p=>p.ready&&p.time>=RULES.preRideWait)){this.mode='Ready';this.events.push({type:'ready'});}
  if(this.mode==='Ride'&&!this.people.some(p=>RULES.riding.includes(p.slot))){this.mode='Normal';this.spawnClock=0;this.events.push({type:'departed'});}
  if(this.mode==='Normal'){
   this.spawnClock+=dt;
   if(this.spawnClock>=RULES.spawnSeconds){this.spawnClock=0;this.spawn();}
   if(this.people.length<RULES.populationThreshold)this.spawnClock=RULES.spawnSeconds;
   // 原版 CheckTalk 搜尋近距離乘客；兩人分別進入 Talk／Spoken。
   for(const p of this.people.filter(p=>p.state==='Neutral'&&p.talkCooldown===0&&p.time>3)){
    const other=this.people.find(q=>q!==p&&q.state==='Neutral'&&q.talkCooldown===0&&distance(q.position,p.position)<3);
    if(other){this.state(p,'Talk');this.state(other,'Spoken');p.wait=other.wait=this.range(RULES.talk);p.dialog=this.message(p);p.angle=Math.atan2(other.position[0]-p.position[0],other.position[2]-p.position[2]);other.angle=p.angle+Math.PI;}
   }
  }
 }
 drain(){return this.events.splice(0);}
}
