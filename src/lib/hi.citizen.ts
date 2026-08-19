export const HI_CITIZEN: Record<string, string> = {
  /* ---------- grievance pipeline statuses ---------- */
  OPEN: "खुला",
  TRIAGED: "वर्गीकृत",
  "PLATFORM_RESOLVED / REFERRED_TO_BAR_COUNCIL / REFERRED_TO_DLSA":
    "प्लेटफ़ॉर्म द्वारा समाधान / बार काउंसिल को भेजा गया / DLSA को भेजा गया",
  PLATFORM_RESOLVED: "प्लेटफ़ॉर्म द्वारा समाधान",
  REFERRED_TO_BAR_COUNCIL: "बार काउंसिल को भेजा गया",
  REFERRED_TO_DLSA: "DLSA को भेजा गया",

  /* ---------- grievance summaries (seed / api data) ---------- */
  "Fee not disclosed before work": "काम से पहले शुल्क का खुलासा नहीं किया गया",
  "Professional misconduct (s.35 Advocates Act)": "पेशेवर कदाचार (s.35 Advocates Act)",
  "Quote not honoured — refund processed via PSP":
    "उद्धरण का सम्मान नहीं किया गया — PSP के माध्यम से धन-वापसी की गई",

  /* ---------- Grievance.tsx ---------- */
  "Failed to file grievance": "शिकायत दर्ज करने में विफल",
  "Grievance filed": "शिकायत दर्ज की गई",
  "{id} · {summary} — the grievance pipeline starts here. The platform packages a clean evidence trail for the statutory body that owns the outcome.":
    "शिकायत पाइपलाइन यहीं से शुरू होती है। प्लेटफ़ॉर्म उस वैधानिक निकाय के लिए एक सुव्यवस्थित साक्ष्य श्रृंखला तैयार करता है जिसके पास परिणाम का अधिकार है।",
  "Back to my portal": "मेरे पोर्टल पर वापस जाएँ",
  "How grievances work →": "शिकायतें कैसे काम करती हैं →",
  "Citizen grievance": "नागरिक शिकायत",
  "File a grievance": "शिकायत दर्ज करें",
  "Objective, platform-observable issues — a quote not honoured, a no-show, a fee not disclosed before work, a payment demanded on a legal-aid matter. The platform packages evidence; it does not adjudicate.":
    "उद्देश्यपूर्ण, प्लेटफ़ॉर्म पर देखे जा सकने वाले मुद्दे — अनादरित उद्धरण (कोट), बिना उपस्थिति, काम से पहले शुल्क का खुलासा न होना, विधिक सहायता के मामले में भुगतान की माँग। प्लेटफ़ॉर्म साक्ष्य संकलित करता है; यह निर्णय नहीं करता।",
  "What happened?": "क्या हुआ?",
  "Describe the issue in plain language — facts only, no legal jargon required.":
    "समस्या को सरल भाषा में लिखें — केवल तथ्य, किसी कानूनी शब्दावली की आवश्यकता नहीं।",
  "Facts only. This text is stored for the evidence trail.":
    "केवल तथ्य। यह पाठ साक्ष्य श्रृंखला के लिए संग्रहीत किया जाता है।",
  Category: "श्रेणी",
  Urgency: "तात्कालिकता",
  Normal: "सामान्य",
  Urgent: "तत्काल",
  "Related booking or matter (optional)": "संबंधित बुकिंग या मामला (वैकल्पिक)",
  "e.g. bk_4f2a1c or m_1055": "जैसे bk_4f2a1c या m_1055",
  "Filing…": "दर्ज हो रही है…",
  "File grievance": "शिकायत दर्ज करें",
  "The pipeline": "पाइपलाइन",
  "Professional misconduct is a State Bar Council matter (s.35, Advocates Act 1961). The platform tracks the outcome so institutions see it — it never publishes verdicts.":
    "पेशेवर कदाचार राज्य बार काउंसिल का विषय है (s.35, Advocates Act 1961)। प्लेटफ़ॉर्म परिणाम पर नज़र रखता है ताकि संस्थान इसे देख सकें — यह कभी निर्णय प्रकाशित नहीं करता।",

  /* ---------- Referral.tsx ---------- */
  "Referral not found": "रेफरल नहीं मिला",
  ERROR: "त्रुटि",
  "Loading referral…": "रेफरल लोड हो रहा है…",
  "Legal aid referral · DLSA / Nyaya Bandhu": "विधिक सहायता रेफरल · DLSA / न्याय बंधु",
  "Your referral artefact": "आपका रेफरल दस्तावेज़",
  "This artefact carries your Section 12 declaration to the District Legal Services Authority. The platform refers — it does not adjudicate eligibility. That is the DLSA's statutory function.":
    "यह दस्तावेज़ आपकी धारा 12 घोषणा जिला विधिक सेवा प्राधिकरण तक पहुँचाता है। प्लेटफ़ॉर्म रेफर करता है — यह पात्रता पर निर्णय नहीं करता। यह DLSA का वैधानिक कार्य है।",
  "Supreme Court of India colonnade at blue hour":
    "गोधूलि बेला में भारत के सर्वोच्च न्यायालय का स्तंभ-समूह",
  "Referral {id}": "रेफरल {id}",
  "FREE LEGAL AID": "निःशुल्क विधिक सहायता",
  "Referral authority": "रेफरल प्राधिकारी",
  "District Legal Services Authority — {district}": "जिला विधिक सेवा प्राधिकरण — {district}",
  "Problem category": "समस्या श्रेणी",
  District: "जिला",
  Language: "भाषा",
  "Mode of contact": "संपर्क का तरीका",
  APP: "ऐप",
  ASSISTED: "सहायित",
  "Section 12 declaration": "धारा 12 घोषणा",
  "None declared": "कोई घोषणा नहीं",
  Fee: "शुल्क",
  "₹0 — free legal services apply": "₹0 — निःशुल्क विधिक सेवाएँ लागू हैं",
  "Not applicable": "लागू नहीं",
  "Carry this reference when you approach the DLSA. The DLSA will verify your declaration and provide counsel at no cost to you. You must not be charged for a legal-aid matter. If anyone demands payment,":
    "DLSA के पास जाते समय यह संदर्भ साथ ले जाएँ। DLSA आपकी घोषणा का सत्यापन करेगा और आपको बिना किसी लागत के अधिवक्ता उपलब्ध कराएगा। विधिक सहायता के मामले में आपसे कभी शुल्क नहीं लिया जा सकता। यदि कोई भुगतान की माँग करे,",
  "file a grievance": "शिकायत दर्ज करें",
  "What happens next": "आगे क्या होता है",
  "1. The DLSA assigns counsel from its panel or roster. · 2. Counsel contacts you in your preferred language and mode. · 3. Your matter is tracked as metadata only — the platform never stores its content. · 4. If counsel is not assigned within a reasonable time, the DLSA is the authority — the platform can record the delay for institutional visibility.":
    "1. DLSA अपने पैनल या रोस्टर से अधिवक्ता आवंटित करता है। · 2. अधिवक्ता आपकी पसंदीदा भाषा और तरीके से आपसे संपर्क करता है। · 3. आपका मामला केवल मेटाडेटा के रूप में ट्रैक किया जाता है — प्लेटफ़ॉर्म इसकी सामग्री कभी संग्रहीत नहीं करता। · 4. यदि उचित समय के भीतर अधिवक्ता आवंटित नहीं होता, तो DLSA ही प्राधिकारी है — प्लेटफ़ॉर्म संस्थागत दृश्यता के लिए देरी दर्ज कर सकता है।",
  "Track in my portal": "अपने पोर्टल में ट्रैक करें",
  "Start over": "फिर से शुरू करें",

  /* ---------- category labels (CATEGORY_LABELS) ---------- */
  Property: "संपत्ति",
  Family: "परिवार",
  Employment: "रोज़गार",
  Consumer: "उपभोक्ता",
  Criminal: "आपराधिक",
  "Tenancy / Rent deposit": "किरायेदारी / किराया जमा",
  Other: "अन्य",

  /* ---------- Section 12 labels (SECTION12_LABELS) ---------- */
  "Member of a Scheduled Caste": "अनुसूचित जाति का सदस्य",
  "Member of a Scheduled Tribe": "अनुसूचित जनजाति का सदस्य",
  "Victim of trafficking or beggar": "मानव तस्करी या भीख माँगने वाला पीड़ित",
  "Victim of abuse of power": "सत्ता के दुरुपयोग का पीड़ित",
  "Woman or child": "महिला या बालक",
  "Person with disability": "दिव्यांग व्यक्ति",
  "Victim of disaster or mass violence": "आपदा या सामूहिक हिंसा का पीड़ित",
  "Industrial workman": "औद्योगिक कर्मकार",
  "In custody or jail": "हिरासत या जेल में",
  "Annual income below the prescribed limit": "वार्षिक आय निर्धारित सीमा से कम",
};