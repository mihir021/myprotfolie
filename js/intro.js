/**
 * ============================================================================
 * INTRO.JS — "The Drop" (home page, once per session, ~1.9s)
 * ============================================================================
 *  0.00s  a spider drops on a single silk thread from the top of the page
 *  0.50s  the silk catches it: it bounces on the stretch of the thread and
 *         swings to a stop (spring + pendulum physics, so it feels real)
 *  1.00s  it shoots an anchor line down to the bottom edge of the paper
 *  1.22s  it climbs back up its thread, and the anchor line lifts the paper
 *         from the middle like a sheet being picked up, a soft shadow under
 *         the curved edge, revealing the front page underneath
 *
 * Nothing is left behind: when the sheet is gone the canvas is removed.
 * Nudge the spider with the cursor while it hangs. Esc / Skip jumps ahead.
 */
(function () {
    'use strict';

    const root = document.documentElement;
    const intro = document.getElementById('spider-intro');
    const SEEN_KEY = 'mr_intro_seen';

    function markSeen() { try { sessionStorage.setItem(SEEN_KEY, '1'); } catch (e) { /* ignore */ } }
    function finish() {
        root.classList.add('intro-done');
        root.classList.remove('intro-playing');
        if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
        window.dispatchEvent(new CustomEvent('mr:intro-complete'));
    }
    function reveal() {
        if (reveal.fired) return;
        reveal.fired = true;
        markSeen();
        root.classList.add('intro-revealing');
        window.dispatchEvent(new CustomEvent('mr:intro-reveal'));
    }

    if (!intro || root.classList.contains('intro-done') || typeof SpiderArt === 'undefined') {
        if (intro) { reveal(); finish(); }
        return;
    }

    root.classList.add('intro-playing');
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);

    // ------------------------------------------------------------------------
    // Setup
    // ------------------------------------------------------------------------
    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobile = W < 768;
    const cx = W / 2;
    const restY = H * (isMobile ? 0.42 : 0.44);      // where the spider's body settles

    const canvas = intro.querySelector('.intro-silk');
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    const css = getComputedStyle(root);
    const PAPER = (css.getPropertyValue('--bg-newsprint') || '#f8f6f0').trim();
    const INK = 'rgba(36, 38, 50, 0.8)';

    const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
    const ease = {
        in2: (t) => t * t,
        in3: (t) => t * t * t,
        out3: (t) => 1 - Math.pow(1 - t, 3),
        inOut3: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
    };

    const T = { land: 0.5, shoot: 1.0, shootDur: 0.16, climb: 1.22, climbDur: 0.62, cornerLag: 0.1, liftDur: 0.72 };

    // Spider sprite (separate small canvas, moved with transforms)
    const spiderCanvas = intro.querySelector('.intro-spider');
    const S = isMobile ? 170 : 230;
    const spider = new SpiderArt(spiderCanvas, { size: S, unit: S / 150, anchorY: 0.1, seed: 11, thread: false });
    const u = spider.unit;
    const spinY = 0.1 * S;                 // spinnerets inside the sprite
    const bodyY = spinY + 47 * u;          // pedicel inside the sprite
    const headY = spinY + 70 * u;          // front of the head (anchor line leaves here)
    spiderCanvas.style.transformOrigin = `${S / 2}px ${spinY}px`;

    // Physics state: thread length L (to the spinnerets) + pendulum angle θ
    const L0 = restY - (bodyY - spinY);
    const st = { L: -S, vL: 0, th: 0, vth: 0, crouch: 0, spread: 1 };

    let t = 0;
    let landed = false;
    let revealed = false;
    const pct = intro.querySelector('[data-intro-pct]');

    // Pointer nudges the hanging spider
    let ptr = null;
    function onMove(e) {
        const now = performance.now();
        if (ptr) {
            const dt = Math.max(8, now - ptr.t) / 1000;
            const vx = (e.clientX - ptr.x) / dt;
            const sx = cx + Math.sin(st.th) * st.L;
            const sy = Math.cos(st.th) * st.L + (bodyY - spinY);
            if (t > T.land && t < T.climb && Math.hypot(e.clientX - sx, e.clientY - sy) < 140) {
                st.vth += Math.max(-1.5, Math.min(1.5, vx * 0.00035));
            }
        }
        ptr = { x: e.clientX, y: e.clientY, t: now };
    }
    window.addEventListener('pointermove', onMove, { passive: true });
    const onTouch = (e) => { if (e.touches[0]) onMove(e.touches[0]); };
    window.addEventListener('touchmove', onTouch, { passive: true });

    // ------------------------------------------------------------------------
    // Simulation
    // ------------------------------------------------------------------------
    function simulate(dt) {
        if (t < T.land) {
            // free fall on the paying-out thread
            const k = ease.in2(clamp01(t / T.land));
            st.L = -S + (L0 + S) * k;
        } else if (t < T.climb) {
            if (!landed) {
                landed = true;
                st.L = L0;
                st.vL = isMobile ? 380 : 520;   // the silk catches the fall → stretch
                st.vth = 0.85;                  // and a little sideways swing
            }
            // silk spring (stretch/recoil) + pendulum, sub-stepped
            const n = 4, h = dt / n;
            for (let i = 0; i < n; i++) {
                const aL = -150 * (st.L - L0) - 11 * st.vL;
                st.vL += aL * h; st.L += st.vL * h;
                const aTh = -(1600 / Math.max(120, st.L)) * Math.sin(st.th) - 3.2 * st.vth;
                st.vth += aTh * h; st.th += st.vth * h;
            }
            st.spread += (0 - st.spread) * Math.min(1, dt * 6);
            st.crouch = ease.out3(clamp01((t - T.shoot) / 0.2)) * 0.9;   // anticipation
        } else {
            // climb: reel the thread in fast, the swing dies out
            const k = ease.in3(clamp01((t - T.climb) / T.climbDur));
            st.L = L0 - (L0 + S * 1.4) * k;
            st.th *= 0.85;
            st.crouch += (0.35 - st.crouch) * 0.2;
            st.spread += (0.45 - st.spread) * 0.2;
            if (!revealed && t > T.climb + 0.06) { revealed = true; reveal(); intro.classList.add('is-lifting'); }
        }
        if (pct) pct.textContent = String(Math.round(clamp01(t / T.climb) * 100)).padStart(2, '0');
    }

    // ------------------------------------------------------------------------
    // Render
    // ------------------------------------------------------------------------
    const glow = ctx.createRadialGradient(cx, restY, 0, cx, restY, Math.hypot(W, H) * 0.6);
    glow.addColorStop(0, 'rgba(255,255,255,0.6)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    const SIGMA = W * (isMobile ? 0.42 : 0.3);
    const SAMPLES = 56;
    const edgeAt = (x, yC, yK) => { const d = (x - cx) / SIGMA; return yK + (yC - yK) * Math.exp(-d * d); };

    function edgePath(yC, yK) {
        ctx.beginPath();
        for (let i = 0; i <= SAMPLES; i++) {
            const x = (i / SAMPLES) * W;
            const y = edgeAt(x, yC, yK);
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
    }

    function render() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, W, H);

        const sx = cx + Math.sin(st.th) * st.L;
        const sy = Math.cos(st.th) * st.L;
        const headX = sx + Math.sin(st.th) * (headY - spinY);
        const headYAbs = sy + Math.cos(st.th) * (headY - spinY);

        // the sheet's bottom edge: the centre is pulled up by the anchor line,
        // the corners follow a beat later, so it curves like real paper
        let yC = H + 60, yK = H + 60;
        if (t >= T.climb) {
            const kc = ease.in3(clamp01((t - T.climb) / T.liftDur));
            const kk = ease.inOut3(clamp01((t - T.climb - T.cornerLag) / T.liftDur));
            yC = H + 60 - (H + 60 + H * 0.35) * kc;
            yK = H + 60 - (H + 60 + H * 0.25) * kk;
        }

        // paper sheet
        ctx.beginPath();
        ctx.moveTo(-2, -2);
        ctx.lineTo(W + 2, -2);
        for (let i = SAMPLES; i >= 0; i--) {
            const x = (i / SAMPLES) * (W + 4) - 2;
            ctx.lineTo(x, edgeAt(x, yC, yK));
        }
        ctx.closePath();
        ctx.fillStyle = PAPER;
        ctx.fill();
        ctx.save();
        ctx.clip();
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        if (t >= T.climb) {
            // underside of the lifted edge
            ctx.strokeStyle = 'rgba(120, 110, 90, 0.16)';
            ctx.lineWidth = 12;
            edgePath(yC, yK);
            ctx.stroke();
        }
        ctx.restore();

        if (t >= T.climb) {
            // soft shadow the lifted sheet casts on the page below
            const lift = clamp01((H - yK) / H);
            const depth = 16 + 34 * lift;
            for (let i = 0; i < SAMPLES; i++) {
                const x0 = (i / SAMPLES) * W, x1 = ((i + 1) / SAMPLES) * W;
                const y0 = edgeAt(x0, yC, yK), y1 = edgeAt(x1, yC, yK);
                const ym = (y0 + y1) / 2;
                const g = ctx.createLinearGradient(0, ym, 0, ym + depth);
                g.addColorStop(0, `rgba(20, 18, 14, ${(0.22 * (1 - lift * 0.5)).toFixed(3)})`);
                g.addColorStop(1, 'rgba(20, 18, 14, 0)');
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.moveTo(x0, y0); ctx.lineTo(x1, y1);
                ctx.lineTo(x1, y1 + depth); ctx.lineTo(x0, y0 + depth);
                ctx.closePath();
                ctx.fill();
            }
            ctx.strokeStyle = 'rgba(20, 21, 30, 0.35)';
            ctx.lineWidth = 1;
            edgePath(yC, yK);
            ctx.stroke();
        }

        // dragline from the top of the page to the spinnerets
        if (sy > -10) {
            ctx.strokeStyle = INK;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(cx, 0);
            ctx.lineTo(sx, sy);
            ctx.stroke();
        }

        // anchor line: shot down to the sheet's edge, then it pulls the sheet up
        if (t >= T.shoot) {
            const k = ease.out3(clamp01((t - T.shoot) / T.shootDur));
            const ey = Math.min(H + 2, edgeAt(cx, yC, yK));
            const tx = headX + (cx - headX) * k;
            const ty = headYAbs + (ey - headYAbs) * k;
            if (ty > headYAbs) {
                ctx.strokeStyle = 'rgba(36, 38, 50, 0.7)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(headX, headYAbs);
                ctx.lineTo(tx, ty);
                ctx.stroke();
            }
        }

        spider.crouch = st.crouch;
        spider.spread = st.spread;
        spider.twitch = t < T.land ? 0.6 : 1.4;
        spider.draw();
        spiderCanvas.style.transform =
            `translate3d(${(sx - S / 2).toFixed(2)}px, ${(sy - spinY).toFixed(2)}px, 0) rotate(${(-st.th).toFixed(4)}rad)`;
    }

    // ------------------------------------------------------------------------
    // Loop
    // ------------------------------------------------------------------------
    let raf = 0;
    let last = performance.now();
    let done = false;
    let started = false;
    const END = T.climb + T.cornerLag + T.liftDur + 0.02;
    function frame(now) {
        const dt = Math.min(0.04, (now - last) / 1000);
        last = now;
        t += dt;
        spider.tick(dt);
        simulate(dt);
        render();
        if (t >= END) { end(); return; }
        raf = requestAnimationFrame(frame);
    }
    // Wait until the page behind is fully built (fonts + scroll scene) so the
    // drop never stutters, then start on a fresh frame. Fallback after 1.2s.
    function begin() {
        if (started) return;
        started = true;
        requestAnimationFrame((now) => { last = now; raf = requestAnimationFrame(frame); });
    }
    render();
    if (window.MR && window.MR.ready) begin();
    else {
        window.addEventListener('mr:motion-ready', begin, { once: true });
        setTimeout(begin, 1200);
    }

    function end() {
        if (done) return;
        done = true;
        cancelAnimationFrame(raf);
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('touchmove', onTouch);
        if ('scrollRestoration' in history) history.scrollRestoration = 'auto';
        reveal();
        finish();
    }

    // ------------------------------------------------------------------------
    // Skip (button / Esc / watchdog)
    // ------------------------------------------------------------------------
    function skip() {
        if (t >= T.climb) return;
        if (!landed) { landed = true; st.L = L0; st.vL = 0; st.vth = 0; }
        t = Math.max(t, T.shoot + T.shootDur);
        st.crouch = 0.9;
    }
    const skipBtn = intro.querySelector('.intro-skip');
    if (skipBtn) skipBtn.addEventListener('click', skip);
    window.addEventListener('keydown', function onKey(e) {
        if (e.key === 'Escape') { skip(); window.removeEventListener('keydown', onKey); }
    });
    setTimeout(() => { if (t < T.climb) skip(); }, 4000);
    setTimeout(() => { if (!done) end(); }, 7000);
})();
