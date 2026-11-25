/* Time-indexing as inductive bias: instead of one output head that must
 * represent every skill, the policy has K action heads and simply runs head k
 * during the k-th slice of the episode. */
import { mount, THREE, C, clamp, ease } from "./kit.js";

mount((s) => {
  s.table(1.5, 1.05);
  const arm = s.arm({ base: [0, 0, -0.3] });
  const cube = s.box(0.06, 0xff6b5e, [-0.3, 0.03, 0.2]);
  const pad = s.box([0.15, 0.008, 0.15], 0x7be495, [0.32, 0.004, 0.18], { emissive: 0x7be495, emissiveIntensity: 0.25 });
  const HEADS = [C.cyan, C.yellow, C.violet, C.green], HEX = [0x5ad1e6, 0xffd166, 0xb79cff, 0x7be495];
  const SKILLS = ["reach", "grasp", "move", "place"];
  const T = 6.4;
  let K = 4, time = 0, held = false, drag = null, grip = 1;
  const trails = HEX.map((c) => s.trail(c, 400, 1));
  const acts = [[], [], [], []];
  const home = new THREE.Vector3(0, 0.36, 0.1), cur = home.clone(), prev = home.clone();
  const pickAt = new THREE.Vector3(), placeAt = new THREE.Vector3();
  function freeze() { pickAt.copy(cube.position); pickAt.y = 0.03; placeAt.set(pad.position.x, 0.038, pad.position.z); }
  freeze();
  const up = (v, h) => new THREE.Vector3(v.x, h, v.z);
  function restart() { time = 0; held = false; cube.position.copy(pickAt); cube.rotation.y = 0; trails.forEach((tr) => tr.reset()); acts.forEach((a) => { a.length = 0; }); cur.copy(home); prev.copy(home); }
  function update(t, dt) {
    if (drag) { arm.solve(home); return; }
    time += dt; if (time > T + 0.8) { freeze(); restart(); }
    const u = clamp(time / T, 0, 0.9999) * 4, ph = Math.floor(u), f = ease(u - ph);
    const above = up(pickAt, 0.2), aboveB = up(placeAt, 0.22);
    let gTarget = 1;
    if (ph === 0) cur.lerpVectors(home, above, f);                                  // reach
    else if (ph === 1) { cur.lerpVectors(above, pickAt, Math.min(1, f * 1.6)); gTarget = f > 0.62 ? 0 : 1; if (f > 0.9) held = true; } // grasp
    else if (ph === 2) { gTarget = 0; cur.lerpVectors(pickAt, above, Math.min(1, f * 3)); if (f > 0.33) cur.lerpVectors(above, aboveB, (f - 0.33) / 0.67); } // move
    else { cur.lerpVectors(aboveB, placeAt, Math.min(1, f * 1.7)); gTarget = f > 0.6 ? 1 : 0; if (f > 0.62) held = false; if (f > 0.75) cur.lerpVectors(placeAt, aboveB, (f - 0.75) * 4); } // place
    grip += (gTarget - grip) * Math.min(1, dt * 14);
    arm.solve(cur); arm.grip(grip);
    if (held) { arm.tipWorld(cube.position); cube.rotation.y = arm.q[0]; } else if (ph === 3) cube.position.y = Math.max(0.038, cube.position.y - dt);
    const head = Math.min(K - 1, Math.floor(clamp(time / T, 0, 0.9999) * K));
    if (time < T) {
      trails[head].push(arm.tipWorld());
      const a = cur.clone().sub(prev).divideScalar(Math.max(dt, 1e-3));
      if (a.length() > 0.02 && acts[head].length < 500) acts[head].push([a.x, a.y, a.z]);
    }
    prev.copy(cur);
    update.head = head; update.ph = ph;
  }

  s.on("down", () => { const h = s.hit([cube, pad]); if (h) { drag = h.object; return true; } });
  s.on("move", (p) => {
    if (!drag) { s.canvas.style.cursor = s.hit([cube, pad]) ? "move" : ""; return; }
    const q = s.rayY(0.03, p); if (!q) return;
    drag.position.x = clamp(q.x, -0.55, 0.55); drag.position.z = clamp(q.z, 0.02, 0.4);
  });
  s.on("up", () => { if (drag) { drag = null; freeze(); restart(); } });

  function render() {
    const o = s.o;
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    const head = update.head || 0, frac = clamp(time / T, 0, 1);
    // timeline: K equal slices, one head each
    const bx = 14, bw = s.w - 28, by = s.h - 30, bh = 16;
    for (let i = 0; i < K; i++) {
      o.globalAlpha = i === head && time < T ? 1 : 0.45; o.fillStyle = HEADS[i];
      o.fillRect(bx + bw * i / K + 1, by, bw / K - 2, bh); o.globalAlpha = 1;
      s.text("head " + (i + 1), bx + bw * (i + 0.5) / K, by + bh / 2 + 0.5, "#14100f", 10.5, "center", "700");
    }
    for (let i = 0; i < 4; i++) s.text(SKILLS[i], bx + bw * (i + 0.5) / 4, by - 10, i === (update.ph || 0) && time < T ? C.ink : C.dim, 10.5, "center");
    o.fillStyle = "#fff"; o.fillRect(bx + bw * frac - 1, by - 4, 2, bh + 8);
    // what each head has been asked to output so far (end-effector velocity, side view)
    const pw = Math.min(92, (s.w * 0.5) / K), px0 = s.w - 12 - K * (pw + 6);
    for (let i = 0; i < K; i++) {
      const r = { x: px0 + i * (pw + 6), y: 34, w: pw, h: pw };
      o.fillStyle = "rgba(13,16,21,0.82)"; o.fillRect(r.x, r.y, r.w, r.h);
      o.strokeStyle = i === head && time < T ? HEADS[i] : "rgba(255,255,255,0.22)"; o.lineWidth = 1.5; o.strokeRect(r.x + 0.5, r.y + 0.5, r.w - 1, r.h - 1);
      s.line(r.x + r.w / 2, r.y + 4, r.x + r.w / 2, r.y + r.h - 4, "rgba(255,255,255,0.12)", 1); s.line(r.x + 4, r.y + r.h / 2, r.x + r.w - 4, r.y + r.h / 2, "rgba(255,255,255,0.12)", 1);
      o.fillStyle = HEADS[i];
      for (const a of acts[i]) o.fillRect(r.x + r.w / 2 + clamp(a[0], -0.9, 0.9) / 0.9 * (r.w / 2 - 5) - 1, r.y + r.h / 2 - clamp(a[1], -0.9, 0.9) / 0.9 * (r.h / 2 - 5) - 1, 2.2, 2.2);
    }
    s.text("actions each head has to model", s.w - 12, 22, C.dim, 10.5, "right");
    s.hud("<b>K = " + K + "</b> action head" + (K > 1 ? "s" : "") + " · head <b>" + (head + 1) + "</b> is active" +
      (K === 1 ? "<br><i>one head must represent every skill</i>" : "") + "<br>drag the cube or the green pad");
  }
  s.slider("heads K", 1, 4, K, 1, (v) => { K = v; freeze(); restart(); });
  s.button("Restart", () => { freeze(); restart(); });
  return { update, render };
}, { cam: [1.3, 1.05, 1.85], target: [0, 0.14, 0] });
