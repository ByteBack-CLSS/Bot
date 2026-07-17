# 🛡️ CyberGuard AI

A lightweight, responsive single-page cybersecurity assistant chatbot. Frontend
is plain HTML/CSS/JS in a "Cyber Dark Mode" theme; backend is a Flask server
that forwards messages to Groq's `llama-3.3-70b-versatile` model.

## Folder structure

```
cyberguard-ai/
├── app.py                # Flask backend (routes + Groq integration)
├── requirements.txt      # Python dependencies
├── templates/
│   └── index.html        # Main chat page
└── static/
    ├── style.css          # Cyber dark mode styling
    └── script.js          # Chat UI interactivity + fetch logic
```

## Setup

1. **Create a virtual environment (optional but recommended)**
   ```bash
   python -m venv venv
   source venv/bin/activate      # Windows: venv\Scripts\activate
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set your Groq API key as an environment variable**
   ```bash
   export GROQ_API_KEY="your_key_here"      # Linux / macOS
   setx GROQ_API_KEY "your_key_here"        # Windows (new terminal needed after)
   ```
   Get a key from https://console.groq.com/keys

4. **Run the app**
   ```bash
   python app.py
   ```
   The server starts at **http://127.0.0.1:5000/** with debug mode enabled.

5. Open that URL in your browser and start chatting.

## How it works

- `GET /` renders `templates/index.html`.
- The frontend's `script.js` sends the user's message as JSON to
  `POST /get_response` via `fetch`.
- The Flask route builds a chat completion request to Groq, injecting a
  strict system prompt that keeps the assistant focused on **defensive**
  cybersecurity guidance (phishing, scams, malware, hacked accounts,
  cybercrime reporting, privacy) and explicitly refuses to provide
  illegal-hacking, malware-authoring, or credential-theft instructions.
- The reply is returned as `{"reply": "..."}` and rendered as a new chat
  bubble in the feed.

## Notes

- The send button stays disabled until there's non-whitespace text in the
  input box, and `Enter` (without `Shift`) sends the message — `Shift+Enter`
  inserts a newline.
- Chat history is kept in the DOM only (no database) — refreshing the page
  clears the conversation.
- If `GROQ_API_KEY` is missing or invalid, the backend returns a friendly
  error message instead of crashing.
