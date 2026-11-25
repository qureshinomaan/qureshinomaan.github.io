/* RTVS on a real scene: a camera servos to a goal image inside a Gaussian
 * splat of a real robot workspace. Each control tick runs a few optimiser
 * steps of a small MPC on the predicted image error, then applies the 6-DoF
 * camera velocity. The arrows are the optical flow that still separates the
 * current view from the goal image. */
import { mount, THREE, C } from "./kit.js";
import { servoStep } from "./servo.js";
import { stage, pose, ghost } from "./servo-real.js";

mount((s) => {
  let st = null, goalImg = null, v = {}, errs = [], iters = 2, running = true, done = false, ticks = 0, showFlow = true, res = { n: 0, err: NaN, pairs: [] }, acc = 0;
  const goal = ghost(), start = ghost(), rnd = s.rng(4);
  pose(goal, [1.0, 0.05, 0.44], [0.0, 0.0, 0.36]);
  function restart() {
    for (let i = 0; i < 60; i++) {
      pose(start, [1.0 - rnd() * 0.3, 0.05 + (rnd() - 0.5) * 0.7, 0.44 + (rnd() - 0.4) * 0.35], [0.0, (rnd() - 0.5) * 0.5, 0.36 + (rnd() - 0.5) * 0.3], (rnd() - 0.5) * 0.5);
      if (servoStep(start, goal, st.feats, {}, 0, { hold: true }).n >= 25) break;
    }
    s.camera.position.copy(start.position); s.camera.quaternion.copy(start.quaternion); s.camera.sync();
    v = {}; errs = []; done = false; ticks = 0;
  }
  stage(s).then(async (x) => { st = x; goalImg = await st.capture(goal); restart(); }, (e) => { s.busy(null); s.hud("<b>Could not load the scene.</b> " + String(e.message || e)); });

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
    if (showFlow) st.drawFlow(res.pairs);
    const r = st.inset(); st.drawImage(goalImg, r, "GOAL IMAGE", C.green);
    const pr = { x: 10, y: s.h - 84, w: Math.min(230, s.w * 0.3), h: 74 };
    s.plot(pr, [{ data: errs, color: C.yellow, span: 120 }], "image error vs. time");
    s.hud("robot camera view · <b>" + res.n + "</b> flow vectors to the goal image · image error <i>" + (isNaN(res.err) ? "—" : res.err.toFixed(3)) + "</i>" +
      (done ? " · <u>converged in " + (ticks / 60).toFixed(1) + " s</u>" : ""));
  }
  s.button("New start pose", () => { if (st && goalImg) restart(); });
  s.toggle("Pause", false, (x) => { running = !x; });
  s.toggle("Flow", true, (x) => { showFlow = x; });
  s.slider("MPC steps / tick", 1, 6, iters, 1, (x) => { iters = x; });
  return { update, render };
}, { floor: false, fog: false, orbit: false, cam: [1, 0.44, -0.05], target: [0, 0.36, 0] });
