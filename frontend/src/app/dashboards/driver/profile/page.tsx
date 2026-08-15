'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  User, MapPin, Phone, Shield, Calendar, CreditCard,
  Badge, Camera, Loader2, Star, Trash2, Pencil, Check, X,
  Upload, AlertTriangle, Plus, Award, Save, UserRound, Mail
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  getMyProfile, uploadProfilePicture, removeProfilePicture,
  type DriverProfileResponse,
  uploadMyDocument,
  getMyCertifications, addMyCertification,
  type CertificationItem, type CertificationPayload,
  getMyInfractions, type InfractionItem,
} from '@/lib/api/driver-portal';
import { resolveBackendAssetUrl } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
const CERTIFICATION_TYPES = ['DEFENSIVE_DRIVING', 'FIRST_AID', 'HAZMAT', 'HEAVY_VEHICLE', 'PASSENGER_TRANSPORT', 'OTHER'];
const EMPTY_CERTIFICATION: CertificationPayload = {
  certType: 'DEFENSIVE_DRIVING',
  certName: '',
  issuedBy: '',
  issueDate: '',
  expiryDate: '',
};

function getApiErrorMessage(error: unknown, fallback: string) {
  if (typeof error !== 'object' || error === null || !('response' in error)) return fallback;
  const response = (error as { response?: { data?: { message?: unknown } } }).response;
  return typeof response?.data?.message === 'string' ? response.data.message : fallback;
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
      <span style={{
        width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
        background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem',
      }}>
        <Icon style={{ width: '0.875rem', height: '0.875rem', color: 'hsl(var(--muted-foreground))' }} />
      </span>
      <div>
        <p style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))', margin: '0.125rem 0 0', fontWeight: 500 }}>{value || '—'}</p>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    ACTIVE: { bg: 'hsl(145 63% 94%)', text: 'hsl(145 63% 25%)', border: 'hsl(145 63% 70%)' },
    INACTIVE: { bg: 'hsl(0 0% 94%)', text: 'hsl(0 0% 35%)', border: 'hsl(0 0% 75%)' },
    SUSPENDED: { bg: 'hsl(360 79% 95%)', text: 'hsl(360 79% 30%)', border: 'hsl(360 79% 75%)' },
  };
  const c = colors[status] ?? colors.INACTIVE;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, border: `1px solid ${c.border}`, background: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function getSafeRatingPercentage(ratingPercentage?: number | null) {
  if (typeof ratingPercentage !== 'number' || Number.isNaN(ratingPercentage)) return null;
  return Math.min(100, Math.max(0, ratingPercentage));
}

function DriverRating({ ratingPercentage }: { ratingPercentage?: number | null }) {
  const safeRating = getSafeRatingPercentage(ratingPercentage);

  return (
    <ProfileSection title="Driver Rating" description="Synced from staff trip scheduling feedback">
      {safeRating === null ? (
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.95rem', border: '1px dashed hsl(var(--border))', borderRadius: '0.875rem', background: 'hsl(210 40% 98%)', minWidth: 0 }}>
          <span style={{ width: '1.9rem', height: '1.9rem', borderRadius: '0.5rem', background: '#fff', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Star style={{ width: '0.95rem', height: '0.95rem', color: 'hsl(42 100% 45%)' }} />
          </span>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: '0.68rem', color: 'hsl(var(--muted-foreground))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Current Rating</p>
            <p style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground))', margin: '0.2rem 0 0', fontWeight: 700 }}>Not rated</p>
            <p style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', margin: '0.35rem 0 0', lineHeight: 1.45 }}>A rating appears after staff feedback is recorded.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '0.95rem', border: '1px solid hsl(var(--border))', borderRadius: '0.875rem', background: 'hsl(210 40% 98%)', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem' }} title={`${safeRating}% driver rating`}>
              <div style={{ position: 'relative', height: '1.25rem', width: '7.1rem' }} aria-label={`${safeRating}% driver rating`}>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: '0.15rem', color: 'hsl(var(--muted-foreground) / 0.35)' }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`empty-${index}`} style={{ width: '1.25rem', height: '1.25rem' }} />
                  ))}
                </div>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', gap: '0.15rem', overflow: 'hidden', color: 'hsl(42 100% 50%)', width: `${safeRating}%` }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`filled-${index}`} style={{ width: '1.25rem', height: '1.25rem', flexShrink: 0, fill: 'currentColor' }} />
                  ))}
                </div>
              </div>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: 'hsl(var(--foreground))' }}>{safeRating}%</span>
            </div>
            <span style={{ borderRadius: '9999px', border: '1px solid hsl(var(--border))', background: '#fff', color: 'hsl(var(--muted-foreground))', padding: '0.3rem 0.65rem', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Performance
            </span>
          </div>
        </div>
      )}
    </ProfileSection>
  );
}

function ProfileSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="vfms-section-card">
      <header className="vfms-section-header">
        <h3 className="vfms-section-title">{title}</h3>
        {description ? (
          <p className="vfms-section-description">{description}</p>
        ) : null}
      </header>
      <div style={{ padding: '1.25rem' }}>{children}</div>
    </section>
  );
}

function ProfileInfoTile({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.95rem', border: '1px solid hsl(var(--border))', borderRadius: '0.875rem', background: 'hsl(210 40% 98%)', minWidth: 0 }}>
      <span style={{ width: '1.9rem', height: '1.9rem', borderRadius: '0.5rem', background: '#fff', border: '1px solid hsl(var(--border))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon style={{ width: '0.9rem', height: '0.9rem', color: 'hsl(var(--muted-foreground))' }} />
      </span>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: '0.68rem', color: 'hsl(var(--muted-foreground))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>{label}</p>
        <p style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground))', margin: '0.2rem 0 0', fontWeight: 700, overflowWrap: 'anywhere' }}>{value || '--'}</p>
      </div>
    </div>
  );
}

function InfractionWarningsSection() {
  const [infractions, setInfractions] = useState<InfractionItem[]>([]);
  const [loadingInfractions, setLoadingInfractions] = useState(true);

  useEffect(() => {
    getMyInfractions()
      .then((items) => setInfractions(items.filter((item) => item.resolutionStatus !== 'RESOLVED')))
      .catch((error) => toast.error(getApiErrorMessage(error, 'Failed to load infraction notices')))
      .finally(() => setLoadingInfractions(false));
  }, []);

  if (loadingInfractions) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem', color: 'hsl(var(--muted-foreground))' }}>
        <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (infractions.length === 0) return null;

  return (
    <div role="alert" style={{ borderRadius: '1rem', border: '1px solid hsl(38 92% 70%)', background: '#fff', padding: '1rem 1.25rem', boxShadow: '0 12px 32px hsl(220 30% 10% / 0.06)' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
        <span style={{ width: '2rem', height: '2rem', borderRadius: '0.6rem', background: 'hsl(38 92% 94%)', border: '1px solid hsl(38 92% 76%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <AlertTriangle style={{ width: '1rem', height: '1rem', color: 'hsl(38 92% 34%)' }} />
        </span>
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: 'hsl(222 47% 11%)', margin: 0 }}>Infraction Notice</h3>
          <p style={{ fontSize: '0.78rem', color: 'hsl(var(--muted-foreground))', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            An infraction has been recorded on your driver profile. Please contact the office for further information and guidance.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {infractions.map((infraction) => (
          <div key={infraction.id} style={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border))', background: 'hsl(210 40% 98%)', padding: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.82rem', color: 'hsl(var(--foreground))', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {(infraction.infractionType ?? 'Unknown infraction').replace(/_/g, ' ')}
              </strong>
              <span style={{ borderRadius: '9999px', padding: '0.18rem 0.55rem', background: 'hsl(19 97% 92%)', color: 'hsl(19 85% 30%)', fontSize: '0.68rem', fontWeight: 700 }}>
                {infraction.severity ?? 'UNKNOWN'} · {infraction.resolutionStatus ?? 'OPEN'}
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.45rem 0 0' }}>
              Incident date: {infraction.incidentDate ?? 'Not specified'}
            </p>
            {infraction.description && <p style={{ fontSize: '0.78rem', color: 'hsl(var(--foreground))', margin: '0.4rem 0 0', lineHeight: 1.5 }}>{infraction.description}</p>}
            {infraction.penaltyNotes && <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.35rem 0 0' }}>Office note: {infraction.penaltyNotes}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificationsSection() {
  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [loadingCertifications, setLoadingCertifications] = useState(true);
  const [showCertificationForm, setShowCertificationForm] = useState(false);
  const [certificationForm, setCertificationForm] = useState<CertificationPayload>({ ...EMPTY_CERTIFICATION });
  const [savingCertification, setSavingCertification] = useState(false);

  useEffect(() => {
    getMyCertifications()
      .then(setCertifications)
      .catch((error) => toast.error(getApiErrorMessage(error, 'Failed to load certifications')))
      .finally(() => setLoadingCertifications(false));
  }, []);

  const openCertificationForm = () => {
    setCertificationForm({ ...EMPTY_CERTIFICATION });
    setShowCertificationForm(true);
  };

  const handleCertificationSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingCertification(true);
    try {
      const added = await addMyCertification(certificationForm);
      setCertifications((current) => [...current, added]);
      setShowCertificationForm(false);
      toast.success('Certification added');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to save certification'));
    } finally {
      setSavingCertification(false);
    }
  };

  return (
    <div className="vfms-section-card">
      <div className="vfms-section-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <h3 className="vfms-section-title">Certifications</h3>
          <p className="vfms-section-description">View and submit your training certifications</p>
        </div>
        <button
          type="button"
          onClick={openCertificationForm}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.55rem 0.9rem', borderRadius: '0.5rem', border: '1px solid hsl(42 100% 50% / 0.35)', background: 'hsl(42 100% 50%)', color: 'hsl(222 47% 11%)', fontWeight: 800, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <Plus style={{ width: '0.875rem', height: '0.875rem' }} /> Add Certification
        </button>
      </div>

      <div style={{ padding: '1.25rem' }}>
        {loadingCertifications ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
            <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : certifications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))', border: '1px dashed hsl(var(--border))', borderRadius: '0.75rem', background: 'hsl(210 40% 98%)' }}>
            <Award style={{ width: '1.75rem', height: '1.75rem', margin: '0 auto 0.5rem', color: 'hsl(42 100% 45%)' }} />
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>No certifications yet. Add your first one.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '0.9rem' }}>
            {certifications.map((certification) => (
              <div key={certification.id} style={{ borderRadius: '0.875rem', border: '1px solid hsl(var(--border))', background: 'hsl(210 40% 98%)', padding: '1rem', boxShadow: '0 6px 18px hsl(220 30% 10% / 0.04)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <span style={{ width: '2.25rem', height: '2.25rem', borderRadius: '0.65rem', background: 'hsl(222 47% 11%)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Award style={{ width: '1rem', height: '1rem', color: 'hsl(42 100% 50%)' }} />
                  </span>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ display: 'inline-flex', fontSize: '0.68rem', padding: '0.18rem 0.5rem', borderRadius: '9999px', background: '#fff', color: 'hsl(var(--muted-foreground))', border: '1px solid hsl(var(--border))', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {(certification.certType ?? 'OTHER').replace(/_/g, ' ')}
                    </span>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: '0.55rem 0 0.25rem' }}>{certification.certName || 'Unnamed certification'}</p>
                    {certification.issuedBy && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', margin: '0 0 0.25rem' }}>Issued by {certification.issuedBy}</p>}
                    {certification.expiryDate && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>Expires {certification.expiryDate}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCertificationForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="add-certification-title" className="relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl">
            {/* Dark gradient header — matches vfms-form-header / fuel form style */}
            <div className="vfms-form-header flex items-center justify-between px-8 py-5">
              <div className="flex items-center gap-3 relative z-10">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                  <Award className="h-5 w-5" />
                </div>
                <h2 id="add-certification-title" className="text-lg font-bold text-white">Add Certification</h2>
              </div>
              <button type="button" aria-label="Close certification form" onClick={() => setShowCertificationForm(false)} className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-white/10 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCertificationSubmit}>
              <div className="grid gap-5 px-6 py-6">
                <div className="space-y-2">
                  <label htmlFor="certification-type" className="block text-sm font-semibold text-slate-900">Type <span className="text-red-600">*</span></label>
                  <select id="certification-type" value={certificationForm.certType} onChange={(event) => setCertificationForm((current) => ({ ...current, certType: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 shadow-sm hover:border-slate-300 appearance-none">
                    {CERTIFICATION_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="certification-name" className="block text-sm font-semibold text-slate-900">Certification Name <span className="text-red-600">*</span></label>
                  <input id="certification-name" required value={certificationForm.certName} onChange={(event) => setCertificationForm((current) => ({ ...current, certName: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 shadow-sm hover:border-slate-300" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="certification-issuer" className="block text-sm font-semibold text-slate-900">Issued By</label>
                  <input id="certification-issuer" value={certificationForm.issuedBy} onChange={(event) => setCertificationForm((current) => ({ ...current, issuedBy: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 shadow-sm hover:border-slate-300" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="certification-issue-date" className="block text-sm font-semibold text-slate-900">Issue Date</label>
                    <input id="certification-issue-date" type="date" value={certificationForm.issueDate} onChange={(event) => setCertificationForm((current) => ({ ...current, issueDate: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 shadow-sm hover:border-slate-300" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="certification-expiry-date" className="block text-sm font-semibold text-slate-900">Expiry Date</label>
                    <input id="certification-expiry-date" type="date" value={certificationForm.expiryDate} onChange={(event) => setCertificationForm((current) => ({ ...current, expiryDate: event.target.value }))} className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 transition-all duration-200 shadow-sm hover:border-slate-300" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 border-t border-slate-100 px-6 pb-6 pt-2">
                <button type="button" onClick={() => setShowCertificationForm(false)} className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-900 transition-all hover:bg-slate-50">
                  Cancel
                </button>
                <Button type="submit" disabled={savingCertification} className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl">
                  {savingCertification ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {savingCertification ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DriverProfilePage() {
  const [profile, setProfile] = useState<DriverProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [showProfilePicturePreview, setShowProfilePicturePreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Document upload (moved from Documents page)
  const [selectedDocType, setSelectedDocType] = useState<'LICENSE' | 'OTHER'>('LICENSE');
  const [otherDocumentName, setOtherDocumentName] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Inline edit states
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [savingName, setSavingName] = useState(false);

  const [editingPhone, setEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((data) => { setProfile(data); })
      .catch((error) => toast.error(getApiErrorMessage(error, 'Failed to load profile')))
      .finally(() => setLoading(false));
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      await uploadProfilePicture(file);
      // Re-fetch profile to get updated photo URL
      const updated = await getMyProfile();
      setProfile(updated);
      toast.success('Profile picture updated');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to upload photo'));
    } finally {
      setUploadingPic(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePhotoRemove = async () => {
    if (!profile?.photoUrl) return;
    setUploadingPic(true);
    try {
      await removeProfilePicture();
      const updated = await getMyProfile();
      setProfile(updated);
      toast.success('Profile picture removed');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Failed to remove photo'));
    } finally {
      setUploadingPic(false);
    }
  };

  const avatarSrc = profile?.photoUrl ? resolveBackendAssetUrl(profile.photoUrl) : null;

  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const documentName = selectedDocType === 'OTHER' ? otherDocumentName.trim() : undefined;
    if (selectedDocType === 'OTHER' && !documentName) {
      toast.error('Please enter a document name for Other documents');
      if (docInputRef.current) docInputRef.current.value = '';
      return;
    }
    setUploadingDoc(true);
    try {
      await uploadMyDocument(file, selectedDocType, undefined, documentName);
      if (selectedDocType === 'OTHER') setOtherDocumentName('');
      toast.success('Document uploaded');
    } catch (error: unknown) {
      toast.error(getApiErrorMessage(error, 'Upload failed'));
    } finally {
      setUploadingDoc(false);
      if (docInputRef.current) docInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="My Profile" 
        description="View your personal information" 
        icon={UserRound} 
      />
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'hsl(var(--muted-foreground))' }}>
          <Loader2 style={{ width: '1.5rem', height: '1.5rem', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
          <p>No driver profile linked to your account. Contact an administrator.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '86rem', margin: '0 auto', width: '100%' }}>
          <InfractionWarningsSection />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">

          {/* Left: Avatar + identity card */}
          <div style={{ display: 'contents' }}>
            {/* Avatar card */}
            <div className="md:col-span-2 xl:col-span-3" style={{
              borderRadius: '1rem', border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))', overflow: 'hidden',
              boxShadow: '0 16px 44px hsl(220 30% 10% / 0.08)',
            }}>
              <div style={{ height: '4.25rem', background: 'hsl(222 47% 11%)' }} />
              <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', textAlign: 'left', display: 'flex', alignItems: 'flex-end', gap: '1.25rem', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '-2.5rem' }}>
                  {avatarSrc ? (
                    <button
                      type="button"
                      onClick={() => setShowProfilePicturePreview(true)}
                      aria-label="View uploaded profile picture"
                      style={{
                        width: '5rem',
                        height: '5rem',
                        borderRadius: '50%',
                        border: '3px solid hsl(var(--background))',
                        padding: 0,
                        overflow: 'hidden',
                        display: 'block',
                        background: 'transparent',
                        cursor: 'zoom-in',
                      }}
                    >
                      <img
                        src={avatarSrc}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ) : (
                    <div style={{
                      width: '5rem', height: '5rem', borderRadius: '50%',
                      background: 'hsl(222 47% 11%)',
                      border: '3px solid hsl(var(--background))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <User style={{ width: '2rem', height: '2rem', color: '#fff' }} />
                    </div>
                  )}
                  {avatarSrc && (
                    <button
                      onClick={handlePhotoRemove}
                      disabled={uploadingPic}
                      aria-label="Remove profile picture"
                      style={{
                        position: 'absolute', top: '0.2rem', right: '-0.25rem',
                        width: '1.65rem', height: '1.65rem', borderRadius: '50%',
                        background: '#fff', border: '1px solid hsl(var(--border))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px hsl(0 0% 0% / 0.12)'
                      }}
                    >
                      <Trash2 style={{ width: '0.78rem', height: '0.78rem', color: 'hsl(0 84% 45%)' }} />
                    </button>
                  )}
                  {/* Upload overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPic}
                    aria-label="Change profile picture"
                    style={{
                      position: 'absolute', bottom: '0.2rem', right: '-0.25rem',
                      width: '1.65rem', height: '1.65rem', borderRadius: '50%',
                      background: '#fff', border: '1px solid hsl(var(--border))',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px hsl(0 0% 0% / 0.12)'
                    }}
                  >
                    {uploadingPic
                      ? <Loader2 style={{ width: '0.75rem', height: '0.75rem', color: 'hsl(var(--foreground))', animation: 'spin 1s linear infinite' }} />
                      : <Camera style={{ width: '0.75rem', height: '0.75rem', color: 'hsl(var(--foreground))' }} />
                    }
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
                </div>

                <div style={{ flex: '1 1 18rem', minWidth: 0, paddingTop: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'hsl(var(--foreground))', margin: 0, lineHeight: 1.2 }}>
                  <span>
                    {editingName ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          placeholder="Full name"
                          style={{
                            fontSize: '0.95rem', padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem', border: '1px solid hsl(var(--border))',
                            background: 'hsl(var(--background))', color: 'hsl(var(--foreground))',
                            minWidth: '12rem'
                          }}
                        />
                        <button
                          aria-label="Save name"
                          disabled={savingName || !nameInput.trim()}
                          onClick={async () => {
                            if (!profile) return;
                            const newName = nameInput.trim();
                            if (!newName) return;
                            setSavingName(true);
                            try {
                              await import('@/lib/api/driver-portal').then(m => m.updateMyProfile({ fullName: newName }));
                              const updated = await import('@/lib/api/driver-portal').then(m => m.getMyProfile());
                              setProfile(updated);
                              setEditingName(false);
                              toast.success('Name updated');
                            } catch (error: unknown) {
                              toast.error(getApiErrorMessage(error, 'Failed to update name'));
                            } finally {
                              setSavingName(false);
                            }
                          }}
                          style={{
                            width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
                            border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Check style={{ width: '0.9rem', height: '0.9rem' }} />
                        </button>
                        <button
                          aria-label="Cancel"
                          disabled={savingName}
                          onClick={() => setEditingName(false)}
                          style={{
                            width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
                            border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <X style={{ width: '0.9rem', height: '0.9rem' }} />
                        </button>
                      </span>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{profile.firstName} {profile.lastName}</span>
                        <button
                          aria-label="Edit name"
                          onClick={() => {
                            const current = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
                            setNameInput(current);
                            setEditingName(true);
                          }}
                          style={{
                            width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem',
                            border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                          }}
                        >
                          <Pencil style={{ width: '0.8rem', height: '0.8rem' }} />
                        </button>
                      </span>
                    )}
                  </span>
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.25rem 0 0.75rem' }}>
                  Driver
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <StatusPill status={profile.status} />
                </div>
                </div>
              </div>
            </div>

            <DriverRating ratingPercentage={profile.ratingPercentage} />

            <ProfileSection title="Identity">
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <ProfileInfoTile icon={Badge} label="Driver ID" value={profile.employeeId} />
                <ProfileInfoTile icon={CreditCard} label="NIC / Passport" value={profile.nic} />
              </div>
            </ProfileSection>

            <ProfileSection title="License">
              <div style={{ display: 'grid', gap: '0.75rem' }}>
                <ProfileInfoTile icon={Shield} label="License Number" value={profile.licenseNumber} />
                <ProfileInfoTile icon={Calendar} label="Expiry Date" value={profile.licenseExpiryDate} />
              </div>
            </ProfileSection>

            {/* Upload Document (migrated from Documents page) */}
            <ProfileSection title="Upload Document" description="Submit license and supporting files">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                <select
                  value={selectedDocType}
                  onChange={(e) => {
                    const nextType = e.target.value as 'LICENSE' | 'OTHER';
                    setSelectedDocType(nextType);
                    if (nextType === 'LICENSE') setOtherDocumentName('');
                  }}
                  className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="LICENSE">License</option>
                  <option value="OTHER">Other</option>
                </select>

                {selectedDocType === 'OTHER' && (
                  <input
                    value={otherDocumentName}
                    onChange={(e) => setOtherDocumentName(e.target.value)}
                    placeholder="Document name"
                    aria-label="Other document name"
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                )}

                <button
                  onClick={() => docInputRef.current?.click()}
                  disabled={uploadingDoc || (selectedDocType === 'OTHER' && !otherDocumentName.trim())}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '0.65rem', border: 'none', background: 'hsl(222 47% 11%)', color: '#fff', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
                >
                  {uploadingDoc ? (
                    <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 1s linear infinite' }} />
                  ) : (
                    <Upload style={{ width: '0.875rem', height: '0.875rem' }} />
                  )}
                  {uploadingDoc ? 'Uploading…' : 'Choose File'}
                </button>
                <input
                  ref={docInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp"
                  style={{ display: 'none' }}
                  onChange={handleDocUpload}
                />
                <span style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', lineHeight: 1.45 }}>PDF, JPG, PNG, WEBP accepted</span>
              </div>
            </ProfileSection>
            </div>

          {/* Right: Read-only contact info */}
          <div style={{ display: 'contents' }}>
            {/* Contact info */}
            <div className="vfms-section-card">
              <div className="vfms-section-header">
                <h3 className="vfms-section-title">Contact Information</h3>
                <p className="vfms-section-description">Your registered contact details</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(16rem, 1fr))', gap: '0.75rem', padding: '1.25rem' }}>
              {/* Phone with inline edit */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.95rem', border: '1px solid hsl(var(--border))', borderRadius: '0.875rem', background: 'hsl(210 40% 98%)', minWidth: 0 }}>
                <span style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
                  background: '#fff', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem',
                  border: '1px solid hsl(var(--border))',
                }}>
                  <Phone style={{ width: '0.875rem', height: '0.875rem', color: 'hsl(var(--muted-foreground))' }} />
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Phone Number</p>
                  {!editingPhone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem', minWidth: 0 }}>
                      <p style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground))', margin: 0, fontWeight: 700, overflowWrap: 'anywhere' }}>{profile.phone || '--'}</p>
                      <button
                        aria-label="Edit phone"
                        onClick={() => { setPhoneInput(profile.phone ?? ''); setEditingPhone(true); }}
                        style={{
                          width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem',
                          border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <Pencil style={{ width: '0.8rem', height: '0.8rem' }} />
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                      <input
                        value={phoneInput}
                        onChange={(e) => setPhoneInput(e.target.value)}
                        placeholder="Phone number"
                        style={{
                          fontSize: '0.875rem', padding: '0.25rem 0.5rem',
                          borderRadius: '0.375rem', border: '1px solid hsl(var(--border))',
                          background: 'hsl(var(--background))', color: 'hsl(var(--foreground))',
                          minWidth: '12rem'
                        }}
                      />
                      <button
                        aria-label="Save phone"
                        disabled={savingPhone}
                        onClick={async () => {
                          if (!profile) return;
                          setSavingPhone(true);
                          try {
                            await import('@/lib/api/driver-portal').then(m => m.updateMyProfile({ phone: phoneInput }));
                            const updated = await import('@/lib/api/driver-portal').then(m => m.getMyProfile());
                            setProfile(updated);
                            setEditingPhone(false);
                            toast.success('Phone updated');
                          } catch (error: unknown) {
                            toast.error(getApiErrorMessage(error, 'Failed to update phone'));
                          } finally {
                            setSavingPhone(false);
                          }
                        }}
                        style={{
                          width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
                          border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <Check style={{ width: '0.9rem', height: '0.9rem' }} />
                      </button>
                      <button
                        aria-label="Cancel"
                        disabled={savingPhone}
                        onClick={() => setEditingPhone(false)}
                        style={{
                          width: '1.5rem', height: '1.5rem', borderRadius: '0.375rem',
                          border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))',
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                        }}
                      >
                        <X style={{ width: '0.9rem', height: '0.9rem' }} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <ProfileInfoTile icon={Mail} label="Email Address" value={profile.email} />
              </div>
            </div>

            <CertificationsSection />
          </div>
        </div>
        </div>
      )}

      {showProfilePicturePreview && avatarSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Driver profile picture preview"
          onClick={() => setShowProfilePicturePreview(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            background: 'hsl(220 30% 5% / 0.78)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: 'min(34rem, 92vw)',
              maxHeight: '86vh',
              borderRadius: '1.25rem',
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 24px 80px hsl(220 35% 5% / 0.45)',
              padding: '0.75rem',
            }}
          >
            <button
              type="button"
              aria-label="Close profile picture preview"
              onClick={() => setShowProfilePicturePreview(false)}
              style={{
                position: 'absolute',
                top: '-0.75rem',
                right: '-0.75rem',
                width: '2rem',
                height: '2rem',
                borderRadius: '9999px',
                border: '1px solid hsl(var(--border))',
                background: '#fff',
                color: 'hsl(var(--foreground))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 8px 24px hsl(220 30% 10% / 0.18)',
              }}
            >
              <X style={{ width: '1rem', height: '1rem' }} />
            </button>
            <img
              src={avatarSrc}
              alt="Driver profile picture preview"
              style={{
                display: 'block',
                width: '100%',
                maxHeight: '78vh',
                borderRadius: '0.9rem',
                objectFit: 'contain',
              }}
            />
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
