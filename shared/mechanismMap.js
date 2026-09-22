/**
 * mechanismMap.js — the five-stage chain from exposure to biological effect,
 * plus the interactive cell map used by the Cell Visualization page.
 */

export const MECHANISM_MAP = {
  title: 'From exposure to effect',
  intro:
    'Toxicity is a chain, not an event. Each stage has its own timescale, its own laboratory readouts and its own defences, and a toxicant can be stopped at any of them. Reading a case means working out which link has actually been broken — and the answer is rarely the stage where the symptom appears.',
  stages: [
    {
      id: 'exposure',
      index: 1,
      name: 'Toxic exposure',
      short: 'A substance reaches the cell',
      timescale: 'Seconds to hours',
      body:
        'Before anything can be damaged, the substance has to get to the cell and then into it. Lipophilic molecules cross the membrane by simple diffusion; charged ones need a transporter, and often ride in on a transporter built for something chemically similar. Dose at this stage is not the dose that was applied — it is the concentration that actually arrives, which is why absorption, distribution, metabolism and excretion sit at the front of every toxicology course.',
      detail: [
        'Route and duration decide how much arrives, and acute and chronic exposure to the same substance can produce entirely different lesions.',
        'Many compounds arrive harmless and are converted to their reactive form inside the cell by phase I metabolism — bioactivation.',
        'Phase II conjugation and efflux pumps work in the opposite direction, removing the compound before it can act.'
      ],
      defences: ['Barrier membranes', 'Efflux transporters', 'Phase II conjugation'],
      markers: ['Internal dose', 'Tissue distribution', 'Metabolite profile']
    },
    {
      id: 'interaction',
      index: 2,
      name: 'Molecular interaction',
      short: 'It binds or reacts with something',
      timescale: 'Milliseconds to minutes',
      body:
        'The toxicant meets its molecular target. This is the step that decides everything downstream, and it comes in two flavours. Selective binding — an inhibitor in an active site, a metal in a zinc finger, an intercalator between base pairs — hits one target with high affinity, so effects appear at low dose and are specific. Indiscriminate reaction — a hydroxyl radical, a reactive electrophile — hits whatever is nearest, so the damage pattern is decided by where the reactive species was generated.',
      detail: [
        'Selective interactions are often reversible and often competitive; indiscriminate ones are usually covalent and permanent.',
        'Covalent binding is why some effects outlast the presence of the toxicant entirely.',
        'The same molecule can do both: a metal ion can occupy a specific site and drive radical chemistry at the same time.'
      ],
      defences: ['Glutathione and other nucleophile scavengers', 'Metallothionein', 'Antioxidant enzymes'],
      markers: ['Binding affinity', 'Adduct measurement', 'Target occupancy']
    },
    {
      id: 'damage',
      index: 3,
      name: 'Biomolecular damage',
      short: 'A biomolecule stops being what it was',
      timescale: 'Minutes to hours',
      body:
        'The interaction becomes a change in a biomolecule. A protein loses its catalytic activity or its fold; DNA acquires an oxidised base, an adduct or a break; a membrane loses its polyunsaturated tails and its packing; a metabolic route stops carrying flux. This is the stage the Toxicity Detective cases are built to diagnose, because it is where the mechanism is still legible — further downstream everything starts to look like the same generic distress.',
      detail: [
        'Amplification begins here: one inhibited enzyme costs the cell every reaction downstream of it, and one initiating radical can peroxidise hundreds of lipids.',
        'Damage is not equivalent across classes. A damaged protein can be replaced; a mutated gene is copied into every daughter cell.',
        'Repair is running the entire time, so what a measurement records is the balance between damage and repair, not damage alone.'
      ],
      defences: ['DNA repair pathways', 'Chaperones and the proteasome', 'Vitamin E and GPX4', 'Membrane remodelling'],
      markers: ['8-oxo-dG', 'Protein carbonyls / Tm', 'MDA and 4-HNE', 'Enzyme specific activity']
    },
    {
      id: 'dysfunction',
      index: 4,
      name: 'Cellular dysfunction',
      short: 'The cell stops working properly',
      timescale: 'Hours to days',
      body:
        'Molecular damage becomes a cell that no longer does its job. ATP falls, ion gradients slip, signalling pathways fire wrongly or not at all, the cell cycle stops at a checkpoint. The cell is not passive here: it mounts a stress response — antioxidant genes, chaperones, repair enzymes, autophagy — and much of what is measurable at this stage is the response rather than the injury.',
      detail: [
        'Below a threshold the cell adapts and recovers, often with raised defences; above it, the damage is committed.',
        'The commitment point is usually mitochondrial: permeabilisation releases cytochrome c and starts apoptosis.',
        'Which death pathway follows depends on the lesion — apoptosis if ATP is still available, necrosis if it is not, ferroptosis if the lesion is runaway lipid peroxidation.'
      ],
      defences: ['Adaptive stress responses', 'Autophagy', 'Cell cycle checkpoints'],
      markers: ['ATP:ADP ratio', 'Mitochondrial membrane potential', 'Caspase activation', 'Cell cycle distribution']
    },
    {
      id: 'effect',
      index: 5,
      name: 'Biological effect',
      short: 'The organism shows it',
      timescale: 'Days to years',
      body:
        'Enough affected cells, and the tissue and then the organism show it. The form the effect takes depends on which biomolecule was hit and in which tissue: a mutated gene in a dividing tissue points toward cancer; lost neurons point toward a neurological deficit; an inhibited synaptic enzyme points toward an acute functional crisis. This is the stage a clinician or a regulator sees — and it is the stage furthest removed from the mechanism, which is exactly why mechanistic investigation is worth doing.',
      detail: [
        'Effects separate into acute (immediate, dose-driven) and chronic (accumulated over long exposure).',
        'Different tissues have very different susceptibilities to the same lesion, largely because of how fast they divide and how much they metabolise.',
        'Working backwards from an effect to a mechanism is much harder than working forwards — which is the argument for measuring at stages 2 and 3.'
      ],
      defences: ['Tissue regeneration', 'Immune clearance of damaged cells', 'Physiological compensation'],
      markers: ['Histopathology', 'Organ function tests', 'Clinical or epidemiological outcome']
    }
  ]
};

