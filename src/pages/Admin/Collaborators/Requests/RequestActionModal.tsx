import React, { useState } from 'react';
import { X, Check, XCircle } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import type { UnifiedRequest } from './index';
import ConfirmationModal from '../../../../components/ConfirmationModal';

interface RequestActionModalProps {
    request: UnifiedRequest;
    onClose: () => void;
    onUpdate: () => void;
    mode: 'viewer' | 'supervisor'; // 'viewer' = Read Only, 'supervisor' = Can Approve/Reject
}

const RequestActionModal: React.FC<RequestActionModalProps> = ({ request, onClose, onUpdate, mode }) => {
    const [action, setAction] = useState<'Approve' | 'Reject' | null>(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleActionClick = (act: 'Approve' | 'Reject') => {
        setAction(act);
        setConfirmOpen(true);
    };

    const confirmAction = async () => {
        if (!action) return;
        setProcessing(true);
        try {
            const table = request.type === 'vacation' ? 'vacation_requests' : 'permission_requests';
            const status = action === 'Approve' ? 'Aprobada' : 'Rechazada';

            // For now, we update status. Ideally we append comments to a 'supervisor_comment' field.
            // Current schema might not have it. We'll check.
            // If not, we just update status for MVP.

            const { error } = await supabase
                .from(table)
                .update({ status: status })
                .eq('id', request.id);

            if (error) throw error;

            onUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Error al actualizar la solicitud.');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '500px', width: '100%',
                maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Detalle de Solicitud</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={24} /></button>
                </div>

                <div style={{ display: 'grid', gap: '1rem', marginBottom: '2rem' }}>
                    <DetailRow label="Tipo" value={request.requestType} />
                    <DetailRow label="Colaborador" value={request.userName} />
                    <DetailRow label="Desde" value={new Date(request.startDate).toLocaleDateString()} />
                    <DetailRow label="Hasta" value={new Date(request.endDate).toLocaleDateString()} />
                    <DetailRow label="Duración" value={`${request.days} días`} />
                    <DetailRow label="Motivo/Comentario" value={request.reason || 'Sin comentarios'} />
                    <DetailRow label="Estado Actual" value={request.status} />
                </div>

                {mode === 'supervisor' && request.status === 'Solicitada' && (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={() => handleActionClick('Reject')}
                            disabled={processing}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--color-error)',
                                backgroundColor: 'transparent', color: 'var(--color-error)', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <XCircle size={18} /> Rechazar
                        </button>
                        <button
                            onClick={() => handleActionClick('Approve')}
                            disabled={processing}
                            style={{
                                flex: 1, padding: '12px', borderRadius: '8px', border: 'none',
                                backgroundColor: 'var(--color-success)', color: 'white', fontWeight: 600, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                            }}
                        >
                            <Check size={18} /> Aprobar
                        </button>
                    </div>
                )}
            </div>

            <ConfirmationModal
                isOpen={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={confirmAction}
                title={`Confirmar ${action === 'Approve' ? 'Aprobación' : 'Rechazo'}`}
                message={`¿Estás seguro de que deseas ${action === 'Approve' ? 'aprobar' : 'rechazar'} esta solicitud?`}
                type={action === 'Approve' ? 'info' : 'danger'} // Green info for approve? logic says info=blue, let's use info for now.
                confirmText={action === 'Approve' ? 'Aprobar' : 'Rechazar'}
            />
        </div>
    );
};

const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{label}</span>
        <span style={{ fontSize: '1rem', fontWeight: 500 }}>{value}</span>
    </div>
);

export default RequestActionModal;
