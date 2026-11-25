/* Shared first-person servoing stage inside the real Gaussian-splat scene:
 * the main view is what the robot's camera sees; goal images are real
 * renders of the same scene from the goal pose. */
import { THREE, C } from "./kit.js";
import { loadWorkspace, toWorld } from "./splatbot.js";
import { setView, syncable, toRect } from "./servo.js";

export const FOV = 46;
/** Pose a camera at a simulator-frame position looking at a simulator-frame point. */
export function pose(cam, from, at, roll) {
  cam.position.set(from[0], from[2], -from[1]); cam.up.set(0, 1, 0);
  cam.lookAt(at[0], at[2], -at[1]); if (roll) cam.rotateZ(roll);
  cam.sync(); return cam;
}
export function ghost() { return syncable(new THREE.PerspectiveCamera(FOV, 16 / 9, 0.03, 30)); }

export async function stage(s) {
  await s.gate("Load the real scene", "a Gaussian splat of a real robot workspace · about 7 MB");
  s.busy("loading the captured scene…");
  const bot = await loadWorkspace(s); await bot.ready;
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
      if (++j.n >= 14) { j.cv.getContext("2d").drawImage(s.canvas, 0, 0, j.cv.width, j.cv.height); jobs.shift(); j.resolve(j.cv); }
    },
    full() { setView(FOV, s.w / s.h); return { x: 0, y: 0, w: s.w, h: s.h }; },
    /** Optical flow from the current view to the goal view, drawn as direction-coloured arrows. */
    drawFlow(pairs) {
      const r = st.full(), o = s.o;
      for (const [cur, tgt] of pairs) {
        const p = toRect(cur, r), q = toRect(tgt, r), dx = q.x - p.x, dy = q.y - p.y, L = Math.hypot(dx, dy);
        const col = "hsl(" + Math.round((Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360) + " 95% 62%)";
        if (L > 4) { const k = Math.min(1, 70 / L); s.arrow(p.x, p.y, p.x + dx * k, p.y + dy * k, col, 1.6); }
        o.beginPath(); o.arc(p.x, p.y, 2, 0, 6.2832); o.fillStyle = L > 4 ? col : C.green; o.fill();
      }
    },
    inset() { const w = Math.min(250, Math.round(s.w * 0.3)), h = Math.round(w * 9 / 16); return { x: s.w - w - 10, y: s.h - h - 10, w, h }; },
    drawImage(img, rect, label, color) { if (img) s.o.drawImage(img, rect.x, rect.y, rect.w, rect.h); else { s.o.fillStyle = "#0d1015"; s.o.fillRect(rect.x, rect.y, rect.w, rect.h); } s.frame(rect, label, color); }
  };
  setView(FOV, 16 / 9);
  s.busy(null);
  return st;
}
