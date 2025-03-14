import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import "~/styles/globals.css";
import { NFTDataProvider } from './NftDataContext';

// Import Roboto font
const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Prediction Market Verification',
  description: 'Verify prediction market questions with AI consensus',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={roboto.className}>
      <body className="min-h-screen bg-gray-50 font-roboto">
        <NFTDataProvider>
          {children}
        </NFTDataProvider>
      </body>
    </html>
  );
}
