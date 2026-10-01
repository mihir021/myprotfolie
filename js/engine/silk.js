/**
 * ============================================================================
 * SILK.JS — tiny Verlet physics engine for spider silk
 * ============================================================================
 * Points + distance constraints ("sticks"), integrated with position Verlet
 * at a fixed 120 Hz step. Used by:
 *   - the intro orb web (spider lands → web bounces, cut → strands snap back)
 *   - the interactive corner cobweb in the hero (cursor plucks the strands)
 *
 * Silk is modelled as slightly pre-tensioned (rest length < built length),
 * which is what makes strands *recoil* when they are cut.
 */
(function () {
    'use strict';

    class Silk {
        constructor(opts = {}) {
            this.points = [];
            this.sticks = [];
            this.gravity = opts.gravity != null ? opts.gravity : 140;   // px/s²
            this.damping = opts.damping != null ? opts.damping : 0.985;
            this.iterations = opts.iterations || 6;
            this.step = 1 / 120;
            this.acc = 0;
            this.pointer = { x: -9999, y: -9999, vx: 0, vy: 0, r: opts.pointerRadius || 70, active: false };
            this.energy = 0;
        }

        addPoint(x, y, pinned = false, mass = 1) {
            const p = { x, y, px: x, py: y, pinned, mass, fx: 0, fy: 0 };
            this.points.push(p);
            return p;
        }

        addStick(a, b, tension = 0.985, kind = 'silk') {
            const len = Math.hypot(b.x - a.x, b.y - a.y) * tension;
            const s = { a, b, len, kind, alive: true, stiff: 1 };
            this.sticks.push(s);
            return s;
        }

        /** Give a point a velocity kick (px per second) */
        kick(p, vx, vy) {
            p.px -= vx * this.step;
            p.py -= vy * this.step;
        }

        settle(steps = 160) {
            for (let i = 0; i < steps; i++) this.integrate(this.step);
            this.points.forEach(p => { p.px = p.x; p.py = p.y; });
        }

        update(dt) {
            this.acc += Math.min(dt, 1 / 20);
            let n = 0;
            while (this.acc >= this.step && n < 6) {
                this.integrate(this.step);
                this.acc -= this.step;
                n++;
            }
        }

        integrate(h) {
            const g = this.gravity * h * h;
            const d = this.damping;
            const ptr = this.pointer;
            const r2 = ptr.r * ptr.r;
            let energy = 0;
            for (const p of this.points) {
                if (p.pinned) continue;
                const vx = (p.x - p.px) * d;
                const vy = (p.y - p.py) * d;
                p.px = p.x;
                p.py = p.y;
                p.x += vx + p.fx * h * h;
                p.y += vy + g * p.mass + p.fy * h * h;
                energy += vx * vx + vy * vy;
                // cursor plucks nearby silk
                if (ptr.active) {
                    const dx = p.x - ptr.x, dy = p.y - ptr.y;
                    const dd = dx * dx + dy * dy;
                    if (dd < r2) {
                        const f = 1 - Math.sqrt(dd) / ptr.r;
                        p.x += ptr.vx * h * 0.9 * f;
                        p.y += ptr.vy * h * 0.9 * f;
                    }
                }
            }
            this.energy = energy;
            for (let it = 0; it < this.iterations; it++) {
                for (const s of this.sticks) {
                    if (!s.alive) continue;
                    const a = s.a, b = s.b;
                    const dx = b.x - a.x, dy = b.y - a.y;
                    const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
                    // silk only resists stretching; slack threads go loose
                    if (dist < s.len) continue;
                    const diff = ((dist - s.len) / dist) * 0.5 * s.stiff;
                    const ox = dx * diff, oy = dy * diff;
                    if (!a.pinned && !b.pinned) { a.x += ox; a.y += oy; b.x -= ox; b.y -= oy; }
                    else if (!a.pinned) { a.x += ox * 2; a.y += oy * 2; }
                    else if (!b.pinned) { b.x -= ox * 2; b.y -= oy * 2; }
                }
            }
        }
    }

    window.Silk = Silk;
})();
