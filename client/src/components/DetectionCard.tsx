import { motion } from "framer-motion";
import { Box, Ruler } from "lucide-react";

interface DetectionCardProps {
  objects: string[];
  distances: Record<string, number>;
  scene: string;
}

export function DetectionCard({ objects, distances, scene }: DetectionCardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Scene & Objects Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-secondary/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4 text-primary">
          <Box className="w-6 h-6" />
          <h3 className="text-xl font-bold uppercase tracking-wide">Scene Context</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Detected Scene</p>
          <p className="text-2xl font-bold text-white">{scene || "Unknown Environment"}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-2">Objects Found</p>
          <div className="flex flex-wrap gap-2">
            {objects.length > 0 ? (
              objects.map((obj, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-white/10 text-white rounded-lg text-lg font-medium border border-white/5"
                >
                  {obj}
                </span>
              ))
            ) : (
              <span className="text-muted-foreground italic">No distinct objects detected</span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Distances Card */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-secondary/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-4 text-accent">
          <Ruler className="w-6 h-6" />
          <h3 className="text-xl font-bold uppercase tracking-wide">Proximity Data</h3>
        </div>

        <div className="space-y-4">
          {Object.entries(distances).length > 0 ? (
            Object.entries(distances).map(([obj, dist], i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-black/20 rounded-xl">
                <span className="font-medium text-lg text-white capitalize">{obj}</span>
                <span className="font-bold text-2xl font-mono text-accent">
                  {dist.toFixed(1)}m
                </span>
              </div>
            ))
          ) : (
            <div className="h-32 flex items-center justify-center text-muted-foreground bg-black/20 rounded-xl border border-dashed border-white/10">
              No distance data available
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
