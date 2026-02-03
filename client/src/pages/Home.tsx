import { useState } from "react";
import { CameraView } from "@/components/CameraView";
import { FeedbackDisplay } from "@/components/FeedbackDisplay";
import { DetectionCard } from "@/components/DetectionCard";
import { useAnalyzeScan } from "@/hooks/use-scans";
import { useSpeech } from "@/hooks/use-speech";
import { useToast } from "@/hooks/use-toast";
import { Eye, Code2, AlertTriangle } from "lucide-react";

export default function Home() {
  const { mutate: analyze, isPending } = useAnalyzeScan();
  const { speak, cancel, isSpeaking, supported } = useSpeech();
  const { toast } = useToast();

  const [lastResult, setLastResult] = useState<{
    objects: string[];
    distances: Record<string, number>;
    scene: string;
    feedback_text: string;
  } | null>(null);

  const handleCapture = (imageSrc: string) => {
    // Stop any current speech
    cancel();

    analyze(
      { image: imageSrc },
      {
        onSuccess: (data) => {
          setLastResult(data);
          // Auto-speak the result
          if (supported) {
            speak(data.feedback_text);
          } else {
            toast({
              title: "Speech not supported",
              description: "Your browser doesn't support text-to-speech.",
              variant: "destructive",
            });
          }
        },
        onError: (error) => {
          toast({
            title: "Analysis Failed",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="border-b border-white/10 bg-background/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <Eye className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">VisionAssist</h1>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">AI Scene Analysis</p>
            </div>
          </div>
          
          <a 
            href="/source" 
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            <Code2 className="w-4 h-4" />
            <span className="hidden sm:inline">Source Code</span>
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Intro / Instructions - Only show if no result yet */}
        {!lastResult && !isPending && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex gap-4 items-start">
            <AlertTriangle className="w-6 h-6 text-primary shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-primary text-lg">Instructions</h3>
              <p className="text-muted-foreground mt-1 leading-relaxed">
                Point your camera at a scene and press <strong className="text-white">Analyze Scene</strong>. 
                The system will identify objects, estimate their distance, and describe the environment aloud.
              </p>
            </div>
          </div>
        )}

        {/* Camera Section */}
        <section aria-label="Camera Feed">
          <CameraView onCapture={handleCapture} isAnalyzing={isPending} />
        </section>

        {/* Results Section */}
        {lastResult && (
          <section aria-label="Analysis Results" className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <FeedbackDisplay 
              text={lastResult.feedback_text}
              isSpeaking={isSpeaking}
              onReplay={() => speak(lastResult.feedback_text)}
              onStop={cancel}
            />
            
            <DetectionCard 
              objects={lastResult.objects}
              distances={lastResult.distances}
              scene={lastResult.scene}
            />
          </section>
        )}
      </main>
    </div>
  );
}
