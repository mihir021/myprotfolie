/**
 * ============================================================================
 * ASCII-GRID.JS - HIGH PERFORMANCE REALTIME ASCII CANVAS ENGINE (LIGHT MODE)
 * ============================================================================
 * Inspired by ertdfgcvb.xyz creative coding systems.
 * Renders an ambient mathematical grid with coordinate marks, crosshairs,
 * and subtle typography textures at 60 FPS in light mode.
 */

class AsciiGrid {
    /**
     * Initializes the ASCII Grid Renderer on the target HTML5 Canvas
     * @param {HTMLCanvasElement} canvas - Target canvas element
     * @param {Object} options - Grid configuration options
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Typography metrics
        this.fontFamily = options.fontFamily || "'Space Mono', 'JetBrains Mono', monospace";
        this.fontSize = options.fontSize || 13;
        this.charWidth = 0;
        this.charHeight = 0;

        // Grid dimensions
        this.cols = 0;
        this.rows = 0;

        // Character buffers
        this.buffer = [];
        this.time = 0;

        // Glyph sets for procedural background texture (ertdfgcvb style)
        this.bgGlyphs = ['·', '+', ':', '×', '▪', '.', '·'];

        // Mobile / Performance adaptation
        this.isMobile = window.innerWidth <= 768;
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);

        this.init();
    }

    /**
     * Set up canvas resolution and calculate grid metrics
     */
    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    /**
     * Handle window resize and recompute grid columns and rows
     */
    resize() {
        this.isMobile = window.innerWidth <= 768;
        this.fontSize = this.isMobile ? 11 : 13;
        
        // Always use full viewport dimensions so both door canvases share the full 100vw space
        const fullWidth = window.innerWidth;
        const fullHeight = window.innerHeight;

        this.canvas.width = fullWidth * this.dpr;
        this.canvas.height = fullHeight * this.dpr;
        this.canvas.style.width = `${fullWidth}px`;
        this.canvas.style.height = `${fullHeight}px`;

        this.ctx.scale(this.dpr, this.dpr);
        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textBaseline = 'top';

        // Measure monospace character dimensions
        const metrics = this.ctx.measureText('M');
        this.charWidth = metrics.width || (this.fontSize * 0.6);
        this.charHeight = this.fontSize * 1.35;

        // Calculate grid cols and rows for the full screen
        this.cols = Math.ceil(fullWidth / this.charWidth);
        this.rows = Math.ceil(fullHeight / this.charHeight);

        // Initialize 2D buffer
        this.buffer = [];
        for (let r = 0; r < this.rows; r++) {
            this.buffer[r] = [];
            for (let c = 0; c < this.cols; c++) {
                this.buffer[r][c] = { char: ' ', color: null };
            }
        }
    }

    /**
     * Clear buffer and reset all cells
     */
    clear() {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                this.buffer[r][c].char = ' ';
                this.buffer[r][c].color = null;
            }
        }
    }

    /**
     * Set a character and color at specific grid coordinates
     */
    setCell(c, r, char, color = null) {
        if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
            this.buffer[r][c].char = char;
            this.buffer[r][c].color = color;
        }
    }

    /**
     * Draw text string at specific grid coordinates
     */
    drawText(c, r, text, color = null) {
        for (let i = 0; i < text.length; i++) {
            this.setCell(c + i, r, text[i], color);
        }
    }

    /**
     * Update procedural background ambient ASCII noise, crosshairs, and coordinate stamps
     */
    updateBackground(deltaTime = 0.016) {
        this.time += deltaTime;

        const gridDotColor = 'rgba(100, 110, 130, 0.16)';
        const accentStampColor = 'rgba(217, 32, 76, 0.22)';
        const crosshairColor = 'rgba(80, 90, 115, 0.25)';

        // 1. Draw Subtle Mathematical Grid Points
        const stepX = this.isMobile ? 8 : 6;
        const stepY = this.isMobile ? 6 : 4;

        for (let r = 2; r < this.rows - 2; r += stepY) {
            for (let c = 2; c < this.cols - 2; c += stepX) {
                // Subtle sine oscillation
                const wave = Math.sin((c * 0.15) + (r * 0.1) + (this.time * 0.8));
                if (wave > 0.3) {
                    this.setCell(c, r, '+', crosshairColor);
                } else {
                    this.setCell(c, r, '·', gridDotColor);
                }
            }
        }

        // 2. Ambient ertdfgcvb-style Coordinate Hex Stamps in the Corners
        if (!this.isMobile && this.cols > 40 && this.rows > 20) {
            const timeHex = Math.floor((this.time * 30) % 255).toString(16).padStart(2, '0').toUpperCase();
            this.drawText(3, 2, `[0x${timeHex} // GRID_SYS]`, accentStampColor);
            this.drawText(this.cols - 18, 2, `[θ: 270° // ARC_V2]`, accentStampColor);
            this.drawText(3, this.rows - 3, `[LOC: ${this.cols}x${this.rows}]`, gridDotColor);
            this.drawText(this.cols - 20, this.rows - 3, `[60FPS :: SYNC_OK]`, gridDotColor);
        }
    }

    /**
     * Render the active character buffer to the HTML5 Canvas
     */
    render() {
        const width = this.canvas.width / this.dpr;
        const height = this.canvas.height / this.dpr;

        // Clear canvas frame
        this.ctx.clearRect(0, 0, width, height);

        this.ctx.font = `${this.fontSize}px ${this.fontFamily}`;
        this.ctx.textBaseline = 'top';

        const defaultColor = '#8890a0';

        // Batch render characters by color
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = this.buffer[r][c];
                if (cell.char !== ' ') {
                    this.ctx.fillStyle = cell.color || defaultColor;
                    this.ctx.fillText(cell.char, c * this.charWidth, r * this.charHeight);
                }
            }
        }
    }
}

// Attach to window object for modular script access
window.AsciiGrid = AsciiGrid;
