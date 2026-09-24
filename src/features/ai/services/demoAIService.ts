import {
  ChatMessage,
  StructuredSolution,
  PracticeSet,
  TestSession,
  SnapSolveAnalysisResult,
  AIConversation,
} from '../../../types/ai';

export const DEMO_SNAP_SOLVE_RESULT: SnapSolveAnalysisResult = {
  detectedQuestion:
    'A convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 30 cm. What is the power and combined focal length of this optical system?',
  subject: 'Physics',
  topic: 'Ray Optics & Optical Instruments',
  confidence: 0.98,
  isDemo: true,
  solution: {
    detectedQuestion:
      'A convex lens of focal length 20 cm is placed in contact with a concave lens of focal length 30 cm. What is the power and combined focal length of this optical system?',
    subject: 'Physics',
    topic: 'Combination of Thin Lenses in Contact',
    understanding:
      'The problem requires finding the net power and equivalent focal length when two thin coaxial lenses (one converging/convex, one diverging/concave) are held in optical contact.',
    given: [
      'Focal length of convex lens, f₁ = +20 cm = +0.20 m',
      'Focal length of concave lens, f₂ = -30 cm = -0.30 m',
    ],
    formulas: [
      'Equivalent focal length (F): 1/F = 1/f₁ + 1/f₂',
      'Net optical power (P in Diopters, D): P = P₁ + P₂ = 1/f₁(in meters) + 1/f₂(in meters)',
    ],
    steps: [
      {
        stepNumber: 1,
        title: 'Determine individual lens powers in diopters',
        explanation:
          'Power P is the inverse of focal length measured in meters.\nP₁ = 1 / (+0.20 m) = +5.0 D\nP₂ = 1 / (-0.30 m) = -3.33 D',
        mathExpression: 'P_1 = +5.0\\text{ D}, \\quad P_2 = -3.33\\text{ D}',
      },
      {
        stepNumber: 2,
        title: 'Calculate net power of the combination',
        explanation:
          'When lenses are in direct contact, their powers add algebraically:\nP_net = P₁ + P₂ = +5.0 D + (-3.33 D) = +1.67 D (or +5/3 D)',
        mathExpression: 'P_{\\text{net}} = +1.67\\text{ D}',
      },
      {
        stepNumber: 3,
        title: 'Calculate the equivalent focal length',
        explanation:
          'Using 1/F = 1/f₁ + 1/f₂:\n1/F = (1/20) + (-1/30) = (3 - 2)/60 = 1/60 cm⁻¹.\nTherefore, F = +60 cm = +0.60 m.',
        mathExpression: 'F = +60\\text{ cm} = +0.60\\text{ m}',
      },
    ],
    finalAnswer:
      'Net Power P = +1.67 D (converging)\nEquivalent Focal Length F = +60 cm (+0.60 m)',
    commonPitfalls: [
      'Forgetting the negative sign convention for the concave lens (f₂ is negative).',
      'Calculating power using centimeters instead of converting focal length to meters.',
    ],
    alternativeMethod:
      'Directly calculate F = (f₁ · f₂) / (f₁ + f₂) = (20 · -30) / (20 - 30) = -600 / -10 = +60 cm.',
  },
};

