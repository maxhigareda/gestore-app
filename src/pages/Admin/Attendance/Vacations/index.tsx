import React, { useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../context/AuthContext';
import { Trash2, Eye } from 'lucide-react';
import RequestActionModal from '../../Collaborators/Requests/RequestActionModal';
import { useUnifiedRequests, type UnifiedRequest } from '../../../../hooks/useUnifiedRequests';

const VacationsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected'>('pending');
    const { requests, loading, fetchRequests } = useUnifiedRequests(user?.id || '');

    // Filter only Vacations
    const vacationRequests = requests.filter(r => r.type === 'vacation');

    // State for Modals
    const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'viewer' | 'supervisor'>('viewer');

    // Tabs Logic
    const approvedRequests = vacationRequests.filter(r => r.status === 'Aprobada');
    const pendingRequests = vacationRequests.filter(r => r.status === 'Solicitada');
    const rejectedRequests = vacationRequests.filter(r => r.status === 'Rechazada');

    // Supervisor Pending Filter
    const myPendingRequests = pendingRequests.filter(r => r.managerId === user?.id);

    const handleActionClick = (req: UnifiedRequest, mode: 'viewer' | 'supervisor') => {
        setSelectedRequest(req);
        setModalMode(mode);
        setIsActionModalOpen(true);
    };

    const handleDelete = async (id: string, table: string) => {
        if (!confirm('¿Estás seguro de eliminar este registro?')) return;

        try {
            const { error } = await supabase.from(table).delete().eq('id', id);
            if (error) throw error;
            fetchRequests();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
        }
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', marginBottom: '1.5rem', color: 'var(--color-text-primary)' }}>
                Gestión de Vacaciones
            </h1>

            {/* Tabs Header */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '2rem' }}>
                <TabButton
                    active={activeTab === 'approved'}
                    onClick={() => setActiveTab('approved')}
                    label="Aprobadas"
                    count={approvedRequests.length}
                    color="var(--color-success)"
                />
                <TabButton
                    active={activeTab === 'pending'}
                    onClick={() => setActiveTab('pending')}
                    label="En Proceso"
                    count={myPendingRequests.length}
                    color="var(--color-warning)"
                />
                <TabButton
                    active={activeTab === 'rejected'}
                    onClick={() => setActiveTab('rejected')}
                    label="Rechazadas"
                    count={rejectedRequests.length}
                    color="var(--color-danger)"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div>Cargando...</div>
            ) : (
                <div style={{ backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>

                    {activeTab === 'approved' && (
                        <RequestsTable
                            data={approvedRequests}
                            columns={['Nombre', 'Fecha Inicio', 'Días', 'Solicitado el', 'Estado']}
                            onAction={(r) => handleActionClick(r, 'viewer')}
                            onDelete={(id) => handleDelete(id, 'vacation_requests')}
                            mode="approved"
                        />
                    )}

                    {activeTab === 'pending' && (
                        <RequestsTable
                            data={myPendingRequests}
                            columns={['Nombre', 'Fecha Inicio', 'Días', 'Solicitado el', 'Estado']}
                            onAction={(r) => handleActionClick(r, 'supervisor')}
                            mode="pending"
                        />
                    )}

                    {activeTab === 'rejected' && (
                        <RequestsTable
                            data={rejectedRequests}
                            columns={['Nombre', 'Fecha Inicio', 'Días', 'Solicitado el', 'Comentario']}
                            onAction={(r) => handleActionClick(r, 'viewer')}
                            onDelete={(id) => handleDelete(id, 'vacation_requests')}
                            mode="rejected"
                        />
                    )}
                </div>
            )}

            {isActionModalOpen && selectedRequest && (
                <RequestActionModal
                    request={selectedRequest}
                    onClose={() => setIsActionModalOpen(false)}
                    onUpdate={fetchRequests}
                    mode={modalMode}
                />
            )}
        </div>
    );
};

interface TabButtonProps {
    active: boolean;
    onClick: () => void;
    label: string;
    count: number;
    color: string;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, label, count, color }) => (
    <button
        onClick={onClick}
        style={{
            background: 'none', border: 'none', padding: '1rem 0',
            fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
            color: active ? color : 'var(--color-text-muted)',
            borderBottom: active ? `3px solid ${color}` : '3px solid transparent',
            display: 'flex', alignItems: 'center', gap: '8px'
        }}
    >
        {label}
        <span style={{
            fontSize: '0.75rem',
            backgroundColor: active ? color : 'var(--color-background)',
            color: active ? 'white' : 'var(--color-text-muted)',
            padding: '2px 8px', borderRadius: '12px'
        }}>
            {count}
        </span>
    </button>
);

interface RequestsTableProps {
    data: UnifiedRequest[];
    columns: string[];
    onAction: (req: UnifiedRequest) => void;
    onDelete?: (id: string) => void;
    mode: 'approved' | 'pending' | 'rejected';
}

const RequestsTable: React.FC<RequestsTableProps> = ({ data, columns, onAction, onDelete, mode }) => {
    if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>No hay solicitudes en esta sección.</div>;

    return (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ backgroundColor: 'var(--color-background)', borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                    {columns.map((c) => <th key={c} style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>{c}</th>)}
                    <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
            </thead>
            <tbody>
                {data.map((r) => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem' }}>
                            <div style={{ fontWeight: 500 }}>{r.userName}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{r.type}</div>
                        </td>
                        <td style={{ padding: '1rem' }}>{new Date(r.startDate).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>{r.days} días</td>
                        <td style={{ padding: '1rem' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                        <td style={{ padding: '1rem' }}>
                            {mode === 'rejected' ? (
                                <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>{r.reason || '-'}</span>
                            ) : (
                                <StatusBadge status={r.status} />
                            )}
                        </td>
                        <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <button onClick={() => onAction(r)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}>
                                <Eye size={16} color="var(--color-text-secondary)" />
                            </button>
                            {onDelete && (
                                <button onClick={() => onDelete(r.id)} style={{ padding: '6px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer' }}>
                                    <Trash2 size={16} color="var(--color-danger)" />
                                </button>
                            )}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const StatusBadge = ({ status }: { status: string }) => {
    let color = 'var(--color-text-muted)';
    let bg = 'var(--color-background)';

    if (status === 'Aprobada') { color = 'var(--color-success)'; bg = 'rgba(34, 197, 94, 0.1)'; }
    if (status === 'Solicitada') { color = 'var(--color-warning)'; bg = 'rgba(234, 179, 8, 0.1)'; }
    if (status === 'Rechazada') { color = 'var(--color-danger)'; bg = 'rgba(239, 68, 68, 0.1)'; }

    return (
        <span style={{ color, backgroundColor: bg, padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 600 }}>
            {status}
        </span>
    );
};

export default VacationsPage;
