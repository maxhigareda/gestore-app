import React, { useState, useEffect } from 'react';
import type { UserProfile } from '../../../utils/mockData';
import { X, Save } from 'lucide-react';
import { supabase } from '../../../lib/supabaseClient';

interface EditProfileModalProps {
    user: UserProfile;
    userId: string;
    onClose: () => void;
    onSave: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({ user, userId, onClose, onSave }) => {
    // Merge user with default values for new fields if they don't exist
    const [formData, setFormData] = useState<UserProfile>({
        ...user,
        company: user.company || 'The Store Intelligence', // Default Company
        birthCountry: user.birthCountry || 'México',
        documentType: user.documentType || 'RFC',
    });
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'job'>('personal');
    const [collaborators, setCollaborators] = useState<any[]>([]); // For Supervisor/Substitute dropdowns

    useEffect(() => {
        const fetchCollaborators = async () => {
            const { data } = await supabase
                .from('profiles')
                .select('id, first_name, last_name, job_title')
                .order('first_name');
            if (data) setCollaborators(data);
        };
        fetchCollaborators();
    }, []);

    const handleChange = (field: keyof UserProfile, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleWorkDaysChange = (day: string) => {
        setFormData(prev => {
            const currentDays = prev.workDays || [];
            if (currentDays.includes(day)) {
                return { ...prev, workDays: currentDays.filter(d => d !== day) };
            } else {
                return { ...prev, workDays: [...currentDays, day] };
            }
        });
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Helper: Convert empty strings to null for Date fields to avoid DB errors
            const sanitizeDate = (dateStr?: string) => (dateStr && dateStr.trim() !== '') ? dateStr : null;

            // Map UserProfile fields to Supabase DB columns
            const updates = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                job_title: formData.role,
                rfc: formData.rfc,
                birth_date: sanitizeDate(formData.birthDate),
                address: formData.address,
                phone: formData.phoneOffice || null, // Mapping to generic phone column if exists, or specific
                phone_office: formData.phoneOffice || null,
                phone_personal: formData.phonePersonal || null,
                email_personal: formData.emailPersonal || null,
                marital_status: formData.maritalStatus || null,
                birth_country: formData.birthCountry || null,
                document_type: formData.documentType || null,
                curp: formData.curp || null,
                nss: formData.nss || null,
                emergency_contact_name: formData.emergencyName || null,
                emergency_contact_phone: formData.emergencyPhone || null,

                // Correctly map both date fields
                company_entry_date: sanitizeDate(formData.companyEntryDate), // Fecha Ingreso Compañía
                date_of_entry: sanitizeDate(formData.dateOfEntry),

                department: formData.area, // Mapping 'area' to department
                division: formData.division,
                company: formData.company,
                cost_center: formData.costCenter,
                manager_id: formData.supervisor || null, // Mapping supervisor UUID
                team: formData.team,
                substitute_id: formData.substitute || null,
                regime_type: formData.regimeType,
                work_location: formData.workLocation,
                patronal_registration: formData.patronalRegistration,
                contract_type: formData.contractType,
                payment_method: formData.paymentMethod || null,

                // New Fields Mapped
                salary: formData.salary,
                work_shift: formData.shift,
                work_schedule: formData.schedule,
                work_days: formData.workDays,
                compensation_type: formData.compensationType,

                updated_at: new Date().toISOString()
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
            onSave();
            onClose();
        } catch (error: any) {
            console.error('Error updating profile:', error);
            alert(`Error al guardar: ${error.message || 'Verifica los datos e intenta de nuevo.'}`);
        } finally {
            setSaving(false);
        }
    };

    const isMexico = formData.birthCountry === 'México';

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)',
                width: '100%', maxWidth: '900px',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex', flexDirection: 'column',
                maxHeight: '90vh', overflow: 'hidden',
                border: '1px solid var(--border-color)'
            }}>
                {/* Header */}
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: '#eee', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {user.photoUrl ? (
                                <img src={user.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#666' }}>
                                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </span>
                            )}
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Editar: {formData.firstName} {formData.lastName}</h2>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>{formData.email}</p>
                        </div>
                    </div>
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
                                <Field label="Email Corporativo" value={formData.email} disabled />
                                <Field label="Email Personal" value={formData.emailPersonal} onChange={v => handleChange('emailPersonal', v)} />
                                <Field label="Teléfono Oficina" value={formData.phoneOffice} onChange={v => handleChange('phoneOffice', v)} />
                                <Field label="Teléfono Personal" value={formData.phonePersonal} onChange={v => handleChange('phonePersonal', v)} />

                                <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 0, borderTop: '1px solid var(--border-color)' }} /></div>

                                <Field label="Fecha de Nacimiento" value={formData.birthDate} type="date" onChange={v => handleChange('birthDate', v)} />
                                <div style={{ gridColumn: 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>País de Nacimiento</label>
                                    <select
                                        value={formData.birthCountry}
                                        onChange={e => handleChange('birthCountry', e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="México">México</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <div style={{ gridColumn: 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Estado Civil</label>
                                    <select
                                        value={formData.maritalStatus}
                                        onChange={e => handleChange('maritalStatus', e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="">Seleccione...</option>
                                        <option value="Soltero/a">Soltero/a</option>
                                        <option value="Casado/a">Casado/a</option>
                                        <option value="Divorciado/a">Divorciado/a</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 0, borderTop: '1px solid var(--border-color)' }} /></div>

                                <div style={{ gridColumn: 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Tipo Documento</label>
                                    <select
                                        value={isMexico ? 'RFC' : formData.documentType}
                                        onChange={e => handleChange('documentType', e.target.value)}
                                        disabled={isMexico}
                                        style={{ ...selectStyle, opacity: isMexico ? 0.7 : 1 }}
                                    >
                                        <option value="RFC">RFC</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                                <Field label="RFC/ID" value={formData.rfc} onChange={v => handleChange('rfc', v)} />
                                <Field label="CURP" value={formData.curp} onChange={v => handleChange('curp', v)} disabled={!isMexico && !formData.curp} />
                                <Field label="NSS" value={formData.nss} onChange={v => handleChange('nss', v)} disabled={!isMexico && !formData.nss} />

                                <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 0, borderTop: '1px solid var(--border-color)' }} /></div>

                                <Field label="Dirección Completa" value={formData.address} fullWidth onChange={v => handleChange('address', v)} />
                                <Field label="Contacto Emergencia" value={formData.emergencyName} onChange={v => handleChange('emergencyName', v)} />
                                <Field label="Tel. Emergencia" value={formData.emergencyPhone} onChange={v => handleChange('emergencyPhone', v)} />
                            </>
                        )}

                        {activeTab === 'job' && (
                            <>
                                <Field label="Empresa" value={formData.company} onChange={v => handleChange('company', v)} />
                                <Field label="Fecha Ingreso Compañía" value={formData.companyEntryDate} type="date" onChange={v => handleChange('companyEntryDate', v)} />
                                <Field label="Puesto (Role)" value={formData.role} fullWidth onChange={v => handleChange('role', v)} />
                                <Field label="Área / Departamento" value={formData.area} onChange={v => handleChange('area', v)} />
                                <Field label="División" value={formData.division} onChange={v => handleChange('division', v)} />
                                <Field label="Centro de Costos" value={formData.costCenter} onChange={v => handleChange('costCenter', v)} />

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Supervisor</label>
                                    <select
                                        value={formData.supervisor || ''}
                                        onChange={e => handleChange('supervisor', e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="">- Seleccione -</option>
                                        {collaborators.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.first_name} {c.last_name} {c.job_title ? `(${c.job_title})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <Field label="Equipo" value={formData.team} onChange={v => handleChange('team', v)} />
                                <div style={{ gridColumn: 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Suplente</label>
                                    <select
                                        value={formData.substitute || ''}
                                        onChange={e => handleChange('substitute', e.target.value)}
                                        style={selectStyle}
                                    >
                                        <option value="">- Seleccione -</option>
                                        {collaborators.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.first_name} {c.last_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <Field label="Tipo de Régimen" value={formData.regimeType} onChange={v => handleChange('regimeType', v)} />
                                <Field label="Ubicación de Trabajo" value={formData.workLocation} onChange={v => handleChange('workLocation', v)} />
                                <Field label="Registro Patronal" value={formData.patronalRegistration} onChange={v => handleChange('patronalRegistration', v)} />
                                <Field label="Tipo de Contrato" value={formData.contractType} onChange={v => handleChange('contractType', v)} />

                                <div style={{ gridColumn: '1 / -1' }}><hr style={{ border: 0, borderTop: '1px solid var(--border-color)' }} /></div>

                                <Field label="Sueldo Base" value={String(formData.salary || '')} type="number" onChange={v => handleChange('salary', v ? parseFloat(v) : 0)} />
                                <div style={{ gridColumn: 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Tipo de Compensación</label>
                                    <select value={formData.compensationType || ''} onChange={e => handleChange('compensationType', e.target.value)} style={selectStyle}>
                                        <option value="">Seleccione...</option>
                                        <option value="Fijo">Fijo</option>
                                        <option value="Variable">Variable</option>
                                        <option value="Mixto">Mixto</option>
                                    </select>
                                </div>

                                <div style={{ gridColumn: 'auto' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Turno</label>
                                    <select value={formData.shift || ''} onChange={e => handleChange('shift', e.target.value)} style={selectStyle}>
                                        <option value="">Seleccione...</option>
                                        <option value="Diurna">Diurna</option>
                                        <option value="Nocturna">Nocturna</option>
                                        <option value="Mixta">Mixta</option>
                                    </select>
                                </div>
                                <Field label="Horario" value={formData.schedule || ''} onChange={v => handleChange('schedule', v)} />

                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>Días de Jornada</label>
                                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
                                            <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.workDays?.includes(day)}
                                                    onChange={() => handleWorkDaysChange(day)}
                                                    style={{ accentColor: 'var(--color-primary)' }}
                                                />
                                                {day}
                                            </label>
                                        ))}
                                    </div>
                                </div>
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
    value: string | undefined;
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

const selectStyle = {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-primary)'
};

export default EditProfileModal;
