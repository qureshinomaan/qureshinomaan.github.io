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
  pose(startC, [0.2, -0.72, 0.3], [-0.48, -0.75, 0.22]);        // close-up of a poster on the wall        // close-up of a poster on the left wall
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
    if (showFlow) st.drawFlow(res.pairs, { cols: 4, rgb: "255,107,94", alpha: 0.5, clearBottom: s.h * 0.24 });
    // the filmstrip: imagined frames that bridge the start view and the task goal; frames appear only once imagined
    const o = s.o, n = K, gap = 8, th = Math.round(Math.min(s.h * 0.16, (s.w - 40 - 5 * 8) / 6 * 9 / 16)), tw = th * 16 / 9, W = n * tw + (n - 1) * gap, x0 = (s.w - W) / 2, y0 = s.h - th - 14;
    o.fillStyle = "rgba(11,16,27,0.82)"; o.fillRect(x0 - 10, y0 - 24, W + 20, th + 34);
    s.text(mode === 1 ? "IMAGINED" : "TASK GOAL", x0, y0 - 12, C.parch, 11, "left", "700");
    s.text(mode === 1 ? "sub-goal images, not camera observations" : "the only image the controller is given", x0 + (mode === 1 ? 68 : 78), y0 - 12, "rgba(216,201,164,0.6)", 11);
    const age = s.t - born;
    for (let i = 0; i < n; i++) {
      const x = x0 + i * (tw + gap), last = i === n - 1;
      const shown = mode === 0 ? last : (i <= k || state === "done");
      if (!shown) { o.strokeStyle = "rgba(145,198,186,0.18)"; o.lineWidth = 1; o.setLineDash([3, 4]); o.strokeRect(x + 0.5, y0 + 0.5, tw - 1, th - 1); o.setLineDash([]); continue; }
      const fresh = mode === 1 && i === k && state !== "done" ? Math.min(1, age / 0.9) : 1;
      o.globalAlpha = fresh; o.drawImage(imgs[i], x, y0, tw, th); o.globalAlpha = 1;
      const active = (mode === 1 ? i === k : last) && state !== "done", reached = mode === 1 && (i < k || state === "done");
      o.lineWidth = active ? 2 : 1; o.strokeStyle = active ? C.amber : "rgba(145,198,186,0.7)"; o.strokeRect(x + 0.5, y0 + 0.5, tw - 1, th - 1);
      if (reached) { s.dot(x + tw - 9, y0 + 9, 5.5, C.mint); s.text("\u2713", x + tw - 9, y0 + 9.5, "#0B101B", 9, "center", "700"); }
      if (last) s.text("task goal", x + 5, y0 + th - 8, C.parch, 10);
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
