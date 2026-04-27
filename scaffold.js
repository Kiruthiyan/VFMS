const fs = require('fs');
const path = require('path');

const basePath = path.join(__dirname, 'frontend1', 'src', 'app', 'dashboard');

const roles = {
  admin: [
    '',
    'maintenance',
    'rentals',
    'trip',
    'driver-and-staff',
    'fuel-management',
    'reports'
  ],
  approver: [
    '',
    'maintenance',
    'rentals',
    'trip',
    'driver-and-staff'
  ],
  driver: [
    '',
    'maintenance',
    'rentals',
    'trip',
    'driver-and-staff'
  ],
  user: [
    '',
    'maintenance',
    'rentals',
    'trip'
  ]
};

const titleCase = (str) => {
  return str.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

Object.entries(roles).forEach(([role, routes]) => {
  routes.forEach(route => {
    const dirPath = path.join(basePath, role, route);
    fs.mkdirSync(dirPath, { recursive: true });
    
    const isRoot = route === '';
    const pageTitle = isRoot ? `${titleCase(role)} Dashboard` : `${titleCase(route)} - ${titleCase(role)}`;
    
    const content = `export default function ${isRoot ? titleCase(role) + 'Dashboard' : titleCase(route).replace(/\s/g, '') + 'Page'}() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800">${pageTitle}</h1>
      <p className="mt-4 text-gray-600">Welcome to the ${pageTitle} page.</p>
    </div>
  );
}
`;
    fs.writeFileSync(path.join(dirPath, 'page.tsx'), content);
  });
});

// Create basic layouts for non-admin roles
['approver', 'driver', 'user'].forEach(role => {
  const layoutPath = path.join(basePath, role, 'layout.tsx');
  const layoutContent = `export default function ${titleCase(role)}Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Simple Top/Side navigation for ${role} could go here */}
      <div className="bg-gray-100 p-4 font-semibold text-gray-700 capitalize">
        ${role} Portal
      </div>
      <main className="flex-grow bg-gray-50">
        {children}
      </main>
    </div>
  );
}
`;
  fs.writeFileSync(layoutPath, layoutContent);
});

console.log('Scaffolding complete.');
