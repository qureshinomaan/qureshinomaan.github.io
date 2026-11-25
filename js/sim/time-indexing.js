/* Time-indexing as inductive bias: one body, many clocks. The policy has K
 * action heads and simply runs head k during the k-th slice of the episode.
 * A puck draws a looping manoeuvre that passes through the same point twice;
 * what it does there depends only on which head the clock says is active. */
import { mount, THREE, C, clamp } from "./kit.js";
import { painterly, sky, paintMat, motes } from "./paint.js";

mount((s) => {
  const dome = sky(s, { top: 0x070a14, horizon: 0x2a2b55, cloud: 0x34336b, clouds: 0.5, stars: 1, moon: [0.5, 0.35, -1] });
  const paint = painterly(s, { radius: 3, vignette: 0.8 });
  s.lights.sun.position.set(-3, 4, 2.5); s.lights.sun.intensity = 2.0; s.lights.sun.color.set(0xd8c9a4);
  s.lights.hemi.intensity = 1.1; s.lights.rim.color.set(0x72759b); s.lights.rim.intensity = 14; s.lights.rim.position.set(3, 1.5, -3);
  const R = 1.25;
  const disk = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.55, R + 0.7, 0.08, 96), paintMat(0x2b2d47, { freq: 2.2, amount: 0.45 }));
  disk.position.y = -0.06; disk.receiveShadow = true; s.scene.add(disk);
  const dust = motes(s, { count: 30, box: [4, 2, 4], center: [0, 0.9, 0], color: 0xefb765, size: 10 });
  /* ring sectors, rebuilt when K changes */
  let K = 4, sectors = [];
  const ringG = new THREE.Group(); s.scene.add(ringG);
  function buildRing() {
    while (ringG.children.length) ringG.remove(ringG.children[0]);
    sectors = [];
    for (let i = 0; i < K; i++) {
      const gap = 0.045, a0 = i / K * 6.2832 + gap, a1 = (i + 1) / K * 6.2832 - gap;
      const g = new THREE.TorusGeometry(R, 0.05, 12, 64, a1 - a0);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0x34336b, emissive: 0xff6b5e, emissiveIntensity: 0, roughness: 0.6 }));
      m.rotation.x = -Math.PI / 2; m.rotation.z = -a1 + Math.PI / 2; m.position.y = 0.03; m.castShadow = true; ringG.add(m); sectors.push(m);
    }
  }
  buildRing();
  const hand = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.02, R), new THREE.MeshStandardMaterial({ color: 0xd8c9a4, emissive: 0xd8c9a4, emissiveIntensity: 0.6 }));
  hand.geometry.translate(0, 0, -R / 2); hand.position.y = 0.06; s.scene.add(hand);
  const puck = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xefb765, emissiveIntensity: 0.9 }));
  puck.castShadow = true; s.scene.add(puck);
  const glow = new THREE.PointLight(0xefb765, 1.2, 1.3); puck.add(glow);

  /* the manoeuvre: a figure-eight in 3D that crosses itself, so one place is visited in two different slices */
  const NP = 420, path = [];
  for (let i = 0; i <= NP; i++) { const u = i / NP * 6.2832; path.push(new THREE.Vector3(0.9 * Math.sin(u), 0.34 + 0.2 * Math.sin(2 * u + 0.6), 0.62 * Math.sin(2 * u))); }
  const T = 9; let time = 0, playing = true, drag = false;
  const headOf = (f) => Math.min(K - 1, Math.floor(clamp(f, 0, 0.9999) * K));
  function update(t, dt) {
    if (playing && !drag) time = (time + dt) % T;
    const f = time / T, i = Math.min(NP - 1, Math.floor(f * NP)), u = f * NP - i;
    puck.position.lerpVectors(path[i], path[i + 1], u);
    hand.rotation.y = -f * 6.2832;
    const h = headOf(f);
    sectors.forEach((m, k) => { m.material.emissiveIntensity += ((k === h ? 0.65 : 0) - m.material.emissiveIntensity) * Math.min(1, dt * 10); m.material.color.set(k === h ? 0xff6b5e : 0x4a4990); });
    dome.tick(t, s.camera); dust.tick(t);
  }
  // scrub by dragging around the ring
  function scrub(p) { const w = s.rayY(0.03, p); if (!w) return false; const r = Math.hypot(w.x, w.z); if (!drag && (r < R - 0.3 || r > R + 0.45)) return false; let a = Math.atan2(w.x, -w.z); if (a < 0) a += 6.2832; time = a / 6.2832 * T; return true; }
  s.on("down", (p) => { if (scrub(p)) { drag = true; return true; } });
  s.on("move", (p) => { if (drag) scrub(p); });
  s.on("up", () => { drag = false; });

  function render() {
    paint.render(s.scene, s.camera);
    const o = s.o, f = time / T, h = headOf(f), upto = Math.floor(f * NP);
    // the ribbon the puck has laid so far: the slice being drawn is coral, finished slices alternate parchment and haze
    o.save(); o.lineCap = "round"; o.lineJoin = "round";
    for (let k = 0; k < K; k++) {
      const a = Math.floor(k / K * NP), b = Math.min(upto, Math.floor((k + 1) / K * NP)); if (b <= a) continue;
      o.beginPath();
      for (let i = a; i <= b; i++) { const q = s.project(path[i]); if (i === a) o.moveTo(q.x, q.y); else o.lineTo(q.x, q.y); }
      o.strokeStyle = k === h ? "rgba(255,107,94,0.95)" : "rgba(145,198,186,0.3)"; o.lineWidth = k === h ? 6 : 3.5; o.stroke();
      if (k === h) { o.strokeStyle = "rgba(216,201,164,0.95)"; o.lineWidth = 2.5; o.stroke(); }
    }
    o.restore();
    // the heads: a trunk that branches into K outputs, only the active one lit
    const bx = s.w - 130, by = 58;
    o.fillStyle = "rgba(11,16,27,0.8)"; o.fillRect(bx - 106, by - 20, 222, K * 22 + 18);
    s.text("policy", bx - 46, by + (K - 1) * 11, C.parch, 13, "right"); s.dot(bx - 36, by + (K - 1) * 11, 4, C.parch);
    for (let k = 0; k < K; k++) {
      const y = by + k * 22, on = k === h;
      s.line(bx - 36, by + (K - 1) * 11, bx + 20, y, on ? C.coral : "rgba(114,117,155,0.7)", on ? 2 : 1);
      s.dot(bx + 20, y, on ? 5 : 3.5, on ? C.coral : "rgba(114,117,155,0.9)");
      s.text("head " + (k + 1), bx + 32, y, on ? C.parch : "rgba(216,201,164,0.5)", 13);
    }
    const cross = s.project(new THREE.Vector3(0, 0.34 + 0.2 * Math.sin(0.6), 0));
    s.dot(cross.x, cross.y, 8, null, "rgba(216,201,164,0.9)"); s.text("same place, twice", cross.x + 14, cross.y - 12, C.parch, 11);
    s.hud("<b>K = " + K + "</b> action head" + (K > 1 ? "s" : "") + " · the clock says head <b>" + (h + 1) + "</b> acts now · t = " + (f * 100).toFixed(0) + "% of the episode" +
      (K === 1 ? "<br><i>with one head, a single output must represent every part of the manoeuvre</i>" : "<br>drag around the ring to scrub time"));
  }
  s.slider("heads K", 1, 6, K, 1, (v) => { K = v; buildRing(); });
  s.toggle("Pause", false, (v) => { playing = !v; });
  return { update, render };
}, { floor: false, fogNear: 4, fogFar: 14, bg: "#070a14", cam: [0.0, 2.35, 3.55], target: [0, 0.02, 0], minDist: 2, maxDist: 6.5 });
