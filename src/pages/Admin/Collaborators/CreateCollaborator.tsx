import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const CreateCollaborator: React.FC = () => {
    const [step, setStep] = useState(1); // 1: Personal, 2: Work
    const [collaborators, setCollaborators] = useState<any[]>([]); // For Supervisor/Substitute dropdowns

    const [formData, setFormData] = useState({
        // Personal
        firstName: '',
        lastName: '',
        lastNameMother: '',
        gender: '',
        birthCountry: 'México',
        documentType: 'RFC',
        rfc: '',
        curp: '',
        nss: '',
        maritalStatus: '',
        birthDate: '',
        phoneOffice: '',
        phonePersonal: '',
        emailCorporate: '',
        emailPersonal: '',
        addressStreet: '',
        addressState: '',
        addressMunicipality: '',
        addressZip: '',
        emergencyName: '',
        emergencyPhone: '',

        // Work Data
        companyEntryDate: '',
        paymentMethod: '',
        area: '',
        role: '',
        division: '',
        company: 'GeStore',
        costCenter: '',
        supervisorId: '', // UUID
        team: '',
        substituteId: '', // UUID
        regimeType: '',
        workLocation: '',
        patronalRegistration: '',
        contractType: ''
    });

    useEffect(() => {
        fetchCollaborators();
    }, []);

    const fetchCollaborators = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('id, full_name, job_title')
            .order('full_name');
        if (data) setCollaborators(data);
    };

    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const downloadTemplate = () => {
        const headers = [
            "Nombre", "Apellido Paterno", "Apellido Materno", "Genero", "Pais Nacimiento",
            "Tipo Documento", "RFC", "CURP", "NSS", "Estado Civil", "Fecha Nacimiento",
            "Telefono Oficina", "Telefono Personal", "Email Corporativo", "Email Personal",
            "Calle y Numero", "Estado", "Municipio", "Codigo Postal",
            "Metodo Pago", "Fecha Ingreso", "Nombre Emergencia", "Telefono Emergencia"
        ];
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(",");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_colaboradores.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleBulkImport = () => {
        // Trigger hidden file input for CSV
        document.getElementById('csvInput')?.click();
    };

    const processCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            alert("Funcionalidad de Carga Masiva (CSV) simulada: Archivo seleccionado. Se esperan encabezados en español.");
            // Here we would call parseCSV and loop through inserts
        }
    };

    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFeedback(null);

        try {
            // 1. Upload Photo if exists
            let photoUrl = null;
            if (photoFile) {
                const fileExt = photoFile.name.split('.').pop();
                const fileName = `${Math.random()}.${fileExt}`;
                const filePath = `${fileName}`;

                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, photoFile);

                if (uploadError) throw new Error(`Error al subir foto: ${uploadError.message}`);

                const { data: publicUrlData } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                photoUrl = publicUrlData.publicUrl;
            }

            // 2. Create Profile Data object
            // Ideally we would create the auth user here, but for now we focus on data entry.
            // Since we can't create auth users client-side without logging out, 
            // we will simulate the creation by inserting into profiles directly IF RLS allows it 
            // OR if we are just storing data.
            // IMPORTANT: 'profiles' usually references 'auth.users'. 
            // If we don't have a trigger to create the profile, we can insert it.
            // BUT 'id' must exist in auth.users.
            // WORKAROUND: For this demo/MVP without Edge Functions, we will:
            // a) Create a "secondary" client to sign up the user (preserve admin session).
            // b) OR warn the admin.

            // Let's try the secondary client approach which is cleaner.
            const secondaryClient = createClient(
                import.meta.env.VITE_SUPABASE_URL,
                import.meta.env.VITE_SUPABASE_ANON_KEY
            );

            // Create temporary password (could be random or default)
            const tempPassword = "TempPassword123!";

            const { data: authData, error: authError } = await secondaryClient.auth.signUp({
                email: formData.emailCorporate,
                password: tempPassword,
                options: {
                    data: {
                        full_name: `${formData.firstName} ${formData.lastName}`,
                    }
                }
            });

            if (authError) throw new Error(`Error al crear usuario de autenticación: ${authError.message}`);
            if (!authData.user) throw new Error("No se pudo obtener el ID del usuario creado.");

            const newUserId = authData.user.id;

            // 3. Update the Profile with all details
            // 3. Update the Profile with all details
            const updates = {
                id: newUserId,
                first_name: formData.firstName,
                last_name: formData.lastName,
                full_name: `${formData.firstName} ${formData.lastName} ${formData.lastNameMother || ''}`.trim(),
                email: formData.emailCorporate,
                gender: formData.gender,
                birth_country: formData.birthCountry,
                document_type: formData.documentType,
                rfc: formData.rfc,
                curp: formData.curp,
                nss: formData.nss,
                marital_status: formData.maritalStatus,
                birth_date: formData.birthDate,
                phone_office: formData.phoneOffice,
                phone_personal: formData.phonePersonal,
                email_personal: formData.emailPersonal,
                address: `${formData.addressStreet}, ${formData.addressMunicipality}, ${formData.addressState}, CP ${formData.addressZip}`,
                address_state: formData.addressState,
                address_municipality: formData.addressMunicipality,
                address_zip_code: formData.addressZip,
                emergency_contact_name: formData.emergencyName,
                emergency_contact_phone: formData.emergencyPhone,
                photo_url: photoUrl,

                // Work Data
                company_entry_date: formData.companyEntryDate,
                payment_method: formData.paymentMethod,
                department: formData.area, // Mapping 'Area' to 'department'
                job_title: formData.role,  // Mapping 'Role' to 'job_title'
                division: formData.division,
                company: formData.company,
                cost_center: formData.costCenter,
                manager_id: formData.supervisorId || null,
                team: formData.team,
                substitute_id: formData.substituteId || null,
                regime_type: formData.regimeType,
                work_location: formData.workLocation,
                patronal_registration: formData.patronalRegistration,
                contract_type: formData.contractType,

                updated_at: new Date()
            };

            // We use select() to verify if the row was actually found and updated.
            const { data: updateData, error: profileError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', newUserId)
                .select();

            if (profileError) throw new Error(`Error al actualizar perfil: ${profileError.message}`);

            // If no row was updated, it means either:
            // a) The trigger handle_new_user didn't run (so profile doesn't exist).
            // b) RLS blocked the visibility of the new profile.
            // We try to UPSERT to cover case (a).
            if (!updateData || updateData.length === 0) {
                console.warn("Update returned 0 rows. Attempting upsert...");
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert(updates);

                if (upsertError) {
                    throw new Error(`Error al crear perfil (Upsert falló): ${upsertError.message}. Posible problema de permisos RLS.`);
                }
            }

            setFeedback({ type: 'success', message: 'Colaborador creado exitosamente.' });

            // Reset form
            setFormData({
                firstName: '',
                lastName: '',
                lastNameMother: '',
                gender: '',
                birthCountry: 'México',
                documentType: 'RFC',
                rfc: '',
                curp: '',
                nss: '',
                maritalStatus: '',
                birthDate: '',
                phoneOffice: '',
                phonePersonal: '',
                emailCorporate: '',
                emailPersonal: '',
                addressStreet: '',
                addressState: '',
                addressMunicipality: '',
                addressZip: '',
                emergencyName: '',
                emergencyPhone: '',
                companyEntryDate: '',
                paymentMethod: '',
                area: '',
                role: '',
                division: '',
                company: 'GeStore',
                costCenter: '',
                supervisorId: '',
                team: '',
                substituteId: '',
                regimeType: '',
                workLocation: '',
                patronalRegistration: '',
                contractType: ''
            });
            setStep(1);
            setPhotoFile(null);
            setPreviewUrl(null);

            // Optional: Scroll to top
            window.scrollTo(0, 0);

        } catch (error: any) {
            console.error(error);
            setFeedback({ type: 'error', message: error.message || 'Error desconocido.' });
        } finally {
            setLoading(false);
        }
    };

    const isMexico = formData.birthCountry === 'México';

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Nuevo Colaborador
            </h1>

            {feedback && (
                <div style={{
                    padding: '1rem',
                    marginBottom: '1rem',
                    borderRadius: '6px',
                    backgroundColor: feedback.type === 'success' ? 'rgba(0, 202, 114, 0.1)' : 'rgba(226, 68, 92, 0.1)',
                    border: `1px solid ${feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    color: feedback.type === 'success' ? 'var(--color-success)' : 'var(--color-danger)'
                }}>
                    {feedback.message}
                </div>
            )}

            <div style={{ display: 'flex', marginBottom: '2rem', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderBottom: step === 1 ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: step === 1 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: step === 1 ? 'bold' : 'normal',
                    textAlign: 'center',
                    cursor: 'pointer'
                }} onClick={() => setStep(1)}>
                    1. Información Personal
                </div>
                <div style={{
                    flex: 1,
                    padding: '0.5rem',
                    borderBottom: step === 2 ? '2px solid var(--color-primary)' : '2px solid transparent',
                    color: step === 2 ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    fontWeight: step === 2 ? 'bold' : 'normal',
                    textAlign: 'center',
                    cursor: step >= 2 ? 'pointer' : 'default'
                }}>
                    2. Datos de Trabajo
                </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>

                {/* STEP 1: PERSONAL INFORMATION */}
                {step === 1 && (
                    <>
                        {/* Photo Upload Section */}
                        <div style={{ gridColumn: '1 / -1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                backgroundColor: 'var(--color-surface)',
                                border: '2px dashed var(--border-color)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>Sin Foto</span>
                                )}
                            </div>
                            <div>
                                <label className="btn-secondary" style={{ cursor: 'pointer', display: 'inline-block' }}>
                                    📷 Subir Foto
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
                                </label>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    Formatos: JPG, PNG. Máx 2MB.
                                </p>
                            </div>

                            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
                                <button type="button" onClick={downloadTemplate} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    📥 Plantilla
                                </button>
                                <input type="file" id="csvInput" accept=".csv" onChange={processCSV} style={{ display: 'none' }} />
                                <button type="button" onClick={handleBulkImport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    ➕ Carga Masiva (CSV)
                                </button>
                            </div>
                        </div>

                        {/* Personal Information Fields */}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Información Personal</h3>
                        </div>

                        <div className="form-group">
                            <label>Nombre*</label>
                            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Apellido Paterno*</label>
                            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Apellido Materno</label>
                            <input type="text" name="lastNameMother" value={formData.lastNameMother} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Género*</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} required className="input-field">
                                <option value="">Seleccione...</option>
                                <option value="Masculino">Masculino</option>
                                <option value="Femenino">Femenino</option>
                                <option value="No Binario">No Binario</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>País de Nacimiento*</label>
                            <select name="birthCountry" value={formData.birthCountry} onChange={handleChange} required className="input-field">
                                <option value="México">México</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Fecha de Nacimiento*</label>
                            <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Estado Civil*</label>
                            <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} required className="input-field">
                                <option value="">Seleccione...</option>
                                <option value="Soltero/a">Soltero/a</option>
                                <option value="Casado/a">Casado/a</option>
                                <option value="Divorciado/a">Divorciado/a</option>
                            </select>
                        </div>

                        {/* Documents */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Documentos</h3>
                        </div>

                        <div className="form-group">
                            <label>Tipo de Documento</label>
                            <select name="documentType" value={isMexico ? 'RFC' : formData.documentType} disabled={isMexico} onChange={handleChange} className="input-field">
                                <option value="RFC">RFC</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>{isMexico ? 'RFC (México)*' : 'Identificación / RFC*'}</label>
                            <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} required className="input-field" placeholder={isMexico ? "RFC con Homoclave" : "ID Documento"} />
                        </div>

                        <div className="form-group">
                            <label>CURP {isMexico && '*'}</label>
                            <input type="text" name="curp" value={formData.curp} onChange={handleChange} disabled={!isMexico} required={isMexico} className="input-field" style={{ opacity: isMexico ? 1 : 0.5 }} />
                        </div>

                        <div className="form-group">
                            <label>NSS {isMexico && '*'}</label>
                            <input type="text" name="nss" value={formData.nss} onChange={handleChange} disabled={!isMexico} required={isMexico} className="input-field" style={{ opacity: isMexico ? 1 : 0.5 }} />
                        </div>

                        {/* Contact & Address */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Contacto y Domicilio</h3>
                        </div>

                        <div className="form-group">
                            <label>Email Corporativo*</label>
                            <input type="email" name="emailCorporate" value={formData.emailCorporate} onChange={handleChange} required className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Email Personal</label>
                            <input type="email" name="emailPersonal" value={formData.emailPersonal} onChange={handleChange} className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Teléfono Oficina</label>
                            <input type="tel" name="phoneOffice" value={formData.phoneOffice} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Particular</label>
                            <input type="tel" name="phonePersonal" value={formData.phonePersonal} onChange={handleChange} className="input-field" />
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Dirección (Calle y Número)*</label>
                            <input type="text" name="addressStreet" value={formData.addressStreet} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Estado*</label>
                            <input type="text" name="addressState" value={formData.addressState} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Municipio*</label>
                            <input type="text" name="addressMunicipality" value={formData.addressMunicipality} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Código Postal*</label>
                            <input type="text" name="addressZip" value={formData.addressZip} onChange={handleChange} required className="input-field" />
                        </div>

                        {/* Emergency */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Contacto de Emergencia</h3>
                        </div>
                        <div className="form-group">
                            <label>Nombre Contacto</label>
                            <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} className="input-field" />
                        </div>
                        <div className="form-group">
                            <label>Teléfono Contacto</label>
                            <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} className="input-field" />
                        </div>
                    </>
                )}

                {/* STEP 2: WORK DATA */}
                {step === 2 && (
                    <>
                        <div style={{ gridColumn: '1 / -1' }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Datos de Trabajo</h3>
                        </div>

                        <div className="form-group">
                            <label>Fecha de Ingreso*</label>
                            <input type="date" name="companyEntryDate" value={formData.companyEntryDate} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Empresa*</label>
                            <input type="text" name="company" value={formData.company} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>División</label>
                            <input type="text" name="division" value={formData.division} onChange={handleChange} className="input-field" placeholder="Ej. Comercial, Operaciones" />
                        </div>

                        <div className="form-group">
                            <label>Centro de Costo</label>
                            <input type="text" name="costCenter" value={formData.costCenter} onChange={handleChange} className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Registro Patronal</label>
                            <input type="text" name="patronalRegistration" value={formData.patronalRegistration} onChange={handleChange} className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Ubicación de Trabajo</label>
                            <input type="text" name="workLocation" value={formData.workLocation} onChange={handleChange} className="input-field" placeholder="Ej. Oficinas Centrales" />
                        </div>

                        <hr style={{ gridColumn: '1 / -1', border: '0', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

                        <div className="form-group">
                            <label>Área (Departamento)*</label>
                            <input type="text" name="area" value={formData.area} onChange={handleChange} required className="input-field" placeholder="Ej. Ventas, Gerencia" />
                        </div>

                        <div className="form-group">
                            <label>Puesto (Rol)*</label>
                            <input type="text" name="role" value={formData.role} onChange={handleChange} required className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Equipo (Team)</label>
                            <input type="text" name="team" value={formData.team} onChange={handleChange} className="input-field" />
                        </div>

                        <div className="form-group">
                            <label>Tipo de Régimen</label>
                            <select name="regimeType" value={formData.regimeType} onChange={handleChange} className="input-field">
                                <option value="">Seleccione...</option>
                                <option value="Sueldos y Salarios">Sueldos y Salarios</option>
                                <option value="Asimilados">Asimilados</option>
                                <option value="Honorarios">Honorarios</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Tipo de Contrato</label>
                            <select name="contractType" value={formData.contractType} onChange={handleChange} className="input-field">
                                <option value="">Seleccione...</option>
                                <option value="Indeterminado">Indeterminado</option>
                                <option value="Determinado">Determinado</option>
                                <option value="Prueba">Periodo de Prueba</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Forma de Pago*</label>
                            <select name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} required className="input-field">
                                <option value="">Seleccione...</option>
                                <option value="Transferencia">Transferencia Bancaria</option>
                                <option value="Cheque">Cheque</option>
                                <option value="Efectivo">Efectivo</option>
                            </select>
                        </div>

                        <hr style={{ gridColumn: '1 / -1', border: '0', borderTop: '1px solid var(--border-color)', margin: '1rem 0' }} />

                        <div className="form-group">
                            <label>Supervisor Inmediato</label>
                            <select name="supervisorId" value={formData.supervisorId} onChange={handleChange} className="input-field">
                                <option value="">- Seleccione (Opcional) -</option>
                                {collaborators.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.full_name} {c.job_title ? `(${c.job_title})` : ''}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: 'var(--color-text-muted)' }}>
                                Si el área es Manager/Gerencia, típicamente reporta al CEO (Dejar vacío o seleccionar CEO)
                            </small>
                        </div>

                        <div className="form-group">
                            <label>Suplente</label>
                            <select name="substituteId" value={formData.substituteId} onChange={handleChange} className="input-field">
                                <option value="">- Seleccione (Opcional) -</option>
                                {collaborators.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.full_name}
                                    </option>
                                ))}
                            </select>
                            <small style={{ color: 'var(--color-text-muted)' }}>
                                Si no tiene suplente, puede ser CEO o no aplicar.
                            </small>
                        </div>

                    </>
                )}

                {/* Footer Buttons */}
                <div style={{ gridColumn: '1 / -1', marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    {step === 2 && (
                        <button type="button" onClick={() => setStep(1)} className="btn-secondary">
                            &lt;- Atrás
                        </button>
                    )}

                    {step === 1 ? (
                        <button type="button" onClick={() => setStep(2)} className="btn-primary" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                            Datos de Trabajo -&gt;
                        </button>
                    ) : (
                        <button type="submit" disabled={loading} className="btn-primary" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                            {loading ? 'Guardando...' : 'Crear Colaborador'}
                        </button>
                    )}
                </div>

            </form>

            <style>{`
                .form-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                .form-group label {
                    font-size: 0.9rem;
                    color: var(--color-text-secondary);
                }
                .input-field {
                    padding: 0.8rem;
                    border-radius: 6px;
                    border: 1px solid var(--border-color);
                    background-color: var(--color-surface);
                    color: var(--color-text-primary);
                    font-size: 0.95rem;
                }
                .input-field:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }
                .input-field:disabled {
                    background-color: var(--color-background);
                    cursor: not-allowed;
                }
                /* Defined specifically for this page to ensure visibility */
                .btn-secondary {
                    background-color: var(--color-surface);
                    color: var(--color-text-primary);
                    border: 1px solid var(--border-color);
                    padding: 0.6rem 1.2rem;
                    border-radius: 6px;
                    font-weight: 500;
                    font-size: 0.9rem;
                    transition: all 0.2s;
                }
                .btn-secondary:hover {
                    background-color: var(--color-hover);
                    border-color: var(--color-text-secondary);
                    color: white;
                }
            `}</style>
        </div>
    );
};


export default CreateCollaborator;
