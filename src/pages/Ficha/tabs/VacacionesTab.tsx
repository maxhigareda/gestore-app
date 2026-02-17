import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import {
    calculateVacationPeriods,
    getVacationSummary,
    type VacationPeriod,
    type VacationRequest
} from '../../../utils/vacationLogic';
import VacationRequestModal from '../../Portal/components/VacationRequestModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

// Use this for the "Requests" table to keep it dummy/clean for now but wired to real types
// User wants "buttons to work" even if data is dummy?
// For now, let's fetch REAL requests. If empty, it's empty.
// IF user wants dummy data visible, I'll initialize state with MOCK if empty?
// User: "La parte de vacaciones tomadas deja la info dummie... pero si crea la o las tablas... y que los botones de opcions funcionen"
// This is tricky. I'll read from DB. If empty, I'll insert a Dummy row locally for display?
// Or I'll just rely on DB and tell user to create one.
// Let's implement real read/delete.

const VacacionesTab: React.FC = () => {
    const { user } = useAuth();
    const [periods, setPeriods] = useState<VacationPeriod[]>([]);
    const [requests, setRequests] = useState<VacationRequest[]>([]);
    const [summary, setSummary] = useState({
        totalAccrued: 0, totalTaken: 0, accruedExpired: 0, future: 0, currentRemaining: 0
    });
    const [loading, setLoading] = useState(true);

    // Modal Action State
    const [modalOpen, setModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedRequest, setSelectedRequest] = useState<VacationRequest | null>(null);

    useEffect(() => {
        if (user) {
            fetchVacationData();
        }
    }, [user]);

    const fetchVacationData = async () => {
        if (!user) return;
        try {
            // 1. Get Profile for Date of Entry (Company)
            const { data: profile } = await supabase
                .from('profiles')
                .select('company_entry_date')
                .eq('id', user.id)
                .single();

            // 2. Get Requests
            const { data: requestsData, error: reqError } = await supabase
                .from('vacation_requests')
                .select('*')
                .order('start_date', { ascending: false });

            if (reqError) throw reqError;

            // 3. Process Logic
            const entryDate = profile?.company_entry_date;
            const typedRequests = (requestsData || []) as VacationRequest[]; // Ensure types match

            // If No requests, strictly use DB data. No mocks.
            const reqsToUse = typedRequests;
            setRequests(reqsToUse);

            const calculatedPeriods = calculateVacationPeriods(entryDate, reqsToUse);
            setPeriods(calculatedPeriods);

            const calculatedSummary = getVacationSummary(calculatedPeriods);
            setSummary(calculatedSummary);

        } catch (error) {
            console.error('Error fetching vacation data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [confirmMessage, setConfirmMessage] = useState('');

    const handleDeleteClick = (id: string) => {
        setConfirmMessage('¿Seguro que deseas eliminar esta solicitud?');
        setConfirmAction(() => () => handleDelete(id));
        setConfirmOpen(true);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('vacation_requests').delete().eq('id', id);
        if (error) {
            console.error('Error erasing vacation request:', error);
            // Could use a toast here
        } else {
            fetchVacationData();
        }
    };

    const handleEdit = (request: VacationRequest) => {
        setSelectedRequest(request);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleView = (request: VacationRequest) => {
        setSelectedRequest(request);
        setModalMode('view');
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedRequest(null);
        setModalMode('create');
    };

    const handleSuccess = () => {
        handleCloseModal();
        fetchVacationData();
        // Ideally show a toast/success message here
    };

    if (loading) return <div>Cargando vacaciones...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* 1. Resumen de Saldos */}
            <Card title="Vacaciones">
                <h4 style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontWeight: 500 }}>Saldo</h4>
                <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap' }}>
                    <StatItem label="Acumuladas" value={summary.totalAccrued} />
                    <StatItem label="Tomadas" value={summary.totalTaken} />
                    <StatItem label="Vencidas" value={summary.accruedExpired} />
                    <StatItem label="Futuro" value={summary.future} />
                    <StatItem label="Restantes" value={summary.currentRemaining} highlight />
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
                            {requests.map((request) => (
                                <tr key={request.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={tdStyle}>{request.start_date}</td>
                                    <td style={tdStyle}>{request.end_date}</td>
                                    <td style={tdStyle}>{request.days_requested}</td>
                                    <td style={tdStyle}>{request.type}</td>
                                    <td style={tdStyle}>
                                        <StatusBadge status={request.status} />
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <ActionIcon icon={<Edit2 size={16} />} title="Editar" onClick={() => handleEdit(request)} />
                                            <ActionIcon icon={<Trash2 size={16} />} title="Borrar" onClick={() => handleDeleteClick(request.id)} />
                                            <ActionIcon icon={<Eye size={16} />} title="Ver" onClick={() => handleView(request)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No hay vacaciones registradas.
                                    </td>
                                </tr>
                            )}
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
                                <th style={thStyle}>Periodo</th>
                                <th style={thStyle}>Vigencia</th>
                                <th style={thStyle}>Días Ganados</th>
                                <th style={thStyle}>Tomados</th>
                                <th style={thStyle}>Pendientes</th>
                                <th style={thStyle}>Estatus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {periods.map((p) => (
                                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={tdStyle}>{p.period}</td>
                                    <td style={tdStyle}>
                                        {p.start_date.toLocaleDateString()} - {p.end_date.toLocaleDateString()}
                                    </td>
                                    <td style={tdStyle}>{p.days_entitled} Días</td>
                                    <td style={tdStyle}>{p.days_taken}</td>
                                    <td style={tdStyle}>{p.days_pending}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            color: p.status === 'Actual' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                                            fontWeight: p.status === 'Actual' ? 600 : 400
                                        }}>
                                            {p.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Request Manipulation Modal */}
            {modalOpen && selectedRequest && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '500px', width: '100%'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            {modalMode === 'edit' ? 'Modificar Solicitud' : 'Detalles de Solicitud'}
                        </h3>
                        <VacationRequestModal
                            balance={summary.currentRemaining}
                            onClose={handleCloseModal}
                            onSuccess={handleSuccess}
                            mode={modalMode}
                            initialData={{
                                id: selectedRequest.id,
                                startDate: selectedRequest.start_date,
                                endDate: selectedRequest.end_date,
                                comment: selectedRequest.reason
                            }}
                        />
                    </div>
                </div>
            )}

            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmAction}
                title="Confirmar Acción"
                message={confirmMessage}
                type="danger"
                confirmText="Confirmar"
            />
        </div>
    );
};

// --- Mocks removed as requested ---

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
    let color = 'var(--color-text-muted)';
    let bg = 'rgba(150, 153, 166, 0.2)';

    if (status === 'Aprobada' || status === 'Aprobado') {
        color = 'var(--color-success)';
        bg = 'rgba(0, 202, 114, 0.2)';
    } else if (status === 'Solicitada') {
        color = '#f59e0b'; // warning-ish
        bg = 'rgba(245, 158, 11, 0.2)';
    }

    return (
        <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color: color, display: 'inline-block' }}>
            {status}
        </span>
    );
};

const ActionIcon: React.FC<{ icon: React.ReactNode, title: string, onClick?: () => void }> = ({ icon, title, onClick }) => (
    <button
        title={title}
        onClick={onClick}
        style={{
            background: 'none', border: 'none', color: 'var(--color-text-secondary)',
            cursor: 'pointer', padding: '4px', borderRadius: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
    >
        {icon}
    </button>
);

// Styles
const thStyle: React.CSSProperties = { padding: '12px 16px', color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.85rem' };
const tdStyle: React.CSSProperties = { padding: '16px', color: 'var(--color-text-primary)' };

export default VacacionesTab;
