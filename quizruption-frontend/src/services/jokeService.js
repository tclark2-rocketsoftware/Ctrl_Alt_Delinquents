// Daily joke service with AI (OpenAI) + fallback generator
// Caches a single joke per day using localStorage

const STORAGE_KEY = 'dailyJoke_v4';

// Curated safe, light-hearted GIF URLs (could later be replaced by API calls)
const GIFS = [
  'https://media.giphy.com/media/13HBDT4QSTpveU/giphy.gif', // laughing penguin
  'https://media.giphy.com/media/3o6ZtpxSZbQRRnwCKQ/giphy.gif', // coding cat
  'https://media.giphy.com/media/l0HlTy9x8FZo0XO1i/giphy.gif', // happy robot
  'https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif', // keyboard smashing
  'https://media.giphy.com/media/5xtDarqCp0eomZaFJW8/giphy.gif', // confetti laptop
  'https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif', // light bulb idea
  'https://media.giphy.com/media/1oF1KAEYvnJHO/giphy.gif', // dancing code
  'https://media.giphy.com/media/8Iv5lqKwKsZ2g/giphy.gif', // excited dog
  'https://media.giphy.com/media/3ohhwxK4QJmS8tQ0wg/giphy.gif', // rocket launch
  'https://media.giphy.com/media/3oEduSbSGpGaRX2Vri/giphy.gif'  // spinning gears
];

// Curated, license-friendly illustrative images (replace with CDN or API later)
// Prefer images that are generic conceptual tech/fun illustrations.
const IMAGES = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=60', // circuit board macro
  'https://images.unsplash.com/photo-1581091870627-3b5e00e1f3d8?auto=format&fit=crop&w=600&q=60', // playful robot
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=60', // developer desk
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=600&q=60', // abstract light swirl
  'https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=60', // happy workspace
  'https://images.unsplash.com/photo-1522199710521-72d69614c702?auto=format&fit=crop&w=600&q=60', // keyboard close-up
  'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=600&q=60', // creative desk items
  'https://images.unsplash.com/photo-1515169067865-5387a6c02209?auto=format&fit=crop&w=600&q=60', // colorful abstract code art
  'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=600&q=60', // rocket concept
  'https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=600&q=60'  // cheerful coffee
];

// Fictional author names for daily jokes
const AUTHORS = [
  'JokeBot 3000',
  'Comedy.AI',
  'The Pun Generator',
  'LaughScript',
  'Giggle Protocol',
  'HumorEngine v2',
  'ChuckleCore',
  'Jest Framework',
  'WittyBot Prime',
  'The Joke Compiler'
];

function pickGif(dateStr) {
  // Deterministic selection based on date so users see same GIF for the day
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0;
  return GIFS[hash % GIFS.length];
}

function pickImage(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 17 + dateStr.charCodeAt(i)) >>> 0;
  return IMAGES[hash % IMAGES.length];
}

function pickAuthor(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) hash = (hash * 13 + dateStr.charCodeAt(i)) >>> 0;
  return AUTHORS[hash % AUTHORS.length];
}

function todayKey() {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function readCached() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (data.date === todayKey() && typeof data.joke === 'string') {
      return data;
    }
    return null;
  } catch (_) {
    return null;
  }
}

function writeCached(joke, source, gif_url, image_url, author) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: todayKey(), joke, source, gif_url, image_url, author, savedAt: new Date().toISOString() })
    );
  } catch (_) {
    // ignore
  }
}

async function fetchOpenAIJoke() {
  const apiKey = process.env.REACT_APP_OPENAI_KEY;
  if (!apiKey) return null; // no key; caller will fallback
  const prompt = `Generate a hilarious, relatable two-sentence joke about programming, software development, tech life, or working in IT. Make it punchy and funny - something developers would actually laugh at and share with colleagues. Topics can include: debugging nightmares, production incidents, manager meetings, code reviews, documentation, legacy code, git conflicts, or everyday developer struggles. Keep it clean and professional. Return ONLY the joke.`;
  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a creative, family-friendly joke generator.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 80
      })
    });
    if (!res.ok) return null;
    const data = await res.json();
    const joke = data?.choices?.[0]?.message?.content?.trim();
    if (!joke || joke.split('.').length < 2) return null; // ensure roughly 2 sentences
    return joke;
  } catch (_) {
    return null;
  }
}

function fallbackGeneratedJoke() {
  // Simple combinational generator (not real AI, but varied)
  const subjects = [
    'A programmer',
    'My code',
    'A junior developer',
    'The senior dev',
    'My manager',
    'Stack Overflow',
    'My rubber duck',
    'The QA team',
    'Production',
    'My debug session'
  ];
  const actions = [
    'walked into a bar',
    'finally worked',
    'asked for a raise',
    'said "works on my machine"',
    'merged to main',
    'went down at 5pm Friday',
    'passed all tests',
    'blamed the cache',
    'suggested we "just restart it"',
    'found the bug'
  ];
  const twists = [
    'The bar raised an exception.',
    'Then immediately broke in prod.',
    'They got a pizza party instead.',
    'So we containerized the whole office.',
    'Without running tests first.',
    'Everyone pretended not to notice.',
    'It was DNS. It\'s always DNS.',
    'Turns out it was a missing semicolon.',
    'The bug was a feature all along.',
    'After I spent 3 hours commenting it out.'
  ];
  const secondLines = [
    'My coffee went cold while I processed this.',
    'The standup meeting is still going.',
    'Git blame says it was me 6 months ago.',
    'At least the documentation is... oh wait, there isn\'t any.',
    'The client said they loved it and wants 47 more changes.',
    'I updated my resume just to be safe.',
    'Somewhere, a unit test is crying.',
    'My imposter syndrome is now authenticated.',
    'I told my therapist I code for a living.',
    'Legacy code started playing sad violin music.'
  ];
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  const joke = `${pick(subjects)} ${pick(actions)}. ${pick(twists)} ${pick(secondLines)}`;
  return joke;
}

export async function getDailyJoke(forceRefresh = false) {
  if (!forceRefresh) {
    const cached = readCached();
    if (cached) {
      return { joke: cached.joke, source: cached.source, gif_url: cached.gif_url, image_url: cached.image_url, author: cached.author, cached: true };
    }
  }

  const dateStr = todayKey();
  const backendBase = process.env.REACT_APP_API_BASE || 'http://localhost:8000';
  let jokeData = null;

  // Attempt backend API first
  try {
    const resp = await fetch(`${backendBase}/api/jokes/daily`);
    if (resp.ok) {
      const data = await resp.json();
      if (data && data.joke) {
        jokeData = {
          joke: data.joke,
          source: data.source || 'backend',
          // backend does not provide gif currently
        };
      }
    }
  } catch (_) {
    // ignore; will fallback
  }

  // If backend failed, attempt direct OpenAI (optional), else fallback
  if (!jokeData) {
    const aiJoke = await fetchOpenAIJoke();
    jokeData = {
      joke: aiJoke || fallbackGeneratedJoke(),
      source: aiJoke ? 'openai' : 'fallback'
    };
  }

  const gif_url = pickGif(dateStr);
  const image_url = pickImage(dateStr);
  const author = pickAuthor(dateStr);
  writeCached(jokeData.joke, jokeData.source, gif_url, image_url, author);
  return { joke: jokeData.joke, source: jokeData.source, gif_url, image_url, author, cached: false };
}

export function canRefreshToday() {
  // Return false: disallow manual refresh until next day
  return false;
}

export function nextAvailableDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}
