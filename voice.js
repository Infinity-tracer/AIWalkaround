/*********************************************
 * voice.js (updated)
 * - voice navigator + multilingual responses
 * - calls avatar start/stop to sync talking animation
 * Place: app-files/voice.js
 *********************************************/

/* ---------- sceneAliases & sceneResponses (same as your APP_DATA scenes) ---------- */
const sceneAliases = {
  "0-cellar_lift": ["cellar", "cellar lift","సెల్లార్","లిఫ్ట్","सेलर","लिफ्ट","செல்லார்","லிப்ட்","ಸೆಲ್ಲಾರ್","ಲಿಫ್ಟ್"],
  "1-entrance_inside_": ["entrance inside","entrance","ప్రవేశం","లోపల","प्रवेश","अंदर","நுழைவாயில்","உள்ளே","ಪ್ರವೇಶ","ಒಳಗೆ"],
  "2-entrance_shot": ["entrance shot","entrance photo","ప్రవేశం ఫోటో","प्रवेश फोटो","நுழைவு படம்","ಪ್ರವೇಶ ಫೋಟೋ"],
  "3-exit_low": ["exit","exit low","outside","బయటకు","निकास","வெளியேறு","ಹೊರಹೋಗು"],
  "4-front_shot": ["front","front shot","ముందు","सामने","முன்","ಮುಂಭಾಗ"],
  "5-long_shot_exit_blue": ["long shot","long shot exit","లాంగ్ షాట్","लंबा शॉट","நீண்ட ஷாட்","ಉದ್ದದ ಶಾಟ್"],
  "6-opus_blue_rear": ["opus rear","back side","వెనుక","पीछे","பின்புறம்","ಹಿಂಭಾಗ"],
  "7-opus_blue_side1": ["opus side","side view","వైపు","बगल","பக்கம்","ಬದಿಯ"],
  "8-villas": ["villa","villas","విల్లా","विला","வில்லா","ವಿಲ್ಲಾ"]
};

