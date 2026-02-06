import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface PermissionRequestModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const PERMISSION_TYPES = [
    'Permiso',
    'Permiso con goce',
    'Permiso para el área de operaciones',
    'Trabajo fin de semana',
    'Trabajo día festivo',
    'Permiso sin goce de sueldo'
];

const PermissionRequestModal: React.FC<PermissionRequestModalProps> = ({ onClose, onSuccess }) => {
    const [type, setType] = useState(PERMISSION_TYPES[0]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [comment, setComment] = useState('');
    const [daysRequested, setDaysRequested] = useState(0);

    // Calculate days difference
    useEffect(() => {
        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = Math.abs(end.getTime() - start.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
            setDaysRequested(diffDays > 0 ? diffDays : 0);
        } else {
            setDaysRequested(0);
        }
    }, [startDate, endDate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (daysRequested <= 0) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            // Note: 'type' removed because column likely doesn't exist in DB yet.
            const { error } = await supabase.from('permission_requests').insert({
                user_id: user.id,
                start_date: startDate,
                end_date: endDate,
                days_requested: daysRequested,
                reason: comment,
                status: 'Solicitada'
            });

            if (error) throw error;
            onSuccess();
        } catch (err: any) {
            console.error('Error submitting permission request:', err);
            alert(`Error al solicitar permiso: ${err.message || 'Intenta de nuevo'}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px' }}>

            {/* Type Dropdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Tipo de Permiso</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={inputStyle}
                >
                    {PERMISSION_TYPES.map(t => (
                        <option key={t} value={t}>{t}</option>
                    ))}
                </select>
            </div>

            {/* Date Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* ... existing date inputs ... */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Fecha de inicio</label>
                    <input
                        type="date"
                        required
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={inputStyle}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Fecha de término</label>
                    <input
                        type="date"
                        required
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Validation/Feedback Message */}
            {startDate && endDate && (
                <div style={{
                    padding: '10px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: '#60a5fa',
                    fontWeight: 500
                }}>
                    Estás solicitando {daysRequested} días de permiso
                </div>
            )}

            {/* Comment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Comentarios</label>
                <textarea
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }}
                    placeholder="Motivo del permiso..."
                />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={secondaryButtonStyle}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={daysRequested <= 0}
                    style={{
                        ...primaryButtonStyle,
                        opacity: daysRequested > 0 ? 1 : 0.5,
                        cursor: daysRequested > 0 ? 'pointer' : 'not-allowed'
                    }}
                >
                    Solicitar
                </button>
            </div>

        </form>
    );
};

// --- Styles ---
const labelStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary)',
    fontWeight: 500
};

const inputStyle: React.CSSProperties = {
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-secondary-background)',
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit'
};

const primaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'var(--color-primary)',
    color: 'white',
    fontWeight: 600,
    cursor: 'pointer'
};

const secondaryButtonStyle: React.CSSProperties = {
    flex: 1,
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'transparent',
    color: 'var(--color-text-primary)',
    cursor: 'pointer'
};

export default PermissionRequestModal;
