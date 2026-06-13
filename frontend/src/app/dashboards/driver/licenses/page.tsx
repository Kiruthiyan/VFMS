'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Loader2, CreditCard, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getMyProfile, getMyDocuments, type DriverProfileResponse, type DocumentItem } from '@/lib/api/driver-portal';
import { resolveBackendAssetUrl } from '@/lib/api';

function getDaysUntil(dateStr: string) {
  const d = new Date(`${dateStr}T00:00:00`);
  const today = new Date(); today.setHours(0,0,0,0);
  return Math.floor((d.getTime() - today.getTime()) / 86400000);
}

function LicenseStatusBadge({ expiryDate }: { expiryDate: string }) {
  if (!expiryDate) return null;
  const days = getDaysUntil(expiryDate);
  if (days < 0) return <span style={{ display:'inline-flex',alignItems:'center',gap:'0.25rem',padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:600,background:'hsl(360 79% 95%)',color:'hsl(360 79% 30%)',border:'1px solid hsl(360 79% 75%)' }}><AlertCircle style={{width:'0.7rem',height:'0.7rem'}}/>Expired</span>;
  if (days <= 30) return <span style={{ display:'inline-flex',alignItems:'center',gap:'0.25rem',padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:600,background:'hsl(42 97% 92%)',color:'hsl(28 88% 28%)',border:'1px solid hsl(36 95% 64%)' }}><Clock style={{width:'0.7rem',height:'0.7rem'}}/>Expiring soon</span>;
  return <span style={{ display:'inline-flex',alignItems:'center',gap:'0.25rem',padding:'0.2rem 0.6rem',borderRadius:'9999px',fontSize:'0.7rem',fontWeight:600,background:'hsl(145 63% 94%)',color:'hsl(145 63% 25%)',border:'1px solid hsl(145 63% 70%)' }}><CheckCircle style={{width:'0.7rem',height:'0.7rem'}}/>Valid</span>;
}

export default function DriverLicensesPage() {
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);
  const [licenseDoc, setLicenseDoc] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([getMyProfile(), getMyDocuments()])
      .then(([p, docs]) => {
        setProfile(p);
        const lDoc = docs.find(d => d.entityType === 'LICENSE');
        setLicenseDoc(lDoc || null);
      })
      .catch((e) => toast.error(e?.response?.data?.message ?? 'Failed to load profile'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  return (
    <DashboardShell title="My Licenses" description="View your primary driving license details">
      <div style={{ maxWidth: '56rem' }}>
        <div style={{ borderRadius:'1rem',border:'1px solid hsl(var(--border))',background:'hsl(var(--card))',overflow:'hidden' }}>
          {loading ? (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',padding:'4rem',color:'hsl(var(--muted-foreground))' }}>
              <Loader2 style={{ width:'1.5rem',height:'1.5rem',animation:'spin 1s linear infinite' }}/>
            </div>
          ) : !profile?.licenseNumber ? (
            <div style={{ textAlign:'center',padding:'4rem',color:'hsl(var(--muted-foreground))' }}>
              <CreditCard style={{ width:'2rem',height:'2rem',margin:'0 auto 0.75rem',opacity:0.4 }}/>
              <p style={{ margin:0 }}>No primary license is attached to your driver profile.</p>
              <p style={{ margin:'0.5rem 0 0', fontSize:'0.8rem' }}>Please contact an administrator to update your profile.</p>
            </div>
          ) : (
            <table style={{ width:'100%',borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'hsl(var(--muted)/0.4)' }}>
                  {['License Number','Expiry Date','Status'].map((h) => (
                    <th key={h} style={{ padding:'0.75rem 1rem',textAlign:'left',fontSize:'0.7rem',fontWeight:600,color:'hsl(var(--muted-foreground))',textTransform:'uppercase',letterSpacing:'0.06em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderTop:'1px solid hsl(var(--border))' }}>
                  <td style={{ padding:'0.875rem 1rem',fontSize:'0.875rem',fontWeight:500 }}>{profile.licenseNumber}</td>
                  <td style={{ padding:'0.875rem 1rem',fontSize:'0.875rem',color:'hsl(var(--muted-foreground))' }}>{profile.licenseExpiryDate || 'N/A'}</td>
                  <td style={{ padding:'0.875rem 1rem' }}>
                    {profile.licenseExpiryDate && <LicenseStatusBadge expiryDate={profile.licenseExpiryDate}/>}
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* License Image Display */}
        {!loading && profile?.licenseNumber && licenseDoc && (
          <div style={{ marginTop: '1.5rem', borderRadius:'1rem',border:'1px solid hsl(var(--border))',background:'hsl(var(--card))',overflow:'hidden',padding:'1.5rem' }}>
            <h3 style={{ fontSize:'0.9375rem',fontWeight:700,margin:'0 0 1rem' }}>License Document</h3>
            {licenseDoc.mimeType?.startsWith('image/') ? (
              <img 
                src={resolveBackendAssetUrl(licenseDoc.fileUrl)} 
                alt="License Document" 
                style={{ maxWidth: '100%', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', display: 'block' }}
              />
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem', background: 'hsl(var(--muted)/0.3)', borderRadius: '0.5rem' }}>
                <a href={resolveBackendAssetUrl(licenseDoc.fileUrl)} target="_blank" rel="noreferrer" style={{ color: 'hsl(42 100% 45%)', textDecoration: 'underline', fontWeight: 500, fontSize: '0.875rem' }}>
                  View Document ({licenseDoc.fileName})
                </a>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardShell>
  );
}
