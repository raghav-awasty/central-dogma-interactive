/**
 * Reverse Translation Engine
 * Converts protein sequences back to possible DNA sequences
 * Handles codon degeneracy and optimization strategies
 */

class ReverseTranslationEngine {
    constructor() {
        this.codonTable = {};
        this.reverseCodonMap = {};
        this.animationContainer = null;
        this.tooltip = null;
        this.currentAnimation = null;
        this.isAnimating = false;
        
        // Codon usage frequencies (approximate values for common organisms)
        this.codonFrequencies = {
            'F': { 'UUU': 0.46, 'UUC': 0.54 },
            'L': { 'UUA': 0.08, 'UUG': 0.13, 'CUU': 0.12, 'CUC': 0.19, 'CUA': 0.07, 'CUG': 0.41 },
            'S': { 'UCU': 0.15, 'UCC': 0.17, 'UCA': 0.12, 'UCG': 0.04, 'AGU': 0.12, 'AGC': 0.40 },
            'Y': { 'UAU': 0.44, 'UAC': 0.56 },
            'C': { 'UGU': 0.46, 'UGC': 0.54 },
            'W': { 'UGG': 1.0 },
            'P': { 'CCU': 0.16, 'CCC': 0.20, 'CCA': 0.27, 'CCG': 0.37 },
            'H': { 'CAU': 0.42, 'CAC': 0.58 },
            'Q': { 'CAA': 0.25, 'CAG': 0.75 },
            'R': { 'CGU': 0.08, 'CGC': 0.19, 'CGA': 0.06, 'CGG': 0.21, 'AGA': 0.20, 'AGG': 0.26 },
            'I': { 'AUU': 0.36, 'AUC': 0.48, 'AUA': 0.16 },
            'M': { 'AUG': 1.0 },
            'T': { 'ACU': 0.13, 'ACC': 0.19, 'ACA': 0.15, 'ACG': 0.53 },
            'N': { 'AAU': 0.46, 'AAC': 0.54 },
            'K': { 'AAA': 0.42, 'AAG': 0.58 },
            'V': { 'GUU': 0.11, 'GUC': 0.24, 'GUA': 0.07, 'GUG': 0.58 },
            'A': { 'GCU': 0.18, 'GCC': 0.40, 'GCA': 0.16, 'GCG': 0.26 },
            'D': { 'GAU': 0.46, 'GAC': 0.54 },
            'E': { 'GAA': 0.42, 'GAG': 0.58 },
            'G': { 'GGU': 0.10, 'GGC': 0.34, 'GGA': 0.25, 'GGG': 0.31 },
            '*': { 'UAA': 0.28, 'UAG': 0.20, 'UGA': 0.52 }
        };
    }

    async initialize() {
        try {
            // Try to load the codon table from JSON
            const response = await fetch('../data/codon_table.json');
            if (response.ok) {
                const data = await response.json();
                this.codonTable = data.codon_table;
                console.log('Codon table loaded successfully');
            } else {
                throw new Error('Failed to load codon table');
            }
        } catch (error) {
            console.warn('Using fallback codon table:', error);
            this.loadFallbackCodonTable();
        }

        this.buildReverseCodonMap();
        this.setupEventListeners();
        this.initializeVisualization();
    }

