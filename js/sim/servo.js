/* Shared pieces for the two visual-servoing simulators: a tabletop scene with
 * trackable features, an eye-in-hand style free camera, and a classical
 * image-based visual servoing (IBVS) step on point features. */
import { THREE, C } from "./kit.js";

export const HELPERS = 3; // layer for things the robot camera must not see

export function buildScene(s, wide) {
  const rnd = s.rng(11);
  const W = wide ? 3.0 : 1.9;
  s.table(W, 1.05, 0xcdb894);
  const feats = [];
  /* back wall with a procedurally painted mural, so the camera views have texture */
  const cv = document.createElement("canvas"); cv.width = 1536; cv.height = 512;
  const g = cv.getContext("2d");
  g.fillStyle = "#e9e4d8"; g.fillRect(0, 0, cv.width, cv.height);
  const hues = [8, 28, 48, 150, 190, 215, 265, 330];
  const wallW = W + 0.6, wallH = 1.1, wallZ = -0.62, wallY = 0.5;
  for (let i = 0; i < (wide ? 46 : 30); i++) {
    const x = 40 + rnd() * (cv.width - 80), y = 40 + rnd() * (cv.height - 110), r = 18 + rnd() * 38;
    g.fillStyle = "hsl(" + hues[Math.floor(rnd() * hues.length)] + " " + (55 + rnd() * 30) + "% " + (38 + rnd() * 25) + "%)";
    g.beginPath();
    const k = Math.floor(rnd() * 3);
    if (k === 0) g.arc(x, y, r, 0, 6.2832);
    else if (k === 1) g.rect(x - r, y - r * 0.7, 2 * r, 1.4 * r);
    else { g.moveTo(x, y - r); g.lineTo(x + r, y + r * 0.8); g.lineTo(x - r, y + r * 0.8); g.closePath(); }
    g.fill();
    if (i % 2 === 0) feats.push(new THREE.Vector3((x / cv.width - 0.5) * wallW, wallY + (0.5 - y / cv.height) * wallH, wallZ + 0.002));
  }
  const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(wallW, wallH), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
  wall.position.set(0, wallY, wallZ); wall.receiveShadow = true; s.scene.add(wall);

  /* objects on the table; their top corners are the tracked features */
  const cols = [0xe4572e, 0x2e86ab, 0xf2c14e, 0x4caf7d, 0x9b5de5, 0xef476f, 0x3bceac, 0xf79d65];
  const n = wide ? 13 : 8;
  for (let i = 0; i < n; i++) {
    const w = 0.07 + rnd() * 0.07, h = 0.06 + rnd() * 0.16, d = 0.07 + rnd() * 0.06;
    const x = (i + 0.5) / n * (W - 0.3) - (W - 0.3) / 2 + (rnd() - 0.5) * 0.06, z = -0.34 + rnd() * 0.38;
    const b = s.box([w, h, d], cols[i % cols.length], [x, h / 2, z]);
    b.rotation.y = (rnd() - 0.5) * 0.8; b.updateMatrixWorld(true);
    for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]])
      feats.push(new THREE.Vector3(sx * w / 2, h / 2, sz * d / 2).applyMatrix4(b.matrixWorld));
  }
  return { feats, W };
}

/** A camera with a visible body and frustum in the main view. */
export function makeEye(s, color, ghost) {
  const cam = new THREE.PerspectiveCamera(52, 4 / 3, 0.03, 30);
  const rig = new THREE.Group();
  const t = Math.tan(THREE.MathUtils.degToRad(26)), L = ghost ? 0.16 : 0.22, a = 4 / 3;
  const c = [[-t * a * L, t * L, -L], [t * a * L, t * L, -L], [t * a * L, -t * L, -L], [-t * a * L, -t * L, -L]];
  const pts = [];
  for (let i = 0; i < 4; i++) { pts.push(0, 0, 0, ...c[i], ...c[i], ...c[(i + 1) % 4]); }
  const fg = new THREE.BufferGeometry(); fg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
  const fr = new THREE.LineSegments(fg, new THREE.LineBasicMaterial({ color, transparent: true, opacity: ghost ? 0.9 : 0.75 }));
  rig.add(fr);
  if (!ghost) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.06, 0.07), new THREE.MeshStandardMaterial({ color: 0x242a33, roughness: 0.4, metalness: 0.6 }));
    body.position.z = 0.035; body.castShadow = true;
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.026, 0.03, 24), new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35 }));
    lens.rotation.x = Math.PI / 2; lens.position.z = -0.012;
    rig.add(body, lens);
  }
  rig.traverse((o) => o.layers.set(HELPERS));
  s.scene.add(rig);
  cam.sync = () => {
    cam.updateMatrixWorld(true); cam.matrixWorldInverse.copy(cam.matrixWorld).invert();
    rig.position.copy(cam.position); rig.quaternion.copy(cam.quaternion);
  };
  cam.rig = rig;
  return cam;
}

