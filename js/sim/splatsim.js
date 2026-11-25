/* SplatSim, in the browser, on the real capture. The scene is a Gaussian
 * splat of the actual UR5 workspace, and the apple, banana and plate are
 * separate real captures. Every splat is attached to one simulator body (a
 * robot link or an object), so when the simulator moves a body the photoreal
 * splats move with it. */
import { mount, THREE, C, ease } from "./kit.js";
import { loadWorkspace } from "./splatbot.js";

mount((s) => {
  let bot = null, showSim = true, paused = false, held = false, grip = 0;
  const P = (x, y, z) => new THREE.Vector3(x, y, z);
  const spots = [P(0.52, -0.25, 0), P(0.5, 0.25, 0)];   // apple start, plate (simulator frame, z up)
  let appleAt = 0, steps = [], k = 0, u = 0;
  const home = P(0.4, 0.0, 0.4), from = home.clone(), cur = home.clone();
  const skel = s.trail(0x5ad1e6, 10, 1); skel.material.depthTest = false; skel.renderOrder = 10;
  const path = s.trail(0xff6b5e, 700, 0.85); path.material.depthTest = false; path.renderOrder = 9;
  let tz = 0, GRASP = 0.05;
  function plan() {
    const a = spots[appleAt].clone(), b = spots[1 - appleAt].clone();
    a.z = tz + GRASP + (appleAt === 1 ? 0.012 : 0); b.z = tz + GRASP + (appleAt === 0 ? 0.012 : 0);
    const up = (v) => P(v.x, v.y, tz + 0.28);
    steps = [[up(a), 1.3], [a, 0.8, "grab"], [up(a), 0.8], [up(b), 1.5], [b, 0.8, "drop"], [up(b), 0.8], [home, 1.1]];
  }

  s.gate("Load the real scene", "Gaussian splats of the actual robot workspace and objects · about 7 MB").then(async () => {
    s.busy("loading the captured scene…");
    try {
      const b = await loadWorkspace(s); await b.ready;
      tz = b.tableZ;
      b.objects.plate.position.set(spots[1].x, spots[1].y, tz);
      b.objects.apple.position.set(spots[0].x, spots[0].y, tz);
      b.objects.banana.position.set(0.7, 0.02, tz + 0.02); b.objects.banana.rotation.z = 0.6;
      b.setQ(b.ik(home, b.q, 60)); plan(); bot = b; s.busy(null);
    } catch (err) { s.busy(null); s.hud("<b>Could not load the scene.</b> " + String(err.message || err)); }
  });

  const tipS = new THREE.Vector3();
  function update(t, dt) {
    if (!bot) return;
    if (!paused) {
      const st = steps[k];
      u += dt / st[1];
      cur.lerpVectors(from, st[0], ease(u));
      if (u >= 1) {
        if (st[2] === "grab") held = true;
        if (st[2] === "drop") { held = false; appleAt = 1 - appleAt; bot.objects.apple.position.set(spots[appleAt].x, spots[appleAt].y, tz + (appleAt === 1 ? 0.012 : 0)); }
        from.copy(st[0]); u = 0; k++;
        if (k >= steps.length) { k = 0; plan(); path.reset(); }
      }
      bot.reach(cur);
      if (held) { bot.tipSim(tipS); bot.objects.apple.position.set(tipS.x, tipS.y, tipS.z - GRASP); }
      path.push(bot.tipWorld());
    }
    skel.visible = showSim;
    if (showSim) skel.set(bot.skeleton());
  }
  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    if (!bot) return;
    if (showSim) for (const p of bot.skeleton()) { const q = s.project(p); if (!q.behind) s.dot(q.x, q.y, 3.2, C.cyan, "#0d1015"); }
    s.hud("<b>" + (bot.splats + bot.sceneSplats + bot.objectSplats).toLocaleString() + "</b> Gaussians from real captures · <b>" + (bot.splats + bot.objectSplats).toLocaleString() +
      "</b> ride on simulator bodies (7 robot links, 3 objects): <i>μ′ = T<sub>body</sub>·μ</i><br>joints q = [" + bot.q.map((v) => (v * 180 / Math.PI).toFixed(0) + "°").join(", ") + "]" + (held ? " · <u>apple attached to the gripper</u>" : ""));
  }
  s.toggle("Simulator skeleton", true, (v) => { showSim = v; });
  s.toggle("Pause", false, (v) => { paused = v; });
  s.note("drag to orbit · scroll to zoom");
  return { update, render };
}, { cam: [1.5, 0.8, 0.45], target: [0.3, 0.25, 0.0], floor: false, fog: false, minDist: 0.5, maxDist: 2.2 });
