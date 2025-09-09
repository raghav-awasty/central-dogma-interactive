# 📊 Central Dogma Interactive - Usage Flowchart

## 🎯 **Application Flow Visualization**

```
                    🧬 CENTRAL DOGMA INTERACTIVE 🧬
                              Application Flow
                                      
    ┌─────────────────────────────────────────────────────────────────────┐
    │                          🏠 WELCOME SCREEN                          │
    │                                                                     │
    │  • Overview: DNA → RNA → Protein process                           │
    │  • Educational objectives explained                                 │
    │  • Two options:                                                     │
    │    - "Start Interactive Simulation" ──────────┐                    │
    │    - "Learn the Basics First" (opens help)    │                    │
    └─────────────────────────────────────────────┘ │                    │
                                                    │                    │
    ┌───────────────────────────────────────────────▼─────────────────────┐
    │                        📝 DNA INPUT SCREEN                         │
    │                                                                     │
    │  • Text input field for DNA sequence (A,T,G,C)                    │
    │  • Real-time validation:                                           │
    │    - Invalid chars filtered automatically                          │
    │    - Length check (divisible by 3)                                │
    │    - Start codon (ATG) detection                                   │
    │  • Preset sequence options:                                       │
    │    - Simple Example (16 bases)                                    │
    │    - Insulin Fragment (36 bases)                                  │
    │    - Beta-Globin Fragment (45 bases)                              │
    │  • "Validate & Continue" button                                   │
    └─────────────────────────────────────────────┬───────────────────────┘
                                                  │
    ┌─────────────────────────────────────────────▼───────────────────────┐
    │                      🎬 SIMULATION SCREEN                           │
    │                                                                     │
    │  ┌─────────────────────────────────────────────────────────────────┐ │
    │  │                    🎮 ENHANCED CONTROLS                         │ │
    │  │                                                                 │ │
    │  │  [▶️] [⏭️] [🔄]     📊 Progress: [████░░░░░░] 42%    Speed: 3x   │ │
    │  │   Play Step Reset                                              │ │
    │  └─────────────────────────────────────────────────────────────────┘ │
    │                                                                     │
    │  ┌─────────────────────────────────────────────────────────────────┐ │
    │  │                📍 PHASE INDICATORS                              │ │
    │  │                                                                 │ │
    │  │   [1] Transcription ──→  [2] Translation                       │ │
    │  │   🧬  DNA → mRNA         ⚙️  mRNA → Protein                    │ │
    │  └─────────────────────────────────────────────────────────────────┘ │
    └─────────────────────────────────────────────┬───────────────────────┘
                                                  │
                               ┌──────────────────┴──────────────────┐
                               │                                     │
    ┌──────────────────────────▼─────────────────┐   ┌─────────────▼────────────┐
    │        🧬 TRANSCRIPTION PHASE               │   │   ⚙️ TRANSLATION PHASE    │
    │                                            │   │                          │
    │  • DNA unwinding animation                 │   │  • Ribosome assembly     │
    │  • RNA polymerase visualization           │   │  • A/P binding sites     │
    │  • Step-by-step mRNA synthesis            │   │  • tRNA entry/exit       │
    │  • Educational tooltips & messages        │   │  • Amino acid chain      │
    │  • Interactive nucleotides (hover)        │   │  • Codon highlighting    │
    │  • Progress: 0% → 50%                     │   │  • Stop codon detection  │
    │                                            │   │  • Progress: 50% → 100%  │
    │            │                               │   │                          │
    │            ▼                               │   │           │              │
    │    ┌─────────────────┐                    │   │           ▼              │
    │    │ 🚀 TRANSITION   │                    │   │   ┌──────────────────┐    │
    │    │                 │                    │   │   │ ✅ COMPLETION    │    │
    │    │ "mRNA moving    │ ───────────────────────────▶  │                  │    │
    │    │ to cytoplasm"   │                    │   │   │ • Final stats    │    │
    │    │                 │                    │   │   │ • Export option  │    │
    │    └─────────────────┘                    │   │   │ • Sequence data  │    │
    └────────────────────────────────────────────┘   │   └──────────────────┘    │
                                                     └───────────────────────────┘

                            📋 INTERACTIVE FEATURES
                                      
    🖱️  MOUSE CONTROLS              ⌨️  KEYBOARD SHORTCUTS
    • Click buttons                 • Space: Play/Pause
    • Hover for tooltips           • →: Step Forward  
    • Drag speed slider            • R: Reset
                                   • 1-5: Set Speed
                                   • H: Help Dialog
                                   • ?: Show Shortcuts
                                   • Esc: Close Modals

                              📊 PROGRESS TRACKING
                                      
    ┌─────────────────────────────────────────────────────────────────────┐
    │ Real-time Updates:                                                  │
    │ • Visual progress bar with percentage                               │
    │ • Educational messages explaining current process                   │
    │ • Phase containers highlight active process                        │
    │ • Sequence displays update throughout                              │
    │ • Educational events dispatch contextual information               │
    └─────────────────────────────────────────────────────────────────────┘

                            🎓 EDUCATIONAL INTEGRATION
                                      
    ┌─────────────────────────────────────────────────────────────────────┐
    │ Learning Features:                                                  │
    │ • Contextual tooltips on molecular elements                        │
    │ • Step-by-step educational messages                                │
    │ • Scientific accuracy in all visualizations                       │
    │ • Interactive quiz system (when enabled)                          │
    │ • Achievement notifications for engagement                         │
    │ • Export functionality for further study                          │
    └─────────────────────────────────────────────────────────────────────┘

                              🔄 USER FLOW LOOPS
                                      
    ┌─────────────────────────────────────────────────────────────────────┐
    │ After completion, users can:                                       │
    │                                                                     │
    │ 1. 🔄 Reset to try new sequences                                   │
    │ 2. 💾 Export results for analysis                                  │
    │ 3. 🔙 Return to input for different DNA                            │
    │ 4. 📚 Open help for deeper learning                                │
    │ 5. 🎮 Experiment with controls and settings                        │
    └─────────────────────────────────────────────────────────────────────┘
```

## 🎯 **Quick Start Guide**

### **1. Launch** 🚀
```
Open src/index.html in any modern browser
```

### **2. Input** 📝  
```
Enter DNA sequence: ATGGTTTTAAGCGTAA
Or click preset: "Simple Example"
```

### **3. Watch** 👀
```
Press Play ▶️ to see DNA→RNA→Protein animation
Use controls to pause, step, or adjust speed
```

### **4. Learn** 🧠
```
Hover elements for details
Read educational messages
Try different sequences
```

### **5. Export** 💾
```
Download results when complete
Review sequences and data
```

## 💡 **Pro Tips**

- **Use keyboard shortcuts** for efficient navigation
- **Start with simple sequences** to understand the process  
- **Try step-by-step mode** for detailed examination
- **Hover over elements** to see molecular details
- **Export results** to compare different sequences
- **Use different speeds** to match your learning pace

---

*This flowchart shows the complete user journey through the Central Dogma Interactive application, highlighting all major features and interaction points.*
