/**
 * ============================================================================
 * SPIDER.JS - PROCEDURAL SPIDER WITH CENTER-LOCK & SPLIT-WALL CAPABILITY
 * ============================================================================
 * Features:
 * 1. Continuous Phase Kinematics:
 *    - Butter-smooth leg articulation and swinging with zero twitching
 * 2. Generative Silk Web Weaving & Multi-Tiered Precision Gauge
 * 3. Center-Lock & Scale Expansion Transition:
 *    - At 100% load, spider smoothly stops swinging, scales up, and anchors
 *      in the exact center of the screen (50% X, 50% Y)
 *    - Dissolves the circular gauge so the spider is ready for the 50/50 wall split
 * 4. Dual-Canvas Split Wall Compatibility:
 *    - Clean symmetry for identical left-door and right-door half rendering
 */

class ProceduralSpider {
    /**
     * Initializes the procedural spider and precision circular gauge
     * @param {Object} options - Configuration options
     */
    constructor(options = {}) {
        // Base dimensions
        this.x = options.x || window.innerWidth / 2;
        this.y = options.y || -240;
        this.baseY = -240;
        this.targetY = window.innerHeight * 0.42;

        // Size scaling
        this.scale = 1.25;
        this.baseScale = 1.25;
        this.expandedScale = 1.65;

        // State: 'loading' | 'centering' | 'locked'
        this.state = 'loading';
        this.centeringProgress = 0; // 0 to 1

        // Continuous Phase Accumulators
        this.time = 0;
        this.legPhase = 0;
        this.currentLegSpeed = 2.4;
        this.swingPhase = 0;
        this.swingAngle = 0;
        this.swingAmp = 0.035;
        this.currentSwingAmp = 0.035;
        this.swingFreq = 1.6;

        // Descent & Arc Progress (0 to 1)
        this.descentProgress = 0;
        this.gaugeAlpha = 1.0;

        // Spinner frames
        this.spinnerFrames = ['/', '—', '\\', '|'];
        this.spinnerIdx = 0;
        this.spinnerTimer = 0;

        // Trailing particles pool
        this.particles = [];
        this.maxParticles = 12;

        // Anatomical 8-Leg Configuration:
        // [Femur apex (dx, dy), Tibia bend (dx, dy), Tarsus tip (dx, dy), root Y-offset, phase, asym]
        this.legs = [
            // Pair 1 (Front Legs - reaching downward & forward)
            { side: -1, pair: 1, rootY: 13, kX: -26, kY: 28,  tX: -36, tY: 62,  tipX: -22, tipY: 88,  phase: 0.0, asym: 1.0 },
            { side:  1, pair: 1, rootY: 13, kX:  27, kY: 30,  tX:  37, tY: 64,  tipX:  24, tipY: 90,  phase: 0.5, asym: 0.95 },

            // Pair 2 (Mid-Front Legs - high upward knee arch)
            { side: -1, pair: 2, rootY: 8,  kX: -38, kY: -6,  tX: -52, tY: 32,  tipX: -40, tipY: 66,  phase: 1.2, asym: 1.02 },
            { side:  1, pair: 2, rootY: 8,  kX:  40, kY: -4,  tX:  54, tY: 34,  tipX:  42, tipY: 68,  phase: 1.7, asym: 0.97 },

            // Pair 3 (Mid-Rear Legs - arching upward and out)
            { side: -1, pair: 3, rootY: 3,  kX: -44, kY: -24, tX: -56, tY: 10,  tipX: -46, tipY: 42,  phase: 2.4, asym: 0.98 },
            { side:  1, pair: 3, rootY: 3,  kX:  46, kY: -22, tX:  58, tY: 12,  tipX:  48, tipY: 44,  phase: 2.9, asym: 1.03 },

            // Pair 4 (Hind Legs - reaching up toward silk thread)
            { side: -1, pair: 4, rootY: -2, kX: -32, kY: -54, tX: -20, tY: -40, tipX: -10, tipY: -28, phase: 3.6, asym: 1.01 },
            { side:  1, pair: 4, rootY: -2, kX:  34, kY: -52, tX:  22, tY: -38, tipX:  12, tipY: -26, phase: 4.1, asym: 0.96 }
        ];

        // Light Mode Color Palette
        this.bodyColor = '#14151e';
        this.primaryColor = '#d9204c';
        this.glowColor = 'rgba(217, 32, 76, 0.45)';
        this.threadColor = '#464c5c';
        this.trackBorder = '#b8becd';
        this.webColor = 'rgba(100, 110, 130, 0.22)';

        this.updateDimensions();
        window.addEventListener('resize', () => this.updateDimensions());
    }