    loadFallbackCodonTable() {
        // Fallback codon table with essential amino acids
        this.codonTable = {
            'UUU': { amino_acid: 'Phenylalanine', symbol: 'F', category: 'nonpolar' },
            'UUC': { amino_acid: 'Phenylalanine', symbol: 'F', category: 'nonpolar' },
            'UUA': { amino_acid: 'Leucine', symbol: 'L', category: 'nonpolar' },
            'UUG': { amino_acid: 'Leucine', symbol: 'L', category: 'nonpolar' },
            'UCU': { amino_acid: 'Serine', symbol: 'S', category: 'polar' },
            'UCC': { amino_acid: 'Serine', symbol: 'S', category: 'polar' },
            'UCA': { amino_acid: 'Serine', symbol: 'S', category: 'polar' },
            'UCG': { amino_acid: 'Serine', symbol: 'S', category: 'polar' },
            'UAU': { amino_acid: 'Tyrosine', symbol: 'Y', category: 'polar' },
            'UAC': { amino_acid: 'Tyrosine', symbol: 'Y', category: 'polar' },
            'UAA': { amino_acid: 'STOP', symbol: '*', category: 'stop' },
            'UAG': { amino_acid: 'STOP', symbol: '*', category: 'stop' },
            'UGU': { amino_acid: 'Cysteine', symbol: 'C', category: 'polar' },
            'UGC': { amino_acid: 'Cysteine', symbol: 'C', category: 'polar' },
            'UGA': { amino_acid: 'STOP', symbol: '*', category: 'stop' },
            'UGG': { amino_acid: 'Tryptophan', symbol: 'W', category: 'nonpolar' },
            'CUU': { amino_acid: 'Leucine', symbol: 'L', category: 'nonpolar' },
            'CUC': { amino_acid: 'Leucine', symbol: 'L', category: 'nonpolar' },
            'CUA': { amino_acid: 'Leucine', symbol: 'L', category: 'nonpolar' },
            'CUG': { amino_acid: 'Leucine', symbol: 'L', category: 'nonpolar' },
            'CCU': { amino_acid: 'Proline', symbol: 'P', category: 'nonpolar' },
            'CCC': { amino_acid: 'Proline', symbol: 'P', category: 'nonpolar' },
            'CCA': { amino_acid: 'Proline', symbol: 'P', category: 'nonpolar' },
            'CCG': { amino_acid: 'Proline', symbol: 'P', category: 'nonpolar' },
            'CAU': { amino_acid: 'Histidine', symbol: 'H', category: 'basic' },
            'CAC': { amino_acid: 'Histidine', symbol: 'H', category: 'basic' },
            'CAA': { amino_acid: 'Glutamine', symbol: 'Q', category: 'polar' },
            'CAG': { amino_acid: 'Glutamine', symbol: 'Q', category: 'polar' },
            'CGU': { amino_acid: 'Arginine', symbol: 'R', category: 'basic' },
            'CGC': { amino_acid: 'Arginine', symbol: 'R', category: 'basic' },
            'CGA': { amino_acid: 'Arginine', symbol: 'R', category: 'basic' },
            'CGG': { amino_acid: 'Arginine', symbol: 'R', category: 'basic' },
            'AUU': { amino_acid: 'Isoleucine', symbol: 'I', category: 'nonpolar' },
            'AUC': { amino_acid: 'Isoleucine', symbol: 'I', category: 'nonpolar' },
            'AUA': { amino_acid: 'Isoleucine', symbol: 'I', category: 'nonpolar' },
            'AUG': { amino_acid: 'Methionine', symbol: 'M', category: 'nonpolar' },
            'ACU': { amino_acid: 'Threonine', symbol: 'T', category: 'polar' },
            'ACC': { amino_acid: 'Threonine', symbol: 'T', category: 'polar' },
            'ACA': { amino_acid: 'Threonine', symbol: 'T', category: 'polar' },
            'ACG': { amino_acid: 'Threonine', symbol: 'T', category: 'polar' },
            'AAU': { amino_acid: 'Asparagine', symbol: 'N', category: 'polar' },
            'AAC': { amino_acid: 'Asparagine', symbol: 'N', category: 'polar' },
            'AAA': { amino_acid: 'Lysine', symbol: 'K', category: 'basic' },
            'AAG': { amino_acid: 'Lysine', symbol: 'K', category: 'basic' },
            'AGU': { amino_acid: 'Serine', symbol: 'S', category: 'polar' },
            'AGC': { amino_acid: 'Serine', symbol: 'S', category: 'polar' },
            'AGA': { amino_acid: 'Arginine', symbol: 'R', category: 'basic' },
            'AGG': { amino_acid: 'Arginine', symbol: 'R', category: 'basic' },
            'GUU': { amino_acid: 'Valine', symbol: 'V', category: 'nonpolar' },
            'GUC': { amino_acid: 'Valine', symbol: 'V', category: 'nonpolar' },
            'GUA': { amino_acid: 'Valine', symbol: 'V', category: 'nonpolar' },
            'GUG': { amino_acid: 'Valine', symbol: 'V', category: 'nonpolar' },
            'GCU': { amino_acid: 'Alanine', symbol: 'A', category: 'nonpolar' },
            'GCC': { amino_acid: 'Alanine', symbol: 'A', category: 'nonpolar' },
            'GCA': { amino_acid: 'Alanine', symbol: 'A', category: 'nonpolar' },
            'GCG': { amino_acid: 'Alanine', symbol: 'A', category: 'nonpolar' },
            'GAU': { amino_acid: 'Aspartic Acid', symbol: 'D', category: 'acidic' },
            'GAC': { amino_acid: 'Aspartic Acid', symbol: 'D', category: 'acidic' },
            'GAA': { amino_acid: 'Glutamic Acid', symbol: 'E', category: 'acidic' },
            'GAG': { amino_acid: 'Glutamic Acid', symbol: 'E', category: 'acidic' },
            'GGU': { amino_acid: 'Glycine', symbol: 'G', category: 'nonpolar' },
            'GGC': { amino_acid: 'Glycine', symbol: 'G', category: 'nonpolar' },
            'GGA': { amino_acid: 'Glycine', symbol: 'G', category: 'nonpolar' },
            'GGG': { amino_acid: 'Glycine', symbol: 'G', category: 'nonpolar' }
        };
    }

