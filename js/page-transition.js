/**
 * ============================================================================
 * PAGE-TRANSITION.JS - SPIDER SPLIT-WALL GATE TRANSITION ENGINE
 * ============================================================================
 * Coordinates the authentic Spider Split-Wall Gate across all pages:
 * 1. Continuous dual-canvas rendering of ASCII matrix + Procedural Spider at 60 FPS.
 * 2. Closes dual split doors (with left & right spider halves) on internal link clicks.
 * 3. On page entry: Pulses laser seam cutter, unlatches, and splits the spider doors wide open.
 */

(function () {
    'use strict';

    let gridLeft = null;
    let gridRight = null;
    let spider = null;
    let animFrameId = null;
    let lastTime = performance.now();

    function initSpiderGate() {
        const gateContainer = document.getElementById('gate-container');
        const canvasLeft = document.getElementById('canvas-left');
        const canvasRight = document.getElementById('canvas-right');
        const mainContent = document.querySelector('.main-content');

        if (!gateContainer || !canvasLeft || !canvasRight) return;

        const isIndex = window.location.pathname.endsWith('index.html') || window.location.pathname === '/' || window.location.pathname === '';

        // If not on index.html (where main.js handles the render loop), initialize own render loop
        if (!isIndex && typeof AsciiGrid === 'function' && typeof ProceduralSpider === 'function') {
            gridLeft = new AsciiGrid(canvasLeft);
            gridRight = new AsciiGrid(canvasRight);
            spider = new ProceduralSpider();
            window.globalSpiderInstance = spider;

            // Lock spider at center for transition stance
            spider.state = 'locked';
            spider.x = window.innerWidth / 2;
            spider.y = window.innerHeight * 0.50;
            spider.scale = spider.expandedScale || 1.65;
            spider.gaugeAlpha = 0;
            spider.swingAngle = 0;

            // Continuous 60 FPS Dual-Canvas Render Loop
            function transitionRenderLoop(now) {
                const dt = Math.min(0.05, (now - lastTime) / 1000);
                lastTime = now;

                spider.x = window.innerWidth / 2;
                spider.y = window.innerHeight * 0.50;
                spider.update(dt);

                // Render Left Door Canvas (Clipped to Left 50%)
                gridLeft.clear();
                gridLeft.updateBackground(dt);
                gridLeft.render();
                spider.render(gridLeft.ctx);

                // Render Right Door Canvas (Clipped to Right 50%)
                gridRight.clear();
                gridRight.updateBackground(dt);
                gridRight.render();
                spider.render(gridRight.ctx);

                animFrameId = requestAnimationFrame(transitionRenderLoop);
            }

            animFrameId = requestAnimationFrame(transitionRenderLoop);

            // Handle Resize
            window.addEventListener('resize', () => {
                if (gridLeft) gridLeft.resize();
                if (gridRight) gridRight.resize();
                if (spider) {
                    spider.x = window.innerWidth / 2;
                    spider.y = window.innerHeight * 0.50;
                }
            });
        }

        // Helper: Smoothly and reliably open spider gate doors
        function openSpiderDoors(initialDelay = 200) {
            if (!gateContainer) return;

            // Start closed at center with seam laser pulse
            gateContainer.classList.remove('open-doors', 'unlatched');
            gateContainer.classList.add('pulse-seam');

            // Trigger mechanical unlatch snap
            setTimeout(() => {
                gateContainer.classList.add('unlatched');

                // Glide doors wide open to left & right
                setTimeout(() => {
                    gateContainer.classList.add('open-doors');
                    if (mainContent) {
                        mainContent.classList.remove('hidden');
                        mainContent.setAttribute('aria-hidden', 'false');
                    }
                    const loaderOverlay = document.getElementById('loader-overlay');
                    if (loaderOverlay) {
                        loaderOverlay.classList.add('fade-out');
                        loaderOverlay.setAttribute('aria-hidden', 'true');
                    }
                }, 120);
            }, initialDelay);
        }

        // Check navigation state and history return
        const isNavigating = sessionStorage.getItem('spider_gate_navigating') === 'true';
        const hasSeenIntro = sessionStorage.getItem('spider_portfolio_seen') === 'true';

        sessionStorage.removeItem('spider_gate_navigating');

        // If on non-index page, or returning to index after having seen intro
        if (!isIndex || isNavigating || hasSeenIntro) {
            openSpiderDoors(220);
        }

        // Handle browser Back/Forward navigation (bfcache restoration)
        window.addEventListener('pageshow', function (event) {
            const seen = sessionStorage.getItem('spider_portfolio_seen') === 'true';
            if (!isIndex || seen || event.persisted) {
                openSpiderDoors(150);
            }
        });

        // Fail-safe Watchdog: Never allow doors to remain stuck in middle
        setTimeout(() => {
            if (gateContainer && !gateContainer.classList.contains('open-doors')) {
                const seen = sessionStorage.getItem('spider_portfolio_seen') === 'true';
                if (!isIndex || seen) {
                    gateContainer.classList.add('open-doors');
                    if (mainContent) mainContent.classList.remove('hidden');
                }
            }
        }, 900);

        // Attach transition listeners to all internal links
        document.querySelectorAll('a[href]').forEach(link => {
            const href = link.getAttribute('href');
            if (!href) return;

            // Skip external links, target="_blank", anchors (#section on same page), mailto/tel
            if (
                link.hasAttribute('target') ||
                href.startsWith('http://') ||
                href.startsWith('https://') ||
                href.startsWith('mailto:') ||
                href.startsWith('tel:') ||
                (href.startsWith('#') && !href.includes('.html'))
            ) {
                return;
            }

            // Check if it's an internal HTML page link
            const isInternalPage = (
                href.includes('.html') ||
                href === 'index.html' ||
                href === 'projects.html' ||
                href.startsWith('case-file.html') ||
                href.startsWith('projects.html') ||
                href.startsWith('index.html')
            );

            if (isInternalPage) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetUrl = link.href;

                    // Ensure spider is locked at center before closing
                    if (window.globalSpiderInstance) {
                        window.globalSpiderInstance.state = 'locked';
                        window.globalSpiderInstance.x = window.innerWidth / 2;
                        window.globalSpiderInstance.y = window.innerHeight * 0.50;
                        window.globalSpiderInstance.scale = window.globalSpiderInstance.expandedScale || 1.65;
                        window.globalSpiderInstance.gaugeAlpha = 0;
                        window.globalSpiderInstance.swingAngle = 0;
                    }

                    // Close the Spider Split-Wall Doors (Slide from edges back to center)
                    gateContainer.classList.remove('open-doors', 'unlatched');
                    gateContainer.classList.add('pulse-seam');
                    sessionStorage.setItem('spider_gate_navigating', 'true');
                    sessionStorage.setItem('spider_portfolio_seen', 'true');

                    // Navigate after doors meet in center (650ms)
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 650);
                });
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSpiderGate);
    } else {
        initSpiderGate();
    }
})();
