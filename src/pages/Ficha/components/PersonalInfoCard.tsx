import React from 'react';
import { Edit2 } from 'lucide-react';
import { type UserProfile, calculateAge } from '../../../utils/mockData';

interface PersonalInfoCardProps {
    user: UserProfile;
    onEdit: () => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({ user, onEdit }) => {
    const age = calculateAge(user.birthDate);
    const initials = user.firstName.charAt(0) + user.lastName.charAt(0);

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

                <button style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-secondary)',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                }}
                    onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-primary)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
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
                <InfoRow label="Cumpleaños" value={`${user.birthDate} (${age} años)`} />
                <InfoRow label="Dirección" value={user.address} />
                <InfoRow label="Fecha de Ingreso" value={user.dateOfEntry} />
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
