/* Deep sequenced linear dynamical systems: the policy is a short sequence of
 * linear dynamical systems, each one pulling the end-effector to its own
 * attractor: x' = A (g - x). Stable by construction, so pushes are absorbed. */
import { mount, THREE, C, clamp } from "./kit.js";

mount((s) => {
  s.table(1.5, 1.05);
  const arm = s.arm({ base: [0, 0, -0.3] });
  const cols = [0x5ad1e6, 0xffd166, 0xb79cff], names = [C.cyan, C.yellow, C.violet];
  const goals = [[-0.34, 0.1, 0.18], [0.02, 0.36, 0.3], [0.36, 0.1, 0.12]].map((p, i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(0.03, 24, 16), new THREE.MeshStandardMaterial({ color: cols[i], emissive: cols[i], emissiveIntensity: 0.7 }));
    m.position.fromArray(p); m.castShadow = true; s.scene.add(m);
    const stem = s.trail(cols[i], 2, 0.5); stem.set([m.position, new THREE.Vector3(p[0], 0, p[2])]); m.userData.stem = stem;
    return m;
  });
  const x = new THREE.Vector3(0, 0.4, 0.15), kick = new THREE.Vector3();
  let k = 0, gain = 2.2, swirl = 0.0, dwell = 0;
  const trails = cols.map((c) => s.trail(c, 500, 0.95));

  /* flow-field particles advected by the active system */
  const N = 420, rnd = s.rng(9), pos = new Float32Array(N * 3), life = new Float32Array(N);
  const spawn = (i) => { pos[i * 3] = (rnd() - 0.5) * 1.3; pos[i * 3 + 1] = 0.02 + rnd() * 0.6; pos[i * 3 + 2] = -0.1 + rnd() * 0.6; life[i] = 0.6 + rnd() * 1.6; };
  for (let i = 0; i < N; i++) spawn(i);
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pm = new THREE.PointsMaterial({ color: cols[0], size: 0.012, transparent: true, opacity: 0.75, depthWrite: false, blending: THREE.AdditiveBlending });
  const field = new THREE.Points(pg, pm); field.frustumCulled = false; s.scene.add(field);

  const v = new THREE.Vector3(), e = new THREE.Vector3();
  function vel(p, out) { // x' = A (g - x), A = gain * (I + swirl * skew(up))
    e.copy(goals[k].position).sub(p);
    return out.set(e.x + swirl * e.z, e.y, e.z - swirl * e.x).multiplyScalar(gain);
  }
  function update(t, dt) {
    vel(x, v); x.addScaledVector(v, dt).addScaledVector(kick, dt); kick.multiplyScalar(Math.max(0, 1 - dt * 5));
    x.y = Math.max(0.02, x.y);
    arm.solve(x); arm.grip(0.4);
    trails[k].push(arm.tipWorld());
    if (x.distanceTo(goals[k].position) < 0.02) { dwell += dt; if (dwell > 0.35) { k = (k + 1) % 3; dwell = 0; if (k === 0) trails.forEach((tr) => tr.reset()); pm.color.setHex(cols[k]); } }
    for (let i = 0; i < N; i++) {
      v.set(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]); vel(v, kickTmp);
      pos[i * 3] += kickTmp.x * dt * 0.6; pos[i * 3 + 1] += kickTmp.y * dt * 0.6; pos[i * 3 + 2] += kickTmp.z * dt * 0.6;
      life[i] -= dt; if (life[i] < 0 || v.distanceTo(goals[k].position) < 0.03) spawn(i);
    }
    pg.attributes.position.needsUpdate = true;
    goals.forEach((g, i) => { g.scale.setScalar(i === k ? 1.25 + 0.12 * Math.sin(t * 6) : 1); });
  }
  const kickTmp = new THREE.Vector3();

  /* drag attractors on the horizontal plane through them */
  let drag = null;
  s.on("down", () => { const h = s.hit(goals); if (h) { drag = h.object; return true; } });
  s.on("move", (p) => {
    if (!drag) { s.canvas.style.cursor = s.hit(goals) ? "move" : ""; return; }
    const q = s.rayY(drag.position.y, p); if (!q) return;
    drag.position.x = clamp(q.x, -0.6, 0.6); drag.position.z = clamp(q.z, -0.05, 0.42);
    drag.userData.stem.set([drag.position, new THREE.Vector3(drag.position.x, 0, drag.position.z)]);
  });
  s.on("up", () => { drag = null; });

  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    goals.forEach((g, i) => s.label("g" + (i + 1), g.position, names[i]));
    s.hud("active system <b>" + (k + 1) + " of 3</b> · <i>x′ = A<sub>" + (k + 1) + "</sub>(g<sub>" + (k + 1) + "</sub> − x)</i> · distance to attractor " +
      (x.distanceTo(goals[k].position) * 100).toFixed(1) + " cm<br>drag the glowing attractors");
  }
  s.button("Push the arm", () => { kick.set((rnd() - 0.5) * 3, rnd() * 1.6, (rnd() - 0.5) * 3); });
  s.slider("stiffness", 0.8, 5, gain, 0.1, (val) => { gain = val; }, (val) => val.toFixed(1));
  s.slider("swirl", 0, 1.5, swirl, 0.05, (val) => { swirl = val; }, (val) => val.toFixed(2));
  return { update, render };
}, { cam: [1.35, 1.0, 1.75], target: [0, 0.2, 0] });
