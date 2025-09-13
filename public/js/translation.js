/**
 * Translation Animation Engine - Original Version
 * Creates the polished visualization with mRNA nucleotides, ribosome, and protein chain
 */
class TranslationEngine {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.codonTable = {};
        this.aminoAcidProperties = {};
        this.svg = null;
        this.isAnimating = false;
        this.isPaused = false;
        this.speed = 1200;
        this.educationalCallback = null;
        
        // Animation state
        this.mrnaSequence = '';
        this.proteinChain = [];
        this.currentCodonIndex = 0;
        this.stepMode = false;
        this.waitingForStep = false;
    }

    async initialize(codonTable, aminoAcidProperties) {
        this.codonTable = codonTable;
        this.aminoAcidProperties = aminoAcidProperties;
        
        console.log('Translation engine initialized with codon table:', this.codonTable);
        console.log('Available codons:', Object.keys(this.codonTable));
        this.setupCanvas();
        return Promise.resolve();
    }

    setupCanvas() {
        const container = document.getElementById(this.canvasId);
        if (!container) {
            console.error(`Canvas container '${this.canvasId}' not found`);
            return;
        }
        
        container.innerHTML = '';
        
        // Create SVG with proper dimensions and styling
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', '600');
        this.svg.setAttribute('viewBox', '0 0 1000 600');
        this.svg.style.background = '#f8f9fa';
        this.svg.style.borderRadius = '8px';
        
        container.appendChild(this.svg);
    }

    setEducationalCallback(callback) {
        this.educationalCallback = callback;
    }

    async startTranslation(mrnaSequence, stepMode = false) {
        if (this.isAnimating) return;

        this.mrnaSequence = mrnaSequence.toUpperCase();
        this.stepMode = stepMode;
        this.isAnimating = true;
        this.isPaused = false;
        this.currentCodonIndex = 0;
        this.proteinChain = [];
        this.waitingForStep = false;
        
        console.log(`Starting translation: ${mrnaSequence}`);
        
        if (this.educationalCallback) {
            this.educationalCallback('translation:started', {
                sequence: this.mrnaSequence,
                startPosition: 0
            });
        }

        this.setupVisualization();
        await this.runAnimation();
    }

    setupVisualization() {
        this.svg.innerHTML = '';
        
        // Title
        this.addText(50, 40, 'Translation: mRNA → Protein', 'font-family: Arial; font-size: 24px; font-weight: bold; fill: #2c3e50;');
        
        // Draw cell membrane as background
        this.drawCellMembrane();
        
        // Draw mRNA sequence as individual nucleotides in a line
        const startX = 50;
        const startY = 120;
        
        for (let i = 0; i < this.mrnaSequence.length; i++) {
            const x = startX + i * 35;
            const nucleotide = this.mrnaSequence[i];
            
            // Create nucleotide box
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - 15);
            rect.setAttribute('y', startY - 15);
            rect.setAttribute('width', 30);
            rect.setAttribute('height', 30);
            rect.setAttribute('rx', 6);
            rect.setAttribute('fill', this.getNucleotideColor(nucleotide));
            rect.setAttribute('stroke', '#333');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('class', `nucleotide nucleotide-${i}`);
            this.svg.appendChild(rect);
            
            // Add nucleotide letter
            this.addText(x, startY + 5, nucleotide, 'font-family: Arial; font-size: 16px; font-weight: bold; fill: white; text-anchor: middle;');
        }
        
        // Draw ribosome (large brown ovals)
        this.drawRibosome(200, 300);
        
        // Add labels
        this.addText(50, 100, 'mRNA:', 'font-family: Arial; font-size: 16px; font-weight: bold; fill: #333;');
        this.addText(50, 450, 'Protein:', 'font-family: Arial; font-size: 16px; font-weight: bold; fill: #333;');
    }

    getNucleotideColor(nucleotide) {
        const colors = {
            'A': '#E57373',  // Red
            'U': '#64B5F6',  // Blue  
            'G': '#81C784',  // Green
            'C': '#FFB74D'   // Orange
        };
        return colors[nucleotide] || '#999';
    }

    drawRibosome(x, y) {
        // Remove old ribosome
        const oldRibosome = this.svg.querySelector('#ribosome-group');
        if (oldRibosome) oldRibosome.remove();
        
        const ribosomeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        ribosomeGroup.setAttribute('id', 'ribosome-group');
        
        // Large subunit (upper oval)
        const largeSubunit = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        largeSubunit.setAttribute('cx', x);
        largeSubunit.setAttribute('cy', y - 40);
        largeSubunit.setAttribute('rx', 80);
        largeSubunit.setAttribute('ry', 45);
        largeSubunit.setAttribute('fill', '#8D6E63');
        largeSubunit.setAttribute('stroke', '#5D4037');
        largeSubunit.setAttribute('stroke-width', '3');
        
        // Small subunit (lower oval)
        const smallSubunit = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        smallSubunit.setAttribute('cx', x);
        smallSubunit.setAttribute('cy', y + 40);
        smallSubunit.setAttribute('rx', 70);
        smallSubunit.setAttribute('ry', 35);
        smallSubunit.setAttribute('fill', '#6D4C41');
        smallSubunit.setAttribute('stroke', '#4E342E');
        smallSubunit.setAttribute('stroke-width', '3');
        
        ribosomeGroup.appendChild(largeSubunit);
        ribosomeGroup.appendChild(smallSubunit);
        this.svg.appendChild(ribosomeGroup);
    }

    drawCellMembrane() {
        // Create a subtle cell membrane representation as an oval outline
        const cellMembrane = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
        cellMembrane.setAttribute('cx', '500');  // Center x of SVG viewBox
        cellMembrane.setAttribute('cy', '320');  // Center y, slightly below middle
        cellMembrane.setAttribute('rx', '450');  // Horizontal radius
        cellMembrane.setAttribute('ry', '250');  // Vertical radius
        cellMembrane.setAttribute('fill', 'rgba(200, 230, 255, 0.1)');  // Very light blue fill
        cellMembrane.setAttribute('stroke', '#87CEEB');  // Sky blue outline
        cellMembrane.setAttribute('stroke-width', '2');
        cellMembrane.setAttribute('stroke-dasharray', '10,5');  // Dotted line pattern
        cellMembrane.setAttribute('opacity', '0.6');
        cellMembrane.setAttribute('class', 'cell-membrane');
        
        // Add behind all other elements
        this.svg.insertBefore(cellMembrane, this.svg.firstChild);
        
        // Add cell membrane label
        this.addText(50, 580, 'Cell Membrane', 'font-family: Arial; font-size: 12px; font-style: italic; fill: #87CEEB; opacity: 0.8;');
    }

    async runAnimation() {
        // Parse mRNA into codons
        const codons = [];
        for (let i = 0; i < this.mrnaSequence.length; i += 3) {
            const codon = this.mrnaSequence.substr(i, 3);
            if (codon.length === 3) {
                codons.push(codon);
            }
        }
        
        console.log(`Processing ${codons.length} codons:`, codons);
        
        for (let codonIndex = 0; codonIndex < codons.length; codonIndex++) {
            if (!this.isAnimating) {
                console.log('Animation stopped by user');
                break;
            }
            
            // Wait for pause/resume
            while (this.isPaused && this.isAnimating) {
                await this.sleep(100);
            }
            
            const codon = codons[codonIndex];
            let aminoAcid = null;
            
            // Handle both data structures - direct lookup and nested object
            if (typeof this.codonTable[codon] === 'string') {
                aminoAcid = this.codonTable[codon];
            } else if (this.codonTable[codon] && this.codonTable[codon].amino_acid) {
                aminoAcid = this.codonTable[codon].amino_acid;
                // Handle STOP codons
                if (aminoAcid === 'STOP') {
                    aminoAcid = 'Stop';
                }
            }
            
            console.log(`Processing codon ${codonIndex + 1}/${codons.length}: ${codon} → ${aminoAcid}`);
            
            if (!aminoAcid) {
                console.warn(`Unknown codon: ${codon}`, 'Available:', Object.keys(this.codonTable));
                continue;
            }
            
            try {
                console.log(`Step 1: Highlighting codon ${codonIndex}`);
                // Highlight current codon
                this.highlightCodon(codonIndex);
                
                console.log(`Step 2: Moving ribosome to codon ${codonIndex}`);
                // Move ribosome to current codon
                await this.moveRibosomeToCodon(codonIndex);
                
                if (aminoAcid === 'Stop') {
                    console.log(`Stop codon encountered: ${codon}`);
                    if (this.educationalCallback) {
                        this.educationalCallback('stop:encountered', {
                            stopCodon: codon,
                            proteinLength: this.proteinChain.length
                        });
                    }
                    break;
                }
                
                console.log(`Step 3: Adding amino acid ${aminoAcid} to protein chain`);
                // Add amino acid to protein chain
                this.addAminoAcidToProtein(aminoAcid, this.proteinChain.length);
                this.proteinChain.push(aminoAcid);
                
                if (this.educationalCallback) {
                    this.educationalCallback('codon:translated', {
                        codon: codon,
                        aminoAcid: aminoAcid,
                        proteinLength: this.proteinChain.length
                    });
                }
                
                this.currentCodonIndex = codonIndex + 1;
                
                console.log(`Step 4: Waiting for next iteration (stepMode: ${this.stepMode}, speed: ${this.speed}ms)`);
                
                if (this.stepMode) {
                    this.waitingForStep = true;
                    await this.waitForNextStep();
                } else {
                    await this.sleep(this.speed);
                }
                
                console.log(`Completed processing codon ${codonIndex}, moving to next`);
                
            } catch (error) {
                console.error(`Error processing codon ${codonIndex}:`, error);
                // Continue with next codon
            }
        }
        
        this.isAnimating = false;
        console.log('Animation complete');
        this.showCompletionMessage();
        
        if (this.educationalCallback) {
            this.educationalCallback('translation:complete', {
                sequence: this.proteinChain.join('-')
            });
        }
    }

    highlightCodon(codonIndex) {
        // Remove previous highlights
        const oldHighlights = this.svg.querySelectorAll('.codon-highlight');
        oldHighlights.forEach(h => h.remove());
        
        // Highlight the 3 nucleotides of current codon
        for (let i = 0; i < 3; i++) {
            const nucleotideIndex = codonIndex * 3 + i;
            if (nucleotideIndex >= this.mrnaSequence.length) continue;
            
            const x = 50 + nucleotideIndex * 35;
            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            highlight.setAttribute('x', x - 18);
            highlight.setAttribute('y', 120 - 18);
            highlight.setAttribute('width', 36);
            highlight.setAttribute('height', 36);
            highlight.setAttribute('rx', 8);
            highlight.setAttribute('fill', 'none');
            highlight.setAttribute('stroke', '#FFD700');
            highlight.setAttribute('stroke-width', '4');
            highlight.setAttribute('class', 'codon-highlight');
            highlight.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.6))';
            
            this.svg.appendChild(highlight);
        }
    }

    async moveRibosomeToCodon(codonIndex) {
        // Calculate target position (center the ribosome over the codon)
        const targetX = 50 + (codonIndex * 3 + 1.5) * 35;
        
        // Get current ribosome position
        const ribosomeGroup = this.svg.querySelector('#ribosome-group');
        let currentX = 200; // default starting position
        
        if (ribosomeGroup) {
            const largeSubunit = ribosomeGroup.querySelector('ellipse');
            if (largeSubunit) {
                currentX = parseFloat(largeSubunit.getAttribute('cx'));
            }
        }
        
        // Animate movement only if we need to move
        if (Math.abs(targetX - currentX) > 5) {
            const steps = 15;
            const stepSize = (targetX - currentX) / steps;
            
            for (let i = 0; i < steps; i++) {
                if (!this.isAnimating) break;
                
                const newX = currentX + stepSize * (i + 1);
                this.drawRibosome(newX, 300);
                await this.sleep(30);
            }
        }
        
        // Ensure final position is exact
        this.drawRibosome(targetX, 300);
    }

    addAminoAcidToProtein(aminoAcid, index) {
        const proteinY = 470;
        const x = 150 + index * 50;
        
        // Create amino acid group
        const aminoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        aminoGroup.setAttribute('class', 'amino-acid');
        
        // Amino acid circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', x);
        circle.setAttribute('cy', proteinY);
        circle.setAttribute('r', 22);
        circle.setAttribute('fill', this.getAminoAcidColor(aminoAcid));
        circle.setAttribute('stroke', '#333');
        circle.setAttribute('stroke-width', '3');
        circle.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))';
        
        // Amino acid label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', x);
        text.setAttribute('y', proteinY + 5);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('font-family', 'Arial');
        text.setAttribute('font-size', '12');
        text.setAttribute('font-weight', 'bold');
        text.setAttribute('fill', 'white');
        text.textContent = this.getAminoAcidAbbr(aminoAcid);
        
        aminoGroup.appendChild(circle);
        aminoGroup.appendChild(text);
        
        // Add connecting line to previous amino acid first (so it appears behind)
        if (index > 0) {
            const prevX = 150 + (index - 1) * 50;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', prevX + 22);
            line.setAttribute('y1', proteinY);
            line.setAttribute('x2', x - 22);
            line.setAttribute('y2', proteinY);
            line.setAttribute('stroke', '#8D6E63');
            line.setAttribute('stroke-width', '6');
            line.setAttribute('stroke-linecap', 'round');
            line.setAttribute('class', 'peptide-bond');
            
            this.svg.appendChild(line);
        }
        
        // Add amino acid on top of the line
        this.svg.appendChild(aminoGroup);
    }

    getAminoAcidColor(aminoAcid) {
        const colors = {
            'Methionine': '#4CAF50', 'Phenylalanine': '#FF9800', 'Leucine': '#2196F3',
            'Serine': '#9C27B0', 'Tyrosine': '#FF5722', 'Cysteine': '#607D8B',
            'Tryptophan': '#E91E63', 'Proline': '#795548', 'Histidine': '#009688',
            'Glutamine': '#FFC107', 'Arginine': '#3F51B5', 'Isoleucine': '#8BC34A',
            'Threonine': '#FF7043', 'Asparagine': '#BA68C8', 'Lysine': '#26A69A',
            'Valine': '#FFA726', 'Alanine': '#66BB6A', 'Aspartic Acid': '#EF5350',
            'Glutamic Acid': '#AB47BC', 'Glycine': '#42A5F5'
        };
        return colors[aminoAcid] || '#9E9E9E';
    }

    getAminoAcidAbbr(aminoAcid) {
        const abbrs = {
            'Methionine': 'MET', 'Phenylalanine': 'PHE', 'Leucine': 'LEU',
            'Serine': 'SER', 'Tyrosine': 'TYR', 'Cysteine': 'CYS',
            'Tryptophan': 'TRP', 'Proline': 'PRO', 'Histidine': 'HIS',
            'Glutamine': 'GLN', 'Arginine': 'ARG', 'Isoleucine': 'ILE',
            'Threonine': 'THR', 'Asparagine': 'ASN', 'Lysine': 'LYS',
            'Valine': 'VAL', 'Alanine': 'ALA', 'Aspartic Acid': 'ASP',
            'Glutamic Acid': 'GLU', 'Glycine': 'GLY',
            'Aspartate': 'ASP', 'Glutamate': 'GLU'
        };
        return abbrs[aminoAcid] || aminoAcid?.substring(0, 3).toUpperCase() || 'UNK';
    }

    showCompletionMessage() {
        // Add completion text
        this.addText(50, 550, `Translation complete! Protein has ${this.proteinChain.length} amino acids`, 
            'font-family: Arial; font-size: 16px; fill: #27ae60; font-weight: bold;');
        
        // Add completion summary box
        const summaryRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        summaryRect.setAttribute('x', 700);
        summaryRect.setAttribute('y', 200);
        summaryRect.setAttribute('width', 280);
        summaryRect.setAttribute('height', 180);
        summaryRect.setAttribute('rx', 12);
        summaryRect.setAttribute('fill', 'rgba(200, 255, 200, 0.9)');
        summaryRect.setAttribute('stroke', '#4CAF50');
        summaryRect.setAttribute('stroke-width', '2');
        this.svg.appendChild(summaryRect);
        
        // Add completion details
        this.addText(720, 230, 'Translation Complete!', 'font-family: Arial; font-size: 18px; font-weight: bold; fill: #2E7D32;');
        this.addText(720, 260, `Protein length: ${this.proteinChain.length} amino acids`, 'font-family: Arial; font-size: 14px; fill: #388E3C;');
        this.addText(720, 280, `mRNA length: ${this.mrnaSequence.length} nucleotides`, 'font-family: Arial; font-size: 14px; fill: #388E3C;');
        this.addText(720, 300, `Codons translated: ${this.proteinChain.length}`, 'font-family: Arial; font-size: 14px; fill: #388E3C;');
    }

    addText(x, y, text, style) {
        const textElement = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textElement.setAttribute('x', x);
        textElement.setAttribute('y', y);
        textElement.setAttribute('style', style);
        textElement.textContent = text;
        this.svg.appendChild(textElement);
        return textElement;
    }

    async waitForNextStep() {
        return new Promise((resolve) => {
            const checkStep = () => {
                if (!this.waitingForStep || !this.isAnimating) {
                    resolve();
                } else {
                    setTimeout(checkStep, 100);
                }
            };
            checkStep();
        });
    }

    step() {
        if (this.waitingForStep) {
            this.waitingForStep = false;
        }
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
        this.currentCodonIndex = 0;
        this.proteinChain = [];
        this.waitingForStep = false;
        
        if (this.svg) {
            this.svg.innerHTML = '';
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
