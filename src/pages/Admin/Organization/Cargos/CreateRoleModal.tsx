import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { X } from 'lucide-react';

interface CreateRoleModalProps {
    onClose: () => void;
    onSuccess: () => void;
    roleToEdit?: { id: string, name: string, department: string } | null;
}

const CreateRoleModal: React.FC<CreateRoleModalProps> = ({ onClose, onSuccess, roleToEdit }) => {
    const [areas, setAreas] = useState<string[]>([]);
    const [selectedArea, setSelectedArea] = useState(''); // 'new_area' or existing name
    const [newAreaName, setNewAreaName] = useState('');
    const [roleName, setRoleName] = useState('');
    const [generatedId, setGeneratedId] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAreas();
        if (roleToEdit) {
            setSelectedArea(roleToEdit.department);
            setRoleName(roleToEdit.name);
            setGeneratedId(roleToEdit.id);
        } else {
            setGeneratedId(crypto.randomUUID());
        }
    }, [roleToEdit]);

    const fetchAreas = async () => {
        // Fetch distinct departments from job_titles
        const { data } = await supabase
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
            if (roleToEdit) {
                // UPDATE
                const { error: updateError } = await supabase
                    .from('job_titles')
                    .update({
                        name: roleName,
                        department: department,
                        // id is not updatable usually, keeping same
                    })
                    .eq('id', roleToEdit.id);

                if (updateError) throw updateError;
            } else {
                // INSERT
                const { error: insertError } = await supabase
                    .from('job_titles')
                    .insert({
                        id: generatedId,
                        name: roleName,
                        department: department,
                        company: 'The Store Intelligence'
                    });

                if (insertError) throw insertError;
            }
            onSuccess();
        } catch {
            console.error('Error in operation');
            alert('Ocurrió un error. Intenta de nuevo.');
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
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{roleToEdit ? 'Editar Cargo' : 'Crear Nuevo Cargo'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Area Selection */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>Área (Departamento)</label>
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            className="input-field"
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
                                className="input-field"
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
                            className="input-field"
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
                            className="input-field"
                            style={{ opacity: 0.7, cursor: 'not-allowed' }}
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
                            className="btn-primary"
                            style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? (roleToEdit ? 'Guardando...' : 'Creando...') : (roleToEdit ? 'Guardar Cambios' : 'Crear Cargo')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateRoleModal;
