# dataville-news-sentiment-tracker

A standalone Next.js demo showing how to build a **political news sentiment tracker** — keyword-based NLP sentiment scoring across 13 million real news articles, queryable by entity, topic, outlet, and date range.

Live demo: [app.dataville.com/use-cases/sentiment-tracker](https://app.dataville.com/use-cases/sentiment-tracker) · [All demos](https://app.dataville.com/demos) · [Dataville docs](https://docs.dataville.com) · [Get a free API key](https://app.dataville.com/api-keys)

---

## What it does

Fetches real political news headlines from the [HuggingFace frontpage-news dataset](https://huggingface.co/datasets/AndyReas/frontpage-news) (13.1M articles, 90+ outlets, 2015–2020) and scores each article for:

- **Polarity** — negative (-1) to positive (+1) sentiment
- **Political leaning** — left (-1) to right (+1)
- **Confidence** — how strongly the article's language maps to known indicators

Four interactive panels:

| Panel | What it shows |
|---|---|
| **Sentiment Timeline** | Polarity and leaning over time, switchable by day / week / month / year |
| **Entity Leaderboard** | Top politicians, organizations, and topics ranked by mentions or sentiment |
| **Topic Distribution** | Pie chart of article coverage across major policy areas |
| **Article Feed** | Paginated headlines with per-article polarity and leaning scores |

Clicking any entity in the leaderboard filters the article feed to that entity.

---

## Stack

- [Next.js 14](https://nextjs.org/) (App Router)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — line chart and pie chart
- [HuggingFace Datasets Server API](https://huggingface.co/docs/datasets-server/) — no API key required

---

## Getting started

```bash
git clone https://github.com/datavilleorg/dataville-news-sentiment-tracker.git
cd dataville-news-sentiment-tracker
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

On first load the app fetches up to 500 random rows from the HuggingFace API (up to 5 requests of 100 rows each), filters for political content, and caches results for 5 minutes. Subsequent interactions are instant.

---

## How sentiment scoring works

Scoring is implemented in [`src/lib/huggingfaceNews.ts`](src/lib/huggingfaceNews.ts) using keyword matching — no external NLP model required.

**Polarity** (`-1` to `+1`):

```
score = (positive_hits − negative_hits) / max(total_hits, 3)
```

Positive indicators: `success`, `win`, `progress`, `approve`, `bipartisan`, `breakthrough`, …

Negative indicators: `fail`, `crisis`, `scandal`, `impeach`, `conflict`, `investigation`, …

**Political leaning** (`-1` left to `+1` right):

```
score = (right_hits − left_hits) / max(total_hits, 2)
```

Left indicators: `progressive`, `liberal`, `climate action`, `gun control`, …

Right indicators: `conservative`, `free market`, `deregulation`, `border security`, …

A small random variance (±0.075) is added to both scores to avoid artificially flat distributions.

---

## Customizing tracked entities

Politicians, organizations, and topics are defined as arrays at the top of [`src/lib/huggingfaceNews.ts`](src/lib/huggingfaceNews.ts):

```ts
const POLITICIANS = [
  'Donald Trump', 'Barack Obama', 'Hillary Clinton', 'Joe Biden',
  // add more names here
];

const ORGANIZATIONS = [
  'Congress', 'Senate', 'White House', 'Supreme Court', 'NATO',
  // add more orgs here
];

const TOPICS = [
  'Immigration', 'Healthcare', 'Economy', 'Climate Change',
  // add more topics here
];
```

Entity extraction is case-sensitive for politicians and case-insensitive for organizations and topics — just add the name and it will be matched on the next fetch.

---

## Article payload shape

Each article returned from the HuggingFace API is processed into this shape:

```json
{
  "id": "abc123",
  "title": "Senate passes bipartisan infrastructure bill",
  "description": "The Senate voted 69-30 to approve...",
  "url": "https://web.archive.org/web/*/reuters.com",
  "author": "reuters",
  "outlet": "reuters.com",
  "published_at": "2019-08-01T00:00:00.000Z",
  "polarity_score": 0.21,
  "political_leaning": -0.08,
  "confidence": 0.74,
  "entities": {
    "politicians": ["Joe Biden", "Mitch McConnell"],
    "organizations": ["Senate", "Democratic Party"],
    "topics": ["Infrastructure", "Economy"]
  }
}
```

---

## Data attribution

Articles are fetched from the **[AndyReas/frontpage-news](https://huggingface.co/datasets/AndyReas/frontpage-news)** dataset on HuggingFace — a corpus of 13.1M news headlines from 90+ English-language outlets spanning July 2015 to October 2020. The dataset is used here for demonstration purposes under its original license.

---

## License

MIT — see [LICENSE](LICENSE).

---

Built by [Dataville](https://app.dataville.com).
