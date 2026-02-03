
import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.post(api.scans.analyze.path, async (req, res) => {
    try {
      const input = api.scans.analyze.input.parse(req.body);
      
      // Remove header from base64 if present
      const base64Data = input.image.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, 'base64');
      
      const tempId = Date.now();
      const tempFilePath = path.join("/tmp", `scan_${tempId}.jpg`);
      
      await fs.promises.writeFile(tempFilePath, buffer);
      
      console.log("Running analysis script...");
      
      try {
        // Execute the python script
        // Note: In a real production app, you might want to keep the python process running
        // or use a proper model server (TorchServe, etc). For this demo, we run it per request.
        const { stdout, stderr } = await execAsync(`python3 assistive_system.py --image "${tempFilePath}" --no-audio`);
        
        console.log("Python stdout:", stdout);
        if (stderr) console.error("Python stderr:", stderr);
        
        let result;
        try {
          // Parse the JSON output from the python script
          // The script should print JSON to stdout
          const jsonStr = stdout.trim().split('\n').pop() || "{}"; // Get last line
          result = JSON.parse(jsonStr);
        } catch (e) {
          console.error("Failed to parse Python output", e);
          // Fallback if python fails (e.g. dependencies not ready)
          result = {
            objects: ["Simulated Object"],
            distances: { "Simulated Object": 1.5 },
            scene: "Simulated Scene",
            feedback_text: "Analysis failed or loading. This is simulated feedback."
          };
        }
        
        await fs.promises.unlink(tempFilePath); // Cleanup
        
        await storage.createScan({
          imageUrl: "data:image/jpeg;base64," + base64Data, // Truncate for storage if needed, but here we store it
          detectedObjects: result.objects,
          sceneLabel: result.scene,
          distanceData: result.distances
        });
        
        res.json(result);
        
      } catch (execError) {
        console.error("Execution error:", execError);
        res.status(500).json({ message: "Failed to execute analysis script" });
      }

    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });
  
  app.get(api.scans.list.path, async (req, res) => {
    const scans = await storage.getScans();
    res.json(scans);
  });

  return httpServer;
}
