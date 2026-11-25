/* The real UR5 workspace as Gaussian splats, rigged the SplatSim way: every
 * splat of the robot is attached to one link of the kinematic chain, so
 * setting joint angles moves the captured robot. Coordinates in this module
 * are the simulator's (metres, z up); the whole rig sits in a group that
 * rotates them into three.js's y-up world. */
import { THREE } from "./kit.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

const BASE = new URL("../../assets/splats/ur5/", import.meta.url);

/** Simulator (z-up) point -> three.js world point, and back. */
export const toWorld = (p, out = new THREE.Vector3()) => out.set(p.x, p.z, -p.y);
export const toSim = (p, out = new THREE.Vector3()) => out.set(p.x, -p.z, p.y);

function solve(A, b) { // Gaussian elimination, n x n
  const n = b.length, M = A.map((r, i) => r.concat(b[i]));
  for (let c = 0; c < n; c++) {
    let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r;
    [M[c], M[p]] = [M[p], M[c]];
    const d = M[c][c] || 1e-12;
    for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / d; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; }
  }
  return M.map((r, i) => r[n] / (r[i] || 1e-12));
}

export async function loadWorkspace(s, opts = {}) {
  const rig = await (await fetch(new URL("rig.json", BASE))).json();
  s.renderer.toneMapping = THREE.NoToneMapping; // show the capture's own colours
  s.scene.background = new THREE.Color(opts.backdrop || 0xc4c0b8); // cropped-away room reads as soft wall, not a black hole
  const spark = new SparkRenderer({ renderer: s.renderer });
  s.scene.add(spark);
  const world = new THREE.Group();
  world.rotation.x = -Math.PI / 2; // simulator z-up -> three.js y-up
  s.scene.add(world);
  const meshes = [];
  const splat = (file, parent) => { const m = new SplatMesh({ url: new URL(file, BASE).href }); parent.add(m); meshes.push(m); return m; };
  const scene = opts.scene === false ? null : splat(rig.scene.file, world);

  /* kinematic chain */
  const frames = [world], motions = [], origins = [], axes = [];
  let parent = world;
  for (const j of rig.joints) {
    const origin = new THREE.Group();
    origin.position.fromArray(j.xyz);
    origin.rotation.set(j.rpy[0], j.rpy[1], j.rpy[2], "ZYX");
    const motion = new THREE.Group();
    origin.add(motion); parent.add(origin);
    origins.push(new THREE.Matrix4().compose(origin.position, origin.quaternion, new THREE.Vector3(1, 1, 1)));
    axes.push(new THREE.Vector3().fromArray(j.axis));
    motions.push(motion); frames.push(motion); parent = motion;
  }
  const linkSplats = rig.links.map((l, i) => splat(l.file, frames[i]));
  /* real object splats, each in its own group (simulator frame, resting on z = 0 of the group) */
  const objects = {};
  if (opts.objects !== false) for (const o of rig.objects || []) {
    const g = new THREE.Group(); world.add(g); splat(o.file, g);
    g.userData = o; objects[o.name] = g;
  }
  /* the simulator's rigid bodies, hidden until the visitor "peels" the splats away */
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x5ad1e6, emissive: 0x1b6f80, emissiveIntensity: 0.9, roughness: 0.35, metalness: 0.1, transparent: true, opacity: 0 });
  const wireMat = new THREE.MeshBasicMaterial({ color: 0xbff3ff, wireframe: true, transparent: true, opacity: 0 });
  const bodies = [];
  const addBody = (geo, parent) => { const m = new THREE.Mesh(geo, bodyMat), w = new THREE.Mesh(geo, wireMat); m.add(w); m.visible = false; parent.add(m); bodies.push(m); return m; };
  (rig.capsules || []).forEach((caps, i) => caps.forEach((c) => {
    const a = new THREE.Vector3().fromArray(c.a), b = new THREE.Vector3().fromArray(c.b), d = b.clone().sub(a), L = d.length();
    const m = addBody(new THREE.CapsuleGeometry(c.r * 0.82, L, 4, 14), frames[i]);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }));
  for (const name in objects) {
    const o = objects[name].userData, g = name === "plate" ? new THREE.CylinderGeometry(o.size[0] / 2, o.size[0] / 2, o.height, 28) : name === "apple" ? new THREE.SphereGeometry(o.size[0] / 2, 18, 12) : new THREE.BoxGeometry(o.size[0], o.height, o.size[1]);
    const m = addBody(g, objects[name]); m.rotation.x = Math.PI / 2; m.position.z = o.height / 2;
  }
  const tipLocal = new THREE.Vector3().fromArray(rig.tip);
  const tip = new THREE.Object3D(); tip.position.copy(tipLocal); frames[6].add(tip);

  /* pure-math forward kinematics (simulator frame) for IK */
  const M = new THREE.Matrix4(), R = new THREE.Matrix4(), qa = new THREE.Quaternion();
  function fk(q, pos, quat) {
    M.identity();
    for (let i = 0; i < 6; i++) { M.multiply(origins[i]); M.multiply(R.makeRotationAxis(axes[i], q[i])); }
    if (quat) quat.setFromRotationMatrix(M);
    return pos.copy(tipLocal).applyMatrix4(M);
  }
  const q = rig.q_capture.slice();
  const downQuat = new THREE.Quaternion(); fk(q, new THREE.Vector3(), downQuat);
  const p0 = new THREE.Vector3(), p1 = new THREE.Vector3(), q0 = new THREE.Quaternion(), q1 = new THREE.Quaternion(), dq = new THREE.Quaternion();
  function residual(qq, target, tq, out) {
    fk(qq, p0, q0);
    dq.copy(tq).multiply(qa.copy(q0).invert());
    if (dq.w < 0) { dq.x = -dq.x; dq.y = -dq.y; dq.z = -dq.z; dq.w = -dq.w; }
    const ang = 2 * Math.acos(Math.min(1, dq.w)), sn = Math.sqrt(Math.max(1e-12, 1 - dq.w * dq.w)), k = ang < 1e-6 ? 2 : ang / sn;
    out[0] = target.x - p0.x; out[1] = target.y - p0.y; out[2] = target.z - p0.z;
    out[3] = dq.x * k * 0.25; out[4] = dq.y * k * 0.25; out[5] = dq.z * k * 0.25; // orientation weighted in "metres"
    return out;
  }
  const bot = {
    rig, world, scene, linkSplats, frames, tip, q, spark, objects,
    ready: Promise.all(meshes.map((m) => m.initialized)),
    splats: rig.links.reduce((a, l) => a + l.count, 0), sceneSplats: rig.scene.count,
    objectSplats: (rig.objects || []).reduce((a, o) => a + o.count, 0),
    tableZ: rig.table_z,
    /** Trackable surface points of the scene, in three.js world coordinates. */
    features: (rig.features || []).map((p) => new THREE.Vector3(p[0], p[2], -p[1])),
    /** 0 = photoreal splats only, 1 = splats faded to a ghost and the simulator bodies revealed. */
    peel(v) {
      for (const m of linkSplats) m.opacity = 1 - 0.88 * v;
      for (const n in objects) objects[n].children[0].opacity = 1 - 0.88 * v;
      bodyMat.opacity = 0.9 * v; wireMat.opacity = 0.5 * v;
      for (const m of bodies) m.visible = v > 0.01;
    },
    setQ(v) { for (let i = 0; i < 6; i++) { q[i] = v[i]; motions[i].quaternion.setFromAxisAngle(axes[i], v[i]); } },
    /** Tool-tip position in the simulator frame for joint angles `qq` (default: current). */
    tipSim(out = new THREE.Vector3(), qq = q) { return fk(qq, out); },
    tipWorld(out = new THREE.Vector3()) { fk(q, out); return toWorld(out.clone(), out); },
    /** Damped least-squares IK toward a tool-tip target (simulator frame), tool kept pointing down,
     *  rotated by `yaw` about the vertical. Returns the joint vector (does not apply it). */
    ik(target, from = q, iters = 14, yaw = 0) {
      const x = from.slice(), r = [0, 0, 0, 0, 0, 0], r2 = [0, 0, 0, 0, 0, 0], eps = 1e-4;
      const tq = yaw ? new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), yaw).multiply(downQuat) : downQuat;
      for (let it = 0; it < iters; it++) {
        residual(x, target, tq, r);
        if (Math.hypot(...r) < 2e-4) break;
        const J = [0, 1, 2, 3, 4, 5].map(() => [0, 0, 0, 0, 0, 0]);
        for (let j = 0; j < 6; j++) { x[j] += eps; residual(x, target, tq, r2); x[j] -= eps; for (let i = 0; i < 6; i++) J[i][j] = -(r2[i] - r[i]) / eps; }
        const A = [0, 1, 2, 3, 4, 5].map((i) => [0, 1, 2, 3, 4, 5].map((k) => { let a = i === k ? 4e-4 : 0; for (let j = 0; j < 6; j++) a += J[i][j] * J[k][j]; return a; }));
        const y = solve(A, r), step = [0, 0, 0, 0, 0, 0];
        for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) step[j] += J[i][j] * y[i];
        const big = Math.max(...step.map(Math.abs)), sc = big > 0.35 ? 0.35 / big : 1;
        for (let j = 0; j < 6; j++) x[j] += step[j] * sc;
      }
      return x;
    },
    /** Move the tool tip toward `target` (simulator frame). */
    reach(target, yaw) { const x = bot.ik(target, q, 6, yaw); bot.setQ(x); return x; },
    /** World-space positions of the joint origins, for drawing the simulator skeleton. */
    skeleton() {
      world.updateMatrixWorld(true);
      const pts = frames.map((f) => f.getWorldPosition(new THREE.Vector3()));
      pts.push(tip.getWorldPosition(new THREE.Vector3()));
      return pts;
    }
  };
  bot.setQ(q);
  return bot;
}
