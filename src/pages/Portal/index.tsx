import React, { useState } from 'react';
import { Palmtree, UserCheck, CalendarCheck } from 'lucide-react';
import QuickActionCard from './components/QuickActionCard';
import VacationRequestModal from './components/VacationRequestModal';
import PermissionRequestModal from './components/PermissionRequestModal';
import Modal from '../../components/Modal';
import { MOCK_USER_PROFILE } from '../../utils/mockData';

const PortalPage: React.FC = () => {
    // State for Modals
    const [activeModal, setActiveModal] = useState<'vacation' | 'permission' | 'success' | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    const handleVacationRequestSuccess = () => {
        setActiveModal('success');
        setSuccessMessage('Se ha enviado tu solicitud de vacaciones, espera la confirmación.');
    };

    const handlePermissionRequestSuccess = () => {
        setActiveModal('success');
        setSuccessMessage('Se ha enviado tu permiso, en espera de ser autorizado.');
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '2rem',
            height: '100%',
            border: '5px solid yellow',
            backgroundColor: 'rgba(255, 255, 0, 0.1)'
        }}>
            {/* Left Column: Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Accesos Directos</h2>

                {/* Vacation Card */}
                <QuickActionCard
                    title="Solicitar Vacaciones"
                    icon={<Palmtree size={24} />}
                    metricLabel="Días restantes"
                    metricValue={`${MOCK_USER_PROFILE.vacationBalance} días`}
                    buttonLabel="Solicitar"
                    onButtonClick={() => setActiveModal('vacation')}
                    color="#575fa0" // Muted Indigo/Blue
                />

                {/* Permission Card */}
                <QuickActionCard
                    title="Solicitar Permiso"
                    icon={<UserCheck size={24} />}
                    metricLabel="Días pedidos este año"
                    metricValue="2 días"
                    buttonLabel="Solicitar"
                    onButtonClick={() => setActiveModal('permission')}
                    color="#6c757d" // Neutral Grey
                />
            </div>

            {/* Right Column: Feed / Content (Placeholder) */}
            <div style={{
                backgroundColor: 'var(--color-secondary-background)',
                borderRadius: 'var(--border-radius)',
                padding: '2rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <CalendarCheck size={48} opacity={0.5} />
                <p>Noticias y Novedades (Feed) - Próximamente</p>
            </div>

            {/* --- Modals --- */}

            {/* Vacation Modal */}
            <Modal
                isOpen={activeModal === 'vacation'}
                onClose={() => setActiveModal(null)}
                title="Solicitar Vacaciones"
            >
                <VacationRequestModal
                    balance={MOCK_USER_PROFILE.vacationBalance}
                    onClose={() => setActiveModal(null)}
                    onSuccess={handleVacationRequestSuccess}
                />
            </Modal>

            {/* Permission Modal */}
            <Modal
                isOpen={activeModal === 'permission'}
                onClose={() => setActiveModal(null)}
                title="Solicitar Permiso"
            >
                <PermissionRequestModal
                    onClose={() => setActiveModal(null)}
                    onSuccess={handlePermissionRequestSuccess}
                />
            </Modal>

            {/* Success Confirmation Modal */}
            <Modal
                isOpen={activeModal === 'success'}
                onClose={() => setActiveModal(null)}
                title="Solicitud Enviada"
            >
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                    <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0, 202, 114, 0.1)',
                        color: 'var(--color-success)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem auto'
                    }}>
                        <CalendarCheck size={32} />
                    </div>
                    <p style={{ fontSize: '1.1rem', marginBottom: '2rem' }}>{successMessage}</p>
                    <button
                        onClick={() => setActiveModal(null)}
                        style={{
                            padding: '10px 30px',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Entendido
                    </button>
                </div>
            </Modal>

        </div>
    );
};

export default PortalPage;
