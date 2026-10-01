# Mihir Rathod Portfolio

## Run locally

Requirements: Python 3 and Node.js with npm.

```powershell
npm install
npm start
```

Open <http://localhost:43210>. Stop the server with `Ctrl+C`.

The portfolio works without configuration. Contact form email delivery is disabled until Gmail credentials are configured. In PowerShell, set them in the same terminal before starting the server:

```powershell
$env:GMAIL_USER = "your-sending-address@gmail.com"
$env:GMAIL_APP_PASSWORD = "your-16-character-gmail-app-password"
$env:RECIPIENT_EMAIL = "your-inbox@example.com"
npm start
```

Use a Gmail app password for `GMAIL_APP_PASSWORD`; do not commit real credentials. For Vercel deployment, configure the same variables in the project's environment settings.
## Motion & performance notes

- **Smooth scroll:** [Lenis](https://github.com/darkroomengineering/lenis) driven by the GSAP ticker (one RAF for the whole site). Phones keep native touch scrolling.
- **Scroll effects:** GSAP + ScrollTrigger + SplitText (all free, vendored in `js/vendor/` so there is no CDN dependency).
- `js/intro.js` – spider drop / web spin / web tear intro (home page, once per browser session, `Esc` to skip).
- `js/motion.js` – all scroll choreography, the hanging scroll-progress spider (click it to go to the top) and click-to-shoot webs.
- `js/page-transition.js` – silk curtain between pages + prefetch on hover.
- `js/engine/spider-art.js` – the realistic canvas spider (renders on demand only).
- Everyone with `prefers-reduced-motion` gets the site without intro, smoothing or scroll animations.
- `js/engine/ascii-grid.js`, `js/engine/spider.js`, `js/engine/text-animator.js` and `css/loader.css` are no longer used and can be deleted.
