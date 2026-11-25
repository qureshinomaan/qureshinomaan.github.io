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
      if (state === "done" || state === "stuck") continue;
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
    // the filmstrip: imagined frames that bridge the start view and the task goal
    const o = s.o, n = K, gap = 6, W = Math.min(s.w - 20, 860), tw = (W - gap * (n - 1)) / n, th = tw * 9 / 16, x0 = (s.w - W) / 2, y0 = s.h - th - 12;
    o.fillStyle = "rgba(13,16,21,0.72)"; o.fillRect(x0 - 8, y0 - 22, W + 16, th + 30);
    s.text(mode === 1 ? "IMAGINED SUB-GOALS \u2192 TASK GOAL" : "TASK GOAL ONLY", x0, y0 - 11, C.dim, 10);
    const age = s.t - born;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (tw + gap), last = i === n - 1;
      const shown = mode === 0 ? last : (i < k || (i === k) || state === "done");
      if (shown) o.drawImage(imgs[i], x, y0, tw, th); else { o.fillStyle = "#12161c"; o.fillRect(x, y0, tw, th); s.text("?", x + tw / 2, y0 + th / 2, "#3a4350", 18, "center", "700"); }
      if (mode === 1 && i === k && age < 0.9 && state !== "done") { // "denoising" reveal
        const a = 1 - age / 0.9, cw = tw / 14, ch = th / 8;
        for (let c = 0; c < 14; c++) for (let rr = 0; rr < 8; rr++) if (noise() < a) { o.fillStyle = "hsl(" + Math.floor(noise() * 360) + " 55% " + (30 + noise() * 40) + "%)"; o.fillRect(x + c * cw, y0 + rr * ch, cw + 0.5, ch + 0.5); }
      }
      const active = (mode === 1 ? i === k : last) && state !== "done", reached = mode === 1 && (i < k || state === "done");
      o.lineWidth = active ? 2.5 : 1; o.strokeStyle = active ? C.yellow : reached ? C.green : last ? "rgba(123,228,149,0.6)" : "rgba(255,255,255,0.25)";
      o.strokeRect(x + 0.5, y0 + 0.5, tw - 1, th - 1);
      if (reached) { s.dot(x + tw - 9, y0 + 9, 5.5, C.green); s.text("\u2713", x + tw - 9, y0 + 9.5, "#0d1015", 9, "center", "700"); }
      if (last) s.text("goal", x + 5, y0 + th - 8, C.green, 9.5);
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
