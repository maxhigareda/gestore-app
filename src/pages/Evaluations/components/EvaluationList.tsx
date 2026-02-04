import React from 'react';
import { type Evaluation } from '../../../utils/mockEvaluations';

interface EvaluationListProps {
    evaluations: Evaluation[];
    selectedId: string | null;
    onSelect: (id: string) => void;
}

const EvaluationList: React.FC<EvaluationListProps> = ({ evaluations, selectedId, onSelect }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, paddingLeft: '0.5rem' }}>Mis Evaluaciones</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {evaluations.map((ev) => (
                    <div
                        key={ev.id}
                        onClick={() => onSelect(ev.id)}
                        style={{
                            padding: '1rem',
                            backgroundColor: selectedId === ev.id ? 'var(--color-hover)' : 'var(--color-secondary-background)',
                            borderRadius: 'var(--border-radius)',
                            border: selectedId === ev.id ? '1px solid var(--color-primary)' : '1px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                            <h4 style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                                {ev.title}
                            </h4>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                {ev.assignor}
                            </span>
                            <span style={{
                                fontSize: '0.75rem',
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontWeight: 600,
                                backgroundColor: ev.status === 'Finalizada' ? 'rgba(0, 202, 114, 0.2)' : 'rgba(150, 153, 166, 0.2)',
                                color: ev.status === 'Finalizada' ? 'var(--color-success)' : 'var(--color-text-muted)'
                            }}>
                                {ev.status}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EvaluationList;
