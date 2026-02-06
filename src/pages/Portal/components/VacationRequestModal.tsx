import React, { useState, useEffect } from 'react';

interface VacationRequestModalProps {
    balance: number;
    onClose: () => void;
    onSuccess: () => void;
}

const VacationRequestModal: React.FC<VacationRequestModalProps> = ({ balance, onClose, onSuccess }) => {
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

    const isValid = daysRequested > 0 && daysRequested <= balance;
    const isOverBalance = daysRequested > balance;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isValid) return;
        onSuccess();
    };

    return (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', minWidth: '400px' }}>

            {/* Header Info */}
            <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>Días disponibles</p>
                <h2 style={{ fontSize: '2rem', color: 'var(--color-primary)' }}>{balance}</h2>
            </div>

            {/* Date Inputs */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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

            {/* Validation Message */}
            {startDate && endDate && (
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
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }}
                    placeholder="Escribe un comentario opcional..."
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
                    disabled={!isValid}
                    style={{
                        ...primaryButtonStyle,
                        opacity: isValid ? 1 : 0.5,
                        cursor: isValid ? 'pointer' : 'not-allowed'
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

export default VacationRequestModal;
