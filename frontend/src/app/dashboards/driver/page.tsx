/**
 * Driver Dashboard Main Page
 * Role: DRIVER
 * Permissions: View assigned vehicles, fuel expenses, trip details, personal profile
 */
export default function DriverDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center space-y-2 mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
            Driver Dashboard
          </h1>
          <p className="text-slate-400">Manage your vehicles, trips, and fuel expenses</p>
        </div>

        <div className="grid md:grid-cols-1 gap-6">
          <div className="bg-slate-800/50 border border-slate-700/30 rounded-lg p-8 text-center">
            <p className="text-amber-400 font-bold text-lg mb-2">Coming Soon</p>
            <p className="text-slate-500 text-sm">
              Driver dashboard with vehicles, trips, and fuel management features will be available soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
