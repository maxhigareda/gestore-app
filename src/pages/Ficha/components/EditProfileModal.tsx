import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../../utils/mockData';
import { Check, X, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

interface EditProfileModalProps {
    user: UserProfile;
    onClose: () => void;
    onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState<UserProfile>(user);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'job'>('personal');

    const handleChange = (field: keyof UserProfile, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Map UserProfile fields to Supabase DB columns
            const updates = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                job_title: formData.role,
                rfc: formData.rfc,
                birth_date: formData.birthDate,
                address: formData.address,
                company_entry_date: formData.dateOfEntry,

                department: formData.area, // Mapping 'area' to department
                division: formData.division,
                company: formData.company,
                cost_center: formData.costCenter,
                supervisor: formData.supervisor,
                team: formData.team,
                substitute: formData.substitute,
                regime_type: formData.regimeType,
                work_location: formData.workLocation,
                patronal_registration: formData.patronalRegistration,
                contract_type: formData.contractType,

                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('email', formData.email); // Assuming we can match by email or ID. Ideally ID.

            if (error) throw error;
            onSave();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al guardar cambios.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                width: '100%', maxWidth: '800px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh', overflow: 'hidden',
                border: '1px solid var(--border-color)'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Editar Mi Ficha</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--color-background)' }}>
                    <button
                        onClick={() => setActiveTab('personal')}
                        style={{
                            flex: 1, padding: '1rem', background: 'none', border: 'none',
                            borderBottom: activeTab === 'personal' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'personal' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Información Personal
                    </button>
                    <button
                        onClick={() => setActiveTab('job')}
                        style={{
                            flex: 1, padding: '1rem', background: 'none', border: 'none',
                            borderBottom: activeTab === 'job' ? '3px solid var(--color-primary)' : '3px solid transparent',
                            color: activeTab === 'job' ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Información Laboral
                    </button>
                </div>

                {/* Form Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
                    <form id="edit-profile-form" onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                        {activeTab === 'personal' && (
                            <>
                                <Field label="Nombre(s)" value={formData.firstName} onChange={v => handleChange('firstName', v)} />
                                <Field label="Apellidos" value={formData.lastName} onChange={v => handleChange('lastName', v)} />
                                <Field label="RFC" value={formData.rfc} onChange={v => handleChange('rfc', v)} />
                                <Field label="Fecha de Nacimiento" value={formData.birthDate} type="date" onChange={v => handleChange('birthDate', v)} />
                                <Field label="Dirección" value={formData.address} fullWidth onChange={v => handleChange('address', v)} />
                                <Field label="Email Corporativo" value={formData.email} disabled />
                            </>
                        )}

                        {activeTab === 'job' && (
                            <>
                                <Field label="Puesto (Role)" value={formData.role} fullWidth onChange={v => handleChange('role', v)} />
                                <Field label="Área / Departamento" value={formData.area} onChange={v => handleChange('area', v)} />
                                <Field label="División" value={formData.division} onChange={v => handleChange('division', v)} />
                                <Field label="Compañía" value={formData.company} onChange={v => handleChange('company', v)} />
                                <Field label="Centro de Costos" value={formData.costCenter} onChange={v => handleChange('costCenter', v)} />
                                <Field label="Supervisor Inmediato" value={formData.supervisor} fullWidth onChange={v => handleChange('supervisor', v)} />
                                <Field label="Equipo" value={formData.team} onChange={v => handleChange('team', v)} />
                                <Field label="Suplente" value={formData.substitute} onChange={v => handleChange('substitute', v)} />
                                <Field label="Tipo de Régimen" value={formData.regimeType} onChange={v => handleChange('regimeType', v)} />
                                <Field label="Ubicación de Trabajo" value={formData.workLocation} onChange={v => handleChange('workLocation', v)} />
                                <Field label="Registro Patronal" value={formData.patronalRegistration} onChange={v => handleChange('patronalRegistration', v)} />
                                <Field label="Tipo de Contrato" value={formData.contractType} onChange={v => handleChange('contractType', v)} />
                                <Field label="Fecha Ingreso Compañía" value={formData.companyEntryDate} type="date" onChange={v => handleChange('companyEntryDate', v)} />
                                <Field label="Fecha de Ingreso (Grupo)" value={formData.dateOfEntry} type="date" onChange={v => handleChange('dateOfEntry', v)} />
                            </>
                        )}

                    </form>
                </div>

                {/* Footer */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', backgroundColor: 'var(--color-surface)' }}>
                    <button
                        type="button"
                        onClick={onClose}
                        style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="edit-profile-form"
                        disabled={saving}
                        style={{
                            padding: '10px 24px', borderRadius: '6px', border: 'none',
                            backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1
                        }}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'} <Save size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

interface FieldProps {
    label: string;
    value: string;
    onChange?: (val: string) => void;
    type?: string;
    disabled?: boolean;
    fullWidth?: boolean;
}

const Field: React.FC<FieldProps> = ({ label, value, onChange, type = 'text', disabled = false, fullWidth = false }) => (
    <div style={{ gridColumn: fullWidth ? '1 / -1' : 'auto' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
            {label}
        </label>
        <input
            type={type}
            value={value || ''}
            onChange={e => onChange && onChange(e.target.value)}
            disabled={disabled}
            style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: disabled ? 'var(--color-background)' : 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                opacity: disabled ? 0.6 : 1
            }}
        />
    </div>
);

export default EditProfileModal;