    buildReverseCodonMap() {
        this.reverseCodonMap = {};
        
        for (const [codon, data] of Object.entries(this.codonTable)) {
            const symbol = data.symbol || data.amino_acid?.charAt(0) || 'X';
            
            if (!this.reverseCodonMap[symbol]) {
                this.reverseCodonMap[symbol] = [];
            }
            
            this.reverseCodonMap[symbol].push({
                codon: codon,
                amino_acid: data.amino_acid,
                category: data.category
            });
        }
        
        console.log('Reverse codon map built:', this.reverseCodonMap);
    }

    setupEventListeners() {
        const reverseBtn = document.getElementById('reverseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        reverseBtn?.addEventListener('click', () => this.startReverseTranslation());
        resetBtn?.addEventListener('click', () => this.reset());
    }

    initializeVisualization() {
        this.animationContainer = document.getElementById('visualization');
        this.tooltip = document.getElementById('tooltip');
    }

    validateProteinSequence(sequence) {
        const cleanSequence = sequence.replace(/\s+/g, '').toUpperCase();
        const validAminoAcids = 'ACDEFGHIKLMNPQRSTVWY*';
        const errors = [];
        
        if (!cleanSequence) {
            errors.push('Protein sequence cannot be empty');
            return { valid: false, errors, cleanSequence };
        }
        
        for (let i = 0; i < cleanSequence.length; i++) {
            const aa = cleanSequence[i];
            if (!validAminoAcids.includes(aa)) {
                errors.push(`Invalid amino acid '${aa}' at position ${i + 1}`);
            }
        }
        
        if (cleanSequence.length > 100) {
            errors.push('Sequence too long (maximum 100 amino acids for visualization)');
        }
        
        return {
            valid: errors.length === 0,
            errors,
            cleanSequence
        };
    }

    selectCodonForAminoAcid(aminoAcid, strategy) {
        const codons = this.reverseCodonMap[aminoAcid];
        if (!codons || codons.length === 0) {
            console.warn(`No codons found for amino acid: ${aminoAcid}`);
            return 'NNN'; // Unknown codon
        }
        
        switch (strategy) {
            case 'most_common':
                return this.selectMostCommonCodon(aminoAcid, codons);
            case 'gc_rich':
                return this.selectGCRichCodon(codons);
            case 'gc_poor':
                return this.selectGCPoorCodon(codons);
            case 'balanced':
                return this.selectBalancedCodon(aminoAcid, codons);
            case 'random':
            default:
                return codons[Math.floor(Math.random() * codons.length)].codon;
        }
    }

    selectMostCommonCodon(aminoAcid, codons) {
        const frequencies = this.codonFrequencies[aminoAcid];
        if (!frequencies) {
            return codons[0].codon; // Default to first codon
        }
        
        let maxFreq = 0;
        let selectedCodon = codons[0].codon;
        
        for (const codonData of codons) {
            const freq = frequencies[codonData.codon] || 0;
            if (freq > maxFreq) {
                maxFreq = freq;
                selectedCodon = codonData.codon;
            }
        }
        
        return selectedCodon;
    }

    selectGCRichCodon(codons) {
        let maxGC = 0;
        let selectedCodon = codons[0].codon;
        
        for (const codonData of codons) {
            const gcContent = this.calculateGCContent(codonData.codon);
            if (gcContent > maxGC) {
                maxGC = gcContent;
                selectedCodon = codonData.codon;
            }
        }
        
        return selectedCodon;
    }

    selectGCPoorCodon(codons) {
        let minGC = 1;
        let selectedCodon = codons[0].codon;
        
        for (const codonData of codons) {
            const gcContent = this.calculateGCContent(codonData.codon);
            if (gcContent < minGC) {
                minGC = gcContent;
                selectedCodon = codonData.codon;
            }
        }
        
        return selectedCodon;
    }

    selectBalancedCodon(aminoAcid, codons) {
        // Use weighted random selection based on frequencies
        const frequencies = this.codonFrequencies[aminoAcid];
        if (!frequencies) {
            return codons[Math.floor(Math.random() * codons.length)].codon;
        }
        
        const random = Math.random();
        let cumulative = 0;
        
        for (const codonData of codons) {
            const freq = frequencies[codonData.codon] || (1 / codons.length);
            cumulative += freq;
            if (random <= cumulative) {
                return codonData.codon;
            }
        }
        
        return codons[codons.length - 1].codon;
    }

    calculateGCContent(codon) {
        const gcBases = codon.split('').filter(base => base === 'G' || base === 'C').length;
        return gcBases / codon.length;
    }

    async startReverseTranslation() {
        if (this.isAnimating) return;
        
        const proteinInput = document.getElementById('proteinSequence');
        const strategy = document.getElementById('codonStrategy').value;
        
        const validation = this.validateProteinSequence(proteinInput.value);
        
        if (!validation.valid) {
            this.showError(validation.errors.join('<br>'));
            return;
        }
        
        this.clearError();
        this.isAnimating = true;
        
        // Generate mRNA sequence from protein
        const proteinSequence = validation.cleanSequence;
        const mrnaSequence = this.generateMRNAFromProtein(proteinSequence, strategy);
        const dnaSequence = this.generateDNAFromMRNA(mrnaSequence);
        
        // Show animation
        await this.animateReverseProcess(proteinSequence, mrnaSequence, dnaSequence, strategy);
        
        // Display results
        this.displayResults(mrnaSequence, dnaSequence, proteinSequence, strategy);
        
        this.isAnimating = false;
    }

    generateMRNAFromProtein(proteinSequence, strategy) {
        let mrnaSequence = '';
        
        for (const aminoAcid of proteinSequence) {
            if (aminoAcid === '*') {
                // Stop codon
                mrnaSequence += this.selectCodonForAminoAcid(aminoAcid, strategy);
                break;
            } else {
                mrnaSequence += this.selectCodonForAminoAcid(aminoAcid, strategy);
            }
        }
        
        return mrnaSequence;
    }

    generateDNAFromMRNA(mrnaSequence) {
        // Convert mRNA to DNA template strand (complementary)
        const complementMap = { 'A': 'T', 'U': 'A', 'G': 'C', 'C': 'G' };
        return mrnaSequence.split('').map(base => complementMap[base] || 'N').join('');
    }

    async animateReverseProcess(proteinSequence, mrnaSequence, dnaSequence, strategy) {
        this.animationContainer.innerHTML = '';
        
        // Create SVG
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '400');
        svg.setAttribute('viewBox', '0 0 1000 400');
        
        // Background
        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('width', '100%');
        bg.setAttribute('height', '100%');
        bg.setAttribute('fill', '#f8fafc');
        svg.appendChild(bg);
        
        this.animationContainer.appendChild(svg);
        
        // Phase 1: Show protein sequence
        await this.animateProteinDisplay(svg, proteinSequence);
        await this.delay(1000);
        
        // Phase 2: Show reverse translation process
        await this.animateReverseTranslationProcess(svg, proteinSequence, mrnaSequence, strategy);
        await this.delay(1000);
        
        // Phase 3: Show DNA generation
        await this.animateReverseTranscriptionProcess(svg, mrnaSequence, dnaSequence);
    }

