export type GenerationStepId =
  | "preparing"
  | "extracting"
  | "generating"
  | "saving";

export type GenerationStep = {
  id: GenerationStepId;
  label: string;
  status: "pending" | "active" | "done" | "error";
};
