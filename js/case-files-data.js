/**
 * ============================================================================
 * CASE-FILES-DATA.JS - OFFICIAL BROADSHEET CASE STUDY ARCHIVES
 * ============================================================================
 * Contains complete architectural dossiers for all 11 projects,
 * arranged in descending order of engineering complexity (Difficult → Easy).
 */

const ALL_CASE_FILES = [
    {
        id: "dinexa",
        exhibitNum: "01",
        complexity: "TIER 1 · FLAGSHIP FULL-STACK SAAS",
        complexityLevel: 1,
        client: "CLIENT — DINEXA.IN",
        flag: "CASE FILE — EXHIBIT 01 · DINEXA.IN",
        title: "Dinexa — Multi-Tenant Restaurant Platform",
        headline: "Your restaurant, fully alive online",
        lead: "An all-in-one platform engineered for restaurant owners: launch custom branded websites, showcase interactive 3D menus, and manage multi-branch table reservations from a single unified dashboard.",
        summary: "The all-in-one platform to build your restaurant's digital presence — custom website builder, 3D interactive menu, direct table reservations, and multi-restaurant management analytics. Built on React, Node.js, and MongoDB.",
        img: "assets/images/dinexa_sketch.jpg",
        caption: "The Dinexa digital restaurant platform — website builder, 3D menu, and table reservations in production.",
        quote: "“Built an all-in-one platform allowing restaurant owners to deploy custom websites, interactive 3D menus, and live reservations with zero middlemen.”",
        tags: ["React", "Node.js", "MongoDB", "3D Interactive Menu", "Multi-Tenant SaaS", "Tailwind CSS"],
        specs: {
            frontend: "React · Framer Motion · 3D Menu Book · Tailwind CSS",
            backend: "Node.js · Express · MongoDB · JWT Authentication",
            cache: "Multi-Restaurant Management Architecture",
            devops: "Docker · GitHub Actions CI/CD · Vercel",
            role: "Lead Architect & Full-Stack Engineer",
            entered: "2026",
            status: "Live in Production (Private Proprietary)",
            related: "FormBuddy Reviews · BasketIQ"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">M</span>ost restaurant owners struggle with fragmented digital tools—juggling expensive delivery platforms that take steep commissions, outdated paper menus or static PDF scans, and disconnected reservation apps that keep customer data locked away.</p>
            <p class="editorial-paragraph">Dinexa solves this by providing a unified multi-tenant platform where restaurants can launch their own custom-branded digital storefront in minutes. Guests enjoy an interactive 3D menu book and direct table booking, while owners manage menus, floor reservations, and customer relationships directly without third-party fees.</p>
            <blockquote class="modal-pull-quote">“Built an all-in-one platform allowing restaurant owners to deploy custom websites, interactive 3D menus, and live reservations with zero middlemen.”</blockquote>
            <p class="editorial-paragraph">Designed for both single-location cafes and multi-branch restaurant brands, the platform provides a centralized management dashboard to track table occupancy, update dishes in real-time across branches, and analyze customer dining trends from one place.</p>
        `,
        liveUrl: "https://dinexa.in",
        repoUrl: null
    },
    {
        id: "landledger",
        exhibitNum: "02",
        complexity: "TIER 1 · BLOCKCHAIN PROTOCOL & 3D WEB3",
        complexityLevel: 2,
        client: "LANDLEDGER · LANDLEDGER.ONLINE",
        flag: "CASE FILE — EXHIBIT 02 · LANDLEDGER.ONLINE",
        title: "LandLedger — Decentralized Land Registry & Escrow Protocol",
        headline: "Securing property deeds on Arbitrum Stylus",
        lead: "A decentralized land transfer platform eliminating bureaucratic fraud by securing property deeds via an on-chain Rust smart contract escrow on Arbitrum Stylus. Ranked #4 State Blockchain Hackathon.",
        summary: "Decentralized land transfer platform securing property deeds via an on-chain Rust smart contract escrow on Arbitrum Stylus. Features a 4-role verification workflow (Buyer, Seller, Government Officer, Admin) with KYC approval and a 3D LEGO-inspired React Three Fiber view.",
        img: "assets/images/landledger_sketch.jpg",
        caption: "The LandLedger on-chain escrow architecture and 3D LEGO property exploration interface.",
        quote: "“Wrote and deployed the escrow smart contract in Rust on Arbitrum Stylus, enforcing atomic deed transfers with 4-role verification.”",
        tags: ["Rust", "Arbitrum Stylus", "React Three Fiber (3D)", "Wagmi / Viem", "Sepolia Testnet"],
        specs: {
            frontend: "React Three Fiber (3D) · GSAP · RainbowKit · Tailwind",
            backend: "Rust Smart Contract (Arbitrum Stylus) · Node.js · Express",
            cache: "Viem On-Chain Receipt Verification",
            devops: "Docker · Arbitrum Sepolia (Chain ID 421614) · Cloudinary",
            role: "Lead Smart Contract & Backend Engineer",
            entered: "2026",
            status: "State Hackathon Rank #4",
            related: "Dinexa Restaurant OS"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">T</span>he paper deed system is vulnerable to fraud and bureaucratic delays. LandLedger replaces it with immutable code on Arbitrum Stylus. Property ownership is transferred through an on-chain escrow smart contract where funds release only after a verified government officer approves the digital deed.</p>
            <p class="editorial-paragraph">The frontend features an immersive LEGO-brick-inspired 3D visualization built with React Three Fiber, letting buyers explore parcel boundaries and zoning credentials in real-time. Wagmi and RainbowKit provide seamless Web3 wallet authentication.</p>
            <blockquote class="modal-pull-quote">“Wrote and deployed the escrow smart contract in Rust on Arbitrum Stylus, enforcing atomic deed transfers with 4-role verification.”</blockquote>
            <p class="editorial-paragraph">To resolve pending confirmation race conditions under serverless execution constraints, the backend implemented a sync-on-read pattern with Viem receipt verification, keeping off-chain MongoDB records in lockstep with the blockchain state.</p>
        `,
        liveUrl: "https://landledger.online",
        repoUrl: "https://github.com/mihir021/LandLedgerFinal.git"
    },
    {
        id: "lce",
        exhibitNum: "03",
        complexity: "TIER 2 · DEVELOPER TOOLING & DISTRIBUTED JAVA ENGINE",
        complexityLevel: 3,
        client: "CHROME WEB STORE · LCE EXTRACTOR",
        flag: "CASE FILE — EXHIBIT 03 · CHROME WEB STORE",
        title: "LCE (LeetCode Extractor) — Chrome Developer Extension",
        headline: "Instant problem extraction & paste-ready local IDE test stubs",
        lead: "A developer productivity Chrome Extension that extracts any LeetCode problem by number into clean paste-ready code stubs with prefilled test runners, ASCII elevation charts, and OCR matrix grids.",
        summary: "Full-stack Chrome Extension (MV3) backed by Java 21 Spring Boot: extracts LeetCode problem statements into language-aware code stubs (Java, Python, C++, Go) with prefilled main() test harnesses, ASCII elevation maps, and OCR matrix grids for zero-friction local IDE debugging.",
        img: "assets/images/leetcode_sketch.jpg",
        caption: "The LCE Chrome Extension interface with #42 Trapping Rain Water ASCII elevation mapping.",
        quote: "“Engineered language-aware comment formatting with runnable test harnesses and deterministic ASCII elevation charts for seamless local IDE problem solving.”",
        tags: ["Chrome Manifest V3", "Java 21", "Spring Boot", "ASCII Elevation Maps", "OCR Matrix Parser", "Docker"],
        specs: {
            frontend: "Chrome Extension Manifest V3 · JavaScript · Clipboard Integration",
            backend: "Java 21 · Spring Boot · JSoup · Tess4J OCR · Docker",
            cache: "Chrome Local Storage Cache + Sub-50ms Parsing",
            devops: "Docker Compose · Maven · Cloud Service Deployment",
            role: "Solo Creator & Backend Architect",
            entered: "2026",
            status: "Live on Chrome Web Store (Private Backend)",
            related: "JournalApp Spring Boot"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">C</span>ontext switching between the browser and local code editors (IntelliJ, VS Code, CLion) breaks algorithmic focus. Developers lose valuable practice time manually copying problem prompts, formatting comment headers, and setting up local test cases.</p>
            <p class="editorial-paragraph">LCE solves this with a lightweight Manifest V3 Chrome Extension and high-throughput Java 21 Spring Boot engine. Typing a problem number instantly generates clean, language-aware code stubs for Java, Python, C++, and Go with prefilled runnable <code>main()</code> test cases for instant local execution.</p>
            <blockquote class="modal-pull-quote">“Engineered language-aware comment formatting with runnable test harnesses and deterministic ASCII elevation charts for seamless local IDE problem solving.”</blockquote>
            <p class="editorial-paragraph">For visual challenges, LCE features a deterministic ASCII engine that converts histogram and elevation images (such as #42 Trapping Rain Water) into 1:1 aligned terminal art, while OCR matrix normalization reconstructs 2D grid problems directly into code.</p>
        `,
        liveUrl: "https://chromewebstore.google.com/detail/lce-%E2%80%94-leetcode-extractor/ghlocdnmgakhaaamfliabdocehkaaipj?authuser=0&hl=en-GB",
        repoUrl: null
    },
    {
        id: "formbuddy",
        exhibitNum: "04",
        complexity: "TIER 2 · MULTI-TENANT REVIEW INTELLIGENCE SAAS",
        complexityLevel: 4,
        client: "FORMBUDDY · FORMBUDDY.IN",
        flag: "CASE FILE — EXHIBIT 04 · FORMBUDDY.IN",
        title: "FormBuddy — Multi-Tenant Customer Review Platform",
        headline: "Zero-friction point-of-sale customer review intelligence",
        lead: "An all-in-one customer review collection SaaS: generate custom branded QR code stand funnels, capture on-premise customer sentiment, and alert managers in real-time.",
        summary: "Multi-tenant feedback platform enabling businesses to generate instant point-of-sale QR code review funnels, dynamic notebook forms, live sentiment tracking, and real-time manager alerts to resolve negative experiences before they reach public platforms.",
        img: "assets/images/formbuddy_sketch.jpg",
        caption: "The FormBuddy customer review dashboard with QR scan triggers and rating intelligence.",
        quote: "“Built zero-friction QR feedback funnels that capture on-premise customer sentiment and alert managers before negative reviews go public.”",
        tags: ["React", "Node.js", "Express", "MongoDB", "QR Funnels", "Multi-Tenant SaaS"],
        specs: {
            frontend: "React · Comic Pop-Art Design System · Dynamic Forms",
            backend: "Node.js · Express · MongoDB · Role-Based JWT Auth",
            cache: "Multi-Tenant Analytics Pipeline",
            devops: "Docker · GitHub Actions CI/CD · Vercel",
            role: "Solo Creator & Full-Stack Engineer",
            entered: "2026",
            status: "Live in Production (Private Proprietary)",
            related: "Dinexa Restaurant Platform"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">C</span>apturing customer feedback at the point of sale is notoriously difficult. Most customers ignore follow-up emails and abandon clunky survey forms that demand app downloads or account logins, leaving negative experiences unresolved until they turn into public 1-star ratings.</p>
            <p class="editorial-paragraph">FormBuddy solves this by generating instant on-table QR code stand funnels that take customers straight to a high-converting, lightweight 1-tap review screen. Customers leave feedback in under 15 seconds without installing anything or creating accounts.</p>
            <blockquote class="modal-pull-quote">“Built zero-friction QR feedback funnels that capture on-premise customer sentiment and alert managers before negative reviews go public.”</blockquote>
            <p class="editorial-paragraph">For business owners, FormBuddy provides a multi-tenant management dashboard with sentiment distribution charts, employee performance benchmarks, and automated real-time alerts that notify managers immediately when a negative review is submitted so issues can be resolved on the spot.</p>
        `,
        liveUrl: "https://formbuddy.in",
        repoUrl: null
    },
    {
        id: "basketiq",
        exhibitNum: "05",
        complexity: "TIER 2 · DJANGO AI MEAL PLANNING & ECOMMERCE",
        complexityLevel: 5,
        client: "BASKETIQ · GITHUB.COM/MIHIR021/BASKETIQ",
        flag: "CASE FILE — EXHIBIT 05 · GITHUB.COM/MIHIR021/BASKETIQ",
        title: "BasketIQ — AI Meal Planning & Grocery Platform",
        headline: "Intelligent pantry planning from cart to table",
        lead: "A Django-based grocery platform and AI meal-planning engine organized with modular apps for market inventory, AI meal suggestions, order history, and expense analytics.",
        summary: "Production-structured Django platform featuring decoupled apps (`apps/planner/`, `apps/market/`, `apps/orders/`, `apps/expenses/`) with split settings for base/dev/production and AI-powered meal generation based on cart contents.",
        img: "assets/images/basketiq_sketch.jpg",
        caption: "The BasketIQ grocery catalogue and weekly AI meal planning matrix.",
        quote: "“Engineered modular Django apps with decoupled expense analytics and automated recipe cost calculators.”",
        tags: ["Python", "Django", "AI Meal Planning", "Modular Apps", "PostgreSQL", "Tailwind CSS"],
        specs: {
            frontend: "Django Templates · Vanilla JS · Tailwind CSS",
            backend: "Python · Django 5 · REST Framework · Modular Apps",
            cache: "Django Redis Cache Layer",
            devops: "Split Base/Dev/Prod Settings · PostgreSQL",
            role: "Backend Architect & Python Developer",
            entered: "2026",
            status: "Production Ready",
            related: "IITRAM Farm-to-Market"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">E</span>fficient household grocery planning requires synchronizing pantry inventory with dietary goals. BasketIQ tackles this challenge with a modular Django architecture that unifies grocery catalog management, recipe discovery, and expense tracking.</p>
            <p class="editorial-paragraph">The platform is engineered using cleanly isolated Django applications: <code>apps/planner/</code> manages AI-driven weekly recipe schedules, <code>apps/market/</code> handles pricing and SKU inventory, while <code>apps/expenses/</code> provides real-time monthly budget visualizations.</p>
            <blockquote class="modal-pull-quote">“Engineered modular Django apps with decoupled expense analytics and automated recipe cost calculators.”</blockquote>
            <p class="editorial-paragraph">By leveraging split settings across development and production configurations, BasketIQ achieves clean database isolation, fast cache hits, and reliable order state transitions.</p>
        `,
        liveUrl: "https://github.com/mihir021/BasketIQ",
        repoUrl: "https://github.com/mihir021/BasketIQ"
    },
    {
        id: "iitram",
        exhibitNum: "06",
        complexity: "TIER 3 · MULTI-ROLE AGRARIAN MARKETPLACE (FLASK + MONGODB)",
        complexityLevel: 6,
        client: "IITRAM HACKATHON · FARM-TO-MARKET",
        flag: "CASE FILE — EXHIBIT 06 · GITHUB.COM/MIHIR021/IITRAM-HACKATHON",
        title: "Farm-to-Market Marketplace — IITRAM Hackathon",
        headline: "Direct agrarian negotiation without middleman overhead",
        lead: "An integrated 3-role agrarian commerce engine uniting Admin supervision, Buyer marketplace negotiations, and Farmer portals on a modular Flask backend.",
        summary: "Integrated Farm-to-Market platform built with Flask app factory, modular blueprints, MongoDB, and Tailwind CSS. Features direct price negotiation channels, cart management, crop cataloging, and administrative oversight.",
        img: "assets/images/farm_market_sketch.jpg",
        caption: "The agrarian crop exchange and live price negotiation terminal.",
        quote: "“Architected modular Flask blueprints allowing real-time multi-party crop bid negotiations directly between farmers and buyers.”",
        tags: ["Flask App Factory", "MongoDB", "Blueprints", "Tailwind CSS", "Negotiation Engine"],
        specs: {
            frontend: "HTML5 · Tailwind CSS · Vanilla JS Event Handlers",
            backend: "Flask App Factory · Modular Blueprints · MongoDB",
            cache: "MongoDB Atlas Connection Pool",
            devops: "Docker · Flask Environment Configurations",
            role: "Full-Stack Engineer & Team Lead",
            entered: "2026",
            status: "Hackathon Finalist Submission",
            related: "BasketIQ Grocery Platform"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">A</span>gricultural supply chains suffer from excessive intermediary markups. Built for the IITRAM Hackathon, this platform cuts out middlemen by connecting farmers directly with institutional and retail buyers.</p>
            <p class="editorial-paragraph">Built on Flask utilizing the application factory pattern and modular blueprints, the system isolates three core portals: an Admin moderation board, a Buyer order and negotiation terminal, and a Farmer dashboard for inventory and bid acceptance.</p>
            <blockquote class="modal-pull-quote">“Architected modular Flask blueprints allowing real-time multi-party crop bid negotiations directly between farmers and buyers.”</blockquote>
            <p class="editorial-paragraph">The unified MongoDB database schema enforces ACID-compliant state changes during price bargaining, ensuring transparent, fraud-free transactions.</p>
        `,
        liveUrl: "https://github.com/mihir021/IITRAM-Hackathon",
        repoUrl: "https://github.com/mihir021/IITRAM-Hackathon"
    },
    {
        id: "devops",
        exhibitNum: "07",
        complexity: "TIER 3 · PRODUCTION DEVOPS & MULTI-CONTAINER CLUSTER",
        complexityLevel: 7,
        client: "DEVOPS ARCHIVES · GITHUB.COM/MIHIR021/DEVOPS-MERN-BASE-TEMPLATE",
        flag: "CASE FILE — EXHIBIT 07 · GITHUB.COM/MIHIR021/DEVOPS-MERN-BASE-TEMPLATE",
        title: "DevOps MERN Production Starter Template",
        headline: "Zero-CORS multi-container deployments on single-host EC2",
        lead: "A production-grade, modular MERN template with multi-stage Alpine Docker builds, automated GitHub Actions CI/CD pipelines, and internal Nginx reverse proxy routing.",
        summary: "Production-grade MERN starter template equipped with automated CI/CD, ultra-slim Docker multi-stage Alpine containers, Nginx reverse proxy routing (`/api/*`), and multi-project single-host deployment capability without port conflicts.",
        img: "assets/images/devops_sketch.jpg",
        caption: "The automated Docker CI/CD conveyor, Nginx reverse proxy, and container monitoring suite.",
        quote: "“Eliminated CORS errors and port conflicts by routing all frontend and backend traffic through an internal Nginx reverse proxy.”",
        tags: ["Docker Alpine", "GitHub Actions CI/CD", "Nginx Proxy", "Node.js 22", "React 19", "Express 5"],
        specs: {
            frontend: "React 19 · Vite · React Router v7",
            backend: "Node.js 22 · Express 5 · Mongoose 9 (MongoDB Atlas)",
            cache: "Nginx Static Asset Cache",
            devops: "Docker Multi-Stage Alpine · GitHub Actions · Nginx Proxy",
            role: "DevOps Engineer & Author",
            entered: "2026",
            status: "Public Open Source Template",
            related: "Dinexa Restaurant OS"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">D</span>eploying multiple web applications on a single cloud server frequently leads to port collisions, bloated container footprints, and complex CORS configurations. This DevOps starter template solves all three problems systematically.</p>
            <p class="editorial-paragraph">The template pairs React 19 and Node.js 22 inside multi-stage Alpine Dockerfiles that reduce container image sizes by over 70%. An embedded Nginx reverse proxy handles internal routing for <code>/api/*</code> endpoints, completely eliminating CORS vulnerabilities.</p>
            <blockquote class="modal-pull-quote">“Eliminated CORS errors and port conflicts by routing all frontend and backend traffic through an internal Nginx reverse proxy.”</blockquote>
            <p class="editorial-paragraph">Automated GitHub Actions CI/CD workflows run automated linter tests and container builds on every pull request, ensuring reliable production delivery.</p>
        `,
        liveUrl: "https://github.com/mihir021/DevOps-MERN-Base-Template",
        repoUrl: "https://github.com/mihir021/DevOps-MERN-Base-Template"
    },
    {
        id: "resume",
        exhibitNum: "08",
        complexity: "TIER 3 · FULL-STACK ATS RESUME ANALYZER",
        complexityLevel: 8,
        client: "RESUME MAKER · GITHUB.COM/MIHIR021/RESUME-MAKER-",
        flag: "CASE FILE — EXHIBIT 08 · GITHUB.COM/MIHIR021/RESUME-MAKER-",
        title: "Resume Maker & ATS Analyzer",
        headline: "Engineering job applications for algorithmic screening",
        lead: "An interactive ATS resume builder that helps candidates bypass algorithmic hiring filters with real-time keyword matching, structured section formatting, and high-fidelity PDF exports.",
        summary: "Full-stack resume engineering platform with live split-screen editor, automated ATS keyword match scoring (98% match gauge), semantic section tagging, and print-ready PDF generation.",
        img: "assets/images/resumemaker_sketch.jpg",
        caption: "The ATS Resume Builder interface with real-time keyword scoring and professional document generation.",
        quote: "“Built an ATS parsing simulator that scores resume text against job description keywords in real-time.”",
        tags: ["Python", "Flask", "MongoDB", "ATS Optimization", "PDF Generation"],
        specs: {
            frontend: "HTML5 · CSS3 · Modern Responsive Grid · Vanilla JS",
            backend: "Python 3.8+ · Flask 3.1 · PyMongo",
            cache: "Local Session Storage",
            devops: "MongoDB Atlas · Gunicorn Deployment",
            role: "Full-Stack Python Developer",
            entered: "2026",
            status: "Open Source Tool",
            related: "ObsidianAi Retail"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">A</span>pplicant Tracking Systems (ATS) automatically filter out candidate resumes that lack machine-readable formatting or essential skill keywords. Resume Maker solves this problem by providing structural templates engineered specifically for parser readability.</p>
            <p class="editorial-paragraph">Built on Flask and MongoDB, the tool features real-time keyword density analysis, clean semantic section tagging, and high-fidelity PDF exporting with instant visual preview feedback.</p>
            <blockquote class="modal-pull-quote">“Built an ATS parsing simulator that scores resume text against job description keywords in real-time.”</blockquote>
            <p class="editorial-paragraph">The platform allows applicants to tailor their technical experience to target job postings with instant score feedback, ensuring their qualifications reach human recruiters.</p>
        `,
        liveUrl: "https://github.com/mihir021/resume-maker-",
        repoUrl: "https://github.com/mihir021/resume-maker-"
    },
    {
        id: "obsidian",
        exhibitNum: "09",
        complexity: "TIER 3 · AI RETAIL & STORE INTELLIGENCE PLATFORM",
        complexityLevel: 9,
        client: "OBSIDIAN AI · GITHUB.COM/MIHIR021/OBSIDIANAI",
        flag: "CASE FILE — EXHIBIT 09 · GITHUB.COM/MIHIR021/OBSIDIANAI",
        title: "ObsidianAi — Retail & Store Intelligence Platform",
        headline: "Real-time store performance, visitor analytics & AI sales intelligence",
        lead: "An all-in-one retail management platform providing brick-and-mortar store owners with real-time visitor traffic metrics, 92% store health indices, campaign conversion tracking, and AI sales insights.",
        summary: "Full-stack retail intelligence dashboard featuring live physical store health monitoring, architectural floor plan occupancy visualization, visitor conversion funnels, customer campaign analytics, and revenue forecasting.",
        img: "assets/images/obsidianai_sketch.jpg",
        caption: "The ObsidianAi retail overview dashboard with architectural store blueprint and live health metrics.",
        quote: "“Unified physical store visitor traffic, campaign conversions, and real-time revenue analytics into a single intelligent retail command center.”",
        tags: ["React", "Node.js", "AI Analytics", "Retail Intelligence", "Dashboard UI"],
        specs: {
            frontend: "React · Modern Component Architecture · SVG Data Visualizers",
            backend: "Node.js · Express · AI Analytics Engine",
            cache: "Real-Time Telemetry Cache",
            devops: "Docker · GitHub Actions CI/CD · Vercel",
            role: "Full-Stack Engineer & UI Architect",
            entered: "2026",
            status: "Live Application",
            related: "FormBuddy Reviews · Dinexa Platform"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">B</span>rick-and-mortar fashion and retail brands struggle to gain actionable real-time visibility into foot traffic, in-store conversion rates, and overall store health. ObsidianAi bridges this gap by unifying retail operations into an intelligent dashboard command center.</p>
            <p class="editorial-paragraph">The platform tracks live visitor traffic, computes real-time store health scores, and maps retail floor activity against sales conversion targets. Owners and store managers can oversee multiple campaigns and monitor customer buying behavior in real time.</p>
            <blockquote class="modal-pull-quote">“Unified physical store visitor traffic, campaign conversions, and real-time revenue analytics into a single intelligent retail command center.”</blockquote>
            <p class="editorial-paragraph">By combining architectural floor plan visualization with predictive AI sales forecasting, ObsidianAi empowers modern retail operators to optimize customer experiences and drive sustained revenue growth.</p>
        `,
        liveUrl: "https://github.com/mihir021/ObsidianAi",
        repoUrl: "https://github.com/mihir021/ObsidianAi"
    },
    {
        id: "journal",
        exhibitNum: "10",
        complexity: "TIER 4 · SPRING BOOT JAVA BACKEND & REST API",
        complexityLevel: 10,
        client: "JOURNAL APP · GITHUB.COM/MIHIR021/JOURNALAPP",
        flag: "CASE FILE — EXHIBIT 10 · GITHUB.COM/MIHIR021/JOURNALAPP",
        title: "JournalApp — Spring Boot REST Engine",
        headline: "Enterprise layered architecture and secure persistence",
        lead: "A structured Java backend demonstrating Spring Boot REST controllers, Spring Security authentication, and layered DTO patterns.",
        summary: "Clean Java backend architecture built with Spring Boot, Spring Security, JWT authentication, and relational/NoSQL persistence layers implementing the Controller-Service-Repository-DTO pattern.",
        img: null,
        caption: null,
        quote: "“Enforced strict Controller-Service-Repository-DTO separation with Spring Security JWT authentication.”",
        tags: ["Java", "Spring Boot", "Spring Security", "JWT", "REST API"],
        specs: {
            frontend: "Swagger / OpenAPI Documentation UI",
            backend: "Java · Spring Boot 3 · Spring Security · DTO Pattern",
            cache: "Spring Cache Layer",
            devops: "Maven · MySQL / MongoDB",
            role: "Backend Java Engineer",
            entered: "2025 - 2026",
            status: "Reference Backend Service",
            related: "LeetCode Companion LCE"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">E</span>nterprise software demands clear separation of concerns, robust security boundaries, and strict data validation. JournalApp exemplifies these principles using modern Spring Boot Java patterns.</p>
            <p class="editorial-paragraph">The application implements a layered architecture where HTTP controllers delegate business logic to transactional services, communicating across boundary layers using dedicated Data Transfer Objects (DTOs).</p>
            <blockquote class="modal-pull-quote">“Enforced strict Controller-Service-Repository-DTO separation with Spring Security JWT authentication.”</blockquote>
            <p class="editorial-paragraph">Spring Security handles role-based authorization and stateless JWT token verification, providing a dependable template for enterprise backend development.</p>
        `,
        liveUrl: "https://github.com/mihir021/journalApp",
        repoUrl: "https://github.com/mihir021/journalApp"
    },
    {
        id: "sem2",
        exhibitNum: "11",
        complexity: "TIER 4 · ACADEMIC & RELATIONAL MANAGEMENT SYSTEM",
        complexityLevel: 11,
        client: "ACADEMIC ARCHIVES · GITHUB.COM/MIHIR021/SEM2_PROJECT",
        flag: "CASE FILE — EXHIBIT 11 · GITHUB.COM/MIHIR021/SEM2_PROJECT",
        title: "Student-Faculty Academic Management System",
        headline: "Role-based academic administration, course management & MySQL persistence",
        lead: "A Java and MySQL academic management system engineered with strict OOP design principles, file I/O streams, and JDBC connectivity for administering faculty, student records, and courses.",
        summary: "Academic records and course administration system built in Java and MySQL. Features role-based access for administrators, faculty, and students, with relational data modeling and automated record keeping.",
        img: null,
        caption: null,
        quote: "“Engineered a modular role-based academic management system applying object-oriented design and relational JDBC persistence.”",
        tags: ["Java", "OOP", "MySQL", "JDBC", "Academic Records"],
        specs: {
            frontend: "Java GUI / Console Command Interface",
            backend: "Core Java (OOP) · JDBC Driver Architecture",
            cache: "Relational Query Result Caching",
            devops: "JDK · MySQL Relational Database",
            role: "Software Engineering Student",
            entered: "2024 - 2025",
            status: "Completed Academic System",
            related: "JournalApp Spring Boot"
        },
        narrative: `
            <p class="editorial-paragraph"><span class="drop-cap">A</span>cademic institutions require reliable systems to manage student enrollments, faculty course assignments, and confidential grading records. The Student-Faculty Academic Management System was engineered to provide structured, role-based records management.</p>
            <p class="editorial-paragraph">Built with Core Java applying strict object-oriented principles—runtime polymorphism, encapsulation, and interface abstraction—the system connects to a relational MySQL database via JDBC to execute parameterized queries for attendance, grade reporting, and student profiles.</p>
            <blockquote class="modal-pull-quote">“Engineered a modular role-based academic management system applying object-oriented design and relational JDBC persistence.”</blockquote>
            <p class="editorial-paragraph">By enforcing separation of data access from business logic, the application provided an early masterclass in relational schema design, data validation, and clean application architecture.</p>
        `,
        liveUrl: "https://github.com/mihir021/Sem2_Project",
        repoUrl: "https://github.com/mihir021/Sem2_Project"
    }
];