export const INITIAL_DEMO_CONVERSATIONS: AIConversation[] = [
  {
    id: 'conv-physics-optics',
    title: 'Optics: Lens Combination & Power',
    subject: 'Physics',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content:
          'Can you explain how lens combinations work and why power is additive when lenses touch?',
        timestamp: '10:14 AM',
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `### Principle of Thin Lens Combinations in Optical Contact

When two thin lenses of focal lengths $f_1$ and $f_2$ are placed in direct contact along the same optical axis:

1. **Sequential Refraction**: The first lens forms a virtual or real image $I_1$ of the source object. This intermediate image acts as the virtual object for the second lens, which then produces the final image $I$.
2. **Derivation of Equivalent Focal Length**:
   Using the thin lens equation:
   $$\\frac{1}{v_1} - \\frac{1}{u} = \\frac{1}{f_1}$$
   $$\\frac{1}{v} - \\frac{1}{v_1} = \\frac{1}{f_2}$$
   Adding the two expressions eliminates the intermediate image distance $v_1$:
   $$\\frac{1}{v} - \\frac{1}{u} = \\frac{1}{f_1} + \\frac{1}{f_2} = \\frac{1}{F}$$

3. **Additive Optical Power**:
   Since power $P = \\frac{1}{f}$ (with $f$ measured in meters), the algebraic sum of individual powers gives total power:
   $$P = P_1 + P_2 + \\dots + P_n$$

This is why optometrists use trial lens sets: they simply stack corrective lenses and add powers arithmetically.`,
        timestamp: '10:15 AM',
        isDemo: true,
        suggestedActions: [
          { type: 'explain-simpler', label: 'Explain Simpler' },
          { type: 'give-example', label: 'Give an Example' },
          { type: 'test-me', label: 'Test Me on Optics' },
          {
            type: 'add-revision',
            label: 'Add to Revision',
            payload: { topic: 'Lens Combinations & Power', subject: 'Physics' },
          },
          {
            type: 'quick-focus',
            label: 'Start 30-min Quick Focus',
            payload: { duration: 30, topic: 'Optics Lens Derivations', subject: 'Physics' },
          },
        ],
      },
    ],
  },
  {
    id: 'conv-math-calculus',
    title: 'Integration by Parts Mastery',
    subject: 'Mathematics',
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'What is the fastest way to solve $\\int x^2 e^{2x} dx$ without making algebra mistakes?',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `### The Tabular Method (DI Method) for Polynomial × Exponential

For integrals of the form $\\int P(x) \\cdot f(x) dx$ where $P(x)$ is a polynomial, standard Integration by Parts repeated multiple times is prone to sign mistakes. The **Tabular Method** solves this in 30 seconds:

| Sign | Derivative ($D$) | Integral ($I$) |
| :---: | :---: | :---: |
| $+$ | $x^2$ | $e^{2x}$ |
| $-$ | $2x$ | $\\frac{1}{2}e^{2x}$ |
| $+$ | $2$ | $\\frac{1}{4}e^{2x}$ |
| $-$ | $0$ (terminate) | $\\frac{1}{8}e^{2x}$ |

#### Multiply across the diagonals:
1. $(+) \\cdot (x^2) \\cdot \\left(\\frac{1}{2}e^{2x}\\right) = \\frac{1}{2}x^2 e^{2x}$
2. $(-) \\cdot (2x) \\cdot \\left(\\frac{1}{4}e^{2x}\\right) = -\\frac{1}{2}x e^{2x}$
3. $(+) \\cdot (2) \\cdot \\left(\\frac{1}{8}e^{2x}\\right) = +\\frac{1}{4}e^{2x}$

#### Combine & Factor:
$$\\int x^2 e^{2x} dx = e^{2x} \\left( \\frac{1}{2}x^2 - \\frac{1}{2}x + \\frac{1}{4} \\right) + C$$`,
        timestamp: 'Yesterday',
        isDemo: true,
        suggestedActions: [
          { type: 'test-me', label: 'Test Me on Tabular Method' },
          {
            type: 'add-notes',
            label: 'Save to Formula Notes',
            payload: {
              title: 'Tabular Integration by Parts (DI Method)',
              subject: 'Mathematics',
              content: 'Quick method for polynomial * exp/trig integrals.',
              formulaSnippets: ['\\int u dv = uv - \\int v du', 'Tabular D-I rule'],
            },
          },
          {
            type: 'quick-focus',
            label: 'Start 30-min Quick Focus',
            payload: { duration: 30, topic: 'Calculus Integration Practice', subject: 'Mathematics' },
          },
        ],
      },
    ],
  },
];

