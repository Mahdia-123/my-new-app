import React, { useState } from "react";
import "./AiTranslator.css";
import Polyglot from "node-polyglot";

export default function AiTranslator() {
  const [prompt, setPrompt] = useState("");
  const [language, setLanguage] = useState("");
  const [translation, setTranslation] = useState("");
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);

  const polyglot = new Polyglot();
  const openAiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const handleTranslate = async () => {
    if (!prompt || !language) {
      alert("Please enter text and select a language");
      return;
    }

    const key = `${prompt}_${language}`;

    if (polyglot.has(key)) {
      setTranslation(polyglot.t(key));
      setShowTranslation(true);
      return;
    }

    setLoading(true);
    setTranslation("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openAiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "You are a helpful translator." },
            {
              role: "user",
              content: `Translate the following text to ${language}: ${prompt}`,
            },
          ],
          max_tokens: 500,
        }),
      });

      const data = await res.json();
      console.log("OpenAI Response:", data);

      if (data.error) throw new Error(data.error.message);

      const text = data.choices?.[0]?.message?.content?.trim();
      if (!text) throw new Error("No translation returned");

      polyglot.extend({ [key]: text });
      setTranslation(text);
      setShowTranslation(true);
    } catch (err) {
      console.error(err);
      setTranslation(`Translation failed: ${err.message}`);
      setShowTranslation(true);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    setPrompt("");
    setLanguage("");
    setTranslation("");
    setShowTranslation(false);
  };

  return (
    <div className="aiTranslator">
      <div className="container">
        <img src="images/Frame 7.png" alt="pollyglot" className="img-fluid" />

        <div className="translationPart">
          <h2>Text to Translate 👇</h2>
          <textarea
            className="textToTranslate"
            placeholder="Enter a text..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>

          {!showTranslation && (
            <>
              <h2>Select Language 👇</h2>
              <div className="radio">
                <div>
                  <input
                    type="radio"
                    id="japanese"
                    name="language"
                    value="Japanese"
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                  <label htmlFor="japanese">Japanese 🇯🇵</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="french"
                    name="language"
                    value="French"
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                  <label htmlFor="french">French 🇫🇷</label>
                </div>
                <div>
                  <input
                    type="radio"
                    id="spanish"
                    name="language"
                    value="Spanish"
                    onChange={(e) => setLanguage(e.target.value)}
                  />
                  <label htmlFor="spanish">Spanish 🇪🇸</label>
                </div>
              </div>

              <button
                className="translateBtn"
                onClick={handleTranslate}
                disabled={loading}
              >
                {loading ? "Translating..." : "Translate"}
              </button>
            </>
          )}

          {showTranslation && (
            <>
              <h2>Translation 👇</h2>
              <textarea
                className="textToTranslate"
                value={translation}
                readOnly
              ></textarea>
              <button className="translateBtn" onClick={handleStartOver}>
                Start Over
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
