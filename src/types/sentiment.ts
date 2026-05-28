export interface TimelineDataPoint {
  period: string;
  avg_polarity: number;
  avg_leaning: number;
  article_count: number;
}

export interface LeaderboardEntry {
  entity_type: string;
  entity_name: string;
  total_mentions: number;
  avg_sentiment: number;
  article_count: number;
}

export interface ArticleFeedItem {
  id: string;
  title: string;
  url: string;
  author: string | null;
  published_at: string;
  polarity_score: number;
  political_leaning: number;
  confidence: number;
}

export interface TopicDistributionItem {
  topic: string;
  article_count: number;
  percentage: string;
  total_mentions: number;
  avg_sentiment: number;
  avg_polarity: number;
  avg_leaning: number;
}

export interface SentimentStats {
  articles: {
    total: number;
    processed: number;
    pending: number;
    failed: number;
  };
  sentiment: {
    avg_polarity: number;
    avg_leaning: number;
  };
  entities: Record<string, number>;
  date_range: {
    earliest: string | null;
    latest: string | null;
  };
}

export interface TimelineResponse {
  status: string;
  account_state: string;
  data: {
    timeline: TimelineDataPoint[];
    filters: {
      start_date: string;
      end_date: string;
      granularity: string;
      entity_type: string | null;
      entity_name: string | null;
    };
  };
  usage: {
    requests_remaining: number;
    request_limit: number;
  };
}

export interface LeaderboardResponse {
  status: string;
  account_state: string;
  data: {
    leaderboard: LeaderboardEntry[];
    filters: {
      entity_type: string | null;
      sort_by: string;
      order: string;
      limit: number;
    };
  };
  usage: {
    requests_remaining: number;
    request_limit: number;
  };
}

export interface ArticlesResponse {
  status: string;
  account_state: string;
  data: {
    articles: ArticleFeedItem[];
    pagination: {
      page: number;
      limit: number;
      total_count: number;
      total_pages: number;
    };
  };
  usage: {
    requests_remaining: number;
    request_limit: number;
  };
}

export interface TopicsResponse {
  status: string;
  account_state: string;
  data: {
    topics: TopicDistributionItem[];
    summary: {
      total_topics: number;
      total_articles: number;
    };
  };
  usage: {
    requests_remaining: number;
    request_limit: number;
  };
}

export interface StatsResponse {
  status: string;
  account_state: string;
  data: SentimentStats;
  usage: {
    requests_remaining: number;
    request_limit: number;
  };
}
