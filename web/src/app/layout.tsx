import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "LLM Evaluation Platform - TinyFISH",
  description: "Benchmark and evaluate Large Language Models with TinyFISH automation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background text-foreground">
        <div className="min-h-screen flex flex-col">
          <nav className="border-b border-border sticky top-0 z-50 bg-background">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <div className="text-xl font-bold text-foreground">
                      LLM Evaluation
                    </div>
                    <div className="text-xs text-muted-foreground">Powered by TinyFISH</div>
                  </div>
                </Link>
                <div className="flex gap-8">
                  <Link 
                    href="/" 
                    className="hover:text-foreground text-muted-foreground transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/automations" 
                    className="hover:text-foreground text-muted-foreground transition-colors font-medium"
                  >
                    Automations
                  </Link>
                  <Link 
                    href="/scenarios" 
                    className="hover:text-foreground text-muted-foreground transition-colors font-medium"
                  >
                    Scenarios
                  </Link>
                  <Link 
                    href="/runs" 
                    className="hover:text-foreground text-muted-foreground transition-colors font-medium"
                  >
                    Runs
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 container mx-auto px-6 py-8">
            {children}
          </main>
          <footer className="border-t border-border py-6 bg-background">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold text-foreground">LLM Evaluation Platform</span> - Benchmark your AI models
                </div>
                <div className="flex items-center gap-2">
                  <span>Powered by</span>
                  <span className="font-semibold text-foreground">TinyFISH API</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
