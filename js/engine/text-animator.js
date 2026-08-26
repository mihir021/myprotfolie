/**
 * ============================================================================
 * TEXT-ANIMATOR.JS - ERTDFGCVB-INSPIRED ASCII GLYPH SCRAMBLE & DECODER
 * ============================================================================
 * Provides real-time character cycling, matrix decode sequences,
 * and ASCII progress bar formatters with sub-frame timing control.
 */

class TextAnimator {
    /**
     * Initializes the Text Animator
     */
    constructor() {
        // Character set used for scrambling transitions
        this.glyphs = '01#@%&/\\[]{}<>*+=~-_:;.!?░▒▓';
        this.activeAnimations = new Map();
    }

    /**
     * Get a random glyph from the character pool
     * @returns {string} Single random character
     */
    getRandomGlyph() {
        const idx = Math.floor(Math.random() * this.glyphs.length);
        return this.glyphs[idx];
    }

    /**
     * Animate a DOM element's text content with an ertdfgcvb-style scramble decoder
     * @param {HTMLElement} element - Target DOM element
     * @param {string} targetText - The final decoded string
     * @param {number} duration - Duration in milliseconds (default: 600ms)
     * @param {Function} [onComplete] - Optional completion callback
     */
    scrambleTo(element, targetText, duration = 600, onComplete = null) {
        if (!element) return;

        // Cancel any active animation on this element
        if (this.activeAnimations.has(element)) {
            cancelAnimationFrame(this.activeAnimations.get(element));
            this.activeAnimations.delete(element);
        }

        const startTime = performance.now();
        const initialText = element.textContent || '';
        const targetLen = targetText.length;
        const maxLen = Math.max(initialText.length, targetLen);

        const updateFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);

            // Number of characters locked in place
            const lockedCharsCount = Math.floor(progress * targetLen);

            let output = '';
            for (let i = 0; i < maxLen; i++) {
                if (i < lockedCharsCount) {
                    // Character is resolved to target text
                    output += targetText[i] || '';
                } else if (i < targetLen) {
                    // Scrambling glyph phase
                    if (progress > 0.95 && Math.random() < 0.5) {
                        output += targetText[i];
                    } else {
                        output += this.getRandomGlyph();
                    }
                } else {
                    // Trailing extra characters fade out
                    if (Math.random() < 0.6) {
                        output += this.getRandomGlyph();
                    }
                }
            }

            element.textContent = output;

            if (progress < 1) {
                const animId = requestAnimationFrame(updateFrame);
                this.activeAnimations.set(element, animId);
            } else {
                element.textContent = targetText;
                this.activeAnimations.delete(element);
                if (onComplete) onComplete();
            }
        };

        const animId = requestAnimationFrame(updateFrame);
        this.activeAnimations.set(element, animId);
    }

    /**
     * Format a numerical percentage into an ASCII block progress bar
     * @param {number} percent - Percentage (0 to 100)
     * @param {number} totalBlocks - Length of the bar in blocks (default: 20)
     * @returns {string} ASCII formatted bar, e.g. "[▓▓▓▓▓▓░░░░░░░░░░░░░░]"
     */
    static formatAsciiProgressBar(percent, totalBlocks = 20) {
        const clampedPercent = Math.max(0, Math.min(100, percent));
        const filledCount = Math.round((clampedPercent / 100) * totalBlocks);
        const emptyCount = totalBlocks - filledCount;

        const filledBlocks = '▓'.repeat(filledCount);
        const emptyBlocks = '░'.repeat(emptyCount);

        return `[${filledBlocks}${emptyBlocks}]`;
    }
}

// Attach to window object
window.TextAnimator = TextAnimator;
window.formatAsciiProgressBar = TextAnimator.formatAsciiProgressBar;
