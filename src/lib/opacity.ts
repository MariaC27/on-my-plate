export function computeOpacity(task: {
  isRecurring: boolean;
  startDate: string | Date;
  dueDate?: string | Date | null;
  manualProgress: number;
}): number {
  if (task.isRecurring) return 1;

  const now = Date.now();
  const start = new Date(task.startDate).getTime();
  const due = task.dueDate ? new Date(task.dueDate).getTime() : null;

  let timeProgress = 0;
  if (due) {
    const total = due - start;
    const elapsed = now - start;
    timeProgress = total > 0 ? Math.min(elapsed / total, 1) : 1;
  }

  const progress = Math.max(timeProgress, task.manualProgress);
  return Math.max(0.15, 1 - progress);
}
