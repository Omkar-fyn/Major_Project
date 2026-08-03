import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Providers from "./providers";

export const metadata = {
  title: "Asset Tokenization — Tokenize · Invest · Grow",
  description:
    "Invest in tokenized real estate properties with fractional ownership. Real Assets. Real Ownership. Real Future.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}