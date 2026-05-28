'use client';

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useTopicDistribution } from '@/hooks/useSentimentData';

const COLORS = [
  '#5C3D2E',
  '#B4846C',
  '#E5D5C5',
  '#6B705C',
  '#A5A58D',
  '#CB997E',
  '#DDBEA9',
  '#FFE8D6',
  '#B7B7A4',
  '#D4C7B0',
];

interface TopicDistributionProps {
  startDate: string;
  endDate: string;
}

export default function TopicDistribution({
  startDate,
  endDate,
}: TopicDistributionProps) {
  const { data, isLoading, error } = useTopicDistribution();

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-maroon/10">
          <p className="font-medium text-maroon">{item.topic}</p>
          <p className="text-sm text-maroon/70">
            {item.article_count} articles ({item.percentage}%)
          </p>
          <p className="text-sm text-maroon/70">
            {item.total_mentions.toLocaleString()} mentions
          </p>
          <p className="text-xs mt-1">
            Sentiment:{' '}
            <span
              className={
                item.avg_sentiment > 0.1
                  ? 'text-green-600'
                  : item.avg_sentiment < -0.1
                  ? 'text-red-600'
                  : 'text-gray-600'
              }
            >
              {item.avg_sentiment >= 0 ? '+' : ''}
              {item.avg_sentiment.toFixed(2)}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-maroon mb-4">Topic Distribution</h2>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-maroon"></div>
        </div>
      ) : error ? (
        <div className="h-64 flex items-center justify-center text-red-500 text-sm">
          {error}
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-maroon/50 text-sm">
          No topics found
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={data}
                dataKey="article_count"
                nameKey="topic"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={40}
                paddingAngle={2}
                label={({ topic, percentage }) =>
                  parseFloat(percentage) > 8 ? `${topic}` : ''
                }
                labelLine={false}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-2">
            {data.slice(0, 5).map((topic, index) => (
              <div
                key={topic.topic}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-maroon">{topic.topic}</span>
                </div>
                <span className="text-maroon/70">{topic.percentage}%</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
