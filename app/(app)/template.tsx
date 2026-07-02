// Re-mounts on every navigation → smooth fade/slide page transition (cult.fit-style).
export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
