/* Arc-length value function for pick-and-place sequencing. The order that is
 * shortest for the gripper in Cartesian space is not the order that is
 * fastest for the joints. Both orders are found by brute force here; the
 * paper learns a value function so that this ranking is fast. */
import { mount, THREE, C, clamp, ease } from "./kit.js";

mount((s) => {
  s.table(1.6, 1.1);
  const arm = s.arm({ base: [0, 0, -0.34] });
  const cols = [0xff6b5e, 0x5ad1e6, 0xffd166, 0xb79cff, 0x7be495];
  const starts = [[-0.52, 0.22], [0.5, 0.02], [-0.12, 0.4], [0.3, 0.34], [-0.42, -0.12]];
  const cubes = starts.map((p, i) => s.box(0.055, cols[i], [p[0], 0.0275, p[1]]));
  const slots = cubes.map((c, i) => {
    const x = (i - 2) * 0.1, z = 0.12;
    s.box([0.08, 0.006, 0.08], cols[i], [x, 0.003, z], { emissive: cols[i], emissiveIntensity: 0.25 });
    return new THREE.Vector3(x, 0.034, z);
  });
  const VMAX = [1.6, 1.3, 1.9], HOVER = 0.17, home = new THREE.Vector3(0, 0.32, 0.12);
  const trail = s.trail(0xffffff, 1500, 0.55);
  const hov = (v) => new THREE.Vector3(v.x, HOVER, v.z);
  const jt = (a, b) => Math.max(Math.abs(a[0] - b[0]) / VMAX[0], Math.abs(a[1] - b[1]) / VMAX[1], Math.abs(a[2] - b[2]) / VMAX[2]);
  let picks = [], plans = [], which = 1, run = null, drag = null;
  function perms(n) { const out = []; const rec = (a, rest) => { if (!rest.length) out.push(a); rest.forEach((x, i) => rec(a.concat(x), rest.slice(0, i).concat(rest.slice(i + 1)))); }; rec([], [...Array(n).keys()]); return out; }
  const ALL = perms(5);
  function solve() {
    picks = cubes.map((c, i) => new THREE.Vector3(c.userData.x0 ?? c.position.x, 0.0275, c.userData.z0 ?? c.position.z));
    const qP = picks.map((p) => arm.ik(hov(p))), qS = slots.map((p) => arm.ik(hov(p))), qH = arm.ik(home);
    const cost = (order, joint) => {
      let total = 0, q = qH, x = home;
      for (const i of order) {
        total += joint ? jt(q, qP[i]) + jt(qP[i], qS[i]) : x.distanceTo(hov(picks[i])) + hov(picks[i]).distanceTo(hov(slots[i]));
        q = qS[i]; x = hov(slots[i]);
      }
      return total;
    };
    let bestE = null, bestJ = null;
    for (const o of ALL) { const e = cost(o, false), j = cost(o, true); if (!bestE || e < bestE.c) bestE = { o, c: e }; if (!bestJ || j < bestJ.c) bestJ = { o, c: j }; }
    plans = [{ name: "shortest Cartesian path", order: bestE.o, time: cost(bestE.o, true), len: bestE.c },
             { name: "shortest joint-space path", order: bestJ.o, time: bestJ.c, len: cost(bestJ.o, false) }];
  }
  function start() {
    cubes.forEach((c, i) => { c.position.copy(picks[i]); c.rotation.y = 0; });
    trail.reset();
    const order = plans[which].order, segs = [];
    let q = arm.ik(home);
    const move = (to, joint) => { const qt = arm.ik(to); segs.push({ q0: q, q1: qt, dur: joint ? Math.max(0.12, jt(q, qt)) : 0.32, }); q = qt; };
    for (const i of order) {
      move(hov(picks[i]), true); move(picks[i]); segs.push({ grab: i }); move(hov(picks[i]));
      move(hov(slots[i]), true); move(slots[i]); segs.push({ drop: i }); move(hov(slots[i]));
    }
    run = { segs, k: 0, u: 0, held: -1, clock: 0, done: false };
    arm.setQ(...arm.ik(home));
  }
  cubes.forEach((c) => { c.userData.x0 = c.position.x; c.userData.z0 = c.position.z; });
  solve(); start();

  function update(t, dt) {
    if (!run || drag) return;
    if (run.done) { run.wait -= dt; if (run.wait < 0) start(); return; }
    let sg = run.segs[run.k];
    while (sg && (sg.grab != null || sg.drop != null)) { if (sg.grab != null) run.held = sg.grab; else { cubes[sg.drop].position.copy(slots[sg.drop]); cubes[sg.drop].position.y = 0.0335; run.held = -1; } sg = run.segs[++run.k]; }
    if (!sg) { run.done = true; run.wait = 2.2; return; }
    run.u += dt / sg.dur; if (sg.dur > 0.33 || true) run.clock += dt;
    const u = Math.min(1, run.u), e = u; // constant joint velocity, i.e. a straight line in joint space
    arm.setQ(sg.q0[0] + (sg.q1[0] - sg.q0[0]) * e, sg.q0[1] + (sg.q1[1] - sg.q0[1]) * e, sg.q0[2] + (sg.q1[2] - sg.q0[2]) * e);
    arm.grip(run.held >= 0 ? 0 : 1);
    const tip = arm.tipWorld(); trail.push(tip);
    if (run.held >= 0) { cubes[run.held].position.copy(tip); cubes[run.held].rotation.y = arm.q[0]; }
    if (run.u >= 1) { run.k++; run.u = 0; }
  }

  s.on("down", () => { const h = s.hit(cubes); if (h) { drag = h.object; return true; } });
  s.on("move", (p) => {
    if (!drag) { s.canvas.style.cursor = s.hit(cubes) ? "move" : ""; return; }
    const q = s.rayY(0.03, p); if (!q) return;
    const x = clamp(q.x, -0.62, 0.62), z = clamp(q.z, -0.2, 0.42);
    if (Math.abs(z - 0.12) < 0.08 && Math.abs(x) < 0.3) return; // keep cubes off the tray
    drag.position.set(x, 0.0275, z); drag.userData.x0 = x; drag.userData.z0 = z;
  });
  s.on("up", () => { if (drag) { cubes.forEach((c, i) => { c.position.set(c.userData.x0, 0.0275, c.userData.z0); }); drag = null; solve(); start(); } });

  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    const order = plans[which].order;
    order.forEach((ci, n) => { s.label(String(n + 1), picks[ci].clone().setY(0.09), "#fff", -6); });
    const bx = 14, by = s.h - 62, bw = Math.min(330, s.w - 28), m = Math.max(plans[0].time, plans[1].time);
    plans.forEach((p, i) => {
      const y = by + i * 26, on = i === which;
      s.text("order by " + p.name, bx, y, on ? C.ink : C.dim, 10.5);
      s.o.globalAlpha = on ? 1 : 0.4; s.o.fillStyle = i ? C.green : C.accent; s.o.fillRect(bx, y + 8, (bw - 70) * p.time / m, 6); s.o.globalAlpha = 1;
      s.text(p.time.toFixed(2) + " s", bx + (bw - 70) * p.time / m + 6, y + 11, on ? C.ink : C.dim, 10.5);
    });
    s.text("time spent on transfer moves (joint speed limits)", bx, by - 16, C.dim, 10.5);
    const same = plans[0].order.join() === plans[1].order.join();
    s.hud("picking order: <b>" + order.map((i) => i + 1).join(" → ") + "</b> · gripper travel " + plans[which].len.toFixed(2) + " m" +
      (same ? "<br>both criteria agree for this layout; drag a cube to change it" : "<br>the two criteria pick <i>different</i> orders · drag the cubes"));
  }
  s.choice(["Cartesian-shortest order", "Joint-space-shortest order"], 1, (i) => { which = i; start(); });
  s.button("Shuffle cubes", () => {
    const r = Math.random;
    cubes.forEach((c) => { let x, z; do { x = (r() - 0.5) * 1.2; z = -0.18 + r() * 0.6; } while ((Math.abs(z - 0.12) < 0.1 && Math.abs(x) < 0.32) || Math.hypot(x, z + 0.34) < 0.3 || Math.hypot(x, z + 0.34) > 0.78); c.userData.x0 = x; c.userData.z0 = z; });
    solve(); start();
  });
  return { update, render };
}, { cam: [1.3, 1.25, 1.75], target: [0, 0.1, 0.02] });
