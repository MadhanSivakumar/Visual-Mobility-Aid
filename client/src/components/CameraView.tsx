import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Camera, ScanEye, RefreshCw } from "lucide-react";

interface CameraViewProps {
  onCapture: (imageSrc: string) => void;
  isAnalyzing: boolean;
}

export function CameraView({ onCapture, isAnalyzing }: CameraViewProps) {
  const webcamRef = useRef<Webcam>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [webcamRef, onCapture]);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "environment", // Use back camera on mobile
  };

  return (
    <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-white/5">
      {isAnalyzing && (
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div className="absolute w-full h-1 bg-primary/80 shadow-[0_0_15px_rgba(6,182,212,0.8)] animate-scan" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>
      )}

      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        onUserMedia={() => setHasPermission(true)}
        onUserMediaError={() => setHasPermission(false)}
        className="w-full h-full object-cover"
      />

      {hasPermission === false && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 text-white p-6 text-center">
          <div>
            <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-xl font-bold">Camera access denied</p>
            <p className="mt-2 text-muted-foreground">Please allow camera access to use the vision assistant.</p>
          </div>
        </div>
      )}

      <div className="absolute bottom-6 left-0 right-0 flex justify-center z-10 px-4">
        <button
          onClick={capture}
          disabled={isAnalyzing || hasPermission === false}
          className="
            group relative flex items-center justify-center
            bg-primary text-primary-foreground font-bold text-lg
            px-8 py-4 rounded-full shadow-lg shadow-primary/25
            hover:scale-105 hover:shadow-primary/40 active:scale-95
            disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
            transition-all duration-200
          "
        >
          {isAnalyzing ? (
            <>
              <RefreshCw className="w-6 h-6 mr-3 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <ScanEye className="w-6 h-6 mr-3" />
              Analyze Scene
            </>
          )}
        </button>
      </div>
    </div>
  );
}
