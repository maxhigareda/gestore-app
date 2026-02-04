import React from 'react';

interface QuickActionCardProps {
    title: string;
    icon: React.ReactNode;
    metricLabel: string;
    metricValue: string | number;
    buttonLabel: string;
    onButtonClick: () => void;
    color?: string; // Accent color
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({
    title,
    icon,
    metricLabel,
    metricValue,
    buttonLabel,
    onButtonClick,
    color = 'var(--color-primary)'
}) => {
    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius)',
            padding: '1.5rem',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    backgroundColor: 'var(--color-secondary-background)',
                    padding: '10px',
                    borderRadius: '8px',
                    color: color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    {icon}
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{title}</h3>
            </div>

            <div>
                <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{metricLabel}</span>
                <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
                    {metricValue}
                </div>
            </div>

            <button
                onClick={onButtonClick}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: color,
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'transform 0.1s',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                }}
                onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
                onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
                {buttonLabel}
            </button>
        </div>
    );
};

export default QuickActionCard;
