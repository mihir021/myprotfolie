/**
 * ============================================================================
 * MAIN.JS - PAGE CONTENT CONTROLLER
 * ============================================================================
 * Dateline, GSSoC rank sync, case dossier modal and the contact form.
 */

(function () {
    'use strict';

    // --------------------------------------------------------------------------
    // 1. INITIALIZATION
    // --------------------------------------------------------------------------
    // The intro (js/intro.js), smooth scrolling + scroll effects (js/motion.js)
    // and page transitions (js/page-transition.js) live in their own modules.
    // This file only wires up the page content itself.
    function init() {
        updateDatelineDate();
        syncGssocRank();
        initContactDispatchForm();
    }

    // --------------------------------------------------------------------------
    // 5. INTERACTIVE CASE FILE DOSSIER MODAL CONTROLLER (Robert Tran Style)
    // --------------------------------------------------------------------------
    const CASE_DOSSIERS = {
        dinexa: {
            flag: "CASE FILE — EXHIBIT A · DINEXA.IN",
            title: "Your restaurant, fully alive online",
            lead: "An all-in-one platform engineered for restaurant owners: launch custom branded websites, showcase interactive 3D menus, and manage multi-branch table reservations from a single unified dashboard.",
            img: "assets/images/dinexa_sketch.webp",
            caption: "Fig. 1 — The Dinexa digital restaurant platform — website builder, 3D menu, and table reservations in production.",
            quote: "“Built an all-in-one platform allowing restaurant owners to deploy custom websites, interactive 3D menus, and live reservations with zero middlemen.”",
            narrative: `
                <p class="editorial-paragraph"><span class="drop-cap">M</span>ost restaurant owners struggle with fragmented digital tools—juggling expensive delivery platforms that take steep commissions, outdated paper menus or static PDF scans, and disconnected reservation apps that keep customer data locked away.</p>
                <p class="editorial-paragraph">Dinexa solves this by providing a unified multi-tenant platform where restaurants can launch their own custom-branded digital storefront in minutes. Guests enjoy an interactive 3D menu book and direct table booking, while owners manage menus, floor reservations, and customer relationships directly without third-party fees.</p>
                <blockquote class="modal-pull-quote">“Built an all-in-one platform allowing restaurant owners to deploy custom websites, interactive 3D menus, and live reservations with zero middlemen.”</blockquote>
                <p class="editorial-paragraph">Designed for both single-location cafes and multi-branch restaurant brands, the platform provides a centralized management dashboard to track table occupancy, update dishes in real-time across branches, and analyze customer dining trends from one place.</p>
            `,
            specs: {
                frontend: "React · Framer Motion · 3D Menu Book · Tailwind",
                backend: "Node.js · Express · MongoDB · JWT Auth",
                cache: "Multi-Restaurant Management Architecture",
                devops: "Docker · GitHub Actions CI/CD · Vercel",
                role: "Lead Architect & Full-Stack Engineer",
                status: "Live in Production (Private Proprietary)"
            },
            liveUrl: "https://dinexa.in"
        },
        landledger: {
            flag: "CASE FILE — EXHIBIT B · LANDLEDGER.ONLINE",
            title: "Securing property deeds on Arbitrum Stylus",
            lead: "A decentralized land registry protocol engineered to cut out manual bureaucracy and deed fraud via Rust smart contracts. Awarded Rank #4 statewide.",
            img: "assets/images/landledger_sketch.webp",
            caption: "Fig. 2 — The LandLedger on-chain escrow architecture and 3D LEGO property exploration interface.",
            quote: "“Wrote and deployed the escrow smart contract in Rust on Arbitrum Stylus, enforcing atomic deed transfers with 4-role verification.”",
            narrative: `
                <p class="editorial-paragraph"><span class="drop-cap">T</span>he paper deed system is vulnerable to fraud and bureaucratic delays. LandLedger replaces it with immutable code on Arbitrum Stylus. Property ownership is transferred through an on-chain escrow smart contract where funds release only after a verified government officer approves the digital deed.</p>
                <p class="editorial-paragraph">The frontend features an immersive LEGO-brick-inspired 3D visualization built with React Three Fiber, letting buyers explore parcel boundaries and zoning credentials in real-time. Wagmi and RainbowKit provide seamless Web3 wallet authentication.</p>
                <blockquote class="modal-pull-quote">“Wrote and deployed the escrow smart contract in Rust on Arbitrum Stylus, enforcing atomic deed transfers with 4-role verification.”</blockquote>
                <p class="editorial-paragraph">To resolve pending confirmation race conditions under serverless execution constraints, the backend implemented a sync-on-read pattern with Viem receipt verification, keeping off-chain MongoDB records in lockstep with the blockchain state.</p>
            `,
            specs: {
                frontend: "React Three Fiber (3D) · GSAP · Tailwind",
                backend: "Rust Smart Contract (Arbitrum Stylus) · Node.js",
                cache: "Viem On-Chain Receipt Sync",
                devops: "Docker · Arbitrum Sepolia · Cloudinary",
                role: "Lead Smart Contract & Backend Engineer",
                status: "Live Protocol (Rank #4 State Hackathon)"
            },
            liveUrl: "https://landledger.online"
        },
        formbuddy: {
            flag: "CASE FILE — EXHIBIT C · FORMBUDDY.IN",
            title: "Zero-friction point-of-sale customer review intelligence",
            lead: "An all-in-one customer review collection SaaS: generate custom branded QR code stand funnels, capture on-premise customer sentiment, and alert managers in real-time.",
            img: "assets/images/formbuddy_sketch.webp",
            caption: "Fig. 3 — The FormBuddy customer review dashboard with QR scan triggers and rating intelligence.",
            quote: "“Built zero-friction QR feedback funnels that capture on-premise customer sentiment and alert managers before negative reviews go public.”",
            narrative: `
                <p class="editorial-paragraph"><span class="drop-cap">C</span>apturing customer feedback at the point of sale is notoriously difficult. Most customers ignore follow-up emails and abandon clunky survey forms that demand app downloads or account logins, leaving negative experiences unresolved until they turn into public 1-star ratings.</p>
                <p class="editorial-paragraph">FormBuddy solves this by generating instant on-table QR code stand funnels that take customers straight to a high-converting, lightweight 1-tap review screen. Customers leave feedback in under 15 seconds without installing anything or creating accounts.</p>
                <blockquote class="modal-pull-quote">“Built zero-friction QR feedback funnels that capture on-premise customer sentiment and alert managers before negative reviews go public.”</blockquote>
                <p class="editorial-paragraph">For business owners, FormBuddy provides a multi-tenant management dashboard with sentiment distribution charts, employee performance benchmarks, and automated real-time alerts that notify managers immediately when a negative review is submitted so issues can be resolved on the spot.</p>
            `,
            specs: {
                frontend: "React · Comic Pop-Art Design System · Dynamic Forms",
                backend: "Node.js · Express · MongoDB · Role-Based JWT Auth",
                cache: "Multi-Tenant Analytics Pipeline",
                devops: "Docker · GitHub Actions CI/CD · Vercel",
                role: "Solo Creator & Full-Stack Engineer",
                status: "Live in Production (Private Proprietary)"
            },
            liveUrl: "https://formbuddy.in"
        },
        leetcode: {
            flag: "CASE FILE — EXHIBIT D · CHROME WEB STORE",
            title: "Instant problem extraction & paste-ready local IDE test stubs",
            lead: "A developer productivity Chrome Extension that extracts any LeetCode problem by number into clean paste-ready code stubs with prefilled test runners, ASCII elevation charts, and OCR matrix grids.",
            img: "assets/images/leetcode_sketch.webp",
            caption: "Fig. 4 — The LCE Chrome Extension interface with #42 Trapping Rain Water ASCII elevation mapping.",
            quote: "“Engineered language-aware comment formatting with runnable test harnesses and deterministic ASCII elevation charts for seamless local IDE problem solving.”",
            narrative: `
                <p class="editorial-paragraph"><span class="drop-cap">C</span>ontext switching between the browser and local code editors (IntelliJ, VS Code, CLion) breaks algorithmic focus. Developers lose valuable practice time manually copying problem prompts, formatting comment headers, and setting up local test cases.</p>
                <p class="editorial-paragraph">LCE solves this with a lightweight Manifest V3 Chrome Extension and high-throughput Java 21 Spring Boot engine. Typing a problem number instantly generates clean, language-aware code stubs for Java, Python, C++, and Go with prefilled runnable <code>main()</code> test cases for instant local execution.</p>
                <blockquote class="modal-pull-quote">“Engineered language-aware comment formatting with runnable test harnesses and deterministic ASCII elevation charts for seamless local IDE problem solving.”</blockquote>
                <p class="editorial-paragraph">For visual challenges, LCE features a deterministic ASCII engine that converts histogram and elevation images (such as #42 Trapping Rain Water) into 1:1 aligned terminal art, while OCR matrix normalization reconstructs 2D grid problems directly into code.</p>
            `,
            specs: {
                frontend: "Chrome Extension Manifest V3 · JavaScript · Clipboard Integration",
                backend: "Java 21 · Spring Boot · JSoup · Tess4J OCR · Docker",
                cache: "Chrome Local Storage Cache + Sub-50ms Parsing",
                devops: "Docker Compose · Maven · Cloud Service Deployment",
                role: "Solo Creator & Backend Architect",
                status: "Live on Chrome Web Store (Private Backend)"
            },
            liveUrl: "https://chromewebstore.google.com/detail/lce-%E2%80%94-leetcode-extractor/ghlocdnmgakhaaamfliabdocehkaaipj?authuser=0&hl=en-GB"
        }
    };

    /**
     * Open detailed case file modal
     */
    window.openCaseDossier = function (caseKey) {
        const dossier = CASE_DOSSIERS[caseKey];
        if (!dossier) return;

        const modal = document.getElementById('case-modal');
        if (!modal) return;

        document.getElementById('modal-case-flag').textContent = dossier.flag;
        document.getElementById('modal-case-title').textContent = dossier.title;
        document.getElementById('modal-case-lead').textContent = dossier.lead;
        document.getElementById('modal-case-img').src = dossier.img.replace(/\.jpg$/, '.webp');
        document.getElementById('modal-case-caption').innerHTML = `<strong>Fig. 1</strong> — ${dossier.caption}`;
        document.getElementById('modal-case-narrative').innerHTML = dossier.narrative;
        
        document.getElementById('modal-spec-frontend').textContent = dossier.specs.frontend;
        document.getElementById('modal-spec-backend').textContent = dossier.specs.backend;
        document.getElementById('modal-spec-cache').textContent = dossier.specs.cache;
        document.getElementById('modal-spec-devops').textContent = dossier.specs.devops;
        document.getElementById('modal-spec-role').textContent = dossier.specs.role;
        document.getElementById('modal-spec-status').textContent = dossier.specs.status;

        const liveLink = document.getElementById('modal-live-link');
        liveLink.href = dossier.liveUrl;

        modal.classList.remove('hidden');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    };

    /**
     * Close detailed case file modal
     */
    window.closeCaseDossier = function () {
        const modal = document.getElementById('case-modal');
        if (!modal) return;
        modal.classList.add('hidden');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    };

    // Close modal on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('case-modal');
            if (modal && !modal.classList.contains('hidden')) {
                window.closeCaseDossier();
            }
        }
    });

    // --------------------------------------------------------------------------
    // 6. DYNAMIC DATELINE & GSSOC RANK SYNCHRONIZATION ENGINE
    // --------------------------------------------------------------------------
    
    /**
     * Dynamically format today's live date into broadsheet masthead dateline
     * Example: "WEDNESDAY 26 AUGUST 2026"
     */
    function updateDatelineDate() {
        const datelineDateEl = document.getElementById('dateline-date');
        if (!datelineDateEl) return;

        const now = new Date();
        const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const months = [
            'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
            'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
        ];

        const dayName = days[now.getDay()];
        const dateNum = now.getDate();
        const monthName = months[now.getMonth()];
        const year = now.getFullYear();

        datelineDateEl.textContent = `${dayName} ${dateNum} ${monthName} ${year}`;
    }

    /**
     * GSSoC Scraping & Sync Configuration
     * Auto-syncs rank from https://gssoc.girlscript.org/profile/4090fbca-a249-46cd-b415-282b08083f43
     * Caches in localStorage for 2 days. 100% resilient with zero production errors if offline.
     */
    const GSSOC_CONFIG = {
        apiUrl: 'https://gssoc.girlscript.org/api/profile/4090fbca-a249-46cd-b415-282b08083f43',
        cacheKey: 'gssoc_rank_cache_v2',
        cacheDurationMs: 2 * 24 * 60 * 60 * 1000, // 2-Day cache interval (172,800,000 ms)
        fallback: {
            rank: 372,
            totalParticipants: 47951,
            score: 10777,
            mergedPrCount: 72
        }
    };

    /**
     * Apply GSSoC metrics across all sections on the page
     */
    function applyGssocData(data) {
        if (!data || typeof data !== 'object') return;

        try {
            const rank = Number(data.rank) || GSSOC_CONFIG.fallback.rank;
            const total = Number(data.totalParticipants) || GSSOC_CONFIG.fallback.totalParticipants;
            const score = Number(data.score) || GSSOC_CONFIG.fallback.score;
            const prs = Number(data.mergedPrCount) || GSSOC_CONFIG.fallback.mergedPrCount;

            const formattedTotal = total.toLocaleString('en-US');
            const formattedScore = score.toLocaleString('en-US');

            // 1. Dateline Strip
            const datelineEl = document.getElementById('dateline-gssoc');
            if (datelineEl) {
                datelineEl.textContent = `GSSOC TOP 1% (#${rank}/${formattedTotal})`;
            }

            // 2. Front Page Hero Bullet
            const heroEl = document.getElementById('hero-gssoc-text');
            if (heroEl) {
                heroEl.textContent = `Rank #${rank} / ${formattedTotal} in GSSoC 2026 (${formattedScore} pts)`;
            }

            // 3. Technical Systems Grid (Pillar 4)
            const stackEl = document.getElementById('stack-gssoc-text');
            if (stackEl) {
                stackEl.textContent = `Global Rank #${rank} / ${formattedTotal} (Top 1%) with ${formattedScore} contribution points & ${prs} merged PRs.`;
            }
        } catch (e) {
            // Silently ignore formatting errors
        }
    }

    /**
     * Check 2-day cache and fetch latest GSSoC rank in background
     */
    async function syncGssocRank() {
        let cached = null;
        try {
            const stored = localStorage.getItem(GSSOC_CONFIG.cacheKey);
            if (stored) {
                cached = JSON.parse(stored);
            }
        } catch (storageErr) {
            // Handle restricted localStorage gracefully
        }

        const now = Date.now();

        // If cache exists and is within 2-day interval, apply immediately and skip network
        if (cached && cached.timestamp && (now - cached.timestamp < GSSOC_CONFIG.cacheDurationMs) && cached.data) {
            applyGssocData(cached.data);
            return;
        }

        // Apply fallback or existing cached data immediately so UI is always instant
        if (cached && cached.data) {
            applyGssocData(cached.data);
        } else {
            applyGssocData(GSSOC_CONFIG.fallback);
        }

        // Fetch fresh rank from GSSoC profile API in background
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 7000);

            let response = null;
            try {
                response = await fetch(GSSOC_CONFIG.apiUrl, {
                    signal: controller.signal,
                    headers: { 'Accept': 'application/json' }
                });
            } catch (netErr) {
                // Network or CORS block caught safely without throwing
            }

            clearTimeout(timeoutId);

            if (response && response.ok) {
                const json = await response.json();
                if (json && json.rank) {
                    const freshData = {
                        rank: json.rank,
                        totalParticipants: json.totalParticipants || GSSOC_CONFIG.fallback.totalParticipants,
                        score: json.score || GSSOC_CONFIG.fallback.score,
                        mergedPrCount: json.mergedPrCount || GSSOC_CONFIG.fallback.mergedPrCount
                    };

                    try {
                        localStorage.setItem(GSSOC_CONFIG.cacheKey, JSON.stringify({
                            timestamp: now,
                            data: freshData
                        }));
                    } catch (writeErr) {
                        // Storage quota or restriction ignored safely
                    }

                    applyGssocData(freshData);
                }
            }
        } catch (fetchException) {
            // Zero console errors in production
        }
    }

    /**
     * =========================================================================
     * TELEGRAM DISPATCH CONTACT FORM HANDLER
     * =========================================================================
     * Sends form submissions to /api/contact endpoint, which uses Gmail SMTP SSL
     * to deliver messages directly to rathodmihir1113@gmail.com.
     */
    function initContactDispatchForm() {
        const form = document.getElementById('portfolio-contact-form');
        if (!form) return;

        const nameInput = document.getElementById('sender-name');
        const emailInput = document.getElementById('sender-email');
        const subjectInput = document.getElementById('sender-subject');
        const messageInput = document.getElementById('sender-message');
        const submitBtn = document.getElementById('btn-transmit-dispatch');
        const statusBanner = document.getElementById('dispatch-status-banner');

        form.addEventListener('submit', async function (e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const subject = subjectInput.value.trim() || 'Portfolio Telegram Dispatch';
            const message = messageInput.value.trim();
            const website = document.getElementById('website').value.trim();

            if (!message) return;

            // UI: Transmitting state
            submitBtn.disabled = true;
            submitBtn.classList.add('is-transmitting');
            submitBtn.innerHTML = '<span class="btn-transmit-text">TRANSMITTING DIRECT MESSAGE...</span>';
            if (statusBanner) {
                statusBanner.style.display = 'block';
                statusBanner.className = 'dispatch-status-banner pending';
                statusBanner.innerHTML = 'Connecting to mail server & transmitting your message...';
            }

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message, website })
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Success state
                    submitBtn.innerHTML = '<span class="btn-transmit-text">✓ MESSAGE SENT</span>';
                    if (statusBanner) {
                        statusBanner.className = 'dispatch-status-banner success';
                        statusBanner.innerHTML = '<strong>✓ DIRECT MESSAGE SENT:</strong> Delivered directly to Mihir Rathod\'s inbox (<span style="text-decoration:underline;">rathodmihir1113@gmail.com</span>). Thank you for reaching out!';
                    }
                    form.reset();
                    setTimeout(() => {
                        submitBtn.disabled = false;
                        submitBtn.classList.remove('is-transmitting');
                        submitBtn.innerHTML = '<span class="btn-transmit-text">SEND ANOTHER MESSAGE →</span>';
                    }, 4000);
                } else {
                    throw new Error(result.error || 'Transmission failed.');
                }
            } catch (err) {
                console.warn('Dispatch network error, falling back to mailto:', err);
                if (statusBanner) {
                    statusBanner.className = 'dispatch-status-banner error';
                    statusBanner.innerHTML = 'Direct API transmission encountered a temporary delay. Opening email client fallback...';
                }
                // Mailto fallback if server endpoint is unreachable
                window.location.href = `mailto:rathodmihir1113@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Sender: ${name} (${email})\n\n${message}`)}`;
                submitBtn.disabled = false;
                submitBtn.classList.remove('is-transmitting');
                submitBtn.innerHTML = '<span class="btn-transmit-text">TRANSMIT DISPATCH →</span>';
            }
        });
    }

    // Initialize application when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
