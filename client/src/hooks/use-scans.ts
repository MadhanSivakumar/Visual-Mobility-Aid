import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Type definitions inferred from the API contract
type AnalyzeResponse = typeof api.scans.analyze.responses[200]._type;
type AnalyzeInput = typeof api.scans.analyze.input._type;

export function useAnalyzeScan() {
  return useMutation({
    mutationFn: async (data: AnalyzeInput) => {
      const res = await fetch(api.scans.analyze.path, {
        method: api.scans.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to analyze image");
      }

      // Validate response with Zod schema from routes
      return api.scans.analyze.responses[200].parse(await res.json());
    },
  });
}

export function useScansList() {
  return useQuery({
    queryKey: [api.scans.list.path],
    queryFn: async () => {
      const res = await fetch(api.scans.list.path);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.scans.list.responses[200].parse(await res.json());
    },
  });
}
