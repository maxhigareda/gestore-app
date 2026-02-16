import React from 'react';
import { type UserProfile } from '../../../utils/mockData';

interface ResumenTabProps {
    user: UserProfile;
}

const calculateTenure = (dateString?: string) => {
    if (!dateString) return '';
    const start = new Date(dateString);
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

const ResumenTab: React.FC<ResumenTabProps> = ({ user }) => {
    const fields = [
        { label: 'Rol', value: user.role },
        { label: 'Área', value: user.area },
        { label: 'División', value: user.division },
        { label: 'Empresa', value: user.company },
        { label: 'Centro de Costos', value: user.costCenter },
        { label: 'Supervisor', value: user.supervisor },
        { label: 'Equipo', value: user.team },
        { label: 'Suplente', value: user.substitute },
        { label: 'Tipo de Régimen', value: user.regimeType },
        { label: 'Ubicación', value: user.workLocation },
        { label: 'Registro Patronal', value: user.patronalRegistration },
        { label: 'Tipo de Contrato', value: user.contractType },
        {
            label: 'Fecha de Ingreso',
            value: user.companyEntryDate
                ? `${user.companyEntryDate.split('-').reverse().join('/')} ${calculateTenure(user.companyEntryDate)}`
                : ''
        },
        { label: 'Saldo de Vacaciones', value: `${user.vacationBalance} días` },
    ];

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '1.5rem',
            paddingTop: '1rem'
        }}>
            {fields.map((field) => (
                <div key={field.label} style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>
                        {field.label}
                    </span>
                    <span style={{ fontSize: '1rem', color: 'var(--color-text-primary)', fontWeight: 500 }}>
                        {field.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default ResumenTab;
