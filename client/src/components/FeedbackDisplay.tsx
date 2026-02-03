import { motion } from "framer-motion";
import { Volume2, VolumeX } from "lucide-react";

interface FeedbackDisplayProps {
  text: string;
  isSpeaking: boolean;
  onReplay: () => void;
  onStop: () => void;
}

export function FeedbackDisplay({ text, isSpeaking, onReplay, onStop }: FeedbackDisplayProps) {
  if (!text) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 w-2 h-full bg-accent" />
      
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center mb-4">
        <h2 className="text-2xl font-bold text-accent uppercase tracking-wider">
          Auditory Feedback
        </h2>
        
        <button
          onClick={isSpeaking ? onStop : onReplay}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm uppercase tracking-wide
            transition-all duration-200
            ${isSpeaking 
              ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20" 
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5"}
          `}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-5 h-5" />
              Stop Speaking
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              Replay Audio
            </>
          )}
        </button>
      </div>

      <p className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-tight">
        "{text}"
      </p>
    </motion.div>
  );
}
