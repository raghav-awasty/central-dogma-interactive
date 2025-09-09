/**
 * Central Dogma Interactive - Visualization Engine
 * Handles SVG-based rendering of DNA, RNA, and protein sequences
 */

class VisualizationEngine {
    constructor() {
        this.canvas = null;
        this.currentSequence = '';
        this.geneticData = null;
        this.animationId = null;
        this.tooltip = null;
        this.zoomLevel = 1;
        this.panOffset = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        
        // Visual configuration
        this.config = {
            nucleotideWidth: 30,
            nucleotideHeight: 40,
            spacing: 5,
            fontSize: 12,
            maxZoom: 3,
            minZoom: 0.5,
            colors: {
                A: '#ff6b6b',
                T: '#4ecdc4', 
                G: '#45b7d1',
                C: '#f9ca24',
                U: '#6c5ce7'
            },
            // Enhanced animation settings
            animation: {
                polymeraseSpeed: 2000,
                ribosomeSpeed: 3000,
                nucleotideReveal: 150,
                aminoAcidDelay: 200
            }
        };
        
        // Initialize tooltip
        this.initializeTooltip();
    }

    initializeTooltip() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'visualization-tooltip';
        this.tooltip.style.cssText = `
            position: absolute;
            background: rgba(44, 62, 80, 0.95);
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 12px;
            font-family: 'Segoe UI', sans-serif;
            pointer-events: none;
            z-index: 1000;
            opacity: 0;
            transition: opacity 0.3s ease;
            max-width: 200px;
            line-height: 1.4;
        `;
        document.body.appendChild(this.tooltip);
    }

    initialize(sequence, geneticData) {
        this.currentSequence = sequence;
        this.geneticData = geneticData;
        this.canvas = document.getElementById('simulation-canvas');
        
        if (this.canvas) {
            this.setupCanvas();
            this.setupInteractivity();
            this.renderInitialState();
        }
    }

    setupCanvas() {
        // Clear existing content
        while (this.canvas.firstChild) {
            this.canvas.removeChild(this.canvas.firstChild);
        }
        
        // Create main group for zoom/pan transforms
        this.mainGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.mainGroup.setAttribute('id', 'main-visualization-group');
        this.canvas.appendChild(this.mainGroup);
        
        // Add background
        const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        background.setAttribute('width', '100%');
        background.setAttribute('height', '100%');
        background.setAttribute('fill', '#f8f9fa');
        background.setAttribute('stroke', '#e9ecef');
        background.setAttribute('stroke-width', '2');
        this.mainGroup.appendChild(background);
        
        // Add zone labels
        this.addZoneLabels();
        
        // Add legend
        this.createLegend();
    }

    setupInteractivity() {
        // Mouse events for zoom and pan
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e), { passive: false });
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        
        // Touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
    }

    addZoneLabels() {
        // Transcription zone background
        const transcriptionZone = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        transcriptionZone.setAttribute('x', '20');
        transcriptionZone.setAttribute('y', '60');
        transcriptionZone.setAttribute('width', '950');
        transcriptionZone.setAttribute('height', '200');
        transcriptionZone.setAttribute('fill', '#ebf3fd');
        transcriptionZone.setAttribute('stroke', '#3498db');
        transcriptionZone.setAttribute('stroke-width', '1');
        transcriptionZone.setAttribute('stroke-dasharray', '5,5');
        transcriptionZone.setAttribute('opacity', '0.3');
        this.mainGroup.appendChild(transcriptionZone);
        
        // Translation zone background
        const translationZone = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        translationZone.setAttribute('x', '20');
        translationZone.setAttribute('y', '320');
        translationZone.setAttribute('width', '950');
        translationZone.setAttribute('height', '250');
        translationZone.setAttribute('fill', '#f0f9f0');
        translationZone.setAttribute('stroke', '#2ecc71');
        translationZone.setAttribute('stroke-width', '1');
        translationZone.setAttribute('stroke-dasharray', '5,5');
        translationZone.setAttribute('opacity', '0.3');
        this.mainGroup.appendChild(translationZone);
        
        // Transcription zone label
        const transcriptionLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        transcriptionLabel.setAttribute('x', '30');
        transcriptionLabel.setAttribute('y', '40');
        transcriptionLabel.setAttribute('class', 'zone-label');
        transcriptionLabel.setAttribute('font-weight', 'bold');
        transcriptionLabel.textContent = '🧬 Transcription (Nucleus)';
        this.mainGroup.appendChild(transcriptionLabel);
        
        // Translation zone label
        const translationLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        translationLabel.setAttribute('x', '30');
        translationLabel.setAttribute('y', '310');
        translationLabel.setAttribute('class', 'zone-label');
        translationLabel.setAttribute('font-weight', 'bold');
        translationLabel.textContent = '🧪 Translation (Cytoplasm)';
        this.mainGroup.appendChild(translationLabel);
    }

    createLegend() {
        // Legend container
        const legendGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        legendGroup.setAttribute('id', 'nucleotide-legend');
        legendGroup.setAttribute('transform', 'translate(800, 20)');
        
        // Legend background
        const legendBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        legendBg.setAttribute('x', '0');
        legendBg.setAttribute('y', '0');
        legendBg.setAttribute('width', '160');
        legendBg.setAttribute('height', '140');
        legendBg.setAttribute('fill', 'white');
        legendBg.setAttribute('stroke', '#bdc3c7');
        legendBg.setAttribute('stroke-width', '1');
        legendBg.setAttribute('rx', '8');
        legendGroup.appendChild(legendBg);
        
        // Legend title
        const legendTitle = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        legendTitle.setAttribute('x', '80');
        legendTitle.setAttribute('y', '20');
        legendTitle.setAttribute('text-anchor', 'middle');
        legendTitle.setAttribute('font-weight', 'bold');
        legendTitle.setAttribute('font-size', '12');
        legendTitle.textContent = 'Nucleotides';
        legendGroup.appendChild(legendTitle);
        
        // Legend items
        const nucleotides = [
            { base: 'A', name: 'Adenine', color: this.config.colors.A },
            { base: 'T', name: 'Thymine', color: this.config.colors.T },
            { base: 'G', name: 'Guanine', color: this.config.colors.G },
            { base: 'C', name: 'Cytosine', color: this.config.colors.C },
            { base: 'U', name: 'Uracil', color: this.config.colors.U }
        ];
        
        nucleotides.forEach((nucleotide, index) => {
            const y = 35 + (index * 20);
            
            // Color square
            const colorSquare = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            colorSquare.setAttribute('x', '10');
            colorSquare.setAttribute('y', y - 8);
            colorSquare.setAttribute('width', '16');
            colorSquare.setAttribute('height', '16');
            colorSquare.setAttribute('fill', nucleotide.color);
            colorSquare.setAttribute('stroke', '#2c3e50');
            colorSquare.setAttribute('stroke-width', '1');
            colorSquare.setAttribute('rx', '2');
            legendGroup.appendChild(colorSquare);
            
            // Nucleotide letter
            const letter = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            letter.setAttribute('x', '18');
            letter.setAttribute('y', y + 2);
            letter.setAttribute('text-anchor', 'middle');
            letter.setAttribute('font-weight', 'bold');
            letter.setAttribute('font-size', '10');
            letter.setAttribute('fill', 'white');
            letter.textContent = nucleotide.base;
            legendGroup.appendChild(letter);
            
            // Nucleotide name
            const name = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            name.setAttribute('x', '35');
            name.setAttribute('y', y + 2);
            name.setAttribute('font-size', '10');
            name.setAttribute('fill', '#2c3e50');
            name.textContent = `${nucleotide.base} - ${nucleotide.name}`;
            legendGroup.appendChild(name);
        });
        
        this.mainGroup.appendChild(legendGroup);
    }

    renderInitialState() {
        // Render DNA sequence in transcription area
        this.renderDnaSequence(this.currentSequence, 70, 80);
    }

    // Interaction handlers
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom(delta, e.offsetX, e.offsetY);
    }

    handleMouseDown(e) {
        if (e.button === 0) { // Left mouse button
            this.isDragging = true;
            this.dragStart = { x: e.offsetX, y: e.offsetY };
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        if (this.isDragging) {
            const deltaX = e.offsetX - this.dragStart.x;
            const deltaY = e.offsetY - this.dragStart.y;
            this.pan(deltaX, deltaY);
            this.dragStart = { x: e.offsetX, y: e.offsetY };
        } else {
            // Handle hover for tooltips
            this.handleHover(e);
        }
    }

    handleMouseUp(e) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
    }

    handleMouseLeave(e) {
        this.isDragging = false;
        this.canvas.style.cursor = 'default';
        this.hideTooltip();
    }

    handleTouchStart(e) {
        e.preventDefault();
        if (e.touches.length === 1) {
            this.isDragging = true;
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            this.dragStart = { 
                x: touch.clientX - rect.left, 
                y: touch.clientY - rect.top 
            };
        }
    }

    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging) {
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const currentPos = { 
                x: touch.clientX - rect.left, 
                y: touch.clientY - rect.top 
            };
            const deltaX = currentPos.x - this.dragStart.x;
            const deltaY = currentPos.y - this.dragStart.y;
            this.pan(deltaX, deltaY);
            this.dragStart = currentPos;
        }
    }

    handleTouchEnd(e) {
        this.isDragging = false;
    }

    zoom(factor, centerX, centerY) {
        const newZoom = Math.max(this.config.minZoom, 
                       Math.min(this.config.maxZoom, this.zoomLevel * factor));
        
        if (newZoom !== this.zoomLevel) {
            // Adjust pan to zoom towards cursor
            const zoomRatio = newZoom / this.zoomLevel;
            this.panOffset.x = centerX - zoomRatio * (centerX - this.panOffset.x);
            this.panOffset.y = centerY - zoomRatio * (centerY - this.panOffset.y);
            
            this.zoomLevel = newZoom;
            this.updateTransform();
        }
    }

    pan(deltaX, deltaY) {
        this.panOffset.x += deltaX;
        this.panOffset.y += deltaY;
        this.updateTransform();
    }

    updateTransform() {
        if (this.mainGroup) {
            this.mainGroup.setAttribute('transform', 
                `translate(${this.panOffset.x}, ${this.panOffset.y}) scale(${this.zoomLevel})`);
        }
    }

    handleHover(e) {
        // Find element under cursor
        const element = document.elementFromPoint(e.clientX, e.clientY);
        
        if (element && element.classList.contains('nucleotide-rect')) {
            const nucleotide = element.dataset.nucleotide;
            const position = element.dataset.position;
            const type = element.dataset.type || 'DNA';
            
            this.showTooltip(e.clientX, e.clientY, {
                nucleotide,
                position,
                type
            });
        } else if (element && element.classList.contains('amino-acid-circle')) {
            const aminoAcid = element.dataset.aminoAcid;
            const codon = element.dataset.codon;
            
            this.showTooltip(e.clientX, e.clientY, {
                aminoAcid,
                codon,
                type: 'Protein'
            });
        } else {
            this.hideTooltip();
        }
    }

    showTooltip(x, y, data) {
        if (!this.tooltip) return;
        
        let content = '';
        if (data.type === 'DNA' || data.type === 'RNA') {
            const fullName = {
                'A': 'Adenine',
                'T': 'Thymine', 
                'G': 'Guanine',
                'C': 'Cytosine',
                'U': 'Uracil'
            }[data.nucleotide];
            
            content = `<strong>${data.type} Nucleotide</strong><br>
                      ${data.nucleotide} - ${fullName}<br>
                      Position: ${data.position}`;
        } else if (data.type === 'Protein') {
            content = `<strong>Amino Acid</strong><br>
                      ${data.aminoAcid}<br>
                      Codon: ${data.codon}`;
        }
        
        this.tooltip.innerHTML = content;
        this.tooltip.style.left = (x + 10) + 'px';
        this.tooltip.style.top = (y - 10) + 'px';
        this.tooltip.style.opacity = '1';
    }

    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.style.opacity = '0';
        }
    }

    renderDnaSequence(sequence, startX, startY) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', 'dna-sequence');
        
        for (let i = 0; i < sequence.length; i++) {
            const nucleotide = sequence[i];
            const x = startX + (i * (this.config.nucleotideWidth + this.config.spacing));
            
            // Create nucleotide rectangle with enhanced interactivity
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', startY);
            rect.setAttribute('width', this.config.nucleotideWidth);
            rect.setAttribute('height', this.config.nucleotideHeight);
            rect.setAttribute('fill', this.config.colors[nucleotide]);
            rect.setAttribute('stroke', '#2c3e50');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('rx', '3'); // Rounded corners
            rect.setAttribute('class', `nucleotide-${nucleotide.toLowerCase()} nucleotide-rect`);
            rect.setAttribute('data-nucleotide', nucleotide);
            rect.setAttribute('data-position', i + 1);
            rect.setAttribute('data-type', 'DNA');
            rect.style.cursor = 'pointer';
            rect.style.transition = 'all 0.2s ease';
            
            // Add hover effects
            rect.addEventListener('mouseenter', (e) => {
                e.target.setAttribute('stroke-width', '2');
                e.target.style.filter = 'brightness(1.1)';
            });
            
            rect.addEventListener('mouseleave', (e) => {
                if (!e.target.classList.contains('highlighted')) {
                    e.target.setAttribute('stroke-width', '1');
                    e.target.style.filter = 'none';
                }
            });
            
            // Create nucleotide text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + this.config.nucleotideWidth / 2);
            text.setAttribute('y', startY + this.config.nucleotideHeight / 2);
            text.setAttribute('class', 'nucleotide-text');
            text.setAttribute('pointer-events', 'none'); // Allow clicks to pass through
            text.textContent = nucleotide;
            
            group.appendChild(rect);
            group.appendChild(text);
        }
        
        this.mainGroup.appendChild(group);
        return group;
    }

    renderRnaSequence(sequence, startX, startY) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', 'rna-sequence');
        
        for (let i = 0; i < sequence.length; i++) {
            const nucleotide = sequence[i];
            const x = startX + (i * (this.config.nucleotideWidth + this.config.spacing));
            
            // Create nucleotide rectangle
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x);
            rect.setAttribute('y', startY);
            rect.setAttribute('width', this.config.nucleotideWidth);
            rect.setAttribute('height', this.config.nucleotideHeight);
            rect.setAttribute('fill', this.config.colors[nucleotide]);
            rect.setAttribute('stroke', '#2c3e50');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('class', `nucleotide-${nucleotide.toLowerCase()}`);
            
            // Create nucleotide text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + this.config.nucleotideWidth / 2);
            text.setAttribute('y', startY + this.config.nucleotideHeight / 2);
            text.setAttribute('class', 'nucleotide-text');
            text.textContent = nucleotide;
            
            group.appendChild(rect);
            group.appendChild(text);
        }
        
        this.canvas.appendChild(group);
        return group;
    }

    renderProteinSequence(protein, startX, startY) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('id', 'protein-sequence');
        
        for (let i = 0; i < protein.length; i++) {
            const aminoAcid = protein[i];
            const x = startX + (i * (this.config.nucleotideWidth * 1.5 + this.config.spacing));
            
            // Get color based on amino acid category
            let color = '#95a5a6'; // default nonpolar
            if (this.geneticData && this.geneticData.amino_acid_properties[aminoAcid.category]) {
                color = this.geneticData.amino_acid_properties[aminoAcid.category].color;
            }
            
            // Create amino acid circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x + this.config.nucleotideWidth * 0.75);
            circle.setAttribute('cy', startY + this.config.nucleotideHeight / 2);
            circle.setAttribute('r', this.config.nucleotideWidth * 0.6);
            circle.setAttribute('fill', color);
            circle.setAttribute('stroke', '#2c3e50');
            circle.setAttribute('stroke-width', '2');
            
            // Create amino acid text
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x + this.config.nucleotideWidth * 0.75);
            text.setAttribute('y', startY + this.config.nucleotideHeight / 2);
            text.setAttribute('class', 'nucleotide-text');
            text.setAttribute('font-size', '10');
            text.textContent = aminoAcid.symbol;
            
            group.appendChild(circle);
            group.appendChild(text);
        }
        
        this.canvas.appendChild(group);
        return group;
    }

    animateRnaPolymerase(callback) {
        // Create RNA polymerase enzyme
        const polymerase = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        polymerase.setAttribute('id', 'rna-polymerase');
        polymerase.setAttribute('cx', '50');
        polymerase.setAttribute('cy', '100');
        polymerase.setAttribute('rx', '15');
        polymerase.setAttribute('ry', '10');
        polymerase.setAttribute('fill', '#e74c3c');
        polymerase.setAttribute('stroke', '#c0392b');
        polymerase.setAttribute('stroke-width', '2');
        
        this.canvas.appendChild(polymerase);
        
        // Animate movement along DNA
        const duration = 3000 / window.centralDogmaApp.simulation.speed;
        const endX = 70 + (this.currentSequence.length * (this.config.nucleotideWidth + this.config.spacing));
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = 50 + (endX - 50) * progress;
            polymerase.setAttribute('cx', currentX);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                // Animation complete
                this.canvas.removeChild(polymerase);
                if (callback) callback();
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    animateRibosome(callback) {
        // Create ribosome
        const ribosome = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ribosome.setAttribute('id', 'ribosome');
        
        // Large subunit
        const largeSubunit = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        largeSubunit.setAttribute('cx', '50');
        largeSubunit.setAttribute('cy', '390');
        largeSubunit.setAttribute('rx', '20');
        largeSubunit.setAttribute('ry', '12');
        largeSubunit.setAttribute('fill', '#3498db');
        largeSubunit.setAttribute('stroke', '#2980b9');
        largeSubunit.setAttribute('stroke-width', '2');
        
        // Small subunit
        const smallSubunit = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        smallSubunit.setAttribute('cx', '50');
        smallSubunit.setAttribute('cy', '405');
        smallSubunit.setAttribute('rx', '15');
        smallSubunit.setAttribute('ry', '8');
        smallSubunit.setAttribute('fill', '#5dade2');
        smallSubunit.setAttribute('stroke', '#2980b9');
        smallSubunit.setAttribute('stroke-width', '2');
        
        ribosome.appendChild(largeSubunit);
        ribosome.appendChild(smallSubunit);
        this.canvas.appendChild(ribosome);
        
        // Animate movement along mRNA
        const duration = 4000 / window.centralDogmaApp.simulation.speed;
        const endX = 70 + (this.currentSequence.length * (this.config.nucleotideWidth + this.config.spacing));
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const currentX = 50 + (endX - 50) * progress;
            largeSubunit.setAttribute('cx', currentX);
            smallSubunit.setAttribute('cx', currentX);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                // Animation complete
                this.canvas.removeChild(ribosome);
                if (callback) callback();
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }

    reset() {
        // Cancel any ongoing animations
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Reset canvas
        if (this.canvas) {
            this.setupCanvas();
            if (this.currentSequence) {
                this.renderInitialState();
            }
        }
    }

    // Helper method to convert screen coordinates to sequence position
    getSequencePositionFromCoordinates(x, y) {
        const relativeX = x - 70; // Subtract start offset
        const position = Math.floor(relativeX / (this.config.nucleotideWidth + this.config.spacing));
        return Math.max(0, Math.min(position, this.currentSequence.length - 1));
    }
}

// Make available globally
window.VisualizationEngine = new VisualizationEngine();