/**
 * Deterministic fallback responses for academic prompts if API key is not configured or offline.
 */
export function getDeterministicDemoAnswer(
  prompt: string,
  subject?: string
): { content: string; actions: any[] } {
  const lower = prompt.toLowerCase();

  // 1. "What should I study today" / Study plan
  if (lower.includes('what should i study') || lower.includes('study plan') || lower.includes('decide what to study')) {
    return {
      content: `### Strategic Academic Recommendation

Based on your current curriculum timeline and upcoming **Physics Exam in 18 days**:

1. **Priority 1 (Due Spaced Repetition)**:
   - **Optics & Lens Refraction**: Last reviewed 4 days ago. Active recall retention is at 60%.
   - **Recommended Time**: 25 minutes.

2. **Priority 2 (High-Yield Syllabus Gap)**:
   - **Calculus: Differential Equations**: Completion is at 45% with high weightage on your semester final.
   - **Recommended Time**: 40 minutes.

3. **Priority 3 (Pending Task Deadline)**:
   - **Literature Macbeth Commentary Draft**: Due in 3 days. Dedicate 30 minutes to thesis structuring.

Would you like to immediately launch an adaptive **30-minute Quick Focus session** targeting Optics active recall?`,
      actions: [
        {
          type: 'quick-focus',
          label: 'Start 30-min Quick Focus',
          payload: { duration: 30, topic: 'Ray Optics Recall & Formulas', subject: 'Physics' },
        },
        { type: 'test-me', label: 'Test Me on Optics' },
        {
          type: 'add-revision',
          label: 'Schedule Revision',
          payload: { topic: 'Differential Equations', subject: 'Mathematics' },
        },
      ],
    };
  }

  // 2. Macbeth / Literature
  if (lower.includes('macbeth') || lower.includes('literature') || lower.includes('theme') || lower.includes('quote')) {
    return {
      content: `### Thematic Analysis: Illegitimate Power & Paranoia in *Macbeth* Act 3

In Act 3, Shakespeare dramatizes the psychological collapse of a tyrant who has achieved his ambition but destroyed his peace of mind.

#### Key Conceptual Anchor:
> *"To be thus is nothing, but to be safely thus."* (Act 3, Scene 1)

* **Paranoia as the Punishment of Ambition**: Macbeth discovers that violence does not conclude narrative; it invites retaliation. His fear of Banquo stems not from physical vulnerability, but from Banquo’s *"royalty of nature"* and the witches' prophecy of an enduring lineage.
* **The Banquet Scene (Scene 4)**: The spectral appearance of Banquo's ghost marks the breakdown between private guilt and public performance. Lady Macbeth’s frantic attempts to maintain social decorum fail because guilt cannot be governed by royal command.
* **Contrast with Duncan's Sleep**: *"Duncan is in his grave; After life's fitful fever he sleeps well."* Shakespeare highlights the tragic irony that the murdered king possesses the peace that the reigning monarch cannot attain.`,
      actions: [
        { type: 'explain-simpler', label: 'Explain Simpler' },
        {
          type: 'add-notes',
          label: 'Save to Notes',
          payload: {
            title: 'Macbeth Act 3 Paranoia & Banquet Breakdown',
            subject: 'Literature',
            content: 'Key quotes and structural breakdown of illegitimate power.',
          },
        },
        {
          type: 'quick-focus',
          label: 'Start 30-min Quick Focus',
          payload: { duration: 30, topic: 'Macbeth Essay Planning', subject: 'Literature' },
        },
      ],
    };
  }

  // 3. Chemistry kinetics / Arrhenius
  if (lower.includes('chemistry') || lower.includes('kinetics') || lower.includes('arrhenius') || lower.includes('reaction')) {
    return {
      content: `### Chemical Kinetics: The Arrhenius Equation & Activation Energy

The Arrhenius equation mathematically quantifies how reaction rate constants ($k$) increase exponentially with absolute temperature ($T$ in Kelvin):

$$k = A \\cdot e^{-\\frac{E_a}{R \\cdot T}}$$

#### Variable Definitions:
* **$k$**: Reaction rate constant
* **$A$**: Pre-exponential frequency factor (frequency and steric orientation of collisions)
* **$E_a$**: Activation energy (Joules per mole, $\\text{J/mol}$)
* **$R$**: Universal gas constant ($8.314 \\text{ J}/(\\text{mol}\\cdot\\text{K})$)
* **$T$**: Absolute temperature in Kelvin ($^\\circ\\text{C} + 273.15$)

#### Two-Temperature Linear Form (High-Yield Exam Formula):
Taking natural logarithms at two different temperatures $T_1$ and $T_2$:
$$\\ln\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{R} \\left( \\frac{1}{T_1} - \\frac{1}{T_2} \\right)$$

**Key Exam Rule**: Always convert temperature to Kelvin and ensure $E_a$ units match $R$ (convert $\\text{kJ/mol}$ to $\\text{J/mol}$ before calculating).`,
      actions: [
        { type: 'give-example', label: 'Show Numerical Example' },
        { type: 'test-me', label: 'Test Me on Kinetics' },
        {
          type: 'add-notes',
          label: 'Add to Formula Sheet',
          payload: {
            title: 'Arrhenius Equation Formulas',
            subject: 'Chemistry',
            formulaSnippets: ['k = A * exp(-Ea / (R*T))', 'ln(k2/k1) = (Ea/R) * (1/T1 - 1/T2)'],
          },
        },
      ],
    };
  }

  // 4. Default STEM / Focus study response
  return {
    content: `### Tutor Solution & Conceptual Breakdown

Here is the systematic methodology to approach this problem:

1. **Identify the Given Conditions**:
   - Separate known experimental constants from the target unknowns.
   - Standardize all metric units (e.g. convert grams to kg, cm to meters, or $^\\circ\\text{C}$ to Kelvin).

2. **Select the Governing Principle**:
   - State the fundamental physical law or mathematical theorem connecting these variables.
   - Note boundary conditions and sign conventions before inserting numerical values.

3. **Step-by-Step Execution**:
   - Isolate the target variable algebraically first before substituting numbers.
   - Carry units through intermediate steps to verify dimensional consistency.

Would you like to solve an applied example together or generate a 3-question practice set?`,
    actions: [
      { type: 'give-example', label: 'Give an Example' },
      { type: 'practice-set', label: 'Generate Practice Set' },
      { type: 'test-me', label: 'Test Me on This' },
      {
        type: 'quick-focus',
        label: 'Start 30-min Quick Focus',
        payload: { duration: 30, topic: prompt.slice(0, 30), subject: subject || 'General Study' },
      },
    ],
  };
}

