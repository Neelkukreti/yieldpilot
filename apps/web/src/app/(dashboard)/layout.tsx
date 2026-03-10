import { Sidebar } from "@/components/dashboard/sidebar";
import { ConnectButton } from "@/components/wallet/connect-button";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6">
          <div />
          <ConnectButton />
        </header>
        <main className="flex-1 overflow-y-auto bg-zinc-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
