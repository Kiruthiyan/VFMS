import AdminNavbar from "@/components/AdminNavbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 w-full">
      {/* Admin Sub-Navbar */}
      <AdminNavbar />

      {/* Main Content */}
      <main className="flex-grow p-6">
        <div className="mx-auto max-w-7xl bg-white rounded-lg shadow-sm min-h-[70vh]">
          {children}
        </div>
      </main>
    </div>
  );
}
