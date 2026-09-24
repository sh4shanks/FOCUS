import { UserProfile, Subject, Exam, Task, RevisionItem, PlannedSession, Note, CompletedSessionRecord } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Alex Chen',
  grade: '12th Grade / Senior',
  targetExam: 'National STEM Board & AP Exams',
  dailyGoalHours: 3.5,
  preferredStudyTimes: ['Evening (6 PM - 9 PM)', 'Early Morning (6 AM - 8 AM)'],
  academicPriorities: 'Master Calculus and raise Physics score past 90%',
  streak: 6,
  bestStreak: 14,
  lastActiveDate: new Date().toISOString().split('T')[0],
  onboarded: true, // If false, onboarding triggers; we set default true with easy replay or switch
};

export const initialSubjects: Subject[] = [
  {
    id: 'subj-physics',
    name: 'Physics',
    color: '#38bdf8', // Cyan/Sky
    iconName: 'Atom',
    targetExamDate: '2026-10-14',
    chapters: [
      {
        id: 'ch-phy-1',
        title: 'Wave Optics & Interference',
        status: 'completed',
        completionPercentage: 100,
        topics: ["Young's Double Slit Experiment", 'Diffraction Grating', 'Polarization by Scattering'],
        estimatedHours: 4,
        difficulty: 'Medium',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-15',
      },
      {
        id: 'ch-phy-2',
        title: 'Ray Optics — Refraction & Lenses',
        status: 'revision-due',
        completionPercentage: 85,
        topics: ['Snell’s Law & Total Internal Reflection', 'Lens Maker Formula', 'Prism Dispersion'],
        estimatedHours: 5,
        difficulty: 'Hard',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-17',
      },
      {
        id: 'ch-phy-3',
        title: 'Electromagnetic Induction & AC',
        status: 'in-progress',
        completionPercentage: 60,
        topics: ["Faraday's & Lenz's Law", 'Self & Mutual Inductance', 'LCR Resonant Circuits'],
        estimatedHours: 6,
        difficulty: 'Hard',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-19',
      },
      {
        id: 'ch-phy-4',
        title: 'Thermodynamics & Heat Engines',
        status: 'completed',
        completionPercentage: 100,
        topics: ['First & Second Laws', 'Carnot Engine Efficiency', 'Entropy'],
        estimatedHours: 4.5,
        difficulty: 'Medium',
        examWeightage: 'Medium',
        lastStudiedDate: '2026-09-12',
      },
      {
        id: 'ch-phy-5',
        title: 'Dual Nature of Matter & Radiation',
        status: 'not-started',
        completionPercentage: 0,
        topics: ['Photoelectric Effect & Einstein Equation', 'de Broglie Wavelength', 'Davisson-Germer Experiment'],
        estimatedHours: 3.5,
        difficulty: 'Easy',
        examWeightage: 'Medium',
      },
    ],
  },
  {
    id: 'subj-math',
    name: 'Mathematics',
    color: '#a855f7', // Purple
    iconName: 'Variable',
    targetExamDate: '2026-10-05',
    chapters: [
      {
        id: 'ch-mat-1',
        title: 'Applications of Derivatives',
        status: 'completed',
        completionPercentage: 100,
        topics: ['Rate of Change', 'Maxima and Minima', 'Tangents and Normals'],
        estimatedHours: 5,
        difficulty: 'Medium',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-14',
      },
      {
        id: 'ch-mat-2',
        title: 'Integral Calculus & Techniques',
        status: 'in-progress',
        completionPercentage: 70,
        topics: ['Integration by Parts', 'Partial Fractions', 'Definite Integral Properties'],
        estimatedHours: 8,
        difficulty: 'Hard',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-18',
      },
      {
        id: 'ch-mat-3',
        title: 'Differential Equations',
        status: 'not-started',
        completionPercentage: 15,
        topics: ['Variable Separable Method', 'Homogeneous Equations', 'Linear Differential Form'],
        estimatedHours: 6,
        difficulty: 'Hard',
        examWeightage: 'High',
      },
      {
        id: 'ch-mat-4',
        title: 'Vectors and 3D Geometry',
        status: 'completed',
        completionPercentage: 100,
        topics: ['Dot & Cross Products', 'Shortest Distance between Lines', 'Plane Equations'],
        estimatedHours: 5,
        difficulty: 'Medium',
        examWeightage: 'Medium',
        lastStudiedDate: '2026-09-10',
      },
    ],
  },
  {
    id: 'subj-chem',
    name: 'Chemistry',
    color: '#10b981', // Emerald/Green
    iconName: 'FlaskConical',
    targetExamDate: '2026-10-22',
    chapters: [
      {
        id: 'ch-chem-1',
        title: 'Electrochemistry & Galvanic Cells',
        status: 'completed',
        completionPercentage: 90,
        topics: ['Nernst Equation', 'Conductance & Kohlrausch’s Law', 'Electrochemical Cells'],
        estimatedHours: 5,
        difficulty: 'Medium',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-16',
      },
      {
        id: 'ch-chem-2',
        title: 'Chemical Kinetics & Catalysis',
        status: 'revision-due',
        completionPercentage: 100,
        topics: ['Integrated Rate Laws (0th & 1st Order)', 'Arrhenius Equation', 'Collision Theory'],
        estimatedHours: 4,
        difficulty: 'Medium',
        examWeightage: 'Medium',
        lastStudiedDate: '2026-09-15',
      },
      {
        id: 'ch-chem-3',
        title: 'Organic Chemistry — Haloalkanes & Arenes',
        status: 'in-progress',
        completionPercentage: 55,
        topics: ['SN1 vs SN2 Mechanisms', 'Grignard Reagent synthesis', 'Elimination Reactions'],
        estimatedHours: 6,
        difficulty: 'Hard',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-18',
      },
      {
        id: 'ch-chem-4',
        title: 'Coordination Compounds',
        status: 'not-started',
        completionPercentage: 0,
        topics: ["Werner's Theory", 'Crystal Field Theory', 'Isomerism in Complexes'],
        estimatedHours: 4.5,
        difficulty: 'Medium',
        examWeightage: 'Medium',
      },
    ],
  },
  {
    id: 'subj-cs',
    name: 'Computer Science',
    color: '#6366f1', // Indigo
    iconName: 'Binary',
    targetExamDate: '2026-11-01',
    chapters: [
      {
        id: 'ch-cs-1',
        title: 'Data Structures & Algorithms',
        status: 'in-progress',
        completionPercentage: 80,
        topics: ['Binary Search Trees', 'Stack & Queue Implementations', 'Graph BFS/DFS'],
        estimatedHours: 8,
        difficulty: 'Hard',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-19',
      },
      {
        id: 'ch-cs-2',
        title: 'Database Management Systems',
        status: 'completed',
        completionPercentage: 100,
        topics: ['SQL Joins and Subqueries', 'Normal Forms (1NF to 3NF)', 'ACID Properties'],
        estimatedHours: 4,
        difficulty: 'Medium',
        examWeightage: 'Medium',
        lastStudiedDate: '2026-09-11',
      },
    ],
  },
  {
    id: 'subj-eng',
    name: 'English Literature',
    color: '#f59e0b', // Amber
    iconName: 'BookOpen',
    targetExamDate: '2026-10-18',
    chapters: [
      {
        id: 'ch-eng-1',
        title: 'Macbeth — Shakespearean Drama',
        status: 'revision-due',
        completionPercentage: 85,
        topics: ['Act 3 Scene 2 Soliloquy & Guilt', 'Themes of Ambition & Fate', 'Lady Macbeth Character Arc'],
        estimatedHours: 3.5,
        difficulty: 'Medium',
        examWeightage: 'High',
        lastStudiedDate: '2026-09-16',
      },
      {
        id: 'ch-eng-2',
        title: 'Critical Essay & Comparative Analysis',
        status: 'in-progress',
        completionPercentage: 50,
        topics: ['Thesis formulation', 'Textual Evidence citation', 'Rhetorical Devices'],
        estimatedHours: 3,
        difficulty: 'Medium',
        examWeightage: 'Medium',
        lastStudiedDate: '2026-09-17',
      },
    ],
  },
];

