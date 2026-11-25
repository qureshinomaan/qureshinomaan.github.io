/* Flow-synthesis obstacle avoidance, painted at blue hour. A micro air
 * vehicle flies among high-rises with one forward camera. The building in its
 * line of attack is picked out as a mask; a flow is synthesised that slides
 * that mask out of the way; a visual-servoing controller flies so that the
 * flow comes true, which steers the vehicle around the building. */
import { mount, THREE, C, clamp } from "./kit.js";
import { painterly, sky, paintMat, motes } from "./paint.js";

mount((s) => {
  const rnd = s.rng(21);
  s.scene.fog = new THREE.Fog(0x72759b, 80, 300);
  const dome = sky(s, { top: 0x0d1230, horizon: 0xe0926a, cloud: 0x8a6f9e, clouds: 0.8, stars: 0.9, moon: [-0.3, 0.36, -1], radius: 600 });
  const paint = painterly(s, { radius: 3, saturation: 1.15, contrast: 1.1, vignette: 0.7 });
  s.lights.sun.castShadow = false; s.lights.sun.intensity = 1.3; s.lights.sun.color.set(0xd8c9a4); s.lights.sun.position.set(-30, 40, 20);
  s.lights.hemi.intensity = 1.25; s.lights.hemi.color.set(0x8f90b4); s.lights.hemi.groundColor.set(0x8a5a3c); s.lights.rim.intensity = 0;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 900), paintMat(0x23203f, { freq: 0.05, amount: 0.6, shade: 0x6a3f4c }));
  ground.rotation.x = -Math.PI / 2; s.scene.add(ground);

  /* facades: warm lit windows on violet stone, painted once into a few textures */
  function facade(seed) {
    const r = s.rng(seed), cv = document.createElement("canvas"); cv.width = 96; cv.height = 256;
    const g = cv.getContext("2d"); g.fillStyle = "#34336B"; g.fillRect(0, 0, 96, 256);
    for (let i = 0; i < 260; i++) { g.fillStyle = "rgba(" + (r() < 0.5 ? "22,22,52" : "88,90,132") + "," + (0.15 + r() * 0.2) + ")"; g.fillRect(r() * 96, r() * 256, 6 + r() * 22, 3 + r() * 8); }
    for (let y = 8; y < 248; y += 12) for (let x = 8; x < 88; x += 12) {
      const lit = r() < 0.18; g.fillStyle = lit ? (r() < 0.8 ? "#efb765" : "#ffdca8") : "#1b1c40"; g.fillRect(x + r() * 1.5, y + r() * 1.5, 6, 7);
    }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const texs = [facade(1), facade(2), facade(3), facade(4)];
  const unit = new THREE.BoxGeometry(1, 1, 1); unit.translate(0, 0.5, 0);
  const B = [], ROW = 16;
  function place(b, z, cx) {
    b.w = 6.5 + rnd() * 5; b.d = 6.5 + rnd() * 4.5; b.h = 18 + rnd() * 30;
    b.x = cx + (rnd() - 0.5) * 78; b.z = z + (rnd() - 0.5) * 4;
    b.mesh.scale.set(b.w, b.h, b.d); b.mesh.position.set(b.x, 0, b.z);
  }
  for (let i = 0; i < 54; i++) {
    const tex = texs[i % 4];
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: tex, emissive: 0xffffff, emissiveMap: tex, emissiveIntensity: 0.5, roughness: 0.95 });
    const b = { mesh: new THREE.Mesh(unit, mat), idx: i }; s.scene.add(b.mesh); B.push(b);
    place(b, -34 - Math.floor(i / 3) * ROW, 0);
  }
  /* three receding skyline bands that travel with the vehicle */
  const bands = new THREE.Group(); s.scene.add(bands);
  [[150, 0x2a2550, 26], [190, 0x4a3562, 34], [235, 0x7a4f6c, 44]].forEach(([dist, col, hmax], bi) => {
    const m = new THREE.MeshBasicMaterial({ color: col, fog: false });
    for (let i = 0; i < 46; i++) { const a = (i / 46) * 6.2832 + bi, w = 8 + rnd() * 16, h = 10 + rnd() * hmax; const mesh = new THREE.Mesh(unit, m); mesh.scale.set(w, h, 6); mesh.position.set(Math.cos(a) * dist, 0, Math.sin(a) * dist); mesh.lookAt(0, 0, 0); bands.add(mesh); }
  });
  { const n = 900, pp = new Float32Array(n * 3); for (let i = 0; i < n; i++) { pp[i * 3] = (Math.floor(rnd() * 28) - 14) * 8 + (rnd() < 0.5 ? 0 : 3); pp[i * 3 + 1] = 0.4; pp[i * 3 + 2] = -rnd() * 400; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    var lamps = new THREE.Points(g, new THREE.PointsMaterial({ color: 0xefb765, size: 1.3, transparent: true, opacity: 0.9, depthWrite: false, blending: THREE.AdditiveBlending })); lamps.frustumCulled = false; s.scene.add(lamps); }
  /* dark framing towers at the edges of the view, travelling with the vehicle */
  const frameT = new THREE.Group(); s.scene.add(frameT);
  for (const sx of [-1, 1]) { const m = new THREE.Mesh(unit, new THREE.MeshBasicMaterial({ color: 0x0b101b, fog: false })); m.scale.set(9, 90, 9); m.position.set(sx * 36, 0, 4); frameT.add(m); }
  const dust = motes(s, { count: 36, box: [50, 14, 50], center: [0, 12, 0], color: 0xefb765, size: 60 });

  /* the vehicle */
  const mav = new THREE.Group();
  const bodyM = new THREE.MeshStandardMaterial({ color: 0xd8c9a4, roughness: 0.6 });
  mav.add(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 1.25), bodyM));
  const rotors = [];
  for (const [x, z] of [[1, 1], [1, -1], [-1, 1], [-1, -1]]) {
    const armM = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 1.55), bodyM); armM.position.set(x * 0.55, 0, z * 0.55); armM.rotation.y = x * z * Math.PI / 4; mav.add(armM);
    const rot = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.66, 0.04, 24), new THREE.MeshBasicMaterial({ color: 0xff6b5e, transparent: true, opacity: 0.6 }));
    rot.position.set(x * 1.08, 0.15, z * 1.08); mav.add(rot); rotors.push(rot);
  }
  const lamp = new THREE.PointLight(0xefb765, 60, 30); lamp.position.set(0, -0.4, -1); mav.add(lamp);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.17, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffe2b0 })); nose.position.z = -0.66; mav.add(nose);
  mav.traverse((o) => o.layers.set(3)); lamp.layers.enableAll(); s.camera.layers.enable(3);
  mav.position.set(0, 10, 0); mav.scale.setScalar(1.7); s.scene.add(mav);
  const trail = s.trail(0xffc98a, 500, 0.9); trail.layers.set(3);
  const eye = new THREE.PerspectiveCamera(70, 4 / 3, 0.3, 700);

  let speed = 9, avoid = true, side = 0, vx = 0, flash = 0, hits = 0, cleared = 0, obstacle = null, dir = 0, lastOb = null, best = 60, peel = 0;
  const MARGIN = 2.6;
  function update(t, dt) {
    const p = mav.position;
    obstacle = null; best = 70;
    for (const b of B) {
      const ahead = (p.z - b.z) - b.d / 2;
      if (ahead > -b.d && ahead < best && Math.abs(p.x - b.x) < b.w / 2 + MARGIN && b.h > p.y) { best = ahead; obstacle = b; }
    }
    let target = 0;
    if (obstacle) {
      if (obstacle !== lastOb) { if (lastOb) cleared++; dir = side || (p.x >= obstacle.x ? 1 : -1); lastOb = obstacle; peel = 0; }
      const remaining = obstacle.w / 2 + MARGIN - dir * (p.x - obstacle.x);
      if (avoid) target = dir * clamp(remaining * 2.2, 0, 1) * Math.max(6, speed * 1.1);
      peel = Math.min(1, peel + dt * 0.9);
    } else if (lastOb) { cleared++; lastOb = null; }
    vx += (target - vx) * Math.min(1, dt * 5);
    const slow = obstacle && avoid ? clamp(best / 24, 0.25, 1) : 1;
    p.x += vx * dt; p.z -= speed * slow * dt;
    mav.rotation.z = -vx * 0.035; mav.rotation.x = -0.06 * slow;
    for (const r of rotors) r.rotation.y += dt * 40;
    for (const b of B) if (Math.abs(p.x - b.x) < b.w / 2 && Math.abs(p.z - b.z) < b.d / 2 && p.y < b.h && flash <= 0) { flash = 1; hits++; }
    flash = Math.max(0, flash - dt * 1.5);
    for (const b of B) {
      if (b.z > p.z + 28) { let minZ = 0; for (const o of B) minZ = Math.min(minZ, o.z); place(b, Math.round(minZ / ROW) * ROW - (b.idx % 3 === 0 ? ROW : 0), p.x); }
      b.mesh.material.emissive.setHex(b === obstacle ? 0xff8a7a : 0xffffff);
      b.mesh.material.emissiveIntensity = b === obstacle ? 0.95 : 0.5;
    }
    trail.push(p);
    const d = p.clone().sub(s.orbit.target); d.y = 0;
    s.camera.position.add(d); s.orbit.target.add(d);
    ground.position.set(p.x, 0, p.z); bands.position.set(p.x, 0, p.z); frameT.position.set(s.orbit.target.x, 0, s.orbit.target.z + 30);
    dust.uniforms.uOffset.value.set(Math.round(p.x / 25) * 25, 0, Math.round(p.z / 25) * 25 - 12); dust.tick(t);
    lamps.position.set(Math.round(p.x / 8) * 8, 0, Math.round(p.z / 100) * 100 + 60);
    dome.tick(t, s.camera);
    eye.position.copy(p); eye.rotation.set(0, 0, 0); eye.updateMatrixWorld(true);
  }

  const corner = new THREE.Vector3();
  function render() {
    const o = s.o;
    paint.render(s.scene, s.camera);
    const w = Math.round(s.w * 0.28), h = Math.round(w * 3 / 4), rect = { x: 14, y: s.h - h - 14, w, h };
    s.view(eye, rect);
    if (obstacle) {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const sx of [-0.5, 0.5]) for (const sz of [-0.5, 0.5]) for (const sy of [0, 1]) {
        corner.set(obstacle.x + sx * obstacle.w, sy * obstacle.h, obstacle.z + sz * obstacle.d);
        if (corner.z > mav.position.z - 0.5) corner.z = mav.position.z - 0.5;
        const q = s.project(corner, eye, rect);
        x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y);
      }
      const cy0 = clamp(y0, rect.y + 17, rect.y + h), cy1 = clamp(y1, rect.y + 17, rect.y + h);
      // the mask, cut into six painted bands that slide along the synthesised flow
      o.save(); o.beginPath(); o.rect(rect.x, rect.y + 17, w, h - 17); o.clip();
      const f = avoid ? -dir * Math.min(70, w * 0.26) : 0, bh = (cy1 - cy0) / 6;
      for (let i = 0; i < 6; i++) {
        const lag = clamp(peel * 1.8 - i * 0.14, 0, 1), off = f * lag * lag * (3 - 2 * lag);
        o.fillStyle = "rgba(255,107,94," + (0.34 - 0.03 * i) + ")"; o.fillRect(x0 + off, cy0 + i * bh + 1, x1 - x0, bh - 2);
        if (avoid && lag > 0.05 && lag < 0.98) s.arrow(x0 + (x1 - x0) / 2, cy0 + (i + 0.5) * bh, x0 + (x1 - x0) / 2 + f * 0.9, cy0 + (i + 0.5) * bh, C.amber, 1.5);
      }
      o.strokeStyle = "rgba(216,201,164,0.9)"; o.lineWidth = 1; o.setLineDash([4, 4]); o.strokeRect(x0 + f, cy0, x1 - x0, cy1 - cy0); o.restore();
    }
    s.line(rect.x + w / 2, rect.y + h / 2 - 7, rect.x + w / 2, rect.y + h / 2 + 7, "rgba(255,255,255,0.8)", 1);
    s.line(rect.x + w / 2 - 7, rect.y + h / 2, rect.x + w / 2 + 7, rect.y + h / 2, "rgba(255,255,255,0.8)", 1);
    s.frame(rect, "ONBOARD CAMERA", C.parch);
    if (flash > 0) { o.fillStyle = "rgba(255,107,94," + (0.5 * flash) + ")"; o.fillRect(0, 0, s.w, s.h); }
    s.hud((obstacle ? "<i>high-rise in the line of attack</i> · " + (avoid ? "synthesised flow slides its mask " + (dir > 0 ? "left" : "right") + ", so the vehicle flies " + (dir > 0 ? "right" : "left") : "avoidance is off")
      : "<u>line of attack clear</u> · flying on") + "<br><b>" + cleared + "</b> high-rises passed · <b>" + hits + "</b> collisions");
  }
  s.choice(["Pass left", "Auto", "Pass right"], 1, (i) => { side = i - 1; });
  s.toggle("Avoidance", true, (v) => { avoid = v; });
  s.slider("speed", 4, 16, speed, 1, (v) => { speed = v; }, (v) => v + " m/s");
  return { update, render };
}, { floor: false, near: 0.5, cam: [5, 17, 38], target: [0, 14, -30], minDist: 10, maxDist: 95, fov: 50, maxPolar: Math.PI * 0.52, bg: "#232554" });
