/* Flow-synthesis obstacle avoidance: a micro air vehicle flies among
 * high-rises with one forward camera. The building in its line of attack is
 * segmented, a flow is synthesised that would slide that mask out of the way,
 * and a visual-servoing controller flies so that the flow is realised. */
import { mount, THREE, C, clamp } from "./kit.js";

mount((s) => {
  const rnd = s.rng(21);
  s.scene.fog = new THREE.Fog(0x0b0e14, 40, 170);
  s.scene.background = new THREE.Color(0x0b0e14);
  s.lights.sun.castShadow = false; s.lights.rim.intensity = 0;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.MeshStandardMaterial({ color: 0x10141b, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; s.scene.add(ground);
  const grid = new THREE.GridHelper(600, 60, 0x27303b, 0x1a212a); grid.position.y = 0.02; s.scene.add(grid);

  /* building facade texture with lit windows */
  function facade(seed) {
    const r = s.rng(seed), cv = document.createElement("canvas"); cv.width = 64; cv.height = 128;
    const g = cv.getContext("2d"); g.fillStyle = "#1b2430"; g.fillRect(0, 0, 64, 128);
    for (let y = 4; y < 124; y += 8) for (let x = 4; x < 60; x += 8) {
      const lit = r() < 0.42; g.fillStyle = lit ? (r() < 0.75 ? "#ffd98a" : "#9fd8ff") : "#232e3c"; g.fillRect(x, y, 5, 5);
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
  }
  const texs = [facade(1), facade(2), facade(3)];
  const unit = new THREE.BoxGeometry(1, 1, 1); unit.translate(0, 0.5, 0);
  const B = [];
  const ROW = 15;
  function place(b, z, cx) {
    b.w = 6 + rnd() * 5; b.d = 6 + rnd() * 4; b.h = 16 + rnd() * 26;
    b.x = cx + (rnd() - 0.5) * 70; b.z = z + (rnd() - 0.5) * 4;
    b.mesh.scale.set(b.w, b.h, b.d); b.mesh.position.set(b.x, 0, b.z);
  }
  for (let i = 0; i < 54; i++) {
    const tex = texs[i % 3];
    const mat = new THREE.MeshStandardMaterial({ color: 0x8a97a8, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.55, roughness: 0.8 });
    const b = { mesh: new THREE.Mesh(unit, mat) }; s.scene.add(b.mesh); B.push(b);
    place(b, -30 - Math.floor(i / 3) * ROW, 0);
  }

  /* the vehicle */
  const mav = new THREE.Group();
  const bodyM = new THREE.MeshStandardMaterial({ color: 0xe8ebef, roughness: 0.4, metalness: 0.3 });
  mav.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.28, 1.2), bodyM));
  const rotors = [];
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const armM = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.5), bodyM);
    armM.position.set(x * 0.55, 0, z * 0.55); armM.rotation.y = x * z * Math.PI / 4; mav.add(armM);
    const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 24), new THREE.MeshStandardMaterial({ color: 0xff6b5e, emissive: 0xff6b5e, emissiveIntensity: 0.6, transparent: true, opacity: 0.55 }));
    rot.position.set(x * 1.05, 0.14, z * 1.05); mav.add(rot); rotors.push(rot);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 12), new THREE.MeshStandardMaterial({ color: 0x5ad1e6, emissive: 0x5ad1e6, emissiveIntensity: 1 }));
  nose.position.z = -0.62; mav.add(nose);
  mav.traverse((o) => o.layers.set(3)); s.camera.layers.enable(3);
  mav.position.set(0, 9, 0); s.scene.add(mav);
  const trail = s.trail(0x5ad1e6, 500, 0.8); trail.layers.set(3);
  const eye = new THREE.PerspectiveCamera(70, 4 / 3, 0.3, 300);

  let speed = 9, avoid = true, vx = 0, flash = 0, hits = 0, cleared = 0, obstacle = null, dir = 0, lastOb = null;
  const MARGIN = 2.4;
  function update(t, dt) {
    const p = mav.position;
    // which building is in the line of attack?
    obstacle = null; let best = 60;
    for (const b of B) {
      const ahead = (p.z - b.z) - b.d / 2;
      if (ahead > -b.d && ahead < best && Math.abs(p.x - b.x) < b.w / 2 + MARGIN && b.h > p.y) { best = ahead; obstacle = b; }
    }
    let target = 0;
    if (obstacle) {
      if (obstacle !== lastOb) { dir = p.x >= obstacle.x ? 1 : -1; lastOb = obstacle; }
      // remaining image-space displacement of the mask, turned into a lateral velocity command
      const remaining = obstacle.w / 2 + MARGIN - dir * (p.x - obstacle.x);
      if (avoid) target = dir * clamp(remaining * 2.2, 0, 1) * Math.max(6, speed * 1.1);
    } else if (lastOb) { cleared++; lastOb = null; }
    vx += (target - vx) * Math.min(1, dt * 5);
    const slow = obstacle && avoid ? clamp(best / 22, 0.25, 1) : 1;
    p.x += vx * dt; p.z -= speed * slow * dt;
    mav.rotation.z = -vx * 0.035; mav.rotation.x = -0.06 * slow;
    for (const r of rotors) r.rotation.y += dt * 40;
    // collision (only reachable with avoidance switched off)
    for (const b of B) if (Math.abs(p.x - b.x) < b.w / 2 && Math.abs(p.z - b.z) < b.d / 2 && p.y < b.h && flash <= 0) { flash = 1; hits++; }
    flash = Math.max(0, flash - dt * 1.5);
    for (const b of B) {
      if (b.z > p.z + 25) { let minZ = 0; for (const o of B) minZ = Math.min(minZ, o.z); place(b, Math.round(minZ / ROW) * ROW - (b.idx % 3 === 0 ? ROW : 0), p.x); }
      b.mesh.material.emissive.setHex(b === obstacle ? 0xff6b5e : 0xffffff);
      b.mesh.material.emissiveIntensity = b === obstacle ? 0.9 : 0.55;
    }
    trail.push(p);
    // chase camera: keep the user's orbit, follow the vehicle
    const d = p.clone().sub(s.orbit.target); d.y = 0;
    s.camera.position.add(d); s.orbit.target.add(d);
    ground.position.set(Math.round(p.x / 10) * 10, 0, Math.round(p.z / 10) * 10); grid.position.x = ground.position.x; grid.position.z = ground.position.z;
    eye.position.copy(p); eye.rotation.set(0, 0, 0); eye.updateMatrixWorld(true);
  }
  B.forEach((b, i) => { b.idx = i; });

  const corner = new THREE.Vector3();
  function render() {
    const r = s.renderer, o = s.o;
    r.setScissorTest(false); r.setViewport(0, 0, s.w, s.h); r.render(s.scene, s.camera);
    const w = Math.min(280, Math.round(s.w * 0.36)), h = Math.round(w * 3 / 4), rect = { x: 10, y: s.h - h - 10, w, h };
    s.view(eye, rect);
    if (obstacle) {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const sx of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) for (const sy of [0, 1]) {
        corner.set(obstacle.x + sx * obstacle.w, sy * obstacle.h, obstacle.z + sz * obstacle.d);
        if (corner.z > mav.position.z - 0.5) corner.z = mav.position.z - 0.5;
        const q = s.project(corner, eye, rect);
        x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);
      }
      const cx0 = clamp(x0, rect.x, rect.x + w), cx1 = clamp(x1, rect.x, rect.x + w), cy0 = clamp(y0, rect.y + 17, rect.y + h), cy1 = clamp(y1, rect.y + 17, rect.y + h);
      o.fillStyle = "rgba(255,107,94,0.38)"; o.fillRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
      o.strokeStyle = C.accent; o.lineWidth = 1.5; o.strokeRect(cx0, cy0, cx1 - cx0, cy1 - cy0);
      if (avoid) { // synthesised flow: slide the mask sideways, out of the line of attack
        const f = -dir * Math.min(46, w * 0.18);
        for (let i = 1; i <= 3; i++) for (let j = 1; j <= 2; j++) {
          const ax = cx0 + (cx1 - cx0) * i / 4, ay = cy0 + (cy1 - cy0) * j / 3;
          if (ax > rect.x + 8 && ax < rect.x + w - 8) s.arrow(ax, ay, clamp(ax + f, rect.x + 4, rect.x + w - 4), ay, C.yellow, 1.6);
        }
      }
    }
    s.line(rect.x + w / 2, rect.y + h / 2 - 7, rect.x + w / 2, rect.y + h / 2 + 7, "rgba(255,255,255,0.8)", 1);
    s.line(rect.x + w / 2 - 7, rect.y + h / 2, rect.x + w / 2 + 7, rect.y + h / 2, "rgba(255,255,255,0.8)", 1);
    s.frame(rect, "ONBOARD CAMERA", C.cyan);
    if (flash > 0) { o.fillStyle = "rgba(255,107,94," + (0.5 * flash) + ")"; o.fillRect(0, 0, s.w, s.h); }
    s.hud((obstacle ? "<i>high-rise in the line of attack</i> · " + (avoid ? "synthesised flow slides its mask " + (dir > 0 ? "left" : "right") + " → fly " + (dir > 0 ? "right" : "left") : "avoidance is off")
      : "<u>line of attack clear</u> · flying to goal") + "<br><b>" + cleared + "</b> high-rises passed · <b>" + hits + "</b> collisions");
  }
  s.toggle("Avoidance", true, (v) => { avoid = v; });
  s.slider("speed", 4, 16, speed, 1, (v) => { speed = v; }, (v) => v + " m/s");
  return { update, render };
}, { floor: false, cam: [14, 40, 34], target: [0, 9, -10], minDist: 8, maxDist: 90, fov: 45, maxPolar: Math.PI * 0.48 });
