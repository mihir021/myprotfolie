/**
 * ============================================================================
 * MOBILE-NAV.JS — phone "INDEX" menu + swipe-card indicator
 * ============================================================================
 * Builds a full-screen newspaper index from the existing nav links, so the
 * links stay in one place (the HTML) and the phone layout never squeezes a
 * row of chips. Section numbers match the section banners (I–V).
 */
(function () {
    'use strict';

    const root = document.documentElement;
    const nav = document.querySelector('.newspaper-nav');
    const links = nav ? Array.from(nav.querySelectorAll('.nav-links a')) : [];

    if (nav && links.length) {
        const NUM = { '#work': 'I', '#stack': 'II', '#dossier': 'III', '#credentials': 'IV', '#contact': 'V' };
        const items = [];
        const seen = new Set();
        links.forEach((a) => {
            const href = a.getAttribute('href');
            if (seen.has(href) && a.classList.contains('news-btn-hire')) return;
            if (a.classList.contains('news-btn-hire')) return;
            seen.add(href);
            const hash = href.includes('#') ? '#' + href.split('#')[1] : '';
            const label = a.textContent.trim().toLowerCase().replace(/^./, (c) => c.toUpperCase());
            items.push({ href, label, num: NUM[hash] || '' });
        });
        const onHome = !!document.getElementById('work');
        if (onHome) items.push({ href: 'projects.html', label: 'All archives', num: '↗' });
        else items.unshift({ href: 'index.html', label: 'Front page', num: '←' });

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mnav-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'mnav');
        btn.innerHTML = '<i aria-hidden="true"></i>INDEX';
        nav.appendChild(btn);

        const menu = document.createElement('div');
        menu.id = 'mnav';
        menu.className = 'mnav';
        menu.setAttribute('role', 'dialog');
        menu.setAttribute('aria-modal', 'true');
        menu.setAttribute('aria-label', 'Site index');
        menu.innerHTML =
            '<span class="mnav-spider" aria-hidden="true"></span>' +
            '<div class="mnav-head"><span>THE INDEX · TODAY\'S EDITION</span><button type="button" class="mnav-close">CLOSE ✕</button></div>' +
            '<ul class="mnav-list">' + items.map((it, i) =>
                `<li><a href="${it.href}" style="--i:${i}"><span>${it.num}</span>${it.label}</a></li>`).join('') + '</ul>' +
            '<div class="mnav-foot"><a href="' + (onHome ? '#contact' : 'index.html#contact') + '" class="btn-newspaper-primary">HIRE HIM →</a>' +
            '<span>rathodmihir1113@gmail.com · Ahmedabad, India</span></div>';
        document.body.appendChild(menu);
        root.classList.add('has-mnav');

        const lenis = () => (window.MR && window.MR.lenis) || null;
        function open() {
            menu.classList.add('is-open');
            root.classList.add('mnav-open');
            btn.setAttribute('aria-expanded', 'true');
            if (lenis()) lenis().stop();
            setTimeout(() => menu.querySelector('.mnav-close').focus({ preventScroll: true }), 50);
        }
        function close() {
            menu.classList.remove('is-open');
            root.classList.remove('mnav-open');
            btn.setAttribute('aria-expanded', 'false');
            if (lenis()) lenis().start();
        }
        btn.addEventListener('click', open);
        menu.querySelector('.mnav-close').addEventListener('click', () => { close(); btn.focus({ preventScroll: true }); });
        menu.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
        window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('is-open')) close(); });
        window.matchMedia('(min-width: 769px)').addEventListener('change', (m) => { if (m.matches) close(); });
    }

    // Swipe indicator for the exhibit cards on phones
    const deck = document.querySelector('.exhibits-three-col-grid');
    if (deck) {
        const cards = Array.from(deck.children);
        const hint = document.createElement('div');
        hint.className = 'swipe-hint';
        hint.setAttribute('aria-hidden', 'true');
        hint.innerHTML = '<span>SWIPE FOR MORE EXHIBITS →</span><span class="swipe-dots">' + cards.map(() => '<b></b>').join('') + '</span>';
        deck.parentNode.insertBefore(hint, deck);
        const dots = Array.from(hint.querySelectorAll('b'));
        const update = () => {
            const mid = deck.scrollLeft + deck.clientWidth / 2;
            let best = 0, bestD = Infinity;
            cards.forEach((c, i) => {
                const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
                if (d < bestD) { bestD = d; best = i; }
            });
            dots.forEach((d, i) => d.classList.toggle('is-on', i === best));
        };
        deck.addEventListener('scroll', update, { passive: true });
        update();
        const mq = window.matchMedia('(max-width: 768px)');
        const show = () => { hint.style.display = mq.matches ? '' : 'none'; };
        mq.addEventListener('change', show);
        show();
    }
})();
