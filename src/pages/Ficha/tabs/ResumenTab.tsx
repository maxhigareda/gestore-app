import React from 'react';
import { type UserProfile } from '../../../utils/mockData';

interface ResumenTabProps {
    user: UserProfile;
}

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
        { label: 'Fecha de Ingreso', value: user.companyEntryDate ? user.companyEntryDate.split('-').reverse().join('/') : '' },
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
