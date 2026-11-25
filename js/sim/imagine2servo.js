/* Imagine2Servo on a real scene. Servoing needs a goal image that overlaps
 * the current view. The task goal here is a different part of the workspace,
 * so servoing straight to it has no flow to follow. Imagining a chain of
 * nearby sub-goal images, and servoing to each, gets there. A renderer of the
 * captured scene stands in for the diffusion model that imagines sub-goals. */
import { mount, THREE, C } from "./kit.js";
import { servoStep } from "./servo.js";
import { stage, pose, ghost } from "./servo-real.js";

mount((s) => {
  const K = 6;
  let st = null, imgs = null, v = {}, mode = 1, k = 0, state = "idle", born = -9, res = { n: 0, err: NaN, pairs: [] }, acc = 0, showFlow = true;
  const startC = ghost(), fin = ghost(), subs = [];
  pose(startC, [0.02, 0.72, 0.42], [-0.48, 0.86, 0.42]);        // close-up of a poster on the left wall
  pose(fin, [0.62, -0.16, 0.42], [0.66, -0.2, -0.02]);           // looking down at the mark on the table
  for (let i = 1; i <= K; i++) {
    const c = ghost(), u = i / K;
    c.position.lerpVectors(startC.position, fin.position, u); c.quaternion.slerpQuaternions(startC.quaternion, fin.quaternion, u); c.sync(); subs.push(c);
  }
  function reset() {
    s.camera.position.copy(startC.position); s.camera.quaternion.copy(startC.quaternion); s.camera.sync();
    v = {}; k = 0; state = mode === 1 ? "imagining" : "servo"; born = s.t;
  }
  stage(s).then(async (x) => {
    st = x; const out = [];
    for (const c of subs) out.push(await st.capture(c));
    imgs = out; reset();
  }, (e) => { s.busy(null); s.hud("<b>Could not load the scene.</b> " + String(e.message || e)); });

  function update(t, dt) {
    if (!st || st.capturing() || !imgs) return;
    st.full(); acc += dt;
    while (acc > 1 / 60) {
      acc -= 1 / 60;
      if (mode === 0) {
        res = servoStep(s.camera, fin, st.feats, v, 1 / 60, { gain: 1.3 });
        state = res.n < 4 ? "stuck" : res.err < 0.005 ? "done" : "servo";
        continue;
      }
      const hold = state === "imagining" && s.t - born < 0.9;
      if (state === "imagining" && !hold) state = "servo";
      res = servoStep(s.camera, subs[k], st.feats, v, 1 / 60, { hold: hold || state === "done", gain: 1.3 });
      if (state === "servo" && (res.err < 0.007 || res.n < 4)) {
        if (res.n < 4) { state = "stuck"; }
        else if (k === K - 1) state = "done"; else { k++; state = "imagining"; born = s.t; }
      }
    }
  }
  const noise = s.rng(3);
  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    if (!st) return;
    st.afterRender();
    if (!imgs) { s.hud("pre-rendering the sub-goal images…"); return; }
    if (showFlow) st.drawFlow(res.pairs);
    const r = st.inset(), o = s.o;
    st.drawImage(imgs[mode === 0 ? K - 1 : k], r, mode === 0 ? "FINAL GOAL IMAGE" : "IMAGINED SUB-GOAL " + (k + 1) + " / " + K, mode === 0 ? C.green : C.yellow);
    const age = s.t - born;
    if (mode === 1 && age < 0.9) { // "denoising" reveal of the imagined image
      const a = 1 - age / 0.9, cw = r.w / 25, ch = (r.h - 17) / 14;
      for (let i = 0; i < 25; i++) for (let j = 0; j < 14; j++) if (noise() < a) {
        o.fillStyle = "hsl(" + Math.floor(noise() * 360) + " 55% " + (30 + noise() * 40) + "%)"; o.fillRect(r.x + i * cw, r.y + 17 + j * ch, cw + 0.5, ch + 0.5);
      }
    }
    const msg = state === "stuck" ? "<i>stuck: the goal image shares no features with the current view, so there is no flow to follow</i>"
      : state === "done" ? "<u>reached the task goal" + (mode === 1 ? " through " + K + " imagined sub-goals" : "") + "</u>"
      : state === "imagining" ? "imagining the next sub-goal image…"
      : "servoing · image error " + (isNaN(res.err) ? "—" : res.err.toFixed(3));
    s.hud("robot camera view · <b>" + res.n + "</b> flow vectors to the goal image · " + msg);
  }
  s.choice(["Servo straight to final image", "Imagine sub-goals"], 1, (i) => { mode = i; if (imgs) reset(); });
  s.button("Restart", () => { if (imgs) reset(); });
  s.toggle("Flow", true, (x) => { showFlow = x; });
  return { update, render };
}, { floor: false, fog: false, orbit: false, cam: [0.02, 0.42, -0.72], target: [-0.48, 0.42, -0.86] });
