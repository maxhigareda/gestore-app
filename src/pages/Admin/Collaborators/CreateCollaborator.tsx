import React, { useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

const CreateCollaborator: React.FC = () => {
    const [formData, setFormData] = useState({
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
        paymentMethod: '',
        companyEntryDate: '',
        emergencyName: '',
        emergencyPhone: ''
    });

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
            // The trigger might have created the profile with basic info. We update it.
            const updates = {
                id: newUserId,
                first_name: formData.firstName,
                last_name: formData.lastName,
                // full_name is already set by trigger but we can ensure consistency
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
                company_entry_date: formData.companyEntryDate,
                payment_method: formData.paymentMethod,
                emergency_contact_name: formData.emergencyName,
                emergency_contact_phone: formData.emergencyPhone,
                photo_url: photoUrl,
                updated_at: new Date()
            };

            const { error: profileError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', newUserId);

            if (profileError) {
                // If update fails (maybe row doesn't exist yet because trigger is slow?), try upsert
                const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert(updates);
                if (upsertError) throw new Error(`Error al guardar perfil: ${upsertError.message}`);
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
                paymentMethod: '',
                companyEntryDate: '',
                emergencyName: '',
                emergencyPhone: ''
            });
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

            <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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

                {/* Personal Information */}
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
                        <optgroup label="Norteamérica">
                            <option value="Estados Unidos">Estados Unidos</option>
                            <option value="Canadá">Canadá</option>
                        </optgroup>
                        <optgroup label="Centroamérica">
                            <option value="Belice">Belice</option>
                            <option value="Costa Rica">Costa Rica</option>
                            <option value="El Salvador">El Salvador</option>
                            <option value="Guatemala">Guatemala</option>
                            <option value="Honduras">Honduras</option>
                            <option value="Nicaragua">Nicaragua</option>
                            <option value="Panamá">Panamá</option>
                        </optgroup>
                        <optgroup label="Sudamérica">
                            <option value="Argentina">Argentina</option>
                            <option value="Bolivia">Bolivia</option>
                            <option value="Brasil">Brasil</option>
                            <option value="Chile">Chile</option>
                            <option value="Colombia">Colombia</option>
                            <option value="Ecuador">Ecuador</option>
                            <option value="Paraguay">Paraguay</option>
                            <option value="Perú">Perú</option>
                            <option value="Uruguay">Uruguay</option>
                            <option value="Venezuela">Venezuela</option>
                        </optgroup>
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
                        <option value="Viudo/a">Viudo/a</option>
                        <option value="Concubinato">Concubinato</option>
                        <option value="Separación en proceso">Separación en proceso</option>
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
                        <option value="DNI">DNI</option>
                        <option value="Pasaporte">Pasaporte</option>
                        <option value="Licencia">Licencia</option>
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
                    {isMexico ? (
                        <select name="addressState" value={formData.addressState} onChange={handleChange} required className="input-field">
                            <option value="">Seleccione...</option>
                            <option value="Aguascalientes">Aguascalientes</option>
                            <option value="Baja California">Baja California</option>
                            <option value="Baja California Sur">Baja California Sur</option>
                            <option value="Campeche">Campeche</option>
                            <option value="Chiapas">Chiapas</option>
                            <option value="Chihuahua">Chihuahua</option>
                            <option value="Ciudad de México">Ciudad de México</option>
                            <option value="Coahuila">Coahuila</option>
                            <option value="Colima">Colima</option>
                            <option value="Durango">Durango</option>
                            <option value="Guanajuato">Guanajuato</option>
                            <option value="Guerrero">Guerrero</option>
                            <option value="Hidalgo">Hidalgo</option>
                            <option value="Jalisco">Jalisco</option>
                            <option value="México">México</option>
                            <option value="Michoacán">Michoacán</option>
                            <option value="Morelos">Morelos</option>
                            <option value="Nayarit">Nayarit</option>
                            <option value="Nuevo León">Nuevo León</option>
                            <option value="Oaxaca">Oaxaca</option>
                            <option value="Puebla">Puebla</option>
                            <option value="Querétaro">Querétaro</option>
                            <option value="Quintana Roo">Quintana Roo</option>
                            <option value="San Luis Potosí">San Luis Potosí</option>
                            <option value="Sinaloa">Sinaloa</option>
                            <option value="Sonora">Sonora</option>
                            <option value="Tabasco">Tabasco</option>
                            <option value="Tamaulipas">Tamaulipas</option>
                            <option value="Tlaxcala">Tlaxcala</option>
                            <option value="Veracruz">Veracruz</option>
                            <option value="Yucatán">Yucatán</option>
                            <option value="Zacatecas">Zacatecas</option>
                        </select>
                    ) : (
                        <input type="text" name="addressState" value={formData.addressState} onChange={handleChange} required className="input-field" placeholder="Estado / Provincia" />
                    )}
                </div>

                <div className="form-group">
                    <label>Municipio*</label>
                    <input type="text" name="addressMunicipality" value={formData.addressMunicipality} onChange={handleChange} required className="input-field" />
                </div>

                <div className="form-group">
                    <label>Código Postal*</label>
                    <input type="text" name="addressZip" value={formData.addressZip} onChange={handleChange} required className="input-field" />
                </div>

                {/* Employment */}
                <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>Información Laboral</h3>
                </div>

                <div className="form-group">
                    <label>Fecha de Ingreso*</label>
                    <input type="date" name="companyEntryDate" value={formData.companyEntryDate} onChange={handleChange} required className="input-field" />
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

                {/* Emergency Contact */}
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

                <div style={{ gridColumn: '1 / -1', marginTop: '2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button type="submit" disabled={loading} className="btn-primary" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Guardando...' : 'Crear Colaborador'}
                    </button>
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
