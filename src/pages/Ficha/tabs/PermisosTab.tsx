import React, { useEffect, useState } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import PermissionRequestModal from '../../Portal/components/PermissionRequestModal';
import ConfirmationModal from '../../../components/ConfirmationModal';

// Define Interface locally or import if shared (currently local in modal, let's look at standardizing later)
// For now, mirroring the DB structure
interface PermissionRequest {
    id: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: 'Solicitada' | 'Aprobada' | 'Rechazada';
    type: string;
    reason?: string;
}

const PermisosTab: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<PermissionRequest[]>([]);
    const [loading, setLoading] = useState(true);

    // Modal Action State
    const [modalOpen, setModalOpen] = useState(false);
    // PermissionModal usually triggers its own "Success" which closes it. 
    // But it doesn't support "Edit" mode yet in the PROPS of PermissionRequestModal?
    // Let's check PermissionRequestModal props. 
    // It only has onClose and onSuccess. It doesn't have initialData/mode yet.
    // The user asked to "agrega una identica a vacaciones pero de permisos".
    // I need to UPDATE PermissionRequestModal to support Edit/View too!
    // For now, I will implement the TABLE first, and then I must Refactor PermissionRequestModal.

    // Actually, I should refactor PermissionRequestModal FIRST to support edit/view props.
    // But I can write this component imagining it has them, or pass what I can.
    // Wait, the user said "parauw puedn ver si editar o borrar los permisos".
    // So I MUST implement Edit/Delete for Permissions too.

    // I'll define the state here assuming I will update the Modal next.
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [selectedRequest, setSelectedRequest] = useState<PermissionRequest | null>(null);

    useEffect(() => {
        if (user) {
            fetchPermissions();
        }
    }, [user]);

    const fetchPermissions = async () => {
        if (!user) return;
        setLoading(true);
        try {
            console.log('Fetching permissions for user:', user.id);
            const { data, error } = await supabase
                .from('permission_requests')
                .select('*')
                .eq('user_id', user.id) // Explicitly filter
                .order('start_date', { ascending: false });

            if (error) {
                console.error('Supabase error fetching permissions:', error);
                throw error;
            }

            console.log('Permissions data:', data);
            setRequests((data || []) as PermissionRequest[]);
        } catch (error) {
            console.error('Error fetching permissions:', error);
            // Optional: Set UI error state
        } finally {
            setLoading(false);
        }
    };

    // Confirmation Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => { });
    const [confirmMessage, setConfirmMessage] = useState('');

    const handleDeleteClick = (id: string) => {
        setConfirmMessage('¿Seguro que deseas eliminar este permiso?');
        setConfirmAction(() => () => handleDelete(id));
        setConfirmOpen(true);
    };

    const handleDelete = async (id: string) => {
        const { error } = await supabase.from('permission_requests').delete().eq('id', id);
        if (error) {
            alert('Error al borrar');
        } else {
            fetchPermissions();
        }
    };

    const handleEdit = (request: PermissionRequest) => {
        setSelectedRequest(request);
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleView = (request: PermissionRequest) => {
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
        fetchPermissions();
    };

    if (loading) return <div>Cargando permisos...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

            {/* Permisos Table */}
            <Card title="Historial de Permisos">
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={thStyle}>Fecha Inicio</th>
                                <th style={thStyle}>Fecha Fin</th>
                                <th style={thStyle}>Días</th>
                                <th style={thStyle}>Tipo</th>
                                <th style={thStyle}>Motivo</th>
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
                                    <td style={tdStyle} title={request.reason}>
                                        {request.reason ? (request.reason.length > 20 ? request.reason.substring(0, 20) + '...' : request.reason) : '-'}
                                    </td>
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
                                    <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No hay permisos registrados.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Request Manipulation Modal */}
            {modalOpen && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '500px', width: '100%'
                    }}>
                        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
                            {modalMode === 'edit' ? 'Modificar Permiso' : modalMode === 'view' ? 'Detalles del Permiso' : 'Solicitar Permiso'}
                        </h3>
                        {/* 
                            IMPORTANT: I need to Type Check this. 
                            I am passing 'mode' and 'initialData' to PermissionRequestModal.
                            I MUST update PermissionRequestModal to accept these props in the next step.
                        */}
                        <PermissionRequestModal
                            onClose={handleCloseModal}
                            onSuccess={handleSuccess}
                            mode={modalMode}
                            initialData={selectedRequest ? {
                                id: selectedRequest.id,
                                startDate: selectedRequest.start_date,
                                endDate: selectedRequest.end_date,
                                type: selectedRequest.type,
                                comment: selectedRequest.reason
                            } : undefined}
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
            />
        </div>
    );
};

// --- Subcomponents (Reused) ---

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

export default PermisosTab;
