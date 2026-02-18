import React, { useState } from 'react';
import { useAuth } from '../../../../context/AuthContext';
// import { supabase } from '../../../../lib/supabaseClient'; // Removed as logic moved to hook
import { Eye, Calendar, Search } from 'lucide-react';
import RequestActionModal from './RequestActionModal';
import { useUnifiedRequests, type UnifiedRequest } from '../../../../hooks/useUnifiedRequests';

const RequestsPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'pending' | 'my_requests' | 'all'>('pending');
    const { requests, loading, fetchRequests } = useUnifiedRequests();
    const [selectedRequest, setSelectedRequest] = useState<UnifiedRequest | null>(null);

    // Filters for 'All' tab
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Solicitada' | 'Aprobada' | 'Rechazada'>('All');

    // Filter Logic
    const getFilteredRequests = () => {
        let filtered = requests;

        if (activeTab === 'pending') {
            // "Mis Pendientes": 
            // 1. Status is 'Solicitada'
            // 2. I am the manager (manager_id matches my ID)
            filtered = filtered.filter(r =>
                r.status === 'Solicitada' &&
                r.managerId === user?.id
            );
        } else if (activeTab === 'my_requests') {
            // "Mis Solicitudes": Created by Me
            filtered = filtered.filter(r => r.userId === user?.id);
        } else if (activeTab === 'all') {
            // "Todas": Apply search/status filters
            if (statusFilter !== 'All') {
                filtered = filtered.filter(r => r.status === statusFilter);
            }
            if (searchTerm) {
                const lower = searchTerm.toLowerCase();
                filtered = filtered.filter(r =>
                    r.userName.toLowerCase().includes(lower) ||
                    r.requestType.toLowerCase().includes(lower)
                );
            }
        }

        return filtered;
    };

    const displayRequests = getFilteredRequests();

    const getStatusBadge = (status: string) => {
        let color = 'var(--color-text-muted)';
        let bg = 'rgba(150, 153, 166, 0.2)';
        if (status === 'Aprobada' || status === 'Aprobado') { color = 'var(--color-success)'; bg = 'rgba(0, 202, 114, 0.2)'; }
        else if (status === 'Solicitada') { color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.2)'; }
        else if (status === 'Rechazada') { color = 'var(--color-error)'; bg = 'rgba(255, 77, 77, 0.2)'; }

        return <span style={{ padding: '4px 12px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: bg, color: color }}>{status}</span>;
    };

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Gestión de Solicitudes</h1>
                <p style={{ color: 'var(--color-text-muted)' }}>Administra vacaciones y permisos de colaboradores.</p>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
                <TabButton active={activeTab === 'pending'} onClick={() => setActiveTab('pending')} label="Mis Pendientes" />
                <TabButton active={activeTab === 'my_requests'} onClick={() => setActiveTab('my_requests')} label="Mis Solicitudes" />
                <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')} label="Todas" />
            </div>

            {/* Toolbar for "Todas" */}
            {activeTab === 'all' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', minWidth: '300px' }}>
                        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por colaborador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                    >
                        <option value="All">Todos los estados</option>
                        <option value="Solicitada">Solicitada</option>
                        <option value="Aprobada">Aprobada</option>
                        <option value="Rechazada">Rechazada</option>
                    </select>
                </div>
            )}

            {/* Table */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead style={{ backgroundColor: 'var(--color-secondary-background)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                <th style={{ padding: '1rem' }}>Título</th>
                                <th style={{ padding: '1rem' }}>Solicitante</th>
                                <th style={{ padding: '1rem' }}>Fecha Inicio</th>
                                <th style={{ padding: '1rem' }}>Días</th>
                                <th style={{ padding: '1rem' }}>Estado</th>
                                <th style={{ padding: '1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Cargando solicitudes...</td></tr>
                            ) : displayRequests.length === 0 ? (
                                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No hay solicitudes en esta sección.</td></tr>
                            ) : (
                                displayRequests.map((req) => (
                                    <tr key={`${req.type}-${req.id}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{req.requestType}</td>
                                        <td style={{ padding: '1rem' }}>{req.userName}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Calendar size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                {new Date(req.startDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{req.days}</td>
                                        <td style={{ padding: '1rem' }}>{getStatusBadge(req.status)}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button
                                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                                                title="Ver Detalles"
                                                onClick={() => { /* Open Modal */ }}
                                            >
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedRequest && (
                <RequestActionModal
                    request={selectedRequest}
                    onClose={() => setSelectedRequest(null)}
                    onUpdate={fetchRequests}
                    mode={activeTab === 'pending' ? 'supervisor' : 'viewer'}
                />
            )}
        </div>
    );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
    <button
        onClick={onClick}
        style={{
            padding: '1rem 0',
            background: 'none',
            border: 'none',
            borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: active ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: active ? 600 : 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontSize: '1rem'
        }}
    >
        {label}
    </button>
);

export default RequestsPage;
