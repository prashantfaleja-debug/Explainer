# Gemini Explainer App

Simple app: type a topic, click explain, get a 5-year-old style answer using Google's Gemini.

## Setup

1. `cd "c:\Users\PRASHANT\OneDrive\Documents\Masai Notes\Masai School Policy\gemini-explainer-app"`
2. `npm install`
3. Set environment variable `GOOGLE_API_KEY`
   - Windows PowerShell:
     - `$env:GOOGLE_API_KEY = "your_key_here"`
   - Command Prompt:
     - `set GOOGLE_API_KEY=your_key_here`
4. `npm start`

## Use

Open `http://localhost:3000` in browser.
Type a complicated topic.
Click **Explain Simply**.

## Notes

- Uses Google's Gemini 1.5 Flash model.
- Backend call keeps API key safe.
