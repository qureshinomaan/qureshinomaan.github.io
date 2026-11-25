/* Disentangling planning and control for non-prehensile manipulation: a
 * planner decides where the object should go next (waypoints around the
 * obstacle), and a separate low-level controller works out how to push it
 * there. Once the object is in the clear it can be grasped. */
import { mount, THREE, C, clamp } from "./kit.js";

mount((s) => {
  s.table(1.5, 1.1);
  const arm = s.arm({ base: [0, 0, -0.36] });
  const RO = 0.045, RT = 0.03, HW = 0.17, HD = 0.03, M = RO + 0.035;
  const puck = new THREE.Mesh(new THREE.CylinderGeometry(RO, RO, 0.05, 40), new THREE.MeshStandardMaterial({ color: 0xff6b5e, roughness: 0.5 }));
  puck.castShadow = true; s.scene.add(puck);
  const wall = s.box([2 * HW, 0.09, 2 * HD], 0x39424e, [0, 0.045, 0.14]);
  const goal = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.068, 48), new THREE.MeshBasicMaterial({ color: 0x7be495, side: THREE.DoubleSide }));
  goal.rotation.x = -Math.PI / 2; s.scene.add(goal);
  const goalHit = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.02, 20), new THREE.MeshBasicMaterial({ visible: false })); s.scene.add(goalHit);
  const planLine = s.trail(0x5ad1e6, 8, 0.95), pushTrail = s.trail(0xff6b5e, 900, 0.6);
  const dots = [0, 1].map(() => { const d = new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color: 0x5ad1e6 })); s.scene.add(d); return d; });

  const tool = new THREE.Vector3(0, 0.3, 0.1);
  let usePlanner = true, way = [], wi = 0, state = "plan", timer = 0, drag = null, stuckT = 0, lastP = new THREE.Vector3(), grip = 0.15;
  function reset() {
    puck.position.set(-0.05, 0.025, 0.36); wall.position.set(0, 0.045, 0.14); goal.position.set(0.08, 0.002, -0.06);
    replan();
  }
  const P2 = (x, z) => new THREE.Vector3(x, 0.025, z);
  function blocked(a, b) { // does segment a-b cross the wall inflated by the object radius?
    for (let i = 0; i <= 40; i++) { const x = a.x + (b.x - a.x) * i / 40, z = a.z + (b.z - a.z) * i / 40; if (Math.abs(x - wall.position.x) < HW + RO && Math.abs(z - wall.position.z) < HD + RO) return true; }
    return false;
  }
  function replan() {
    const a = puck.position, g = P2(goal.position.x, goal.position.z);
    way = [g];
    if (usePlanner && blocked(a, g)) {
      let best = null;
      for (const side of [-1, 1]) {
        const ex = wall.position.x + side * (HW + M), near = Math.sign(a.z - wall.position.z) || 1;
        const w1 = P2(ex, wall.position.z + near * (HD + M)), w2 = P2(ex, wall.position.z - near * (HD + M));
        const len = a.distanceTo(w1) + w1.distanceTo(w2) + w2.distanceTo(g);
        if (!best || len < best.len) best = { len, pts: [w1, w2, g] };
      }
      way = best.pts;
    }
    wi = 0; state = "approach"; stuckT = 0;
    goalHit.position.set(goal.position.x, 0.01, goal.position.z);
    pushTrail.reset();
  }
  reset();

  const d = new THREE.Vector3(), behind = new THREE.Vector3();
  function moveTool(target, speed, dt) { d.copy(target).sub(tool); const L = d.length(); if (L < 1e-4) return true; tool.addScaledVector(d, Math.min(1, speed * dt / L)); return L < 0.006; }
  function update(t, dt) {
    goalHit.position.set(goal.position.x, 0.01, goal.position.z);
    if (drag) { moveTool(new THREE.Vector3(0, 0.3, 0.05), 0.8, dt); arm.solve(tool); return; }
    const p = puck.position, target = way[wi];
    let gT = 0.15;
    if (state === "approach" || state === "push") {
      d.set(target.x - p.x, 0, target.z - p.z); const dist = d.length(); d.normalize();
      behind.set(p.x - d.x * (RO + RT + 0.012), 0.03, p.z - d.z * (RO + RT + 0.012));
      if (state === "approach") { // lift, travel above, come down behind the object
        const over = new THREE.Vector3(behind.x, 0.16, behind.z);
        if (tool.y < 0.15 && Math.hypot(tool.x - behind.x, tool.z - behind.z) > 0.02) moveTool(new THREE.Vector3(tool.x, 0.16, tool.z), 0.7, dt);
        else if (Math.hypot(tool.x - behind.x, tool.z - behind.z) > 0.008) moveTool(over, 0.7, dt);
        else if (moveTool(behind, 0.5, dt)) state = "push";
      } else {
        // low-level controller: push toward the current waypoint, correcting sideways drift
        const aim = new THREE.Vector3(p.x - d.x * (RO + RT - 0.012), 0.03, p.z - d.z * (RO + RT - 0.012));
        moveTool(aim, 0.16, dt);
        const off = Math.hypot(tool.x - behind.x, tool.z - behind.z);
        if (off > 0.05) state = "approach";
        if (dist < 0.014) { if (wi < way.length - 1) { wi++; state = "approach"; } else { state = "grasp"; timer = 0; } }
        stuckT = p.distanceTo(lastP) < 0.00005 ? stuckT + dt : 0; lastP.copy(p);
      }
      // contact: the tool pushes the object, the wall stops it
      const cx = p.x - tool.x, cz = p.z - tool.z, cd = Math.hypot(cx, cz);
      if (tool.y < 0.07 && cd < RO + RT && cd > 1e-5) { p.x += cx / cd * (RO + RT - cd); p.z += cz / cd * (RO + RT - cd); }
      const wx = p.x - wall.position.x, wz = p.z - wall.position.z;
      if (Math.abs(wx) < HW + RO && Math.abs(wz) < HD + RO) {
        const px = HW + RO - Math.abs(wx), pz = HD + RO - Math.abs(wz);
        if (px < pz) p.x += Math.sign(wx) * px; else p.z += (Math.sign(wz) || 1) * pz;
        const tx = p.x - tool.x, tz = p.z - tool.z, td = Math.hypot(tx, tz);
        if (td < RO + RT && td > 1e-5) { tool.x -= tx / td * (RO + RT - td); tool.z -= tz / td * (RO + RT - td); }
      }
      p.x = clamp(p.x, -0.68, 0.68); p.z = clamp(p.z, -0.15, 0.48);
      pushTrail.push(p);
    } else if (state === "grasp") { // free of the obstacle: pick it up
      timer += dt; gT = timer < 1.5 ? 1 : 0.35;
      if (timer < 0.7) moveTool(new THREE.Vector3(p.x, 0.17, p.z), 0.7, dt);
      else if (timer < 1.5) moveTool(new THREE.Vector3(p.x, 0.03, p.z), 0.5, dt);
      else if (timer < 2.6) { if (timer > 1.75) { moveTool(new THREE.Vector3(p.x, 0.24, p.z), 0.4, dt); p.y = tool.y - 0.005; } }
      else if (timer > 3.6) {
        p.y = 0.025; const r = Math.random;
        puck.position.set((r() - 0.5) * 0.5, 0.025, 0.3 + r() * 0.12); goal.position.set((r() - 0.5) * 0.4, 0.002, -0.08 + r() * 0.06); wall.position.x = (r() - 0.5) * 0.2;
        replan();
      }
    }
    grip += (gT - grip) * Math.min(1, dt * 10);
    arm.solve(tool); arm.grip(grip);
    planLine.set(state === "grasp" ? [] : [P2(p.x, p.z).setY(0.004)].concat(way.slice(wi).map((w) => w.clone().setY(0.004))));
    dots.forEach((m, i) => { const w = way.length > 1 ? way[i] : null; m.visible = !!w && i >= wi && state !== "grasp"; if (w) m.position.set(w.x, 0.006, w.z); });
  }

  const draggable = [puck, wall, goalHit];
  s.on("down", () => { const h = s.hit(draggable); if (h) { drag = h.object; return true; } });
  s.on("move", (p) => {
    if (!drag) { s.canvas.style.cursor = s.hit(draggable) ? "move" : ""; return; }
    const q = s.rayY(0.03, p); if (!q) return;
    const x = clamp(q.x, -0.55, 0.55), z = clamp(q.z, -0.12, 0.44);
    if (drag === goalHit) goal.position.set(x, 0.002, z); else { drag.position.x = x; drag.position.z = z; }
  });
  s.on("up", () => { if (drag) { drag = null; puck.position.y = 0.025; replan(); } });

  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    s.label("goal", goal.position, C.green, 16);
    const stuck = stuckT > 1.2;
    s.hud("<b>planner</b>: " + (usePlanner ? (way.length > 1 ? "route around the wall, " + (way.length - 1) + " waypoints" : "straight line is free") : "<i>off, object is pushed straight at the goal</i>") +
      " · <b>controller</b>: " + (state === "approach" ? "getting behind the object" : state === "push" ? (stuck ? "<i>pushing, but the object is jammed against the wall</i>" : "pushing to " + (wi < way.length - 1 ? "waypoint " + (wi + 1) : "the goal")) : "<u>object is in the clear → grasp</u>") +
      "<br>drag the object, the wall or the goal ring");
  }
  s.choice(["Controller only", "Planner + controller"], 1, (i) => { usePlanner = i === 1; replan(); });
  s.button("Reset", reset);
  return { update, render };
}, { cam: [1.15, 1.35, 1.6], target: [0, 0.05, 0.08] });
