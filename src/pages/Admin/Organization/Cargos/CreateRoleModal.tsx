import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X } from 'lucide-react';

interface CreateRoleModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, onSuccess }) => {
    const [areas, setAreas] = useState<string[]>([]);
    const [selectedArea, setSelectedArea] = useState(''); // 'new_area' or existing name
    const [newAreaName, setNewAreaName] = useState('');
    const [roleName, setRoleName] = useState('');
    const [generatedId, setGeneratedId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAreas();
        setGeneratedId(crypto.randomUUID());
    }, []);

    const fetchAreas = async () => {
        // Fetch distinct departments from job_titles
        const { data, error } = await supabase
            .from('job_titles')
            .select('department')
            .order('department', { ascending: true });

        if (data) {
            const distinct = Array.from(new Set(data.map(d => d.department)));
            setAreas(distinct);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const department = selectedArea === 'new_area' ? newAreaName : selectedArea;

        if (!department || !roleName) {
            alert('Por favor completa todos los campos.');
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase
                .from('job_titles')
                .insert({
                    id: generatedId,
                    name: roleName,
                    department: department,
                    company: 'The Store Intelligence'
                });

            if (error) throw error;
            onSuccess();
        } catch (error) {
            console.error('Error creating role:', error);
            alert('Error al crear el cargo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)', padding: '2rem', borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)', maxWidth: '500px', width: '100%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Crear Nuevo Cargo</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Area Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Área (Departamento)</label>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                            required
                        >
                            <option value="">Selecciona un área...</option>
                            {areas.map(area => (
                                <option key={area} value={area}>{area}</option>
                            ))}
                            <option value="new_area">+ Crear Nueva Área</option>
                        </select>
                    </div>

                    {/* New Area Input (Conditional) */}
                    {selectedArea === 'new_area' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Nombre de la Nueva Área</label>
                            <input
                                type="text"
                                value={newAreaName}
                                onChange={(e) => setNewAreaName(e.target.value)}
                                placeholder="Ej. Recursos Humanos"
                                style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                                required={selectedArea === 'new_area'}
                            />
                        </div>
                    )}

                    {/* Role Name */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Puesto (Nombre del Cargo)</label>
                        <input
                            type="text"
                            value={roleName}
                            onChange={(e) => setRoleName(e.target.value)}
                            placeholder="Ej. Gerente de Ventas"
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--color-background)', color: 'var(--color-text-primary)' }}
                            required
                        />
                    </div>

                    {/* Auto ID */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>ID (Autogenerado)</label>
                        <input
                            type="text"
                            value={generatedId}
                            disabled
                            style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.05)', color: 'var(--color-text-muted)', cursor: 'not-allowed' }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--color-text-primary)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-primary)', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? 'Creando...' : 'Crear Cargo'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateRoleModal;
