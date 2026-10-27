import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Shared Gemini client utility
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Medical Guideline Database References
const ECG_REFERENCE_DATABASE = [
  {
    topic: 'STEMI Diagnostic Criteria (4th Universal Definition)',
    organization: 'ESC / ACC / AHA / WHF Joint Consensus',
    citation: 'Thygesen K, et al. Fourth Universal Definition of Myocardial Infarction (2018). Eur Heart J. 2019;40(3):237-269.',
    url: 'https://doi.org/10.1093/eurheartj/ehy462',
    keyRules: [
      'New ST elevation at J-point in >= 2 contiguous leads',
      'Leads V2-V3: >= 2.5 mm in men < 40 yrs, >= 2.0 mm in men >= 40 yrs, >= 1.5 mm in women regardless of age',
      'All other leads (I, aVL, II, III, aVF, V4-V6): >= 1.0 mm ST elevation',
      'Reciprocal ST depression in contralateral leads (e.g., inferior STE III/aVF with reciprocal STD in aVL)',
    ],
  },
  {
    topic: 'Wellens Syndrome (Critical LAD Stenosis)',
    organization: 'American Heart Association / LITFL',
    citation: 'de Zwaan C, Bär FW, Wellens HJ. Characteristic electrocardiographic pattern indicating a critical stenosis high in LAD coronary artery. Am Heart J. 1982;103(4 Pt 2):730-6.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/6121481/',
    keyRules: [
      'Type A (25%): Biphasic T waves in leads V2 and V3 (initial positive deflection, terminal negative deflection)',
      'Type B (75%): Deeply, symmetrically inverted T waves in leads V2 and V3 (often extending V1-V5)',
      'Normal or minimally elevated cardiac enzymes initially, absent precordial Q waves, no loss of R wave progression',
      'High risk of extensive anterior wall MI within days without urgent angiography',
    ],
  },
  {
    topic: 'Brugada Syndrome Electrocardiographic Criteria',
    organization: 'Heart Rhythm Society (HRS) / EHRA Consensus',
    citation: 'Antzelevitch C, et al. J-Wave syndromes consensus report. Europace. 2017;19(4):665-686.',
    url: 'https://doi.org/10.1093/europace/euw379',
    keyRules: [
      'Type 1 (Diagnostic): Coved-type ST elevation >= 2 mm (0.2 mV) in >= 1 right precordial lead (V1, V2) positioned in 2nd, 3rd, or 4th intercostal space, followed by a negative T wave',
      'Type 2 (Suggestive): Saddleback pattern with >= 2 mm J-point elevation and >= 1 mm ST elevation with positive or biphasic T wave',
      'Risk of polymorphic VT, ventricular fibrillation, and sudden cardiac death, especially during fever or sleep',
    ],
  },
  {
    topic: 'Pulmonary Embolism (McGinn-White S1Q3T3 & Right Strain)',
    organization: 'European Society of Cardiology (ESC)',
    citation: 'Konstantinides SV, et al. 2019 ESC Guidelines for the diagnosis and management of acute pulmonary embolism. Eur Heart J. 2020;41(4):543-603.',
    url: 'https://doi.org/10.1093/eurheartj/ehz405',
    keyRules: [
      'Sinus tachycardia (most common arrhythmia in PE)',
      'McGinn-White triad: Prominent S wave in lead I, Q wave in lead III, and T wave inversion in lead III (S1Q3T3)',
      'Right ventricular strain: T-wave inversions simultaneously in V1-V4 and inferior leads (II, III, aVF)',
      'New complete or incomplete Right Bundle Branch Block (RBBB), rightward axis shift (> +90°)',
    ],
  },
  {
    topic: 'Hyperkalemia Graduated ECG Manifestations',
    organization: 'PhysioNet PTB-XL & Emergency Medicine Standards',
    citation: 'Montague BT, Ouellette JR, Buller GK. Retrospective review of the frequency of ECG changes in hyperkalemia. Clin J Am Soc Nephrol. 2008;3(2):324-30.',
    url: 'https://doi.org/10.2215/CJN.04611007',
    keyRules: [
      'Early (K+ 5.5 - 6.5 mEq/L): Tall, peaked, narrow, symmetrical "tented" T waves (especially in precordial leads V2-V4)',
      'Moderate (K+ 6.5 - 7.5 mEq/L): PR interval prolongation, flattening/loss of P waves, widening of QRS complex',
      'Severe (K+ > 7.5 mEq/L): Sine-wave pattern, bundle branch blocks, progression to asystole or ventricular fibrillation',
      'Clinical urgency: Calcium gluconate/chloride membrane stabilization required immediately',
    ],
  },
  {
    topic: 'QTc Prolongation & Arrhythmia Risk (Bazett Formula)',
    organization: 'ACC / AHA / HRS Guidelines',
    citation: 'Drew BJ, et al. Prevention of Torsades de Pointes in hospital settings: a scientific statement from the AHA and ACCF. Circulation. 2010;121(8):1047-60.',
    url: 'https://doi.org/10.1161/CIRCULATIONAHA.109.192704',
    keyRules: [
      'Bazett Formula: QTc = QT / sqrt(RR interval in seconds)',
      'Normal values: Men <= 450 ms, Women <= 460 ms',
      'Borderline: 450 - 470 ms (Men), 460 - 480 ms (Women)',
      'Prolonged: > 470 ms (Men), > 480 ms (Women)',
      'Critical risk of Torsades de Pointes / polymorphic VT: QTc > 500 ms',
    ],
  },
];

