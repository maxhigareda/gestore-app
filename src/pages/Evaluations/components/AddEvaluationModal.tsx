import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

interface AddEvaluationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AREAS = [
    'General',
    'Desarrollo',
    'Operaciones',
    'Gerencia',
    'Low Code Solutions',
    'BI',
    'Ing de Datos'
];

const AddEvaluationModal: React.FC<AddEvaluationModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [formUrl, setFormUrl] = useState('');
    const [targetArea, setTargetArea] = useState('Desarrollo');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const { error } = await supabase.from('evaluations').insert({
                title,
                description,
                form_url: formUrl,
                target_area: targetArea,
                created_by: user?.id
            });

            if (error) throw error;
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Error adding evaluation:', error);
            alert('Error al guardar la evaluación.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(3px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--border-radius)',
                width: '100%',
                maxWidth: '500px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)',
                overflow: 'hidden'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Nueva Evaluación</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Title */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Título de la Evaluación</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ej. Evaluación de Clima Laboral Q1"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Descripción</label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Breve descripción del propósito..."
                            rows={3}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-primary)',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Google Form URL */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Link de Google Forms</label>
                        <input
                            type="url"
                            required
                            value={formUrl}
                            onChange={e => setFormUrl(e.target.value)}
                            placeholder="https://docs.google.com/forms/..."
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-primary)'
                            }}
                        />
                    </div>

                    {/* Area Select */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: 500 }}>Área Objetivo</label>
                        <select
                            value={targetArea}
                            onChange={e => setTargetArea(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid var(--border-color)',
                                backgroundColor: 'var(--color-background)',
                                color: 'var(--color-text-primary)'
                            }}
                        >
                            {AREAS.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ padding: '10px 16px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
                        >
                            {isSubmitting ? 'Guardando...' : 'Crear Evaluación'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default AddEvaluationModal;
