import React, { useState } from 'react';
import { type Evaluation } from '../../../utils/mockEvaluations';

interface EvaluationSurveyProps {
    evaluation: Evaluation;
    onClose: () => void;
    onSubmit: (id: string, updates: Partial<Evaluation>) => void;
}

const EvaluationSurvey: React.FC<EvaluationSurveyProps> = ({ evaluation, onClose, onSubmit }) => {
    const isReadOnly = evaluation.status === 'Finalizada';

    // Local state for form fields
    // In a real app, these would come from the evaluation data. 
    // For now, initializing with defaults or "saved" values if finalized.
    const [answers, setAnswers] = useState({
        strengths: isReadOnly ? 'Excelente capacidad de análisis y resolución de problemas.' : '',
        weaknesses: isReadOnly ? 'Podría mejorar en la comunicación proactiva con el equipo.' : '',
        rating: isReadOnly ? evaluation.score : 85 // Default start rating
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;

        // Calculate mock score/scale update
        let newScale: Evaluation['scale'] = 'Malo';
        if (answers.rating > 75) newScale = 'Sobresaliente';
        else if (answers.rating > 50) newScale = 'Bueno';
        else if (answers.rating > 25) newScale = 'Regular';

        onSubmit(evaluation.id, {
            status: 'Finalizada',
            progress: 100,
            score: answers.rating,
            scale: newScale
        });
        onClose();
    };

    return (
        <div>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bienvenido {evaluation.evaluatedPerson.split(' ')[0]}</h2>
                <p style={{ color: 'var(--color-text-paragraph)' }}>
                    {isReadOnly
                        ? 'Esta evaluación ha sido finalizada. Aquí puedes consultar tus resultados.'
                        : 'Te invitamos a contestar tu evaluación de desempeño. Tus respuestas son confidenciales.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                {/* Question 1 */}
                <div className="form-group">
                    <label style={labelStyle}>1. Principales Fortalezas</label>
                    <textarea
                        required
                        disabled={isReadOnly}
                        value={answers.strengths}
                        onChange={(e) => setAnswers({ ...answers, strengths: e.target.value })}
                        rows={4}
                        style={{
                            ...inputStyle,
                            opacity: isReadOnly ? 0.7 : 1,
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                        }}
                        placeholder="Describe las principales fortalezas demostradas en el periodo..."
                    />
                </div>

                {/* Question 2 */}
                <div className="form-group">
                    <label style={labelStyle}>2. Áreas de Oportunidad</label>
                    <textarea
                        required
                        disabled={isReadOnly}
                        value={answers.weaknesses}
                        onChange={(e) => setAnswers({ ...answers, weaknesses: e.target.value })}
                        rows={4}
                        style={{
                            ...inputStyle,
                            opacity: isReadOnly ? 0.7 : 1,
                            cursor: isReadOnly ? 'not-allowed' : 'text'
                        }}
                        placeholder="Menciona áreas donde se requiere desarrollo..."
                    />
                </div>

                {/* Question 3: Rating */}
                <div className="form-group">
                    <label style={labelStyle}>3. Autoevaluación General (0-100)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            disabled={isReadOnly}
                            value={answers.rating}
                            onChange={(e) => setAnswers({ ...answers, rating: parseInt(e.target.value) })}
                            style={{ flex: 1, cursor: isReadOnly ? 'not-allowed' : 'pointer' }}
                        />
                        <span style={{
                            fontWeight: 'bold',
                            fontSize: '1.2rem',
                            color: 'var(--color-primary)',
                            minWidth: '3rem',
                            textAlign: 'center'
                        }}>
                            {answers.rating}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    marginTop: '1rem',
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '1rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid var(--border-color)'
                }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--color-text-primary)',
                            cursor: 'pointer'
                        }}
                    >
                        {isReadOnly ? 'Cerrar' : 'Cancelar'}
                    </button>

                    {!isReadOnly && (
                        <button
                            type="submit"
                            style={{
                                padding: '10px 24px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }}
                        >
                            Enviar Evaluación
                        </button>
                    )}
                </div>

            </form>
        </div>
    );
};

const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 500,
    color: 'var(--color-text-primary)'
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-secondary-background)',
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit',
    resize: 'vertical'
};

export default EvaluationSurvey;