    /**
     * Update center coordinates and responsive scale on resize
     */
    updateDimensions() {
        const isMobile = window.innerWidth <= 768;
        this.baseScale = isMobile ? 1.05 : 1.25;
        this.expandedScale = isMobile ? 1.35 : 1.65;
        this.scale = this.state === 'locked' ? this.expandedScale : this.baseScale;
        this.x = window.innerWidth / 2;
        this.targetY = isMobile ? window.innerHeight * 0.40 : window.innerHeight * 0.42;
    }

    /**
     * Set explicit descent & arc progress (0 to 1) with quintic smooth deceleration
     */
    setProgress(progress) {
        if (this.state !== 'loading') return;
        this.descentProgress = Math.max(0, Math.min(1, progress));
        const t = Math.min(1, this.descentProgress / 0.45);
        const ease = 1 - Math.pow(1 - t, 5);
        this.y = this.baseY + (this.targetY - this.baseY) * ease;
    }

    /**
     * Trigger smooth transition to exact screen center & scale expansion
     * @param {Function} onReadyToSplit - Callback when centered and ready for door opening
     */
    startCenteringAndLock(onReadyToSplit) {
        this.state = 'centering';
        this.centeringProgress = 0;
        const startY = this.y;
        const finalCenterY = window.innerHeight * 0.50; // Exact vertical center
        const startScale = this.scale;
        const targetScale = this.expandedScale;
        const startTime = performance.now();
        const duration = 1000; // 1000ms smooth cinematic expansion and centering

        const animateCentering = (now) => {
            const elapsed = now - startTime;
            const t = Math.min(1, elapsed / duration);
            // Smooth cubic ease out
            const ease = 1 - Math.pow(1 - t, 3);

            this.centeringProgress = ease;
            this.y = startY + (finalCenterY - startY) * ease;
            this.scale = startScale + (targetScale - startScale) * ease;
            this.gaugeAlpha = Math.max(0, 1 - ease * 1.5); // Smoothly dissolve gauge
            this.currentSwingAmp = this.swingAmp * (1 - ease); // Swing stops

            if (t < 1) {
                requestAnimationFrame(animateCentering);
            } else {
                this.state = 'locked';
                this.y = finalCenterY;
                this.scale = targetScale;
                this.swingAngle = 0;
                this.gaugeAlpha = 0;
                if (onReadyToSplit) onReadyToSplit();
            }
        };

        requestAnimationFrame(animateCentering);
    }

    /**
     * Reset spider for replay
     */
    reset() {
        this.state = 'loading';
        this.centeringProgress = 0;
        this.scale = this.baseScale;
        this.gaugeAlpha = 1.0;
        this.swingAngle = 0;
        this.descentProgress = 0;
        this.y = this.baseY;
    }

