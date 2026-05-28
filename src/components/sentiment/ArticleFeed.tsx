'use client';

import { useState } from 'react';
import { FiExternalLink, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { useArticleFeed } from '@/hooks/useSentimentData';

interface ArticleFeedProps {
  entityName?: string;
}

export default function ArticleFeed({ entityName }: ArticleFeedProps) {
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'published_at' | 'polarity' | 'leaning'>('published_at');
  const [polarityFilter, setPolarityFilter] = useState<'all' | 'positive' | 'negative'>('all');

  const { articles, totalCount, totalPages, isLoading, error } = useArticleFeed({
    sortBy,
    polarityFilter,
    entityName,
    page,
    pageSize: 10,
  });

  const handleSortChange = (newSort: typeof sortBy) => {
    setSortBy(newSort);
    setPage(1);
  };

  const handleFilterChange = (newFilter: typeof polarityFilter) => {
    setPolarityFilter(newFilter);
    setPage(1);
  };

  const getSentimentBadge = (score: number, type: 'polarity' | 'leaning') => {
    if (type === 'polarity') {
      if (score > 0.1) return 'bg-green-100 text-green-700';
      if (score < -0.1) return 'bg-red-100 text-red-700';
      return 'bg-gray-100 text-gray-600';
    } else {
      if (score > 0.1) return 'bg-blue-100 text-blue-700';
      if (score < -0.1) return 'bg-purple-100 text-purple-700';
      return 'bg-gray-100 text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-maroon">
            Article Feed
            {entityName && (
              <span className="ml-2 text-sm font-normal text-maroon/50">
                filtered by: {entityName}
              </span>
            )}
          </h2>
          <p className="text-xs text-maroon/50 mt-1">
            Real headlines from major news outlets
          </p>
        </div>
        <span className="text-sm text-maroon/50">
          {totalCount.toLocaleString()} articles
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-maroon/70">Sort:</span>
          {(['published_at', 'polarity', 'leaning'] as const).map((s) => (
            <button
              key={s}
              onClick={() => handleSortChange(s)}
              className={`px-2 py-1 rounded ${
                sortBy === s
                  ? 'bg-maroon text-white'
                  : 'bg-cream text-maroon hover:bg-maroon/10'
              }`}
            >
              {s === 'published_at' ? 'Date' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-sm">
          <span className="text-maroon/70">Filter:</span>
          {(['all', 'positive', 'negative'] as const).map((f) => (
            <button
              key={f}
              onClick={() => handleFilterChange(f)}
              className={`px-2 py-1 rounded ${
                polarityFilter === f
                  ? 'bg-maroon text-white'
                  : 'bg-cream text-maroon hover:bg-maroon/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon mx-auto"></div>
            <p className="mt-2 text-sm text-maroon/70">Loading articles...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-48 flex items-center justify-center text-red-500 text-sm">
          {error}
        </div>
      ) : articles.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-maroon/50 text-sm">
          No articles found
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {articles.map((article) => (
              <div
                key={article.id}
                className="p-4 rounded-lg bg-cream/50 hover:bg-cream transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-maroon hover:underline flex items-start gap-1"
                    >
                      <span className="line-clamp-2">{article.title}</span>
                      <FiExternalLink className="flex-shrink-0 w-3 h-3 mt-1" />
                    </a>
                    <div className="mt-1 flex items-center gap-3 text-xs text-maroon/50">
                      <span>{formatDate(article.published_at)}</span>
                      {article.author && <span>by {article.author}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${getSentimentBadge(
                        article.polarity_score,
                        'polarity'
                      )}`}
                      title="Polarity"
                    >
                      P: {article.polarity_score >= 0 ? '+' : ''}
                      {article.polarity_score.toFixed(2)}
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium ${getSentimentBadge(
                        article.political_leaning,
                        'leaning'
                      )}`}
                      title="Political Leaning"
                    >
                      L: {article.political_leaning >= 0 ? '+' : ''}
                      {article.political_leaning.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-full hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronLeft className="w-5 h-5 text-maroon" />
              </button>
              <span className="text-sm text-maroon">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-full hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <FiChevronRight className="w-5 h-5 text-maroon" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
