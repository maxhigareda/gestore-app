import React, { useState } from 'react';

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
            "firstName", "lastName", "lastNameMother", "gender", "birthCountry",
            "documentType", "rfc", "curp", "nss", "maritalStatus", "birthDate",
            "phoneOffice", "phonePersonal", "emailCorporate", "emailPersonal",
            "addressStreet", "addressState", "addressMunicipality", "addressZip",
            "paymentMethod", "companyEntryDate", "emergencyName", "emergencyPhone"
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
            alert("Funcionalidad de Carga Masiva (CSV) simulada: Archivo seleccionado.");
            // Here we would call parseCSV and loop through inserts
        }
    };

    const isMexico = formData.birthCountry === 'México';

    return (
        <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Nuevo Colaborador
            </h1>

            <form style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
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
                        <label className="btn-secondary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', display: 'inline-block' }}>
                            Subir Foto
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
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Canadá">Canadá</option>
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
                        <option value="Otro">Otro</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>RFC*</label>
                    <input type="text" name="rfc" value={formData.rfc} onChange={handleChange} required className="input-field" />
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
                            <option value="CDMX">Ciudad de México</option>
                            <option value="Jalisco">Jalisco</option>
                            <option value="Nuevo León">Nuevo León</option>
                            {/* Add more states later */}
                        </select>
                    ) : (
                        <input type="text" name="addressState" value={formData.addressState} onChange={handleChange} required className="input-field" />
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
                    <button type="button" className="btn-secondary">Cancelar</button>
                    <button type="submit" className="btn-primary" style={{ backgroundColor: 'var(--color-primary)', color: 'white', padding: '0.8rem 2rem', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                        Crear Colaborador
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
            `}</style>
        </div>
    );
};

export default CreateCollaborator;
