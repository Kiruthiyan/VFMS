'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Plus, Award, Loader2, X, Save } from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { getMyCertifications, addMyCertification, type CertificationItem, type CertificationPayload } from '@/lib/api/driver-portal';

const CERT_TYPES = ['DEFENSIVE_DRIVING', 'FIRST_AID', 'HAZMAT', 'PASSENGER_SAFETY', 'VEHICLE_INSPECTION', 'OTHER'];
const EMPTY_FORM: CertificationPayload = { certType: 'DEFENSIVE_DRIVING', certName: '', issuedBy: '', issueDate: '', expiryDate: '' };

export default function DriverCertificationsPage() {
  const [certs, setCerts] = useState<CertificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CertificationPayload>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    getMyCertifications().then(setCerts).catch((e) => toast.error(e?.response?.data?.message ?? 'Failed to load certifications')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try { await addMyCertification(form); toast.success('Certification added'); setShowForm(false); load(); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Failed to save'); }
    finally { setSaving(false); }
  };

  return (
    <DashboardShell title="My Certifications" description="View and manage your training certifications">
      <div style={{ maxWidth: '56rem' }}>
        <div style={{ display:'flex',justifyContent:'flex-end',marginBottom:'1rem' }}>
          <button onClick={() => { setForm(EMPTY_FORM); setShowForm(true); }} style={{ display:'flex',alignItems:'center',gap:'0.375rem',padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'none',background:'hsl(42 100% 50%)',color:'#000',fontWeight:600,fontSize:'0.8125rem',cursor:'pointer' }}>
            <Plus style={{width:'0.875rem',height:'0.875rem'}}/> Add Certification
          </button>
        </div>

        {showForm && (
          <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center' }}>
            <div style={{ background:'#fff',color:'#000',borderRadius:'1rem',border:'1px solid #e5e7eb',padding:'1.5rem',width:'28rem',maxWidth:'90vw' }}>
              <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'1.25rem' }}>
                <h2 style={{ fontSize:'0.9375rem',fontWeight:700,margin:0 }}>Add Certification</h2>
                <button onClick={() => setShowForm(false)} style={{ background:'none',border:'none',cursor:'pointer',color:'hsl(var(--muted-foreground))' }}><X style={{width:'1rem',height:'1rem'}}/></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom:'0.875rem' }}>
                  <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>Type</label>
                  <select value={form.certType} onChange={(e) => setForm((f) => ({...f, certType: e.target.value}))}
                    style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box' }}>
                    {CERT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
                  </select>
                </div>
                {[{ label:'Certification Name', key:'certName', required:true },{ label:'Issued By', key:'issuedBy' },{ label:'Issue Date', key:'issueDate', type:'date' },{ label:'Expiry Date', key:'expiryDate', type:'date' }].map(({ label, key, required, type }) => (
                  <div key={key} style={{ marginBottom:'0.875rem' }}>
                    <label style={{ display:'block',fontSize:'0.75rem',fontWeight:600,color:'hsl(var(--muted-foreground))',marginBottom:'0.25rem',textTransform:'uppercase',letterSpacing:'0.05em' }}>{label}</label>
                    <input type={type ?? 'text'} required={!!required} value={(form as any)[key]} onChange={(e) => setForm((f) => ({...f,[key]:e.target.value}))}
                      style={{ width:'100%',padding:'0.5rem 0.75rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'#fff',color:'#000',fontSize:'0.875rem',boxSizing:'border-box' }}/>
                  </div>
                ))}
                <div style={{ display:'flex',gap:'0.5rem',justifyContent:'flex-end' }}>
                  <button type="button" onClick={() => setShowForm(false)} style={{ padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'1px solid hsl(var(--border))',background:'transparent',color:'hsl(var(--foreground))',cursor:'pointer' }}>Cancel</button>
                  <button type="submit" disabled={saving} style={{ display:'flex',alignItems:'center',gap:'0.375rem',padding:'0.5rem 1rem',borderRadius:'0.5rem',border:'none',background:'hsl(42 100% 50%)',color:'#000',fontWeight:600,cursor:'pointer' }}>
                    {saving ? <Loader2 style={{width:'0.875rem',height:'0.875rem',animation:'spin 1s linear infinite'}}/> : <Save style={{width:'0.875rem',height:'0.875rem'}}/>} Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(16rem,1fr))',gap:'1rem' }}>
          {loading ? (
            <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gridColumn:'1/-1',padding:'4rem',color:'hsl(var(--muted-foreground))' }}>
              <Loader2 style={{width:'1.5rem',height:'1.5rem',animation:'spin 1s linear infinite'}}/>
            </div>
          ) : certs.length === 0 ? (
            <div style={{ textAlign:'center',gridColumn:'1/-1',padding:'4rem',color:'hsl(var(--muted-foreground))',border:'1px solid hsl(var(--border))',borderRadius:'1rem',background:'hsl(var(--card))' }}>
              <Award style={{width:'2rem',height:'2rem',margin:'0 auto 0.75rem',opacity:0.4}}/><p style={{margin:0}}>No certifications yet. Add your first one.</p>
            </div>
          ) : certs.map((c) => (
            <div key={c.id} style={{ borderRadius:'1rem',border:'1px solid hsl(var(--border))',background:'hsl(var(--card))',padding:'1.25rem' }}>
              <div style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginBottom:'0.625rem' }}>
                <span style={{ width:'2rem',height:'2rem',borderRadius:'0.5rem',background:'hsl(42 100% 50% / 0.12)',display:'flex',alignItems:'center',justifyContent:'center' }}>
                  <Award style={{width:'1rem',height:'1rem',color:'hsl(42 100% 45%)'}}/>
                </span>
                <span style={{ fontSize:'0.7rem',padding:'0.15rem 0.5rem',borderRadius:'9999px',background:'hsl(var(--muted))',color:'hsl(var(--muted-foreground))',fontWeight:500 }}>
                  {(c.certType || '').replace(/_/g,' ')}
                </span>
              </div>
              <p style={{ fontSize:'0.875rem',fontWeight:600,margin:'0 0 0.25rem' }}>{c.certName}</p>
              {c.issuedBy && <p style={{ fontSize:'0.75rem',color:'hsl(var(--muted-foreground))',margin:'0 0 0.25rem' }}>by {c.issuedBy}</p>}
              {c.expiryDate && <p style={{ fontSize:'0.75rem',color:'hsl(var(--muted-foreground))',margin:0 }}>Expires: {c.expiryDate}</p>}
            </div>
          ))}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </DashboardShell>
  );
}
