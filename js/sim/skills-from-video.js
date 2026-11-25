/* Learning manipulation skills from video with approximate differentiable
 * physics. A single video only constrains where things appear in the image,
 * so depth is poorly determined. Asking the reconstruction to also obey
 * gravity and contact gives a trajectory a robot can actually execute. */
import { mount, THREE, C, clamp, ease } from "./kit.js";
import { makeEye, HELPERS } from "./servo.js";

mount((s) => {
  const VIDEO = 4, RECON = 5;
  s.camera.layers.enable(HELPERS); s.camera.layers.enable(RECON);
  s.table(1.5, 1.05);
  const plat = s.box([0.2, 0.1, 0.2], 0x2e86ab, [0.28, 0.05, 0.12]);
  const arm = s.arm({ base: [0, 0, -0.3] });
  arm.root.traverse((o) => o.layers.set(RECON));
  const est = s.box(0.07, 0xff6b5e); est.layers.set(RECON);
  // what the video shows: a hand carrying a cube
  const gt = s.box(0.07, 0xff6b5e); gt.layers.set(VIDEO);
  const hand = new THREE.Mesh(new THREE.SphereGeometry(0.05, 20, 14), new THREE.MeshStandardMaterial({ color: 0xe0ac86, roughness: 0.7 }));
  hand.layers.set(VIDEO); s.scene.add(hand);
  const vid = makeEye(s, 0xffd166, true);
  vid.layers.enable(VIDEO);
  vid.position.set(0.05, 0.42, 1.25); vid.lookAt(0.02, 0.14, 0.1); vid.sync();

  const FPS = 30, T = 4.2, N = Math.round(T * FPS), REL = Math.round(2.5 * FPS), G = 3.2, REST = 0.135;
  const A = new THREE.Vector3(-0.32, 0.035, 0.2), B = new THREE.Vector3(0.28, 0.34, 0.12);
  const truth = [];
  { let vy = 0, y = B.y;
    for (let i = 0; i < N; i++) {
      const t = i / FPS;
      if (i <= REL) { const u = ease(clamp((t - 0.3) / 2.0, 0, 1)); truth.push(new THREE.Vector3(A.x + (B.x - A.x) * u, A.y + (B.y - A.y) * Math.sin(u * Math.PI / 2), A.z + (B.z - A.z) * u)); }
      else { vy -= G / FPS; y = Math.max(REST, y + vy / FPS); if (y === REST) vy = 0; truth.push(new THREE.Vector3(B.x, y, B.z)); }
    } }
  const rnd = s.rng(31), gauss = () => Math.sqrt(-2 * Math.log(rnd() + 1e-9)) * Math.cos(6.2832 * rnd());
  const z = []; for (let i = 0; i < N; i++) z.push([gauss(), gauss(), gauss()]);
  let sigma = 0.045, physics = true, noPhys = [], withPhys = [], errA = 0, errB = 0;
  function fit() {
    // observations: accurate in the image plane, noisy along the viewing ray (monocular depth ambiguity)
    const obs = truth.map((p, i) => {
      const ray = p.clone().sub(vid.position).normalize();
      return p.clone().addScaledVector(ray, sigma * z[i][0]).add(new THREE.Vector3(z[i][1], z[i][2], 0).multiplyScalar(sigma * 0.08));
    });
    // (a) appearance only: light temporal smoothing of the per-frame estimates
    noPhys = obs.map((p, i) => { const q = new THREE.Vector3(); let w = 0; for (let j = -1; j <= 1; j++) if (obs[i + j]) { q.add(obs[i + j]); w++; } return q.divideScalar(w); });
    // (b) with physics: while held the object moves smoothly with the hand; once released it must follow
    //     x'' = 0, y'' = -g, and it cannot pass through the platform
    withPhys = obs.map((p, i) => { if (i > REL) return null; const q = new THREE.Vector3(); let w = 0; for (let j = -9; j <= 9; j++) { const k = clamp(i + j, 0, REL); q.add(obs[k]); w++; } return q.divideScalar(w); });
    const p0 = withPhys[REL].clone();
    let num = 0, den = 0; // least-squares release velocity in y, with gravity known
    for (let i = REL + 1; i < N; i++) { const t = (i - REL) / FPS; if (obs[i].y < REST + 0.01) break; num += t * (obs[i].y - p0.y + 0.5 * G * t * t); den += t * t; }
    const vy0 = den ? clamp(num / den, -0.3, 0.3) : 0;
    let landed = false;
    for (let i = REL + 1; i < N; i++) {
      const t = (i - REL) / FPS; let y = p0.y + vy0 * t - 0.5 * G * t * t;
      if (landed || y <= REST) { y = REST; landed = true; }
      withPhys[i] = new THREE.Vector3(p0.x, y, p0.z);
    }
    const mean = (est2) => est2.reduce((a, p, i) => a + p.distanceTo(truth[i]), 0) / N * 100;
    errA = mean(noPhys); errB = mean(withPhys);
    lineA.set(noPhys); lineB.set(withPhys);
  }
  const lineA = s.trail(0xff6b5e, N + 2, 0.9), lineB = s.trail(0x7be495, N + 2, 0.95);
  lineA.layers.set(RECON); lineB.layers.set(RECON);
  fit();

  let time = 0, grip = 1;
  const tmp = new THREE.Vector3();
  function sample(arr, f) { const i = Math.min(N - 2, Math.floor(f)), u = f - i; return tmp.lerpVectors(arr[i], arr[i + 1], clamp(u, 0, 1)); }
  function update(t, dt) {
    time = (time + dt) % (T + 0.9);
    const f = Math.min(N - 1.001, time * FPS), released = f > REL;
    gt.position.copy(sample(truth, f));
    hand.position.copy(released ? truth[REL] : gt.position); hand.position.y += 0.075;
    const traj = physics ? withPhys : noPhys;
    est.position.copy(sample(traj, f));
    // the robot replays the reconstructed motion
    const holdAt = released ? traj[REL] : est.position;
    arm.solve(tmp.copy(holdAt).setY(Math.max(0.03, holdAt.y) + (released ? clamp((f - REL) / 12, 0, 1) * 0.08 : 0)));
    grip += ((released ? 1 : 0) - grip) * Math.min(1, dt * 14); arm.grip(grip);
    lineA.visible = !physics; lineB.visible = physics;
  }
  function render() {
    const r = s.renderer;
    r.setScissorTest(false); r.setViewport(0, 0, s.w, s.h); r.render(s.scene, s.camera);
    const w = Math.min(250, Math.round(s.w * 0.31)), h = Math.round(w * 3 / 4), rect = { x: 10, y: s.h - h - 10, w, h };
    s.view(vid, rect); s.frame(rect, "INPUT VIDEO", C.yellow);
    s.label("video camera", vid.position, C.yellow);
    const bx = rect.x + w + 14, by = s.h - 58, bw = Math.min(250, s.w - bx - 14);
    if (bw > 150) {
      const m = Math.max(errA, errB, 1e-6);
      [["appearance only", errA, C.accent, !physics], ["+ physics", errB, C.green, physics]].forEach((row, i) => {
        const y = by + i * 24;
        s.text(row[0], bx, y, row[3] ? C.ink : C.dim, 10.5);
        s.o.fillStyle = row[2]; s.o.globalAlpha = row[3] ? 1 : 0.4; s.o.fillRect(bx, y + 8, (bw - 60) * row[1] / m, 6); s.o.globalAlpha = 1;
        s.text(row[1].toFixed(1) + " cm", bx + (bw - 60) * row[1] / m + 6, y + 11, row[3] ? C.ink : C.dim, 10.5);
      });
      s.text("mean 3D error of the reconstructed object path", bx, by - 16, C.dim, 10.5);
    }
    s.hud("reconstruction: <b>" + (physics ? "appearance + differentiable physics" : "appearance only") + "</b>" +
      (physics ? " · <u>obeys gravity and contact, robot can replay it</u>" : " · <i>matches the video, but wobbles in depth and floats</i>") +
      "<br>orbit to look at the path from the side");
  }
  s.choice(["Appearance only", "With physics"], 1, (i) => { physics = i === 1; });
  s.slider("depth ambiguity", 0, 0.09, sigma, 0.005, (v) => { sigma = v; fit(); }, (v) => (v * 100).toFixed(1) + " cm");
  return { update, render };
}, { cam: [1.75, 0.85, 1.0], target: [0, 0.12, 0.05] });
