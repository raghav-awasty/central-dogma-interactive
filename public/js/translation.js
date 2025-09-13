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
        
        // Tooltip system
        this.tooltip = null;
        this.setupTooltipSystem();
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

    validateSequenceLength(sequence) {
        const maxNucleotides = 45;  // Maximum nucleotides that can fit comfortably (15 codons)
        const recommendedMax = 30;   // Recommended maximum for best visualization (10 codons)
        
        if (sequence.length > maxNucleotides) {
            return {
                isValid: false,
                message: `Sequence too long! Maximum ${maxNucleotides} nucleotides allowed. Your sequence: ${sequence.length} nucleotides.`,
                type: 'error'
            };
        }
        
        if (sequence.length > recommendedMax) {
            return {
                isValid: true,
                message: `Long sequence detected (${sequence.length} nucleotides). Animation may be cramped. Recommended: ${recommendedMax} nucleotides or less.`,
                type: 'warning'
            };
        }
        
        if (sequence.length % 3 !== 0) {
            return {
                isValid: true,
                message: `Sequence length (${sequence.length}) is not divisible by 3. Last incomplete codon will be ignored.`,
                type: 'info'
            };
        }
        
        return { isValid: true, type: 'success' };
    }

    setupTooltipSystem() {
        // Create tooltip element
        this.tooltip = document.createElement('div');
        this.tooltip.id = 'bio-tooltip';
        this.tooltip.style.cssText = `
            position: fixed;
            background: rgba(44, 62, 80, 0.85);
            color: white;
            padding: 10px 12px;
            border-radius: 6px;
            font-family: Arial, sans-serif;
            font-size: 13px;
            max-width: 280px;
            z-index: 1000;
            pointer-events: none;
            opacity: 0;
            transform: translateY(-8px);
            transition: opacity 0.2s ease, transform 0.2s ease;
            border: 1px solid rgba(52, 152, 219, 0.6);
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            backdrop-filter: blur(2px);
        `;
        document.body.appendChild(this.tooltip);
    }

    showTooltip(content, event) {
        if (!this.tooltip) return;
        
        this.tooltip.innerHTML = content;
        
        // Use mouse position for more reliable positioning
        const x = event.clientX || event.pageX || 0;
        const y = event.clientY || event.pageY || 0;
        
        // Position tooltip with some offset to avoid covering the element
        this.tooltip.style.left = (x + 15) + 'px';
        this.tooltip.style.top = (y - 50) + 'px';
        this.tooltip.style.opacity = '1';
        this.tooltip.style.transform = 'translateY(0)';
    }

    hideTooltip() {
        if (!this.tooltip) return;
        
        this.tooltip.style.opacity = '0';
        this.tooltip.style.transform = 'translateY(-10px)';
    }

    getNucleotideInfo(nucleotide, position) {
        const info = {
            'A': {
                name: 'Adenine',
                type: 'Purine',
                pairs: 'Thymine (T) in DNA, Uracil (U) in RNA',
                structure: 'Double-ring structure'
            },
            'U': {
                name: 'Uracil',
                type: 'Pyrimidine',
                pairs: 'Adenine (A)',
                structure: 'Single-ring structure',
                note: 'Found in RNA instead of Thymine'
            },
            'G': {
                name: 'Guanine',
                type: 'Purine',
                pairs: 'Cytosine (C)',
                structure: 'Double-ring structure'
            },
            'C': {
                name: 'Cytosine',
                type: 'Pyrimidine',
                pairs: 'Guanine (G)',
                structure: 'Single-ring structure'
            }
        }[nucleotide];

        const codonIndex = Math.floor(position / 3);
        const positionInCodon = (position % 3) + 1;
        
        return `
            <strong>${info.name} (${nucleotide})</strong><br>
            <em>${info.type} base</em><br>
            Position: ${position + 1} (Codon ${codonIndex + 1}, Position ${positionInCodon})<br>
            Pairs with: ${info.pairs}<br>
            Structure: ${info.structure}
            ${info.note ? '<br><small>' + info.note + '</small>' : ''}
        `;
    }

    getRibosomeInfo() {
        return `
            <strong>Ribosome</strong><br>
            <em>Protein synthesis machinery</em><br>
            • Two subunits: Large (60S) and Small (40S)<br>
            • Reads mRNA codons 5' to 3' direction<br>
            • Catalyzes peptide bond formation<br>
            • Contains rRNA and ribosomal proteins<br>
            • Moves along mRNA during translation
        `;
    }

    getAminoAcidInfo(aminoAcid) {
        const info = {
            'Methionine': { abbr: 'Met', type: 'Nonpolar', property: 'Start amino acid, contains sulfur', essential: true },
            'Alanine': { abbr: 'Ala', type: 'Nonpolar', property: 'Simplest amino acid after glycine', essential: false },
            'Glutamine': { abbr: 'Gln', type: 'Polar', property: 'Amide group, important for protein folding', essential: false },
            'Phenylalanine': { abbr: 'Phe', type: 'Aromatic', property: 'Large benzene ring, hydrophobic', essential: true },
            'Leucine': { abbr: 'Leu', type: 'Nonpolar', property: 'Branched chain, very hydrophobic', essential: true },
            'Isoleucine': { abbr: 'Ile', type: 'Nonpolar', property: 'Branched chain, isomer of leucine', essential: true },
            'Valine': { abbr: 'Val', type: 'Nonpolar', property: 'Branched chain, smaller than Leu/Ile', essential: true },
            'Serine': { abbr: 'Ser', type: 'Polar', property: 'Hydroxyl group, can be phosphorylated', essential: false },
            'Proline': { abbr: 'Pro', type: 'Nonpolar', property: 'Cyclic structure, creates kinks in proteins', essential: false },
            'Threonine': { abbr: 'Thr', type: 'Polar', property: 'Hydroxyl group, can be phosphorylated', essential: true },
            'Tyrosine': { abbr: 'Tyr', type: 'Aromatic', property: 'Phenol group, can be phosphorylated', essential: false },
            'Histidine': { abbr: 'His', type: 'Basic', property: 'Imidazole ring, pH buffering', essential: true },
            'Asparagine': { abbr: 'Asn', type: 'Polar', property: 'Amide group, glycosylation sites', essential: false },
            'Lysine': { abbr: 'Lys', type: 'Basic', property: 'Positively charged, histone modification', essential: true },
            'Aspartic acid': { abbr: 'Asp', type: 'Acidic', property: 'Negatively charged, enzyme active sites', essential: false },
            'Glutamic acid': { abbr: 'Glu', type: 'Acidic', property: 'Negatively charged, neurotransmitter precursor', essential: false },
            'Cysteine': { abbr: 'Cys', type: 'Polar', property: 'Forms disulfide bonds, protein structure', essential: false },
            'Tryptophan': { abbr: 'Trp', type: 'Aromatic', property: 'Largest amino acid, serotonin precursor', essential: true },
            'Arginine': { abbr: 'Arg', type: 'Basic', property: 'Guanidinium group, very basic', essential: false },
            'Glycine': { abbr: 'Gly', type: 'Nonpolar', property: 'Smallest amino acid, flexible backbone', essential: false }
        }[aminoAcid] || { abbr: '?', type: 'Unknown', property: 'Information not available', essential: false };

        return `
            <strong>${aminoAcid} (${info.abbr})</strong><br>
            <em>${info.type} amino acid</em><br>
            Essential: ${info.essential ? 'Yes' : 'No'}<br>
            Property: ${info.property}
        `;
    }

    getCellMembraneInfo() {
        return `
            <strong>Cell Membrane</strong><br>
            <em>Phospholipid bilayer boundary</em><br>
            • Separates cell interior from environment<br>
            • Translation occurs in the cytoplasm inside<br>
            • Semi-permeable barrier<br>
            • Contains embedded proteins and channels<br>
            • Maintains cellular homeostasis
        `;
    }

    calculateLayout(sequenceLength) {
        const svgWidth = 1000;
        const availableWidth = svgWidth - 100; // Leave 50px margin on each side
        const maxNucleotideSpacing = 35;
        const minNucleotideSpacing = 15;
        const maxNucleotideSize = 30;
        const minNucleotideSize = 18;
        
        // Calculate optimal spacing based on sequence length
        let nucleotideSpacing = Math.max(
            minNucleotideSpacing,
            Math.min(maxNucleotideSpacing, availableWidth / sequenceLength)
        );
        
        // Calculate nucleotide size based on spacing
        let nucleotideSize = Math.max(
            minNucleotideSize,
            Math.min(maxNucleotideSize, nucleotideSpacing - 5)
        );
        
        // Calculate starting X position to center the sequence
        const totalSequenceWidth = (sequenceLength - 1) * nucleotideSpacing;
        const startX = (svgWidth - totalSequenceWidth) / 2;
        
        return {
            startX: Math.max(50, startX),
            mrnaY: 120,
            nucleotideSpacing: nucleotideSpacing,
            nucleotideSize: nucleotideSize,
            ribosomeY: 300,
            proteinY: 450
        };
    }

    async startTranslation(mrnaSequence, stepMode = false) {
        if (this.isAnimating) return;

        this.mrnaSequence = mrnaSequence.toUpperCase();
        
        // Validate sequence length and warn user
        const validationResult = this.validateSequenceLength(this.mrnaSequence);
        if (!validationResult.isValid) {
            if (this.educationalCallback) {
                this.educationalCallback('sequence:warning', validationResult);
            }
            return;
        }
        
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
        
        // Calculate dynamic layout based on sequence length
        this.layout = this.calculateLayout(this.mrnaSequence.length);
        
        // Title
        this.addText(50, 40, 'Translation: mRNA → Protein', 'font-family: Arial; font-size: 24px; font-weight: bold; fill: #2c3e50;');
        
        // Draw cell membrane as background
        this.drawCellMembrane();
        
        // Draw mRNA sequence as individual nucleotides in a line
        const startX = this.layout.startX;
        const startY = this.layout.mrnaY;
        const nucleotideSpacing = this.layout.nucleotideSpacing;
        
        for (let i = 0; i < this.mrnaSequence.length; i++) {
            const x = startX + i * nucleotideSpacing;
            const nucleotide = this.mrnaSequence[i];
            
            // Create nucleotide box with dynamic sizing and hover functionality
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - this.layout.nucleotideSize/2);
            rect.setAttribute('y', startY - this.layout.nucleotideSize/2);
            rect.setAttribute('width', this.layout.nucleotideSize);
            rect.setAttribute('height', this.layout.nucleotideSize);
            rect.setAttribute('rx', 6);
            rect.setAttribute('fill', this.getNucleotideColor(nucleotide));
            rect.setAttribute('stroke', '#333');
            rect.setAttribute('stroke-width', '2');
            rect.setAttribute('class', `nucleotide nucleotide-${i}`);
            rect.style.cursor = 'pointer';
            
            // Add hover events for educational tooltips (static, no scaling)
            rect.addEventListener('mouseenter', (e) => {
                clearTimeout(rect.hoverTimeout);
                rect.hoverTimeout = setTimeout(() => {
                    this.showTooltip(this.getNucleotideInfo(nucleotide, i), e);
                }, 50);
            });
            
            rect.addEventListener('mouseleave', () => {
                clearTimeout(rect.hoverTimeout);
                this.hideTooltip();
            });
            
            rect.addEventListener('mousemove', (e) => {
                if (this.tooltip && this.tooltip.style.opacity === '1') {
                    this.showTooltip(this.getNucleotideInfo(nucleotide, i), e);
                }
            });
            
            this.svg.appendChild(rect);
            
            // Add nucleotide letter
            this.addText(x, startY + 5, nucleotide, 'font-family: Arial; font-size: 16px; font-weight: bold; fill: white; text-anchor: middle;');
        }
        
        // Draw ribosome at the start position
        this.drawRibosome(startX, this.layout.ribosomeY);
        
        // Add labels
        this.addText(50, this.layout.mrnaY - 20, 'mRNA:', 'font-family: Arial; font-size: 16px; font-weight: bold; fill: #333;');
        this.addText(50, this.layout.proteinY, 'Protein:', 'font-family: Arial; font-size: 16px; font-weight: bold; fill: #333;');
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
        ribosomeGroup.style.cursor = 'pointer';
        
        // Add hover events for ribosome (static, no scaling)
        ribosomeGroup.addEventListener('mouseenter', (e) => {
            clearTimeout(ribosomeGroup.hoverTimeout);
            ribosomeGroup.hoverTimeout = setTimeout(() => {
                this.showTooltip(this.getRibosomeInfo(), e);
            }, 50);
        });
        
        ribosomeGroup.addEventListener('mouseleave', () => {
            clearTimeout(ribosomeGroup.hoverTimeout);
            this.hideTooltip();
        });
        
        ribosomeGroup.addEventListener('mousemove', (e) => {
            if (this.tooltip && this.tooltip.style.opacity === '1') {
                this.showTooltip(this.getRibosomeInfo(), e);
            }
        });
        
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
        
        // Highlight the 3 nucleotides of current codon using dynamic layout
        for (let i = 0; i < 3; i++) {
            const nucleotideIndex = codonIndex * 3 + i;
            if (nucleotideIndex >= this.mrnaSequence.length) continue;
            
            const x = this.layout.startX + nucleotideIndex * this.layout.nucleotideSpacing;
            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            const highlightPadding = Math.max(3, this.layout.nucleotideSize * 0.15);
            highlight.setAttribute('x', x - this.layout.nucleotideSize/2 - highlightPadding);
            highlight.setAttribute('y', this.layout.mrnaY - this.layout.nucleotideSize/2 - highlightPadding);
            highlight.setAttribute('width', this.layout.nucleotideSize + 2 * highlightPadding);
            highlight.setAttribute('height', this.layout.nucleotideSize + 2 * highlightPadding);
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
        // Calculate target position (center the ribosome over the codon) using dynamic layout
        const targetX = this.layout.startX + (codonIndex * 3 + 1.5) * this.layout.nucleotideSpacing;
        
        // Get current ribosome position
        const ribosomeGroup = this.svg.querySelector('#ribosome-group');
        let currentX = this.layout.startX; // default starting position
        
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
                this.drawRibosome(newX, this.layout.ribosomeY);
                await this.sleep(30);
            }
        }
        
        // Ensure final position is exact
        this.drawRibosome(targetX, this.layout.ribosomeY);
    }

    addAminoAcidToProtein(aminoAcid, index) {
        const proteinY = this.layout.proteinY + 20;
        const proteinSpacing = Math.min(50, Math.max(30, this.layout.nucleotideSpacing * 1.5));
        const x = this.layout.startX + index * proteinSpacing;
        
        // Create amino acid group with hover functionality
        const aminoGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        aminoGroup.setAttribute('class', 'amino-acid');
        aminoGroup.style.cursor = 'pointer';
        
        // Add hover events for amino acid (static, no scaling)
        aminoGroup.addEventListener('mouseenter', (e) => {
            clearTimeout(aminoGroup.hoverTimeout);
            aminoGroup.hoverTimeout = setTimeout(() => {
                this.showTooltip(this.getAminoAcidInfo(aminoAcid), e);
            }, 50);
        });
        
        aminoGroup.addEventListener('mouseleave', () => {
            clearTimeout(aminoGroup.hoverTimeout);
            this.hideTooltip();
        });
        
        aminoGroup.addEventListener('mousemove', (e) => {
            if (this.tooltip && this.tooltip.style.opacity === '1') {
                this.showTooltip(this.getAminoAcidInfo(aminoAcid), e);
            }
        });
        
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
            const prevX = this.layout.startX + (index - 1) * proteinSpacing;
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
