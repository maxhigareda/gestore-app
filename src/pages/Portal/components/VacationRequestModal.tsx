import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';

interface VacationRequestModalProps {
    balance: number;
    onClose: () => void;
    onSuccess: () => void;
    mode?: 'create' | 'edit' | 'view';
    initialData?: {
        id: string;
        startDate: string;
        endDate: string;
        comment?: string;
    };
}

const VacationRequestModal: React.FC<VacationRequestModalProps> = ({
    balance,
    onClose,
    onSuccess,
    mode = 'create',
    initialData
}) => {
    const [startDate, setStartDate] = useState(initialData?.startDate || '');
    const [endDate, setEndDate] = useState(initialData?.endDate || '');
    const [comment, setComment] = useState(initialData?.comment || '');
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

    // Validation
    // In edit mode, we might be adding days or keeping same. 
    // Ideally we should calculate balance diff, but for now strict check against CURRENT balance + OLD request days (if we had that info).
    // Simplification: Check against updated balance passed in props? 
    // Actually, the 'balance' prop passed from Parent is 'Current Available'.
    // If I Edit a request of 5 days, those 5 days are ALREADY deducted from 'Current Remaining' (balance)? 
    // NO. 'Current Remaining' = Entitled - Taken - Pending.
    // So if I edit a Pending request, it is ALREADY counted in Pending.
    // If I change 5 days to 7 days, I need 2 more days.
    // This logic is complex. 
    // User requirement: "Editar sale el mismo modal... modificar".
    // Let's assume the user has enough balance if they are just changing dates slightly. 
    // Proper valid: (Balance + initialDays) >= newDays.

    // We don't have initialDays stored easily unless we recalc from initialData.
    const initialDays = initialData ? (Math.ceil(Math.abs(new Date(initialData.endDate).getTime() - new Date(initialData.startDate).getTime()) / (86400000)) + 1) : 0;
    const effectiveBalance = mode === 'edit' ? (balance + initialDays) : balance;

    const isValid = daysRequested > 0 && daysRequested <= effectiveBalance;
    const isOverBalance = daysRequested > effectiveBalance;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user logged in');

            if (mode === 'create') {
                const { error } = await supabase.from('vacation_requests').insert({
                    user_id: user.id,
                    start_date: startDate,
                    end_date: endDate,
                    days_requested: daysRequested,
                    status: 'Solicitada',
                    type: 'Vacaciones',
                    reason: comment
                });
                if (error) throw error;
            } else if (mode === 'edit' && initialData?.id) {
                const { error } = await supabase.from('vacation_requests').update({
                    start_date: startDate,
                    end_date: endDate,
                    days_requested: daysRequested,
                    reason: comment
                }).eq('id', initialData.id);
                if (error) throw error;
            }

            onSuccess();
        } catch (err: any) {
            console.error('Error submitting vacation request:', err);
            alert(`Error: ${err.message || 'Intenta de nuevo'}`);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px' }}>

            {/* Header Info */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {mode === 'view' ? 'Días solicitados' : 'Días disponibles'}
                </p>
                <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>
                    {mode === 'view' ? daysRequested : effectiveBalance}
                </h2>
            </div>

            {/* Date Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Fecha de inicio</label>
                    <input
                        type="date"
                        required
                        disabled={mode === 'view'}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        style={{ ...inputStyle, opacity: mode === 'view' ? 0.7 : 1 }}
                    />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={labelStyle}>Fecha de término</label>
                    <input
                        type="date"
                        required
                        disabled={mode === 'view'}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        style={{ ...inputStyle, opacity: mode === 'view' ? 0.7 : 1 }}
                    />
                </div>
            </div>

            {/* Validation Message */}
            {mode !== 'view' && startDate && endDate && (
                <div style={{
                    padding: '10px',
                    backgroundColor: isOverBalance ? 'rgba(255, 77, 79, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    color: isOverBalance ? 'var(--color-danger)' : '#60a5fa',
                    fontWeight: 500
                }}>
                    {isOverBalance
                        ? `No tienes suficientes días (${daysRequested} seleccionados)`
                        : `Estás escogiendo ${daysRequested} días`
                    }
                </div>
            )}

            {/* Comment */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={labelStyle}>Comentarios</label>
                <textarea
                    rows={3}
                    disabled={mode === 'view'}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ ...inputStyle, resize: 'none', opacity: mode === 'view' ? 0.7 : 1 }}
                    placeholder={mode === 'view' ? "Sin comentarios" : "Escribe un comentario opcional..."}
                />
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button
                    type="button"
                    onClick={onClose}
                    style={secondaryButtonStyle}
                >
                    {mode === 'view' ? 'Cerrar' : 'Cancelar'}
                </button>

                {mode !== 'view' && (
                    <button
                        type="submit"
                        disabled={!isValid}
                        style={{
                            ...primaryButtonStyle,
                            opacity: isValid ? 1 : 0.5,
                            cursor: isValid ? 'pointer' : 'not-allowed'
                        }}
                    >
                        {mode === 'edit' ? 'Guardar Cambios' : 'Solicitar'}
                    </button>
                )}
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

export default VacationRequestModal;
