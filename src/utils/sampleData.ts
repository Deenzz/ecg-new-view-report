/**
 * Pre-loaded Real-World 12-Lead ECG Sample Cases and Dynamic Grid Waveform Synthesizer
 */
import { ECGAnalysis } from '../types/ecg';

export interface SampleECGCase {
  id: string;
  title: string;
  tag: string;
  severity: 'critical' | 'urgent' | 'normal';
  description: string;
  presetAnalysis: ECGAnalysis;
  patientAge: number;
  patientSex: 'Male' | 'Female';
  symptoms: string;
  patternType: 'stemi' | 'normal' | 'afib' | 'wellens' | 'hyperkalemia' | 'brugada';
}

export const SAMPLE_ECG_CASES: SampleECGCase[] = [
  {
    id: 'case-stemi-inferior',
    title: 'Acute Extensive Anterior STEMI (Proximal LAD)',
    tag: 'Code STEMI / Cath Lab',
    severity: 'critical',
    description: 'Tombstone ST elevations in V1-V4 with reciprocal ST depressions in inferior leads III and aVF.',
    patientAge: 58,
    patientSex: 'Male',
    symptoms: 'Crushing substernal chest pressure radiating to left jaw, diaphoresis, acute onset 45 min ago',
    patternType: 'stemi',
    presetAnalysis: {
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      patientAge: 58,
      patientSex: 'Male',
      clinicalSymptoms: 'Crushing substernal chest pressure, diaphoresis, nausea',
      tech_quality: 'Diagnostic quality. 25 mm/s, 10 mm/mV. No baseline wander or limb lead reversal.',
      heart_rate_bpm: 98,
      heart_rate_category: 'Normal (60-100)',
      rate_rhythm: 'Sinus Tachycardia with premature ventricular contractions',
      axis_degrees: 35,
      axis_quadrant: 'Normal Axis (-30° to +90°)',
      pr_interval_ms: 164,
      qrs_duration_ms: 96,
      qt_interval_ms: 388,
      qtc_interval_ms: 496,
      qtc_status: 'Prolonged (>470ms M, >480ms F)',
      conduction_hypertrophy: 'Normal intraventricular conduction. Poor R-wave progression in precordial leads.',
      ischemia_infarction: 'Marked convex "tombstone" ST-segment elevation of 3.5mm-5.0mm in leads V1, V2, V3, and V4 with hyperacute T waves. Reciprocal ST-segment depression in leads III and aVF.',
      affected_leads: ['V1', 'V2', 'V3', 'V4', 'III', 'aVF'],
      syndromes_and_mimics: 'Rule out pericarditis: Reciprocal ST depression in inferior leads definitively rules out benign pericarditis. Classic 4th Universal Definition STEMI criteria met.',
      primary_synthesis: 'ACUTE ANTERIOR ST-ELEVATION MYOCARDIAL INFARCTION (STEMI). Likely acute proximal left anterior descending (LAD) coronary artery occlusion. Immediate reperfusion protocol required.',
      layman_explanation: 'This test shows urgent signs of a major heart artery blockage (a heart attack). Emergency medical care and immediate hospital catheterization are required right now to open the blocked blood vessel.',
      urgency_level: 'Immediate Emergency (Cath Lab / Resuscitation)',
      critical_alert: true,
      alert_reasons: [
        'New J-point ST-segment elevation >3.5mm in contiguous precordial leads V1-V4',
        'Reciprocal ST depression in leads III and aVF confirming transmural myocardial ischemia',
        'High immediate risk of malignant ventricular arrhythmias (VT/VF) and cardiogenic shock',
      ],
      recommended_actions: [
        'IMMEDIATE CODE STEMI ACTIVATION / Emergent Cardiac Catheterization Lab',
        'Administer Dual Antiplatelet Therapy (Aspirin 325mg chewable + P2Y12 inhibitor)',
        'Establish dual large-bore IV access and apply continuous defibrillator pads',
        'Serial 12-lead ECGs every 10-15 minutes and stat high-sensitivity Troponin I',
      ],
      peer_reviewed_citations: [
        {
          source: 'Eur Heart J / ESC Guidelines',
          title: '2023 ESC Guidelines for the management of acute coronary syndromes',
          relevance: 'Primary indication for immediate (<60 min) primary percutaneous coronary intervention (PCI)',
          url: 'https://doi.org/10.1093/eurheartj/ehad191',
        },
        {
          source: 'Circulation / AHA / ACC',
          title: 'Fourth Universal Definition of Myocardial Infarction Consensus',
          relevance: 'Anterior STEMI cutoff criteria: >=2.0mm in men >=40 years in V2-V3',
          url: 'https://doi.org/10.1093/eurheartj/ehy462',
        },
      ],
      limitations: 'Computer-assisted interpretation. Time from symptom onset must guide treatment velocity.',
      analysis_mode: 'online_database',
    },
  },
  {
    id: 'case-normal-sinus',
    title: 'Normal 12-Lead Sinus Rhythm',
    tag: 'Healthy Baseline',
    severity: 'normal',
    description: 'Normal rate, regular sinus P-waves, normal PR and QTc intervals, absence of ST-T abnormalities.',
    patientAge: 42,
    patientSex: 'Female',
    symptoms: 'Routine annual cardiology checkup and pre-operative cardiac clearance',
    patternType: 'normal',
    presetAnalysis: {
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      patientAge: 42,
      patientSex: 'Female',
      clinicalSymptoms: 'Routine annual checkup, asymptomatic',
      tech_quality: 'Pristine technical quality. 25 mm/s, 10 mm/mV standard calibration. Baseline stable.',
      heart_rate_bpm: 68,
      heart_rate_category: 'Normal (60-100)',
      rate_rhythm: 'Normal Sinus Rhythm. Upright P waves in leads I, II, aVF; inverted in aVR.',
      axis_degrees: 52,
      axis_quadrant: 'Normal Axis (-30° to +90°)',
      pr_interval_ms: 152,
      qrs_duration_ms: 84,
      qt_interval_ms: 392,
      qtc_interval_ms: 418,
      qtc_status: 'Normal (<450ms M, <460ms F)',
      conduction_hypertrophy: 'Normal atrioventricular and intraventricular conduction. Negative for chamber hypertrophy.',
      ischemia_infarction: 'No ST-segment elevation or depression. Normal T-wave polarity across all 12 leads. Normal R-wave progression.',
      affected_leads: [],
      syndromes_and_mimics: 'No signs of early repolarization, Brugada, pre-excitation (Wolff-Parkinson-White), or electrolyte disturbance.',
      primary_synthesis: 'NORMAL 12-LEAD ELECTROCARDIOGRAM. Normal sinus rhythm at 68 bpm. All intervals and axis within physiological baseline parameters.',
      layman_explanation: 'Your heart test looks completely healthy and normal! Your heart is beating at a steady 68 beats per minute with normal electrical signals, and there are no signs of strain or reduced blood flow.',
      urgency_level: 'Routine / Normal',
      critical_alert: false,
      alert_reasons: [],
      recommended_actions: [
        'Reassure patient regarding normal cardiovascular electrical activity',
        'Maintain routine cardiovascular health maintenance and exercise',
        'Retain report as comparative baseline in personal encrypted vault',
      ],
      peer_reviewed_citations: [
        {
          source: 'J Am Coll Cardiol / AHA',
          title: 'Recommendations for the Standardization and Interpretation of the Electrocardiogram',
          relevance: 'Standard reference ranges for normal intervals and axis in healthy adults',
          url: 'https://doi.org/10.1016/j.jacc.2008.12.013',
        },
      ],
      limitations: 'Normal resting ECG does not exclude intermittent exercise-induced ischemia.',
      analysis_mode: 'online_database',
    },
  },
  {
    id: 'case-afib-rvr',
    title: 'Atrial Fibrillation with Rapid Ventricular Response (RVR)',
    tag: 'Arrhythmia Alert',
    severity: 'critical',
    description: 'Irregularly irregular rhythm with fibrillatory baseline, absent P-waves, and rapid rate 132 bpm.',
    patientAge: 73,
    patientSex: 'Female',
    symptoms: 'Sudden onset fluttering in chest, lightheadedness, fatigue, shortness of breath on exertion',
    patternType: 'afib',
    presetAnalysis: {
      timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
      patientAge: 73,
      patientSex: 'Female',
      clinicalSymptoms: 'Palpitations, lightheadedness, mild exertional dyspnea',
      tech_quality: 'Adequate quality. Coarse baseline fibrillatory waves visible in V1 and lead II.',
      heart_rate_bpm: 132,
      heart_rate_category: 'Tachycardia (>100)',
      rate_rhythm: 'Atrial Fibrillation with Rapid Ventricular Response (RVR). Irregularly irregular RR intervals.',
      axis_degrees: 68,
      axis_quadrant: 'Normal Axis (-30° to +90°)',
      pr_interval_ms: 0,
      qrs_duration_ms: 92,
      qt_interval_ms: 310,
      qtc_interval_ms: 458,
      qtc_status: 'Normal (<450ms M, <460ms F)',
      conduction_hypertrophy: 'Narrow QRS complexes with variable AV conduction ratios. Rate-related repolarization changes.',
      ischemia_infarction: 'Diffuse nonspecific ST-segment flattening likely secondary to rapid ventricular rate. No regional STEMI criteria met.',
      affected_leads: ['II', 'V1', 'V5', 'V6'],
      syndromes_and_mimics: 'Rule out Atrial Flutter: Lack of classic 300bpm sawtooth flutter waves. Differential includes multifocal atrial tachycardia (MAT).',
      primary_synthesis: 'ATRIAL FIBRILLATION WITH RAPID VENTRICULAR RESPONSE (HR 132 bpm). Requires immediate rate control and CHA2DS2-VASc stroke risk assessment for anticoagulation.',
      layman_explanation: 'Your heart is beating irregularly and too fast (132 beats per minute). This condition is known as Atrial Fibrillation. Your doctor will need to prescribe medication to gently slow your heart rate down and protect against blood clots.',
      urgency_level: 'Urgent (Emergency Department Evaluation)',
      critical_alert: true,
      alert_reasons: [
        'Rapid ventricular response (132 bpm) at rest posing risk of tachycardia-induced cardiomyopathy',
        'Atrial fibrillation with elevated thromboembolic stroke risk (CHA2DS2-VASc evaluation required)',
      ],
      recommended_actions: [
        'Hemodynamic stability evaluation (blood pressure, mental status, chest pain)',
        'Rate control with IV beta-blocker (Metoprolol) or non-dihydropyridine calcium channel blocker (Diltiazem)',
        'Calculate CHA2DS2-VASc score (Age 73 Female = high score: systemic anticoagulation indicated)',
        'Check serum electrolytes (Potassium, Magnesium) and Thyroid Stimulating Hormone (TSH)',
      ],
      peer_reviewed_citations: [
        {
          source: 'Eur Heart J / ESC Guidelines',
          title: '2024 ESC Guidelines for the management of atrial fibrillation',
          relevance: 'Protocol for acute rate control and anticoagulation initiation',
          url: 'https://doi.org/10.1093/eurheartj/ehae178',
        },
      ],
      limitations: 'Rapid rates can mask underlying ischemia. Repeat ECG after rate control is achieved.',
      analysis_mode: 'online_database',
    },
  },
  {
    id: 'case-wellens-syndrome',
    title: 'Wellens Syndrome Type A (Critical Proximal LAD Stenosis)',
    tag: 'High-Risk Ischemic Mimic',
    severity: 'critical',
    description: 'Biphasic T-waves in leads V2 and V3 in a pain-free interval. Impending extensive anterior wall MI.',
    patientAge: 62,
    patientSex: 'Male',
    symptoms: 'Episodes of severe chest tightness earlier in the morning, now currently pain-free at rest',
    patternType: 'wellens',
    presetAnalysis: {
      timestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
      patientAge: 62,
      patientSex: 'Male',
      clinicalSymptoms: 'Waxing and waning chest tightness, currently asymptomatic at time of recording',
      tech_quality: 'Excellent recording quality. Clear biphasic waveforms in V2 and V3 without artifact.',
      heart_rate_bpm: 76,
      heart_rate_category: 'Normal (60-100)',
      rate_rhythm: 'Normal Sinus Rhythm. Regular with intact AV conduction.',
      axis_degrees: 40,
      axis_quadrant: 'Normal Axis (-30° to +90°)',
      pr_interval_ms: 160,
      qrs_duration_ms: 88,
      qt_interval_ms: 412,
      qtc_interval_ms: 464,
      qtc_status: 'Borderline (450-470ms M, 460-480ms F)',
      conduction_hypertrophy: 'Normal QRS voltages. Intact precordial R-wave progression.',
      ischemia_infarction: 'Biphasic T-waves (initial positive deflection followed by terminal negative deflection) in leads V2 and V3. Isoelectric ST segments. No pathological Q waves.',
      affected_leads: ['V2', 'V3', 'V4'],
      syndromes_and_mimics: 'WELLENS SYNDROME TYPE A: Classic pattern indicating severe (>85%) stenosis of the proximal Left Anterior Descending (LAD) coronary artery. Normal baseline ST segments during pain-free window.',
      primary_synthesis: 'WELLENS SYNDROME (TYPE A BIPHASIC T-WAVES IN V2-V3). Urgent coronary angiography indicated. AVOID stress testing due to high risk of fatal anterior myocardial infarction.',
      layman_explanation: 'This test shows a very specific warning pattern in the front part of your heart. Even though you may not feel chest pain right now, it signals a severe narrowing in the main front artery of your heart that needs urgent hospital treatment before it causes permanent muscle damage.',
      urgency_level: 'Immediate Emergency (Cath Lab / Resuscitation)',
      critical_alert: true,
      alert_reasons: [
        'Wellens Syndrome Type A pattern identified in leads V2-V3',
        'Impending high-grade proximal LAD occlusion (the "Widowmaker" lesion)',
        'Extreme danger if stress-tested: urgent cardiac catheterization required',
      ],
      recommended_actions: [
        'Urgent cardiology consultation for inpatient cardiac catheterization / angiography',
        'CONTRAINDICATION: Do NOT perform exercise treadmill or chemical stress testing',
        'Admit to telemetry bed, initiate antiplatelet and therapeutic anticoagulation',
        'Continuous ST-segment telemetry monitoring for recurrence of ischemic symptoms',
      ],
      peer_reviewed_citations: [
        {
          source: 'American Heart Journal',
          title: 'Characteristic electrocardiographic pattern indicating a critical stenosis high in LAD',
          relevance: 'Original criteria established by de Zwaan, Wellens et al.',
          url: 'https://pubmed.ncbi.nlm.nih.gov/6121481/',
        },
      ],
      limitations: 'Serial ECGs required. Changes can transiently normalize or evolve into full STEMI.',
      analysis_mode: 'online_database',
    },
  },
  {
    id: 'case-hyperkalemia',
    title: 'Severe Hyperkalemia (Serum K+ > 6.8 mEq/L)',
    tag: 'Metabolic Emergency',
    severity: 'critical',
    description: 'Tall, narrow, symmetrical peaked "tented" T-waves, PR interval prolongation, and QRS widening.',
    patientAge: 69,
    patientSex: 'Male',
    symptoms: 'Generalized profound muscle weakness, nausea, end-stage renal disease (missed dialysis yesterday)',
    patternType: 'hyperkalemia',
    presetAnalysis: {
      timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
      patientAge: 69,
      patientSex: 'Male',
      clinicalSymptoms: 'Profound muscle weakness, missed scheduled hemodialysis, bradycardia',
      tech_quality: 'Diagnostic quality. Clear precordial and limb lead recordings.',
      heart_rate_bpm: 54,
      heart_rate_category: 'Bradycardia (<60)',
      rate_rhythm: 'Sinus Bradycardia with 1st Degree AV Block. Flattened P waves.',
      axis_degrees: -10,
      axis_quadrant: 'Normal Axis (-30° to +90°)',
      pr_interval_ms: 228,
      qrs_duration_ms: 124,
      qt_interval_ms: 420,
      qtc_interval_ms: 398,
      qtc_status: 'Normal (<450ms M, <460ms F)',
      conduction_hypertrophy: 'First-degree AV block (PR 228ms). Non-specific intraventricular conduction delay (QRS 124ms).',
      ischemia_infarction: 'Tall, sharply peaked, narrow-based "tented" T-waves prominent across leads V2, V3, V4, V5, and lead II. Differentiated from hyperacute ischemic T-waves by narrow base and symmetry.',
      affected_leads: ['V2', 'V3', 'V4', 'V5', 'II'],
      syndromes_and_mimics: 'SEVERE HYPERKALEMIA: Morphologic progression observed with tented T-waves, PR prolongation, and QRS broadening. High risk of progression to sine-wave pattern and asystole.',
      primary_synthesis: 'ELECTROCARDIOGRAPHIC EVIDENCE OF SEVERE HYPERKALEMIA (Estimated Potassium > 6.5 mEq/L). Immediate myocardial membrane stabilization with IV Calcium is required.',
      layman_explanation: 'This test shows signs of a dangerously high potassium level in your bloodstream, which affects how your heart muscles pump electricity. You need immediate medical treatment at the emergency room to protect your heart rhythm and receive urgent dialysis or potassium-lowering medicine.',
      urgency_level: 'Immediate Emergency (Cath Lab / Resuscitation)',
      critical_alert: true,
      alert_reasons: [
        'Peaked, tented T-waves with PR prolongation and QRS widening consistent with severe hyperkalemia',
        'Imminent danger of progression to lethal sine-wave rhythm or ventricular standstill',
      ],
      recommended_actions: [
        'Immediate IV Calcium Gluconate (10%) or Calcium Chloride for myocardial membrane stabilization',
        'Shift potassium intracellularly: IV Regular Insulin 10 units with 50ml 50% Dextrose + Albuterol nebulizers',
        'Potassium elimination: Loop diuretics, sodium polystyrene/patiromer, and emergent hemodialysis',
        'Stat serum basic metabolic panel (electrolytes, BUN, creatinine) and continuous cardiac monitor',
      ],
      peer_reviewed_citations: [
        {
          source: 'Clin J Am Soc Nephrol',
          title: 'Frequency of ECG changes in hyperkalemia and clinical urgency',
          relevance: 'Standard clinical correlation between ECG morphology and critical serum potassium thresholds',
          url: 'https://doi.org/10.2215/CJN.04611007',
        },
      ],
      limitations: 'ECG severity does not always correlate linearly with serum potassium concentration.',
      analysis_mode: 'online_database',
    },
  },
  {
    id: 'case-brugada',
    title: 'Brugada Syndrome Type 1 (Coved ST Elevation V1-V2)',
    tag: 'Channelopathy / Sudden Death Risk',
    severity: 'critical',
    description: 'Prominent coved-type ST-segment elevation >= 2mm in leads V1-V2 followed by inverted T-waves.',
    patientAge: 38,
    patientSex: 'Male',
    symptoms: 'Unexplained nocturnal syncope (passed out in bed), family history of sudden unexplained nocturnal death',
    patternType: 'brugada',
    presetAnalysis: {
      timestamp: new Date(Date.now() - 3600000 * 30).toISOString(),
      patientAge: 38,
      patientSex: 'Male',
      clinicalSymptoms: 'Unprovoked syncope, fever 38.8°C in evening',
      tech_quality: 'Diagnostic quality. Precordial leads placed in 4th and 2nd intercostal spaces.',
      heart_rate_bpm: 82,
      heart_rate_category: 'Normal (60-100)',
      rate_rhythm: 'Normal Sinus Rhythm. Regular rate and intact conduction.',
      axis_degrees: 48,
      axis_quadrant: 'Normal Axis (-30° to +90°)',
      pr_interval_ms: 188,
      qrs_duration_ms: 104,
      qt_interval_ms: 380,
      qtc_interval_ms: 444,
      qtc_status: 'Normal (<450ms M, <460ms F)',
      conduction_hypertrophy: 'Incomplete Right Bundle Branch Block morphology in right precordial leads.',
      ischemia_infarction: 'Coved-type ST-segment elevation of 3.0mm in lead V1 and 2.5mm in lead V2, with a high takeoff J-point followed by a symmetrically inverted T-wave. No reciprocal inferior depression.',
      affected_leads: ['V1', 'V2'],
      syndromes_and_mimics: 'BRUGADA SYNDROME TYPE 1 (DIAGNOSTIC PATTERN): Classic coved ST elevation with T inversion in right precordial leads. Exacerbated by fever or sodium channel blocking drugs.',
      primary_synthesis: 'TYPE 1 BRUGADA ELECTROCARDIOGRAPHIC PATTERN. High risk of polymorphic ventricular tachycardia and sudden cardiac death. Immediate electrophysiology consultation required for ICD evaluation.',
      layman_explanation: 'This test reveals a rare inherited heart rhythm condition called Brugada Syndrome. It makes the heart vulnerable to irregular fast rhythms during sleep or fever. An electrophysiologist (heart rhythm specialist) needs to evaluate you for specialized treatment or a protective heart device.',
      urgency_level: 'Urgent (Emergency Department Evaluation)',
      critical_alert: true,
      alert_reasons: [
        'Diagnostic Type 1 Brugada pattern (coved ST elevation >=2mm with inverted T in V1-V2)',
        'History of unprovoked syncope raises risk of malignant ventricular arrhythmias and sudden cardiac death',
      ],
      recommended_actions: [
        'Immediate cardiology / electrophysiology (EP) referral for Implantable Cardioverter Defibrillator (ICD) assessment',
        'Aggressive fever management with Antipyretics (Acetaminophen); fever unmasks lethal arrhythmias',
        'Strict avoidance of Brugada-triggering drugs (refer to BrugadaDrugs.org: avoid flecainide, propafenone, TCAs)',
        'Screen first-degree family members with 12-lead ECGs and high-precordial lead placement',
      ],
      peer_reviewed_citations: [
        {
          source: 'Europace / HRS / EHRA',
          title: 'J-Wave syndromes consensus report: Brugada syndrome diagnosis and risk stratification',
          relevance: 'Consensus guideline criteria defining diagnostic Type 1 coved morphology',
          url: 'https://doi.org/10.1093/europace/euw379',
        },
      ],
      limitations: 'Brugada pattern can be transient and dynamic. May require high-intercostal lead placement or drug provocation.',
      analysis_mode: 'online_database',
    },
  },
];