/**
 * cellMap — coordinates are in the 0–100 space of the cell diagram's viewBox,
 * so the React component can place hotspots without hard-coding pixel values.
 */
export const CELL_MAP = {
  parts: [
    {
      id: 'membrane',
      name: 'Plasma membrane',
      biomolecule: 'lipid',
      x: 50,
      y: 6,
      labelSide: 'top',
      function:
        'A phospholipid bilayer with embedded proteins. It separates inside from outside, holds the ion gradients the cell spends most of its ATP maintaining, and is the first thing any toxicant must cross.',
      underToxicity:
        'Lipid peroxidation consumes its polyunsaturated tails; the bilayer loses packing, permeability rises, ion gradients collapse and cytosolic enzymes such as LDH escape into the medium.',
      caseIds: ['case-03']
    },
    {
      id: 'cytoplasm',
      name: 'Cytoplasm',
      biomolecule: 'carbohydrate',
      x: 26,
      y: 68,
      labelSide: 'left',
      function:
        'The aqueous interior where glycolysis runs — the ten-step conversion of glucose to pyruvate — along with most protein synthesis and the majority of soluble enzyme activity.',
      underToxicity:
        'When the mitochondrial route is blocked, glycolysis is forced to run anaerobically here: pyruvate becomes lactate to regenerate NAD⁺, fuel consumption rises and ATP yield collapses.',
      caseIds: ['case-05', 'case-01']
    },
    {
      id: 'nucleus',
      name: 'Nucleus',
      biomolecule: 'dna-rna',
      x: 62,
      y: 42,
      labelSide: 'right',
      function:
        'Holds the genome and is where transcription happens. Its nucleolus is the sub-compartment where ribosomal RNA is made.',
      underToxicity:
        'Hydroxyl radicals oxidise guanine and break the backbone; bulky adducts and intercalated molecules stall the polymerases. p53 stabilises and the cell cycle stops while repair runs.',
      caseIds: ['case-02', 'case-06']
    },
    {
      id: 'dna',
      name: 'Chromatin / DNA',
      biomolecule: 'dna-rna',
      x: 62,
      y: 42,
      labelSide: 'right',
      nested: 'nucleus',
      function:
        'The double-stranded information store, wound around histones. Copied before every division and transcribed continuously.',
      underToxicity:
        '8-oxo-dG from oxidised guanine, single- and double-strand breaks from sugar attack, bulky adducts from bioactivated environmental compounds, and helix distortion from intercalators.',
      caseIds: ['case-02', 'case-06']
    },
    {
      id: 'mitochondria',
      name: 'Mitochondria',
      biomolecule: 'carbohydrate',
      x: 33,
      y: 34,
      labelSide: 'left',
      function:
        'Completes the oxidation of pyruvate and fatty acids and runs the electron transport chain, producing the large majority of the cell’s ATP. Also the main site of background ROS production.',
      underToxicity:
        'Respiratory chain inhibitors stop electrons reaching oxygen; oxygen consumption collapses and the cell falls back on anaerobic glycolysis. Damaged mitochondria also leak more ROS, which feeds every other lesion.',
      caseIds: ['case-05', 'case-02']
    },
    {
      id: 'er',
      name: 'Endoplasmic reticulum',
      biomolecule: 'protein',
      x: 74,
      y: 68,
      labelSide: 'right',
      function:
        'Where secreted and membrane proteins are folded and quality-controlled, and where much of phase I metabolism (cytochrome P450) takes place — so it is also where many toxicants are bioactivated.',
      underToxicity:
        'Misfolded protein accumulates and triggers the unfolded protein response: more chaperones, more degradation, less new translation. If the load is not cleared, the response switches to apoptosis.',
      caseIds: ['case-04']
    },
    {
      id: 'enzymes',
      name: 'Cytosolic enzymes',
      biomolecule: 'protein',
      x: 44,
      y: 80,
      labelSide: 'left',
      function:
        'Folded catalytic proteins carrying out the soluble chemistry of the cell. Each depends absolutely on its active-site geometry.',
      underToxicity:
        'An inhibitor occupies the active site and activity falls with abundance unchanged; a thiol-binding metal occupies structural cysteines and the fold itself comes apart.',
      caseIds: ['case-01', 'case-04']
    }
  ],

  /** Overlay routes drawn when a mechanism is selected on the cell map. */
  routes: {
    'enzyme-inhibition': {
      label: 'Active-site inhibition',
      path: ['membrane', 'cytoplasm', 'enzymes'],
      note: 'Toxicant crosses the membrane, reaches a cytosolic enzyme and occupies its catalytic site. Activity falls; the protein is untouched otherwise.'
    },
    'oxidative-damage': {
      label: 'Oxidative DNA damage',
      path: ['membrane', 'mitochondria', 'nucleus', 'dna'],
      note: 'Radical chemistry near chromatin oxidises guanine and cuts the backbone. Mitochondria are both a source of ROS and a casualty of them.'
    },
    'lipid-peroxidation': {
      label: 'Lipid peroxidation',
      path: ['membrane', 'cytoplasm'],
      note: 'The chain reaction runs within the bilayer itself and exports reactive aldehydes into the cytosol, where they form adducts on proteins and DNA.'
    },
    'protein-denaturation': {
      label: 'Denaturation and aggregation',
      path: ['membrane', 'cytoplasm', 'enzymes', 'er'],
      note: 'Folds come apart in the cytosol; the ER’s quality-control system registers the load and mounts the unfolded protein response.'
    },
    'metabolic-interference': {
      label: 'Energy metabolism block',
      path: ['membrane', 'cytoplasm', 'mitochondria'],
      note: 'Glycolysis still runs in the cytosol, but the mitochondrial arm is blocked — so the cell burns more glucose for far less ATP.'
    },
    'nucleic-acid-intercalation': {
      label: 'Intercalation and transcription block',
      path: ['membrane', 'cytoplasm', 'nucleus', 'dna'],
      note: 'A planar molecule wedges between base pairs and stalls RNA polymerase. New RNA collapses first; protein synthesis follows.'
    }
  }
};
