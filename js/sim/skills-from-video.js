/* Learning manipulation skills from video with approximate differentiable
 * physics, as a sculpture settling. A single video fixes where the object
 * appears in each frame but not how far away it is, so every pose can slide
 * along its viewing ray. Here a live optimisation adjusts those depths. With
 * only a weak depth guess the sculpture wobbles and floats; as the physics
 * term is turned up (gravity, smooth carrying, contact) it settles into a
 * path that a robot could replay. */
import { mount, THREE, C, clamp, ease } from "./kit.js";
import { painterly, sky, paintMat, motes } from "./paint.js";

mount((s) => {
  const dome = sky(s, { top: 0x1a1f33, horizon: 0xc9a48c, cloud: 0xd8c9a4, clouds: 0.8, stars: 0.2, moon: [0.2, 0.1, -1], moonColor: 0xefb765 });
  const paint = painterly(s, { radius: 3, vignette: 0.7, saturation: 0.95 });
  s.lights.sun.position.set(-2.5, 3, 2); s.lights.sun.color.set(0xffe8cf); s.lights.sun.intensity = 2.2;
  s.lights.hemi.intensity = 1.2; s.lights.hemi.color.set(0xc9c4c0); s.lights.hemi.groundColor.set(0x4a4038); s.lights.rim.color.set(0xefb765); s.lights.rim.intensity = 9; s.lights.rim.position.set(2.6, 1.0, -2);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(3.2, 64), paintMat(0x5f6076, { freq: 1.6, amount: 0.4, shade: 0x34336b })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; s.scene.add(ground);
  const plat = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.14, 0.32), paintMat(0x163b36, { freq: 6, amount: 0.3 })); plat.position.set(0.42, 0.07, 0); plat.castShadow = plat.receiveShadow = true; s.scene.add(plat);
  const dust = motes(s, { count: 28, box: [3, 1.4, 2.4], center: [0, 0.6, 0], color: 0xefb765, size: 9 });

  /* the demonstration (ground truth): carried along an arc, released, falls, rests on the block */
  const H = 0.05, N = 48, DT = 4 / N, G = 2.6, REL = 30, REST = 0.14 + H;
  const A = new THREE.Vector3(-0.55, H, 0.15), B = new THREE.Vector3(0.42, 0.52, 0.0);
  const truth = [], mode = []; // mode: 0 carried, 1 free flight, 2 resting
  { let vy = 0, y = B.y; for (let i = 0; i < N; i++) {
      if (i <= REL) { const u = ease(clamp(i / REL, 0, 1)); truth.push(new THREE.Vector3(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * Math.sin(u * Math.PI / 2), A.z + (B.z - A.z) * u)); mode.push(0); }
      else { vy -= G * DT; y += vy * DT; if (y <= REST) { y = REST; vy = 0; mode.push(2); } else mode.push(1); truth.push(new THREE.Vector3(B.x, y, B.z)); } } }
  /* the video camera: it sees direction, not distance */
  const CAM = new THREE.Vector3(-0.1, 0.55, 2.3), rays = truth.map((p) => p.clone().sub(CAM).normalize()), dTrue = truth.map((p) => p.distanceTo(CAM));
  const rnd = s.rng(41), gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.2832 * rnd());
  const z = []; { let w = 0; for (let i = 0; i < N; i++) { w = 0.6 * w + gauss(); z.push(w * 0.7 + gauss() * 0.5); } }
  let sigma = 0.16, lam = 0, d = new Float64Array(N), dObs = new Float64Array(N), m1 = new Float64Array(N), m2 = new Float64Array(N), it = 0;
  const X = (i, di, out) => out.copy(CAM).addScaledVector(rays[i], di);
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  function physics(dd) { // residual of the approximate physics: smooth while carried, ballistic when released, still and supported at rest
    let L = 0;
    for (let i = 1; i < N - 1; i++) {
      X(i - 1, dd[i - 1], a); X(i, dd[i], b); X(i + 1, dd[i + 1], c);
      const ax = c.x - 2 * b.x + a.x, ay = c.y - 2 * b.y + a.y + (mode[i] === 1 ? G * DT * DT : 0), az = c.z - 2 * b.z + a.z;
      L += (ax * ax + ay * ay + az * az) * (mode[i] === 0 ? 1 : 3);
      if (mode[i] === 2) { const vx = c.x - b.x, vy = c.y - b.y, vz = c.z - b.z; L += (vx * vx + vy * vy + vz * vz) * 3; const pen = REST - b.y; L += pen * pen * 4; }
      const under = H - b.y; if (under > 0) L += under * under * 6;
      if (i < 3) { const lift = b.y - H; L += lift * lift * 4; } // it starts resting on the ground: contact fixes the scale
    }
    return L;
  }
  const loss = (dd) => { let L = 0; for (let i = 0; i < N; i++) L += (dd[i] - dObs[i]) * (dd[i] - dObs[i]) * 0.25; return L + lam * 60 * physics(dd); };
  function reset() { for (let i = 0; i < N; i++) { dObs[i] = dTrue[i] + sigma * z[i]; d[i] = dObs[i]; } m1.fill(0); m2.fill(0); it = 0; }
  reset();
  function step() { // one Adam step on the depths, numeric gradient
    const g = new Float64Array(N), e = 1e-4, L0 = loss(d);
    for (let i = 0; i < N; i++) { d[i] += e; g[i] = (loss(d) - L0) / e; d[i] -= e; }
    it++;
    for (let i = 0; i < N; i++) { m1[i] = 0.9 * m1[i] + 0.1 * g[i]; m2[i] = 0.99 * m2[i] + 0.01 * g[i] * g[i]; d[i] -= 0.006 * (m1[i] / (1 - Math.pow(0.9, it))) / (Math.sqrt(m2[i] / (1 - Math.pow(0.99, it))) + 1e-8); }
  }

  /* the sculpture */
  const boxG = new THREE.BoxGeometry(2 * H, 2 * H, 2 * H), ghosts = [];
  for (let i = 0; i < N; i += 4) { const m = new THREE.Mesh(boxG, new THREE.MeshBasicMaterial({ color: 0x91c6ba, transparent: true, opacity: 0.06 + 0.12 * (i / N), depthWrite: false })); const w = new THREE.LineSegments(new THREE.EdgesGeometry(boxG), new THREE.LineBasicMaterial({ color: 0x91c6ba, transparent: true, opacity: 0.55 })); m.add(w); m.userData.i = i; s.scene.add(m); ghosts.push(m); }
  const solid = new THREE.Mesh(boxG, paintMat(0xd8c9a4, { freq: 9, amount: 0.25 })); solid.castShadow = true; s.scene.add(solid);
  const pathL = s.trail(0x91c6ba, N + 2, 0.9), truthL = s.trail(0xd8c9a4, N + 2, 0.25);
  truthL.set(truth);
  const rayL = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0x72759b, transparent: true, opacity: 0.28 })); rayL.frustumCulled = false; s.scene.add(rayL);
  const camBody = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.1), paintMat(0x0b101b, {})); camBody.position.copy(CAM); camBody.lookAt(0, 0.3, 0); s.scene.add(camBody);
  const pins = []; for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), new THREE.MeshBasicMaterial({ color: 0xefb765 })); s.scene.add(p); pins.push(p); }
  const est = []; for (let i = 0; i < N; i++) est.push(new THREE.Vector3());
  let time = 0, err = 0, phys = 0, touched = false, slider = null;
  function update(t, dt) {
    dome.tick(t, s.camera); dust.tick(t);
    if (!touched && t > 2.5 && lam < 1) { lam = Math.min(1, lam + dt * 0.35); if (slider) { slider.value = lam; slider.dispatchEvent(new Event("change")); slider.nextSibling.textContent = lam.toFixed(2); } } // first visit: turn the physics up by itself
    for (let k = 0; k < 14; k++) step();
    err = 0; const rp = [];
    for (let i = 0; i < N; i++) { X(i, d[i], est[i]); err += est[i].distanceTo(truth[i]); }
    err = err / N * 100; phys = physics(d) * 1000;
    pathL.set(est);
    for (const g of ghosts) { g.position.copy(est[g.userData.i]); rp.push(CAM.x, CAM.y, CAM.z, est[g.userData.i].x, est[g.userData.i].y, est[g.userData.i].z); }
    rayL.geometry.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3));
    time = (time + dt) % 5.2; const f = clamp(time / 4, 0, 0.999) * (N - 1), i0 = Math.floor(f);
    solid.position.lerpVectors(est[i0], est[Math.min(N - 1, i0 + 1)], f - i0);
    // contact pins light up where the estimated object is actually supported
    let pi = 0;
    for (let i = N - 1; i >= 0 && pi < 8; i -= 2) if (mode[i] === 2 && Math.abs(est[i].y - REST) < 0.012 && lam > 0.02) for (const sx of [-1, 1]) { if (pi < 8) { pins[pi].visible = true; pins[pi].position.set(est[i].x + sx * H, est[i].y - H, est[i].z + (pi % 4 < 2 ? H : -H)); pi++; } }
    for (; pi < 8; pi++) pins[pi].visible = false;
  }
  function render() {
    paint.render(s.scene, s.camera);
    const o = s.o;
    // the input video, as the camera sees it: positions in the image, no depth
    const w = Math.min(220, s.w * 0.28), h = w * 0.62, r = { x: 12, y: s.h - h - 12, w, h };
    o.fillStyle = "rgba(11,16,27,0.85)"; o.fillRect(r.x, r.y, r.w, r.h);
    const f = clamp(time / 4, 0, 0.999) * (N - 1), cur = Math.floor(f);
    for (let i = 0; i < N; i++) {
      const u = r.x + r.w * (0.52 + rays[i].x / -rays[i].z * 1.25), v = r.y + r.h * (0.62 - (rays[i].y / -rays[i].z + 0.12) * 2.2);
      if (i === cur) { o.fillStyle = C.parch; o.fillRect(u - 6, v - 6, 12, 12); } else { o.fillStyle = "rgba(145,198,186," + (i < cur ? 0.7 : 0.25) + ")"; o.fillRect(u - 1.2, v - 1.2, 2.4, 2.4); }
    }
    s.frame(r, "INPUT VIDEO", C.parch);
    s.label("video camera", CAM, C.parch, -18);
    s.hud("physics weight <b>" + lam.toFixed(2) + "</b> · the path matches the video either way · 3D error <i>" + err.toFixed(1) + " cm</i> · physics residual " + phys.toFixed(2) +
      "<br>" + (lam < 0.03 ? "appearance only: each pose can slide along its viewing ray, so the path wobbles and floats" : "<u>gravity, smooth carrying and contact pull the poses into a path a robot can replay</u>"));
  }
  slider = s.slider("physics weight", 0, 1, lam, 0.01, (v) => { lam = v; touched = true; m1.fill(0); m2.fill(0); it = 0; }, (v) => v.toFixed(2));
  s.slider("depth ambiguity", 0.04, 0.3, sigma, 0.01, (v) => { sigma = v; reset(); }, (v) => (v * 100).toFixed(0) + " cm");
  s.button("Start over", reset);
  return { update, render };
}, { floor: false, bg: "#6f6a78", fogNear: 5, fogFar: 15, cam: [2.2, 1.15, 1.9], target: [0, 0.28, 0.1], minDist: 1.6, maxDist: 6 });
