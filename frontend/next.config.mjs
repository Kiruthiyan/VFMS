/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/dashboard/vehicles/:path*",
        destination: "/dashboards/fleet/vehicles/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/maintenance/:path*",
        destination: "/dashboards/fleet/maintenance/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/rentals/:path*",
        destination: "/dashboards/fleet/rentals/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/vendors/:path*",
        destination: "/dashboards/fleet/vendors/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/admin",
        destination: "/dashboards/admin",
        permanent: false,
      },
      {
        source: "/dashboard/admin/reports/:path*",
        destination: "/dashboards/admin/reports/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/admin/maintenance/:path*",
        destination: "/dashboards/fleet/maintenance/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/admin/rentals/:path*",
        destination: "/dashboards/fleet/rentals/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/admin/trip/:path*",
        destination: "/trips/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/admin/driver-and-staff/:path*",
        destination: "/drivers/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/admin/fuel-management/:path*",
        destination: "/admin/fuel/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/approver",
        destination: "/dashboards/approver",
        permanent: false,
      },
      {
        source: "/dashboard/approver/maintenance/:path*",
        destination: "/dashboards/fleet/maintenance/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/approver/rentals/:path*",
        destination: "/dashboards/fleet/rentals/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/approver/trip/:path*",
        destination: "/trips/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/approver/driver-and-staff/:path*",
        destination: "/drivers/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/user",
        destination: "/dashboards/staff",
        permanent: false,
      },
      {
        source: "/dashboard/user/maintenance/:path*",
        destination: "/dashboards/fleet/maintenance/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/user/rentals/:path*",
        destination: "/dashboards/fleet/rentals/:path*",
        permanent: false,
      },
      {
        source: "/dashboard/user/trip/:path*",
        destination: "/trips/requester",
        permanent: false,
      },
      {
        source: "/dashboard/driver",
        destination: "/dashboards/driver",
        permanent: false,
      },
      {
        source: "/dashboard/driver/maintenance/:path*",
        destination: "/dashboards/driver",
        permanent: false,
      },
      {
        source: "/dashboard/driver/rentals/:path*",
        destination: "/dashboards/driver",
        permanent: false,
      },
      {
        source: "/dashboard/driver/trip/:path*",
        destination: "/dashboards/driver/trips",
        permanent: false,
      },
      {
        source: "/dashboard/driver/driver-and-staff/:path*",
        destination: "/dashboards/driver/profile",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
