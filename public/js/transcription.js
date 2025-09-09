// Simple Transcription Engine
class TranscriptionEngine {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.isAnimating = false;
        this.isPaused = false;
        this.speed = 1200;
        this.currentStep = 0;
        this.dnaSequence = '';
        this.mrnaSequence = '';
        this.svg = null;
    }

    async initialize() {
        console.log('Transcription engine initialized');
        this.setupCanvas();
    }

    setupCanvas() {
        const container = document.getElementById(this.canvasId);
        container.innerHTML = '';
        
        // Create SVG canvas
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '300');
        this.svg.setAttribute('viewBox', '0 0 800 300');
        container.appendChild(this.svg);
    }

    async startTranscription(dnaSequence, stepMode = false) {
        if (this.isAnimating) return;
        
        this.dnaSequence = dnaSequence;
        this.mrnaSequence = this.transcribe(dnaSequence);
        this.isAnimating = true;
        this.isPaused = false;
        this.currentStep = 0;
        
        console.log('Starting transcription:', { dnaSequence, mrnaSequence: this.mrnaSequence });
        
        // Clear and setup
        this.svg.innerHTML = '';
        this.renderStaticElements();
        
        // Animate transcription
        await this.animateTranscription(stepMode);
    }

    transcribe(dna) {
        return dna.replace(/T/g, 'U');
    }

    renderStaticElements() {
        // DNA strand
        this.svg.innerHTML += `
            <text x="20" y="80" font-family="monospace" font-size="14" fill="#2196F3">DNA (Template):</text>
            <text x="20" y="120" font-family="monospace" font-size="14" fill="#4CAF50">mRNA:</text>
        `;
        
        // Draw DNA sequence
        for (let i = 0; i < this.dnaSequence.length; i++) {
            const x = 200 + i * 25;
            const nucleotide = this.dnaSequence[i];
            
            this.svg.innerHTML += `
                <rect x="${x-10}" y="65" width="20" height="20" fill="#E3F2FD" stroke="#2196F3" rx="3"/>
                <text x="${x}" y="78" text-anchor="middle" font-family="monospace" font-size="12" fill="#2196F3">${nucleotide}</text>
            `;
        }
    }

    async animateTranscription(stepMode) {
        for (let i = 0; i < this.mrnaSequence.length; i++) {
            if (!this.isAnimating) break;
            
            while (this.isPaused) {
                await this.sleep(100);
            }
            
            const x = 200 + i * 25;
            const nucleotide = this.mrnaSequence[i];
            
            // Add mRNA nucleotide
            this.svg.innerHTML += `
                <rect x="${x-10}" y="105" width="20" height="20" fill="#E8F5E8" stroke="#4CAF50" rx="3"/>
                <text x="${x}" y="118" text-anchor="middle" font-family="monospace" font-size="12" fill="#4CAF50">${nucleotide}</text>
            `;
            
            // RNA Polymerase indicator
            const polymerase = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            polymerase.setAttribute('cx', x + 12);
            polymerase.setAttribute('cy', '90');
            polymerase.setAttribute('r', '8');
            polymerase.setAttribute('fill', '#FF5722');
            polymerase.setAttribute('id', 'polymerase');
            
            // Remove old polymerase
            const oldPol = this.svg.querySelector('#polymerase');
            if (oldPol) oldPol.remove();
            
            this.svg.appendChild(polymerase);
            
            this.currentStep = i + 1;
            
            if (stepMode) {
                // Wait for user input in step mode
                await this.waitForStep();
            } else {
                await this.sleep(this.speed / this.mrnaSequence.length);
            }
        }
        
        // Remove polymerase when done
        const polymerase = this.svg.querySelector('#polymerase');
        if (polymerase) polymerase.remove();
        
        this.isAnimating = false;
        console.log('Transcription complete');
    }

    async waitForStep() {
        return new Promise(resolve => {
            const checkStep = () => {
                if (!this.isAnimating || this.currentStep < this.stepRequested) {
                    this.stepRequested = null;
                    resolve();
                } else {
                    setTimeout(checkStep, 100);
                }
            };
            checkStep();
        });
    }

    step() {
        this.stepRequested = this.currentStep + 1;
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    reset() {
        this.isAnimating = false;
        this.isPaused = false;
        this.currentStep = 0;
        if (this.svg) this.svg.innerHTML = '';
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
