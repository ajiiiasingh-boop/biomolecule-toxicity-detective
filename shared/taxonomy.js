/**
 * taxonomy.js — the controlled vocabulary of the whole application.
 *
 * Every case, quiz question, toxin entry and UI chip refers to a biomolecule
 * or a mechanism by the ids defined here. Keeping them in one place means the
 * server and the client can never disagree about what "lipid-peroxidation"
 * means, and the answer checker can validate a submission against a known set
 * instead of comparing free text.
 *
 * Colours: the four channel colours are named after fluorescence-microscopy
 * channels, and were validated for colour-vision deficiency against the app's
 * dark panel surface (#101728). They are always shipped alongside an icon and
 * a written label, so colour never carries identity on its own.
 */

export const BIOMOLECULES = [
  {
    id: 'dna-rna',
    label: 'DNA / RNA',
    short: 'Nucleic acid',
    glyph: 'helix',
    emoji: '\u{1F9EC}',
    color: '#3987e5',
    tagline: 'The information store and the working copy.',
    builtFrom: 'Nucleotides — a sugar, a phosphate and one of four bases',
    keyJob: 'Stores the genetic instructions and carries them to the ribosome',
    whereInCell: ['nucleus', 'mitochondria', 'cytoplasm'],
    summary:
      'DNA is a double-stranded polymer of nucleotides; the two strands are held together by hydrogen bonds between complementary bases and stabilised by base stacking. RNA is its single-stranded working copy, using uracil in place of thymine and ribose in place of deoxyribose.',
    structure: [
      'Backbone of alternating deoxyribose (or ribose) and phosphate, joined by phosphodiester bonds.',
      'Bases project inward: adenine pairs with thymine (uracil in RNA) through two hydrogen bonds, guanine with cytosine through three.',
      'The double helix is further stabilised by stacking interactions between adjacent base pairs — which is also the gap a flat aromatic molecule can slide into.',
      'DNA is long-lived and protected in the nucleus; most RNA is deliberately short-lived, so a block on new synthesis shows up quickly.'
    ],
    howToxicityHits: [
      {
        title: 'Oxidative base damage',
        body: 'Hydroxyl radicals attack the bases. Guanine has the lowest oxidation potential of the four, so it is hit first, giving 8-oxo-2′-deoxyguanosine (8-oxo-dG). 8-oxo-dG mispairs with adenine, so an unrepaired lesion becomes a G:C → T:A transversion at the next round of replication.'
      },
      {
        title: 'Strand breaks',
        body: 'Radical attack on the deoxyribose sugar cuts the backbone. One cut is a single-strand break; two cuts close together on opposite strands give a double-strand break, which the cell marks with phosphorylated histone H2AX (γH2AX) and which shows up as a comet tail in a comet assay.'
      },
      {
        title: 'Adduct formation and alkylation',
        body: 'Reactive metabolites of some environmental compounds attach covalently to a base, forming a bulky adduct. The adduct physically obstructs the polymerase, stalling replication and transcription until nucleotide-excision repair removes it.'
      },
      {
        title: 'Intercalation',
        body: 'A flat, rigid, aromatic molecule can slot between two stacked base pairs. Nothing is broken covalently, but the helix lengthens and locally unwinds, and enzymes that must track along the template — RNA polymerase above all — stall.'
      },
      {
        title: 'Crosslinking',
        body: 'Bifunctional reactive species can tie the two strands together. An interstrand crosslink prevents the strands separating, so neither replication nor transcription can proceed past it.'
      }
    ],
    repair: [
      'Base-excision repair (OGG1 and friends) cuts out single damaged bases such as 8-oxo-dG.',
      'Nucleotide-excision repair removes bulky, helix-distorting adducts as a short patch of strand.',
      'Double-strand breaks go to homologous recombination (accurate, needs a sister chromatid) or non-homologous end joining (fast, error-prone).',
      'p53 halts the cell cycle while repair runs, and triggers apoptosis if the damage is beyond repair.'
    ],
    markers: ['8-oxo-dG', 'Comet assay tail moment', 'γH2AX foci', 'p53 stabilisation']
  },
  {
    id: 'protein',
    label: 'Proteins & Enzymes',
    short: 'Protein',
    glyph: 'fold',
    emoji: '\u{1F9EA}',
    color: '#2a9d8f',
    tagline: 'The machinery — catalysis, structure, signalling, transport.',
    builtFrom: '20 amino acids joined by peptide bonds',
    keyJob: 'Catalyses reactions, builds structure, moves cargo, carries signals',
    whereInCell: ['cytoplasm', 'membrane', 'mitochondria', 'nucleus', 'er'],
    summary:
      'A protein is a chain of amino acids that folds into one specific three-dimensional shape. Function follows that shape absolutely: an enzyme works because its active site is a pocket complementary to its substrate, and loses activity the moment either the pocket or its occupancy changes.',
    structure: [
      'Primary structure: the order of amino acids, held by covalent peptide bonds — the only level that survives ordinary denaturation.',
      'Secondary structure: α-helices and β-sheets, held by hydrogen bonds along the backbone.',
      'Tertiary structure: the whole 3-D fold, held by hydrophobic packing of the core, ionic bonds, hydrogen bonds and disulfide bridges between cysteines.',
      'Quaternary structure: several folded chains assembled into one working unit.'
    ],
    howToxicityHits: [
      {
        title: 'Active-site inhibition',
        body: 'A toxicant binds in or next to the catalytic pocket and blocks catalysis. The protein is still present and still folded, so the amount measured on a blot is unchanged — only the activity falls. If the toxicant binds covalently, or at a site other than the substrate pocket, adding more substrate does not rescue the rate: Vmax falls while Km stays put.'
      },
      {
        title: 'Thiol binding',
        body: 'Soft metal ions such as Hg²⁺, Cd²⁺ and Pb²⁺ bind cysteine –SH groups with very high affinity. Since cysteines are often either catalytic or structural, one binding event can both switch an enzyme off and destabilise the fold that holds it together.'
      },
      {
        title: 'Denaturation',
        body: 'Heat, pH extremes, organic solvents and metal binding disturb the weak interactions that hold the fold. Helices unwind, the buried hydrophobic core becomes exposed to water, and the melting temperature drops. The peptide backbone is untouched — this is unfolding, not digestion.'
      },
      {
        title: 'Aggregation',
        body: 'Exposed hydrophobic patches on partly unfolded chains stick to each other. Soluble protein turns into insoluble aggregate, which the cell cannot use and struggles to clear; the solution becomes visibly turbid.'
      },
      {
        title: 'Oxidative and carbonyl modification',
        body: 'ROS oxidise methionine and cysteine side chains; reactive aldehydes from lipid peroxidation (MDA, 4-HNE) form covalent adducts on lysine, histidine and cysteine. Both change the protein’s chemistry permanently, and protein carbonyl content is the standard readout.'
      },
      {
        title: 'Cofactor displacement',
        body: 'Many enzymes need a specific metal ion. A chemically similar toxic ion can take that seat — Pb²⁺ in place of Zn²⁺ or Ca²⁺, for instance — leaving the protein intact but catalytically wrong.'
      }
    ],
    repair: [
      'Heat-shock proteins (HSP70, HSP90) act as chaperones, holding partly unfolded chains and giving them another chance to fold.',
      'The ubiquitin–proteasome system tags irreparable proteins for destruction.',
      'Autophagy clears aggregates too large for the proteasome.',
      'The unfolded protein response slows new translation so the folding machinery can catch up.'
    ],
    markers: ['Specific activity (µmol/min/mg)', 'Circular dichroism spectrum', 'Melting temperature (Tm)', 'Free thiol content', 'Protein carbonyls', 'Turbidity at 340 nm']
  },
  {
    id: 'lipid',
    label: 'Lipids',
    short: 'Lipid',
    glyph: 'bilayer',
    emoji: '\u{1FAE7}',
    color: '#e0575f',
    tagline: 'The barrier — and the most oxidisable thing in the cell.',
    builtFrom: 'Fatty acid tails plus a polar head group',
    keyJob: 'Forms every membrane, stores energy, carries signals',
    whereInCell: ['membrane', 'mitochondria', 'er', 'nucleus'],
    summary:
      'Membrane lipids are amphipathic: a water-loving head and two water-hating tails. In water they spontaneously arrange tail-to-tail into a bilayer, which is what separates inside from outside, and what separates one organelle from another.',
    structure: [
      'Phospholipid = glycerol backbone + two fatty-acid tails + a phosphate-containing head group.',
      'Saturated tails are straight and pack tightly; unsaturated tails have cis double bonds that kink them and keep the membrane fluid.',
      'Cholesterol sits between the tails and buffers fluidity against temperature change.',
      'A polyunsaturated tail has several double bonds — and between any two of them sits a bis-allylic CH₂ whose C–H bond is the weakest in the whole membrane.'
    ],
    howToxicityHits: [
      {
        title: 'Lipid peroxidation (the chain reaction)',
        body: 'A radical abstracts the weak bis-allylic hydrogen from a polyunsaturated tail, leaving a carbon-centred lipid radical (L•). Oxygen adds almost instantly to give a peroxyl radical (LOO•), which takes a hydrogen from the next polyunsaturated tail — regenerating a lipid radical and propagating the chain. One initiation event can destroy many lipids, and the reaction keeps running after the original toxicant has gone.'
      },
      {
        title: 'Reactive aldehyde products',
        body: 'The peroxidised chains fragment into malondialdehyde (MDA) and 4-hydroxynonenal (4-HNE). These are not inert waste: they are electrophiles that form adducts on proteins and DNA, spreading the damage well beyond the membrane. They are also the standard laboratory markers for lipid peroxidation.'
      },
      {
        title: 'Loss of barrier function',
        body: 'As tails are consumed and shortened, the bilayer loses its packing. Permeability rises, ion gradients collapse, water enters, and cytosolic enzymes such as lactate dehydrogenase (LDH) leak into the medium — which is why LDH release is used as a membrane-integrity readout.'
      },
      {
        title: 'Detergent and solvent effects',
        body: 'Amphipathic or lipophilic compounds insert into the bilayer and disorder it directly, without any radical chemistry, changing membrane fluidity and the behaviour of every protein embedded in it.'
      },
      {
        title: 'Ferroptosis',
        body: 'When iron-dependent lipid peroxidation outruns the glutathione peroxidase 4 (GPX4) defence, the membrane damage itself becomes the death signal — a regulated cell-death programme distinct from apoptosis.'
      }
    ],
    repair: [
      'α-Tocopherol (vitamin E) sits in the bilayer and terminates the chain by donating a hydrogen to a peroxyl radical.',
      'Glutathione peroxidase 4 (GPX4) reduces lipid hydroperoxides before they can fragment.',
      'Phospholipase A₂ excises the damaged fatty acid so a fresh one can be re-acylated in its place.',
      'Vitamin C regenerates the oxidised vitamin E radical, so the two antioxidants work as a pair.'
    ],
    markers: ['MDA (TBARS)', '4-HNE adducts', 'LDH release', 'Membrane fluidity / anisotropy', 'α-Tocopherol content']
  },
  {
    id: 'carbohydrate',
    label: 'Carbohydrates',
    short: 'Carbohydrate',
    glyph: 'ring',
    emoji: '⚗️',
    color: '#b8860b',
    tagline: 'The fuel — and the flux that reports on everything else.',
    builtFrom: 'Sugar monomers, general formula (CH₂O)ₙ',
    keyJob: 'Supplies energy, stores it as glycogen, decorates proteins and lipids',
    whereInCell: ['cytoplasm', 'mitochondria', 'membrane'],
    summary:
      'Carbohydrates run from single sugars such as glucose, through storage polymers such as glycogen, to the glycan chains attached to membrane proteins and lipids. In a toxicity investigation they matter less as a target to be destroyed and more as a flux to be read: how much fuel goes in, and how much ATP comes out.',
    structure: [
      'Monosaccharides (glucose, fructose, galactose) are the single units.',
      'Disaccharides (sucrose, lactose, maltose) are two units joined by a glycosidic bond.',
      'Polysaccharides: glycogen is the branched animal storage form; starch is its plant counterpart; cellulose and chitin are structural.',
      'Glycoproteins and glycolipids carry sugar chains on the cell surface, where they handle recognition and adhesion.'
    ],
    howToxicityHits: [
      {
        title: 'Blocking the aerobic arm',
        body: 'If a toxicant stops pyruvate being oxidised in the mitochondrion, glycolysis in the cytosol still runs — but the cell must convert pyruvate to lactate to regenerate NAD⁺ and keep it running. Glucose uptake and lactate output rise together while oxygen consumption falls.'
      },
      {
        title: 'The ATP accounting',
        body: 'Complete aerobic oxidation of one glucose yields roughly 30–32 ATP. Anaerobic glycolysis yields 2. So a cell forced onto the anaerobic route can triple its fuel consumption and still end up with a fraction of its former ATP — which is exactly the signature this kind of lesion leaves.'
      },
      {
        title: 'Inhibition of glycolytic enzymes',
        body: 'Glycolysis is a ten-step pathway, and each step is an enzyme. Anything that inhibits one of them — GAPDH, with its catalytic cysteine, is a common casualty of oxidative and thiol-binding stress — creates a bottleneck: intermediates before the block pile up, everything after it runs dry.'
      },
      {
        title: 'Glycogen mobilisation and depletion',
        body: 'Falling ATP activates AMPK, the cell’s low-energy alarm, which mobilises glycogen. Stores drain quickly, and once they are gone the cell has no buffer left.'
      },
      {
        title: 'Non-enzymatic glycation',
        body: 'Over long exposures, sugars react non-enzymatically with protein amino groups to form advanced glycation end-products (AGEs), which crosslink proteins and change their mechanical properties.'
      }
    ],
    repair: [
      'AMPK activation switches the cell from building to burning and mobilises stored fuel.',
      'Glycogenolysis releases glucose-1-phosphate from glycogen to feed glycolysis directly.',
      'Upregulated glucose transporters raise uptake to compensate for the poor yield.',
      'The pentose phosphate pathway diverts glucose to make NADPH, which is what regenerates reduced glutathione — so carbohydrate flux is also the cell’s antioxidant supply line.'
    ],
    markers: ['Glucose consumption', 'Lactate output', 'Intracellular ATP', 'Oxygen consumption rate (OCR)', 'Glycogen content', 'ATP:ADP ratio']
  }
];

