/* Shared first-person servoing stage inside the real Gaussian-splat scene:
 * the main view is what the robot's camera sees; goal images are real
 * renders of the same scene from the goal pose. */
import { THREE, C } from "./kit.js";
import { loadWorkspace, toWorld } from "./splatbot.js";
import { setView, syncable, toRect } from "./servo.js";
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";

export const FOV = 46;
let FAST = false; try { FAST = new URLSearchParams(location.search).has("fast"); } catch (err) {}
/** Pose a camera at a simulator-frame position looking at a simulator-frame point. */
export function pose(cam, from, at, roll) {
  cam.position.set(from[0], from[2], -from[1]); cam.up.set(0, 1, 0);
  cam.lookAt(at[0], at[2], -at[1]); if (roll) cam.rotateZ(roll);
  cam.sync(); return cam;
}
export function ghost() { return syncable(new THREE.PerspectiveCamera(FOV, 16 / 9, 0.03, 30)); }

/** Pose a camera with three.js world coordinates. */
export function poseW(cam, from, at, roll) {
  cam.position.fromArray(from); cam.up.set(0, 1, 0); cam.lookAt(at[0], at[1], at[2]); if (roll) cam.rotateZ(roll);
  cam.sync(); return cam;
}

/** Load a standalone captured scene (assets/splats/<name>/scene.json + scene.spz). */
async function loadScene(s, name) {
  const base = new URL("../../assets/splats/" + name + "/", import.meta.url);
  let lite = false; try { lite = new URLSearchParams(location.search).has("lite"); } catch (err) {}
  const meta = await (await fetch(new URL(lite ? "lite.json" : "scene.json", base))).json();
  s.renderer.toneMapping = THREE.NoToneMapping;
  s.scene.add(new SparkRenderer({ renderer: s.renderer }));
  if (meta.sky) s.scene.background = new THREE.Color(meta.sky);
  const mesh = new SplatMesh({ url: new URL(meta.file, base).href });
  s.scene.add(mesh);
  return { ready: mesh.initialized, features: meta.features.map((p) => new THREE.Vector3(p[0], p[1], p[2])), credit: meta.credit, count: meta.count };
}

export async function stage(s, cfg = {}) {
  await s.gate("Load the real scene", cfg.blurb || "a Gaussian splat of a real robot workspace \u00b7 about 7 MB");
  s.busy("loading the captured scene\u2026");
  const bot = cfg.scene ? await loadScene(s, cfg.scene) : await loadWorkspace(s); await bot.ready;
  s.camera.fov = FOV; s.camera.near = 0.03; s.camera.updateProjectionMatrix();
  syncable(s.camera);
  /** Render the scene from each pose for a few frames (so the splats sort for that view) and keep the image. */
  const jobs = [];
  const st = {
    bot, feats: bot.features, frames: 0,
    capture(cam) {
      const cv = document.createElement("canvas"); cv.width = 400; cv.height = 225;
      return new Promise((resolve) => jobs.push({ cam, cv, n: 0, resolve }));
    },
    /** Call from update(): returns true while captures are in progress (the sim should wait). */
    capturing() {
      if (!jobs.length) return false;
      const j = jobs[0];
      s.camera.position.copy(j.cam.position); s.camera.quaternion.copy(j.cam.quaternion); s.camera.sync();
      return true;
    },
    /** Call right after rendering the main view. */
    afterRender() {
      if (!jobs.length) return;
      const j = jobs[0];
      if (++j.n >= (FAST ? 2 : 14)) { j.cv.getContext("2d").drawImage(s.canvas, 0, 0, j.cv.width, j.cv.height); jobs.shift(); j.resolve(j.cv); }
    },
    full() { setView(FOV, s.w / s.h); return { x: 0, y: 0, w: s.w, h: s.h }; },
    /** Optical flow from the current view to the goal view: one tapered, direction-coloured stroke per screen cell. */
    drawFlow(pairs) {
      const r = st.full(), o = s.o, cell = Math.max(38, s.w / 20), bins = new Map();
      for (const [cur, tgt] of pairs) {
        const p = toRect(cur, r), q = toRect(tgt, r), key = Math.floor(p.x / cell) + "," + Math.floor(p.y / cell);
        let b = bins.get(key); if (!b) { b = [0, 0, 0, 0, 0]; bins.set(key, b); }
        b[0] += p.x; b[1] += p.y; b[2] += q.x - p.x; b[3] += q.y - p.y; b[4]++;
      }
      o.save(); o.lineCap = "round";
      for (const b of bins.values()) {
        const x = b[0] / b[4], y = b[1] / b[4], dx = b[2] / b[4], dy = b[3] / b[4], L = Math.hypot(dx, dy);
        if (L < 2.5) { o.fillStyle = "rgba(123,228,149,0.9)"; o.beginPath(); o.arc(x, y, 2.2, 0, 6.2832); o.fill(); continue; }
        const k = Math.min(1, (cell * 0.95) / L), ex = x + dx * k, ey = y + dy * k, hue = Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360);
        const g = o.createLinearGradient(x, y, ex, ey);
        g.addColorStop(0, "hsla(" + hue + ",95%,70%,0.05)"); g.addColorStop(1, "hsla(" + hue + ",95%,68%,0.95)");
        o.strokeStyle = g; o.lineWidth = 2.4; o.beginPath(); o.moveTo(x, y); o.lineTo(ex, ey); o.stroke();
        o.fillStyle = "hsla(" + hue + ",95%,78%,1)"; o.beginPath(); o.arc(ex, ey, 2.4, 0, 6.2832); o.fill();
      }
      o.restore();
    },
    inset() { const w = Math.min(250, Math.round(s.w * 0.3)), h = Math.round(w * 9 / 16); return { x: s.w - w - 10, y: s.h - h - 10, w, h }; },
    drawImage(img, rect, label, color) { if (img) s.o.drawImage(img, rect.x, rect.y, rect.w, rect.h); else { s.o.fillStyle = "#0d1015"; s.o.fillRect(rect.x, rect.y, rect.w, rect.h); } s.frame(rect, label, color); }
  };
  setView(FOV, 16 / 9);
  s.busy(null);
  return st;
}
