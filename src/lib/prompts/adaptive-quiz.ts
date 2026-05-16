export function buildAdaptiveQuizPrompt(params: {
  score: number;
  wrongConcepts: string[];
}): string {
  const { score, wrongConcepts } = params;
  const difficultyHint =
    score < 60
      ? "Make questions simpler with clearer hints."
      : score > 85
        ? "Make questions harder with edge cases."
        : "Match the original difficulty level.";

  return `The user scored ${score}% and got these concepts wrong: ${wrongConcepts.join(", ")}.
Generate 3 NEW quiz questions targeting ONLY the missed concepts.
${difficultyHint}
Return ONLY valid JSON array of question objects with fields: question, options (4 strings), correct (0-3), explanation.`;
}
