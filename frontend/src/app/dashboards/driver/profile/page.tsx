'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  User, Mail, Phone, Calendar, CreditCard,
  Shield, Camera, Loader2, Badge, Trash2, Pencil, Check, X, Upload,
  Award, Plus, Save, AlertTriangle, Star
} from 'lucide-react';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import {
  getMyProfile, uploadProfilePicture, removeProfilePicture,
  type DriverProfileResponse,
  uploadMyDocument,
  getMyCertifications, addMyCertification,
  type CertificationItem, type CertificationPayload,
  getMyInfractions, type InfractionItem,
} from '@/lib/api/driver-portal';
import { resolveBackendAssetUrl } from '@/lib/api';

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
    <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1rem 1.25rem', boxShadow: '0 8px 24px hsl(220 30% 10% / 0.04)' }}>
      <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
        Driver Rating
      </p>
      {safeRating === null ? (
        <p style={{ fontSize: '0.875rem', color: 'hsl(var(--muted-foreground))', margin: 0, fontWeight: 500 }}>Not rated</p>
      ) : (
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
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'hsl(var(--foreground))' }}>{safeRating}%</span>
        </div>
      )}
      <p style={{ fontSize: '0.72rem', color: 'hsl(var(--muted-foreground))', margin: '0.45rem 0 0', lineHeight: 1.45 }}>
        Rating will sync from staff trip scheduling feedback.
      </p>
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
    <div role="alert" style={{ borderRadius: '1rem', border: '1px solid hsl(19 90% 62%)', background: 'hsl(19 97% 96%)', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
        <AlertTriangle style={{ width: '1.25rem', height: '1.25rem', color: 'hsl(19 85% 40%)', flexShrink: 0, marginTop: '0.1rem' }} />
        <div>
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'hsl(19 85% 28%)', margin: 0 }}>Infraction Notice</h3>
          <p style={{ fontSize: '0.78rem', color: 'hsl(19 75% 32%)', margin: '0.25rem 0 0', lineHeight: 1.5 }}>
            An infraction has been recorded on your driver profile. Please contact the office for further information and guidance.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {infractions.map((infraction) => (
          <div key={infraction.id} style={{ borderRadius: '0.65rem', border: '1px solid hsl(19 75% 78%)', background: 'hsl(var(--card))', padding: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.8rem', color: 'hsl(var(--foreground))' }}>
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
    <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0 }}>Certifications</h3>
          <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.125rem 0 0' }}>View and submit your training certifications</p>
        </div>
        <button
          type="button"
          onClick={openCertificationForm}
          style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'hsl(42 100% 50%)', color: '#000', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer', flexShrink: 0 }}
        >
          <Plus style={{ width: '0.875rem', height: '0.875rem' }} /> Add Certification
        </button>
      </div>

      {loadingCertifications ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))' }}>
          <Loader2 style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : certifications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--muted-foreground))', border: '1px dashed hsl(var(--border))', borderRadius: '0.75rem' }}>
          <Award style={{ width: '1.75rem', height: '1.75rem', margin: '0 auto 0.5rem', opacity: 0.4 }} />
          <p style={{ margin: 0, fontSize: '0.8125rem' }}>No certifications yet. Add your first one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(14rem, 1fr))', gap: '0.75rem' }}>
          {certifications.map((certification) => (
            <div key={certification.id} style={{ borderRadius: '0.75rem', border: '1px solid hsl(var(--border))', padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Award style={{ width: '1rem', height: '1rem', color: 'hsl(42 100% 45%)' }} />
                <span style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem', borderRadius: '9999px', background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))', fontWeight: 500 }}>
                  {(certification.certType ?? 'OTHER').replace(/_/g, ' ')}
                </span>
              </div>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, margin: '0 0 0.25rem' }}>{certification.certName || 'Unnamed certification'}</p>
              {certification.issuedBy && <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0 0 0.25rem' }}>by {certification.issuedBy}</p>}
              {certification.expiryDate && <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: 0 }}>Expires: {certification.expiryDate}</p>}
            </div>
          ))}
        </div>
      )}

      {showCertificationForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div role="dialog" aria-modal="true" aria-labelledby="add-certification-title" style={{ background: '#fff', color: '#000', borderRadius: '1rem', border: '1px solid #e5e7eb', padding: '1.5rem', width: '28rem', maxWidth: '90vw' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 id="add-certification-title" style={{ fontSize: '0.9375rem', fontWeight: 700, margin: 0 }}>Add Certification</h2>
              <button type="button" aria-label="Close certification form" onClick={() => setShowCertificationForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }}>
                <X style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
            <form onSubmit={handleCertificationSubmit}>
              <div style={{ marginBottom: '0.875rem' }}>
                <label htmlFor="certification-type" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Type</label>
                <select id="certification-type" value={certificationForm.certType} onChange={(event) => setCertificationForm((current) => ({ ...current, certType: event.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem', boxSizing: 'border-box' }}>
                  {CERTIFICATION_TYPES.map((type) => <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label htmlFor="certification-name" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Certification Name</label>
                <input id="certification-name" required value={certificationForm.certName} onChange={(event) => setCertificationForm((current) => ({ ...current, certName: event.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: '0.875rem' }}>
                <label htmlFor="certification-issuer" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issued By</label>
                <input id="certification-issuer" value={certificationForm.issuedBy} onChange={(event) => setCertificationForm((current) => ({ ...current, issuedBy: event.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem', boxSizing: 'border-box' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ marginBottom: '0.875rem' }}>
                  <label htmlFor="certification-issue-date" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Date</label>
                  <input id="certification-issue-date" type="date" value={certificationForm.issueDate} onChange={(event) => setCertificationForm((current) => ({ ...current, issueDate: event.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
                <div style={{ marginBottom: '0.875rem' }}>
                  <label htmlFor="certification-expiry-date" style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expiry Date</label>
                  <input id="certification-expiry-date" type="date" value={certificationForm.expiryDate} onChange={(event) => setCertificationForm((current) => ({ ...current, expiryDate: event.target.value }))} style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem', boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowCertificationForm(false)} style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid hsl(var(--border))', background: 'transparent', color: '#000', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={savingCertification} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: 'none', background: 'hsl(42 100% 50%)', color: '#000', fontWeight: 600, cursor: savingCertification ? 'not-allowed' : 'pointer' }}>
                  {savingCertification ? <Loader2 style={{ width: '0.875rem', height: '0.875rem', animation: 'spin 1s linear infinite' }} /> : <Save style={{ width: '0.875rem', height: '0.875rem' }} />}
                  {savingCertification ? 'Saving...' : 'Save'}
                </button>
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
    <DashboardShell title="My Profile" description="View your personal information">
      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'hsl(var(--muted-foreground))' }}>
          <Loader2 style={{ width: '1.5rem', height: '1.5rem', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : !profile ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'hsl(var(--muted-foreground))' }}>
          <p>No driver profile linked to your account. Contact an administrator.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxWidth: '74rem', margin: '0 auto', width: '100%' }}>
          <InfractionWarningsSection />

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(18rem, 22rem) minmax(0, 1fr)', gap: '1.5rem', alignItems: 'start' }}>

          {/* Left: Avatar + identity card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Avatar card */}
            <div style={{
              borderRadius: '1.25rem', border: '1px solid hsl(var(--border))',
              background: 'hsl(var(--card))', overflow: 'hidden',
              boxShadow: '0 16px 40px hsl(220 30% 10% / 0.08)',
            }}>
              {/* Gradient banner */}
              <div style={{ height: '5.5rem', background: 'linear-gradient(135deg, hsl(220 30% 15%), hsl(42 100% 30%))' }} />
              <div style={{ padding: '0 1.5rem 1.5rem', position: 'relative', textAlign: 'center' }}>
                {/* Avatar */}
                <div style={{ position: 'relative', display: 'inline-block', marginTop: '-2.5rem', marginBottom: '0.75rem' }}>
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
                      background: 'linear-gradient(135deg, hsl(220 30% 25%), hsl(42 100% 40%))',
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
                        position: 'absolute', top: '0.25rem', right: '-2rem',
                        width: '1.5rem', height: '1.5rem', borderRadius: '50%',
                        background: '#fff', border: '1px solid hsl(var(--border))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px hsl(0 0% 0% / 0.12)'
                      }}
                    >
                      <Trash2 style={{ width: '0.75rem', height: '0.75rem', color: 'hsl(0 84% 45%)' }} />
                    </button>
                  )}
                  {/* Upload overlay */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPic}
                    aria-label="Change profile picture"
                    style={{
                      position: 'absolute', top: avatarSrc ? '2.1rem' : '0.25rem', right: '-2rem',
                      width: '1.5rem', height: '1.5rem', borderRadius: '50%',
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

                <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'hsl(var(--foreground))', margin: 0 }}>
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

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <StatusPill status={profile.status} />
                </div>
              </div>
            </div>

            <DriverRating ratingPercentage={profile.ratingPercentage} />

            {/* Identity card */}
            <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1rem 1.25rem', boxShadow: '0 8px 24px hsl(220 30% 10% / 0.04)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                Identity
              </p>
              <InfoRow icon={Badge} label="Driver ID" value={profile.employeeId} />
              <InfoRow icon={CreditCard} label="NIC / Passport" value={profile.nic} />
            </div>

            {/* License card */}
            <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1rem 1.25rem', boxShadow: '0 8px 24px hsl(220 30% 10% / 0.04)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', marginBottom: '0.5rem' }}>
                License
              </p>
              <InfoRow icon={Shield} label="License Number" value={profile.licenseNumber} />
              <InfoRow icon={Calendar} label="Expiry Date" value={profile.licenseExpiryDate} />
            </div>

            {/* Upload Document (migrated from Documents page) */}
            <div style={{ borderRadius: '1rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1.1rem 1.25rem', boxShadow: '0 8px 24px hsl(220 30% 10% / 0.04)' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'hsl(var(--muted-foreground))', margin: '0 0 0.75rem' }}>
                Upload Document
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.65rem' }}>
                <select
                  value={selectedDocType}
                  onChange={(e) => {
                    const nextType = e.target.value as 'LICENSE' | 'OTHER';
                    setSelectedDocType(nextType);
                    if (nextType === 'LICENSE') setOtherDocumentName('');
                  }}
                  style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.65rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem' }}
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
                    style={{ width: '100%', padding: '0.55rem 0.75rem', borderRadius: '0.65rem', border: '1px solid hsl(var(--border))', background: '#fff', color: '#000', fontSize: '0.875rem', boxSizing: 'border-box' }}
                  />
                )}

                <button
                  onClick={() => docInputRef.current?.click()}
                  disabled={uploadingDoc || (selectedDocType === 'OTHER' && !otherDocumentName.trim())}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '0.65rem', border: 'none', background: 'hsl(42 100% 50%)', color: '#000', fontWeight: 700, fontSize: '0.8125rem', cursor: 'pointer' }}
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
            </div>
            </div>

          {/* Right: Read-only contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
            {/* Contact info */}
            <div style={{ borderRadius: '1.25rem', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))', padding: '1.5rem', boxShadow: '0 12px 32px hsl(220 30% 10% / 0.06)' }}>
              <div style={{ marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'hsl(var(--foreground))', margin: 0 }}>Contact Information</h3>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--muted-foreground))', margin: '0.125rem 0 0' }}>Your registered contact details</p>
              </div>
              {/* Phone with inline edit */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem 0', borderBottom: '1px solid hsl(var(--border))' }}>
                <span style={{
                  width: '1.75rem', height: '1.75rem', borderRadius: '0.375rem',
                  background: 'hsl(var(--muted))', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem',
                }}>
                  <Phone style={{ width: '0.875rem', height: '0.875rem', color: 'hsl(var(--muted-foreground))' }} />
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.7rem', color: 'hsl(var(--muted-foreground))', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Phone Number</p>
                  {!editingPhone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.125rem' }}>
                      <p style={{ fontSize: '0.875rem', color: 'hsl(var(--foreground))', margin: 0, fontWeight: 500 }}>{profile.phone || '—'}</p>
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
              <InfoRow icon={Mail} label="Email Address" value={profile.email} />
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
    </DashboardShell>
  );
}
