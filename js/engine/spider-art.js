/**
 * ============================================================================
 * SPIDER-ART.JS — Realistic procedural spider renderer (Canvas 2D)
 * ============================================================================
 * A small, self-contained renderer used by the intro, the scroll-progress
 * spider and the page-transition curtain.
 *
 *  - Dorsal view, hanging head-down from its dragline (spinnerets on top).
 *  - Glossy abdomen + cephalothorax with radial-gradient shading, folium
 *    markings, fine hairs, 8 eyes, chelicerae and pedipalps.
 *  - 8 legs x 4 tapered segments, forward kinematics, per-leg idle twitch,
 *    a "crouch" amount (legs fold in) and a "spread" amount (legs reach out).
 *  - Renders ONLY when asked (draw()). No internal rAF loop, so it never
 *    burns CPU when nothing is moving.
 */
(function () {
    'use strict';

    const DEG = Math.PI / 180;

    // Right-side legs (left side is mirrored). Front (toward head, +y) → back.
    // a: attach angle on cephalothorax rim, seg: [length, absolute angle°, width]
    const LEGS = [
        { a: 58,  curl:  1, seg: [[21, 32, 2.7], [21, 68, 2.2], [18, 94, 1.55], [9, 104, 1.0]] },
        { a: 24,  curl:  1, seg: [[19, 2, 2.6],  [18, 34, 2.1], [15, 60, 1.5],  [8, 72, 0.95]] },
        { a: -12, curl: -1, seg: [[15, -26, 2.5], [14, -8, 2.0], [12, 14, 1.4], [7, 28, 0.9]] },
        { a: -46, curl: -1, seg: [[20, -40, 2.7], [20, -72, 2.2], [18, -96, 1.5], [9, -106, 1.0]] }
    ];

    function rand(seed) {
        // Deterministic PRNG so hairs never "boil" between frames
        let s = seed >>> 0;
        return function () {
            s = (s + 0x6D2B79F5) >>> 0;
            let t = Math.imul(s ^ (s >>> 15), 1 | s);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    class SpiderArt {
        /**
         * @param {HTMLCanvasElement} canvas
         * @param {Object} opts { size: css px of the square canvas, unit: drawing scale }
         */
        constructor(canvas, opts = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.size = opts.size || 240;
            this.unit = opts.unit || this.size / 150;
            this.anchorY = opts.anchorY != null ? opts.anchorY : 0.34; // spinneret position (fraction of height)
            this.accent = opts.accent || '#d9204c';
            this.time = Math.random() * 10;

            // Live pose parameters (animate these with GSAP)
            this.crouch = 0;      // 0 → relaxed, 1 → legs folded tight
            this.spread = 0;      // 0 → relaxed, 1 → legs stretched outward
            this.sway = 0;        // radians, body rotation around the spinneret
            this.twitch = 1;      // idle leg motion multiplier
            this.shadow = opts.shadow !== false;
            this.thread = opts.thread !== false; // draw the dragline stub above the spinnerets

            const r = rand(opts.seed || 7);
            this.hairs = [];
            for (let i = 0; i < 90; i++) {
                const th = r() * Math.PI * 2;
                this.hairs.push({ th, len: 1.2 + r() * 2.4, tilt: (r() - 0.5) * 0.9 });
            }
            this.legHairs = [];
            for (let i = 0; i < 64; i++) this.legHairs.push({ t: r(), side: r() < 0.5 ? -1 : 1, len: 0.8 + r() * 1.4 });

            this.resize();
        }

        resize() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.dpr = dpr;
            this.canvas.width = Math.round(this.size * dpr);
            this.canvas.height = Math.round(this.size * dpr);
            this.canvas.style.width = this.size + 'px';
            this.canvas.style.height = this.size + 'px';
        }

        /** Advance the idle clock (seconds) */
        tick(dt) { this.time += dt; }

        draw() {
            const ctx = this.ctx;
            const u = this.unit;
            ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
            ctx.clearRect(0, 0, this.size, this.size);

            const ox = this.size / 2;
            const oy = this.size * this.anchorY;

            // Short dragline stub from the top edge to the spinnerets
            if (this.thread) {
                ctx.strokeStyle = 'rgba(40, 44, 58, 0.75)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(ox, 0);
                ctx.lineTo(ox, oy);
                ctx.stroke();
            }

            ctx.save();
            ctx.translate(ox, oy);
            ctx.rotate(this.sway);
            // Body origin = pedicel (waist). Spinnerets sit 47u above it.
            ctx.translate(0, 47 * u);

            if (this.shadow) this.drawShadow(ctx, u);
            this.drawLegs(ctx, u, 1);
            this.drawLegs(ctx, u, -1);
            this.drawPalps(ctx, u);
            this.drawAbdomen(ctx, u);
            this.drawCephalothorax(ctx, u);
            ctx.restore();
        }

        drawShadow(ctx, u) {
            ctx.save();
            ctx.translate(7 * u, 9 * u);
            ctx.fillStyle = 'rgba(20, 18, 14, 0.10)';
            ctx.beginPath();
            ctx.ellipse(0, -24 * u, 17 * u, 23 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(0, 9 * u, 11 * u, 12 * u, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        legPoints(leg, side, idx, u) {
            const t = this.time;
            const ph = idx * 1.7 + (side < 0 ? 0.9 : 0);
            const tw = this.twitch;
            const rimA = leg.a * DEG;
            let x = Math.cos(rimA) * 8.5 * u;
            let y = 9 * u + Math.sin(rimA) * 9.5 * u;
            const pts = [[x, y]];
            for (let s = 0; s < leg.seg.length; s++) {
                const [len, ang, w] = leg.seg[s];
                let a = ang;
                // idle micro-motion (slow breathing + occasional flick)
                a += Math.sin(t * 1.6 + ph + s * 0.6) * 2.2 * tw * (s + 1) * 0.6;
                a += Math.sin(t * 7.3 + ph * 3.1) * Math.max(0, Math.sin(t * 0.9 + ph)) * 1.4 * tw * s;
                // crouch folds each later segment more toward the body
                a += leg.curl * this.crouch * (s === 0 ? 8 : 26 + s * 6);
                // spread opens the leg outward (toward horizontal)
                a -= leg.curl * this.spread * (6 + s * 7);
                const L = len * u * (1 - this.crouch * 0.12 * s);
                x += Math.cos(a * DEG) * L;
                y += Math.sin(a * DEG) * L;
                pts.push([x, y, w]);
            }
            return pts;
        }

        drawLegs(ctx, u, side) {
            ctx.save();
            ctx.scale(side, 1);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            LEGS.forEach((leg, i) => {
                const pts = this.legPoints(leg, side, i, u);
                // core segments (tapered by stepping width per segment)
                for (let s = 1; s < pts.length; s++) {
                    const [x0, y0] = pts[s - 1];
                    const [x1, y1, w] = pts[s];
                    ctx.strokeStyle = '#121217';
                    ctx.lineWidth = w * u;
                    ctx.beginPath();
                    ctx.moveTo(x0, y0);
                    ctx.lineTo(x1, y1);
                    ctx.stroke();
                    // specular ridge
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
                    ctx.lineWidth = Math.max(0.5, w * u * 0.28);
                    ctx.beginPath();
                    ctx.moveTo(x0 - w * u * 0.22, y0 - w * u * 0.22);
                    ctx.lineTo(x1 - w * u * 0.22, y1 - w * u * 0.22);
                    ctx.stroke();
                }
                // joints: knee (patella) carries a thin crimson band
                for (let s = 1; s < pts.length - 1; s++) {
                    const [jx, jy, w] = pts[s];
                    ctx.fillStyle = s === 1 ? '#b5173e' : '#1d1e26';
                    ctx.beginPath();
                    ctx.arc(jx, jy, w * u * (s === 1 ? 0.5 : 0.58), 0, Math.PI * 2);
                    ctx.fill();
                }
                // bristles along tibia + metatarsus
                ctx.strokeStyle = 'rgba(18, 18, 23, 0.85)';
                ctx.lineWidth = 0.6;
                for (let h = i * 16; h < i * 16 + 16; h++) {
                    const hh = this.legHairs[h % this.legHairs.length];
                    const s = 2 + (hh.t > 0.5 ? 1 : 0);
                    const [x0, y0] = pts[s - 1];
                    const [x1, y1] = pts[s];
                    const f = (hh.t * 2) % 1;
                    const px = x0 + (x1 - x0) * f;
                    const py = y0 + (y1 - y0) * f;
                    const dx = x1 - x0, dy = y1 - y0;
                    const m = Math.hypot(dx, dy) || 1;
                    const nx = (-dy / m) * hh.side, ny = (dx / m) * hh.side;
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.lineTo(px + (nx + dx / m * 0.8) * hh.len * u, py + (ny + dy / m * 0.8) * hh.len * u);
                    ctx.stroke();
                }
            });
            ctx.restore();
        }

        drawPalps(ctx, u) {
            ctx.save();
            ctx.lineCap = 'round';
            ctx.strokeStyle = '#15161c';
            [-1, 1].forEach(side => {
                const wig = Math.sin(this.time * 2.4 + side) * 2 * this.twitch;
                ctx.lineWidth = 1.7 * u;
                ctx.beginPath();
                ctx.moveTo(side * 3.5 * u, 18 * u);
                ctx.lineTo(side * (7 + wig * 0.2) * u, 24 * u);
                ctx.lineTo(side * (6 + wig * 0.4) * u, 30 * u);
                ctx.stroke();
                ctx.fillStyle = '#1b1c24';
                ctx.beginPath();
                ctx.arc(side * (6 + wig * 0.4) * u, 30 * u, 1.4 * u, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.restore();
        }

        drawAbdomen(ctx, u) {
            const cy = -25 * u;
            const rx = 15.5 * u, ry = 21.5 * u;
            ctx.save();

            // hairs first, so the glossy body sits on top of their roots
            ctx.strokeStyle = 'rgba(16, 16, 20, 0.9)';
            ctx.lineWidth = 0.7;
            this.hairs.forEach(h => {
                const ex = Math.cos(h.th) * rx, ey = Math.sin(h.th) * ry;
                const a = h.th + h.tilt;
                ctx.beginPath();
                ctx.moveTo(ex * 0.96, cy + ey * 0.96);
                ctx.lineTo(ex + Math.cos(a) * h.len * u, cy + ey + Math.sin(a) * h.len * u);
                ctx.stroke();
            });

            const g = ctx.createRadialGradient(-5 * u, cy - 9 * u, 1 * u, 0, cy, ry * 1.05);
            g.addColorStop(0, '#5a5d6b');
            g.addColorStop(0.28, '#2a2b34');
            g.addColorStop(0.75, '#111117');
            g.addColorStop(1, '#060608');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(0, cy, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();

            // folium: chevron markings in deep crimson down the midline
            ctx.fillStyle = this.accent;
            ctx.globalAlpha = 0.88;
            for (let k = 0; k < 4; k++) {
                const y = cy + 10 * u - k * 7 * u;
                const w = (6.5 - k * 0.9) * u;
                ctx.beginPath();
                ctx.moveTo(-w, y);
                ctx.quadraticCurveTo(0, y - 5 * u, w, y);
                ctx.quadraticCurveTo(0, y - 2.2 * u, -w, y);
                ctx.fill();
            }
            ctx.globalAlpha = 1;
            // central heart line
            ctx.fillStyle = 'rgba(217, 32, 76, 0.55)';
            ctx.beginPath();
            ctx.ellipse(0, cy - 4 * u, 1.6 * u, 9 * u, 0, 0, Math.PI * 2);
            ctx.fill();

            // specular highlights (wet/glossy look)
            const sp = ctx.createRadialGradient(-6 * u, cy - 11 * u, 0, -6 * u, cy - 11 * u, 8 * u);
            sp.addColorStop(0, 'rgba(255,255,255,0.55)');
            sp.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = sp;
            ctx.beginPath();
            ctx.ellipse(-6 * u, cy - 11 * u, 5 * u, 7 * u, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'rgba(255,255,255,0.12)';
            ctx.beginPath();
            ctx.ellipse(7 * u, cy + 6 * u, 2 * u, 6 * u, 0.4, 0, Math.PI * 2);
            ctx.fill();

            // spinnerets
            ctx.fillStyle = '#23242c';
            ctx.beginPath();
            ctx.ellipse(-1.6 * u, cy - ry + 0.5 * u, 1.3 * u, 2 * u, 0, 0, Math.PI * 2);
            ctx.ellipse(1.6 * u, cy - ry + 0.5 * u, 1.3 * u, 2 * u, 0, 0, Math.PI * 2);
            ctx.fill();

            // pedicel
            ctx.fillStyle = '#1a1b22';
            ctx.beginPath();
            ctx.ellipse(0, -1 * u, 2.6 * u, 3.4 * u, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        drawCephalothorax(ctx, u) {
            const cy = 9 * u;
            ctx.save();
            const g = ctx.createRadialGradient(-3 * u, cy - 4 * u, 0.5 * u, 0, cy, 12 * u);
            g.addColorStop(0, '#565966');
            g.addColorStop(0.4, '#25262e');
            g.addColorStop(1, '#09090c');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.ellipse(0, cy, 10 * u, 11.5 * u, 0, 0, Math.PI * 2);
            ctx.fill();

            // radial grooves from the fovea
            ctx.strokeStyle = 'rgba(255,255,255,0.08)';
            ctx.lineWidth = 0.8;
            for (let k = -2; k <= 2; k++) {
                const a = Math.PI / 2 + k * 0.5;
                ctx.beginPath();
                ctx.moveTo(0, cy - 2 * u);
                ctx.lineTo(Math.cos(a + Math.PI) * 8 * u, cy - 2 * u + Math.sin(a + Math.PI) * 8 * u);
                ctx.stroke();
            }

            // chelicerae (fangs base)
            [-1, 1].forEach(side => {
                const cg = ctx.createRadialGradient(side * 2 * u, 20 * u, 0, side * 2.4 * u, 21 * u, 3.6 * u);
                cg.addColorStop(0, '#3e404c');
                cg.addColorStop(1, '#0b0b0e');
                ctx.fillStyle = cg;
                ctx.beginPath();
                ctx.ellipse(side * 2.4 * u, 21.5 * u, 2.4 * u, 3.6 * u, side * -0.2, 0, Math.PI * 2);
                ctx.fill();
            });

            // eyes: 2 large anterior medians + 6 smaller around them
            const eyes = [
                [-2.4, 16.2, 1.9], [2.4, 16.2, 1.9],
                [-5.4, 15.0, 1.15], [5.4, 15.0, 1.15],
                [-3.6, 12.4, 1.0], [3.6, 12.4, 1.0],
                [-6.4, 11.6, 0.85], [6.4, 11.6, 0.85]
            ];
            eyes.forEach(([x, y, r], i) => {
                ctx.fillStyle = '#020203';
                ctx.beginPath();
                ctx.arc(x * u, y * u, r * u, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = i < 2 ? 'rgba(217, 32, 76, 0.55)' : 'rgba(90, 20, 36, 0.6)';
                ctx.beginPath();
                ctx.arc(x * u, y * u, r * u * 0.62, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.9)';
                ctx.beginPath();
                ctx.arc((x - r * 0.35) * u, (y - r * 0.35) * u, r * u * 0.3, 0, Math.PI * 2);
                ctx.fill();
            });

            // carapace gloss
            const sp = ctx.createRadialGradient(-3.5 * u, cy - 5 * u, 0, -3.5 * u, cy - 5 * u, 5 * u);
            sp.addColorStop(0, 'rgba(255,255,255,0.4)');
            sp.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = sp;
            ctx.beginPath();
            ctx.arc(-3.5 * u, cy - 5 * u, 5 * u, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    window.SpiderArt = SpiderArt;
})();
