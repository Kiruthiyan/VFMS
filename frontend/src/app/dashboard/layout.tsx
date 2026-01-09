import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Glass Header */}
                <header className="h-20 shrink-0 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-30 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-8 w-1 bg-amber-400 rounded-full" />
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Dashboard Overview</h2>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-2 rounded-full bg-slate-100 text-slate-400 hover:text-slate-900 cursor-pointer transition-colors">
                            <div className="w-5 h-5" />
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 relative scroll-smooth">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />

                    <div className="max-w-7xl mx-auto relative z-10 space-y-8 pb-20">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
