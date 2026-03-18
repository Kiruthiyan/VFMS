import { LoginForm } from "@/components/forms/login-form";

export const metadata = {
  title: "Sign In — VFMS",
  description: "Secure sign-in for VFMS users",
};

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-20 top-0 h-72 w-72 rounded-full bg-amber-200/45 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-slate-300/35 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[85vh] w-full max-w-5xl items-center justify-center">
        <section className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-10">
          <header className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-amber-400">
              V
            </div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-600">
              FleetPro Access
            </p>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Sign in to continue to your VFMS workspace.
            </p>
          </header>

          <LoginForm />

          <footer className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-500">
              Need account help? Contact your fleet administrator.
            </p>
          </footer>
        </section>

        <aside className="ml-12 hidden max-w-sm xl:block">
          <h2 className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">
            Secure Sign-In
          </h2>
          <p className="mt-3 text-3xl font-black leading-tight tracking-tight text-slate-900">
            One portal for drivers, approvers, and fleet admins.
          </p>
          <ul className="mt-6 space-y-3 text-sm font-medium text-slate-600">
            <li>Role-based access control for each workspace.</li>
            <li>JWT session flow with refresh token support.</li>
            <li>Consistent audit-friendly authentication pipeline.</li>
          </ul>
        </aside>
      </div>
    </main>
  );
}