export const DEMO_PRACTICE_SET: PracticeSet = {
  subject: 'Physics',
  topic: 'Ray Optics: Refraction and Thin Lenses',
  difficulty: 'Medium',
  completed: false,
  questions: [
    {
      id: 'pq-opt-1',
      conceptTag: 'Optical Power',
      question:
        'A convex lens has a focal length of +25 cm in air. What is its optical power in diopters?',
      options: ['+4.0 D', '+0.04 D', '+2.5 D', '-4.0 D'],
      correctAnswer: '+4.0 D',
      explanation:
        'Power P = 1 / f(in meters). Since 25 cm = 0.25 m, P = 1 / 0.25 = +4.0 Diopters.',
      why: 'Optical power measures how strongly a lens converges light, defined as the reciprocal of focal length expressed strictly in SI units (meters).',
      remember: 'P = 100 / f(in cm)',
      commonMistake: 'Using focal length directly in centimeters (e.g. 1/25 = 0.04 D) without converting to meters.',
    },
    {
      id: 'pq-opt-2',
      conceptTag: 'Wave Invariance',
      question:
        'When light passes from water (n = 1.33) into glass (n = 1.50), which wave parameter remains completely unchanged?',
      options: ['Frequency', 'Wavelength', 'Phase Velocity', 'Direction'],
      correctAnswer: 'Frequency',
      explanation:
        'Frequency is governed solely by the original oscillating wave source and is unaffected by transitions between optical media.',
      why: 'Wave velocity changes due to refractive index (v = c/n) and wavelength compresses accordingly (λ = λ₀/n), but oscillation frequency f stays constant.',
      remember: 'Frequency is the signature of the source; it never shifts upon refraction.',
      commonMistake: 'Confusing wavelength with frequency, assuming both compress as optical density increases.',
    },
    {
      id: 'pq-opt-3',
      conceptTag: 'Lens Combinations',
      question:
        'Two thin lenses of powers +3.5 D and -1.5 D are placed in coaxial contact. What is the equivalent focal length of the combination?',
      options: ['+50 cm', '+20 cm', '-50 cm', '+200 cm'],
      correctAnswer: '+50 cm',
      explanation:
        'Net power P = P₁ + P₂ = 3.5 + (-1.5) = +2.0 D. Equivalent focal length F = 1 / P = 1 / 2.0 m = 0.50 m = +50 cm.',
      why: 'When thin lenses touch, individual powers add algebraically. A positive net power indicates the equivalent system behaves as a converging lens.',
      remember: 'P_net = P₁ + P₂, then F = 100 / P_net in cm.',
      commonMistake: 'Adding focal lengths directly instead of combining optical powers.',
    },
    {
      id: 'pq-opt-4',
      conceptTag: 'Total Internal Reflection',
      question:
        'For total internal reflection to occur at an interface between two media, which condition MUST be satisfied?',
      options: [
        'Light travels from denser to rarer medium and angle of incidence exceeds critical angle',
        'Light travels from rarer to denser medium at any angle of incidence',
        'Angle of incidence is exactly 0 degrees normal to the interface',
        'Light wavelength must match the medium resonance frequency',
      ],
      correctAnswer: 'Light travels from denser to rarer medium and angle of incidence exceeds critical angle',
      explanation:
        'TIR requires: (1) propagation from optically denser to rarer medium (n₁ > n₂), and (2) angle of incidence i > critical angle θc = arcsin(n₂/n₁).',
      why: 'At or past the critical angle, the angle of refraction reaches 90° or becomes mathematically undefined in Snell’s Law, reflecting 100% of light energy back.',
      remember: 'Denser to Rarer + Angle > Critical Angle.',
      commonMistake: 'Believing TIR can happen when light goes from air into water or glass.',
    },
    {
      id: 'pq-opt-5',
      conceptTag: 'Lens Maker Formula',
      question:
        'If a symmetrical biconvex glass lens (n = 1.5) with radius of curvature R = 20 cm on both faces is submerged in water (n = 1.33), how does its focal length compare to that in air?',
      options: [
        'Focal length increases approximately 4-fold',
        'Focal length decreases by half',
        'Focal length remains identical because curvature is constant',
        'The lens becomes diverging',
      ],
      correctAnswer: 'Focal length increases approximately 4-fold',
      explanation:
        'According to the Lens Maker formula 1/f = (n_lens/n_med - 1)(1/R₁ - 1/R₂). In water, (1.5/1.33 - 1) ≈ 0.128, whereas in air (1.5 - 1) = 0.5. Since relative index difference drops by ~4x, f increases roughly 4-fold.',
      why: 'Lower relative refractive index contrast between glass and surrounding liquid diminishes the bending angle at each curved interface.',
      remember: 'Surrounding medium with higher index weakens optical bending power, expanding focal length.',
      commonMistake: 'Assuming focal length is a fixed physical attribute of the glass shape alone.',
    },
  ],
};