/**
 * Dynamically synthesizes a pristine standard 12-lead ECG grid graphic onto a canvas
 * Generates lead labels, calibration markers (10mm/mV), and stylized lead waveforms
 */
export function synthesizeECGCanvas(caseData: SampleECGCase): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1400;
  canvas.height = 900;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const w = canvas.width;
  const h = canvas.height;

  // Background: Pink medical ECG grid
  ctx.fillStyle = '#fff5f5';
  ctx.fillRect(0, 0, w, h);

  // Small grid lines (1mm = ~5px at 1400px width)
  const smallStep = 6;
  const largeStep = 30; // 5mm

  ctx.lineWidth = 0.5;
  ctx.strokeStyle = '#fca5a5';
  ctx.beginPath();
  for (let x = 0; x < w; x += smallStep) {
    if (x % largeStep !== 0) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
    }
  }
  for (let y = 0; y < h; y += smallStep) {
    if (y % largeStep !== 0) {
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
    }
  }
  ctx.stroke();

  // Large grid lines (5mm = 0.2s horizontal, 0.5mV vertical)
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = '#f87171';
  ctx.beginPath();
  for (let x = 0; x < w; x += largeStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
  }
  for (let y = 0; y < h; y += largeStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
  }
  ctx.stroke();

  // Header banner: Patient Demographics & Calibration specs
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(`PATIENT: ${caseData.title.toUpperCase()}  |  AGE: ${caseData.patientAge} ${caseData.patientSex.toUpperCase()}`, 30, 36);
  ctx.font = '13px monospace';
  ctx.fillStyle = '#475569';
  ctx.fillText(`HR: ${caseData.presetAnalysis.heart_rate_bpm} BPM  |  SPEED: 25 mm/s  |  VOLTAGE: 10 mm/mV  |  FILTER: 0.05-150 Hz  |  DATE: ${new Date().toLocaleDateString()}`, 30, 56);

  // 12-lead layout: 3 rows of 4 leads each + 1 rhythm strip across bottom
  // Row 1: I, aVR, V1, V4
  // Row 2: II, aVL, V2, V5
  // Row 3: III, aVF, V3, V6
  // Row 4 (Full bottom width): Lead II Rhythm Strip
  const leadLayout = [
    { name: 'I', col: 0, row: 0 },
    { name: 'aVR', col: 1, row: 0 },
    { name: 'V1', col: 2, row: 0 },
    { name: 'V4', col: 3, row: 0 },

    { name: 'II', col: 0, row: 1 },
    { name: 'aVL', col: 1, row: 1 },
    { name: 'V2', col: 2, row: 1 },
    { name: 'V5', col: 3, row: 1 },

    { name: 'III', col: 0, row: 2 },
    { name: 'aVF', col: 1, row: 2 },
    { name: 'V3', col: 2, row: 2 },
    { name: 'V6', col: 3, row: 2 },
  ];

  const colWidth = (w - 60) / 4;
  const rowHeight = 170;
  const startY = 80;

  // Draw 1mV standard calibration pulse at start of rows
  function drawCalibrationMarker(context: CanvasRenderingContext2D, x: number, y: number) {
    context.save();
    context.strokeStyle = '#0f172a';
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + 10, y);
    context.lineTo(x + 10, y - 60); // 10mm = 2 large boxes = 60px
    context.lineTo(x + 30, y - 60);
    context.lineTo(x + 30, y);
    context.lineTo(x + 40, y);
    context.stroke();
    context.restore();
  }

  // Draw each lead box and waveform
  leadLayout.forEach((lead) => {
    const x0 = 30 + lead.col * colWidth;
    const y0 = startY + lead.row * rowHeight;
    const midY = y0 + rowHeight / 2;

    // Lead Label
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText(lead.name, x0 + 10, y0 + 24);

    // Waveform
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    const bpm = caseData.presetAnalysis.heart_rate_bpm;
    const beatPeriod = (60 / bpm) * 150; // px per beat
    const isAfib = caseData.patternType === 'afib';

    for (let lx = 0; lx < colWidth - 15; lx += 2) {
      const globalX = x0 + lx;
      let phase = (lx % beatPeriod) / beatPeriod;
      let deltaY = 0;

      // Add baseline wander or AFib fibrillatory waves
      if (isAfib) {
        deltaY += Math.sin(lx * 0.3) * 3 + Math.cos(lx * 0.7) * 2;
      }

      // P wave
      if (!isAfib && phase > 0.1 && phase < 0.22) {
        const pNorm = (phase - 0.1) / 0.12;
        deltaY -= Math.sin(pNorm * Math.PI) * 12;
      }

      // QRS Complex
      if (phase >= 0.32 && phase < 0.35) {
        deltaY += 6; // Q dip
      } else if (phase >= 0.35 && phase < 0.42) {
        // Tall R wave
        let rHeight = 45;
        if (lead.name.startsWith('V')) rHeight = 55;
        if (lead.name === 'aVR') rHeight = -30; // inverted in aVR
        deltaY -= rHeight;
      } else if (phase >= 0.42 && phase < 0.46) {
        deltaY += 16; // S wave
      }

      // ST Segment & T wave based on clinical pattern
      if (phase >= 0.46 && phase < 0.75) {
        const tNorm = (phase - 0.46) / 0.29;

        if (caseData.patternType === 'stemi') {
          // Elevated ST in V1-V4
          if (['V1', 'V2', 'V3', 'V4'].includes(lead.name)) {
            deltaY -= 26 + Math.sin(tNorm * Math.PI) * 20; // Tombstone
          } else if (['III', 'aVF'].includes(lead.name)) {
            deltaY += 15 - Math.sin(tNorm * Math.PI) * 10; // Reciprocal depression
          } else {
            deltaY -= Math.sin(tNorm * Math.PI) * 14;
          }
        } else if (caseData.patternType === 'wellens') {
          // Biphasic T in V2, V3
          if (['V2', 'V3'].includes(lead.name)) {
            if (tNorm < 0.5) {
              deltaY -= Math.sin(tNorm * 2 * Math.PI) * 18; // Up deflection
            } else {
              deltaY += Math.sin((tNorm - 0.5) * 2 * Math.PI) * 18; // Down deflection
            }
          } else {
            deltaY -= Math.sin(tNorm * Math.PI) * 12;
          }
        } else if (caseData.patternType === 'hyperkalemia') {
          // Peaked tented narrow T-wave
          deltaY -= Math.pow(Math.sin(tNorm * Math.PI), 3) * 42;
        } else if (caseData.patternType === 'brugada') {
          // Coved ST elevation in V1, V2
          if (['V1', 'V2'].includes(lead.name)) {
            deltaY -= 24 * Math.exp(-tNorm * 2.5); // Coved drop
            if (tNorm > 0.4) deltaY += Math.sin((tNorm - 0.4) * Math.PI * 1.6) * 12; // Inverted T
          } else {
            deltaY -= Math.sin(tNorm * Math.PI) * 12;
          }
        } else {
          // Normal T wave
          deltaY -= Math.sin(tNorm * Math.PI) * 15;
        }
      }

      const drawY = midY + deltaY;
      if (lx === 0) {
        ctx.moveTo(globalX, drawY);
      } else {
        ctx.lineTo(globalX, drawY);
      }
    }
    ctx.stroke();
  });

  // Bottom Continuous Rhythm Strip: Lead II
  const rhythmY = startY + 3 * rowHeight + 20;
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('II (Continuous Rhythm Strip - 10 Seconds)', 30, rhythmY - 10);
  drawCalibrationMarker(ctx, 30, rhythmY + 45);

  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.2;
  ctx.beginPath();

  const bpm = caseData.presetAnalysis.heart_rate_bpm;
  const beatPeriod = (60 / bpm) * 135;
  const isAfib = caseData.patternType === 'afib';

  for (let rx = 80; rx < w - 30; rx += 2) {
    const phase = (rx % beatPeriod) / beatPeriod;
    let deltaY = 0;

    if (isAfib) {
      deltaY += Math.sin(rx * 0.25) * 3 + Math.cos(rx * 0.6) * 2;
    }

    if (!isAfib && phase > 0.1 && phase < 0.22) {
      deltaY -= Math.sin(((phase - 0.1) / 0.12) * Math.PI) * 12;
    }
    if (phase >= 0.35 && phase < 0.42) {
      deltaY -= 50; // Tall R wave in Lead II
    } else if (phase >= 0.42 && phase < 0.46) {
      deltaY += 15;
    }
    if (phase >= 0.48 && phase < 0.75) {
      deltaY -= Math.sin(((phase - 0.48) / 0.27) * Math.PI) * 16;
    }

    const drawY = rhythmY + 45 + deltaY;
    if (rx === 80) ctx.moveTo(rx, drawY);
    else ctx.lineTo(rx, drawY);
  }
  ctx.stroke();

  return canvas.toDataURL('image/jpeg', 0.94);
}
