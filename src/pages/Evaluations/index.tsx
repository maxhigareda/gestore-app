import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Plus, CheckCircle, ExternalLink } from 'lucide-react';
import AddEvaluationModal from './components/AddEvaluationModal';
import EvaluationRunner from './components/EvaluationRunner';

interface Evaluation {
    id: string;
    title: string;
    description: string;
    target_area: string;
    created_at: string;
}

const EvaluationsPage: React.FC = () => {
    const { user } = useAuth();
    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userArea, setUserArea] = useState('General');
    const [activeExam, setActiveExam] = useState<Evaluation | null>(null);

    useEffect(() => {
        fetchUserArea();
    }, [user]);

    useEffect(() => {
        if (userArea) {
            fetchEvaluations();
        }
    }, [userArea]);

    const fetchUserArea = async () => {
        if (!user) return;
        try {
            const { data } = await supabase
                .from('profiles')
                .select('department')
                .eq('id', user.id)
                .single();

            if (data) {
                setUserArea(data.department || 'General');
            }
        } catch (e) {
            console.error("Could not fetch user area", e);
        }
    };

    const fetchEvaluations = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('evaluations')
                .select('*')
                .or(`target_area.eq.General,target_area.eq.${userArea}`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setEvaluations(data || []);
        } catch (error) {
            console.error('Error fetching evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ height: 'calc(100vh - var(--topbar-height, 60px) - 40px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{
                padding: '0 0.5rem 1.5rem 0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Mis Evaluaciones</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Encuestas asignadas a tu área: <strong>{userArea}</strong>
                    </p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        cursor: 'pointer'
                    }}
                >
                    <Plus size={18} />
                    Importar Evaluación
                </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
                {loading ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>Cargando...</div>
                ) : evaluations.length === 0 ? (
                    <div style={{
                        padding: '3rem',
                        textAlign: 'center',
                        backgroundColor: 'var(--color-surface)',
                        borderRadius: 'var(--border-radius)',
                        border: '1px solid var(--border-color)'
                    }}>
                        <CheckCircle size={48} style={{ color: 'var(--color-success)', marginBottom: '1rem', opacity: 0.5 }} />
                        <h3>¡Todo al día!</h3>
                        <p style={{ color: 'var(--color-text-muted)' }}>No tienes evaluaciones pendientes por ahora.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                        {evaluations.map(eva => (
                            <div key={eva.id} style={{
                                backgroundColor: 'var(--color-surface)',
                                borderRadius: 'var(--border-radius)',
                                border: '1px solid var(--border-color)',
                                padding: '1.5rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                transition: 'transform 0.2s',
                                boxShadow: 'var(--shadow-sm)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <span style={{
                                        fontSize: '0.75rem',
                                        textTransform: 'uppercase',
                                        fontWeight: 600,
                                        color: 'var(--color-primary)',
                                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                        padding: '2px 8px',
                                        borderRadius: '4px'
                                    }}>
                                        {eva.target_area}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                        {new Date(eva.created_at).toLocaleDateString()}
                                    </span>
                                </div>

                                <div>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>{eva.title}</h3>
                                    <p style={{ fontSize: '0.9rem', color: 'var(--color-text-paragraph)' }}>
                                        {eva.description}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setActiveExam(eva)}
                                    style={{
                                        marginTop: 'auto',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '8px',
                                        padding: '10px',
                                        backgroundColor: 'var(--color-primary)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        fontWeight: 500,
                                        cursor: 'pointer',
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    Contestar Ahora
                                    <ExternalLink size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {isModalOpen && (
                <AddEvaluationModal
                    onClose={() => setIsModalOpen(false)}
                    onSuccess={fetchEvaluations}
                />
            )}

            {activeExam && (
                <EvaluationRunner
                    evaluationId={activeExam.id}
                    evaluationTitle={activeExam.title}
                    onClose={() => setActiveExam(null)}
                    onComplete={() => {
                        setActiveExam(null);
                        fetchEvaluations();
                    }}
                />
            )}
        </div>
    );
};

export default EvaluationsPage;