export const initialExams: Exam[] = [
  {
    id: 'exam-1',
    subject: 'Physics',
    examName: 'Senior Physics Board Examination',
    date: '2026-10-14', // ~24 days from 2026-09-20
    time: '09:00 AM',
    totalChapters: 16,
    completedChapters: 12,
    targetScore: '92%+',
    notes: 'Focus heavily on Ray Optics, Lens Maker Formula, and AC resonance derivations.',
  },
  {
    id: 'exam-2',
    subject: 'Mathematics',
    examName: 'Advanced Calculus & Analytical Geometry',
    date: '2026-10-05', // 15 days from 2026-09-20
    time: '01:30 PM',
    totalChapters: 14,
    completedChapters: 10,
    targetScore: '95%+',
    notes: 'Master Integration by Parts and Differential Equations solutions.',
  },
  {
    id: 'exam-3',
    subject: 'Chemistry',
    examName: 'Physical & Organic Chemistry Assessment',
    date: '2026-10-22',
    time: '09:00 AM',
    totalChapters: 12,
    completedChapters: 8,
    targetScore: '88%+',
    notes: 'Re-memorize organic naming conventions and reaction mechanisms.',
  },
];

export const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Revise Optics — Refraction & Lens Maker Formula',
    subject: 'Physics',
    deadline: '2026-09-20',
    durationMinutes: 25,
    priority: 'high',
    status: 'todo',
    tags: ['Exam Prep', 'High Yield'],
    notes: 'Formula sheet review and practice 3 ray diagrams.',
  },
  {
    id: 'task-2',
    title: 'Solve 3 Calculus integration by parts problem set',
    subject: 'Mathematics',
    deadline: '2026-09-20',
    durationMinutes: 20,
    priority: 'high',
    status: 'todo',
    tags: ['Problem Solving'],
  },
  {
    id: 'task-3',
    title: 'Macbeth Act 3 Scene 2 textual annotations & quotes',
    subject: 'English Literature',
    deadline: '2026-09-21',
    durationMinutes: 15,
    priority: 'medium',
    status: 'todo',
    tags: ['Active Recall', 'Essay Prep'],
  },
  {
    id: 'task-4',
    title: 'Organic Chemistry: SN1 vs SN2 reaction matrix table',
    subject: 'Chemistry',
    deadline: '2026-09-22',
    durationMinutes: 30,
    priority: 'medium',
    status: 'todo',
    tags: ['Mechanisms'],
  },
  {
    id: 'task-5',
    title: 'BST delete node algorithm dry run on paper',
    subject: 'Computer Science',
    deadline: '2026-09-23',
    durationMinutes: 20,
    priority: 'low',
    status: 'in-progress',
    tags: ['Coding Lab'],
  },
  {
    id: 'task-6',
    title: 'Wave Optics: Youngs Double Slit derivations review',
    subject: 'Physics',
    deadline: '2026-09-19',
    durationMinutes: 25,
    priority: 'medium',
    status: 'completed',
    tags: ['Completed Yesterday'],
    completedAt: '2026-09-19T20:15:00Z',
  },
];