export const DEMO_ELECTROSTATICS_PRACTICE_SET: PracticeSet = {
  subject: 'Physics',
  topic: 'Electrostatics & Electric Fields',
  difficulty: 'Medium',
  completed: false,
  questions: [
    {
      id: 'pq-elec-1',
      conceptTag: 'Electric Field',
      question:
        'What is the magnitude of the electric field at a distance r from an isolated point charge Q in vacuum?',
      options: ['E = k·Q / r²', 'E = k·Q / r', 'E = k·Q² / r', 'E = k / (Q·r²)'],
      correctAnswer: 'E = k·Q / r²',
      explanation:
        'Coulomb’s law states force F = k·Q·q / r². Electric field is force per unit test charge E = F / q = k·Q / r².',
      why: 'Electric field lines spread uniformly over the surface of an expanding sphere of area 4πr², giving rise to the inverse-square law.',
      remember: 'Point charge field falls off as 1/r²; potential falls off as 1/r.',
      commonMistake: 'Confusing electric field (1/r²) with electric potential (1/r).',
    },
    {
      id: 'pq-elec-2',
      conceptTag: 'Electric Potential',
      question:
        'Two equal and opposite charges +q and -q are separated by distance 2a. What is the electrostatic potential at the midpoint of the dipole axis?',
      options: ['0 V', 'k·q / a', '2·k·q / a', '-k·q / a²'],
      correctAnswer: '0 V',
      explanation:
        'Electric potential is a scalar quantity: V_total = V₊ + V₋ = (k·q / a) + (-k·q / a) = 0 V.',
      why: 'Potentials sum algebraically with sign. At equal distances from equal and opposite charges, the scalar sum is zero everywhere on the equatorial bisector.',
      remember: 'Potential is scalar (sums with sign); Electric field is a vector and does NOT cancel at the dipole center.',
      commonMistake: 'Assuming electric field and potential are both zero at the center of an electric dipole.',
    },
    {
      id: 'pq-elec-3',
      conceptTag: "Gauss's Law",
      question:
        'A point charge Q is placed at the exact geometrical center of an enclosed cube. What is the electric flux passing through just ONE face of the cube?',
      options: ['Q / (6·ε₀)', 'Q / ε₀', '6·Q / ε₀', 'Q / (2·ε₀)'],
      correctAnswer: 'Q / (6·ε₀)',
      explanation:
        'By Gauss’s Law, the total flux through the entire closed cube is Φ_total = Q / ε₀. By cubic symmetry, all 6 faces receive an identical flux share, so Φ_face = Q / (6·ε₀).',
      why: 'Gauss’s law links total enclosed charge to closed surface integral. Symmetry allows dividing total flux equally among identical faces.',
      remember: 'Closed box = Q/ε₀; single face of a symmetrical cube = Q/(6ε₀).',
      commonMistake: 'Forgetting to divide by 6 for a single face, or thinking flux depends on the side length of the cube.',
    },
    {
      id: 'pq-elec-4',
      conceptTag: "Gauss's Law",
      question:
        'Inside a uniformly charged hollow spherical conducting shell in electrostatic equilibrium, what is the electric field strength at any internal point?',
      options: ['Zero everywhere', 'Directly proportional to radius r', 'Inversely proportional to r²', 'Infinite at the center'],
      correctAnswer: 'Zero everywhere',
      explanation:
        'Drawing a concentric Gaussian sphere of radius r < R inside the hollow shell encloses zero net charge (Q_enc = 0). Thus ∮ E·dA = 0 ⟹ E = 0.',
      why: 'Excess electrostatic charge resides entirely on the exterior boundary of a conductor, leaving the interior volume field-free (electrostatic shielding).',
      remember: 'Inside hollow conductor: E = 0, but Potential V is constant and equal to surface potential.',
      commonMistake: 'Assuming potential is zero inside when E is zero (in fact, V is constant).',
    },
    {
      id: 'pq-elec-5',
      conceptTag: 'Capacitors',
      question:
        'A parallel-plate capacitor with capacitance C is disconnected from a battery and then a dielectric slab of dielectric constant K = 4 is inserted between the plates. What happens to its stored electrostatic energy?',
      options: [
        'Stored energy decreases to U / 4',
        'Stored energy increases to 4·U',
        'Stored energy remains constant',
        'Stored energy drops to zero',
      ],
      correctAnswer: 'Stored energy decreases to U / 4',
      explanation:
        'Because the battery was disconnected, charge Q remains constant. Capacitance increases to C’ = K·C = 4·C. Stored energy U = Q² / (2·C). Since C is in the denominator, U’ = Q² / (2·4C) = U / 4.',
      why: 'The dielectric is polarized and drawn into the plates by electrostatic attraction; work is done BY the electric field, lowering the stored potential energy.',
      remember: 'Disconnected battery ⟹ Q constant ⟹ U = Q²/(2C) decreases with dielectric.',
      commonMistake: 'Using U = 1/2 C V² and assuming V is constant (V only stays constant if the battery remains connected).',
    },
  ],
};

