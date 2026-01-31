import { DataStreamProvider } from "@/components/data-stream-provider";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DataStreamProvider>
      <div className="flex h-dvh">{children}</div>
    </DataStreamProvider>
  );
}