    async animateProteinDisplay(svg, proteinSequence) {
        // Title
        const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        title.setAttribute('x', '500');
        title.setAttribute('y', '30');
        title.setAttribute('text-anchor', 'middle');
        title.setAttribute('font-size', '18');
        title.setAttribute('font-weight', 'bold');
        title.setAttribute('fill', '#4a5568');
        title.textContent = 'Step 1: Protein Sequence Input';
        svg.appendChild(title);
        
        // Add Protein label with more horizontal spacing to avoid arrow overlap
        const proteinLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        proteinLabel.setAttribute('x', '30');  // Moved left from 50 to avoid arrow overlap
        proteinLabel.setAttribute('y', '55');  // Moved up from 60 to create more space
        proteinLabel.setAttribute('font-size', '16');
        proteinLabel.setAttribute('font-weight', 'bold');
        proteinLabel.setAttribute('fill', '#333');
        proteinLabel.textContent = 'Protein:';
        svg.appendChild(proteinLabel);
        
        // Protein sequence - align with codon starting positions with good spacing
        const proteinY = 90;  // Back to previous position
        const codonSpacing = Math.min(25, 800 / (proteinSequence.length * 3)); // Same as codon calculation
        const proteinSpacing = codonSpacing * 3; // Each protein aligns with a 3-nucleotide codon
        
        for (let i = 0; i < proteinSequence.length; i++) {
            const aa = proteinSequence[i];
            const x = 100 + i * proteinSpacing; // Align with first nucleotide of each codon
            
            // Amino acid circle
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', x);
            circle.setAttribute('cy', proteinY);
            circle.setAttribute('r', '20');
            circle.setAttribute('fill', this.getAminoAcidColor(aa));
            circle.setAttribute('stroke', '#2d3748');
            circle.setAttribute('stroke-width', '2');
            circle.setAttribute('opacity', '0');
            
            // Animate appearance
            const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            animate.setAttribute('attributeName', 'opacity');
            animate.setAttribute('from', '0');
            animate.setAttribute('to', '1');
            animate.setAttribute('dur', '0.3s');
            animate.setAttribute('begin', `${i * 0.1}s`);
            animate.setAttribute('fill', 'freeze');
            circle.appendChild(animate);
            
            svg.appendChild(circle);
            
            // Amino acid letter
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', x);
            text.setAttribute('y', proteinY + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('font-size', '14');
            text.setAttribute('font-weight', 'bold');
            text.setAttribute('fill', 'white');
            text.setAttribute('opacity', '0');
            text.textContent = aa;
            
            const textAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            textAnimate.setAttribute('attributeName', 'opacity');
            textAnimate.setAttribute('from', '0');
            textAnimate.setAttribute('to', '1');
            textAnimate.setAttribute('dur', '0.3s');
            textAnimate.setAttribute('begin', `${i * 0.1}s`);
            textAnimate.setAttribute('fill', 'freeze');
            text.appendChild(textAnimate);
            
            svg.appendChild(text);
            
            // Add tooltip interaction
            this.addTooltipToElement(circle, `${aa} (${this.getAminoAcidName(aa)})`);
        }
        
        await this.delay(proteinSequence.length * 100 + 500);
    }

    async animateReverseTranslationProcess(svg, proteinSequence, mrnaSequence, strategy) {
        // Clear previous content and add new title
        const title = svg.querySelector('text');
        title.textContent = 'Step 2: Reverse Translation (Protein → mRNA)';
        
        const mrnaY = 210;  // Back to previous position
        const spacing = Math.min(25, 800 / (mrnaSequence.length / 3));
        
        // Add mRNA label with more horizontal spacing to avoid arrow overlap
        const mrnaLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        mrnaLabel.setAttribute('x', '30');  // Moved left from 50 to avoid arrow overlap
        mrnaLabel.setAttribute('y', '175');  // Moved up from 180 to create more space
        mrnaLabel.setAttribute('font-size', '16');
        mrnaLabel.setAttribute('font-weight', 'bold');
        mrnaLabel.setAttribute('fill', '#333');
        mrnaLabel.textContent = 'mRNA:';
        svg.appendChild(mrnaLabel);
        
        let codonIndex = 0;
        for (let i = 0; i < proteinSequence.length; i++) {
            const aa = proteinSequence[i];
            const codon = mrnaSequence.substr(codonIndex * 3, 3);
            const x = 100 + i * spacing * 3;
            
            // Show arrow pointing down - align with protein position
            const proteinX = 100 + i * (spacing * 3); // Match protein positioning calculation
            const arrow = this.createArrow(proteinX, 130, proteinX, 180);  // Back to previous Y positions
            arrow.setAttribute('opacity', '0');
            svg.appendChild(arrow);
            
            const arrowAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            arrowAnimate.setAttribute('attributeName', 'opacity');
            arrowAnimate.setAttribute('from', '0');
            arrowAnimate.setAttribute('to', '1');
            arrowAnimate.setAttribute('dur', '0.5s');
            arrowAnimate.setAttribute('begin', `${i * 0.5}s`);
            arrowAnimate.setAttribute('fill', 'freeze');
            arrow.appendChild(arrowAnimate);
            
            // Show codon
            for (let j = 0; j < 3; j++) {
                const nucleotide = codon[j];
                const nucX = x + j * 25;
                
                const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                rect.setAttribute('x', nucX - 10);
                rect.setAttribute('y', mrnaY - 15);
                rect.setAttribute('width', '20');
                rect.setAttribute('height', '30');
                rect.setAttribute('fill', this.getNucleotideColor(nucleotide));
                rect.setAttribute('stroke', '#2d3748');
                rect.setAttribute('stroke-width', '1');
                rect.setAttribute('opacity', '0');
                rect.setAttribute('rx', '3');
                
                const rectAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                rectAnimate.setAttribute('attributeName', 'opacity');
                rectAnimate.setAttribute('from', '0');
                rectAnimate.setAttribute('to', '1');
                rectAnimate.setAttribute('dur', '0.3s');
                rectAnimate.setAttribute('begin', `${i * 0.5 + j * 0.1}s`);
                rectAnimate.setAttribute('fill', 'freeze');
                rect.appendChild(rectAnimate);
                
                svg.appendChild(rect);
                
                const nucText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                nucText.setAttribute('x', nucX);
                nucText.setAttribute('y', mrnaY + 5);
                nucText.setAttribute('text-anchor', 'middle');
                nucText.setAttribute('font-size', '12');
                nucText.setAttribute('font-weight', 'bold');
                nucText.setAttribute('fill', 'white');
                nucText.setAttribute('opacity', '0');
                nucText.textContent = nucleotide;
                
                const nucTextAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
                nucTextAnimate.setAttribute('attributeName', 'opacity');
                nucTextAnimate.setAttribute('from', '0');
                nucTextAnimate.setAttribute('to', '1');
                nucTextAnimate.setAttribute('dur', '0.3s');
                nucTextAnimate.setAttribute('begin', `${i * 0.5 + j * 0.1}s`);
                nucTextAnimate.setAttribute('fill', 'freeze');
                nucText.appendChild(nucTextAnimate);
                
                svg.appendChild(nucText);
                
                this.addTooltipToElement(rect, `${nucleotide} (${this.getNucleotideName(nucleotide)})`);
            }
            
            codonIndex++;
        }
        
        await this.delay(proteinSequence.length * 500 + 1000);
    }

    async animateReverseTranscriptionProcess(svg, mrnaSequence, dnaSequence) {
        // Update title
        const title = svg.querySelector('text');
        title.textContent = 'Step 3: Reverse Transcription (mRNA → DNA)';
        
        const dnaY = 330;  // Back to previous position
        const spacing = Math.min(25, 800 / dnaSequence.length);
        
        // Add DNA label with more horizontal spacing to avoid arrow overlap
        const dnaLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        dnaLabel.setAttribute('x', '30');  // Moved left from 50 to avoid arrow overlap
        dnaLabel.setAttribute('y', '295');  // Moved up from 300 to create more space
        dnaLabel.setAttribute('font-size', '16');
        dnaLabel.setAttribute('font-weight', 'bold');
        dnaLabel.setAttribute('fill', '#333');
        dnaLabel.textContent = 'DNA (Template):';
        svg.appendChild(dnaLabel);
        
        // Show arrow pointing down from mRNA to DNA
        const bigArrow = this.createArrow(500, 240, 500, 290);  // Back to previous Y positions
        bigArrow.setAttribute('opacity', '0');
        svg.appendChild(bigArrow);
        
        const bigArrowAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
        bigArrowAnimate.setAttribute('attributeName', 'opacity');
        bigArrowAnimate.setAttribute('from', '0');
        bigArrowAnimate.setAttribute('to', '1');
        bigArrowAnimate.setAttribute('dur', '0.5s');
        bigArrowAnimate.setAttribute('fill', 'freeze');
        bigArrow.appendChild(bigArrowAnimate);
        
        // Show DNA sequence
        for (let i = 0; i < dnaSequence.length; i++) {
            const base = dnaSequence[i];
            const x = 100 + i * spacing;
            
            const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            rect.setAttribute('x', x - 10);
            rect.setAttribute('y', dnaY - 15);
            rect.setAttribute('width', '20');
            rect.setAttribute('height', '30');
            rect.setAttribute('fill', this.getDNABaseColor(base));
            rect.setAttribute('stroke', '#2d3748');
            rect.setAttribute('stroke-width', '1');
            rect.setAttribute('opacity', '0');
            rect.setAttribute('rx', '3');
            
            const rectAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            rectAnimate.setAttribute('attributeName', 'opacity');
            rectAnimate.setAttribute('from', '0');
            rectAnimate.setAttribute('to', '1');
            rectAnimate.setAttribute('dur', '0.2s');
            rectAnimate.setAttribute('begin', `${i * 0.05}s`);
            rectAnimate.setAttribute('fill', 'freeze');
            rect.appendChild(rectAnimate);
            
            svg.appendChild(rect);
            
            const baseText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            baseText.setAttribute('x', x);
            baseText.setAttribute('y', dnaY + 5);
            baseText.setAttribute('text-anchor', 'middle');
            baseText.setAttribute('font-size', '12');
            baseText.setAttribute('font-weight', 'bold');
            baseText.setAttribute('fill', 'white');
            baseText.setAttribute('opacity', '0');
            baseText.textContent = base;
            
            const baseTextAnimate = document.createElementNS('http://www.w3.org/2000/svg', 'animate');
            baseTextAnimate.setAttribute('attributeName', 'opacity');
            baseTextAnimate.setAttribute('from', '0');
            baseTextAnimate.setAttribute('to', '1');
            baseTextAnimate.setAttribute('dur', '0.2s');
            baseTextAnimate.setAttribute('begin', `${i * 0.05}s`);
            baseTextAnimate.setAttribute('fill', 'freeze');
            baseText.appendChild(baseTextAnimate);
            
            svg.appendChild(baseText);
            
            this.addTooltipToElement(rect, `${base} (DNA Base)`);
        }
        
        await this.delay(dnaSequence.length * 50 + 1000);
        
        // Update progress
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            progressFill.style.width = '100%';
        }
    }

