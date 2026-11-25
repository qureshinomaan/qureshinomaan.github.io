/* Arc-length value function: the expensive shortcut. Four pick-and-place jobs
 * can be done in any order. The order with the shortest gripper path is not
 * the order with the shortest path for the joints. The "motion score" on the
 * right unrolls what each joint has to do, measured in joint-space arc length.
 * Both orders are found by brute force here; the paper learns a value function
 * of arc length so this ranking is fast enough to do online. */
import { mount, THREE, C, clamp } from "./kit.js";
import { painterly, sky, paintMat, motes } from "./paint.js";

mount((s) => {
  const dome = sky(s, { top: 0x18203a, horizon: 0xb8744a, cloud: 0xefb765, clouds: 0.6, stars: 0.3, moon: [0, -1, 0] });
  const paint = painterly(s, { radius: 3, vignette: 0.75, saturation: 1.12 });
  s.lights.sun.position.set(-2.6, 3.2, 2.2); s.lights.sun.color.set(0xffd9a0); s.lights.sun.intensity = 2.0;
  s.lights.hemi.intensity = 1.5; s.lights.hemi.color.set(0xb7d6cf); s.lights.hemi.groundColor.set(0x6a4a30); s.lights.rim.color.set(0xefb765); s.lights.rim.intensity = 10; s.lights.rim.position.set(2.5, 1.2, -2.2);
  const table = s.table(1.7, 1.15, 0x7a6243); table.userData.top.material = paintMat(0x9d895d, { freq: 5, amount: 0.22, shade: 0x163b36 });
  // shadowed shelving in the background
  const shelfM = paintMat(0x16302c, { freq: 1.5, amount: 0.5 });
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.7 + (i % 3) * 0.3, 0.7 + ((i * 7) % 5) * 0.35, 0.5), shelfM); m.position.set(-4 + i * 1.05, m.geometry.parameters.height / 2 - 0.72, -4.2 - (i % 2) * 0.5); s.scene.add(m); }
  const dust = motes(s, { count: 26, box: [3, 1.6, 2.4], center: [0, 0.7, 0], color: 0xefb765, size: 9 });
  const arm = s.arm({ base: [0, 0, -0.34], color: 0xe9dfc4, joint: 0x2f6f66 });
  const cols = [0xff6b5e, 0x91c6ba, 0xefb765, 0x72759b], NJ = 4;
  const cubes = [[-0.5, 0.22], [0.5, 0.0], [-0.1, 0.42], [0.36, 0.34]].map((p, i) => { const c = s.box(0.055, cols[i], [p[0], 0.0275, p[1]]); c.userData.x0 = p[0]; c.userData.z0 = p[1]; return c; });
  // every cube has its own pad somewhere else on the table, so the order of the jobs matters
  const PADS = [[0.5, 0.36], [-0.56, -0.08], [0.2, 0.06], [-0.3, 0.44]];
  const slots = cubes.map((c, i) => { const [x, z] = PADS[i]; s.box([0.09, 0.006, 0.09], cols[i], [x, 0.003, z], { emissive: cols[i], emissiveIntensity: 0.15 }); return new THREE.Vector3(x, 0.034, z); });
  const clearOfPads = (x, z) => PADS.every((p) => Math.hypot(x - p[0], z - p[1]) > 0.12);
  const HOVER = 0.17, home = new THREE.Vector3(0, 0.32, 0.12), hov = (v) => new THREE.Vector3(v.x, HOVER, v.z);
  const trail = s.trail(0xefb765, 1500, 0.8);
  const dq = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);   // joint-space arc length of a straight joint move
  const perms = (n) => { const out = []; const rec = (a, rest) => { if (!rest.length) out.push(a); rest.forEach((x, i) => rec(a.concat(x), rest.slice(0, i).concat(rest.slice(i + 1)))); }; rec([], [...Array(n).keys()]); return out; };
  const ALL = perms(NJ);
  let picks = [], plans = [], which = 1, run = null, drag = null;
  function build(order) {
    const segs = []; let q = arm.ik(home), x = home.clone(), cart = 0, len = 0;
    const move = (to) => { const qt = arm.ik(to), L = dq(q, qt); segs.push({ q0: q, q1: qt, L, s0: len }); len += L; cart += x.distanceTo(to); q = qt; x = to.clone(); };
    for (const i of order) { move(hov(picks[i])); move(picks[i]); segs.push({ grab: i }); move(hov(picks[i])); move(hov(slots[i])); move(slots[i]); segs.push({ drop: i }); move(hov(slots[i])); }
    return { order, segs, len, cart };
  }
  function solve() {
    picks = cubes.map((c) => new THREE.Vector3(c.userData.x0, 0.0275, c.userData.z0));
    let bc = null, bj = null;
    for (const o of ALL) { const p = build(o); if (!bc || p.cart < bc.cart) bc = p; if (!bj || p.len < bj.len) bj = p; }
    plans = [Object.assign(bc, { name: "shortest gripper path" }), Object.assign(bj, { name: "shortest joint path" })];
  }
  function start() {
    cubes.forEach((c, i) => { c.position.copy(picks[i]); c.rotation.y = 0; }); trail.reset();
    run = { k: 0, u: 0, held: -1, s: 0, done: false, wait: 0 }; arm.setQ(...arm.ik(home));
  }
  /* Start from a layout where the two criteria clearly disagree (found by trying seeded random layouts). */
  function layout(r) {
    cubes.forEach((c) => { let x, z; do { x = (r() - 0.5) * 1.2; z = -0.18 + r() * 0.6; } while (!clearOfPads(x, z) || Math.hypot(x, z + 0.34) < 0.3 || Math.hypot(x, z + 0.34) > 0.78); c.userData.x0 = x; c.userData.z0 = z; });
    solve(); return plans[0].len - plans[1].len;
  }
  { const r = s.rng(77); let best = -1, keep = null;
    for (let i = 0; i < 400; i++) { const d = layout(r); if (d > best) { best = d; keep = cubes.map((c) => [c.userData.x0, c.userData.z0]); } if (d > 2.5) break; }
    cubes.forEach((c, i) => { c.userData.x0 = keep[i][0]; c.userData.z0 = keep[i][1]; }); }
  solve(); start();
  const SPEED = 2.4; // constant speed along the joint-space path, rad/s
  function update(t, dt) {
    dome.tick(t, s.camera); dust.tick(t);
    s.camera.setViewOffset(s.w, s.h, Math.round(s.w * 0.14), 0, s.w, s.h);
    if (!run || drag) return;
    const P = plans[which];
    if (run.done) { run.wait -= dt; if (run.wait < 0) start(); return; }
    let sg = P.segs[run.k];
    while (sg && (sg.grab != null || sg.drop != null)) { if (sg.grab != null) run.held = sg.grab; else { cubes[sg.drop].position.copy(slots[sg.drop]); cubes[sg.drop].position.y = 0.0335; run.held = -1; } sg = P.segs[++run.k]; }
    if (!sg) { run.done = true; run.wait = 2.5; return; }
    run.u += dt * SPEED / Math.max(sg.L, 0.05); const u = Math.min(1, run.u);
    run.s = sg.s0 + sg.L * u;
    arm.setQ(sg.q0[0] + (sg.q1[0] - sg.q0[0]) * u, sg.q0[1] + (sg.q1[1] - sg.q0[1]) * u, sg.q0[2] + (sg.q1[2] - sg.q0[2]) * u);
    arm.grip(run.held >= 0 ? 0 : 1);
    const tip = arm.tipWorld(); trail.push(tip);
    if (run.held >= 0) { cubes[run.held].position.copy(tip); cubes[run.held].rotation.y = arm.q[0]; }
    if (run.u >= 1) { run.k++; run.u = 0; }
  }
  s.on("down", () => { const h = s.hit(cubes); if (h) { drag = h.object; return true; } });
  s.on("move", (p) => {
    if (!drag) { s.canvas.style.cursor = s.hit(cubes) ? "move" : ""; return; }
    const q = s.rayY(0.03, p); if (!q) return; const x = clamp(q.x, -0.62, 0.62), z = clamp(q.z, -0.2, 0.44);
    if (!clearOfPads(x, z)) return;
    drag.position.set(x, 0.0275, z); drag.userData.x0 = x; drag.userData.z0 = z;
  });
  s.on("up", () => { if (drag) { drag = null; solve(); start(); } });

  function render() {
    paint.render(s.scene, s.camera);
    const o = s.o, P = plans[which], Q = plans[1 - which];
    P.order.forEach((ci, n) => s.label(String(n + 1), picks[ci].clone().setY(0.1), C.parch, -4));
    // the motion score: one lane per joint, x = accumulated joint-space arc length
    const px = Math.round(s.w * 0.69), pw = s.w - px - 16, py = 58, ph = s.h - py - 70, maxL = Math.max(P.len, Q.len), lane = ph / 3, names = ["base", "shoulder", "elbow"];
    o.fillStyle = "rgba(11,16,27,0.94)"; o.fillRect(px - 12, py - 30, pw + 24, ph + 82);
    s.text("MOTION SCORE", px, py - 16, C.parch, 10.5, "left", "700"); 
    const draw = (plan, color, lw) => {
      for (let j = 0; j < 3; j++) {
        o.beginPath(); let first = true;
        for (const sg of plan.segs) { if (sg.L == null) continue; for (const [ss, q] of [[sg.s0, sg.q0[j]], [sg.s0 + sg.L, sg.q1[j]]]) { const x = px + ss / maxL * pw, y = py + j * lane + lane / 2 - clamp(q, -1.9, 1.9) / 1.9 * (lane / 2 - 7); if (first) { o.moveTo(x, y); first = false; } else o.lineTo(x, y); } }
        o.strokeStyle = color; o.lineWidth = lw; o.lineJoin = "round"; o.stroke();
      }
    };
    for (let j = 0; j < 3; j++) { const y = py + j * lane; s.line(px, y + lane / 2, px + pw, y + lane / 2, "rgba(216,201,164,0.14)", 1); s.text(names[j], px, y + 10, "rgba(216,201,164,0.8)", 12); }
    draw(Q, "rgba(114,117,155,0.45)", 1); draw(P, C.mint, 2);
    const hx = px + (run ? run.s : 0) / maxL * pw; s.line(hx, py, hx, py + ph, C.amber, 2); s.dot(hx, py, 4, C.amber);
    s.line(px + P.len / maxL * pw, py, px + P.len / maxL * pw, py + ph, "rgba(145,198,186,0.6)", 1, [3, 3]);
    // the two measures of distance
    const by = py + ph + 14;
    plans.forEach((pl, i) => {
      const on = i === which, y = by + i * 18;
      s.dot(px + 4, y, 3.5, on ? C.mint : "rgba(114,117,155,0.9)");
      s.text(i ? "joint-shortest" : "gripper-shortest", px + 14, y, on ? C.parch : "rgba(216,201,164,0.55)", 11);
      s.text(pl.cart.toFixed(1) + " m, " + pl.len.toFixed(1) + " rad", px + pw, y, on ? C.parch : "rgba(216,201,164,0.55)", 11, "right");
    });
    const same = plans[0].order.join() === plans[1].order.join(), d = plans[0].len - plans[1].len;
    s.hud("picking order <b>" + P.order.map((i) => i + 1).join(" → ") + "</b>" + (same || d < 0.05 ? " · both criteria cost the joints the same for this layout" : " · the shortest gripper path costs the joints <i>" + d.toFixed(1) + " rad more</i>") + "<br>drag the cubes to change the problem");
  }
  s.choice(["Shortest gripper path", "Shortest joint path"], 1, (i) => { which = i; start(); });
  s.button("Shuffle", () => { layout(Math.random); start(); });
  return { update, render };
}, { floorY: -0.72, grid: false, floorColor: 0x4a3a3c, bg: "#3a2c30", fogNear: 6, fogFar: 30, cam: [1.45, 0.62, 2.1], target: [0, 0.22, 0.0], minDist: 1.6, maxDist: 4.5 });
