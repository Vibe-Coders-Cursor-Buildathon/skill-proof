export function buildKnowledgeGapPrompt(params: {
  wrongConcepts: string[];
  courseTitle: string;
}): string {
  const { wrongConcepts, courseTitle } = params;

  return `For the course "${courseTitle}", the learner missed these concepts: ${wrongConcepts.join(", ")}.
Generate a targeted mini-lesson for each missed concept.
Return ONLY valid JSON: { "weakAreas": [{ "concept": "string", "miniLesson": "string" }] }`;
}
