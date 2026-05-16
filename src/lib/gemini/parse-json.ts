import { jsonrepair } from "jsonrepair";

/**
 * Extract and parse JSON from Gemini model output.
 * Handles markdown code fences, leading/trailing prose, and minor syntax issues.
 */
export function parseJsonFromModel<T>(text: string): T {
  const clean = extractJsonString(text);

  try {
    return JSON.parse(clean) as T;
  } catch (firstErr) {
    try {
      return JSON.parse(jsonrepair(clean)) as T;
    } catch {
      const msg = firstErr instanceof Error ? firstErr.message : String(firstErr);
      console.error("[parse-json] Failed to parse model output:", msg);
      console.error("[parse-json] Snippet (first 800 chars):", clean.slice(0, 800));
      throw firstErr;
    }
  }
}

function extractJsonString(text: string): string {
  let clean = text.trim();

  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    clean = fenceMatch[1].trim();
  }

  const objStart = clean.indexOf("{");
  const objEnd = clean.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    clean = clean.slice(objStart, objEnd + 1);
  }

  return clean;
}
