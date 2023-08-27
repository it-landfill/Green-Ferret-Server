import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import MyNavbar from './components/navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Admin Panel Green-Ferret',
  description: 'Admin panel for Green-Ferret project',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} flex h-screen max-h-screen w-screen flex-col overflow-hidden bg-blue-100`}
      >
        <MyNavbar />
        <div className="m-5 grow overflow-hidden">{children}</div>
      </body>
    </html>
  );
}
