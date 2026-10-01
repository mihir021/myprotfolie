/**
 * ============================================================================
 * MOTION.JS — Smooth scroll (Lenis) + scroll choreography (GSAP/ScrollTrigger)
 *             + the spider touches that run across every page.
 * ============================================================================
 * Performance rules followed here:
 *  - One RAF for everything: Lenis is driven by gsap.ticker.
 *  - Only transform / opacity / clip-path are animated.
 *  - Canvases render on demand and stop when idle.
 *  - Heavy set-pieces are scoped with gsap.matchMedia so phones get lighter
 *    versions and prefers-reduced-motion gets none.
 */
(function () {
    'use strict';

    const root = document.documentElement;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouch = window.matchMedia('(hover: none)').matches;

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
        root.classList.add('motion-off');
        return;
    }

    gsap.registerPlugin(ScrollTrigger);
    if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: 'power3.out', duration: 0.9 });
    ScrollTrigger.config({ ignoreMobileResize: true });

    const $ = (s, c = document) => c.querySelector(s);
    const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

    const page = document.body.classList.contains('projects-archive-page') ? 'projects'
        : document.body.classList.contains('case-study-page') ? 'case' : 'home';

    // ------------------------------------------------------------------------
    // 1. LENIS SMOOTH SCROLL (single shared ticker)
    // ------------------------------------------------------------------------
    let lenis = null;
    if (!reduce && typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            lerp: 0.095,
            wheelMultiplier: 1,
            smoothWheel: true,
            syncTouch: false,          // native momentum on phones = no input lag
            autoResize: true
        });
        lenis.on('scroll', ScrollTrigger.update);
        gsap.ticker.add((t) => lenis.raf(t * 1000));
        gsap.ticker.lagSmoothing(0);
        root.classList.add('lenis-on');
    }

    const MR = window.MR = window.MR || {};
    MR.lenis = lenis;
    MR.scrollTo = function (target, opts = {}) {
        const nav = $('.newspaper-nav') || $('.case-study-topbar');
        const offset = opts.offset != null ? opts.offset : -((nav && nav.offsetHeight) || 0) - 12;
        if (lenis) lenis.scrollTo(target, { offset, duration: opts.duration || 1.4, easing: (x) => 1 - Math.pow(1 - x, 4), immediate: !!opts.immediate });
        else {
            const el = typeof target === 'string' ? $(target) : target;
            const y = typeof target === 'number' ? target : (el ? el.getBoundingClientRect().top + window.scrollY + offset : 0);
            window.scrollTo({ top: y, behavior: reduce || opts.immediate ? 'auto' : 'smooth' });
        }
    };

    const introPlaying = root.classList.contains('intro-playing') || (!!$('#spider-intro') && !root.classList.contains('intro-done'));
    if (introPlaying && lenis) lenis.stop();

    // Smooth in-page anchors (#work, #contact …)
    document.addEventListener('click', (e) => {
        const a = e.target.closest('a[href*="#"]');
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
        const url = new URL(a.href, location.href);
        if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
        const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
        if (!target) return;
        e.preventDefault();
        MR.scrollTo(target);
        history.replaceState(null, '', url.hash);
    });

    // Arriving with a hash from another page (e.g. projects → index.html#contact)
    window.addEventListener('load', () => {
        if (location.hash && location.hash.length > 1) {
            const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
            if (t) setTimeout(() => MR.scrollTo(t, { duration: 1.2 }), 350);
        }
        ScrollTrigger.refresh();
    });

    // Modal (case dossier) → pause smooth scroll while it is open
    const modal = $('#case-modal');
    if (modal && lenis) {
        new MutationObserver(() => {
            if (modal.classList.contains('hidden')) lenis.start(); else lenis.stop();
        }).observe(modal, { attributes: true, attributeFilter: ['class'] });
    }

    // ------------------------------------------------------------------------
    // 2. HELPERS
    // ------------------------------------------------------------------------
    function split(el, type = 'lines', mask = 'lines') {
        if (!el || typeof SplitText === 'undefined') return null;
        return SplitText.create(el, { type, mask, linesClass: 'split-line', wordsClass: 'split-word', charsClass: 'split-char', autoSplit: false, aria: 'auto' });
    }

    function scramble(el, duration = 0.7) {
        if (!el) return;
        const finalText = el.textContent;
        const glyphs = '#%&/\\[]{}<>*+=~:;!?01';
        const obj = { p: 0 };
        gsap.to(obj, {
            p: 1, duration, ease: 'none',
            onUpdate() {
                const n = Math.floor(obj.p * finalText.length);
                let out = finalText.slice(0, n);
                for (let i = n; i < finalText.length; i++) out += finalText[i] === ' ' ? ' ' : glyphs[(Math.random() * glyphs.length) | 0];
                el.textContent = out;
            },
            onComplete() { el.textContent = finalText; }
        });
    }

    // Teletype decode: random glyphs resolve left→right while a clip-path
    // wipe opens at the same speed, so only legible text is ever visible.
    const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&/+=<>';
    function scrambleWipe(tl, el, at, dur = 0.8) {
        if (!el || el.children.length) return false;
        const txt = el.textContent;
        const o = { p: 0 };
        tl.fromTo(el, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur, ease: 'power2.out', clearProps: 'clipPath' }, at)
          .to(o, {
              p: 1, duration: dur, ease: 'none',
              onUpdate() {
                  const n = Math.floor(o.p * txt.length);
                  let out = txt.slice(0, n);
                  for (let i = n; i < txt.length; i++) out += /\s/.test(txt[i]) ? txt[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
                  el.textContent = out;
              },
              onComplete() { el.textContent = txt; }
          }, at);
        return true;
    }

    // Silk strand rule with a tiny dangling spider (injected SVG)
    let ruleId = 0;
    function makeWebRule() {
        ruleId++;
        const wrap = document.createElement('div');
        wrap.className = 'web-rule';
        wrap.setAttribute('aria-hidden', 'true');
        const dropX = 70 + (ruleId * 13) % 20; // % of width
        wrap.innerHTML =
            `<svg viewBox="0 0 1000 60" preserveAspectRatio="none">` +
            `<path class="web-rule-strand" pathLength="1" d="M0 6 Q 250 22 500 12 T 1000 6"/>` +
            `<path class="web-rule-strand thin" pathLength="1" d="M0 2 Q 300 16 620 9 T 1000 3"/>` +
            `</svg>` +
            `<span class="web-rule-drop" style="left:${dropX}%"><span class="web-rule-thread"></span><span class="mini-spider"></span></span>`;
        return wrap;
    }

    // Corner cobweb (injected SVG) — drawn when it scrolls into view
    function makeCobweb(cls = '') {
        const el = document.createElement('div');
        el.className = 'cobweb ' + cls;
        el.setAttribute('aria-hidden', 'true');
        let d = '';
        const R = 92;
        const spokes = [0, 18, 38, 58, 76, 90];
        spokes.forEach(a => {
            const r = a * Math.PI / 180;
            d += `M100 0 L${(100 - Math.cos(r) * R).toFixed(1)} ${(Math.sin(r) * R).toFixed(1)} `;
        });
        let rings = '';
        [22, 40, 58, 76].forEach((rr, i) => {
            let p = '';
            spokes.forEach((a, j) => {
                const r = a * Math.PI / 180;
                const x = 100 - Math.cos(r) * rr, y = Math.sin(r) * rr;
                if (j === 0) p += `M${x.toFixed(1)} ${y.toFixed(1)}`;
                else {
                    const m = (spokes[j - 1] + a) / 2 * Math.PI / 180;
                    p += ` Q${(100 - Math.cos(m) * rr * 0.86).toFixed(1)} ${(Math.sin(m) * rr * 0.86).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
                }
            });
            rings += `<path class="cobweb-ring" pathLength="1" d="${p}"/>`;
        });
        el.innerHTML = `<svg viewBox="0 0 100 100"><path class="cobweb-spoke" pathLength="1" d="${d}"/>${rings}</svg>`;
        return el;
    }

    function drawOnEnter(scope, trigger) {
        const paths = $$('path', scope);
        gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
        gsap.to(paths, {
            strokeDashoffset: 0, duration: 1.2, ease: 'power2.inOut', stagger: 0.08,
            scrollTrigger: { trigger: trigger || scope, start: 'top 85%', once: true }
        });
    }

    // Subtle 3D tilt that follows the pointer (quickTo = no tween spam)
    function tilt(el, max = 5) {
        if (isTouch || reduce || !el) return;
        el.classList.add('has-tilt');
        const rx = gsap.quickTo(el, 'rotationX', { duration: 0.6, ease: 'power3.out' });
        const ry = gsap.quickTo(el, 'rotationY', { duration: 0.6, ease: 'power3.out' });
        gsap.set(el, { transformPerspective: 900 });
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            ry(px * max * 2);
            rx(-py * max * 2);
        });
        el.addEventListener('pointerleave', () => { rx(0); ry(0); });
    }

    // ------------------------------------------------------------------------
    // 3. HERO / MASTHEAD ENTRANCE (all pages)
    // ------------------------------------------------------------------------
    function heroIn() {
        const tl = gsap.timeline({ defaults: { ease: 'expo.out', duration: 1.2 } });
        const title = $('.masthead-title') || $('.case-display-headline');

        gsap.set('[data-hero]', { autoAlpha: 1 });

        if (title) {
            const s = split(title, 'chars,lines', 'lines');
            if (s) tl.from(s.chars, { yPercent: 115, rotate: 6, duration: 1.15, stagger: 0.035 }, 0);
            else tl.from(title, { y: 40, autoAlpha: 0 }, 0);
        }

        const topBits = $$('.newspaper-top-bar > *, .case-top-inner > *');
        topBits.forEach((el, i) => { if (!scrambleWipe(tl, el, 0.1 + i * 0.08, 0.9)) tl.from(el, { y: -14, autoAlpha: 0, duration: 0.8 }, 0.1 + i * 0.08); });

        const tag = $('.masthead-tagline');
        if (tag && !scrambleWipe(tl, tag, 0.35, 1.1)) tl.from(tag, { autoAlpha: 0, duration: 1 }, 0.35);

        const dl = $('.newspaper-dateline');
        if (dl) {
            tl.from(dl, { scaleX: 0, transformOrigin: '50% 50%', duration: 1.1, ease: 'power4.inOut' }, 0.25);
            $$('.dateline-item', dl).forEach((el, i) => scrambleWipe(tl, el, 0.7 + i * 0.09, 0.7));
            tl.from($$('.dateline-divider', dl), { autoAlpha: 0, stagger: 0.06, duration: 0.4 }, 0.8);
        }
        $$('.frontpage-meta-bar .meta-tag, .case-number, .case-flag-tag').forEach((el, i) => scrambleWipe(tl, el, 0.75 + i * 0.1, 0.8));

        const nav = $('.newspaper-nav');
        if (nav) tl.from(nav, { y: -20, autoAlpha: 0, duration: 0.9 }, 0.45);

        // Home lead story
        const head = $('.hero-headline');
        if (head) {
            const s = split(head, 'lines', 'lines');
            tl.from(s ? s.lines : head, { yPercent: 105, duration: 1.1, stagger: 0.09 }, 0.55);
        }
        const leadBits = $$('.hero-lead-italic, .byline-strip, .hero-action-row > *, .editorial-body .editorial-paragraph');
        if (leadBits.length) tl.from(leadBits, { y: 26, autoAlpha: 0, stagger: 0.07, duration: 0.9 }, 0.7);

        const frame = $('.newspaper-photo-frame');
        if (frame) {
            const img = $('img', frame);
            tl.fromTo(frame, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0.5);
            if (img) tl.from(img, { scale: 1.3, duration: 1.8, ease: 'expo.out' }, 0.6);
        }

        // Projects / case page headers
        const sb = $('.projects-archive-page .section-banner');
        if (sb) tl.from($$('.section-title, .section-case-tag, .section-sub, .header-rule-double', sb), { y: 30, autoAlpha: 0, stagger: 0.08 }, 0.6);
        const cs = $$('.case-sub-lead, .case-byline-strip');
        if (cs.length) tl.from(cs, { y: 24, autoAlpha: 0, stagger: 0.08 }, 0.5);

        return tl;
    }

    // ------------------------------------------------------------------------
    // 4. SCROLL CHOREOGRAPHY
    // ------------------------------------------------------------------------
    function buildScroll() {
        const mm = gsap.matchMedia();

        // Sticky nav compacts after the masthead
        const nav = $('.newspaper-nav');
        if (nav) {
            ScrollTrigger.create({ trigger: nav, start: 'top top', end: 'max', toggleClass: { targets: nav, className: 'is-stuck' } });
        }

        // Section banners: scrambled numeral + rising title + silk rule
        $$('.newspaper-section > .section-banner').forEach((b) => {
            const rule = makeWebRule();
            b.prepend(rule);
            const roman = $('.section-roman', b);
            const title = $('.section-title', b);
            const sub = $('.section-sub', b);
            const s = split(title, 'words', 'words');
            const tl = gsap.timeline({ scrollTrigger: { trigger: b, start: 'top 82%', once: true } });
            tl.fromTo($$('.web-rule-strand', rule), { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.inOut', stagger: 0.12 }, 0)
              .from($('.web-rule-drop', rule), { yPercent: -100, autoAlpha: 0, duration: 1.1, ease: 'elastic.out(1, 0.45)' }, 0.75)
              .add(() => scramble(roman, 0.6), 0.1)
              .from(roman, { autoAlpha: 0, duration: 0.3 }, 0.1)
              .from(s ? s.words : title, { yPercent: 110, duration: 1, stagger: 0.05, ease: 'expo.out' }, 0.15)
              .from(sub, { autoAlpha: 0, y: 16, duration: 0.8 }, 0.45);
        });

        // Images inside frames: gentle parallax (inner image drifts)
        $$('.preview-frame img, .archive-img-frame img, .case-evidence-img, .newspaper-photo').forEach((img) => {
            const box = img.parentElement;
            box.classList.add('parallax-box');
            gsap.fromTo(img, { yPercent: -6, scale: 1.12 }, {
                yPercent: 6, scale: 1.12, ease: 'none',
                scrollTrigger: { trigger: box, start: 'top bottom', end: 'bottom top', scrub: true }
            });
        });

        // HOME ------------------------------------------------------------------
        if (page === 'home') {
            // Hero lead column floats slower than the photo while leaving
            const heroGrid = $('.broadsheet-hero-grid');
            if (heroGrid) {
                gsap.to('.hero-media-column', {
                    yPercent: -10, ease: 'none',
                    scrollTrigger: { trigger: heroGrid, start: 'top top+=80', end: 'bottom top', scrub: true }
                });
            }

            // Featured exhibit: a case photo slapped onto the desk
            const feat = $('.featured-exhibit-card');
            if (feat) {
                feat.appendChild(makeCobweb('cobweb-tr'));
                drawOnEnter($('.cobweb', feat), feat);
                const tl = gsap.timeline({ scrollTrigger: { trigger: feat, start: 'top 85%', end: 'top 35%', scrub: 0.8 } });
                tl.from($('.taped-preview-box', feat), { rotation: -7, y: 120, scale: 0.9, xPercent: -8, ease: 'power2.out' }, 0)
                  .from($('.featured-exhibit-info', feat), { x: 80, autoAlpha: 0, ease: 'power2.out' }, 0.1)
                  .from($('.tape-strip', feat), { scaleX: 0, autoAlpha: 0, ease: 'back.out(2)' }, 0.6);
                gsap.from($$('.tech-pill', feat), { y: 14, autoAlpha: 0, stagger: 0.04, duration: 0.5, scrollTrigger: { trigger: $('.tech-pill-row', feat), start: 'top 90%', once: true } });
                tilt($('.taped-preview-box', feat), 3);
            }

            // Three column exhibits: papers dropped on a desk
            const cols = $$('.col-exhibit-card');
            if (cols.length) {
                gsap.from(cols, {
                    y: 160, rotation: (i) => [-6, 4, -3][i % 3], autoAlpha: 0,
                    duration: 1.2, ease: 'expo.out', stagger: 0.12,
                    scrollTrigger: { trigger: '.exhibits-three-col-grid', start: 'top 85%', once: true }
                });
                cols.forEach((c) => tilt(c, 4));
            }

            // Archive callout: count-up
            const count = $('.archive-count-text');
            if (count) {
                const m = count.textContent.match(/\d+/);
                if (m) {
                    const n = +m[0];
                    count.innerHTML = count.textContent.replace(m[0], '<span class="count-num">0</span>');
                    const num = $('.count-num', count);
                    const o = { v: 0 };
                    gsap.to(o, { v: n, duration: 1.4, ease: 'power2.out', onUpdate: () => { num.textContent = Math.round(o.v); }, scrollTrigger: { trigger: count, start: 'top 90%', once: true } });
                }
                const callout = $('.archive-banner-callout');
                callout.appendChild(makeCobweb('cobweb-tr small'));
                drawOnEnter($('.cobweb', callout), callout);
                gsap.from(callout, { scale: 0.94, autoAlpha: 0, duration: 1, scrollTrigger: { trigger: callout, start: 'top 88%', once: true } });
            }

            // SYSTEMS: horizontal pinned scroll on large screens, stagger on small
            const sys = $('#stack');
            const track = $('.systems-broadsheet-grid');
            if (sys && track) {
                mm.add('(min-width: 1024px) and (min-height: 640px), (max-width: 768px) and (min-height: 700px)', () => {
                    sys.classList.add('is-horizontal');
                    const progress = document.createElement('div');
                    progress.className = 'h-progress';
                    progress.innerHTML = '<span class="h-progress-line"></span><span class="h-progress-spider mini-spider"></span>';
                    sys.appendChild(progress);
                    const dist = () => track.scrollWidth - track.clientWidth;
                    const tween = gsap.to(track.children, {
                        x: () => -dist(), ease: 'none',
                        scrollTrigger: {
                            trigger: sys, start: 'top top', end: () => '+=' + dist(),
                            pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1,
                            onUpdate: (self) => gsap.set(progress, { '--p': self.progress })
                        }
                    });
                    $$('.system-pillar-box', track).forEach((box) => {
                        gsap.fromTo(box, { rotation: 2.5, y: 40, autoAlpha: 0.35 }, {
                            rotation: 0, y: 0, autoAlpha: 1, ease: 'none',
                            scrollTrigger: { trigger: box, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true }
                        });
                    });
                    return () => { sys.classList.remove('is-horizontal'); progress.remove(); };
                });
                mm.add('(min-width: 769px) and (max-width: 1023px), (min-width: 769px) and (max-height: 639px), (max-width: 768px) and (max-height: 699px)', () => {
                    gsap.from($$('.system-pillar-box', track), {
                        y: 60, autoAlpha: 0, stagger: 0.1, duration: 0.9,
                        scrollTrigger: { trigger: track, start: 'top 85%', once: true }
                    });
                });
            }

            // Hackathon dispatches: rubber-stamp slam
            const disp = $$('.hackathon-dispatch-card');
            if (disp.length) {
                gsap.from(disp, {
                    scale: 1.45, rotation: (i) => ((i * 37) % 16) - 8, autoAlpha: 0,
                    duration: 0.55, ease: 'power4.in', stagger: { each: 0.08, grid: 'auto', from: 'start' },
                    scrollTrigger: { trigger: '.hackathon-dispatch-grid', start: 'top 80%', once: true },
                    onComplete() { disp.forEach((d) => d.classList.add('is-stamped')); }
                });
            }

            // Credentials: pages flipping down
            const creds = $$('.credential-item');
            if (creds.length) {
                gsap.from(creds, {
                    rotationX: -85, transformOrigin: '50% 0%', transformPerspective: 800, autoAlpha: 0, y: 20,
                    duration: 1, ease: 'expo.out', stagger: 0.07,
                    scrollTrigger: { trigger: '.credentials-broadsheet-grid', start: 'top 82%', once: true }
                });
            }

            // Contact desk
            const contact = $('#contact');
            if (contact) {
                const lead = $('.contact-lead-title', contact);
                const s = split(lead, 'lines', 'lines');
                const tl = gsap.timeline({ scrollTrigger: { trigger: '.contact-broadsheet-grid', start: 'top 80%', once: true } });
                tl.from(s ? s.lines : lead, { yPercent: 105, stagger: 0.08, duration: 1, ease: 'expo.out' }, 0)
                  .from($$('.contact-card-header, .contact-body-copy', contact), { y: 20, autoAlpha: 0, stagger: 0.08 }, 0.15)
                  .from($$('.channel-row', contact), { x: -40, autoAlpha: 0, stagger: 0.05, duration: 0.7 }, 0.3)
                  .from('.telegram-form-card', { y: 80, rotation: 2.5, autoAlpha: 0, duration: 1.2, ease: 'expo.out' }, 0.1)
                  .from($$('.telegram-form-card .form-field, .telegram-form-card .btn-transmit'), { y: 20, autoAlpha: 0, stagger: 0.06 }, 0.45);
                const tg = $('.telegram-form-card');
                if (tg) { tg.appendChild(makeCobweb('cobweb-tr small')); drawOnEnter($('.cobweb', tg), tg); }
            }

            // Velocity-reactive "EXTRA! EXTRA!" tickers
            $$('.news-ticker').forEach((tk, i) => {
                const tr = $('.ticker-track', tk);
                const dir = i % 2 ? 1 : -1;
                const loop = gsap.fromTo(tr, { xPercent: dir < 0 ? 0 : -50 }, { xPercent: dir < 0 ? -50 : 0, duration: 38, ease: 'none', repeat: -1 });
                let boost = 0;
                ScrollTrigger.create({
                    trigger: tk, start: 'top bottom', end: 'bottom top',
                    onToggle: (self) => (self.isActive ? loop.play() : loop.pause()),
                    onUpdate: (self) => {
                        const v = self.getVelocity() / 260;
                        boost = gsap.utils.clamp(-6, 6, v);
                        gsap.to(loop, { timeScale: (boost < 0 ? -1 : 1) * (1 + Math.abs(boost)), duration: 0.25, overwrite: true });
                        gsap.to(loop, { timeScale: boost < 0 ? -1 : 1, duration: 1.2, delay: 0.25, ease: 'power2.out' });
                    }
                });
            });
        }

        // PROJECTS --------------------------------------------------------------
        if (page === 'projects') {
            $$('.archive-project-card').forEach((card, i) => {
                const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 85%', once: true } });
                const t = $('.archive-project-title', card);
                const s = split(t, 'lines', 'lines');
                tl.from(card, { y: 70, autoAlpha: 0, duration: 1.1, ease: 'expo.out' }, 0)
                  .from(s ? s.lines : t, { yPercent: 105, duration: 1, ease: 'expo.out', stagger: 0.06 }, 0.1)
                  .from($$('.archive-badge-wrap, .archive-project-headline, .archive-summary-text, .archive-quote-snippet, .archive-action-row', card), { y: 20, autoAlpha: 0, stagger: 0.06, duration: 0.8 }, 0.25)
                  .from($$('.tech-pill', card), { y: 10, autoAlpha: 0, stagger: 0.03, duration: 0.4 }, 0.45);
                const fr = $('.archive-img-frame', card);
                if (fr) {
                    tl.fromTo(fr, { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.1);
                    tilt(fr, 3);
                }
                if (i < 3) { card.appendChild(makeCobweb('cobweb-tr small')); drawOnEnter($('.cobweb', card), card); }
            });
        }

        // CASE FILE -------------------------------------------------------------
        if (page === 'case') {
            const fig = $('.case-evidence-frame');
            if (fig) {
                gsap.fromTo(fig, { clipPath: 'inset(8% 8% 8% 8%)', scale: 0.94 }, {
                    clipPath: 'inset(0% 0% 0% 0%)', scale: 1, ease: 'none',
                    scrollTrigger: { trigger: fig, start: 'top 95%', end: 'top 30%', scrub: 0.6 }
                });
            }
            $$('.case-narrative-column > *').forEach((p) => {
                gsap.from(p, { y: 34, autoAlpha: 0, duration: 0.9, scrollTrigger: { trigger: p, start: 'top 88%', once: true } });
            });
            const spec = $('.spec-table-box');
            if (spec) {
                spec.appendChild(makeCobweb('cobweb-tr small'));
                drawOnEnter($('.cobweb', spec), spec);
                gsap.from($$('.spec-table tr', spec), { x: 30, autoAlpha: 0, stagger: 0.05, duration: 0.6, scrollTrigger: { trigger: spec, start: 'top 85%', once: true } });
            }
        }

        // FOOTER (all pages): the big name rises out of the rule
        const ft = $('.footer-masthead-title');
        if (ft) {
            const s = split(ft, 'chars', 'chars');
            gsap.from(s ? s.chars : ft, { yPercent: 100, stagger: 0.03, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: ft, start: 'top 92%', once: true } });
            gsap.from($$('.footer-nav-item'), { y: 16, autoAlpha: 0, stagger: 0.04, duration: 0.6, scrollTrigger: { trigger: '.footer-nav-grid', start: 'top 95%', once: true } });
        }
    }

    // ------------------------------------------------------------------------
    // 5. SPIDER TOUCHES
    // ------------------------------------------------------------------------

    // 5a. Scroll-progress spider: hangs from the top edge, its thread length is
    //     your scroll progress. Click it to zip back to the top.
    let hang = null;
    function buildHangingSpider() {
        if (typeof SpiderArt === 'undefined') return;
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'hang-spider';
        el.setAttribute('aria-label', 'Back to top');
        el.innerHTML = '<span class="hang-thread"></span><canvas class="hang-canvas"></canvas><span class="hang-tip">TOP ↑</span>';
        document.body.appendChild(el);
        const size = window.innerWidth < 768 ? 44 : 74;
        const canvas = $('.hang-canvas', el);
        const art = new SpiderArt(canvas, { size, unit: size / 150, anchorY: 0.04, shadow: false, seed: 5 });
        const thread = $('.hang-thread', el);
        const state = { p: 0, v: 0, idle: 0, raf: 0, sway: 0 };
        const setY = gsap.quickSetter(canvas, 'y', 'px');

        function scrollProgress() {
            const max = document.documentElement.scrollHeight - window.innerHeight;
            return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        }
        function place() {
            const H = window.innerHeight;
            const y = 24 + state.p * (H * 0.62);
            thread.style.transform = `scaleY(${(y / H).toFixed(4)})`;
            setY(y);
        }
        let last = performance.now();
        function loop(now) {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            const target = scrollProgress();
            state.p += (target - state.p) * Math.min(1, dt * 9);
            state.sway += ((-state.v * 0.004) - state.sway) * Math.min(1, dt * 6);
            art.twitch = 1 + Math.min(4, Math.abs(state.v) / 400);
            art.sway = Math.max(-0.35, Math.min(0.35, state.sway));
            art.crouch = Math.min(0.6, Math.abs(state.v) / 3000);
            art.tick(dt);
            art.draw();
            place();
            state.idle += dt;
            state.v *= 0.9;
            if (state.idle < 0.8 || Math.abs(target - state.p) > 0.0005) state.raf = requestAnimationFrame(loop);
            else state.raf = 0;
        }
        function wake(v) {
            state.idle = 0;
            if (v != null) state.v = v;
            if (!state.raf) { last = performance.now(); state.raf = requestAnimationFrame(loop); }
        }
        if (lenis) lenis.on('scroll', (l) => wake(l.velocity * 60));
        else window.addEventListener('scroll', () => wake(0), { passive: true });
        window.addEventListener('resize', () => wake(), { passive: true });
        el.addEventListener('click', () => { MR.scrollTo(0, { offset: 0, duration: 1.6 }); });
        state.p = scrollProgress();
        art.draw();
        place();
        wake();
        hang = { el, canvas, size };
        gsap.from(el, { autoAlpha: 0, duration: 0.8, delay: 0.6 });
    }

    // 5a+. Hero cobweb: a live piece of silk left in the top-left corner after
    //      the intro web tore. Verlet physics — the cursor (or a finger)
    //      plucks it, scrolling blows its loose threads. Sleeps when still.
    function buildHeroCobweb() {
        if (page !== 'home' || typeof Silk === 'undefined') return;
        const mobile = window.innerWidth < 768;
        const CW = mobile ? 150 : 330, CH = mobile ? 132 : 290;
        const canvas = document.createElement('canvas');
        canvas.className = 'hero-cobweb';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = CW * dpr; canvas.height = CH * dpr;
        canvas.style.width = CW + 'px'; canvas.style.height = CH + 'px';
        const ctx = canvas.getContext('2d');
        const k = CW / 330;

        const silk = new Silk({ gravity: 260, damping: 0.982, iterations: 6, pointerRadius: 46 * k + 20 });
        const hub = silk.addPoint(96 * k, 84 * k, false, 1);
        const anchors = [
            [24, 0], [118, 0], [214, 0], [318, 0], [0, 30], [0, 128], [0, 236]
        ].map(([x, y]) => silk.addPoint(x * k, y * k, true));
        // order anchors by angle around the hub so rings connect neighbours
        anchors.sort((a, b) => Math.atan2(a.y - hub.y, a.x - hub.x) - Math.atan2(b.y - hub.y, b.x - hub.x));
        const SEG = 7;
        const spokes = anchors.map((an) => {
            const pts = [hub];
            for (let j = 1; j < SEG; j++) {
                const f = j / SEG;
                pts.push(silk.addPoint(hub.x + (an.x - hub.x) * f, hub.y + (an.y - hub.y) * f, false, 0.4));
            }
            pts.push(an);
            for (let j = 0; j < pts.length - 1; j++) silk.addStick(pts[j], pts[j + 1], 0.985, 'spoke');
            return pts;
        });
        const rings = [];
        for (let a = 0; a < spokes.length - 1; a++) {
            for (let j = 1; j < SEG; j++) {
                rings.push(silk.addStick(spokes[a][j], spokes[a + 1][j], 0.995, 'ring'));
            }
        }
        // two loose threads hanging from the web (they sway)
        const dangles = [[spokes[2][4], 9], [spokes[4][3], 7]].map(([from, n]) => {
            const chain = [from];
            for (let j = 1; j <= n; j++) chain.push(silk.addPoint(from.x, from.y + j * 8 * k, false, 0.3));
            for (let j = 0; j < chain.length - 1; j++) silk.addStick(chain[j], chain[j + 1], 1, 'dangle');
            return chain;
        });
        silk.settle(200);

        let raf = 0, idle = 0, last = performance.now(), alpha = 0;
        function draw() {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, CW, CH);
            ctx.globalAlpha = alpha;
            ctx.lineCap = 'round';
            ctx.strokeStyle = 'rgba(36, 38, 50, 0.6)';
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            silk.sticks.forEach((st) => {
                if (st.kind === 'ring') return;
                ctx.moveTo(st.a.x, st.a.y); ctx.lineTo(st.b.x, st.b.y);
            });
            ctx.stroke();
            ctx.strokeStyle = 'rgba(52, 56, 72, 0.42)';
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            rings.forEach((st) => {
                const mx = (st.a.x + st.b.x) / 2, my = (st.a.y + st.b.y) / 2;
                const sag = 0.12;
                ctx.moveTo(st.a.x, st.a.y);
                ctx.quadraticCurveTo(mx + (hub.x - mx) * sag, my + (hub.y - my) * sag, st.b.x, st.b.y);
            });
            ctx.stroke();
            ctx.globalAlpha = 1;
        }
        function loop(now) {
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            silk.update(dt);
            silk.pointer.vx *= 0.8; silk.pointer.vy *= 0.8;
            dangles.forEach((ch) => ch.forEach((p) => { p.fx *= 0.92; }));
            alpha = Math.min(1, alpha + dt * 1.5);
            draw();
            idle = silk.energy < 0.002 && alpha >= 1 ? idle + dt : 0;
            raf = idle > 0.6 ? 0 : requestAnimationFrame(loop);
        }
        function wake() { if (!raf) { last = performance.now(); idle = 0; raf = requestAnimationFrame(loop); } }

        let lp = null;
        function onMove(e) {
            const r = canvas.getBoundingClientRect();
            if (r.bottom < 0) return;
            const x = e.clientX - r.left, y = e.clientY - r.top;
            const now = performance.now();
            if (lp) {
                const dt = Math.max(8, now - lp.t) / 1000;
                silk.pointer.vx = (x - lp.x) / dt; silk.pointer.vy = (y - lp.y) / dt;
            }
            lp = { x, y, t: now };
            silk.pointer.x = x; silk.pointer.y = y;
            silk.pointer.active = x > -60 && y > -60 && x < CW + 60 && y < CH + 60;
            if (silk.pointer.active) wake();
        }
        window.addEventListener('pointermove', onMove, { passive: true });
        window.addEventListener('pointerdown', onMove, { passive: true });
        window.addEventListener('touchmove', (e) => { const t0 = e.touches[0]; if (t0) onMove(t0); }, { passive: true });
        window.addEventListener('touchend', () => { silk.pointer.active = false; lp = null; }, { passive: true });
        if (lenis) lenis.on('scroll', (l) => {
            if (window.scrollY > CH + 200) return;
            const v = l.velocity;
            dangles.forEach((ch) => ch.forEach((p, i) => { if (i) p.fx = -v * 900; }));
            wake();
        });
        wake();
    }

    // 5b. Web-shot: click anywhere → the hanging spider shoots a silk line to
    //     the point and a small web splats there. Splats stick to the page and
    //     the strand stretches as you scroll. Renders only while visible.
    function buildWebShooter() {
        if (reduce) return;
        const canvas = document.createElement('canvas');
        canvas.className = 'web-shot-layer';
        canvas.setAttribute('aria-hidden', 'true');
        document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let dpr = 1, W = 0, H = 0;
        function resize() {
            dpr = Math.min(window.devicePixelRatio || 1, 1.5);
            W = window.innerWidth; H = window.innerHeight;
            canvas.width = W * dpr; canvas.height = H * dpr;
            canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
        }
        resize();
        window.addEventListener('resize', resize, { passive: true });

        const shots = [];
        let raf = 0;

        function origin() {
            if (hang) {
                const r = hang.canvas.getBoundingClientRect();
                return { x: r.left + r.width / 2, y: r.top + r.height * 0.55 };
            }
            return { x: W - 30, y: 30 };
        }

        function draw(now) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);
            const sy = window.scrollY;
            for (let i = shots.length - 1; i >= 0; i--) {
                const s = shots[i];
                const t = (now - s.t0) / 1000;
                const life = 1.9;
                if (t > life) { shots.splice(i, 1); continue; }
                const fly = Math.min(1, t / 0.14);
                const fade = t > 1.1 ? 1 - (t - 1.1) / (life - 1.1) : 1;
                const o = origin();
                const tx = s.x, ty = s.y - sy;
                const hx = o.x + (tx - o.x) * fly, hy = o.y + (ty - o.y) * fly;
                // strand (sags under its own weight once attached)
                const sag = fly < 1 ? 0 : Math.min(40, Math.hypot(tx - o.x, ty - o.y) * 0.08) * Math.min(1, (t - 0.14) * 3);
                ctx.globalAlpha = 0.75 * fade;
                ctx.strokeStyle = '#3a3d4c';
                ctx.lineWidth = 1.1;
                ctx.beginPath();
                ctx.moveTo(o.x, o.y);
                ctx.quadraticCurveTo((o.x + hx) / 2, (o.y + hy) / 2 + sag, hx, hy);
                ctx.stroke();
                // splat web
                if (fly >= 1) {
                    const g = Math.min(1, (t - 0.14) / 0.22);
                    const e = 1 - Math.pow(1 - g, 3);
                    const R = s.r * e;
                    ctx.globalAlpha = 0.85 * fade;
                    ctx.strokeStyle = '#2b2d38';
                    ctx.lineWidth = 0.9;
                    ctx.beginPath();
                    for (let k = 0; k < s.spokes.length; k++) {
                        const a = s.spokes[k];
                        ctx.moveTo(tx, ty);
                        ctx.lineTo(tx + Math.cos(a) * R * s.len[k], ty + Math.sin(a) * R * s.len[k]);
                    }
                    ctx.stroke();
                    ctx.lineWidth = 0.7;
                    [0.35, 0.62, 0.88].forEach((f) => {
                        ctx.beginPath();
                        for (let k = 0; k <= s.spokes.length; k++) {
                            const kk = k % s.spokes.length;
                            const a = s.spokes[kk];
                            const rr = R * f * Math.min(1, s.len[kk]);
                            const x = tx + Math.cos(a) * rr, y = ty + Math.sin(a) * rr;
                            if (k === 0) ctx.moveTo(x, y);
                            else {
                                const pa = s.spokes[(k - 1) % s.spokes.length];
                                const ma = (pa + a + (kk === 0 ? Math.PI * 2 : 0)) / 2;
                                ctx.quadraticCurveTo(tx + Math.cos(ma) * rr * 0.82, ty + Math.sin(ma) * rr * 0.82, x, y);
                            }
                        }
                        ctx.stroke();
                    });
                    ctx.fillStyle = '#d9204c';
                    ctx.globalAlpha = 0.9 * fade;
                    ctx.beginPath();
                    ctx.arc(tx, ty, 2 * e, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1;
            raf = shots.length ? requestAnimationFrame(draw) : 0;
            if (!raf) ctx.clearRect(0, 0, W, H);
        }

        // mouse: shoot on press · touch: shoot on a clean tap (not a scroll)
        let tap = null;
        document.addEventListener('pointerdown', (e) => {
            if (e.pointerType === 'touch') { tap = { x: e.clientX, y: e.clientY, t: performance.now() }; return; }
            shoot(e);
        });
        document.addEventListener('pointerup', (e) => {
            if (e.pointerType !== 'touch' || !tap) return;
            const moved = Math.hypot(e.clientX - tap.x, e.clientY - tap.y);
            if (moved < 10 && performance.now() - tap.t < 350) shoot(e);
            tap = null;
        });
        document.addEventListener('pointercancel', () => { tap = null; });
        function shoot(e) {
            if (e.button !== 0 && e.pointerType !== 'touch') return;
            if (e.target.closest('input, textarea, select, label, .hang-spider, #case-modal, .spider-intro, .mnav, .mnav-toggle, .exhibits-three-col-grid')) return;
            if (shots.length > 5) shots.shift();
            const n = 9 + ((Math.random() * 3) | 0);
            const spokes = [], len = [];
            for (let i = 0; i < n; i++) { spokes.push((i / n) * Math.PI * 2 + Math.random() * 0.35); len.push(0.7 + Math.random() * 0.45); }
            shots.push({ x: e.clientX, y: e.clientY + window.scrollY, t0: performance.now(), r: 26 + Math.random() * 12, spokes, len });
            if (hang) gsap.fromTo(hang.canvas, { rotation: -8 }, { rotation: 0, duration: 0.5, ease: 'elastic.out(1, 0.4)' });
            if (!raf) raf = requestAnimationFrame(draw);
        }
        const redraw = () => { if (shots.length && !raf) raf = requestAnimationFrame(draw); };
        if (lenis) lenis.on('scroll', redraw);
        window.addEventListener('scroll', redraw, { passive: true });
    }

    // ------------------------------------------------------------------------
    // 6. BOOT
    // ------------------------------------------------------------------------
    function start(holdHero) {
        if (reduce) {
            gsap.set('[data-hero]', { autoAlpha: 1 });
            return null;
        }
        const hero = heroIn();
        if (holdHero) hero.pause();
        buildScroll();
        buildHangingSpider();
        buildHeroCobweb();
        buildWebShooter();
        return hero;
    }

    // Wait for web fonts (max 900ms) so text splits on the final line breaks
    const fontsReady = Promise.race([
        document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve(),
        new Promise((r) => setTimeout(r, 900))
    ]);

    if (introPlaying) {
        // Build everything behind the intro and only hold the hero entrance
        // until the web tears.
        let revealed = false;
        let hero = null;
        window.addEventListener('mr:intro-reveal', () => {
            revealed = true;
            if (lenis) lenis.start();
            if (hero) hero.play();
        }, { once: true });
        window.addEventListener('mr:intro-complete', () => ScrollTrigger.refresh(), { once: true });
        fontsReady.then(() => {
            hero = start(true);
            if (hero && revealed) hero.play();
            MR.ready = true;
            window.dispatchEvent(new CustomEvent('mr:motion-ready'));
        });
    } else {
        fontsReady.then(() => start(false));
    }
})();
