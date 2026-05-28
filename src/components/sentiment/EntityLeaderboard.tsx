'use client';

import { useState } from 'react';
import { useLeaderboardData } from '@/hooks/useSentimentData';

interface EntityLeaderboardProps {
  startDate: string;
  endDate: string;
  onEntitySelect?: (type: string, name: string) => void;
}

const entityTypeLabels: Record<string, string> = {
  politician: 'Politicians',
  party: 'Parties',
  organization: 'Organizations',
  policy_topic: 'Topics',
};

export default function EntityLeaderboard({
  startDate,
  endDate,
  onEntitySelect,
}: EntityLeaderboardProps) {
  const [entityType, setEntityType] = useState<'politician' | 'party' | 'organization' | 'policy_topic'>('politician');
  const [sortBy, setSortBy] = useState<'mentions' | 'sentiment' | 'coverage'>('mentions');

  const { data, isLoading, error } = useLeaderboardData(entityType, sortBy);

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.1) return 'bg-green-100 text-green-700';
    if (sentiment < -0.1) return 'bg-red-100 text-red-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-maroon">Entity Leaderboard</h2>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(entityTypeLabels).map(([type, label]) => (
          <button
            key={type}
            onClick={() => setEntityType(type as typeof entityType)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              entityType === type
                ? 'bg-maroon text-white'
                : 'bg-cream text-maroon hover:bg-maroon/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 mb-4 text-xs">
        <span className="text-maroon/70">Sort by:</span>
        {(['mentions', 'sentiment', 'coverage'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            className={`px-2 py-0.5 rounded ${
              sortBy === s ? 'bg-maroon/10 text-maroon font-medium' : 'text-maroon/50'
            }`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon"></div>
        </div>
      ) : error ? (
        <div className="h-48 flex items-center justify-center text-red-500 text-sm">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-maroon/50 text-sm">
          No entities found
        </div>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {data.map((entry, index) => (
            <div
              key={`${entry.entity_type}-${entry.entity_name}`}
              className={`flex items-center justify-between p-3 rounded-lg bg-cream/50 hover:bg-cream transition-colors ${
                onEntitySelect ? 'cursor-pointer' : ''
              }`}
              onClick={() => onEntitySelect?.(entry.entity_type, entry.entity_name)}
            >
              <div className="flex items-center gap-3">
                <span className="text-maroon/40 font-mono text-sm w-6">
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-maroon">{entry.entity_name}</p>
                  <p className="text-xs text-maroon/50">
                    {entry.article_count} articles
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-maroon">
                    {entry.total_mentions.toLocaleString()}
                  </p>
                  <p className="text-xs text-maroon/50">mentions</p>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${getSentimentBadge(
                    entry.avg_sentiment
                  )}`}
                >
                  {entry.avg_sentiment >= 0 ? '+' : ''}
                  {entry.avg_sentiment.toFixed(2)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
