'use client';

import { MapPin } from 'lucide-react';
import { DriverPortalShell } from '@/components/driver-portal/DriverPortalShell';

export default function DriverTripsPage() {
  return (
    <DriverPortalShell title="My Trips" subtitle="View your assigned trip history">
      <div style={{ display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',textAlign:'center',color:'hsl(var(--muted-foreground))' }}>
        <div style={{ width:'4rem',height:'4rem',borderRadius:'1rem',background:'hsl(var(--muted))',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem' }}>
          <MapPin style={{ width:'2rem',height:'2rem',opacity:0.4 }}/>
        </div>
        <h2 style={{ fontSize:'1rem',fontWeight:600,color:'hsl(var(--foreground))',margin:'0 0 0.375rem' }}>Trips Coming Soon</h2>
        <p style={{ fontSize:'0.875rem',maxWidth:'22rem',margin:0,lineHeight:1.6 }}>
          Your assigned trips will appear here once the fleet trip module is connected to the driver portal.
        </p>
      </div>
    </DriverPortalShell>
  );
}
