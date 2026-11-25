/* Deep sequenced linear dynamical systems, as a form taking shape.
 * Eight thousand particles each obey x' = A_k (g_k - x): a linear dynamical
 * system pulling them to their attractor. The policy is a short sequence of
 * such systems; when one has done its job the next takes over, and a new form
 * assembles. Every system is stable, so a shove is simply absorbed. */
import { mount, THREE, C } from "./kit.js";
import { sky } from "./paint.js";

mount((s) => {
  const N = 8000, rnd = s.rng(12);
  const dome = sky(s, { top: 0x05070d, horizon: 0x1a1c3c, cloud: 0x34336b, clouds: 0.35, stars: 0.5, moon: [0, -1, 0] });
  /* three attractor sets = three forms */
  const forms = [], AX = [new THREE.Vector3(0, 1, 0), new THREE.Vector3(1, 0.3, 0).normalize(), new THREE.Vector3(0, 0.4, 1).normalize()];
  const f0 = new Float32Array(N * 3), f1 = new Float32Array(N * 3), f2 = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    // 1: a wide halo ring
    let a = rnd() * 6.2832, r = 1.05 + (rnd() - 0.5) * 0.1, t = rnd() * 6.2832, rr = 0.07 * Math.sqrt(rnd());
    f0.set([(r + rr * Math.cos(t)) * Math.cos(a), rr * Math.sin(t) * 1.6, (r + rr * Math.cos(t)) * Math.sin(a)], i * 3);
    // 2: a trefoil knot
    a = rnd() * 6.2832; const kx = Math.sin(a) + 2 * Math.sin(2 * a), ky = Math.cos(a) - 2 * Math.cos(2 * a), kz = -Math.sin(3 * a);
    f1.set([kx * 0.36 + (rnd() - 0.5) * 0.09, ky * 0.36 + (rnd() - 0.5) * 0.09, kz * 0.36 + (rnd() - 0.5) * 0.09], i * 3);
    // 3: a faceted shell (points on the faces of an icosahedron)
    const u = rnd() * 2 - 1, ph = rnd() * 6.2832, sx = Math.sqrt(1 - u * u) * Math.cos(ph), sy = u, sz = Math.sqrt(1 - u * u) * Math.sin(ph);
    const q = 3.2, fx = Math.round(sx * q) / q, fy = Math.round(sy * q) / q, fz = Math.round(sz * q) / q, fl = Math.hypot(fx, fy, fz) || 1;
    f2.set([fx / fl * 0.95, fy / fl * 0.95, fz / fl * 0.95], i * 3);
  }
  forms.push(f0, f1, f2);
  const pos = new Float32Array(N * 3), kick = new Float32Array(N * 3), bright = new Float32Array(N), wave = new Float32Array(N);
  for (let i = 0; i < N; i++) { pos.set([(rnd() - 0.5) * 5, (rnd() - 0.5) * 3, (rnd() - 0.5) * 5], i * 3); bright[i] = rnd() < 0.2 ? 0.75 + rnd() * 0.25 : 0.1 + rnd() * 0.16; }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("bright", new THREE.BufferAttribute(bright, 1));
  geo.setAttribute("wave", new THREE.BufferAttribute(wave, 1));
  const uni = { uScale: { value: 400 }, uMint: { value: new THREE.Color(C.mint) }, uAmber: { value: new THREE.Color(C.amber) } };
  const pts = new THREE.Points(geo, new THREE.ShaderMaterial({
    uniforms: uni, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float bright, wave; uniform float uScale; varying float vB, vW;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vB = bright; vW = wave;
        gl_PointSize = (0.02 + 0.03 * bright + 0.04 * wave) * uScale / -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uMint, uAmber; varying float vB, vW;
      void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); a *= a;
        vec3 c = mix(uMint * (0.5 + vB), uAmber * 2.2, clamp(vW, 0.0, 1.0)); gl_FragColor = vec4(c * a * (0.7 + 0.7 * vB + vW), 1.0); }`
  }));
  pts.frustumCulled = false; s.scene.add(pts);
  /* dim attractor fields in the background: where each system wants things to be */
  const ghosts = forms.map((f, k) => {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(f.subarray(0, 2400), 3));
    const m = new THREE.Points(g, new THREE.PointsMaterial({ color: 0x34336b, size: 0.012, transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scene.add(m); return m;
  });

  let k = 0, gain = 2.4, swirl = 0.9, stageT = 0, handoff = -9, auto = true, meanD = 1;
  function next() { k = (k + 1) % 3; stageT = 0; handoff = s.t; }
  function update(t, dt) {
    dome.tick(t, s.camera);
    const g = forms[k], ax = AX[k]; let sum = 0; stageT += dt;
    const wt = (t - handoff) * 1.6; // radius of the travelling handoff wave
    for (let i = 0; i < N; i++) {
      const j = i * 3, ex = g[j] - pos[j], ey = g[j + 1] - pos[j + 1], ez = g[j + 2] - pos[j + 2];
      // x' = A (g - x),  A = gain * (I + swirl * [axis]x)
      const cx = ax.y * ez - ax.z * ey, cy = ax.z * ex - ax.x * ez, cz = ax.x * ey - ax.y * ex;
      pos[j] += ((ex + swirl * cx) * gain + kick[j]) * dt; pos[j + 1] += ((ey + swirl * cy) * gain + kick[j + 1]) * dt; pos[j + 2] += ((ez + swirl * cz) * gain + kick[j + 2]) * dt;
      const damp = Math.max(0, 1 - dt * 3.5); kick[j] *= damp; kick[j + 1] *= damp; kick[j + 2] *= damp;
      sum += Math.abs(ex) + Math.abs(ey) + Math.abs(ez);
      const rad = Math.hypot(pos[j], pos[j + 1], pos[j + 2]);
      wave[i] = Math.max(0, 1 - Math.abs(rad - wt) * 5) * Math.max(0, 1 - (t - handoff) * 0.55);
    }
    meanD = sum / N / 3;
    geo.attributes.position.needsUpdate = true; geo.attributes.wave.needsUpdate = true;
    if (auto && ((meanD < 0.012 && stageT > 1.6) || stageT > 9)) next();
    ghosts.forEach((m, i) => { m.material.opacity += ((i === k ? 0.55 : 0.0) - m.material.opacity) * Math.min(1, dt * 2); });
    uni.uScale.value = s.h * s.renderer.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(s.camera.fov) / 2));
    s.orbit.autoRotate = true; s.orbit.autoRotateSpeed = 0.35;
  }
  function render() {
    s.renderer.setScissorTest(false); s.renderer.setViewport(0, 0, s.w, s.h); s.renderer.render(s.scene, s.camera);
    // the sequence, as three small stations
    const x0 = 16, y0 = s.h - 26;
    for (let i = 0; i < 3; i++) {
      const x = x0 + i * 92, on = i === k;
      s.line(x + 12, y0, x + 80, y0, i < 2 ? "rgba(216,201,164,0.3)" : "rgba(0,0,0,0)", 1);
      s.dot(x, y0, on ? 5 : 3.5, on ? C.coral : "rgba(216,201,164,0.55)");
      s.text("A" + "₁₂₃"[i] + ", g" + "₁₂₃"[i], x + 10, y0 - 12, on ? C.parch : "rgba(216,201,164,0.5)", 11);
    }
    s.hud("<b>system " + (k + 1) + " of 3</b> is active · <i>x′ = A<sub>" + (k + 1) + "</sub>(g<sub>" + (k + 1) + "</sub> − x)</i> for each of " + N.toLocaleString() + " particles · mean distance to attractor " + (meanD * 100).toFixed(1) + " cm");
  }
  s.button("Shove", () => { for (let i = 0; i < N * 3; i++) kick[i] = (rnd() - 0.5) * 9; });
  s.button("Next system", () => next());
  s.toggle("Auto sequence", true, (v) => { auto = v; });
  s.slider("stiffness", 0.6, 6, gain, 0.1, (v) => { gain = v; }, (v) => v.toFixed(1));
  s.slider("swirl", 0, 2.5, swirl, 0.05, (v) => { swirl = v; }, (v) => v.toFixed(2));
  return { update, render };
}, { floor: false, fog: false, bg: "#05070d", cam: [0.0, 0.85, 3.2], target: [0, 0, 0], minDist: 1.5, maxDist: 7, maxPolar: Math.PI });