export const initialRevisionItems: RevisionItem[] = [
  {
    id: 'rev-1',
    subject: 'Physics',
    topic: 'Ray Optics — Refraction & Critical Angle',
    chapterId: 'ch-phy-2',
    lastStudied: '2026-09-17',
    daysSinceLastStudy: 3,
    estimatedMinutes: 15,
    urgency: 'due-today',
    intervalStage: 2,
  },
  {
    id: 'rev-2',
    subject: 'English Literature',
    topic: 'Macbeth Act 3 Scene 2 — Key Quotes & Soliloquy',
    chapterId: 'ch-eng-1',
    lastStudied: '2026-09-16',
    daysSinceLastStudy: 4,
    estimatedMinutes: 12,
    urgency: 'due-today',
    intervalStage: 3,
  },
  {
    id: 'rev-3',
    subject: 'Chemistry',
    topic: 'Chemical Kinetics — 1st Order Half Life Derivation',
    chapterId: 'ch-chem-2',
    lastStudied: '2026-09-15',
    daysSinceLastStudy: 5,
    estimatedMinutes: 15,
    urgency: 'due-today',
    intervalStage: 2,
  },
  {
    id: 'rev-4',
    subject: 'Mathematics',
    topic: 'Derivatives — Maxima & Minima Word Problems',
    chapterId: 'ch-mat-1',
    lastStudied: '2026-09-14',
    daysSinceLastStudy: 6,
    estimatedMinutes: 20,
    urgency: 'upcoming',
    intervalStage: 3,
  },
];