export const DEMO_CALCULUS_PRACTICE_SET: PracticeSet = {
  subject: 'Mathematics',
  topic: 'Integral Calculus & Techniques',
  difficulty: 'Medium',
  completed: false,
  questions: [
    {
      id: 'pq-calc-1',
      conceptTag: 'Integration by Parts',
      question: 'What is the correct integral of ∫ x · cos(x) dx?',
      options: [
        'x · sin(x) + cos(x) + C',
        'x · sin(x) - cos(x) + C',
        '-x · sin(x) + cos(x) + C',
        'x² · sin(x) / 2 + C',
      ],
      correctAnswer: 'x · sin(x) + cos(x) + C',
      explanation:
        'Let u = x (du = dx) and dv = cos(x) dx (v = sin(x)). ∫ u dv = u·v - ∫ v du = x·sin(x) - ∫ sin(x) dx = x·sin(x) - (-cos(x)) + C = x·sin(x) + cos(x) + C.',
      why: 'Integration by parts shifts differentiation onto polynomial factors to systematically lower their degree until standard integration applies.',
      remember: '∫ u dv = u·v - ∫ v du (Watch out for the double negative with -∫ sin(x) = +cos(x)).',
      commonMistake: 'Sign mistake when integrating sin(x): ∫ sin(x) dx is -cos(x), making the sign positive.',
    },
    {
      id: 'pq-calc-2',
      conceptTag: 'Tabular D-I Method',
      question:
        'When applying the Tabular (D-I) method to evaluate ∫ x³ · e^{x} dx, how many rows of derivatives are needed until reaching zero?',
      options: ['4 derivative steps (x³, 3x², 6x, 6, 0)', '3 steps', '2 steps', 'Does not terminate'],
      correctAnswer: '4 derivative steps (x³, 3x², 6x, 6, 0)',
      explanation:
        'Starting at x³: 1st derivative is 3x², 2nd is 6x, 3rd is 6, 4th is 0. So it requires 4 differentiations to reach the terminating zero row.',
      why: 'A degree-n polynomial terminates in exactly n+1 entries, generating alternating signs for diagonal product pairs.',
      remember: 'Polynomial degree n terminates at derivative row n.',
      commonMistake: 'Stopping at the constant derivative (6) instead of carrying to 0.',
    },
    {
      id: 'pq-calc-3',
      conceptTag: 'Partial Fractions',
      question: 'What are the partial fraction coefficients A and B for 1 / [(x - 1)(x + 2)] = A / (x - 1) + B / (x + 2)?',
      options: [
        'A = 1/3, B = -1/3',
        'A = 1/2, B = -1/2',
        'A = 1, B = -1',
        'A = -1/3, B = 1/3',
      ],
      correctAnswer: 'A = 1/3, B = -1/3',
      explanation:
        'Using the Heaviside cover-up method: For A at x = 1: 1 / (1 + 2) = 1/3. For B at x = -2: 1 / (-2 - 1) = -1/3.',
      why: 'Decomposing rational functions into linear denominators enables immediate logarithmic integration ∫ 1/(x-c) dx = ln|x-c|.',
      remember: 'Cover-up method: cover the factor and evaluate at its zero root.',
      commonMistake: 'Flipping the signs of the partial fraction constants.',
    },
    {
      id: 'pq-calc-4',
      conceptTag: 'Definite Integrals',
      question: 'Evaluate the definite integral ∫_{-a}^{a} x³ · cos(x) dx for any real constant a.',
      options: ['0', '2 · a³', 'sin(a)', '2 · cos(a)'],
      correctAnswer: '0',
      explanation:
        'The integrand f(x) = x³ · cos(x) is an odd function because f(-x) = (-x)³ · cos(-x) = -x³ · cos(x) = -f(x). The integral of any odd function over symmetric bounds [-a, a] is strictly 0.',
      why: 'Area above the x-axis on the positive side cancels symmetrically with the area below the x-axis on the negative side.',
      remember: 'Odd function on symmetric interval [-a, a] is ALWAYS zero.',
      commonMistake: 'Attempting integration by parts manually without inspecting parity symmetry first.',
    },
    {
      id: 'pq-calc-5',
      conceptTag: 'Definite Integrals',
      question: "Which fundamental property is known as King's Property for definite integrals?",
      options: [
        '∫_{a}^{b} f(x) dx = ∫_{a}^{b} f(a + b - x) dx',
        '∫_{a}^{b} f(x) dx = f(b) - f(a)',
        '∫_{a}^{b} f(x) dx = ∫_{b}^{a} f(x) dx',
        '∫_{0}^{a} f(x) dx = 2 · ∫_{0}^{a/2} f(x) dx',
      ],
      correctAnswer: '∫_{a}^{b} f(x) dx = ∫_{a}^{b} f(a + b - x) dx',
      explanation:
        'King’s property states that substituting t = a + b - x maps [a, b] onto [b, a] with dt = -dx, leaving the definite integral invariant: ∫_{a}^{b} f(x) dx = ∫_{a}^{b} f(a + b - x) dx.',
      why: 'Adding the original integral I to the reflected King’s integral I often simplifies complex trigonometric and logarithmic expressions to constants.',
      remember: 'Replace x with (lower + upper - x); then calculate I + I = 2I.',
      commonMistake: 'Forgetting to divide by 2 when using 2I = ∫ (f(x) + f(a+b-x)) dx.',
    },
  ],
};

/**
 * Returns a high-quality practice set matching subject & topic.
 */
export function getDemoPracticeSet(
  subject?: string,
  topic?: string,
  difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium',
  count: number = 5
): PracticeSet {
  const s = (subject || '').toLowerCase();
  const t = (topic || '').toLowerCase();

  let baseSet: PracticeSet = DEMO_PRACTICE_SET;

  if (s.includes('physics') && (t.includes('electro') || t.includes('field') || t.includes('gauss') || t.includes('charge') || t.includes('capacit'))) {
    baseSet = DEMO_ELECTROSTATICS_PRACTICE_SET;
  } else if (s.includes('math') || t.includes('calculus') || t.includes('integr') || t.includes('derivative') || t.includes('part')) {
    baseSet = DEMO_CALCULUS_PRACTICE_SET;
  } else if (s.includes('physics')) {
    baseSet = DEMO_PRACTICE_SET;
  }

  // Adjust count if requested
  const selectedQuestions = baseSet.questions.slice(0, Math.min(count, baseSet.questions.length));

  return {
    ...baseSet,
    subject: subject || baseSet.subject,
    topic: topic || baseSet.topic,
    difficulty,
    questions: selectedQuestions,
    completed: false,
  };
}
