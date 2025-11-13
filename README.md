
# Ctrl_Alt_Delinquents

A Python project for Ctrl_Alt_Delinquents team collaboration and development.

## Project Structure

```
Ctrl_Alt_Delinquents/
├── src/               # Source code directory
│   └── main.py       # Main application entry point
├── tests/            # Test directory
│   └── __init__.py
├── .github/          # GitHub configuration
│   └── copilot-instructions.md
├── .gitignore        # Git ignore file
├── requirements.txt  # Project dependencies
└── README.md         # Project documentation
```

## Setup

1. Create a virtual environment:
   ```powershell
   python -m venv venv
   ```

2. Activate the virtual environment:
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```

3. Install dependencies:
   ```powershell
   pip install -r requirements.txt
   ```

## Usage

Run the main application:
```powershell
python src/main.py
```

## Development

### Daily Joke (Frontend)

The React frontend includes a Daily Joke feature at the route `/daily-joke` (link in the navigation bar). It shows one joke per day, a themed GIF, and caches both in the browser.

Joke generation order:
1. If an OpenAI API key is provided via `REACT_APP_OPENAI_KEY`, a two-sentence AI generated joke is requested.
2. If no key or the request fails, a fallback combinational generator produces a light, clean two-sentence tech/general humor joke.

To enable AI jokes, create a `.env` file in `quizruption-frontend/`:
```
REACT_APP_OPENAI_KEY=sk-YourKeyHere
```
Restart the frontend dev server after adding the environment variable.

The joke plus selected GIF URL are stored in `localStorage` (`dailyJoke_v1`) and will only refresh the next calendar day.

Frontend quick start (if not already documented):
```powershell
cd quizruption-frontend
npm install
npm start
```

Then open: `http://localhost:3000/daily-joke`

### Daily Joke (Backend API)

The backend exposes a daily joke endpoint at `GET /api/jokes/daily` (no GIF returned yet; GIFs are currently client-side curated).

Behavior:
1. On first request each calendar day (server time), it will attempt to generate a two-sentence family-friendly joke using OpenAI Chat Completions (model `gpt-4o-mini`).
2. If no API key (`OPENAI_API_KEY`) is set or the request fails, it falls back to a local combinational generator.
3. The chosen joke is persisted in the `daily_jokes` table and subsequent requests that day return the cached joke with `cached: true`.

Environment variable (set before starting the server):
```powershell
$env:OPENAI_API_KEY="sk-YourKeyHere"
```

Example request (PowerShell):
```powershell
Invoke-RestMethod http://localhost:8000/api/jokes/daily
```

Sample JSON response:
```json
{
   "date": "2025-11-13",
   "joke": "A programmer ships to production on Friday and the logs start flirting back. The backlog quietly grows three new mysterious tickets.",
   "source": "fallback",
   "cached": false
}
```

Running backend (FastAPI):
```powershell
cd quizruption/app
uvicorn app.main:app --reload --port 8000
```

Tests for the endpoint located at `quizruption/app/tests/test_jokes.py`.


## License

MIT
