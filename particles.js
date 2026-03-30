/* Three.js boxing ring particles — home hero */
import * as THREE from 'three';

const c = document.getElementById('particles');
const h = document.getElementById('homeHero');
if (!c || !h) throw 0;

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(60, c.clientWidth / c.clientHeight, 0.1, 1000);
cam.position.z = 5;
const R = new THREE.WebGLRenderer({ canvas: c, alpha: true, antialias: false });
R.setSize(c.clientWidth, c.clientHeight);
R.setPixelRatio(Math.min(devicePixelRatio, 2));

const gold = new THREE.Color(0xe8b34a), crim = new THREE.Color(0xd44a4a), wht = new THREE.Color(0xffeedd);
const rC = 150, sC = 200, tot = rC + sC;
const pos = new Float32Array(tot * 3), vel = new Float32Array(tot * 3), col = new Float32Array(tot * 3);

function ringXY(i, count, size) {
  const t = (i % (count / 4)) / (count / 4), sd = Math.floor(i / (count / 4));
  if (sd === 0) return [-size + t * 2 * size, -size];
  if (sd === 1) return [size, -size + t * 2 * size];
  if (sd === 2) return [size - t * 2 * size, size];
  return [-size, size - t * 2 * size];
}

for (let i = 0; i < rC; i++) {
  const [x, y] = ringXY(i, rC, 3.5);
  pos[i*3] = x + (Math.random()-.5)*.4; pos[i*3+1] = y + (Math.random()-.5)*.4; pos[i*3+2] = (Math.random()-.5)*1.5;
  vel[i*3] = (Math.random()-.5)*.001; vel[i*3+1] = (Math.random()-.5)*.001; vel[i*3+2] = (Math.random()-.5)*.0005;
  col[i*3] = gold.r; col[i*3+1] = gold.g; col[i*3+2] = gold.b;
}
for (let i = rC; i < tot; i++) {
  pos[i*3] = (Math.random()-.5)*14; pos[i*3+1] = (Math.random()-.5)*10; pos[i*3+2] = (Math.random()-.5)*6;
  vel[i*3] = (Math.random()-.5)*.002; vel[i*3+1] = (Math.random()-.5)*.002+.001; vel[i*3+2] = (Math.random()-.5)*.001;
  const m = Math.random(), cl = m > .5 ? gold : m > .2 ? crim : wht;
  col[i*3] = cl.r; col[i*3+1] = cl.g; col[i*3+2] = cl.b;
}

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
const mat = new THREE.PointsMaterial({ size: .04, transparent: true, opacity: .6, blending: THREE.AdditiveBlending, sizeAttenuation: true, vertexColors: true });
scene.add(new THREE.Points(geo, mat));

const rC2 = 100, rP = new Float32Array(rC2*3), rV = new Float32Array(rC2*3), rCl = new Float32Array(rC2*3);
for (let i = 0; i < rC2; i++) {
  const [x, y] = ringXY(i, rC2, 2.5);
  rP[i*3] = x+(Math.random()-.5)*.2; rP[i*3+1] = y+(Math.random()-.5)*.2; rP[i*3+2] = (Math.random()-.5)*.5+.5;
  rV[i*3] = (Math.random()-.5)*.0005; rV[i*3+1] = (Math.random()-.5)*.0005; rV[i*3+2] = (Math.random()-.5)*.0003;
  rCl[i*3] = crim.r; rCl[i*3+1] = crim.g; rCl[i*3+2] = crim.b;
}
const rGeo = new THREE.BufferGeometry();
rGeo.setAttribute('position', new THREE.BufferAttribute(rP, 3));
rGeo.setAttribute('color', new THREE.BufferAttribute(rCl, 3));
const rMat = new THREE.PointsMaterial({ size: .03, transparent: true, opacity: .4, blending: THREE.AdditiveBlending, sizeAttenuation: true, vertexColors: true });
const rPts = new THREE.Points(rGeo, rMat); scene.add(rPts);
const pts = scene.children[0];

let mx = 0, my = 0, sy = 0;
h.addEventListener('mousemove', e => { const r = h.getBoundingClientRect(); mx = ((e.clientX-r.left)/r.width-.5)*2; my = ((e.clientY-r.top)/r.height-.5)*2; });
addEventListener('scroll', () => { sy = scrollY; }, { passive: true });

let fid, t = 0;
function anim() {
  fid = requestAnimationFrame(anim); t += .01;
  const p = geo.attributes.position.array;
  for (let i = 0; i < tot; i++) {
    p[i*3] += vel[i*3]+mx*.0004; p[i*3+1] += vel[i*3+1]+my*.0003; p[i*3+2] += vel[i*3+2];
    if (p[i*3]>7) p[i*3]=-7; if (p[i*3]<-7) p[i*3]=7;
    if (p[i*3+1]>5) p[i*3+1]=-5; if (p[i*3+1]<-5) p[i*3+1]=5;
  }
  geo.attributes.position.needsUpdate = true;
  const rp = rGeo.attributes.position.array;
  for (let i = 0; i < rC2; i++) { rp[i*3]+=rV[i*3]; rp[i*3+1]+=rV[i*3+1]; rp[i*3+2]+=rV[i*3+2]+Math.sin(t+i*.1)*.0003; }
  rGeo.attributes.position.needsUpdate = true;
  pts.rotation.y = t*.02+mx*.05; pts.rotation.x = my*.03;
  rPts.rotation.y = t*.015+mx*.03; rPts.rotation.x = my*.02;
  const sf = sy*.0005; pts.position.y = -sf; mat.opacity = Math.max(.1,.6-sf*.5);
  R.render(scene, cam);
}
new IntersectionObserver(e => { e.forEach(en => { if (en.isIntersecting) anim(); else cancelAnimationFrame(fid); }); }).observe(c);
addEventListener('resize', () => { cam.aspect = c.clientWidth/c.clientHeight; cam.updateProjectionMatrix(); R.setSize(c.clientWidth, c.clientHeight); });
