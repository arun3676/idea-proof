import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IdeaProof - Startup Idea Analyzer',
  description: 'Analyze your startup idea with AI advisors',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

