// 原始 Unity streamed curve: a*dt³ + b*dt² + c*dt + value。
export function sampleComponent(component, time) {
 if (component.kind === 'constant') return component.value;
 const keys = component.keys;
 let key = keys[0];
 for (const next of keys) { if (next.time > time) break; key = next; }
 const [a,b,c,value] = key.coefficients;
 // Unity 的負無限 sentinel 儲存曲線第一個有效值。
 if (key.time < -1e30) return value;
 const dt = Math.max(0, time-key.time);
 return ((a*dt+b)*dt+c)*dt+value;
}

export async function loadAnimations() {
 const clips = await Promise.all(['WALK','LOOKING'].map(async name => {
  const response = await fetch(new URL(`./animations/${name}.json`, import.meta.url));
  if (!response.ok) throw new Error(`動畫 ${name} 讀取失敗`);
  return response.json();
 }));
 return Object.fromEntries(clips.map(clip => [clip.name, clip]));
}

export class CharacterAnimation {
 constructor(root, clips) {
  this.clips = clips;
  this.nodes = new Map();
  const bind = (node, path) => {
   this.nodes.set(path, {node, position:node.position.clone(), quaternion:node.quaternion.clone(), scale:node.scale.clone()});
   for (const child of node.children) bind(child, `${path}/${child.name}`);
  };
  const body = root.getObjectByName('plakids_dou');
  if (!body) throw new Error('找不到角色動畫根節點');
  bind(body, 'plakids_dou');
  for (const clip of Object.values(clips)) for (const track of clip.tracks) {
   if (!this.nodes.has(track.path)) throw new Error(`缺少動畫節點：${track.path}`);
  }
  this.play('REST');
 }
 play(name) {
  if (name !== 'REST' && !this.clips[name]) throw new Error(`未知動畫：${name}`);
  this.name = name; this.elapsed = 0;
  for (const {node,position,quaternion,scale} of this.nodes.values()) {
   node.position.copy(position); node.quaternion.copy(quaternion); node.scale.copy(scale);
  }
  this.update(0);
 }
 update(delta) {
  const clip = this.clips[this.name];
  if (!clip) return;
  this.elapsed += Math.max(0, delta);
  const duration = clip.stop-clip.start;
  const time = clip.start + (clip.loop ? this.elapsed % duration : Math.min(this.elapsed,duration));
  for (const track of clip.tracks) {
   const {node} = this.nodes.get(track.path);
   const v = track.components.map(c => sampleComponent(c,time));
   // 與 GLB 匯出器相同的 Unity → glTF X 鏡射。
   if (track.property === 'translation') node.position.set(-v[0],v[1],v[2]);
   else if (track.property === 'rotation') node.quaternion.set(v[0],-v[1],-v[2],v[3]).normalize();
   else if (track.property === 'scale') node.scale.fromArray(v);
  }
 }
}
