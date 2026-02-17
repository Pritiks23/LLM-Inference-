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
      <body className="font-sans antialiased">
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
          <nav className="border-b bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <div className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      LLM Evaluation
                    </div>
                    <div className="text-xs text-muted-foreground">Powered by TinyFISH</div>
                  </div>
                </Link>
                <div className="flex gap-6">
                  <Link 
                    href="/" 
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/automations" 
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Automations
                  </Link>
                  <Link 
                    href="/scenarios" 
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Scenarios
                  </Link>
                  <Link 
                    href="/runs" 
                    className="hover:text-primary transition-colors font-medium"
                  >
                    Runs
                  </Link>
                </div>
              </div>
            </div>
          </nav>
          <main className="flex-1 container mx-auto px-4 py-8">
            {children}
          </main>
          <footer className="border-t bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm py-6">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div>
                  <span className="font-semibold">LLM Evaluation Platform</span> - Benchmark your AI models
                </div>
                <div className="flex items-center gap-2">
                  <span>Powered by</span>
                  <span className="font-semibold text-blue-600">TinyFISH API</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
