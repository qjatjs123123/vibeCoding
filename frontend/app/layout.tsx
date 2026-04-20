import type { Metadata } from 'next';
import { QueryProvider } from '@/components/provider/QueryProvider';
import { ThemeProvider } from '@/components/provider/ThemeProvider';
import { Header } from '@/components/layout/Header';
import './globals.css';

export const metadata: Metadata = {
  title: 'vibeCoding - A Modern Dev Blog',
  description: 'Share your coding journey with the community',
  openGraph: {
    title: 'vibeCoding',
    description: 'A modern development blog platform',
    url: 'https://vibecoding.dev',
    siteName: 'vibeCoding',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <QueryProvider>
            <Header />
            <main className="flex-1">{children}</main>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
