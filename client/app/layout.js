import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'Asset-Tokenization — Tokenized Real Estate Investment',
  description: 'Invest in tokenized real estate properties. Buy fractional tokens of premium properties across India. Blockchain-powered real estate investment platform.',
  keywords: 'asset tokenization, real estate tokenization, fractional ownership, property investment, blockchain, tokenized real estate, Asset-Chain',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
