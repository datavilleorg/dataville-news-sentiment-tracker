'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { useTimelineData } from '@/hooks/useSentimentData';

interface SentimentTimelineProps {
  startDate: string;
  endDate: string;
  entityType?: string;
  entityName?: string;
}

export default function SentimentTimeline({
  startDate,
  endDate,
}: SentimentTimelineProps) {
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month' | 'year'>('week');
  const { data, isLoading, error } = useTimelineData(startDate, endDate, granularity);

  const formatTooltip = (value: number, name: string) => {
    if (name === 'avg_polarity') {
      return [value.toFixed(3), 'Polarity'];
    }
    if (name === 'avg_leaning') {
      return [value.toFixed(3), 'Political Leaning'];
    }
    return [value, name];
  };

  const formatXAxisTick = (value: string) => {
    if (granularity === 'month') {
      const [month] = value.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return monthNames[parseInt(month) - 1] || value;
    }
    if (granularity === 'year') {
      return value;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-maroon">Sentiment Over Time</h2>
          <p className="text-xs text-maroon/50 mt-1">
            Real data from HuggingFace frontpage-news dataset (2015-2020)
          </p>
        </div>
        <div className="flex gap-2">
          {(['day', 'week', 'month', 'year'] as const).map((g) => (
            <button
              key={g}
              onClick={() => setGranularity(g)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                granularity === g
                  ? 'bg-maroon text-white'
                  : 'bg-cream text-maroon hover:bg-maroon/10'
              }`}
            >
              {g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-maroon mx-auto"></div>
            <p className="mt-2 text-sm text-maroon/70">Loading news from HuggingFace...</p>
          </div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-red-500">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-maroon/50">
          No data available for the selected period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5D5C5" />
            <XAxis
              dataKey="period"
              stroke="#5C3D2E"
              fontSize={12}
              tickLine={false}
              tickFormatter={formatXAxisTick}
            />
            <YAxis
              domain={[-1, 1]}
              stroke="#5C3D2E"
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip
              formatter={formatTooltip}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5D5C5',
                borderRadius: '8px',
              }}
              labelFormatter={(label) => {
                if (granularity === 'month') return label;
                const date = new Date(label);
                if (isNaN(date.getTime())) return label;
                return date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                });
              }}
            />
            <Legend />
            <ReferenceLine y={0} stroke="#999" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="avg_polarity"
              stroke="#5C3D2E"
              name="Polarity"
              strokeWidth={2}
              dot={{ fill: '#5C3D2E', r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="avg_leaning"
              stroke="#B4846C"
              name="Political Leaning"
              strokeWidth={2}
              dot={{ fill: '#B4846C', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      <div className="mt-4 flex justify-center gap-8 text-xs text-maroon/70">
        <div className="flex items-center gap-2">
          <span className="font-medium">Polarity:</span>
          <span>-1 (negative) to +1 (positive)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-medium">Leaning:</span>
          <span>-1 (left) to +1 (right)</span>
        </div>
      </div>
    </div>
  );
}