export const MECHANISMS = [
  {
    id: 'enzyme-inhibition',
    label: 'Enzyme inhibition',
    biomolecule: 'protein',
    oneLine: 'A toxicant occupies or blocks a catalytic site, so a present, correctly folded enzyme stops working.',
    tell: 'Activity falls while the amount of protein and its fold are unchanged.'
  },
  {
    id: 'oxidative-damage',
    label: 'Oxidative damage',
    biomolecule: 'dna-rna',
    oneLine: 'Reactive oxygen species chemically modify a biomolecule — classically oxidising guanine in DNA and breaking the sugar–phosphate backbone.',
    tell: 'ROS rise, the antioxidant buffer is consumed, and damage markers rise together with dose.'
  },
  {
    id: 'lipid-peroxidation',
    label: 'Lipid peroxidation / membrane damage',
    biomolecule: 'lipid',
    oneLine: 'A radical chain reaction consumes polyunsaturated fatty acids in the bilayer and destroys barrier function.',
    tell: 'MDA and 4-HNE rise, polyunsaturated tails are consumed, and the damage keeps spreading after the toxicant is gone.'
  },
  {
    id: 'protein-denaturation',
    label: 'Protein denaturation / structural alteration',
    biomolecule: 'protein',
    oneLine: 'The three-dimensional fold is lost while the peptide backbone stays intact, and exposed hydrophobic surfaces drive aggregation.',
    tell: 'Secondary-structure content and melting temperature fall while total protein stays constant.'
  },
  {
    id: 'metabolic-interference',
    label: 'Interference with carbohydrate / energy metabolism',
    biomolecule: 'carbohydrate',
    oneLine: 'Fuel handling is disrupted, so the cell consumes more carbohydrate and recovers less ATP from it.',
    tell: 'Glucose uptake and lactate rise while oxygen consumption and ATP fall.'
  },
  {
    id: 'nucleic-acid-intercalation',
    label: 'Nucleic acid intercalation / transcription interference',
    biomolecule: 'dna-rna',
    oneLine: 'A flat aromatic molecule slides between stacked base pairs, distorting the helix and stalling the polymerases that must read it.',
    tell: 'New RNA synthesis collapses first; DNA content per cell is unchanged.'
  },
  {
    id: 'substrate-depletion',
    label: 'Substrate depletion',
    biomolecule: 'carbohydrate',
    oneLine: 'The reaction slows because the starting material has run out, not because anything is damaged.',
    tell: 'Substrate concentration falls. If substrate is piling up instead, this is not your answer.'
  },
  {
    id: 'membrane-transport-block',
    label: 'Membrane transport block',
    biomolecule: 'lipid',
    oneLine: 'A transporter is blocked, so a molecule cannot cross an intact membrane.',
    tell: 'Concentrations differ sharply across a membrane that is otherwise undamaged.'
  }
];

export const biomoleculeById = (id) => BIOMOLECULES.find((b) => b.id === id) || null;
export const mechanismById = (id) => MECHANISMS.find((m) => m.id === id) || null;
export const BIOMOLECULE_IDS = BIOMOLECULES.map((b) => b.id);
export const MECHANISM_IDS = MECHANISMS.map((m) => m.id);
