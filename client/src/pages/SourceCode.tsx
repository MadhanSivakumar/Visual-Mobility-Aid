import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { Link } from "wouter";

export default function SourceCode() {
  const [code, setCode] = useState<string>("Loading source code...");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Fetching the python code that was provided in the prompt context
    fetch("/attached_assets/Pasted-Abstract-Visual-impairment-severely-influences-mobility_1770137562037.txt")
      .then(res => res.text())
      .then(text => setCode(text))
      .catch(() => setCode("Failed to load source code."));
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-white/10 bg-background/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors group">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </div>
            <span className="font-medium">Back to Vision</span>
          </Link>
          <h1 className="text-lg font-bold">Backend Logic</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-[#1e1e1e] rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="bg-[#2d2d2d] px-4 py-3 border-b border-white/5 flex justify-between items-center">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-xs font-mono text-muted-foreground">main.py</div>
            <button 
              onClick={handleCopy}
              className="text-xs font-medium flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy Code"}
            </button>
          </div>
          <div className="p-0 overflow-x-auto">
            <pre className="text-sm font-mono leading-relaxed p-6 text-gray-300">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </main>
    </div>
  );
}
