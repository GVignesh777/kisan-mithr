export const cropPesticideData = [
  {
    id: "cotton",
    nameEn: "Cotton",
    nameTe: "పత్తి",
    waterPerAcre: 150, // liters
    pesticides: [
      {
        id: "monocrotophos",
        name: "Monocrotophos 36% SL",
        dosagePerAcre: 350,
        unit: "ml",
        targetPestEn: "Aphids, Thrips, Whitefly",
        targetPestTe: "పేనుబంక, తామర పురుగులు, తెల్ల దోమ",
        safetyWarningEn: "High Toxicity. Avoid spraying during high wind. Wear full mask and gloves.",
        safetyWarningTe: "అత్యంత విషపూరితం. గాలి ఎక్కువగా ఉన్నప్పుడు పిచికారీ చేయవద్దు. మాస్క్ మరియు చేతిగవచాలు ధరించండి."
      },
      {
        id: "imidacloprid",
        name: "Imidacloprid 17.8% SL",
        dosagePerAcre: 100,
        unit: "ml",
        targetPestEn: "Jassids, Aphids",
        targetPestTe: "పచ్చ దోమ, పేనుబంక",
        safetyWarningEn: "Moderate Toxicity. Wash hands thoroughly after use.",
        safetyWarningTe: "మితమైన విషం. ఉపయోగించిన తర్వాత చేతులను శుభ్రంగా కడుక్కోవాలి."
      }
    ]
  },
  {
    id: "rice",
    nameEn: "Rice (Paddy)",
    nameTe: "వరి",
    waterPerAcre: 200, // liters
    pesticides: [
      {
        id: "chlorpyrifos",
        name: "Chlorpyrifos 20% EC",
        dosagePerAcre: 500,
        unit: "ml",
        targetPestEn: "Stem Borer, Leaf Folder",
        targetPestTe: "కాండం తొలిచే పురుగు, ఆకు ముడత పురుగు",
        safetyWarningEn: "High Toxicity. Avoid aquatic life contact. Spray in early morning.",
        safetyWarningTe: "అత్యంత విషపూరితం. ఉదయం సమయంలో మాత్రమే పిచికారీ చేయండి."
      },
      {
        id: "hexaconazole",
        name: "Hexaconazole 5% EC",
        dosagePerAcre: 400,
        unit: "ml",
        targetPestEn: "Sheath Blight",
        targetPestTe: "పొట్ట కుళ్ళు తెగులు",
        safetyWarningEn: "Low Toxicity. Regular safety gear recommended.",
        safetyWarningTe: "తక్కువ విషం. సాధారణ రక్షణ పరికరాలను వాడండి."
      }
    ]
  },
  {
    id: "sugarcane",
    nameEn: "Sugarcane",
    nameTe: "చెరకు",
    waterPerAcre: 250, // liters
    pesticides: [
      {
        id: "fipronil",
        name: "Fipronil 5% SC",
        dosagePerAcre: 400,
        unit: "ml",
        targetPestEn: "Early Shoot Borer, Termites",
        targetPestTe: "కాండం తొలిచే పురుగు, చెదపురుగులు",
        safetyWarningEn: "Moderate Toxicity. Wash clothes and body after application.",
        safetyWarningTe: "మితమైన విషం. పిచికారీ చేసిన తర్వాత బట్టలు, శరీరాన్ని శుభ్రం చేసుకోవాలి."
      }
    ]
  },
  {
    id: "generic",
    nameEn: "Generic Land Spray",
    nameTe: "సాధారణ పిచికారీ",
    waterPerAcre: 150, // liters
    pesticides: [
      {
        id: "generic_pest",
        name: "Standard Insecticide",
        dosagePerAcre: 250,
        unit: "ml",
        targetPestEn: "All general insects",
        targetPestTe: "అన్ని సాధారణ కీటకాలు",
        safetyWarningEn: "Read product label carefully. Standard precautions apply.",
        safetyWarningTe: "ఉత్పత్తి లేబుల్‌ను జాగ్రత్తగా చదవండి. ప్రామాణిక జాగ్రత్తలు పాటించండి."
      },
      {
        id: "generic_weed",
        name: "Standard Herbicide (Weed Killer)",
        dosagePerAcre: 500,
        unit: "ml",
        targetPestEn: "Broadleaf and grassy weeds",
        targetPestTe: "కలుపు మొక్కలు",
        safetyWarningEn: "Do not mix with other chemicals unless directed.",
        safetyWarningTe: "అవసరమైతే తప్ప ఇతర రసాయనాలతో కలపవద్దు."
      }
    ]
  }
];