    createArrow(x1, y1, x2, y2) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        
        // Arrow line
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x1);
        line.setAttribute('y1', y1);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2 - 10);
        line.setAttribute('stroke', '#4a5568');
        line.setAttribute('stroke-width', '2');
        group.appendChild(line);
        
        // Arrow head
        const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrowHead.setAttribute('points', `${x2-5},${y2-10} ${x2+5},${y2-10} ${x2},${y2}`);
        arrowHead.setAttribute('fill', '#4a5568');
        group.appendChild(arrowHead);
        
        return group;
    }

    displayResults(mrnaSequence, dnaSequence, proteinSequence, strategy) {
        const infoPanel = document.getElementById('infoPanel');
        const mrnaDisplay = document.getElementById('mrnaSequence');
        const dnaDisplay = document.getElementById('dnaSequence');
        const processInfo = document.getElementById('processInfo');
        
        // Format sequences for display
        const formattedMRNA = this.formatSequenceForDisplay(mrnaSequence, 3);
        const formattedDNA = this.formatSequenceForDisplay(dnaSequence, 3);
        
        mrnaDisplay.innerHTML = formattedMRNA;
        dnaDisplay.innerHTML = formattedDNA;
        
        // Process information
        const gcContent = this.calculateGCContent(mrnaSequence);
        const numCodons = Math.floor(mrnaSequence.length / 3);
        
        processInfo.innerHTML = `
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 0.5rem;">
                <div>
                    <strong>Strategy Used:</strong> ${this.getStrategyDescription(strategy)}<br>
                    <strong>Protein Length:</strong> ${proteinSequence.length} amino acids<br>
                    <strong>mRNA Length:</strong> ${mrnaSequence.length} nucleotides
                </div>
                <div>
                    <strong>Number of Codons:</strong> ${numCodons}<br>
                    <strong>GC Content:</strong> ${(gcContent * 100).toFixed(1)}%<br>
                    <strong>DNA Length:</strong> ${dnaSequence.length} base pairs
                </div>
            </div>
        `;
        
        infoPanel.style.display = 'block';
        
        this.showSuccess('Reverse translation completed successfully!');
    }

    formatSequenceForDisplay(sequence, groupSize = 3) {
        let formatted = '';
        for (let i = 0; i < sequence.length; i += groupSize) {
            const group = sequence.substr(i, groupSize);
            formatted += `<span style="margin-right: 10px; padding: 2px 4px; background: #e2e8f0; border-radius: 3px; font-weight: bold;">${group}</span>`;
            if ((i + groupSize) % (groupSize * 10) === 0) {
                formatted += '<br>';
            }
        }
        return formatted;
    }

    getStrategyDescription(strategy) {
        const descriptions = {
            'most_common': 'Most Common Codons',
            'gc_rich': 'GC-Rich Codons',
            'gc_poor': 'GC-Poor Codons',
            'balanced': 'Balanced Selection',
            'random': 'Random Selection'
        };
        return descriptions[strategy] || strategy;
    }

    getAminoAcidColor(aa) {
        const colors = {
            'A': '#d32f2f', 'R': '#c62828', 'N': '#ff8f00', 'D': '#f57c00',
            'C': '#388e3c', 'Q': '#689f38', 'E': '#558b2f', 'G': '#00796b',
            'H': '#1976d2', 'I': '#7b1fa2', 'L': '#512da8', 'K': '#303f9f',
            'M': '#8e24aa', 'F': '#c2185b', 'P': '#ad1457', 'S': '#d84315',
            'T': '#5d4037', 'W': '#455a64', 'Y': '#f9a825', 'V': '#6a4c93',
            '*': '#424242'
        };
        return colors[aa] || '#757575';
    }

    getAminoAcidName(aa) {
        const names = {
            'A': 'Alanine', 'R': 'Arginine', 'N': 'Asparagine', 'D': 'Aspartic Acid',
            'C': 'Cysteine', 'Q': 'Glutamine', 'E': 'Glutamic Acid', 'G': 'Glycine',
            'H': 'Histidine', 'I': 'Isoleucine', 'L': 'Leucine', 'K': 'Lysine',
            'M': 'Methionine', 'F': 'Phenylalanine', 'P': 'Proline', 'S': 'Serine',
            'T': 'Threonine', 'W': 'Tryptophan', 'Y': 'Tyrosine', 'V': 'Valine',
            '*': 'Stop Codon'
        };
        return names[aa] || 'Unknown';
    }

    getNucleotideColor(nucleotide) {
        const colors = {
            'A': '#ff6b6b', 'U': '#4ecdc4', 'G': '#45b7d1', 'C': '#f9ca24'
        };
        return colors[nucleotide] || '#95a5a6';
    }

    getNucleotideName(nucleotide) {
        const names = {
            'A': 'Adenine', 'U': 'Uracil', 'G': 'Guanine', 'C': 'Cytosine'
        };
        return names[nucleotide] || 'Unknown';
    }

    getDNABaseColor(base) {
        const colors = {
            'A': '#ff6b6b', 'T': '#4ecdc4', 'G': '#45b7d1', 'C': '#f9ca24'
        };
        return colors[base] || '#95a5a6';
    }

    addTooltipToElement(element, text) {
        element.addEventListener('mouseenter', (e) => {
            this.tooltip.textContent = text;
            this.tooltip.style.opacity = '1';
        });

        element.addEventListener('mousemove', (e) => {
            this.tooltip.style.left = e.pageX + 10 + 'px';
            this.tooltip.style.top = e.pageY - 30 + 'px';
        });

        element.addEventListener('mouseleave', () => {
            this.tooltip.style.opacity = '0';
        });
    }

    showError(message) {
        this.clearMessages();
        const container = document.querySelector('.main-panel');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = message;
        container.insertBefore(errorDiv, container.querySelector('.input-section').nextSibling);
    }

    showSuccess(message) {
        this.clearMessages();
        const container = document.querySelector('.main-panel');
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.innerHTML = message;
        container.insertBefore(successDiv, container.querySelector('.input-section').nextSibling);
    }

    clearError() {
        const errorMsg = document.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    }

    clearMessages() {
        const messages = document.querySelectorAll('.error-message, .success-message');
        messages.forEach(msg => msg.remove());
    }

    reset() {
        this.isAnimating = false;
        
        // Clear input
        document.getElementById('proteinSequence').value = '';
        
        // Clear visualization
        this.animationContainer.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100%; color: #a0aec0;">
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">🧬</div>
                    <p>Enter a protein sequence above to start reverse engineering</p>
                </div>
            </div>
        `;
        
        // Hide results
        document.getElementById('infoPanel').style.display = 'none';
        
        // Reset progress
        document.getElementById('progressFill').style.width = '0%';
        
        // Clear messages
        this.clearMessages();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when page loads
window.ReverseTranslationEngine = ReverseTranslationEngine;