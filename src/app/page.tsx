'use client';

import { useState } from 'react';
import Image from 'next/image';
import SentimentTimeline from '@/components/sentiment/SentimentTimeline';
import EntityLeaderboard from '@/components/sentiment/EntityLeaderboard';
import ArticleFeed from '@/components/sentiment/ArticleFeed';
import TopicDistribution from '@/components/sentiment/TopicDistribution';
import DateRangeSelector from '@/components/sentiment/DateRangeSelector';
import { useStats } from '@/hooks/useSentimentData';
import { FiExternalLink } from 'react-icons/fi';

const DATE_RANGE = {
  start: '2015-07-18',
  end: '2020-10-17',
};

export default function PublicSentimentPage() {
  const [selectedEntity, setSelectedEntity] = useState<{
    type?: string;
    name?: string;
  }>({});

  const { stats, isLoading: isLoadingStats } = useStats();

  const handleEntitySelect = (type: string, name: string) => {
    if (selectedEntity.name === name) {
      setSelectedEntity({});
    } else {
      setSelectedEntity({ type, name });
    }
  };

  const clearEntityFilter = () => {
    setSelectedEntity({});
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Top nav */}
      <header className="sticky top-0 z-10 bg-white border-b border-[#E5D5C5]">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <a href="https://app.dataville.com" className="flex items-center gap-3">
            <Image src="/Mailbox_Full (2).svg" alt="Dataville icon" width={24} height={24} />
            <Image src="/dataville-logo.svg" alt="Dataville" width={100} height={18} />
          </a>
          <a
            href="https://app.dataville.com"
            className="text-sm font-medium text-maroon hover:underline flex items-center gap-1"
          >
            app.dataville.com <FiExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        {/* Header */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-maroon">Political Sentiment Tracker</h1>
              <p className="mt-1 text-sm text-maroon/70">
                Analyzing sentiment from real news articles
              </p>
              <p className="mt-0.5 text-xs text-maroon/50">
                Data source: frontpage-news dataset (13.1M articles from 90+ outlets, 2015-2020)
              </p>
            </div>

            {isLoadingStats ? (
              <div className="flex gap-6 text-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-8 w-16 bg-maroon/10 rounded mb-1" />
                    <div className="h-3 w-12 bg-maroon/10 rounded" />
                  </div>
                ))}
              </div>
            ) : stats ? (
              <div className="flex gap-6 text-center">
                <div>
                  <p className="text-2xl font-bold text-maroon">
                    {stats.articles.processed.toLocaleString()}
                  </p>
                  <p className="text-xs text-maroon/50">Articles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-maroon">
                    {Object.values(stats.entities).reduce((a, b) => a + b, 0).toLocaleString()}
                  </p>
                  <p className="text-xs text-maroon/50">Entities</p>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${
                    stats.sentiment.avg_polarity > 0
                      ? 'text-green-600'
                      : stats.sentiment.avg_polarity < 0
                      ? 'text-red-600'
                      : 'text-maroon'
                  }`}>
                    {stats.sentiment.avg_polarity >= 0 ? '+' : ''}
                    {stats.sentiment.avg_polarity.toFixed(2)}
                  </p>
                  <p className="text-xs text-maroon/50">Avg Polarity</p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-4 border-t border-maroon/10">
            <DateRangeSelector startDate={DATE_RANGE.start} endDate={DATE_RANGE.end} />
          </div>

          {selectedEntity.name && (
            <div className="mt-4 flex items-center gap-2">
              <span className="text-sm text-maroon/70">Filtering by:</span>
              <span className="px-3 py-1 bg-maroon text-white text-sm rounded-full flex items-center gap-2">
                {selectedEntity.name}
                <button onClick={clearEntityFilter} className="hover:bg-white/20 rounded-full p-0.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </div>

        {/* About */}
        <div className="rounded-2xl border border-[#E5D5C5] bg-white divide-y divide-maroon/10">
          <div className="px-6 py-5">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-maroon/40 mb-1">Featured use case</p>
            <h2 className="text-base font-bold text-maroon">Political Sentiment Tracker</h2>
            <p className="mt-1.5 text-sm text-maroon/70 leading-relaxed">
              This use case is powered by the Dataville API — a single endpoint that gives developers
              clean, structured access to large public datasets without scraping, parsing, or infra overhead.
              Start querying 13 million news articles in minutes.
            </p>
          </div>

          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-maroon/10">
            <div className="px-6 py-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-maroon/40 mb-3">Why use Dataville</h3>
              <ul className="space-y-2.5 text-sm text-maroon/70">
                {[
                  'One API key — no scraping, no pipelines, no infra to maintain',
                  'Structured JSON responses ready to plug into any app, notebook, or model',
                  'Filter by entity, topic, outlet, date range, or sentiment in a single request',
                  'Access millions of records instantly — data that would take weeks to collect yourself',
                ].map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-1.5 h-1 w-1 rounded-full bg-maroon/40 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-5">
              <h3 className="text-[11px] font-semibold uppercase tracking-widest text-maroon/40 mb-3">Data source</h3>
              <div className="text-sm text-maroon/70 space-y-3">
                <p>
                  <span className="font-medium text-maroon">HuggingFace frontpage-news</span> — a corpus
                  of 13.1 million news articles scraped from 90+ English-language outlets.
                </p>
                <ul className="space-y-2">
                  {[
                    ['Coverage', 'July 2015 – October 2020'],
                    ['Outlets', 'BBC, CNN, Reuters, The Guardian, NYT, Washington Post, and 85+ more'],
                    ['Sentiment', 'Keyword-based NLP polarity scoring per article'],
                  ].map(([label, value]) => (
                    <li key={label} className="flex gap-2.5">
                      <span className="mt-1.5 h-1 w-1 rounded-full bg-maroon/40 flex-shrink-0" />
                      <span><span className="font-medium text-maroon">{label}:</span> {value}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href="https://huggingface.co/datasets/AndyReas/frontpage-news"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-maroon hover:underline font-medium"
                >
                  View dataset on HuggingFace
                  <FiExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="lg:col-span-2 rounded-2xl border border-[#E5D5C5] bg-white p-6">
            <SentimentTimeline
              startDate={DATE_RANGE.start}
              endDate={DATE_RANGE.end}
              entityType={selectedEntity.type}
              entityName={selectedEntity.name}
            />
          </div>

          <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
            <EntityLeaderboard
              startDate={DATE_RANGE.start}
              endDate={DATE_RANGE.end}
              onEntitySelect={handleEntitySelect}
            />
          </div>

          <div className="rounded-2xl border border-[#E5D5C5] bg-white p-6">
            <TopicDistribution startDate={DATE_RANGE.start} endDate={DATE_RANGE.end} />
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-[#E5D5C5] bg-white p-6">
            <ArticleFeed entityName={selectedEntity.name} />
          </div>
        </div>
      </main>
    </div>
  );
}
