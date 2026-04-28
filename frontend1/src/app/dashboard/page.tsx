import Link from "next/link";

const roleCards = [
  { title: "Admin", href: "/dashboard/admin", description: "Full dashboard for administration, reports, and operations." },
  { title: "Approver", href: "/dashboard/approver", description: "Approve requests, review rentals and maintenance." },
  { title: "Driver", href: "/dashboard/driver", description: "View driver tasks, trips, and vehicle status." },
  { title: "User", href: "/dashboard/user", description: "Access user-level fleet and rental features." },
];

export default function DashboardHome() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/50">
          <h1 className="text-3xl font-semibold text-slate-900">Dashboard Role Selector</h1>
          <p className="mt-3 text-slate-600">Choose a role to enter the dashboard. All role navigation is handled through the sidebar from the selected role area.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {roleCards.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200"
            >
              <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-900 text-white grid place-items-center text-lg font-bold">{item.title[0]}</div>
              <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
              <p className="mt-3 text-sm text-slate-600">{item.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
