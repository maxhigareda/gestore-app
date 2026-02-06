import React, { useState, useEffect } from 'react';
// Portal Page Logic - Updated for Real Metrics
import { Palmtree, UserCheck, CalendarCheck } from 'lucide-react';
import QuickActionCard from './components/QuickActionCard';
import VacationRequestModal from './components/VacationRequestModal';
import PermissionRequestModal from './components/PermissionRequestModal';
import Modal from '../../components/Modal';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { calculateVacationPeriods, getVacationSummary, type VacationRequest } from '../../utils/vacationLogic';

const PortalPage: React.FC = () => {
    const { user } = useAuth();

    // Metrics State
    const [vacationBalance, setVacationBalance] = useState<number>(0);
    const [vacationPending, setVacationPending] = useState<number>(0);
    const [permissionDays, setPermissionDays] = useState<number>(0);
    const [permissionPending, setPermissionPending] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);

    // Modal State
    const [activeModal, setActiveModal] = useState<'vacation' | 'permission' | 'success' | null>(null);
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        if (user) {
            fetchMetrics();
        }
    }, [user]);

    const fetchMetrics = async () => {
        try {
            if (!user?.id) return;

            // 1. Fetch Profile (for company_entry_date) & Vacation Requests
            const [profileRes, vacReqsRes] = await Promise.all([
                supabase.from('profiles').select('company_entry_date').eq('id', user.id).single(),
                supabase.from('vacation_requests').select('*').eq('user_id', user.id)
            ]);

            // Calculate Vacation Balance
            if (profileRes.data?.company_entry_date) {
                const periods = calculateVacationPeriods(
                    profileRes.data.company_entry_date,
                    (vacReqsRes.data as VacationRequest[]) || []
                );
                const summary = getVacationSummary(periods);
                setVacationBalance(summary.currentRemaining); // Real Balance (available)
                setVacationPending(summary.future); // Pending Requests
            }

            // 2. Fetch Permission Requests (Current Year)
            const currentYear = new Date().getFullYear();
            const { data: permReqs } = await supabase
                .from('permission_requests')
                .select('days_requested, status')
                .eq('user_id', user.id)
                .gte('start_date', `${currentYear}-01-01`)
                .lte('start_date', `${currentYear}-12-31`);

            // Calculate Permission Stats
            const approvedPerms = permReqs
                ?.filter((r: any) => r.status === 'Aprobada' || r.status === 'Aprobado')
                .reduce((sum: number, r: any) => sum + r.days_requested, 0) || 0;

            const pendingPerms = permReqs
                ?.filter((r: any) => r.status === 'Solicitada')
                .reduce((sum: number, r: any) => sum + r.days_requested, 0) || 0;

            // ... inside fetchMetrics ...
            setPermissionDays(approvedPerms);
            setPermissionPending(pendingPerms);

            console.log('Portal Metrics Updated:', {
                vacationBalance: summary.currentRemaining,
                vacationPending: summary.future,
                permissionDays: approvedPerms,
                permissionPending: pendingPerms
            });

        } catch (error) {
            console.error("Error fetching portal metrics:", error);
        } finally {
            setLoading(false);
        }
    };

    // ... inside render ...
    <span>
        {vacationBalance} días
        {vacationPending > 0 && (
            <span style={{ fontSize: '0.85rem', fontWeight: 400, marginLeft: '8px', color: '#666' }}>
                ({vacationPending} solicitados)
            </span>
        )}
    </span>
                    )}
// ...
metricValue = {
    loading? "...": (
        <span>
            {permissionDays} días
            {permissionPending > 0 && (
                <span style={{ fontSize: '0.85rem', fontWeight: 400, marginLeft: '8px', color: '#666' }}>
                    ({permissionPending} solicitados)
                </span>
            )}
        </span>
    )
}

{/* Right Column: Feed / Content (Placeholder) */ }
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

{/* --- Modals --- */ }

{/* Vacation Modal */ }
<Modal
    isOpen={activeModal === 'vacation'}
    onClose={() => setActiveModal(null)}
    title="Solicitar Vacaciones"
>
    <VacationRequestModal
        balance={vacationBalance}
        onClose={() => setActiveModal(null)}
        onSuccess={handleVacationRequestSuccess}
    />
</Modal>

{/* Permission Modal */ }
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

{/* Success Confirmation Modal */ }
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

        </div >
    );
};

export default PortalPage;
