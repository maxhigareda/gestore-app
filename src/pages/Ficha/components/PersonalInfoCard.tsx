import React from 'react';
import { Edit2 } from 'lucide-react';
import { type UserProfile, calculateAge } from '../../../utils/mockData';

interface PersonalInfoCardProps {
    user: UserProfile;
    onEdit: () => void;
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    // Handle yyyy-mm-dd to dd/mm/yyyy
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
};

const calculateTenure = (dateString?: string) => {
    if (!dateString) return '';
    // If it's undefined/null, handle gracefully

    const start = new Date(dateString);
    if (isNaN(start.getTime())) return '';

    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    // Adjust if day of month hasn't occurred yet
    if (now.getDate() < start.getDate()) {
        months--;
        if (months < 0) {
            years--;
            months += 12;
        }
    }

    const parts = [];
    if (years > 0) parts.push(`${years} ${years === 1 ? 'año' : 'años'}`);
    if (months > 0) parts.push(`${months} ${months === 1 ? 'mes' : 'meses'}`);

    if (parts.length === 0) return '(Menos de 1 mes)';
    return `(${parts.join(', ')})`;
};

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ user, onEdit }) => {
    const age = calculateAge(user.birthDate);
    const initials = user.firstName.charAt(0) + user.lastName.charAt(0);
    const tenure = calculateTenure(user.dateOfEntry);

    return (
        <div style={{
            backgroundColor: 'var(--color-secondary-background)',
            borderRadius: 'var(--border-radius)',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: 'var(--shadow-md)',
            height: '100%'
        }}>
            {/* Photo & Basic Info Header */}
            <div style={{ position: 'relative', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    backgroundColor: '#e0e0e0', // Placeholder gray
                    backgroundImage: user.photoUrl ? `url(${user.photoUrl})` : 'none',
                    backgroundSize: 'cover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    color: '#333',
                    marginBottom: '1rem',
                    border: '4px solid var(--color-surface)'
                }}>
                    {!user.photoUrl && initials}
                </div>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                    {user.firstName}
                </h2>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                    {user.lastName}
                </h2>

                <p style={{ color: 'var(--color-primary)', fontWeight: 500, marginBottom: '1rem' }}>
                    {user.role}
                </p>

                <button className="btn-primary" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)', // Keeping border for shape, but class handles color
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    marginTop: '1rem', // Added margin
                }}
                    onClick={onEdit}
                >
                    <Edit2 size={14} />
                    Actualizar datos
                </button>
            </div>

            <div style={{ width: '100%', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

            {/* General Info Section */}
            <div style={{ width: '100%' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '1.5rem' }}>
                    Información General
                </h3>

                <InfoRow label="RFC" value={user.rfc} />
                <InfoRow label="Correo Corporativo" value={user.email} />
                <InfoRow label="Cumpleaños" value={`${formatDate(user.birthDate)} (${age} años)`} />
                <InfoRow label="Dirección" value={user.address} />
                <InfoRow label="Fecha de Ingreso" value={`${formatDate(user.dateOfEntry)} ${tenure}`} />
            </div>
        </div>
    );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={{ marginBottom: '1.25rem' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-primary)' }}>{value}</p>
    </div>
);

export default PersonalInfoCard;
