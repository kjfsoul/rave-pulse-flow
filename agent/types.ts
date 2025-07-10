export interface ProjectTask {
  id: string;
  project: "MysticArcana" | "EDMShuffle" | "BirthdayGen";
  description: string;
  promptTemplate: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  retries: number;
  lastResult?: string;
  createdAt: string;
  updatedAt: string;
}
