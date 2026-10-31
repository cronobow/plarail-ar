// 使用原始父子鏈建立站位；校正層獨立於 APK 資料，不改寫原座標。
export function createStation(THREE, data) {
 const root = new THREE.Group(), basis = new THREE.Group();
 root.add(basis);
 basis.rotation.x = Math.PI / 2;
 // 初始假設：Trackable 的 17.5 單位對應一個標記寬；仍待實體校正。
 basis.scale.setScalar(1 / 17.5);
 const nodes = new Map();
 for (const t of data.transforms) {
  const n = new THREE.Group(), p=t.position, q=t.rotation, s=t.scale;
  n.name=t.name;n.position.set(-p.x,p.y,p.z);n.quaternion.set(q.x,-q.y,-q.z,q.w);n.scale.set(s.x,s.y,s.z);
  nodes.set(t.transform_id,n);
 }
 for (const t of data.transforms) {
  const parent=t.parent_transform_id ? nodes.get(t.parent_transform_id) : basis;
  if (!parent) throw new Error(`站位缺少父節點：${t.parent_transform_id}`);
  parent.add(nodes.get(t.transform_id));
 }
 root.updateMatrixWorld(true);
 // 可視化使用標記寬度單位，避免原始節點 scale 影響診斷球的大小。
 const guides=new THREE.Group();root.add(guides);
 const points=data.routes.map(r=>({generator:r.generator,points:r.points.map(id=>{
  const n=nodes.get(id);if(!n)throw new Error(`站位缺少節點：${id}`);
  return {id,name:n.name,position:n.getWorldPosition(new THREE.Vector3()),quaternion:n.getWorldQuaternion(new THREE.Quaternion())};
 })}));
 const geometry=new THREE.SphereGeometry(0.025,8,6), material=new THREE.MeshBasicMaterial({color:0xffd54f});
 const lineMaterial=new THREE.LineBasicMaterial({color:0x5ee8cf});
 for(const route of points){
  for(const point of route.points){const dot=new THREE.Mesh(geometry,material);dot.position.copy(point.position);guides.add(dot);}
  if(route.points.length>1)guides.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(route.points.map(p=>p.position)),lineMaterial));
 }
 return {root,points,dispose(){geometry.dispose();material.dispose();lineMaterial.dispose();guides.traverse(o=>{if(o.isLine)o.geometry.dispose();});}};
}
