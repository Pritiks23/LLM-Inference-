import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LLM Benchmarking Agent",
  description: "Real-Time LLM Benchmarking Dashboard for TinyFish",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <nav className="border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="text-xl font-bold">
                  LLM Benchmarking Agent
                </Link>
                <div className="flex gap-6">
                  <Link href="/" className="hover:text-primary">
                    Dashboard
                  </Link>
                  <Link href="/runs" className="hover:text-primary">
                    Runs
                  </Link>
                  <Link href="/scenarios" className="hover:text-primary">
                    Scenarios
                  </Link>
                  <Link href="/automations" className="hover:text-primary">
                    Automations
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t py-4">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              LLM Benchmarking Agent for TinyFish - v1.0.0
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