const sceneResponses = {
  "0-cellar_lift": {
    en: "This is the cellar lift area, mainly for parking access.",
    te: "ఇది సెల్లార్ లిఫ్ట్ ప్రాంతం, ప్రధానంగా పార్కింగ్ కోసం.",
    hi: "यह सेलर लिफ्ट क्षेत्र है, मुख्य रूप से पार्किंग के लिए।",
    ta: "இது செல்லார் லிப்ட் பகுதி, பெரும்பாலும் கார் நிறுத்தத்திற்கு.",
    kn: "ಇದು ಸೆಲ್ಲಾರ್ ಲಿಫ್ಟ್ ಪ್ರದೇಶ, ಮುಖ್ಯವಾಗಿ ಪಾರ್ಕಿಂಗ್‌ಗಾಗಿ."
  },
  "1-entrance_inside_": {
    en: "You are now at the entrance inside the building.",
    te: "ఇది భవనం లోపలి ప్రవేశం.",
    hi: "यह इमारत के अंदर का प्रवेश द्वार है।",
    ta: "இது கட்டிடத்தின் உள்ளே நுழைவு பகுதி.",
    kn: "ಇದು ಕಟ್ಟಡದ ಒಳಗಿನ ಪ್ರವೇಶ."
  },
  "2-entrance_shot": {
    en: "This is the main entrance shot of the project.",
    te: "ఇది ప్రాజెక్ట్ యొక్క ప్రధాన ప్రవేశం షాట్.",
    hi: "यह परियोजना का मुख्य प्रवेश दृश्य है।",
    ta: "இது திட்டத்தின் முக்கிய நுழைவு காட்சி.",
    kn: "ಇದು ಯೋಜನೆಯ ಮುಖ್ಯ ಪ್ರವೇಶದ ದೃಶ್ಯ."
  },
  "3-exit_low": {
    en: "This is the exit area leading out of the building.",
    te: "ఇది భవనం బయటకు తీసుకువెళ్ళే ప్రాంతం.",
    hi: "यह इमारत से बाहर जाने का निकास है।",
    ta: "இது கட்டிடத்தின் வெளியேறும் பகுதி.",
    kn: "ಇದು ಕಟ್ಟಡದ ನಿರ್ಗಮನ ಪ್ರದೇಶ."
  },
  "4-front_shot": {
    en: "Here is the front shot showcasing the facade.",
    te: "ఇది ముఖభాగాన్ని చూపించే ముందుభాగం షాట్.",
    hi: "यह सामने का दृश्य है जो मुखौटा दिखाता है।",
    ta: "இது முகப்பைக் காட்டும் முன் காட்சி.",
    kn: "ಇದು ಮುಂಭಾಗದ ದೃಶ್ಯ, ಮುಖವನ್ನು ತೋರಿಸುತ್ತದೆ."
  },
  "5-long_shot_exit_blue": {
    en: "This is the long shot of the blue exit side.",
    te: "ఇది బ్లూ ఎగ్జిట్ వైపు లాంగ్ షాట్.",
    hi: "यह नीले निकास पक्ष का लंबा शॉट है।",
    ta: "இது நீல வெளியேறும் பக்கத்தின் நீண்ட காட்சி.",
    kn: "ಇದು ನೀಲಿ ನಿರ್ಗಮನ ಬದಿಯ ಉದ್ದದ ದೃಶ್ಯ."
  },
  "6-opus_blue_rear": {
    en: "This shows the rear view of Opus Blue.",
    te: "ఇది ఓపస్ బ్లూ వెనుక వీక్షణాన్ని చూపిస్తుంది.",
    hi: "यह ओपस ब्लू का पिछला दृश्य दिखाता है।",
    ta: "இது ஓபஸ் ப்ளூவின் பின்புறக் காட்சியை காட்டுகிறது.",
    kn: "ಇದು ಓಪಸ್ ಬ್ಲೂ ಹಿಂಭಾಗದ ದೃಶ್ಯವನ್ನು ತೋರಿಸುತ್ತದೆ."
  },
  "7-opus_blue_side1": {
    en: "This is the side view of Opus Blue.",
    te: "ఇది ఓపస్ బ్లూ సైడ్ వీక్షణం.",
    hi: "यह ओपस ब्लू का साइड दृश्य है।",
    ta: "இது ஓபஸ் ப்ளூவின் பக்க காட்சி.",
    kn: "ಇದು ಓಪಸ್ ಬ್ಲೂ ಬದಿಯ ದೃಶ್ಯ."
  },
  "8-villas": {
    en: "Here are the luxury villas with private gardens.",
    te: "ఇవి ప్రైవేట్ గార్డెన్ ఉన్న విల్లాలు.",
    hi: "ये प्राइवेट गार्डन वाले विला हैं।",
    ta: "இவை தனியார் தோட்டம் கொண்ட வில்லாக்கள்.",
    kn: "ಇವು ಖಾಸಗಿ ತೋಟವಿರುವ ವಿಲ್ಲಾಗಳು."
  }
};

/* ---------- Utilities ---------- */
function normalize(str) {
  return (str || "").toLowerCase().replace(/[^a-z\u0900-\u0DFF\s]/g, "").trim();
}
function levenshtein(a, b) {
  a = a || ""; b = b || "";
  const matrix = []; const alen = a.length, blen = b.length;
  for (let i = 0; i <= blen; i++) matrix[i] = [i];
  for (let j = 0; j <= alen; j++) matrix[0][j] = j;
  for (let i = 1; i <= blen; i++) {
    for (let j = 1; j <= alen; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i-1][j-1];
      else matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, matrix[i][j-1] + 1, matrix[i-1][j] + 1);
    }
  }
  return 1 - (matrix[blen][alen] / Math.max(alen, blen));
}
function detectLanguage(text) {
  if (/[అ-హ]/.test(text)) return "te-IN";
  if (/[क-ह]/.test(text)) return "hi-IN";
  if (/[அ-ஹ]/.test(text)) return "ta-IN";
  if (/[ಅ-ಹ]/.test(text)) return "kn-IN";
  return "en-IN";
}

