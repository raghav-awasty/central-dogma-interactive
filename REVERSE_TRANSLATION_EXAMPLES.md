# 🔄 Reverse Translation Tool - Input Examples

## Basic Usage

### 1. **Simple Short Proteins** (Great for beginners)
```
MWK
```
- **M** = Methionine (start codon)
- **W** = Tryptophan 
- **K** = Lysine

**Educational Value**: Shows how a simple 3-amino acid protein requires at least 9 DNA bases (3 codons × 3 bases each).

### 2. **With Stop Codon**
```
MWKRGS*
```
- Ends with `*` (stop codon)
- **Educational Value**: Demonstrates complete gene structure from start to stop

### 3. **Common Protein Motifs**
```
MGKV
```
- Common N-terminal sequence
- Shows methionine (start) followed by typical amino acids

## Intermediate Examples

### 4. **Insulin B-chain (first 10 amino acids)**
```
FVNQHLCGSH
```
**Real Biology**: This is the beginning of human insulin B-chain
- **F** = Phenylalanine
- **V** = Valine  
- **N** = Asparagine
- **Q** = Glutamine
- **H** = Histidine
- **L** = Leucine
- **C** = Cysteine
- **G** = Glycine
- **S** = Serine
- **H** = Histidine

### 5. **GFP-like sequence**
```
MVSKGEE*
```
**Real Biology**: Similar to Green Fluorescent Protein start
- Shows how fluorescent proteins begin

### 6. **Enzyme Active Site Motif**
```
GXGXXG
```
Wait - **Don't use X!** Use actual amino acids like:
```
GAGAAG
```
- **Educational Value**: Shows nucleotide-binding fold common in enzymes

## Advanced Examples

### 7. **Complete Small Peptide**
```
MKFLVLLFNILCLFPVLAADNHGVGPQGAS*
```
**Real Biology**: Signal peptide sequence
- **Educational Value**: Shows how proteins are targeted to specific cellular locations

### 8. **Antimicrobial Peptide**
```
KWKLFKKIEKVGQNIRD*
```
**Real Biology**: Similar to magainin antimicrobial peptides
- Rich in **K** (Lysine) and **R** (Arginine) - positively charged
- **Educational Value**: Shows how amino acid composition affects protein function

### 9. **DNA-Binding Domain**
```
RKQKR*
```
**Real Biology**: Similar to nuclear localization signals
- Multiple basic amino acids (R, K) that bind to negatively charged DNA

## 🎯 **Strategy Selection Guide**

### **Most Common Codons** (Recommended for beginners)
- Uses the most frequently occurring codons in living organisms
- **Best for**: Understanding natural gene sequences
- **Example**: Leucine → CUG (most common) instead of CUA (rare)

### **GC-Rich Codons**
- Selects codons with more G and C bases
- **Best for**: Stable gene expression, industrial biotechnology
- **Educational Value**: Shows how GC content affects DNA stability

### **GC-Poor Codons** 
- Selects codons with more A and T bases
- **Best for**: Understanding expression in AT-rich organisms
- **Educational Value**: Shows adaptation to different organisms

### **Balanced Selection**
- Uses natural frequency distributions
- **Best for**: Realistic gene design
- **Educational Value**: Shows probability in genetics

### **Random Selection**
- Picks randomly from available codons
- **Best for**: Understanding codon degeneracy
- **Educational Value**: Shows multiple solutions exist

## 🔬 **Educational Scenarios**

### **Scenario 1: Codon Degeneracy**
Try the same protein with different strategies:
```
Input: LVFF
Strategy 1: Most Common → Compare results
Strategy 2: GC-Rich → Compare results
```
**Learning**: Same protein, different DNA sequences!

### **Scenario 2: Stop Codon Impact**
Compare:
```
MWKRGS    (without stop)
MWKRGS*   (with stop)
```
**Learning**: Stop codons add 3 more DNA bases

### **Scenario 3: Amino Acid Properties**
Try sequences rich in different types:
```
KKKKK*    (Basic amino acids)
DDDDD*    (Acidic amino acids)  
FFFFF*    (Aromatic amino acids)
AAAAA*    (Small amino acids)
```
**Learning**: How amino acid properties affect the genetic code

## ❌ **Common Mistakes to Avoid**

1. **Don't use invalid letters**: O, U, X, Z are not standard amino acids
2. **Don't use lowercase** (tool handles this, but be consistent)
3. **Don't exceed 100 amino acids** (visualization limit)
4. **Don't include numbers or special characters**

## ✅ **Quick Start Recommendations**

**For Students**: Start with `MWK*` and try different strategies
**For Educators**: Use `MGKV*` to show degeneracy concepts  
**For Advanced Users**: Try real protein sequences like insulin or GFP fragments

## 🎓 **Learning Objectives Met**

- Understanding **codon degeneracy** (multiple codons → same amino acid)
- Exploring **codon optimization** strategies
- Visualizing **reverse molecular biology** workflows
- Connecting **protein structure to genetic information**
- Appreciating **biotechnology applications** (gene synthesis, protein engineering)