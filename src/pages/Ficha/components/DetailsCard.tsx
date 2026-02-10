import React, { useState } from 'react';
import { type UserProfile } from '../../../utils/mockData';
import ResumenTab from '../tabs/ResumenTab';
import VacacionesTab from '../tabs/VacacionesTab';
import PermisosTab from '../tabs/PermisosTab';

interface DetailsCardProps {
    user: UserProfile;
}

const TABS = ['Resumen', 'Documentos', 'Historia', 'Bitácora', 'Asistencia', 'Vacaciones', 'Permisos'];

const DetailsCard: React.FC<DetailsCardProps> = ({ user }) => {
    const [activeTab, setActiveTab] = useState('Resumen');

    const renderContent = () => {
        switch (activeTab) {
            case 'Resumen':
                return <ResumenTab user={user} />;
            case 'Vacaciones':
                return <VacacionesTab />;
            case 'Permisos':
                return <PermisosTab />;
            default:
                return (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        Sección {activeTab} en construcción
                    </div>
                );
        }
    };

    return (
        <div style={{
            backgroundColor: 'var(--color-secondary-background)',
            borderRadius: 'var(--border-radius)',
            padding: '0', // No padding on container to let tabs span full width
            boxShadow: 'var(--shadow-md)',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Tabs Header */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid var(--border-color)',
                padding: '0 1rem',
                overflowX: 'auto'
            }}>
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '1rem 1.5rem',
                            background: 'none',
                            border: 'none',
                            borderBottom: activeTab === tab ? '2px solid var(--color-primary)' : '2px solid transparent',
                            color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: activeTab === tab ? 600 : 400,
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s'
                        }}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                {renderContent()}
            </div>
        </div>
    );
};

export default DetailsCard;
