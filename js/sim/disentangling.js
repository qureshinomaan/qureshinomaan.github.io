/* Disentangling planning and control, as a tactical drawing. You set the
 * intent (where the object should end up). A planner inks a route for the
 * object around the clutter. A separate low-level controller, the small
 * pusher, works out the contact needed to move the object along that route.
 * Once the object is in the clear, the gripper closes on it. */
import { mount, THREE, C, clamp } from "./kit.js";

mount((s) => {
  /* world: a 1.6 x 0.9 m tabletop seen from directly above, drawn on the 2D canvas */
  const WW = 1.6, WH = 0.9, RO = 0.045, RT = 0.026, CELL = 0.02;
  let sc = 1, ox = 0, oy = 0;
  const X = (x) => ox + x * sc, Y = (y) => oy + y * sc;
  const obj = { x: 0.3, y: 0.62 }, goal = { x: 1.3, y: 0.3 }, tool = { x: 0.15, y: 0.75, up: true };
  let clutter = [{ x: 0.62, y: 0.52, r: 0.11 }, { x: 0.86, y: 0.28, r: 0.09 }, { x: 0.95, y: 0.66, r: 0.1 }, { x: 0.55, y: 0.2, r: 0.07 }, { x: 1.2, y: 0.55, r: 0.06 }];
  let usePlanner = true, way = [], wi = 0, state = "approach", trace = [], timer = 0, stuckT = 0, lastX = 0, lastY = 0, inkT = 0, drag = null, jaw = 1;
  const rnd = s.rng(2);

  /* paper */
  const paper = document.createElement("canvas"); paper.width = 900; paper.height = 506;
  { const g = paper.getContext("2d"); g.fillStyle = "#D8C9A4"; g.fillRect(0, 0, 900, 506);
    for (let i = 0; i < 5200; i++) { g.fillStyle = "rgba(" + (rnd() < 0.5 ? "11,16,27" : "255,250,235") + "," + (rnd() * 0.05) + ")"; g.fillRect(rnd() * 900, rnd() * 506, 1 + rnd() * 26, 1 + rnd() * 2); }
    const v = g.createRadialGradient(450, 240, 120, 450, 253, 560); v.addColorStop(0, "rgba(255,244,214,0.25)"); v.addColorStop(1, "rgba(60,40,20,0.38)"); g.fillStyle = v; g.fillRect(0, 0, 900, 506); }

  /* planner: A* over a grid with the clutter inflated by the object's radius, then line-of-sight shortcutting */
  const NX = Math.round(WW / CELL), NY = Math.round(WH / CELL);
  const free = (x, y) => { if (x < RO || y < RO || x > WW - RO || y > WH - RO) return false; for (const c of clutter) if (Math.hypot(x - c.x, y - c.y) < c.r + RO + 0.012) return false; return true; };
  const sight = (a, b) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.y - a.y) / 0.01); for (let i = 0; i <= n; i++) if (!free(a.x + (b.x - a.x) * i / n, a.y + (b.y - a.y) * i / n)) return false; return true; };
  function astar(a, b) {
    const id = (i, j) => j * NX + i, si = clamp(Math.round(a.x / CELL), 0, NX - 1), sj = clamp(Math.round(a.y / CELL), 0, NY - 1), gi = clamp(Math.round(b.x / CELL), 0, NX - 1), gj = clamp(Math.round(b.y / CELL), 0, NY - 1);
    const g = new Float32Array(NX * NY).fill(1e9), from = new Int32Array(NX * NY).fill(-1), open = [[0, si, sj]]; g[id(si, sj)] = 0;
    while (open.length) {
      let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k;
      const [, i, j] = open.splice(bi, 1)[0];
      if (i === gi && j === gj) { const out = []; let c = id(i, j); while (c >= 0) { out.push({ x: (c % NX) * CELL, y: Math.floor(c / NX) * CELL }); c = from[c]; } return out.reverse(); }
      for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
        if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= NX || nj >= NY) continue;
        if (!free(ni * CELL, nj * CELL) && !(ni === gi && nj === gj)) continue;
        const ng = g[id(i, j)] + Math.hypot(di, dj);
        if (ng < g[id(ni, nj)]) { g[id(ni, nj)] = ng; from[id(ni, nj)] = id(i, j); open.push([ng + Math.hypot(gi - ni, gj - nj), ni, nj]); }
      }
    }
    return null;
  }
  function replan() {
    way = [{ x: goal.x, y: goal.y }];
    if (usePlanner) {
      const p = astar(obj, goal);
      if (p && p.length > 2) { const out = []; let a = { x: obj.x, y: obj.y }, i = 1; while (i < p.length) { let j = p.length - 1; while (j > i && !sight(a, p[j])) j--; out.push(p[j]); a = p[j]; i = j + 1; } out[out.length - 1] = { x: goal.x, y: goal.y }; way = out; }
    }
    wi = 0; state = "approach"; trace = [[obj.x, obj.y]]; stuckT = 0; inkT = 0; tool.up = true; jaw = 1;
  }
  replan();

  function moveTool(tx, ty, speed, dt) { const dx = tx - tool.x, dy = ty - tool.y, L = Math.hypot(dx, dy); if (L < 1e-5) return true; const k = Math.min(1, speed * dt / L); tool.x += dx * k; tool.y += dy * k; return L < 0.006; }
  function update(t, dt) {
    inkT += dt;
    if (drag) return;
    if (state === "approach" || state === "push") {
      const w = way[wi]; let dx = w.x - obj.x, dy = w.y - obj.y; const dist = Math.hypot(dx, dy) || 1e-6; dx /= dist; dy /= dist;
      const bx = obj.x - dx * (RO + RT + 0.012), by = obj.y - dy * (RO + RT + 0.012);
      if (state === "approach") { tool.up = Math.hypot(tool.x - bx, tool.y - by) > 0.012; if (moveTool(bx, by, 0.55, dt)) { state = "push"; tool.up = false; } }
      else {
        moveTool(obj.x - dx * (RO + RT - 0.012), obj.y - dy * (RO + RT - 0.012), 0.17, dt);
        if (Math.hypot(tool.x - bx, tool.y - by) > 0.05) state = "approach";
        if (dist < 0.014) { if (wi < way.length - 1) { wi++; state = "approach"; } else { state = "grasp"; timer = 0; } }
        stuckT = Math.hypot(obj.x - lastX, obj.y - lastY) < 0.00004 ? stuckT + dt : 0; lastX = obj.x; lastY = obj.y;
        // contact: the pusher moves the object, clutter stops it
        const cx = obj.x - tool.x, cy = obj.y - tool.y, cd = Math.hypot(cx, cy);
        if (cd < RO + RT && cd > 1e-6) { obj.x += cx / cd * (RO + RT - cd); obj.y += cy / cd * (RO + RT - cd); }
        for (const c of clutter) { const ex = obj.x - c.x, ey = obj.y - c.y, ed = Math.hypot(ex, ey); if (ed < c.r + RO) { obj.x += ex / ed * (c.r + RO - ed); obj.y += ey / ed * (c.r + RO - ed); const tx = obj.x - tool.x, ty = obj.y - tool.y, td = Math.hypot(tx, ty); if (td < RO + RT && td > 1e-6) { tool.x -= tx / td * (RO + RT - td); tool.y -= ty / td * (RO + RT - td); } } }
        obj.x = clamp(obj.x, RO, WW - RO); obj.y = clamp(obj.y, RO, WH - RO);
        const l = trace[trace.length - 1]; if (Math.hypot(obj.x - l[0], obj.y - l[1]) > 0.006) trace.push([obj.x, obj.y]);
      }
    } else if (state === "grasp") {
      timer += dt; tool.up = true; moveTool(obj.x, obj.y, 0.6, dt);
      jaw = clamp(1 - (timer - 0.9) / 0.6, 0, 1);
      if (timer > 3.4) { obj.x = 0.2 + rnd() * 0.25; obj.y = 0.2 + rnd() * 0.5; goal.x = 1.15 + rnd() * 0.3; goal.y = 0.2 + rnd() * 0.5; replan(); }
    }
  }

  /* dragging */
  const toWorld = (p) => ({ x: (p.x - ox) / sc, y: (p.y - oy) / sc });
  s.on("down", (p) => {
    const w = toWorld(p);
    if (Math.hypot(w.x - goal.x, w.y - goal.y) < 0.08) drag = goal; else if (Math.hypot(w.x - obj.x, w.y - obj.y) < 0.07) drag = obj;
    else for (const c of clutter) if (Math.hypot(w.x - c.x, w.y - c.y) < c.r) drag = c;
    if (drag) return true;
  });
  s.on("move", (p) => { if (!drag) return; const w = toWorld(p); drag.x = clamp(w.x, 0.06, WW - 0.06); drag.y = clamp(w.y, 0.06, WH - 0.06); });
  s.on("up", () => { if (drag) { drag = null; replan(); } });

  /* drawing helpers: slightly wobbly ink */
  function ink(pts, color, lw, dash) {
    const o = s.o; o.save(); o.strokeStyle = color; o.lineWidth = lw; o.lineCap = "round"; o.lineJoin = "round"; if (dash) o.setLineDash(dash);
    o.beginPath(); pts.forEach((p, i) => { const wx = Math.sin(p[0] * 61 + p[1] * 37) * 0.7, wy = Math.cos(p[0] * 43 - p[1] * 53) * 0.7; if (i) o.lineTo(X(p[0]) + wx, Y(p[1]) + wy); else o.moveTo(X(p[0]) + wx, Y(p[1]) + wy); }); o.stroke(); o.restore();
  }
  const circle = (x, y, r, n = 40, ph = 0) => { const out = []; for (let i = 0; i <= n; i++) { const a = ph + i / n * 6.2832; out.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return out; };
  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.clear();
    const o = s.o;
    o.drawImage(paper, 0, 0, s.w, s.h);
    sc = Math.min((s.w - 60) / WW, (s.h - 96) / WH); ox = (s.w - WW * sc) / 2; oy = 56 + (s.h - 96 - WH * sc) / 2;
    // table edge and faint grid
    o.strokeStyle = "rgba(11,16,27,0.06)"; o.lineWidth = 1; o.beginPath();
    for (let x = 0; x <= WW + 1e-6; x += 0.1) { o.moveTo(X(x), Y(0)); o.lineTo(X(x), Y(WH)); } for (let y = 0; y <= WH + 1e-6; y += 0.1) { o.moveTo(X(0), Y(y)); o.lineTo(X(WW), Y(y)); } o.stroke();
    ink([[0, 0], [WW, 0], [WW, WH], [0, WH], [0, 0]], "rgba(11,16,27,0.75)", 1.6);
    // clutter: a light green wash with an ink outline and hatching
    for (const c of clutter) {
      o.fillStyle = "rgba(22,59,54,0.2)"; o.beginPath(); o.arc(X(c.x), Y(c.y), c.r * sc, 0, 6.2832); o.fill();
      o.save(); o.beginPath(); o.arc(X(c.x), Y(c.y), c.r * sc, 0, 6.2832); o.clip(); o.strokeStyle = "rgba(22,59,54,0.35)"; o.lineWidth = 1; o.beginPath();
      for (let k = -c.r * 2; k < c.r * 2; k += 0.022) { o.moveTo(X(c.x + k), Y(c.y - c.r)); o.lineTo(X(c.x + k + c.r), Y(c.y + c.r)); } o.stroke(); o.restore();
      ink(circle(c.x, c.y, c.r), "rgba(22,59,54,0.9)", 1.5);
    }
    // goal: a dashed ring with a cross
    ink(circle(goal.x, goal.y, RO + 0.022), "rgba(11,16,27,0.8)", 1.3, [5, 4]);
    ink([[goal.x - 0.02, goal.y], [goal.x + 0.02, goal.y]], "rgba(11,16,27,0.8)", 1.2); ink([[goal.x, goal.y - 0.02], [goal.x, goal.y + 0.02]], "rgba(11,16,27,0.8)", 1.2);
    s.text("destination", X(goal.x) + (RO + 0.03) * sc, Y(goal.y) - 10, "rgba(11,16,27,0.8)", 11);
    // the plan: dry-ink waypoints that appear one after another
    if (state !== "grasp") {
      const pts = [[trace[0][0], trace[0][1]]].concat(way.map((w) => [w.x, w.y])), shown = Math.min(pts.length, 1 + Math.floor(inkT * 9));
      ink(pts.slice(0, shown), "rgba(11,16,27,0.55)", 1.3, [2, 6]);
      way.forEach((w, i) => { if (i + 1 < shown) { o.fillStyle = i >= wi ? "#0B101B" : "rgba(11,16,27,0.3)"; o.beginPath(); o.arc(X(w.x), Y(w.y), 3.2, 0, 6.2832); o.fill(); if (i < way.length - 1) s.text(String(i + 1), X(w.x) + 7, Y(w.y) - 8, "rgba(11,16,27,0.7)", 10); } });
    }
    // contact trace: where the object has actually been pushed
    if (trace.length > 1) ink(trace, "rgba(255,107,94,0.95)", 3);
    // object
    o.fillStyle = "#FF6B5E"; o.beginPath(); o.arc(X(obj.x), Y(obj.y), RO * sc, 0, 6.2832); o.fill(); ink(circle(obj.x, obj.y, RO), "#0B101B", 1.6);
    // pusher or gripper
    if (state === "grasp") {
      const g = (RO + 0.012 + 0.035 * jaw) * sc, x = X(tool.x), y = Y(tool.y);
      o.strokeStyle = "#0B101B"; o.lineWidth = 3; o.lineCap = "round"; o.beginPath(); o.moveTo(x - g, y - 0.05 * sc); o.lineTo(x - g, y + 0.05 * sc); o.moveTo(x + g, y - 0.05 * sc); o.lineTo(x + g, y + 0.05 * sc); o.moveTo(x - g, y - 0.05 * sc); o.lineTo(x + g, y - 0.05 * sc); o.stroke();
      s.text(jaw < 0.05 ? "grasped" : "in the clear: grasp", x + g + 10, y, "rgba(11,16,27,0.85)", 11);
    } else {
      o.fillStyle = tool.up ? "rgba(11,16,27,0.25)" : "#0B101B"; o.beginPath(); o.arc(X(tool.x), Y(tool.y), RT * sc, 0, 6.2832); o.fill();
      if (tool.up) ink(circle(tool.x, tool.y, RT + 0.012), "rgba(11,16,27,0.4)", 1, [2, 3]);
    }
    // legend, in the margin
    const stuck = stuckT > 1.2, tc = "rgba(11,16,27,0.85)";
    s.text("PLANNER", 22, 22, tc, 10.5, "left", "700"); s.text(usePlanner ? (way.length > 1 ? "route around the clutter, " + (way.length - 1) + " waypoints" : "a straight line is free") : "off: push straight at the destination", 92, 22, tc, 11.5);
    s.text("CONTROLLER", 22, 40, tc, 10.5, "left", "700"); s.text(state === "approach" ? "getting behind the object" : state === "push" ? (stuck ? "pushing, but the object is jammed against clutter" : "pushing toward " + (wi < way.length - 1 ? "waypoint " + (wi + 1) : "the destination")) : "object delivered", 112, 40, stuck ? "#b3261e" : tc, 11.5);
    s.hud("");
  }
  s.choice(["Controller only", "Planner + controller"], 1, (i) => { usePlanner = i === 1; replan(); });
  s.button("New layout", () => { clutter = clutter.map((c) => ({ x: 0.5 + rnd() * 0.75, y: 0.15 + rnd() * 0.6, r: c.r })); replan(); });
  s.note("drag the destination, the object or the clutter");
  return { update, render };
}, { floor: false, fog: false, orbit: false, bg: "#D8C9A4" });
