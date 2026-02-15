export interface WorkerAnalyticsResponse {
  workerMembershipId: string;
  workerUserId: string;
  email: string;

  tasksCompleted: number;
  totalMinutesWorked: number;
  avgTaskDurationMinutes: number;
  activeTasks: number;
}