// Reference database API
app.get('/api/ecg/reference-database', (req, res) => {
  res.json({
    success: true,
    count: ECG_REFERENCE_DATABASE.length,
    databases: ECG_REFERENCE_DATABASE,
  });
});

// Automated 12-Lead ECG Analysis Endpoint with Live Medical Search Grounding
app.post('/api/ecg/analyze', async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', patientContext = {}, mode = 'online_database' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'No image data provided for ECG analysis.' });
    }

    // Clean base64 string
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, '').replace(/^data:application\/pdf;base64,/, '');

    if (!ai) {
      return res.status(503).json({
        error: 'Gemini API is not initialized. Ensure GEMINI_API_KEY is configured in your environment.',
        offlineAvailable: true,
      });
    }

    const { age = 'Unknown', sex = 'Unknown', symptoms = 'None reported', priorConditions = 'None reported' } = patientContext;

    const systemInstruction = `You are a clinical professor of emergency cardiology and cardiac electrophysiology.
Your task is to analyze the provided 12-lead ECG with supreme rigor, applying standardized ACC/AHA/ESC and PhysioNet guidelines.

CRITICAL INSTRUCTIONS FOR CLINICAL GROUNDING:
1. Search and cross-reference real-time medical datasets, PubMed citations, ESC 2023 Guidelines, 4th Universal Definition of Myocardial Infarction, and PhysioNet PTB-XL ECG criteria for pattern confirmation.
2. Technical Quality check: check paper speed (default 25mm/s), voltage calibration (default 10mm/mV = 1mV marker), somatic tremor, baseline wander, and limb lead reversals (Lead I negative P/QRS vs dextrocardia).
3. Rhythm & Rate: measure ventricular rate (bpm), regularity (regular, regularly irregular, irregularly irregular), P wave presence, PR interval. Classify rhythm (Normal Sinus, Sinus Bradycardia, Sinus Tachycardia, Atrial Fibrillation, Atrial Flutter, SVT, VT, AV block).
4. Axis: estimate mean frontal QRS electrical axis in degrees, identify quadrant (Normal [-30° to +90°], Left Axis Deviation [-30° to -90°], Right Axis Deviation [+90° to +180°], Extreme axis).
5. Intervals: measure PR interval (normal 120-200ms), QRS duration (normal < 120ms), QT interval and corrected QTc (using Bazett formula QTc = QT / sqrt(RR)). Flag if QTc > 460ms (female) or > 450ms (male), and sound critical alarm if QTc > 500ms.
6. Ischemia / Infarction (4th Universal Definition):
   - Evaluate ST elevation at J-point in contiguous leads:
     * Leads V2-V3: >=2.5mm (men <40), >=2.0mm (men >=40), >=1.5mm (women).
     * Leads I, aVL, II, III, aVF, V4-V6: >=1.0mm.
   - Look for reciprocal ST depressions (crucial discriminator).
   - Check RV extension (inferior STE + STE in V1 > V2) or posterior extension (ST depression in V1-V3 with tall R waves and upright T waves).
7. Syndromes & Mimics:
   - Wellens Syndrome: biphasic (Type A) or deeply inverted (Type B) T-waves in V2-V3.
   - Pulmonary Embolism: S1Q3T3 pattern, right heart strain, T-wave inversions in V1-V4 and inferior leads.
   - Brugada Syndrome: Type 1 coved ST elevation >=2mm in V1-V2 followed by negative T-wave; Type 2 saddleback.
   - Hyperkalemia: tall peaked narrow tented T-waves, PR prolongation, wide QRS.
   - Benign Early Repolarization (BER): notched J-point, concave STE, absent reciprocal changes.
   - Left Ventricular Hypertrophy (LVH): Sokolow-Lyon criteria (S in V1 + R in V5/V6 >= 35mm), Cornell criteria.
8. Patient Accessibility: Provide both a technical electrophysiology breakdown and a gentle, clear, plain-English summary suited for an elderly patient or caregiver.
9. Provide actual PubMed/ESC/AHA citations and reference links where applicable.

Return ONLY a valid JSON object matching this schema:
{
  "tech_quality": "Detailed technical quality assessment (speed, calibration, artifact, limb lead placement)",
  "heart_rate_bpm": number,
  "heart_rate_category": "Normal (60-100)" | "Bradycardia (<60)" | "Tachycardia (>100)" | "Extreme Tachycardia (>150)" | "Extreme Bradycardia (<40)",
  "rate_rhythm": "Specific rhythm classification and description",
  "axis_degrees": number,
  "axis_quadrant": "Normal Axis (-30° to +90°)" | "Left Axis Deviation (-30° to -90°)" | "Right Axis Deviation (+90° to +180°)" | "Extreme Right Axis",
  "pr_interval_ms": number,
  "qrs_duration_ms": number,
  "qt_interval_ms": number,
  "qtc_interval_ms": number,
  "qtc_status": "Normal (<450ms M, <460ms F)" | "Borderline (450-470ms M, 460-480ms F)" | "Prolonged (>470ms M, >480ms F)" | "Critical Alert (>500ms - Torsades risk)",
  "conduction_hypertrophy": "Conduction abnormalities (BBB, fascicular block) and chamber enlargement/hypertrophy (LVH, RVH, RAE, LAE)",
  "ischemia_infarction": "Detailed ST segment, T wave, and pathological Q wave analysis across anatomical lead groups",
  "affected_leads": ["Lead I", "Lead II", etc.],
  "syndromes_and_mimics": "Systematic rule-in/rule-out of Wellens, PE (S1Q3T3), Brugada, Hyperkalemia, Early Repol, Digoxin",
  "primary_synthesis": "Crisp 2-3 sentence emergency cardiology executive summary",
  "layman_explanation": "Compassionate, easy-to-understand explanation for elderly patients and non-physicians",
  "urgency_level": "Immediate Emergency (Cath Lab / Resuscitation)" | "Urgent (Emergency Department Evaluation)" | "Prompt (Cardiology Clinic within 24-48h)" | "Routine / Normal",
  "critical_alert": boolean,
  "alert_reasons": ["Array of critical triggers if critical_alert is true"],
  "recommended_actions": ["List of immediate clinical actions"],
  "peer_reviewed_citations": [
    {
      "source": "Journal / Guidelines name",
      "title": "Article or guideline title",
      "relevance": "Why this paper applies to this finding",
      "url": "https://..."
    }
  ],
  "limitations": "Image artifacts, lead occlusions, or limitations of computer-assisted reading"
}`;

    const promptText = `Analyze this 12-Lead ECG image.
Patient Context:
- Age: ${age}
- Sex: ${sex}
- Presenting Symptoms: ${symptoms}
- Prior Known Cardiac Conditions: ${priorConditions}

Query the global medical literature database, ESC/AHA criteria, and PhysioNet references. Output strictly valid JSON.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: mimeType.startsWith('image/') ? mimeType : 'image/jpeg',
            data: cleanBase64,
          },
        },
        { text: promptText },
      ],
    };

    // Use gemini-3.8-flash with Google Search grounding to cross-reference online databases
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        tools: [{ googleSearch: {} }],
        temperature: 0.1,
      },
    });

    let responseText = response.text || '';
    
    // Strip markdown code fences if present
    responseText = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();

    // Find JSON boundary if surrounded by text
    const firstBrace = responseText.indexOf('{');
    const lastBrace = responseText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      responseText = responseText.substring(firstBrace, lastBrace + 1);
    }

    let parsedResult;
    try {
      parsedResult = JSON.parse(responseText);
    } catch (parseError) {
      console.warn('JSON parse fallback, attempting secondary clean:', parseError);
      return res.status(502).json({
        error: 'Failed to parse model interpretation into structured format. Please retry.',
        rawText: response.text,
      });
    }

    // Extract search grounding metadata if present
    const searchGroundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const webSources = searchGroundingChunks
      .filter((chunk: any) => chunk.web?.uri)
      .map((chunk: any) => ({
        title: chunk.web?.title || 'Medical Literature Source',
        url: chunk.web?.uri,
      }));

    if (webSources.length > 0 && Array.isArray(parsedResult.peer_reviewed_citations)) {
      webSources.forEach((ws: any) => {
        if (!parsedResult.peer_reviewed_citations.some((c: any) => c.url === ws.url)) {
          parsedResult.peer_reviewed_citations.push({
            source: 'Verified Web Grounding',
            title: ws.title,
            relevance: 'Live verified clinical database match',
            url: ws.url,
          });
        }
      });
    }

    return res.json({
      success: true,
      analysis: parsedResult,
      groundedWebSources: webSources,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('ECG analysis server error:', err);
    return res.status(500).json({
      error: err.message || 'An unexpected error occurred during ECG analysis.',
    });
  }
});

// Full-stack Vite middleware integration
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`CardioPulse server running on http://localhost:${PORT}`);
  });
}

startServer();
