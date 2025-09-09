# 🧬 Central Dogma Interactive

An interactive web-based simulation for learning the Central Dogma of Molecular Biology - the flow of genetic information from DNA to RNA to proteins.

## 🎯 Educational Objectives

- **Understand DNA transcription**: Watch as DNA is transcribed into mRNA by RNA polymerase
- **Learn RNA translation**: See how ribosomes translate mRNA codons into amino acids
- **Explore the genetic code**: Interactive visualization of the complete codon table
- **Experiment with mutations**: Observe how DNA changes affect protein synthesis

## 🚀 Features

### Phase 1 (Current - Foundation)
- ✅ Responsive HTML5 interface with accessibility features
- ✅ Complete genetic code data with amino acid properties
- ✅ DNA sequence validation and input handling
- ✅ Basic transcription and translation logic
- ✅ SVG-based visualization framework
- ✅ Animation engines for biological processes

### Phase 2 (COMPLETED ✅ - Enhanced Animations & Interactivity)
- ✅ Step-by-step transcription animation with detailed enzyme mechanics
- ✅ Interactive ribosome and RNA polymerase with A/P site visualization
- ✅ Real-time sequence updates with nucleotide-by-nucleotide synthesis
- ✅ Educational tooltips, hover interactions, and contextual information
- ✅ Advanced translation engine with tRNA entry/exit animations
- ✅ Interactive visualization with zoom/pan controls
- ✅ Complete educational content system with quizzes and achievements
- ✅ Enhanced user experience with smooth animations and error handling

### Phase 3 (Next - Advanced Features & Polish)
- 🔄 Backend API integration for sequence processing
- 🔄 Mutation experiment tools with real-time updates
- 🔄 Advanced protein structure insights and 3D visualization
- 🔄 Responsive design optimization for mobile devices
- ⏳ Accessibility enhancements (ARIA labels, keyboard shortcuts)
- ⏳ Internationalization support
- ⏳ Performance optimizations for large sequences
- ⏳ Comprehensive testing suite and deployment automation

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Grid/Flexbox with CSS custom properties
- **Visualization**: SVG with JavaScript animation
- **Data**: JSON-based genetic code and educational content
- **Architecture**: Modular ES6 classes with event-driven design

## 📁 Project Structure

```
central-dogma-interactive/
├── src/
│   └── index.html              # Main entry point
├── public/
│   ├── css/
│   │   └── main.css           # Main stylesheet
│   └── js/
│       ├── app.js             # Application controller
│       ├── visuals.js         # Visualization engine
│       ├── transcription.js   # Transcription animations
│       └── translation.js     # Translation animations
├── data/
│   └── codon_table.json       # Complete genetic code
└── README.md                  # This file
```

## 🚦 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (recommended) or file:// protocol support

### Quick Start

1. **Clone or download** the project files

2. **Serve locally** (recommended):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Open in browser**:
   Navigate to `http://localhost:8000/src/index.html`

### Direct File Access
Alternatively, you can open `src/index.html` directly in your browser, though some features may be limited.

## 🎮 How to Use

1. **Welcome Screen**: Start by clicking "Start Interactive Simulation"
2. **DNA Input**: Enter a DNA sequence or use provided examples
3. **Validation**: The system checks for valid nucleotides and proper formatting
4. **Simulation**: Watch the animated transcription and translation process
5. **Controls**: Use play/pause, step-forward, and speed controls
6. **Export**: Save your results for later reference

### Example Sequences

- **Simple**: `ATGGTTTTAAGCGTAA` (16 bases)
- **Insulin Fragment**: `ATGAAAGAACGCATCGCCAAGAACTTCAAGGAGTAA` (36 bases)
- **Beta-Globin**: `ATGGCAGACCTTTCGCTGAAGCTTGACAAGGAACCCGGCGAGTAA` (45 bases)
- **Test Sequence**: `AUGAAACGCAUUUAA` (15 bases, for mRNA input)

### Testing Enhanced Features

To test the new enhanced animations and educational features:

1. **Open the test page**: `src/test_translation.html`
2. **Try different sequences**: Use the provided examples or create your own
3. **Test interactive features**:
   - Hover over nucleotides and amino acids for detailed information
   - Try different animation speeds (Fast/Normal/Slow)
   - Test step-by-step mode for educational purposes
   - Use pause/resume controls during animation
4. **Educational features**: Click the "Open Quiz" button to test the quiz system
5. **Watch for events**: Check browser console for educational event logging

## 🧪 Educational Features

### DNA Sequence Requirements
- Must contain only A, T, G, C nucleotides
- Length must be divisible by 3 (complete codons)
- Must include ATG start codon
- Minimum length: 6 nucleotides

### Biological Accuracy
- Complete standard genetic code (64 codons)
- Proper start/stop codon recognition
- Amino acid categorization by chemical properties
- Color-coded nucleotides and amino acids

### Accessibility
- Screen reader support with ARIA labels
- Keyboard navigation shortcuts
- High contrast mode support
- Reduced motion preferences respected

## 🎨 Customization

### Colors
The application uses CSS custom properties for easy theming:

```css
:root {
  --dna-color: #e74c3c;
  --rna-color: #3498db;
  --protein-color: #2ecc71;
  /* Nucleotide colors */
  --adenine: #ff6b6b;
  --thymine: #4ecdc4;
  --guanine: #45b7d1;
  --cytosine: #f9ca24;
  --uracil: #6c5ce7;
}
```

### Animation Speed
Modify simulation speed via the slider or programmatically:
```javascript
window.centralDogmaApp.simulation.speed = 2; // 1-5 scale
```

## 🔬 Scientific Accuracy

This simulation is designed for educational purposes and represents:
- Standard prokaryotic/eukaryotic transcription
- Cytoplasmic translation process
- Universal genetic code
- Basic molecular biology principles

*Note: Some complex cellular processes are simplified for clarity.*

## 🤝 Contributing

We welcome contributions! Areas for improvement:
- Enhanced animations and visual effects
- Additional educational content
- Quiz and assessment features
- Accessibility enhancements
- Performance optimizations

## 📚 Educational Resources

### Learning Outcomes
By using this simulation, students will:
- Understand the flow of genetic information
- Learn the genetic code and codon usage
- Recognize the importance of start/stop signals
- Appreciate the molecular basis of protein synthesis

### Curriculum Alignment
- High school biology courses
- College molecular biology
- Biochemistry fundamentals
- Genetics education

## 🐛 Troubleshooting

### Common Issues
- **Blank screen**: Ensure JavaScript is enabled
- **Animation not working**: Check browser compatibility
- **Sequence validation fails**: Verify DNA format (A,T,G,C only)

### Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 License

This project is created for educational purposes. Please respect academic integrity guidelines when using in coursework.

## 📞 Contact

For questions, suggestions, or educational partnerships, please reach out through the project repository.

---

**Built with 💙 for biology education**

*"Understanding the molecular basis of life through interactive visualization"*
