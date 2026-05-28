import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Dataville — Political Sentiment Tracker',
  description: 'Sentiment analysis across 13M news articles from 90+ outlets (2015–2020), powered by the HuggingFace frontpage-news dataset.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
