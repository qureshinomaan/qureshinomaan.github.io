/* SplatSim, in the browser, on the real capture. The scene is a Gaussian
 * splat of the actual UR5 workspace. Every robot splat is attached to one
 * link of the simulator's kinematic chain, so when the simulator changes the
 * joint angles the photoreal robot moves. */
import { mount, THREE, C, ease } from "./kit.js";
import { loadWorkspace, toWorld } from "./splatbot.js";

mount((s) => {
  let bot = null, showSim = true, paused = false;
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  // a pick-and-place style tour of the table, in simulator coordinates (z up)
  const A = P(0.5, -0.24, 0.05), B = P(0.5, 0.26, 0.05), up = (v) => P(v.x, v.y, 0.3), home = P(0.42, 0.0, 0.42);
  const steps = [[up(A), 1.3], [A, 0.8], [A, 0.4], [up(A), 0.8], [up(B), 1.4], [B, 0.8], [B, 0.4], [up(B), 0.8], [home, 1.2]];
  let k = 0, u = 0; const from = home.clone(), cur = home.clone();
  const user = { on: false, target: home.clone() };
  const skel = s.trail(0x5ad1e6, 10, 1); skel.material.depthTest = false; skel.renderOrder = 10;
  const path = s.trail(0xff6b5e, 700, 0.9); path.material.depthTest = false; path.renderOrder = 9;

  s.gate("Load the real scene", "a Gaussian splat of the actual robot workspace · about 7 MB").then(async () => {
    s.busy("loading the captured scene…");
    try {
      const b = await loadWorkspace(s); await b.ready;
      b.setQ(b.ik(home, b.q, 60)); bot = b; s.busy(null);
    } catch (err) { s.busy(null); s.hud("<b>Could not load the scene.</b> " + String(err.message || err)); }
  });

  // drag on the table to send the gripper there
  let dragging = false;
  const tableY = () => bot.tableZ + 0.06;
  function aim(p) { const w = s.rayY(tableY(), p); if (!w) return; user.target.set(Math.min(0.75, Math.max(0.25, w.x)), Math.min(0.45, Math.max(-0.45, -w.z)), 0.06); user.on = true; }
  s.on("down", (p) => { if (bot && p.shift) { dragging = true; aim(p); return true; } });
  s.on("move", (p) => { if (dragging) aim(p); });
  s.on("up", () => { dragging = false; });

  function update(t, dt) {
    if (!bot) return;
    if (!paused) {
      if (user.on) { cur.lerp(user.target, Math.min(1, dt * 3)); }
      else {
        u += dt / steps[k][1];
        cur.lerpVectors(from, steps[k][0], ease(u));
        if (u >= 1) { from.copy(steps[k][0]); u = 0; k = (k + 1) % steps.length; if (k === 0) path.reset(); }
      }
      bot.reach(cur);
      path.push(bot.tipWorld());
    }
    skel.visible = showSim;
    if (showSim) skel.set(bot.skeleton());
  }
  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    if (!bot) return;
    if (showSim) for (const p of bot.skeleton()) { const q = s.project(p); if (!q.behind) s.dot(q.x, q.y, 3.2, C.cyan, "#0d1015"); }
    s.hud("<b>" + (bot.splats + bot.sceneSplats).toLocaleString() + "</b> Gaussians from a real capture · <b>" + bot.splats.toLocaleString() +
      "</b> ride on the robot's links: <i>μ′ = T<sub>link</sub>(q)·μ</i><br>joints q = [" + bot.q.map((v) => (v * 180 / Math.PI).toFixed(0) + "°").join(", ") + "]");
  }
  s.toggle("Simulator skeleton", true, (v) => { showSim = v; });
  s.toggle("Pause", false, (v) => { paused = v; });
  s.button("Tour", () => { user.on = false; });
  s.note("shift-drag on the table to send the gripper there");
  return { update, render };
}, { cam: [1.5, 0.8, 0.45], target: [0.25, 0.3, 0.0], floor: false, fog: false, minDist: 0.5, maxDist: 2.2 });