export const initialPlannedSessions: PlannedSession[] = [
  {
    id: 'plan-1',
    subject: 'Physics',
    topic: 'Optics Refraction & Problem Practice',
    date: '2026-09-20',
    startTime: '17:30',
    durationMinutes: 35,
    priority: 'high',
    completed: true,
  },
  {
    id: 'plan-2',
    subject: 'Mathematics',
    topic: 'Integration by Parts Drills',
    date: '2026-09-20',
    startTime: '18:30',
    durationMinutes: 30,
    priority: 'high',
    completed: true,
  },
  {
    id: 'plan-3',
    subject: 'English Literature',
    topic: 'Macbeth Act 3 Quotes & Character Motivation',
    date: '2026-09-20',
    startTime: '19:15',
    durationMinutes: 20,
    priority: 'medium',
    completed: true,
  },
  {
    id: 'plan-4',
    subject: 'Physics',
    topic: 'Lens Maker Formula deep-dive',
    date: '2026-09-20',
    startTime: '20:00',
    durationMinutes: 30,
    priority: 'high',
    completed: false,
  },
  {
    id: 'plan-5',
    subject: 'Chemistry',
    topic: 'Kinetics Formula Flashcards & Numerical 1',
    date: '2026-09-20',
    startTime: '20:45',
    durationMinutes: 25,
    priority: 'medium',
    completed: false,
  },
];

export const initialCompletedRecords: CompletedSessionRecord[] = [
  {
    id: 'rec-1',
    title: 'Optics Morning Drill',
    subject: 'Physics',
    timestamp: '2026-09-20T08:15:00Z',
    durationMinutes: 35,
    tasksCompleted: ['Formula sheet review', '2 Lens diagrams'],
    productivityScore: 92,
  },
  {
    id: 'rec-2',
    title: 'Maths Integration Session',
    subject: 'Mathematics',
    timestamp: '2026-09-20T11:40:00Z',
    durationMinutes: 30,
    tasksCompleted: ['Problem set 1 to 5'],
    productivityScore: 95,
  },
  {
    id: 'rec-3',
    title: 'Literature Active Recall',
    subject: 'English Literature',
    timestamp: '2026-09-20T16:00:00Z',
    durationMinutes: 20,
    tasksCompleted: ['Act 3 scene summary'],
    productivityScore: 88,
  },
  {
    id: 'rec-4',
    title: 'CS Graph Algorithms Study',
    subject: 'Computer Science',
    timestamp: '2026-09-19T19:30:00Z',
    durationMinutes: 45,
    tasksCompleted: ['BFS queue traversal trace'],
    productivityScore: 90,
  },
  {
    id: 'rec-5',
    title: 'Chemistry Electrochemistry',
    subject: 'Chemistry',
    timestamp: '2026-09-18T18:00:00Z',
    durationMinutes: 40,
    tasksCompleted: ['Nernst equation calculations'],
    productivityScore: 85,
  },
];

