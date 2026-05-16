/**
 * Extract and parse JSON from Gemini model output.
 * Handles markdown code fences and any leading/trailing prose.
 */

export function parseJsonFromModel<T>(text: string): T {
  // Strip markdown code fences if present
  let clean = text.trim();

  const fenceMatch = clean.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch) {
    clean = fenceMatch[1].trim();
  }

  // Find outermost JSON object
  const objStart = clean.indexOf("{");
  const objEnd = clean.lastIndexOf("}");
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    clean = clean.slice(objStart, objEnd + 1);
  }

  return JSON.parse(clean) as T;
}
