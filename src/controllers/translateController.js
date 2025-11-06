import fetch from "node-fetch";

async function translateWithLibre(text, targetLang) {
  try {
    const response = await fetch("http://localhost:5001/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        q: text,
        source: "auto", 
        target: targetLang,
        format: "text"
      })
    });

    if (!response.ok) throw new Error(`LibreTranslate returned status ${response.status}`);

    const data = await response.json();
    return {
      translated_text: data.translatedText,
      detected_language: "auto"
    };
  } catch (error) {
    console.error("LibreTranslate error:", error.message);
    throw error;
  }
}

export const translateText = async (req, res) => {
  const { text, target_language } = req.body;

  if (!text || !target_language) {
    return res.status(400).json({ error: "text and target_language are required" });
  }

  if (!["ar", "en"].includes(target_language)) {
    return res.status(400).json({ error: "target_language must be 'ar' or 'en'" });
  }

  try {
    const result = await translateWithLibre(text, target_language);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: "Translation failed, please try again later" });
  }
};