export const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Optics: Key Derivations & Sign Convention',
    subject: 'Physics',
    category: 'Revision Note',
    tags: ['Optics', 'Formulas', 'Crucial'],
    isFavorite: true,
    isPinned: true,
    notebookId: 'notebook-formulas',
    updatedAt: '2026-09-18',
    content: `# Ray Optics Quick Revision

### Sign Convention (Cartesian):
1. All distances are measured from the Optical Centre ($O$) or Pole ($P$).
2. Distances measured in the direction of incident light are **positive** ($+$).
3. Distances measured against the direction of incident light are **negative** ($-$).

### Lens Maker's Formula:
$$\\frac{1}{f} = (\\mu - 1) \\left( \\frac{1}{R_1} - \\frac{1}{R_2} \\right)$$

* For convex lens with symmetric radii: $R_1 = +R$, $R_2 = -R \\implies \\frac{1}{f} = \\frac{2(\\mu - 1)}{R}$.
* Caution: If lens is placed in water, $\\mu$ becomes $\\mu_{glass} / \\mu_{water}$, increasing focal length by $\\approx 4\\times$!

### Critical Angle & TIR:
$$\\sin(i_c) = \\frac{n_2}{n_1} \\quad (\\text{where } n_1 > n_2)$$
Condition: Light must travel from denser to rarer medium with angle of incidence $i > i_c$.`,
  },
  {
    id: 'note-2',
    title: 'Integration by Parts: The "LIATE" Hierarchy',
    subject: 'Mathematics',
    category: 'Subject',
    tags: ['Calculus', 'Techniques'],
    isFavorite: true,
    notebookId: 'notebook-formulas',
    updatedAt: '2026-09-17',
    content: `# Integration by Parts

Formula:
$$\\int u \\cdot v \\, dx = u \\int v \\, dx - \\int \\left( u' \\int v \\, dx \\right) dx$$

### Selection Rule: LIATE
* **L** - Logarithmic functions (e.g. $\\ln x$)
* **I** - Inverse Trigonometric (e.g. $\\arctan x$)
* **A** - Algebraic polynomials (e.g. $x^2, 3x$)
* **T** - Trigonometric (e.g. $\\sin x, \\cos x$)
* **E** - Exponential functions (e.g. $e^x$)

Choose the function appearing earlier in **LIATE** as $u$.`,
  },
  {
    id: 'note-3',
    title: 'Macbeth: Theme of Guilt & Paranoia (Act 3)',
    subject: 'English Literature',
    category: 'Chapter',
    tags: ['Shakespeare', 'Themes'],
    isFavorite: false,
    notebookId: 'notebook-quotes',
    updatedAt: '2026-09-16',
    content: `### Act 3 Scene 2 Analysis
- **Key Quote**: *"O, full of scorpions is my mind, dear wife!"*
- Contrast: While Lady Macbeth initially urged calmness (*"What's done is done"*), Macbeth is consumed by restless insecurity regarding Banquo.
- Motif: The corruption of sleep and natural order. Notice how light fades as night approaches (*"Light thickens, and the crow makes wing to the rooky wood"*).`,
  },
  {
    id: 'note-4',
    title: 'Chemical Kinetics: Half-Life & Order Checklist',
    subject: 'Chemistry',
    category: 'Revision Note',
    tags: ['Physical Chem', 'Shortcuts'],
    isFavorite: false,
    notebookId: 'notebook-revision',
    updatedAt: '2026-09-15',
    content: `### Half Life Summary:
* **Zero Order**: $t_{1/2} = \\frac{[A]_0}{2k}$ (Directly proportional to initial concentration)
* **First Order**: $t_{1/2} = \\frac{0.693}{k}$ (Independent of initial concentration!)
* **Second Order**: $t_{1/2} = \\frac{1}{k[A]_0}$ (Inversely proportional)

Units of Rate Constant $k$: $\\text{mol}^{1-n} \\text{L}^{n-1} \\text{s}^{-1}$ where $n$ is total reaction order.`,
  },
];