let TX = Math.tan(THREE.MathUtils.degToRad(26)) * 4 / 3, TY = Math.tan(THREE.MathUtils.degToRad(26));
/** Tell the image model which camera intrinsics are in use (vertical field of view, aspect). */
export function setView(vfovDeg, aspect) { TY = Math.tan(THREE.MathUtils.degToRad(vfovDeg / 2)); TX = TY * aspect; }
/** Give any camera the `sync()` the servo code expects. */
export function syncable(cam) { cam.sync = () => { cam.updateMatrixWorld(true); cam.matrixWorldInverse.copy(cam.matrixWorld).invert(); }; cam.sync(); return cam; }
const v3 = new THREE.Vector3();
/** Normalised image coordinates of a world point (x right, y down, Z forward). */
export function observe(cam, P) {
  v3.copy(P).applyMatrix4(cam.matrixWorldInverse);
  const Z = -v3.z, x = v3.x / Z, y = -v3.y / Z;
  return { x, y, Z, vis: Z > 0.06 && Math.abs(x) < TX * 0.97 && Math.abs(y) < TY * 0.97 };
}
/** Image coords -> pixel position inside an inset rect. */
export const toRect = (ob, r) => ({ x: r.x + (ob.x / TX * 0.5 + 0.5) * r.w, y: r.y + (ob.y / TY * 0.5 + 0.5) * r.h });

function solve6(A, b) {
  const n = 6, M = A.map((r, i) => r.concat(b[i]));
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-9;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / (r[i] || 1e-9));
}

/**
 * One control tick of image-based visual servoing.
 * `iters` > 0 runs that many gradient steps of a tiny MPC on the predicted
 * feature error (warm-started from the last velocity) instead of the closed-form solve.
 * Returns { n, err, pairs } and moves `cam`.
 */
export function servoStep(cam, goal, feats, st, dt, opt = {}) {
  cam.sync(); goal.sync();
  const pairs = [];
  for (const P of feats) { const a = observe(cam, P), b = observe(goal, P); if (a.vis && b.vis) pairs.push([a, b]); }
  const n = pairs.length;
  let err = 0;
  for (const [a, b] of pairs) err += Math.hypot(a.x - b.x, a.y - b.y);
  err = n ? err / n : NaN;
  st.v = st.v || [0, 0, 0, 0, 0, 0];
  if (n < 4 || opt.hold) { for (let i = 0; i < 6; i++) st.v[i] *= 0.8; return { n, err, pairs }; }
  const A = [0, 1, 2, 3, 4, 5].map(() => [0, 0, 0, 0, 0, 0]), g = [0, 0, 0, 0, 0, 0], rows = [];
  for (const [a, b] of pairs) {
    const x = a.x, y = a.y, iz = 1 / a.Z;
    rows.push([[-iz, 0, x * iz, x * y, -(1 + x * x), y], a.x - b.x], [[0, -iz, y * iz, 1 + y * y, -x * y, -x], a.y - b.y]);
  }
  for (const [L, e] of rows) for (let i = 0; i < 6; i++) { g[i] += L[i] * e; for (let j = 0; j < 6; j++) A[i][j] += L[i] * L[j]; }
  const lam = opt.gain || 1.6;
  if (opt.iters) {
    // the MPC inner loop: a few conjugate-gradient steps on the predicted image error,
    // warm-started from the velocity of the previous tick
    for (let i = 0; i < 6; i++) A[i][i] += 1e-3;
    const mul = (x) => A.map((row) => row.reduce((acc, a, j) => acc + a * x[j], 0));
    const dot = (x, y) => x.reduce((acc, a, i) => acc + a * y[i], 0);
    const x = st.v, Ax = mul(x);
    let r = g.map((gi, i) => -lam * gi - Ax[i]), p = r.slice(), rr = dot(r, r);
    for (let k = 0; k < opt.iters && rr > 1e-14; k++) {
      const Ap = mul(p), al = rr / (dot(p, Ap) || 1e-12);
      for (let i = 0; i < 6; i++) { x[i] += al * p[i]; r[i] -= al * Ap[i]; }
      const rn = dot(r, r); for (let i = 0; i < 6; i++) p[i] = r[i] + (rn / rr) * p[i]; rr = rn;
    }
  } else {
    for (let i = 0; i < 6; i++) A[i][i] += 1e-3;
    const v = solve6(A, g); for (let i = 0; i < 6; i++) st.v[i] = -lam * v[i];
  }
  const lin = Math.hypot(st.v[0], st.v[1], st.v[2]), ang = Math.hypot(st.v[3], st.v[4], st.v[5]);
  const k = Math.min(1, 0.9 / (lin || 1), 1.6 / (ang || 1));
  const v = st.v.map((q) => q * k);
  cam.position.add(new THREE.Vector3(v[0], -v[1], -v[2]).applyQuaternion(cam.quaternion).multiplyScalar(dt));
  const w = new THREE.Vector3(v[3], -v[4], -v[5]), wl = w.length() * dt;
  if (wl > 1e-7) cam.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(w.normalize(), wl)).normalize();
  cam.sync();
  return { n, err, pairs };
}

export function lookFrom(cam, pos, at, roll) {
  cam.position.fromArray(pos); cam.up.set(0, 1, 0); cam.lookAt(at[0], at[1], at[2]);
  if (roll) cam.rotateZ(roll);
  cam.sync();
}

/** Two inset rectangles along the bottom edge. */
export function insets(s) {
  const w = Math.min(230, Math.round(s.w * 0.29)), h = Math.round(w * 3 / 4), m = 10;
  return [{ x: m, y: s.h - h - m, w, h }, { x: s.w - w - m, y: s.h - h - m, w, h }];
}
export { C };
