/* A shared "painted" look for the procedural scenes: an oil-paint (Kuwahara)
 * post-process with colour grading, a painted sky dome, mottled brush-patch
 * materials and drifting light motes. */
import { THREE } from "./kit.js";

const NOISE = `
float hash13(vec3 p){ p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float vnoise(vec3 p){ vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash13(i), hash13(i + vec3(1,0,0)), f.x), mix(hash13(i + vec3(0,1,0)), hash13(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(hash13(i + vec3(0,0,1)), hash13(i + vec3(1,0,1)), f.x), mix(hash13(i + vec3(0,1,1)), hash13(i + vec3(1,1,1)), f.x), f.y), f.z); }
float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; } return s; }
`;

/** Oil-paint post process. Call `.render(scene, camera)` instead of renderer.render. */
export function painterly(s, o = {}) {
  const r = s.renderer;
  const rt = new THREE.WebGLRenderTarget(4, 4, { type: THREE.HalfFloatType, depthBuffer: true, samples: 2 });
  const u = {
    tDiffuse: { value: rt.texture }, uTexel: { value: new THREE.Vector2() },
    uRadius: { value: o.radius == null ? 3 : o.radius }, uGrain: { value: o.grain == null ? 0.045 : o.grain },
    uSat: { value: o.saturation == null ? 1.18 : o.saturation }, uContrast: { value: o.contrast == null ? 1.08 : o.contrast },
    uVignette: { value: o.vignette == null ? 0.55 : o.vignette }, uTint: { value: new THREE.Color(o.tint || 0xffffff) },
    uTime: { value: 0 }
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: u, depthTest: false, depthWrite: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform vec2 uTexel; uniform float uRadius, uGrain, uSat, uContrast, uVignette, uTime; uniform vec3 uTint;
      varying vec2 vUv;
      ${NOISE}
      void main(){
        // 4-sector Kuwahara: keep the mean of the least-varied quadrant -> flat dabs with crisp edges
        vec3 m[4]; vec3 sq[4];
        for (int k = 0; k < 4; k++) { m[k] = vec3(0.0); sq[k] = vec3(0.0); }
        int R = int(uRadius);
        // brush direction wobbles across the canvas so dabs are not axis-aligned
        float ang = (vnoise(vec3(vUv * 6.0, 0.0)) - 0.5) * 1.6; mat2 rot = mat2(cos(ang), -sin(ang), sin(ang), cos(ang));
        for (int j = -4; j <= 4; j++) for (int i = -4; i <= 4; i++) {
          if (abs(i) > R || abs(j) > R) continue;
          vec3 c = texture2D(tDiffuse, vUv + rot * vec2(float(i), float(j)) * uTexel).rgb;
          if (i <= 0 && j <= 0) { m[0] += c; sq[0] += c * c; }
          if (i >= 0 && j <= 0) { m[1] += c; sq[1] += c * c; }
          if (i <= 0 && j >= 0) { m[2] += c; sq[2] += c * c; }
          if (i >= 0 && j >= 0) { m[3] += c; sq[3] += c * c; }
        }
        float n = float((R + 1) * (R + 1)); float best = 1e9; vec3 col = vec3(0.0);
        for (int k = 0; k < 4; k++) { vec3 mean = m[k] / n; vec3 var = abs(sq[k] / n - mean * mean); float v = var.r + var.g + var.b; if (v < best) { best = v; col = mean; } }
        // grade
        float l = dot(col, vec3(0.299, 0.587, 0.114));
        col = mix(vec3(l), col, uSat); col = (col - 0.18) * uContrast + 0.18; col *= uTint;
        vec2 d = vUv - 0.5; col *= 1.0 - uVignette * dot(d, d) * 1.6;
        // canvas tooth
        float g = fbm(vec3(vUv * vec2(900.0, 520.0), 1.0)) - 0.5; col *= 1.0 + g * uGrain * 2.0;
        gl_FragColor = vec4(max(col, 0.0), 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); quad.frustumCulled = false;
  const qscene = new THREE.Scene(); qscene.add(quad);
  const qcam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  return {
    uniforms: u,
    render(scene, camera) {
      const k = Math.min(r.getPixelRatio(), 1.5), w = Math.round(s.w * k), h = Math.round(s.h * k);
      if (rt.width !== w || rt.height !== h) { rt.setSize(w, h); u.uTexel.value.set(1 / w, 1 / h); }
      u.uTime.value = s.t;
      r.setScissorTest(false);
      r.setRenderTarget(rt); r.clear(); r.render(scene, camera);
      r.setRenderTarget(null); r.setViewport(0, 0, s.w, s.h); r.render(qscene, qcam);
    }
  };
}

/** A painted sky: gradient, streaky clouds, optional moon and stars. */
export function sky(s, o = {}) {
  const u = {
    uTop: { value: new THREE.Color(o.top || 0x1b1f4a) }, uHorizon: { value: new THREE.Color(o.horizon || 0xc98a6b) },
    uCloud: { value: new THREE.Color(o.cloud || 0xf2d9b0) }, uMoon: { value: new THREE.Vector3().fromArray(o.moon || [0.3, 0.5, -1]).normalize() },
    uMoonCol: { value: new THREE.Color(o.moonColor || 0xfff3d0) }, uStars: { value: o.stars == null ? 1 : o.stars }, uTime: { value: 0 },
    uCloudAmt: { value: o.clouds == null ? 0.7 : o.clouds }
  };
  const m = new THREE.Mesh(new THREE.SphereGeometry(o.radius || 400, 48, 24), new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: "varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `
      uniform vec3 uTop, uHorizon, uCloud, uMoon, uMoonCol; uniform float uStars, uTime, uCloudAmt; varying vec3 vDir;
      ${NOISE}
      void main(){
        vec3 d = normalize(vDir); float h = clamp(d.y, -0.2, 1.0);
        vec3 col = mix(uHorizon, uTop, pow(smoothstep(-0.05, 0.75, h), 0.7));
        // long horizontal brush strokes of cloud
        vec3 p = vec3(d.x * 3.0 + uTime * 0.01, d.y * 16.0, d.z * 3.0);
        float c = fbm(p) * fbm(p * 2.3 + 7.0); c = smoothstep(0.16, 0.36, c) * smoothstep(-0.02, 0.25, h) * (1.0 - smoothstep(0.55, 0.95, h));
        col = mix(col, uCloud, c * uCloudAmt);
        float md = dot(d, uMoon); col += uMoonCol * (smoothstep(0.9985, 0.9992, md) + 0.25 * pow(max(md, 0.0), 60.0));
        float st = step(0.9972, hash13(floor(d * 220.0))) * smoothstep(0.15, 0.6, h) * (1.0 - c); col += vec3(st) * uStars * 0.8;
        gl_FragColor = vec4(col, 1.0);
      }`
  }));
  m.frustumCulled = false; m.renderOrder = -10; s.scene.add(m);
  m.tick = (t, camera) => { u.uTime.value = t; if (camera) m.position.copy(camera.position); };
  return m;
}

/** Standard material with world-space brush mottling. */
export function paintMat(color, o = {}) {
  const mat = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.9, metalness: 0.0 }, o.params || {}));
  const freq = (o.freq || 3.0).toFixed(3), amt = (o.amount == null ? 0.38 : o.amount).toFixed(3);
  const shade = new THREE.Color(o.shade || 0x2a2f55);
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uShade = { value: shade };
    sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vPaintP;")
      .replace("#include <begin_vertex>", "#include <begin_vertex>\nvPaintP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
    sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vPaintP; uniform vec3 uShade;\n" + NOISE)
      .replace("#include <color_fragment>", `#include <color_fragment>
        float pn = fbm(vPaintP * ${freq}); float pn2 = fbm(vPaintP * ${freq} * 2.7 + 11.0);
        diffuseColor.rgb *= 1.0 + (pn - 0.5) * 2.0 * ${amt};
        diffuseColor.rgb = mix(diffuseColor.rgb, uShade, smoothstep(0.55, 0.8, pn2) * 0.35);`);
  };
  return mat;
}

/** Slow drifting points of light (dust, fireflies, embers). */
export function motes(s, o = {}) {
  const n = o.count || 300, box = o.box || [6, 3, 6], c = o.center || [0, 1, 0], rnd = s.rng(o.seed || 5);
  const pos = new Float32Array(n * 3), ph = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos[i * 3] = c[0] + (rnd() - 0.5) * box[0]; pos[i * 3 + 1] = c[1] + (rnd() - 0.5) * box[1]; pos[i * 3 + 2] = c[2] + (rnd() - 0.5) * box[2]; ph[i] = rnd() * 6.28; }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("phase", new THREE.BufferAttribute(ph, 1));
  const u = { uTime: { value: 0 }, uColor: { value: new THREE.Color(o.color || 0xffd98a) }, uSize: { value: o.size || 14 }, uOffset: { value: new THREE.Vector3() } };
  const pts = new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: u, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false,
    vertexShader: `attribute float phase; uniform float uTime, uSize; uniform vec3 uOffset; varying float vA;
      void main(){ vec3 p = position + uOffset; p.x += sin(uTime * 0.3 + phase) * 0.25; p.y += sin(uTime * 0.5 + phase * 1.7) * 0.18; p.z += cos(uTime * 0.27 + phase * 0.6) * 0.25;
        vec4 mv = modelViewMatrix * vec4(p, 1.0); vA = 0.45 + 0.55 * sin(uTime * 1.3 + phase * 3.0);
        gl_PointSize = uSize / max(0.4, -mv.z) ; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: "uniform vec3 uColor; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(uColor * a * a * vA * 1.6, 1.0); }"
  }));
  pts.frustumCulled = false; s.scene.add(pts);
  pts.tick = (t) => { u.uTime.value = t; };
  pts.uniforms = u;
  return pts;
}
