import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Financial Core',
  description: 'Interface do Financial Core para gestão financeira pessoal',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
