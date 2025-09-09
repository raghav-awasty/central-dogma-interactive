// Main app controller
let geneticData = {};
let transcriptionEngine;
let translationEngine;
let currentDNA = '';
let currentRNA = '';
let currentProtein = '';

async function loadData() {
    try {
        // Load codon table
        const codonResponse = await fetch('../data/codon_table.json');
        geneticData = await codonResponse.json();
        console.log('Codon data loaded:', geneticData);
    } catch (error) {
        console.error('Error loading data:', error);
        // Fallback codon table
        geneticData = {
            codon_table: {
                "AUG": "Methionine", "UUU": "Phenylalanine", "UUC": "Phenylalanine", 
                "UUA": "Leucine", "UUG": "Leucine", "UCU": "Serine", "UCC": "Serine",
                "UCA": "Serine", "UCG": "Serine", "UAU": "Tyrosine", "UAC": "Tyrosine",
                "UAA": "Stop", "UAG": "Stop", "UGU": "Cysteine", "UGC": "Cysteine",
                "UGA": "Stop", "UGG": "Tryptophan", "CUU": "Leucine", "CUC": "Leucine",
                "CUA": "Leucine", "CUG": "Leucine", "CCU": "Proline", "CCC": "Proline",
                "CCA": "Proline", "CCG": "Proline", "CAU": "Histidine", "CAC": "Histidine",
                "CAA": "Glutamine", "CAG": "Glutamine", "CGU": "Arginine", "CGC": "Arginine",
                "CGA": "Arginine", "CGG": "Arginine", "AUU": "Isoleucine", "AUC": "Isoleucine",
                "AUA": "Isoleucine", "ACU": "Threonine", "ACC": "Threonine", "ACA": "Threonine",
                "ACG": "Threonine", "AAU": "Asparagine", "AAC": "Asparagine", "AAA": "Lysine",
                "AAG": "Lysine", "AGU": "Serine", "AGC": "Serine", "AGA": "Arginine",
                "AGG": "Arginine", "GUU": "Valine", "GUC": "Valine", "GUA": "Valine",
                "GUG": "Valine", "GCU": "Alanine", "GCC": "Alanine", "GCA": "Alanine",
                "GCG": "Alanine", "GAU": "Aspartic Acid", "GAC": "Aspartic Acid",
                "GAA": "Glutamic Acid", "GAG": "Glutamic Acid", "GGU": "Glycine",
                "GGC": "Glycine", "GGA": "Glycine", "GGG": "Glycine"
            }
        };
    }
}

function validateDNASequence(sequence) {
    const cleanSequence = sequence.replace(/[^ATGC]/gi, '').toUpperCase();
    const validPattern = /^[ATGC]+$/;
    
    if (!validPattern.test(cleanSequence)) {
        return { valid: false, message: 'Sequence must contain only A, T, G, C' };
    }
    
    if (cleanSequence.length % 3 !== 0) {
        return { valid: false, message: 'Sequence length must be divisible by 3' };
    }
    
    if (!cleanSequence.includes('ATG')) {
        return { valid: false, message: 'Sequence must contain start codon ATG' };
    }
    
    return { valid: true, sequence: cleanSequence };
}

function transcribeDNA(dnaSequence) {
    return dnaSequence.replace(/T/g, 'U');
}

function translateRNA(rnaSequence) {
    const protein = [];
    const codonTable = geneticData.codon_table;
    
    for (let i = 0; i < rnaSequence.length; i += 3) {
        const codon = rnaSequence.substr(i, 3);
        if (codon.length === 3) {
            const aminoAcid = codonTable[codon] || 'Unknown';
            if (aminoAcid === 'Stop') {
                break;
            }
            protein.push(aminoAcid);
        }
    }
    
    return protein.join('-');
}

async function initialize() {
    await loadData();
    
    // Initialize engines
    transcriptionEngine = new TranscriptionEngine('simulation-canvas');
    translationEngine = new TranslationEngine('simulation-canvas');
    
    await transcriptionEngine.initialize();
    await translationEngine.initialize(geneticData.codon_table, {});
    
    // Set up event listeners
    document.getElementById('dna-input').addEventListener('input', handleDNAInput);
    document.getElementById('start-btn').addEventListener('click', startSimulation);
    document.getElementById('pause-btn').addEventListener('click', pauseSimulation);
    document.getElementById('resume-btn').addEventListener('click', resumeSimulation);
    document.getElementById('reset-btn').addEventListener('click', resetSimulation);
    
    document.getElementById('speed-select').addEventListener('change', (e) => {
        const speed = parseInt(e.target.value);
        transcriptionEngine.setSpeed(speed);
        translationEngine.setSpeed(speed);
    });
    
    console.log('Central Dogma Interactive initialized!');
    
    // Set initial validation
    handleDNAInput();
}

function handleDNAInput() {
    const input = document.getElementById('dna-input').value;
    const validation = validateDNASequence(input);
    const validationDiv = document.getElementById('input-validation');
    
    if (validation.valid) {
        validationDiv.textContent = '';
        validationDiv.style.display = 'none';
        currentDNA = validation.sequence;
        updateSequenceDisplays();
    } else {
        validationDiv.textContent = validation.message;
        validationDiv.style.display = 'block';
    }
}

function updateSequenceDisplays() {
    document.getElementById('dna-display').textContent = currentDNA;
    document.getElementById('mrna-display').textContent = currentRNA;
    document.getElementById('protein-display').textContent = currentProtein;
}

async function startSimulation() {
    const input = document.getElementById('dna-input').value;
    const validation = validateDNASequence(input);
    
    if (!validation.valid) {
        alert('Please enter a valid DNA sequence');
        return;
    }
    
    currentDNA = validation.sequence;
    currentRNA = transcribeDNA(currentDNA);
    currentProtein = translateRNA(currentRNA);
    
    const mode = document.getElementById('mode-select').value;
    const stepMode = mode === 'step';
    
    console.log('Starting simulation:', { currentDNA, currentRNA, currentProtein, stepMode });
    
    // Start transcription first
    await transcriptionEngine.startTranscription(currentDNA, stepMode);
    
    // Then translation
    setTimeout(async () => {
        await translationEngine.startTranslation(currentRNA, stepMode);
    }, 1000);
    
    updateSequenceDisplays();
}

function pauseSimulation() {
    transcriptionEngine.pause();
    translationEngine.pause();
}

function resumeSimulation() {
    transcriptionEngine.resume();
    translationEngine.resume();
}

function resetSimulation() {
    transcriptionEngine.reset();
    translationEngine.reset();
    
    currentDNA = '';
    currentRNA = '';
    currentProtein = '';
    updateSequenceDisplays();
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initialize);
