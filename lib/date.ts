// Pure date helpers — safe to import from client OR server components.
export function todayStr(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function daysAgoStr(days: number): string {
  return todayStr(new Date(Date.now() - days * 86400000));
}