    /**
     * Update kinematics, continuous phase integration, particles, and spinner frame
     * @param {number} deltaTime - Time step in seconds
     */
    update(deltaTime = 0.016) {
        const dt = Math.min(0.05, deltaTime);
        this.time += dt;

        // Fetch CSS variables
        this.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-spider').trim() || '#d9204c';
        this.glowColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-spider-glow').trim() || 'rgba(217, 32, 76, 0.45)';

        if (this.state === 'loading') {
            const rawRatio = Math.max(0, 1 - (this.descentProgress / 0.45));
            const smoothDescent = rawRatio * rawRatio * (3 - 2 * rawRatio);

            const targetLegSpeed = 1.8 + (1.6 * smoothDescent);
            this.currentLegSpeed += (targetLegSpeed - this.currentLegSpeed) * Math.min(1, dt * 5.0);
            this.legPhase += this.currentLegSpeed * dt;

            this.swingPhase += this.swingFreq * dt;
            const targetSwingAmp = this.swingAmp * (0.6 + 0.6 * smoothDescent);
            this.currentSwingAmp += (targetSwingAmp - this.currentSwingAmp) * Math.min(1, dt * 4.0);
            this.swingAngle = Math.sin(this.swingPhase) * this.currentSwingAmp;
        } else if (this.state === 'centering') {
            // Subtle slow breathing flex while centering
            this.legPhase += 1.2 * dt;
            this.swingAngle *= (1 - dt * 6);
        } else {
            // Locked at center: gentle subtle breathing
            this.legPhase += 1.0 * dt;
            this.swingAngle = 0;
        }

        // Update ASCII spinner
        this.spinnerTimer += dt;
        if (this.spinnerTimer >= 0.12) {
            this.spinnerTimer = 0;
            this.spinnerIdx = (this.spinnerIdx + 1) % this.spinnerFrames.length;
        }

        // Spawn spark particles during loading only
        if (this.state === 'loading' && this.descentProgress > 0.02 && this.descentProgress < 0.99 && this.particles.length < this.maxParticles && Math.random() < 0.3) {
            const startAngle = Math.PI * 0.75;
            const totalAngleSpan = Math.PI * 1.5;
            const currentAngle = startAngle + (this.descentProgress * totalAngleSpan);
            const rMid = 98 * this.scale;
            const sparkX = this.x + Math.cos(currentAngle) * rMid;
            const sparkY = this.y + 8 * this.scale + Math.sin(currentAngle) * rMid;

            this.particles.push({
                x: sparkX + (Math.random() - 0.5) * 3,
                y: sparkY + (Math.random() - 0.5) * 3,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                radius: (1.2 + Math.random() * 1.6) * this.scale
            });
        }

        // Update active particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life -= dt * 2.4;
            if (p.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Render the spider, generative silk web, and multi-tier precision gauge
     * @param {CanvasRenderingContext2D} ctx - 2D rendering context
     */
    render(ctx) {
        ctx.save();

        const s = this.scale;
        const abdomenTopY = this.y - (38 * s);

        // 1. Draw Silk Web Thread (from ceiling down to spinneret)
        ctx.beginPath();
        ctx.strokeStyle = this.threadColor;
        ctx.lineWidth = 1.8;
        ctx.moveTo(this.x, 0);

        const threadControlX = this.x + (this.state === 'loading' ? Math.sin(this.swingPhase * 0.8) * 5 : 0);
        const threadControlY = this.y * 0.45;
        ctx.quadraticCurveTo(threadControlX, threadControlY, this.x, abdomenTopY);
        ctx.stroke();

        // 2. Draw Generative Web & Precision Gauge (Fades out when centering)
        if (this.gaugeAlpha > 0.01) {
            ctx.save();
            ctx.globalAlpha = this.gaugeAlpha;
            this.renderGenerativeWeb(ctx);
            this.renderPrecisionGauge(ctx);
            this.renderParticles(ctx);
            ctx.restore();
        }

        // Move to Spider Center Anchor and apply swing rotation
        ctx.translate(this.x, this.y);
        ctx.rotate(this.swingAngle);

        // 3. Draw 8 Articulated Legs (Continuous smooth kinematics)
        this.renderLegs(ctx);

        // 4. Draw Body Anatomy (Abdomen with Exoskeleton Ribs, Pedicel, Cephalothorax)
        this.renderBody(ctx);

        // 5. Draw Head Details (Glowing Eyes & Pedipalps)
        this.renderHeadDetails(ctx);

        ctx.restore();
    }

    /**
     * Render Generative Silk Web Weaving Strands
     */
    renderGenerativeWeb(ctx) {
        const appearAlpha = Math.min(1, Math.max(0, (this.y + 120) / 180)) * this.gaugeAlpha;
        if (appearAlpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = appearAlpha;

        const s = this.scale;
        const cx = this.x;
        const cy = this.y + (8 * s);
        const rInner = 88 * s;

        const numSpokes = 8;
        const startAngle = Math.PI * 0.75;
        const totalAngleSpan = Math.PI * 1.5;

        ctx.strokeStyle = this.webColor;
        ctx.lineWidth = 1.0;
        ctx.setLineDash([3, 3]);

        const activeSpokesCount = Math.min(numSpokes, Math.ceil(this.descentProgress * numSpokes * 1.2));

        for (let i = 0; i < activeSpokesCount; i++) {
            const angle = startAngle + (i / (numSpokes - 1)) * totalAngleSpan;
            const targetX = cx + Math.cos(angle) * rInner;
            const targetY = cy + Math.sin(angle) * rInner;

            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            const wave = Math.sin(this.legPhase * 1.5 + i) * (2.2 * s);
            const midX = (this.x + targetX) / 2 + (Math.cos(angle + Math.PI/2) * wave);
            const midY = (this.y + targetY) / 2 + (Math.sin(angle + Math.PI/2) * wave);
            ctx.quadraticCurveTo(midX, midY, targetX, targetY);
            ctx.stroke();

            ctx.fillStyle = this.primaryColor;
            ctx.beginPath();
            ctx.arc(targetX, targetY, 2.0 * s, 0, Math.PI * 2);
            ctx.fill();
        }

        const webRings = [36 * s, 62 * s];
        webRings.forEach((r, ringIdx) => {
            if (this.descentProgress > (0.2 + ringIdx * 0.25)) {
                ctx.beginPath();
                for (let i = 0; i < activeSpokesCount; i++) {
                    const angle = startAngle + (i / (numSpokes - 1)) * totalAngleSpan;
                    const ringWave = Math.sin(this.legPhase * 1.2 + ringIdx + i) * (1.2 * s);
                    const rx = cx + Math.cos(angle) * (r + ringWave);
                    const ry = cy + Math.sin(angle) * (r + ringWave);
                    if (i === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                }
                ctx.stroke();
            }
        });

        ctx.setLineDash([]);
        ctx.restore();
    }

    /**
     * Render Multi-Tiered Precision Horseshoe Gauge
     */
    renderPrecisionGauge(ctx) {
        const appearAlpha = Math.min(1, Math.max(0, (this.y + 120) / 180)) * this.gaugeAlpha;
        if (appearAlpha <= 0) return;

        ctx.save();
        ctx.globalAlpha = appearAlpha;

        const s = this.scale;
        const cx = this.x;
        const cy = this.y + (8 * s);

        const rOuter = 108 * s;
        const rInner = 88 * s;
        const rMiddle = (rOuter + rInner) / 2;
        const rScaleRing = 118 * s;

        const startAngle = Math.PI * 0.75;
        const totalAngleSpan = Math.PI * 1.5;
        const endAngle = startAngle + totalAngleSpan;

        const numTicks = 32;
        const currentFilledTicks = Math.floor(this.descentProgress * numTicks);
        const currentTipAngle = startAngle + (this.descentProgress * totalAngleSpan);

        // LAYER 1: OUTER SCALE RING
        ctx.strokeStyle = '#c4c9d6';
        ctx.lineWidth = 1.0;
        ctx.beginPath();
        ctx.arc(cx, cy, rScaleRing, startAngle, endAngle);
        ctx.stroke();

        const numScaleTicks = 48;
        ctx.font = `600 ${Math.round(8.5 * s)}px 'Space Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        for (let i = 0; i <= numScaleTicks; i++) {
            const tickAngle = startAngle + (i / numScaleTicks) * totalAngleSpan;
            const isMajor = (i % 8 === 0);
            const tickLen = isMajor ? 6 * s : 3 * s;

            const tInnerX = cx + Math.cos(tickAngle) * rScaleRing;
            const tInnerY = cy + Math.sin(tickAngle) * rScaleRing;
            const tOuterX = cx + Math.cos(tickAngle) * (rScaleRing + tickLen);
            const tOuterY = cy + Math.sin(tickAngle) * (rScaleRing + tickLen);

            ctx.strokeStyle = isMajor ? '#788094' : '#b4bac8';
            ctx.lineWidth = isMajor ? 1.4 : 0.8;
            ctx.beginPath();
            ctx.moveTo(tInnerX, tInnerY);
            ctx.lineTo(tOuterX, tOuterY);
            ctx.stroke();

            if (isMajor && !this.isMobile) {
                const hexVal = Math.floor((i / numScaleTicks) * 255).toString(16).padStart(2, '0').toUpperCase();
                const textR = rScaleRing + (14 * s);
                const textX = cx + Math.cos(tickAngle) * textR;
                const textY = cy + Math.sin(tickAngle) * textR;

                ctx.fillStyle = (i / numScaleTicks <= this.descentProgress) ? this.primaryColor : '#8e96a8';
                ctx.fillText(`0x${hexVal}`, textX, textY);
            }
        }

        // LAYER 2: SEGMENTED PROGRESS RIBBON
        ctx.save();
        ctx.shadowColor = 'rgba(20, 25, 40, 0.08)';
        ctx.shadowBlur = 10 * s;
        ctx.shadowOffsetY = 3 * s;

        ctx.lineWidth = 1.5;
        ctx.strokeStyle = this.trackBorder;
        ctx.beginPath();
        ctx.arc(cx, cy, rOuter, startAngle, endAngle);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, rInner, startAngle, endAngle);
        ctx.stroke();
        ctx.restore();

        const leftTopInner = { x: cx + Math.cos(startAngle) * rInner, y: cy + Math.sin(startAngle) * rInner };
        const leftTopOuter = { x: cx + Math.cos(startAngle) * rOuter, y: cy + Math.sin(startAngle) * rOuter };
        const rightTopInner = { x: cx + Math.cos(endAngle) * rInner, y: cy + Math.sin(endAngle) * rInner };
        const rightTopOuter = { x: cx + Math.cos(endAngle) * rOuter, y: cy + Math.sin(endAngle) * rOuter };

        ctx.beginPath();
        ctx.moveTo(leftTopInner.x, leftTopInner.y);
        ctx.lineTo(leftTopOuter.x, leftTopOuter.y);
        ctx.moveTo(rightTopInner.x, rightTopInner.y);
        ctx.lineTo(rightTopOuter.x, rightTopOuter.y);
        ctx.stroke();

        for (let i = 0; i < numTicks; i++) {
            const segStartAngle = startAngle + (i / numTicks) * totalAngleSpan;
            const segEndAngle = startAngle + ((i + 1) / numTicks) * totalAngleSpan;
            const isFilled = i < currentFilledTicks;

            if (isFilled) {
                const segRatio = i / numTicks;
                ctx.fillStyle = (segRatio > 0.8) ? '#ff3b68' : (segRatio > 0.4 ? this.primaryColor : '#b5173e');

                ctx.beginPath();
                ctx.arc(cx, cy, rOuter - 1, segStartAngle, segEndAngle);
                ctx.arc(cx, cy, rInner + 1, segEndAngle, segStartAngle, true);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1.4;
            } else {
                ctx.fillStyle = (i % 2 === 0) ? '#e6e9f2' : '#edf0f7';
                ctx.beginPath();
                ctx.arc(cx, cy, rOuter - 1, segStartAngle, segEndAngle);
                ctx.arc(cx, cy, rInner + 1, segEndAngle, segStartAngle, true);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = this.trackBorder;
                ctx.lineWidth = 1.0;
            }

            const tickAngle = segEndAngle;
            ctx.beginPath();
            ctx.moveTo(cx + Math.cos(tickAngle) * (rInner + 1), cy + Math.sin(tickAngle) * (rInner + 1));
            ctx.lineTo(cx + Math.cos(tickAngle) * (rOuter - 1), cy + Math.sin(tickAngle) * (rOuter - 1));
            ctx.stroke();
        }

        // LAYER 3: LEADING SPARK
        if (this.descentProgress > 0.01 && this.descentProgress < 0.999) {
            const cursorX = cx + Math.cos(currentTipAngle) * rMiddle;
            const cursorY = cy + Math.sin(currentTipAngle) * rMiddle;

            ctx.save();
            ctx.shadowColor = this.primaryColor;
            ctx.shadowBlur = 10 * s;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 3.2 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = this.primaryColor;
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.arc(cursorX, cursorY, 5.5 * s, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // LAYER 4: READOUT DIAL PILL
        const percent = Math.floor(this.descentProgress * 100);
        const percentY = cy + rOuter + (24 * s);

        ctx.font = `700 ${Math.round(12.5 * s)}px 'Space Mono', monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        const spinnerChar = this.spinnerFrames[this.spinnerIdx];
        const hexStatus = `0x${Math.floor(this.descentProgress * 255).toString(16).padStart(2, '0').toUpperCase()}`;
        const pillText = `[ ${spinnerChar} WEAVING ${percent.toString().padStart(2, '0')}% // ${hexStatus} ]`;
        const textWidth = ctx.measureText(pillText).width;

        ctx.save();
        ctx.shadowColor = 'rgba(20, 25, 40, 0.06)';
        ctx.shadowBlur = 8 * s;
        ctx.shadowOffsetY = 2 * s;

        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = this.trackBorder;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx - (textWidth / 2) - 12, percentY - 12, textWidth + 24, 24, 6);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        ctx.fillStyle = percent === 100 ? this.primaryColor : '#151620';
        ctx.fillText(pillText, cx, percentY);

        ctx.restore();
    }

    /**
     * Render trailing spark particles
     */
    renderParticles(ctx) {
        if (this.particles.length === 0) return;

        ctx.save();
        this.particles.forEach(p => {
            ctx.fillStyle = this.primaryColor;
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.restore();
    }

    /**
     * Render 8 articulate legs using continuous phase accumulator
     */
    renderLegs(ctx) {
        const s = this.scale;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        const rawRatio = Math.max(0, 1 - (this.descentProgress / 0.45));
        const smoothDescent = rawRatio * rawRatio * (3 - 2 * rawRatio);
        const flexAmp = this.state === 'locked' ? 0.8 : (1.8 + 2.2 * smoothDescent);

        this.legs.forEach((leg) => {
            const side = leg.side; // -1 for Left, +1 for Right
            const flex = Math.sin(this.legPhase + leg.phase) * flexAmp * leg.asym;

            const rootX = side * (5.5 * s);
            const rootY = (leg.rootY * s);

            const kneeX = (leg.kX * s) + (side * flex * 0.4);
            const kneeY = (leg.kY * s) - (flex * 0.7);

            const tibiaX = (leg.tX * s) + (side * flex * 0.6);
            const tibiaY = (leg.tY * s) + (flex * 0.5);

            const tipX = (leg.tipX * s) + (side * flex * 0.3);
            const tipY = (leg.tipY * s) + (flex * 0.8);

            // Leg Shadow
            ctx.save();
            ctx.strokeStyle = this.glowColor;
            ctx.lineWidth = 3.6 * s;
            ctx.beginPath();
            ctx.moveTo(rootX, rootY);
            ctx.lineTo(kneeX, kneeY);
            ctx.lineTo(tibiaX, tibiaY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();
            ctx.restore();

            // Leg Core
            ctx.strokeStyle = this.bodyColor;
            ctx.lineWidth = 1.8 * s;
            ctx.beginPath();
            ctx.moveTo(rootX, rootY);
            ctx.lineTo(kneeX, kneeY);
            ctx.lineTo(tibiaX, tibiaY);
            ctx.lineTo(tipX, tipY);
            ctx.stroke();

            // Joints
            ctx.fillStyle = this.primaryColor;
            ctx.beginPath();
            ctx.arc(kneeX, kneeY, 1.8 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.beginPath();
            ctx.arc(tibiaX, tibiaY, 1.5 * s, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = this.bodyColor;
            ctx.beginPath();
            ctx.arc(tipX, tipY, 1.3 * s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    /**
     * Render two distinct body tagmata with exoskeleton ribs
     */
    renderBody(ctx) {
        const s = this.scale;

        // --- 1. ABDOMEN (Top / Rear tagma) ---
        const abdomenCenterY = -22 * s;
        const abdomenRadiusX = 14 * s;
        const abdomenRadiusY = 20 * s;

        ctx.save();
        ctx.shadowColor = 'rgba(20, 25, 40, 0.12)';
        ctx.shadowBlur = 12 * s;
        ctx.shadowOffsetY = 3 * s;

        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 2.4 * s;

        ctx.beginPath();
        ctx.ellipse(0, abdomenCenterY, abdomenRadiusX, abdomenRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Chitin Ribs
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
        ctx.lineWidth = 1.4 * s;
        [-14 * s, -6 * s, 2 * s].forEach(offsetY => {
            ctx.beginPath();
            ctx.arc(0, abdomenCenterY + offsetY, 10 * s, Math.PI * 0.15, Math.PI * 0.85);
            ctx.stroke();
        });
        ctx.restore();

        // Glowing Spider Hourglass Emblem
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.moveTo(-5 * s, abdomenCenterY - 9 * s);
        ctx.lineTo(5 * s, abdomenCenterY - 9 * s);
        ctx.lineTo(0, abdomenCenterY - 2 * s);
        ctx.lineTo(-5 * s, abdomenCenterY + 6 * s);
        ctx.lineTo(5 * s, abdomenCenterY + 6 * s);
        ctx.lineTo(0, abdomenCenterY - 2 * s);
        ctx.closePath();
        ctx.fill();

        // --- 2. PEDICEL ---
        ctx.save();
        ctx.fillStyle = '#2a2c38';
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 1.4 * s;
        ctx.beginPath();
        ctx.rect(-2.5 * s, -4 * s, 5 * s, 6 * s);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // --- 3. CEPHALOTHORAX ---
        const cephCenterY = 7 * s;
        const cephRadiusX = 8.5 * s;
        const cephRadiusY = 10.5 * s;

        ctx.save();
        ctx.fillStyle = this.bodyColor;
        ctx.strokeStyle = '#5a6070';
        ctx.lineWidth = 2.0 * s;

        ctx.beginPath();
        ctx.ellipse(0, cephCenterY, cephRadiusX, cephRadiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    /**
     * Render glowing spider eyes and pedipalps
     */
    renderHeadDetails(ctx) {
        const s = this.scale;
        const headTipY = 14 * s;

        // Pedipalps
        ctx.save();
        ctx.strokeStyle = this.primaryColor;
        ctx.lineWidth = 1.8 * s;
        ctx.beginPath();
        ctx.moveTo(-3 * s, headTipY);
        ctx.lineTo(-5 * s, headTipY + 6 * s);
        ctx.lineTo(-3 * s, headTipY + 9 * s);
        ctx.moveTo(3 * s, headTipY);
        ctx.lineTo(5 * s, headTipY + 6 * s);
        ctx.lineTo(3 * s, headTipY + 9 * s);
        ctx.stroke();
        ctx.restore();

        // Eyes
        const eyeCenterY = 11 * s;
        const eyePulse = 0.9 + Math.sin(this.legPhase * 1.5) * 0.1;

        const eyeSpacing1 = 3.5 * s;
        const eyeRadius1 = 2.4 * s;

        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = this.primaryColor;
        ctx.shadowBlur = 6 * s * eyePulse;

        ctx.beginPath();
        ctx.arc(-eyeSpacing1, eyeCenterY, eyeRadius1, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeSpacing1, eyeCenterY, eyeRadius1, 0, Math.PI * 2);
        ctx.fill();

        const eyeSpacing2 = 6.8 * s;
        const eyeRadius2 = 1.4 * s;
        ctx.fillStyle = this.primaryColor;

        ctx.beginPath();
        ctx.arc(-eyeSpacing2, eyeCenterY - 2 * s, eyeRadius2, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(eyeSpacing2, eyeCenterY - 2 * s, eyeRadius2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

// Attach to window object
window.ProceduralSpider = ProceduralSpider;
