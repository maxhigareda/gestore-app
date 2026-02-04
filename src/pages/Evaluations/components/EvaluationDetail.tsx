import React from 'react';
import { Edit2, Eye } from 'lucide-react';
import { type Evaluation } from '../../../utils/mockEvaluations';
import Modal from '../../../components/Modal';
import EvaluationSurvey from './EvaluationSurvey';

interface EvaluationDetailProps {
    evaluation: Evaluation | null;
    onUpdate: (id: string, updates: Partial<Evaluation>) => void;
}

const EvaluationDetail: React.FC<EvaluationDetailProps> = ({ evaluation, onUpdate }) => {
    const [showModal, setShowModal] = React.useState(false);

    if (!evaluation) {
        return (
            <div style={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)'
            }}>
                Selecciona una evaluación para ver el detalle
            </div>
        );
    }

    const getScaleColor = (scale: string) => {
        switch (scale) {
            case 'Malo': return 'var(--color-danger)';
            case 'Regular': return 'var(--color-warning)'; // You might want a darker orange, using warning yellow/orange for now
            case 'Bueno': return '#FFD700'; // Gold/Yellow
            case 'Sobresaliente': return 'var(--color-success)';
            default: return 'var(--color-text-primary)';
        }
    };

    const scaleColor = getScaleColor(evaluation.scale);

    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius)',
            padding: '2rem',
            // height: '100%',
            border: '1px solid var(--border-color)'
        }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '2rem', fontWeight: 600 }}>Detalle de Evaluación</h3>

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left' }}>
                            <th style={thStyle}>Evaluado</th>
                            <th style={thStyle}>Estado</th>
                            <th style={thStyle}>Avance</th>
                            <th style={thStyle}>Nota</th>
                            <th style={thStyle}>Escala</th>
                            <th style={thStyle}>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={tdStyle}>{evaluation.evaluatedPerson}</td>
                            <td style={tdStyle}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: 600,
                                    backgroundColor: evaluation.status === 'Finalizada' ? 'rgba(0, 202, 114, 0.2)' : 'rgba(150, 153, 166, 0.2)',
                                    color: evaluation.status === 'Finalizada' ? 'var(--color-success)' : 'var(--color-text-muted)',
                                }}>
                                    {evaluation.status}
                                </span>
                            </td>
                            <td style={tdStyle}>{evaluation.progress.toFixed(1)} %</td>
                            <td style={tdStyle}>{evaluation.score.toFixed(2)}</td>
                            <td style={tdStyle}>
                                <span style={{ fontWeight: bold, color: scaleColor }}>
                                    {evaluation.scale}
                                </span>
                            </td>
                            <td style={tdStyle}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {evaluation.status === 'Pendiente' && (
                                        <div onClick={() => setShowModal(true)}>
                                            <ActionIcon icon={<Edit2 size={18} />} title="Editar" />
                                        </div>
                                    )}
                                    <div onClick={() => setShowModal(true)}>
                                        <ActionIcon icon={<Eye size={18} />} title="Ver" />
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={evaluation.title}
            >
                <EvaluationSurvey
                    evaluation={evaluation}
                    onClose={() => setShowModal(false)}
                    onSubmit={onUpdate}
                />
            </Modal>
        </div>
    );
};

// Styles
const thStyle: React.CSSProperties = {
    padding: '12px 16px',
    color: 'var(--color-text-muted)',
    fontWeight: 500,
    fontSize: '0.85rem'
};

const tdStyle: React.CSSProperties = {
    padding: '16px',
    color: 'var(--color-text-primary)'
};

const bold: React.CSSProperties['fontWeight'] = 600;

const ActionIcon: React.FC<{ icon: React.ReactNode, title: string }> = ({ icon, title }) => (
    <button
        title={title}
        style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'var(--color-hover)'; e.currentTarget.style.color = 'var(--color-primary)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--color-text-secondary)'; }}
    >
        {icon}
    </button>
);

export default EvaluationDetail;
