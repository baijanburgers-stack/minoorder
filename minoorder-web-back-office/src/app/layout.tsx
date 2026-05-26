// layout.tsx
import '../styles/globals.css';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MinoOrder - Enterprise SaaS Restaurant Portal',
  description: 'Production-grade restaurant management and multi-tenant billing backend dashboard owned by PlatePixels.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">

      <body>
        <div className="bg-ambient-gradient" />
        {children}
      </body>
    </html>
  );
}
