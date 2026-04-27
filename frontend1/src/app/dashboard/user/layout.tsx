export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Top/Side navigation for user could go here */}
      <div className="bg-gray-100 p-4 font-semibold text-gray-700 capitalize">
        user Portal
      </div>
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
    </div>
  );
}