/* ---------- TTS that syncs avatar ---------- */
function speak(text, lang = "en-IN") {
  if (!text) return;
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = lang;

  // start avatar talking if available
  utter.onstart = function() {
    try { if (window.startAvatarTalking) window.startAvatarTalking(); } catch(e){/*ignore*/ }
  };
  utter.onend = function() {
    try { if (window.stopAvatarTalking) window.stopAvatarTalking(); } catch(e){/*ignore*/ }
  };
  speechSynthesis.speak(utter);
}

/* ---------- Voice command handler ---------- */
function handleVoiceCommand(command, currentLang) {
  const clean = normalize(command);
  if (!clean || clean.length < 2) return;

  let bestMatch = null, bestScore = 0;
  Object.keys(sceneAliases).forEach(sceneId => {
    sceneAliases[sceneId].forEach(alias => {
      const score = levenshtein(clean, normalize(alias));
      if (score > bestScore) { bestScore = score; bestMatch = sceneId; }
    });
  });

  if (bestMatch && bestScore >= 0.75) {
    const sceneData = window.APP_DATA ? APP_DATA.scenes.find(s => s.id === bestMatch) : null;
    const targetScene = window.scenes ? window.scenes.find(s => s.data.id === bestMatch) : null;
    if (targetScene) {
      targetScene.scene.switchTo();
      speak(`Navigating to ${sceneData ? sceneData.name : bestMatch}`, currentLang);

      const responses = sceneResponses[bestMatch];
      if (responses) {
        setTimeout(() => {
          let response = responses.en;
          if (currentLang.startsWith("te")) response = responses.te;
          else if (currentLang.startsWith("hi")) response = responses.hi;
          else if (currentLang.startsWith("ta")) response = responses.ta;
          else if (currentLang.startsWith("kn")) response = responses.kn;
          speak(response, currentLang);
        }, 1200);
      }
    }
  } else {
    // only say sorry if input looks like a real phrase (avoid noise spamming)
    if (clean.split(" ").length > 1) {
      speak("Sorry, I did not understand", currentLang);
    }
  }
}

/* ---------- SpeechRecognition setup ---------- */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = SpeechRecognition ? new SpeechRecognition() : null;
let currentLang = "en-IN";
let listening = false;

if (recognition) {
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.lang = currentLang;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    if (!transcript || transcript.length < 2) return;
    console.log("Voice heard:", transcript);
    handleVoiceCommand(transcript, currentLang);
  };

  recognition.onerror = (e) => {
    console.error("Speech recognition error:", e);
  };
}

/* ---------- UI control functions (used by index.html) ---------- */
function toggleMic() {
  if (!recognition) { alert("SpeechRecognition not available in this browser."); return; }
  if (!listening) {
    try { recognition.start(); listening = true; document.getElementById("micButton").innerText = "🎤 Listening..."; }
    catch(e){ console.warn("recognition start error", e); }
  } else {
    recognition.stop(); listening = false; document.getElementById("micButton").innerText = "🎙️ Start Voice";
  }
}

function setRecognitionLang(lang) {
  currentLang = lang || "en-IN";
  if (!recognition) return;
  try {
    recognition.stop();
    recognition.lang = currentLang;
    if (listening) recognition.start();
    console.log("Recognition language set to", currentLang);
  } catch(e) {
    console.warn("Error changing recognition language", e);
  }
}

// Expose UI functions to global so index.html can call them
window.toggleMic = toggleMic;
window.setRecognitionLang = setRecognitionLang;
window.speak = speak; // optional external call

// (end of voice.js)
