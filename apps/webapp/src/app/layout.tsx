import './globals.css';
import { Metadata } from 'next';
import localFont from 'next/font/local';
import React from 'react';
import { Toaster } from 'react-hot-toast';

const neutrinoFont = localFont({
  src: [
    {
      path: '../../public/font/neutrino-reg.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/font/neutrino-med.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/font/neutrino-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  display: 'swap',
  variable: '--font-neutrino',
});

export const metadata: Metadata = {
  title: 'Neutrino',
  description: 'Your AI QA Engineer.',
};

export default function RootLayout({ children, }: { children: React.ReactNode; }) {
  return (
    <html lang="en" className={neutrinoFont.variable}>
      <body
        className="overflow-x-hidden overscroll-none"
        style={{ fontFamily: 'var(--font-neutrino), sans-serif' }}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
