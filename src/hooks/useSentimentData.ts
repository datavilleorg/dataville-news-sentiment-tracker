'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchHuggingFaceNews,
  generateTimelineFromArticles,
  generateLeaderboardFromArticles,
  generateTopicDistribution,
  generateStatsFromArticles,
  ProcessedArticle,
} from '@/lib/huggingfaceNews';
import { TimelineDataPoint, ArticleFeedItem } from '@/types/sentiment';

interface UseSentimentDataReturn {
  articles: ProcessedArticle[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

// Global state to share data across components
let globalArticles: ProcessedArticle[] = [];
let globalFetchPromise: Promise<ProcessedArticle[]> | null = null;
let globalError: string | null = null;

export function useSentimentData(): UseSentimentDataReturn {
  const [articles, setArticles] = useState<ProcessedArticle[]>(globalArticles);
  const [isLoading, setIsLoading] = useState(globalArticles.length === 0);
  const [error, setError] = useState<string | null>(globalError);

  const fetchData = useCallback(async () => {
    // If we already have articles, don't refetch
    if (globalArticles.length > 0) {
      setArticles(globalArticles);
      setIsLoading(false);
      return;
    }

    // If a fetch is already in progress, wait for it
    if (globalFetchPromise) {
      try {
        const data = await globalFetchPromise;
        setArticles(data);
        setIsLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    globalFetchPromise = fetchHuggingFaceNews(300);

    try {
      const data = await globalFetchPromise;
      globalArticles = data;
      globalError = null;
      setArticles(data);
    } catch (err) {
      const errorMsg = (err as Error).message;
      globalError = errorMsg;
      setError(errorMsg);
    } finally {
      globalFetchPromise = null;
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    globalArticles = [];
    globalFetchPromise = null;
    globalError = null;
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { articles, isLoading, error, refetch };
}

// Hook for timeline data
export function useTimelineData(
  startDate: string,
  endDate: string,
  granularity: 'day' | 'week' | 'month' | 'year' = 'day'
) {
  const { articles, isLoading, error } = useSentimentData();

  const data = useMemo(() => {
    if (articles.length === 0) return [];

    // Filter by date range
    const filtered = articles.filter((a) => {
      const date = a.published_at.split('T')[0];
      return date >= startDate && date <= endDate;
    });

    const timeline = generateTimelineFromArticles(filtered);

    // Aggregate by granularity if needed
    if (granularity === 'day') {
      return timeline;
    }

    const grouped: Record<string, TimelineDataPoint[]> = {};

    timeline.forEach((d) => {
      const date = new Date(d.period);
      let key: string;

      if (granularity === 'week') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(d);
    });

    return Object.entries(grouped).map(([period, items]) => ({
      period,
      avg_polarity: Math.round((items.reduce((sum, i) => sum + i.avg_polarity, 0) / items.length) * 1000) / 1000,
      avg_leaning: Math.round((items.reduce((sum, i) => sum + i.avg_leaning, 0) / items.length) * 1000) / 1000,
      article_count: items.reduce((sum, i) => sum + i.article_count, 0),
    }));
  }, [articles, startDate, endDate, granularity]);

  return { data, isLoading, error };
}

// Hook for leaderboard data
export function useLeaderboardData(
  entityType: 'politician' | 'party' | 'organization' | 'policy_topic',
  sortBy: 'mentions' | 'sentiment' | 'coverage' = 'mentions'
) {
  const { articles, isLoading, error } = useSentimentData();

  const data = useMemo(() => {
    if (articles.length === 0) return [];

    const leaderboard = generateLeaderboardFromArticles(articles, entityType);

    // Sort by selected criteria
    switch (sortBy) {
      case 'mentions':
        return leaderboard.sort((a, b) => b.total_mentions - a.total_mentions);
      case 'sentiment':
        return leaderboard.sort((a, b) => b.avg_sentiment - a.avg_sentiment);
      case 'coverage':
        return leaderboard.sort((a, b) => b.article_count - a.article_count);
      default:
        return leaderboard;
    }
  }, [articles, entityType, sortBy]);

  return { data, isLoading, error };
}

// Hook for article feed data
export function useArticleFeed(
  options: {
    sortBy?: 'published_at' | 'polarity' | 'leaning';
    polarityFilter?: 'all' | 'positive' | 'negative';
    entityName?: string;
    page?: number;
    pageSize?: number;
  } = {}
) {
  const { articles, isLoading, error } = useSentimentData();
  const {
    sortBy = 'published_at',
    polarityFilter = 'all',
    entityName,
    page = 1,
    pageSize = 10,
  } = options;

  const result = useMemo(() => {
    if (articles.length === 0) {
      return { articles: [], totalCount: 0, totalPages: 0 };
    }

    let filtered = [...articles];

    // Apply entity filter
    if (entityName) {
      filtered = filtered.filter((a) =>
        a.entities.politicians.includes(entityName) ||
        a.entities.organizations.includes(entityName) ||
        a.entities.topics.includes(entityName)
      );
    }

    // Apply polarity filter
    if (polarityFilter === 'positive') {
      filtered = filtered.filter((a) => a.polarity_score > 0.1);
    } else if (polarityFilter === 'negative') {
      filtered = filtered.filter((a) => a.polarity_score < -0.1);
    }

    // Sort
    switch (sortBy) {
      case 'published_at':
        filtered.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case 'polarity':
        filtered.sort((a, b) => Math.abs(b.polarity_score) - Math.abs(a.polarity_score));
        break;
      case 'leaning':
        filtered.sort((a, b) => Math.abs(b.political_leaning) - Math.abs(a.political_leaning));
        break;
    }

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const start = (page - 1) * pageSize;
    const paginatedArticles = filtered.slice(start, start + pageSize);

    // Convert to ArticleFeedItem format
    const feedItems: ArticleFeedItem[] = paginatedArticles.map((a) => ({
      id: a.id,
      title: a.title,
      url: a.url,
      author: a.author,
      published_at: a.published_at,
      polarity_score: a.polarity_score,
      political_leaning: a.political_leaning,
      confidence: a.confidence,
    }));

    return { articles: feedItems, totalCount, totalPages };
  }, [articles, sortBy, polarityFilter, entityName, page, pageSize]);

  return { ...result, isLoading, error };
}

// Hook for topic distribution
export function useTopicDistribution() {
  const { articles, isLoading, error } = useSentimentData();

  const data = useMemo(() => {
    if (articles.length === 0) return [];
    return generateTopicDistribution(articles);
  }, [articles]);

  return { data, isLoading, error };
}

// Hook for stats
export function useStats() {
  const { articles, isLoading, error } = useSentimentData();

  const stats = useMemo(() => {
    if (articles.length === 0) return null;
    return generateStatsFromArticles(articles);
  }, [articles]);

  return { stats, isLoading, error };
}
