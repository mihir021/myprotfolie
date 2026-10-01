/**
 * ============================================================================
 * PAGE-TRANSITION.JS — "Press Run" page transitions + instant prefetch
 * ============================================================================
 * Leaving:  five newspaper columns drop in one after another, a spider
 *           abseils to the centre of a fresh web and the next page's name is
 *           set in type ("Now turning to · The Complete Archive").
 * Arriving: the cover is already in place at first paint (an inline <head>
 *           script adds html.is-arriving + the label); the spider climbs out
 *           and the columns lift away from the centre outward.
 * Pure CSS transforms → smooth even while the next page is still parsing.
 * Works with Back/Forward (bfcache) and degrades to a plain navigation
 * under prefers-reduced-motion.
 */
(function () {
    'use strict';

    const root = document.documentElement;
    const curtain = document.getElementById('web-curtain');
    const NAV_KEY = 'mr_nav';
    const LABEL_KEY = 'mr_nav_label';
    const LEAVE_MS = 720;
    let leaving = false;

    // Static web behind the spider (drawn once)
    if (curtain) {
        const g = curtain.querySelector('.wc-web-g');
        if (g) {
            let d = '';
            const N = 14;
            const ang = [];
            for (let i = 0; i < N; i++) ang.push((i / N) * Math.PI * 2 + Math.sin(i * 7.3) * 0.08);
            ang.forEach((a) => { d += `M0 0L${(Math.cos(a) * 104).toFixed(1)} ${(Math.sin(a) * 104).toFixed(1)}`; });
            let rings = '';
            for (let r = 14; r < 100; r += 11 + r * 0.06) {
                let p = '';
                ang.concat([ang[0] + Math.PI * 2]).forEach((a, i) => {
                    const x = Math.cos(a) * r, y = Math.sin(a) * r;
                    if (i === 0) p += `M${x.toFixed(1)} ${y.toFixed(1)}`;
                    else {
                        const m = (a + ang[(i - 1) % N] + (i === N ? 0 : 0)) / 2;
                        const mm = i === N ? (ang[N - 1] + a) / 2 : m;
                        p += `Q${(Math.cos(mm) * r * 0.9).toFixed(1)} ${(Math.sin(mm) * r * 0.9).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
                    }
                });
                rings += p;
            }
            g.innerHTML = `<path class="wc-spokes" d="${d}"/><path class="wc-rings" d="${rings}"/>`;
        }
        const c = curtain.querySelector('.curtain-spider');
        if (c && typeof SpiderArt !== 'undefined') {
            const size = window.innerWidth < 768 ? 96 : 120;
            const art = new SpiderArt(c, { size, unit: size / 150, anchorY: 0.04, shadow: false, seed: 3, thread: false });
            art.crouch = 0.15;
            art.draw();
        }
    }

    // Arrival: lift the cover
    function arrive() {
        if (!root.classList.contains('is-arriving')) return;
        requestAnimationFrame(() => requestAnimationFrame(() => {
            root.classList.add('is-arrived');
            setTimeout(() => {
                root.classList.remove('is-arriving', 'is-arrived');
                root.style.removeProperty('--nav-label');
            }, 1300);
        }));
    }
    arrive();

    // bfcache restore (Back/Forward): never show a stuck cover
    window.addEventListener('pageshow', (e) => {
        if (e.persisted) {
            leaving = false;
            root.classList.remove('is-leaving', 'is-arriving', 'is-arrived');
        }
    });

    function isInternalPage(a) {
        if (!a || !a.href) return false;
        if (a.target && a.target !== '_self') return false;
        if (a.hasAttribute('download')) return false;
        let url;
        try { url = new URL(a.href, location.href); } catch (e) { return false; }
        if (url.origin !== location.origin) return false;
        if (!/\.html$|\/$/.test(url.pathname)) return false;
        if (url.pathname === location.pathname && url.search === location.search) return false;
        return true;
    }

    // Human name for the destination, set as type on the cover
    function labelFor(url, a) {
        const u = new URL(url, location.href);
        const path = u.pathname;
        if (/projects\.html$/.test(path)) return 'The Complete Archive';
        if (/case-file\.html$/.test(path)) {
            const id = u.searchParams.get('id');
            const data = (window.ALL_CASE_FILES || []).find((c) => c.id === id);
            if (data) return data.title.split(' — ')[0];
            const card = a && a.closest('article');
            const t = card && card.querySelector('h3, h4, h5');
            return t ? t.textContent.trim() : 'Case File';
        }
        if (u.hash && u.hash.length > 1) {
            const sec = { '#work': 'The Exhibits', '#stack': 'The Systems Desk', '#dossier': 'The Dispatches', '#credentials': 'The Credentials', '#contact': 'The Contact Desk' }[u.hash];
            if (sec) return sec;
        }
        return 'The Front Page';
    }

    function navigate(url, a, opts = {}) {
        if (leaving) return;
        leaving = true;
        const label = opts.label || labelFor(url, a);
        try {
            sessionStorage.setItem(NAV_KEY, '1');
            sessionStorage.setItem(LABEL_KEY, label);
        } catch (e) { /* ignore */ }
        if (!curtain || matchMedia('(prefers-reduced-motion: reduce)').matches) {
            if (opts.back) history.back(); else location.href = url;
            return;
        }
        root.style.setProperty('--nav-label', JSON.stringify(label));
        root.classList.remove('is-arriving', 'is-arrived');
        // force style flush so the transition starts from the hidden state
        void curtain.offsetWidth;
        root.classList.add('is-leaving');
        setTimeout(() => { if (opts.back) history.back(); else location.href = url; }, LEAVE_MS);
    }
    window.MRNavigate = navigate;

    document.addEventListener('click', (e) => {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        const a = e.target.closest('a[href]');
        if (!isInternalPage(a)) return;
        e.preventDefault();
        navigate(a.href, a);
    });

    // Prefetch internal pages on intent (hover / touch) → near-instant loads
    const prefetched = new Set();
    function prefetch(e) {
        const a = e.target.closest && e.target.closest('a[href]');
        if (!isInternalPage(a)) return;
        const url = new URL(a.href, location.href);
        const key = url.pathname + url.search;
        if (prefetched.has(key)) return;
        prefetched.add(key);
        const l = document.createElement('link');
        l.rel = 'prefetch';
        l.href = key;
        document.head.appendChild(l);
    }
    document.addEventListener('pointerover', prefetch, { passive: true });
    document.addEventListener('touchstart', prefetch, { passive: true });
})();
