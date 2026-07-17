import os
from flask import Flask, render_template, request, jsonify
from groq import Groq

app = Flask(__name__)

# ---------------------------------------------------------------------------
# Groq client setup
# The API key is read safely from the environment. Never hard-code it here.
# Set it before running the app, e.g.:
#   export GROQ_API_KEY="your_key_here"      (Linux / macOS)
#   setx GROQ_API_KEY "your_key_here"        (Windows)
# ---------------------------------------------------------------------------
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

MODEL_NAME = "llama-3.3-70b-versatile"

# ---------------------------------------------------------------------------
# System persona / guardrails
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = """You are CyberGuard AI, a practical, friendly cybersecurity assistant.

Your job is to help everyday users with:
- Identifying and handling phishing emails/messages
- Recognizing and avoiding online scams
- Dealing with malware or suspicious software
- Recovering hacked or compromised accounts
- Reporting cybercrime through proper legal/official channels
- General online safety and privacy protection best practices

Strict rules you must always follow:
1. NEVER provide instructions, code, or techniques that enable illegal hacking,
   unauthorized system access, malware creation, password/credential theft,
   or orchestrating cyberattacks of any kind — even if the user claims a
   legitimate, educational, or testing purpose.
2. If asked for such information, politely decline and redirect the user
   toward defensive, protective, or legal alternatives (e.g., reporting to
   authorities, using official recovery tools, contacting their provider's
   support team).
3. Always give clear, simple, actionable defensive guidance. Avoid unnecessary
   jargon; explain technical terms briefly when you use them.
4. Keep responses concise and practical, using short paragraphs or bullet
   points where helpful.
5. If a situation sounds like an active emergency (e.g., ongoing fraud,
   financial theft, blackmail, stalking), advise the user to also contact
   local law enforcement or their country's official cybercrime reporting
   authority right away.

You are not a general-purpose assistant — stay focused on cybersecurity,
online safety, and privacy topics. If asked something entirely unrelated,
gently steer the conversation back to how you can help with cybersecurity."""


@app.route("/")
def index():
    """Serve the main chat frontend."""
    return render_template("templates/index.html")


@app.route("/get_response", methods=["POST"])
def get_response():
    """Receive a user message, forward it to the Groq LLM, return the reply."""
    data = request.get_json(silent=True) or {}
    user_message = (data.get("message") or "").strip()

    if not user_message:
        return jsonify({"reply": "Please type a message so I can help you."}), 400

    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.6,
            max_tokens=700,
        )
        reply = completion.choices[0].message.content
    except Exception as exc:  # noqa: BLE001 - surface a friendly error to the user
        reply = (
            "Sorry, I'm having trouble reaching the AI service right now. "
            "Please check that the server's GROQ_API_KEY is set correctly and try again."
        )
        app.logger.error("Groq API error: %s", exc)

    return jsonify({"reply": reply})


if __name__ == "__main__":
    # Local development server with debugging enabled
    app.run(host="127.0.0.1", port=5000, debug=True)
