/* Shared three.js runtime for the interactive simulators on the paper pages.
 *
 *   import { mount, THREE, C } from "./kit.js";
 *   mount(function (s) { ...build scene...; return { update(t, dt) {}, render() {} }; }, options);
 *
 * `s` gives a scene, camera, renderer, orbit controls, a 2D overlay canvas for
 * labels and plots, pointer helpers and small UI builders (buttons, sliders).
 */
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export { THREE };

export const C = {
  bg: "#0d1015", ink: "#ece9e2", dim: "#8a93a3", accent: "#ff6b5e", cyan: "#5ad1e6",
  green: "#7be495", yellow: "#ffd166", violet: "#b79cff", blue: "#6ea8ff", steel: "#cfd6de"
};
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text != null) e.textContent = text;
  return e;
}

export function mount(init, opts = {}) {
  const root = document.getElementById("sim");
  if (!root) return;
  root.innerHTML = "";
  const stage = el("div", "sim-stage");
  const canvas = el("canvas", "sim-gl");
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", root.getAttribute("data-label") || "Interactive 3D simulator");
  const overlay = el("canvas", "sim-overlay");
  const hud = el("div", "sim-hud");
  stage.append(canvas, overlay, hud);
  const controlsBar = el("div", "sim-controls");
  root.append(stage, controlsBar);

  function fail(err) {
    hud.innerHTML = "<b>Simulator unavailable.</b> " + String((err && err.message) || err);
    if (window.console) console.error(err);
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: "high-performance" });
  } catch (err) {
    fail("This needs WebGL, which your browser did not provide. The text on this page covers the same idea.");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(opts.bg || C.bg);
  if (opts.fog !== false) scene.fog = new THREE.Fog(opts.bg || C.bg, opts.fogNear || 5, opts.fogFar || 16);

  const camera = new THREE.PerspectiveCamera(opts.fov || 40, 16 / 9, 0.02, 200);
  camera.position.fromArray(opts.cam || [1.7, 1.25, 1.9]);

  const hemi = new THREE.HemisphereLight(0xcfe0ff, 0x1c1612, 1.0);
  const sun = new THREE.DirectionalLight(0xffffff, 2.4);
  sun.position.set(2.2, 4.2, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  const sc = sun.shadow.camera, ext = opts.shadowExtent || 2.6;
  sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 0.5; sc.far = 14;
  sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
  const rim = new THREE.PointLight(0xff6b5e, 6, 9);
  rim.position.set(-2.4, 1.6, -2.2);
  [hemi, sun, rim].forEach((l) => { l.layers.enableAll(); scene.add(l); });

  let floor = null;
  if (opts.floor !== false) {
    const fy = opts.floorY == null ? -0.72 : opts.floorY;
    floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshStandardMaterial({ color: 0x12161c, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = fy; floor.receiveShadow = true;
    const grid = new THREE.GridHelper(60, 120, 0x2a323d, 0x1b2129);
    grid.position.y = fy + 0.002;
    scene.add(floor, grid);
  }

  /* ---------- pointer (registered before OrbitControls so drags can claim the gesture) ---------- */
  const handlers = { down: [], move: [], up: [] };
  const pointer = { x: 0, y: 0, nx: 0, ny: 0, down: false };
  function toLocal(e) {
    const r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top;
    pointer.nx = (pointer.x / r.width) * 2 - 1; pointer.ny = -(pointer.y / r.height) * 2 + 1;
    pointer.shift = e.shiftKey;
  }
  let claimed = false, orbit = null;
  canvas.addEventListener("pointerdown", (e) => {
    toLocal(e); pointer.down = true; claimed = false;
    for (const fn of handlers.down) if (fn(pointer) === true) claimed = true;
    if (claimed) { orbit.enabled = false; try { canvas.setPointerCapture(e.pointerId); } catch (err) {} }
  });
  canvas.addEventListener("pointermove", (e) => { toLocal(e); for (const fn of handlers.move) fn(pointer); });
  function up() {
    if (!pointer.down) return;
    pointer.down = false;
    for (const fn of handlers.up) fn(pointer);
    if (claimed) { claimed = false; orbit.enabled = opts.orbit !== false; }
  }
  canvas.addEventListener("pointerup", up);
  canvas.addEventListener("pointercancel", up);

  orbit = new OrbitControls(camera, canvas);
  orbit.target.fromArray(opts.target || [0, 0.22, 0]);
  orbit.enableDamping = true; orbit.dampingFactor = 0.08;
  orbit.minDistance = opts.minDist || 0.8; orbit.maxDistance = opts.maxDist || 7;
  orbit.maxPolarAngle = opts.maxPolar || Math.PI * 0.495;
  orbit.enablePan = false;
  orbit.enabled = opts.orbit !== false;
  orbit.update();

  const o = overlay.getContext("2d");
  const raycaster = new THREE.Raycaster();
  const tmpV = new THREE.Vector3();

  const s = {
    THREE, C, scene, camera, renderer, orbit, canvas, o, pointer, floor,
    lights: { hemi, sun, rim },
    w: 800, h: 450, t: 0,
    on(type, fn) { handlers[type].push(fn); },
    hud(html) { if (hud.innerHTML !== html) hud.innerHTML = html; },

    /* ---------- UI ---------- */
    button(label, fn) {
      const b = el("button", "sim-btn", label); b.type = "button";
      b.addEventListener("click", () => fn(b));
      controlsBar.appendChild(b); return b;
    },
    toggle(label, value, fn) {
      const b = el("button", "sim-btn sim-toggle", label); b.type = "button";
      const sync = () => b.setAttribute("aria-pressed", value ? "true" : "false");
      b.addEventListener("click", () => { value = !value; sync(); fn(value); });
      b.set = (v) => { value = v; sync(); };
      sync(); controlsBar.appendChild(b); return b;
    },
    choice(labels, index, fn) {
      const g = el("div", "sim-choice"), btns = [];
      labels.forEach((l, i) => {
        const b = el("button", "sim-btn", l); b.type = "button";
        b.setAttribute("aria-pressed", i === index ? "true" : "false");
        b.addEventListener("click", () => { g.set(i); fn(i); });
        btns.push(b); g.appendChild(b);
      });
      g.set = (i) => btns.forEach((b, j) => b.setAttribute("aria-pressed", j === i ? "true" : "false"));
      controlsBar.appendChild(g); return g;
    },
    slider(label, min, max, value, step, fn, fmt) {
      const wrap = el("label", "sim-slider");
      const input = el("input"); input.type = "range";
      input.min = min; input.max = max; input.step = step; input.value = value;
      const out = el("output", null, fmt ? fmt(value) : String(value));
      input.addEventListener("input", () => {
        const v = parseFloat(input.value);
        out.textContent = fmt ? fmt(v) : String(v); fn(v);
      });
      wrap.append(el("span", null, label), input, out);
      controlsBar.appendChild(wrap); return input;
    },
    note(text) { const n = el("span", "sim-note", text); controlsBar.appendChild(n); return n; },

    /* ---------- picking ---------- */
    ray(p) { raycaster.setFromCamera({ x: (p || pointer).nx, y: (p || pointer).ny }, camera); return raycaster; },
    /** Where the pointer ray meets the horizontal plane y = height (or null). */
    rayY(height, p) {
      const r = s.ray(p).ray;
      if (Math.abs(r.direction.y) < 1e-5) return null;
      const k = (height - r.origin.y) / r.direction.y;
      if (k <= 0) return null;
      return r.origin.clone().addScaledVector(r.direction, k);
    },
    hit(objects, p) { const h = s.ray(p).intersectObjects(objects, true); return h.length ? h[0] : null; },
    /** Project a world point into overlay pixels, optionally inside an inset rect of another camera. */
    project(v, cam, rect) {
      tmpV.copy(v).project(cam || camera);
      const r = rect || { x: 0, y: 0, w: s.w, h: s.h };
      return { x: r.x + (tmpV.x * 0.5 + 0.5) * r.w, y: r.y + (-tmpV.y * 0.5 + 0.5) * r.h, behind: tmpV.z > 1 };
    },

    /* ---------- rendering ---------- */
    /** Render `cam` into a rectangle given in overlay pixels (top-left origin). */
    view(cam, rect, sceneOverride) {
      const r = rect || { x: 0, y: 0, w: s.w, h: s.h };
      renderer.setViewport(r.x, s.h - r.y - r.h, r.w, r.h);
      renderer.setScissor(r.x, s.h - r.y - r.h, r.w, r.h);
      renderer.setScissorTest(true);
      renderer.render(sceneOverride || scene, cam);
    },
    /** Rounded frame with a label for an inset view, drawn on the overlay. */
    frame(rect, label, color) {
      o.save();
      o.strokeStyle = color || "rgba(255,255,255,0.55)"; o.lineWidth = 1.5;
      o.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
      if (label) {
        o.font = "600 10.5px " + MONO;
        const tw = o.measureText(label).width + 12;
        o.fillStyle = color || "rgba(13,16,21,0.85)"; o.fillRect(rect.x, rect.y, tw, 17);
        o.fillStyle = color ? "#14100f" : C.ink; o.textBaseline = "middle"; o.textAlign = "left";
        o.fillText(label, rect.x + 6, rect.y + 9);
      }
      o.restore();
    },
    text(str, x, y, color, size, align, weight) {
      o.fillStyle = color || C.ink; o.font = (weight || "500") + " " + (size || 11.5) + "px " + MONO;
      o.textAlign = align || "left"; o.textBaseline = "middle"; o.fillText(str, x, y);
    },
    label(str, v, color, dy) {
      const p = s.project(v); if (p.behind) return;
      o.font = "600 11px " + MONO;
      const tw = o.measureText(str).width + 10, x = p.x - tw / 2, y = p.y + (dy == null ? -22 : dy);
      o.fillStyle = "rgba(13,16,21,0.8)"; o.fillRect(x, y - 8, tw, 16);
      o.fillStyle = color || C.ink; o.textAlign = "center"; o.textBaseline = "middle"; o.fillText(str, p.x, y);
    },
    line(x1, y1, x2, y2, color, lw, dash) {
      o.save(); if (dash) o.setLineDash(dash);
      o.strokeStyle = color; o.lineWidth = lw || 1.5; o.lineCap = "round";
      o.beginPath(); o.moveTo(x1, y1); o.lineTo(x2, y2); o.stroke(); o.restore();
    },
    arrow(x1, y1, x2, y2, color, lw) {
      const a = Math.atan2(y2 - y1, x2 - x1), hd = Math.min(7, Math.hypot(x2 - x1, y2 - y1) * 0.5);
      s.line(x1, y1, x2, y2, color, lw);
      o.fillStyle = color; o.beginPath(); o.moveTo(x2, y2);
      o.lineTo(x2 - hd * Math.cos(a - 0.45), y2 - hd * Math.sin(a - 0.45));
      o.lineTo(x2 - hd * Math.cos(a + 0.45), y2 - hd * Math.sin(a + 0.45));
      o.closePath(); o.fill();
    },
    dot(x, y, r, fill, stroke) {
      o.beginPath(); o.arc(x, y, r, 0, 6.2832);
      if (fill) { o.fillStyle = fill; o.fill(); }
      if (stroke) { o.strokeStyle = stroke; o.lineWidth = 1.5; o.stroke(); }
    },
    /** Small line chart panel. `series` = [{ data: [..], color }]. */
    plot(rect, series, title, ymax) {
      o.save();
      o.fillStyle = "rgba(13,16,21,0.82)"; o.fillRect(rect.x, rect.y, rect.w, rect.h);
      o.strokeStyle = "rgba(255,255,255,0.25)"; o.lineWidth = 1; o.strokeRect(rect.x + 0.5, rect.y + 0.5, rect.w - 1, rect.h - 1);
      s.text(title, rect.x + 7, rect.y + 10, C.dim, 10.5);
      let m = ymax || 1e-9;
      if (!ymax) for (const se of series) for (const v of se.data) if (v > m) m = v;
      for (const se of series) {
        const n = se.data.length; if (n < 2) continue;
        o.strokeStyle = se.color; o.lineWidth = 1.6; o.beginPath();
        for (let i = 0; i < n; i++) {
          const x = rect.x + 6 + (i / Math.max(n - 1, se.span || 1)) * (rect.w - 12);
          const y = rect.y + rect.h - 6 - Math.min(1, se.data[i] / m) * (rect.h - 26);
          if (i) o.lineTo(x, y); else o.moveTo(x, y);
        }
        o.stroke();
      }
      o.restore();
    },

    /* ---------- scene furniture ---------- */
    /** A table whose top surface is at y = 0. */
    table(w = 1.7, d = 1.15, color = 0xcdb894) {
      const g = new THREE.Group();
      const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, d), new THREE.MeshStandardMaterial({ color, roughness: 0.75 }));
      top.position.y = -0.025; top.receiveShadow = true; top.castShadow = true; g.add(top);
      const legM = new THREE.MeshStandardMaterial({ color: 0x2b323c, roughness: 0.6, metalness: 0.4 });
      const fy = floor ? floor.position.y : -0.72;
      for (const [sx, sz] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, -fy - 0.05, 0.05), legM);
        leg.position.set(sx * (w / 2 - 0.07), (fy - 0.05) / 2, sz * (d / 2 - 0.07)); leg.castShadow = true; g.add(leg);
      }
      g.userData.top = top;
      scene.add(g); return g;
    },
    box(size, color, pos, opts2 = {}) {
      const dims = Array.isArray(size) ? size : [size, size, size];
      const m = new THREE.Mesh(new THREE.BoxGeometry(dims[0], dims[1], dims[2]),
        new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.55 }, opts2)));
      m.castShadow = true; m.receiveShadow = true;
      if (pos) m.position.fromArray(pos);
      scene.add(m); return m;
    },
    /** A polyline in 3D that can be rewritten every frame. */
    trail(color, max = 600, opacity = 1) {
      const geo = new THREE.BufferGeometry();
      const arr = new Float32Array(max * 3);
      geo.setAttribute("position", new THREE.BufferAttribute(arr, 3));
      geo.setDrawRange(0, 0);
      const line = new THREE.Line(geo, new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }));
      line.frustumCulled = false; scene.add(line);
      let n = 0;
      line.push = (v) => {
        if (n >= max) { arr.copyWithin(0, 3); n = max - 1; }
        arr[n * 3] = v.x; arr[n * 3 + 1] = v.y; arr[n * 3 + 2] = v.z; n++;
        geo.setDrawRange(0, n); geo.attributes.position.needsUpdate = true;
      };
      line.set = (pts) => { n = 0; for (const p of pts) line.push(p); if (!pts.length) geo.setDrawRange(0, 0); };
      line.reset = () => { n = 0; geo.setDrawRange(0, 0); };
      return line;
    },
    arm(o2) { return makeArm(scene, o2); },
    /** A poster with a button; resolves when the visitor chooses to load a heavy scene. */
    gate(label, sub) {
      let auto = false;
      try { auto = new URLSearchParams(location.search).has("autoload"); } catch (err) {}
      if (auto) return Promise.resolve();
      return new Promise((resolve) => {
        const g = el("div", "sim-gate");
        const b = el("button", "sim-btn sim-gate-btn", label); b.type = "button";
        g.append(b); if (sub) g.append(el("div", "sim-gate-sub", sub));
        stage.appendChild(g);
        b.addEventListener("click", () => { g.remove(); resolve(); });
      });
    },
    busy(text) { let n = stage.querySelector(".sim-busy"); if (!text) { if (n) n.remove(); return; } if (!n) { n = el("div", "sim-busy"); stage.appendChild(n); } n.textContent = text; },
    rng(seed) {
      let a = seed >>> 0;
      return () => {
        a = (a + 0x6D2B79F5) >>> 0; let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
  };

  function resize() {
    const w = Math.max(1, Math.round(stage.clientWidth)), h = Math.round(w * 9 / 16);
    if (w === s.w && h === s.h && canvas.width > 1) return;
    s.w = w; s.h = h;
    renderer.setSize(w, h, false);
    const dpr = renderer.getPixelRatio();
    overlay.width = Math.round(w * dpr); overlay.height = Math.round(h * dpr);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  resize();

  let sim;
  try { sim = init(s) || {}; } catch (err) { fail(err); return; }

  // ?ff=N fast-forwards N simulation ticks on load (used for testing and for linking to a later state).
  let ff = 0;
  try { ff = Math.min(20000, parseInt(new URLSearchParams(location.search).get("ff"), 10) || 0); } catch (err) {}
  let visible = true, last = 0, raf = 0, dead = false;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((en) => {
      visible = en[0].isIntersecting;
      if (visible && !raf && !dead) { last = 0; raf = requestAnimationFrame(frame); }
    }).observe(stage);
  }
  function frame(now) {
    raf = 0;
    if (!visible || dead) return;
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
    last = now; s.t += dt;
    try {
      resize();
      const dpr = renderer.getPixelRatio();
      o.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.clearRect(0, 0, s.w, s.h);
      orbit.update();
      while (ff > 0 && sim.update) { ff--; s.t += 1 / 60; sim.update(s.t, 1 / 60); }
      if (sim.update) sim.update(s.t, dt);
      if (sim.render) sim.render();
      else { renderer.setScissorTest(false); renderer.setViewport(0, 0, s.w, s.h); renderer.render(scene, camera); }
      if (sim.after) sim.after(s.t, dt);
    } catch (err) { dead = true; fail(err); return; }
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
  return s;
}

/* ------------------------------------------------------------------------- *
 * A simple 4-joint arm (base yaw, shoulder, elbow, wrist) whose tool always
 * points straight down. `solve(target)` is closed-form inverse kinematics.
 * ------------------------------------------------------------------------- */
export function makeArm(scene, o = {}) {
  const L1 = o.L1 || 0.44, L2 = o.L2 || 0.40, SH = 0.2, TOOL = 0.15;
  const linkM = new THREE.MeshStandardMaterial({ color: o.color || 0xe6eaee, roughness: 0.42, metalness: 0.12 });
  const jointM = new THREE.MeshStandardMaterial({ color: o.joint || 0xff6b5e, roughness: 0.4, metalness: 0.3 });
  const darkM = new THREE.MeshStandardMaterial({ color: 0x242a33, roughness: 0.5, metalness: 0.6 });
  if (o.opacity != null) for (const m of [linkM, jointM, darkM]) { m.transparent = true; m.opacity = o.opacity; }
  const meshes = [];
  const mk = (geo, mat, parent, pos, rot) => {
    const m = new THREE.Mesh(geo, mat); m.castShadow = o.opacity == null; m.receiveShadow = o.opacity == null;
    if (pos) m.position.fromArray(pos); if (rot) m.rotation.fromArray(rot);
    parent.add(m); meshes.push(m); return m;
  };
  const root = new THREE.Group();
  root.position.fromArray(o.base || [0, 0, 0]);
  scene.add(root);
  mk(new THREE.CylinderGeometry(0.1, 0.115, 0.06, 40), darkM, root, [0, 0.03, 0]);
  const yaw = new THREE.Group(); root.add(yaw);
  mk(new THREE.CylinderGeometry(0.075, 0.085, SH - 0.06, 40), linkM, yaw, [0, 0.06 + (SH - 0.06) / 2, 0]);
  const shoulder = new THREE.Group(); shoulder.position.y = SH; yaw.add(shoulder);
  const hub = (parent, r, len) => mk(new THREE.CylinderGeometry(r, r, len, 32), jointM, parent, null, [0, 0, Math.PI / 2]);
  hub(shoulder, 0.066, 0.15);
  mk(new THREE.CapsuleGeometry(0.046, L1 - 0.06, 6, 24), linkM, shoulder, [0, L1 / 2, 0]);
  const elbow = new THREE.Group(); elbow.position.y = L1; shoulder.add(elbow);
  hub(elbow, 0.055, 0.13);
  mk(new THREE.CapsuleGeometry(0.038, L2 - 0.05, 6, 24), linkM, elbow, [0, L2 / 2, 0]);
  const wrist = new THREE.Group(); wrist.position.y = L2; elbow.add(wrist);
  hub(wrist, 0.044, 0.1);
  mk(new THREE.CylinderGeometry(0.03, 0.03, 0.07, 24), darkM, wrist, [0, 0.045, 0]);
  mk(new THREE.BoxGeometry(0.15, 0.022, 0.05), darkM, wrist, [0, 0.085, 0]);
  const fingerG = new THREE.BoxGeometry(0.014, 0.075, 0.036);
  const f1 = mk(fingerG, linkM, wrist, [0.05, 0.13, 0]);
  const f2 = mk(fingerG, linkM, wrist, [-0.05, 0.13, 0]);
  const tip = new THREE.Object3D(); tip.position.y = TOOL; wrist.add(tip);

  const q = [0, 0.5, 1.6];
  const arm = {
    root, yaw, shoulder, elbow, wrist, tip, meshes, L1, L2, SH, TOOL, q,
    reach: L1 + L2 - 0.02,
    /** Joint angles: [base yaw, shoulder from vertical, elbow bend]. */
    setQ(a, b, c) {
      q[0] = a; q[1] = b; q[2] = c;
      yaw.rotation.y = a; shoulder.rotation.x = b; elbow.rotation.x = c;
      wrist.rotation.x = Math.PI - b - c; // keep the tool vertical
    },
    /** Closed-form IK for a tool-tip target in world coordinates. Returns the joint angles. */
    ik(target) {
      const x = target.x - root.position.x, z = target.z - root.position.z;
      const r = Math.hypot(x, z), h = target.y + TOOL - root.position.y - SH;
      let d = Math.hypot(r, h);
      d = Math.min(L1 + L2 - 0.01, Math.max(Math.abs(L1 - L2) + 0.03, d));
      const phi = Math.atan2(h, r);
      const A = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
      const B = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + L2 * L2 - d * d) / (2 * L1 * L2))));
      return [r < 1e-4 ? q[0] : Math.atan2(x, z), Math.PI / 2 - (phi + A), Math.PI - B];
    },
    solve(target) { const a = arm.ik(target); arm.setQ(a[0], a[1], a[2]); return a; },
    /** 0 = closed on a small cube, 1 = open. */
    grip(v) { const w = 0.03 + 0.03 * v; f1.position.x = w; f2.position.x = -w; },
    tipWorld(out) { root.updateMatrixWorld(true); return tip.getWorldPosition(out || new THREE.Vector3()); }
  };
  arm.setQ(q[0], q[1], q[2]); arm.grip(1);
  return arm;
}

export const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const lerp = (a, b, u) => a + (b - a) * u;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
