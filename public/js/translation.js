/**
 * Basic Translation Engine - First working version
 */
class TranslationEngine {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.codonTable = {};
        this.isAnimating = false;
        this.isPaused = false;
        this.speed = 1200;
        this.educationalCallback = null;
        this.canvas = null;
        this.ctx = null;
    }

    async initialize(codonTable, aminoAcidProperties) {
        this.codonTable = codonTable;
        console.log('Translation engine initialized');
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
        
        // Create canvas element
        this.canvas = document.createElement('canvas');
        this.canvas.width = 800;
        this.canvas.height = 400;
        this.canvas.style.border = '1px solid #ddd';
        this.canvas.style.borderRadius = '8px';
        this.canvas.style.background = '#fafafa';
        this.canvas.style.width = '100%';
        
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);
    }

    setEducationalCallback(callback) {
        this.educationalCallback = callback;
    }

    async startTranslation(mrnaSequence, stepMode = false) {
        if (this.isAnimating) return;

        this.mrnaSequence = mrnaSequence.toUpperCase();
        this.isAnimating = true;
        this.isPaused = false;
        
        console.log(`Starting translation: ${mrnaSequence}`);
        
        if (this.educationalCallback) {
            this.educationalCallback('translation:started', {
                sequence: this.mrnaSequence
            });
        }

        await this.runTranslation();
    }

    async runTranslation() {
        this.clearCanvas();
        
        // Draw title
        this.ctx.font = '18px Arial';
        this.ctx.fillStyle = '#333';
        this.ctx.fillText('Translation: mRNA → Protein', 20, 30);
        
        // Draw mRNA sequence
        this.drawMRNA();
        
        // Process codons
        const codons = [];
        for (let i = 0; i < this.mrnaSequence.length; i += 3) {
            const codon = this.mrnaSequence.substr(i, 3);
            if (codon.length === 3) {
                codons.push(codon);
            }
        }
        
        let proteinChain = [];
        let ribosomeX = 50;
        
        for (let i = 0; i < codons.length; i++) {
            if (!this.isAnimating) break;
            
            while (this.isPaused && this.isAnimating) {
                await this.sleep(100);
            }
            
            const codon = codons[i];
            const aminoAcid = this.codonTable[codon];
            
            if (!aminoAcid) continue;
            
            if (aminoAcid === 'Stop') {
                if (this.educationalCallback) {
                    this.educationalCallback('stop:encountered', {
                        stopCodon: codon,
                        proteinLength: proteinChain.length
                    });
                }
                break;
            }
            
            // Move ribosome
            ribosomeX = 50 + (i * 3 + 1.5) * 25;
            this.drawRibosome(ribosomeX, 150);
            
            // Add amino acid
            proteinChain.push(aminoAcid);
            this.drawProteinChain(proteinChain);
            
            if (this.educationalCallback) {
                this.educationalCallback('codon:translated', {
                    codon: codon,
                    aminoAcid: aminoAcid,
                    proteinLength: proteinChain.length
                });
            }
            
            await this.sleep(this.speed);
        }
        
        this.isAnimating = false;
        
        // Show completion
        this.ctx.font = '14px Arial';
        this.ctx.fillStyle = '#666';
        this.ctx.fillText(`Translation complete! Protein has ${proteinChain.length} amino acids`, 20, 60);
        
        if (this.educationalCallback) {
            this.educationalCallback('translation:complete', {
                sequence: proteinChain.join('-')
            });
        }
    }

    drawMRNA() {
        const y = 100;
        
        for (let i = 0; i < this.mrnaSequence.length; i++) {
            const x = 50 + i * 25;
            const nucleotide = this.mrnaSequence[i];
            
            // Draw nucleotide box
            this.ctx.fillStyle = this.getNucleotideColor(nucleotide);
            this.ctx.fillRect(x - 10, y - 12, 20, 24);
            
            // Draw border
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(x - 10, y - 12, 20, 24);
            
            // Draw letter
            this.ctx.font = '12px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(nucleotide, x, y + 4);
        }
    }

    getNucleotideColor(nucleotide) {
        const colors = {
            'A': '#E57373',
            'U': '#4FC3F7', 
            'G': '#81C784',
            'C': '#FFB74D'
        };
        return colors[nucleotide] || '#999';
    }

    drawRibosome(x, y) {
        // Clear old ribosome area
        this.ctx.clearRect(0, 120, 800, 80);
        
        // Redraw mRNA in that area
        this.drawMRNA();
        
        // Large subunit
        this.ctx.fillStyle = '#8D6E63';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - 20, 50, 30, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#5D4037';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Small subunit
        this.ctx.fillStyle = '#6D4C41';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 20, 40, 25, 0, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.strokeStyle = '#3E2723';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    drawProteinChain(proteinChain) {
        const y = 280;
        
        // Clear protein area
        this.ctx.clearRect(0, 260, 800, 60);
        
        for (let i = 0; i < proteinChain.length; i++) {
            const x = 50 + i * 40;
            const aminoAcid = proteinChain[i];
            
            // Draw connection line
            if (i > 0) {
                const prevX = 50 + (i - 1) * 40;
                this.ctx.strokeStyle = '#795548';
                this.ctx.lineWidth = 4;
                this.ctx.beginPath();
                this.ctx.moveTo(prevX + 18, y);
                this.ctx.lineTo(x - 18, y);
                this.ctx.stroke();
            }
            
            // Draw amino acid circle
            this.ctx.fillStyle = this.getAminoAcidColor(aminoAcid);
            this.ctx.beginPath();
            this.ctx.arc(x, y, 18, 0, 2 * Math.PI);
            this.ctx.fill();
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw abbreviation
            this.ctx.font = '10px Arial';
            this.ctx.fillStyle = 'white';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.getAminoAcidAbbr(aminoAcid), x, y + 3);
        }
    }

    getAminoAcidColor(aminoAcid) {
        const colors = {
            'Methionine': '#4CAF50', 'Phenylalanine': '#FF9800', 'Leucine': '#2196F3',
            'Serine': '#9C27B0', 'Tyrosine': '#FF5722', 'Cysteine': '#607D8B',
            'Lysine': '#26A69A', 'Arginine': '#3F51B5', 'Isoleucine': '#8BC34A'
        };
        return colors[aminoAcid] || '#9E9E9E';
    }

    getAminoAcidAbbr(aminoAcid) {
        const abbrs = {
            'Methionine': 'MET', 'Phenylalanine': 'PHE', 'Leucine': 'LEU',
            'Serine': 'SER', 'Tyrosine': 'TYR', 'Cysteine': 'CYS',
            'Lysine': 'LYS', 'Arginine': 'ARG', 'Isoleucine': 'ILE'
        };
        return abbrs[aminoAcid] || 'UNK';
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
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
        if (this.ctx) {
            this.clearCanvas();
        }
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
