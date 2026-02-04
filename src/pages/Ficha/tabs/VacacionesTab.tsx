import React from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { MOCK_VACATION_ACCRUALS, MOCK_VACATION_REQUESTS } from '../../../utils/mockData';

const VacacionesTab: React.FC = () => {
    // Calculate Summary Data
    const totalAccrued = MOCK_VACATION_ACCRUALS.reduce((sum, item) => sum + item.days, 0);
    const totalTaken = MOCK_VACATION_REQUESTS.filter(r => r.status === 'Aprobado').reduce((sum, item) => sum + item.days, 0);
    // Assuming 'Vencidas' logic for now (mocked as 0 or arbitrary for example)
    const expired = 0;
    const futureApproved = MOCK_VACATION_REQUESTS
        .filter(r => r.status === 'Aprobado' && new Date(r.startDate) > new Date())
        .reduce((sum, item) => sum + item.days, 0);

    const remaining = totalAccrued - totalTaken - expired; // Simplified logic as per request context

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. Resumen de Saldos */}
            <Card title="Vacaciones">
                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 500 }}>Saldo</h4>
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                    <StatItem label="Acumuladas" value={totalAccrued} />
                    <StatItem label="Tomadas" value={totalTaken} />
                    <StatItem label="Vencidas" value={expired} />
                    <StatItem label="Futuro" value={futureApproved} />
                    <StatItem label="Restantes" value={remaining} highlight />
                </div>
            </Card>

            {/* 2. Vacaciones Tomadas */}
            <Card title="Vacaciones Tomadas">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={thStyle}>Fecha Inicio</th>
                                <th style={thStyle}>Fecha Fin</th>
                                <th style={thStyle}>Días</th>
                                <th style={thStyle}>Tipo</th>
                                <th style={thStyle}>Estado</th>
                                <th style={thStyle}>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_VACATION_REQUESTS.map((request) => (
                                <tr key={request.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={tdStyle}>{request.startDate}</td>
                                    <td style={tdStyle}>{request.endDate}</td>
                                    <td style={tdStyle}>{request.days}</td>
                                    <td style={tdStyle}>{request.type}</td>
                                    <td style={tdStyle}>
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <ActionIcon icon={<Edit2 size={16} />} title="Editar" />
                                            <ActionIcon icon={<Trash2 size={16} />} title="Borrar" />
                                            <ActionIcon icon={<Eye size={16} />} title="Ver" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* 3. Vacaciones Acumuladas */}
            <Card title="Vacaciones Acumuladas">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={thStyle}>Fecha</th>
                                <th style={thStyle}>Número de días</th>
                                <th style={thStyle}>Tipo</th>
                                <th style={thStyle}>Vencimiento</th>
                                <th style={thStyle}>Periodo</th>
                                <th style={thStyle}>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {MOCK_VACATION_ACCRUALS.map((accrual) => (
                                <tr key={accrual.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={tdStyle}>{accrual.date}</td>
                                    <td style={tdStyle}>{accrual.days.toFixed(1)} Días</td>
                                    <td style={tdStyle}>{accrual.type}</td>
                                    <td style={tdStyle}>{accrual.expirationDate}</td>
                                    <td style={tdStyle}>{accrual.period}</td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <ActionIcon icon={<Eye size={16} />} title="Ver Detalle" />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// --- Subcomponents ---

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius)',
        padding: '1.5rem',
        border: '1px solid var(--border-color)'
    }}>
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem', fontWeight: 600 }}>{title}</h3>
        {children}
    </div>
);

const StatItem: React.FC<{ label: string; value: number; highlight?: boolean }> = ({ label, value, highlight }) => (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>{label}</span>
        <span style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: highlight ? 'var(--color-primary)' : 'var(--color-text-primary)'
        }}>
            {value}
        </span>
    </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const isApproved = status === 'Aprobado';
    return (
        <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '0.75rem',
            fontWeight: 600,
            backgroundColor: isApproved ? 'rgba(0, 202, 114, 0.2)' : 'rgba(150, 153, 166, 0.2)',
            color: isApproved ? 'var(--color-success)' : 'var(--color-text-muted)',
            display: 'inline-block'
        }}>
            {status}
        </span>
    );
};

const ActionIcon: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
    <button
        title={title}
        style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
    >
        {icon}
    </button>
);

// Styles
const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    fontSize: '0.85rem'
};

const tdStyle: React.CSSProperties = {
    padding: '16px',
    color: 'var(--color-text-primary)'
};

export default VacacionesTab;
