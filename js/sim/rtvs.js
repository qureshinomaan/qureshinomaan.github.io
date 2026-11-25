/* RTVS on a real scene: a camera servos to a goal image inside a Gaussian
 * splat of a real garden (Mip-NeRF 360). Each control tick runs a few optimiser
 * steps of a small MPC on the predicted image error, then applies the 6-DoF
 * camera velocity. The arrows are the optical flow that still separates the
 * current view from the goal image. */
import { mount, THREE, C } from "./kit.js";
import { servoStep } from "./servo.js";
import { stage, poseW, ghost } from "./servo-real.js";

mount((s) => {
  let st = null, goalImg = null, v = {}, errs = [], iters = 2, running = true, done = false, ticks = 0, showFlow = true, showFan = true, res = { n: 0, err: NaN, pairs: [] }, acc = 0;
  const goal = ghost(), start = ghost(), rnd = s.rng(4);
  const GOAL = [[1.45, 0.82, 1.0], [0, 0.28, 0]];
  poseW(goal, GOAL[0], GOAL[1]);
  function restart() {
    for (let i = 0; i < 60; i++) {
      const a = Math.atan2(GOAL[0][2], GOAL[0][0]) + (rnd() - 0.5) * 1.2, r = 1.8 + rnd() * 0.6;
      poseW(start, [Math.cos(a) * r, 0.6 + rnd() * 0.7, Math.sin(a) * r], [(rnd() - 0.5) * 0.5, 0.2 + rnd() * 0.3, (rnd() - 0.5) * 0.5], (rnd() - 0.5) * 0.45);
      if (servoStep(start, goal, st.feats, {}, 0, { hold: true }).n >= 30) break;
    }
    s.camera.position.copy(start.position); s.camera.quaternion.copy(start.quaternion); s.camera.sync();
    v = {}; errs = []; done = false; ticks = 0;
  }
  stage(s, { scene: "garden", blurb: "the garden scene from the Mip-NeRF 360 dataset \u00b7 about 12 MB" }).then(async (x) => { st = x; goalImg = await st.capture(goal); restart(); }, (e) => { s.busy(null); s.hud("<b>Could not load the scene.</b> " + String(e.message || e)); });

  function update(t, dt) {
    if (!st || st.capturing() || !goalImg) return;
    st.full(); acc += dt;
    while (acc > 1 / 60) {
      acc -= 1 / 60;
      res = servoStep(s.camera, goal, st.feats, v, 1 / 60, { iters, hold: !running || done, gain: 1.3 });
      if (running && !done) { ticks++; if (ticks % 3 === 0) errs.push(res.err); if (res.err < 0.004) done = true; }
    }
  }
  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    if (!st) return;
    st.afterRender();
    if (!goalImg) { s.hud("rendering the goal image…"); return; }
    if (showFlow) st.drawFlow(res.pairs, { cols: 5, rgb: "145,198,186", alpha: 0.6 });
    if (showFan && v.A && !done) drawFan();
    const r = st.inset(); st.drawImage(goalImg, r, "GOAL IMAGE", C.parch);
    const pr = { x: 10, y: s.h - 78, w: Math.min(190, s.w * 0.24), h: 68 };
    s.plot(pr, [{ data: errs, color: C.amber, span: 120 }], "image error vs. time");
    s.hud("robot camera view · <b>" + res.n + "</b> flow vectors to the goal image · image error <i>" + (isNaN(res.err) ? "—" : res.err.toFixed(3)) + "</i>" +
      (done ? " · <u>converged in " + (ticks / 60).toFixed(1) + " s</u>" : ""));
  }
  /* The MPC's view of the next half second: candidate camera motions scored by the image error each one
     is predicted to leave. Lateral bend = sideways/yaw motion, length = forward motion. */
  const CAND = [[0, 0], [-1, 0.1], [1, 0.1], [-0.5, 0.6], [0.5, 0.6]];
  function drawFan() {
    const o = s.o, T = 1 / v.lam, base = v.v, sp = Math.hypot(base[0], base[2]) + 0.12;
    const cost = (c) => { let q = 0, lin = 0; for (let i = 0; i < 6; i++) { let a = 0; for (let j = 0; j < 6; j++) a += v.A[i][j] * c[j]; q += a * c[i]; lin += v.g[i] * c[i]; } return q * T * T + 2 * T * lin; };
    const list = CAND.map((d) => { const c = base.slice(); c[0] += d[0] * sp * 0.6; c[2] += d[1] * sp * 0.6; return { c, J: cost(c) }; });
    let lo = Infinity, hi = -Infinity; for (const k of list) { lo = Math.min(lo, k.J); hi = Math.max(hi, k.J); }
    const x0 = s.w / 2, y0 = s.h - 14;
    list.sort((a, b) => b.J - a.J);
    o.save(); o.lineCap = "round";
    for (const k of list) {
      const u = (k.J - lo) / Math.max(1e-9, hi - lo), best = k.J === lo;
      const fx = Math.max(-1, Math.min(1, k.c[0] / (sp * 1.6))), fz = Math.max(0.25, Math.min(1, 0.55 + k.c[2] / (sp * 1.8)));
      const ex = x0 + fx * s.w * 0.2, ey = y0 - fz * s.h * 0.3;
      o.strokeStyle = best ? "rgba(239,183,101,0.98)" : "rgba(216,201,164," + (0.42 - 0.3 * u) + ")"; o.lineWidth = best ? 3 : 1;
      o.beginPath(); o.moveTo(x0, y0); o.quadraticCurveTo(x0, y0 - fz * s.h * 0.17, ex, ey); o.stroke();
      if (best) { o.fillStyle = "#EFB765"; o.beginPath(); o.arc(ex, ey, 4, 0, 6.2832); o.fill(); }
    }
    o.restore();
    s.text("candidate motions, scored by predicted flow error", x0, s.h - 5, "rgba(216,201,164,0.85)", 11, "center");
  }
  s.button("New start pose", () => { if (st && goalImg) restart(); });
  s.toggle("Pause", false, (x) => { running = !x; });
  s.toggle("Flow", true, (x) => { showFlow = x; });
  s.toggle("Candidates", true, (x) => { showFan = x; });
  s.slider("MPC steps / tick", 1, 6, iters, 1, (x) => { iters = x; });
  return { update, render };
}, { floor: false, fog: false, orbit: false, cam: [1.45, 0.82, 1.0], target: [0, 0.28, 0] });
