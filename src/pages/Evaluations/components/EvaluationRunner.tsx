import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { useAuth } from '../../../context/AuthContext';
import { CheckCircle, X, ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface Question {
    id: string;
    text: string;
    type: string;
    options: string[] | null;
    points: number;
    correct_answer: string;
}

interface EvaluationRunnerProps {
    evaluationId: string;
    evaluationTitle: string;
    onClose: () => void;
    onComplete: () => void;
}

const EvaluationRunner: React.FC<EvaluationRunnerProps> = ({ evaluationId, evaluationTitle, onClose, onComplete }) => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<{ score: number, max: number } | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, [evaluationId]);

    const fetchQuestions = async () => {
        try {
            const { data, error } = await supabase
                .from('questions')
                .select('*')
                .eq('evaluation_id', evaluationId);

            if (error) throw error;
            setQuestions(data || []);
        } catch (error) {
            console.error("Error fetching questions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionSelect = (qId: string, value: string) => {
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const calculateScore = () => {
        let total = 0;
        let max = 0;

        questions.forEach(q => {
            max += q.points;
            const userAnswer = answers[q.id];
            // Simple case-insensitive match for now. Improve logic for complex types if needed.
            if (userAnswer && userAnswer.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim()) {
                total += q.points;
            }
        });

        return { total, max };
    };

    const handleSubmit = async () => {
        if (!user) return;
        setSubmitting(true);
        const { total, max } = calculateScore();

        try {
            // 1. Create Response (Attempt)
            const { data: responseData, error: respError } = await supabase
                .from('responses')
                .insert({
                    evaluation_id: evaluationId,
                    user_id: user.id,
                    total_score: total,
                    max_score: max,
                    status: 'completed'
                })
                .select()
                .single();

            if (respError) throw respError;

            // 2. Create detailed Answers (Optional but good for analytics)
            const answersToInsert = questions.map(q => ({
                response_id: responseData.id,
                question_id: q.id,
                answer_text: answers[q.id] || '',
                points_awarded: (answers[q.id]?.toLowerCase().trim() === q.correct_answer?.toLowerCase().trim()) ? q.points : 0
            }));

            const { error: ansError } = await supabase.from('answers').insert(answersToInsert);
            if (ansError) throw ansError;

            setResult({ score: total, max });

        } catch (error) {
            console.error("Error submitting exam:", error);
            alert("Error al enviar el examen.");
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>Cargando preguntas...</div>;

    if (questions.length === 0) return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'white' }}>
            <h3>Esta evaluación no tiene preguntas configuradas.</h3>
            <button onClick={onClose} style={{ marginTop: '1rem', padding: '8px 16px' }}>Cerrar</button>
        </div>
    );

    // Result View
    if (result) {
        const percentage = Math.round((result.score / result.max) * 100);
        const isPassing = percentage >= 80; // Arbitrary pass mark

        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                backgroundColor: 'var(--color-background)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200
            }}>
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: '3rem',
                    borderRadius: 'var(--border-radius)',
                    textAlign: 'center',
                    maxWidth: '500px',
                    width: '90%',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--border-color)'
                }}>
                    {isPassing ?
                        <CheckCircle size={64} color="#10b981" style={{ marginBottom: '1rem' }} /> :
                        <AlertCircle size={64} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                    }

                    <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{percentage}%</h2>
                    <p style={{ fontSize: '1.2rem', color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>
                        Puntaje: {result.score} / {result.max}
                    </p>

                    <p style={{ marginBottom: '2rem' }}>
                        {isPassing ? '¡Felicidades! Has aprobado la evaluación.' : 'Has completado la evaluación.'}
                    </p>

                    <button
                        onClick={onComplete}
                        style={{
                            padding: '12px 24px',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Finalizar
                    </button>
                </div>
            </div>
        );
    }

    // Question Runner View
    const currentQ = questions[currentStep];
    const progress = Math.round(((currentStep + 1) / questions.length) * 100);

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)', // Backdrop
            zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                width: '100%', maxWidth: '700px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh',
                overflow: 'hidden',
                position: 'relative',
                border: '1px solid var(--border-color)'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--color-surface)' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem' }}>{evaluationTitle}</h3>
                        <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                            Pregunta {currentStep + 1} de {questions.length} ({progress}%)
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--color-text-secondary)'
                        }}
                        title="Cerrar Evaluación"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '6px', backgroundColor: 'var(--color-border)', width: '100%' }}>
                    <div style={{ height: '100%', width: `${progress}%`, backgroundColor: 'var(--color-primary)', transition: 'width 0.3s ease-out' }} />
                </div>

                {/* Content - Scrollable */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <div style={{ width: '100%' }}>
                        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', lineHeight: '1.5' }}>
                            {currentQ.text}
                        </h2>

                        {currentQ.type === 'multiple_choice' && currentQ.options ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {currentQ.options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleOptionSelect(currentQ.id, option)}
                                        style={{
                                            padding: '1rem',
                                            textAlign: 'left',
                                            borderRadius: '8px',
                                            border: `2px solid ${answers[currentQ.id] === option ? 'var(--color-primary)' : 'var(--border-color)'}`,
                                            backgroundColor: answers[currentQ.id] === option ? 'rgba(59, 130, 246, 0.1)' : 'var(--color-background)',
                                            color: 'var(--color-text-primary)',
                                            fontSize: '1rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            fontWeight: answers[currentQ.id] === option ? 600 : 400
                                        }}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <textarea
                                value={answers[currentQ.id] || ''}
                                onChange={e => handleOptionSelect(currentQ.id, e.target.value)}
                                placeholder="Escribe tu respuesta aquí..."
                                rows={5}
                                style={{
                                    width: '100%',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--color-background)',
                                    color: 'var(--color-text-primary)',
                                    fontSize: '1rem',
                                    lineHeight: '1.5',
                                    resize: 'vertical'
                                }}
                            />
                        )}
                    </div>
                </div>

                {/* Footer Navigation - Directly below content in the card */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--color-surface)', display: 'flex', justifyContent: 'space-between' }}>
                    <button
                        onClick={() => setCurrentStep(prev => Math.max(0, prev - 1))}
                        disabled={currentStep === 0}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border-color)',
                            background: 'transparent', color: 'var(--color-text-primary)', cursor: currentStep === 0 ? 'not-allowed' : 'pointer', opacity: currentStep === 0 ? 0.5 : 1
                        }}
                    >
                        <ArrowLeft size={18} /> Anterior
                    </button>

                    {currentStep < questions.length - 1 ? (
                        <button
                            onClick={() => setCurrentStep(prev => Math.min(questions.length - 1, prev + 1))}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 24px', borderRadius: '6px', border: 'none',
                                backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer',
                                fontWeight: 600
                            }}
                        >
                            Siguiente <ArrowRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px',
                                padding: '10px 24px', borderRadius: '6px', border: 'none',
                                backgroundColor: '#10b981', color: 'white', cursor: 'pointer',
                                fontWeight: 600, opacity: submitting ? 0.7 : 1
                            }}
                        >
                            {submitting ? 'Enviando...' : 'Finalizar Evaluación'} <Save size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EvaluationRunner;
