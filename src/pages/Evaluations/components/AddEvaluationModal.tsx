import React, { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { X, Upload, FileSpreadsheet, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import Papa from 'papaparse';

interface AddEvaluationModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddEvaluationModal: React.FC<AddEvaluationModalProps> = ({ onClose, onSuccess }) => {
    const { user } = useAuth();
    const [file, setFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'uploading' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('idle');
            setStatusMessage('');
        }
    };

    const downloadTemplate = () => {
        const csvContent = "data:text/csv;charset=utf-8,"
            + "Titulo,Descripcion,Area,Pregunta,Tipo,Opciones,Puntos,RespuestaCorrecta\n"
            + "Examen Seguridad,Eval seguridad básica,Seguridad,¿Qué es EPP?,multiple_choice,Casco|Lentes|Guantes|Todas,10,Todas\n"
            + "Examen Seguridad,Eval seguridad básica,Seguridad,Describe un riesgo,text,,10,";

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "plantilla_evaluacion.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const processCSV = async () => {
        if (!file || !user) return;
        setIsSubmitting(true);
        setStatus('parsing');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            encoding: "ISO-8859-1", // Fix for Spanish accents in Excel CSVs
            complete: async (results) => {
                try {
                    setStatus('uploading');
                    const rows = results.data as any[];
                    if (rows.length === 0) throw new Error("El archivo CSV está vacío.");

                    // 1. Group by Evaluation Title to create the Evaluation entry first
                    // Assuming 1 CSV = 1 Evaluation for simplicity, taking the first row's title
                    const firstRow = rows[0];
                    const title = firstRow.Titulo;
                    const description = firstRow.Descripcion;
                    const targetArea = firstRow.Area;

                    if (!title) throw new Error("Falta el título de la evaluación en la primera fila.");

                    // Insert Evaluation
                    const { data: evalData, error: evalError } = await supabase
                        .from('evaluations')
                        .insert({
                            title,
                            description,
                            target_area: targetArea || 'General',
                            created_by: user.id
                        })
                        .select()
                        .single();

                    if (evalError) throw evalError;
                    const evaluationId = evalData.id;

                    // 2. Insert Questions
                    const questionsToInsert = rows.map((row: any) => {
                        // Parse options: "A|B|C" -> ["A", "B", "C"]
                        const options = row.Opciones ? row.Opciones.split('|').map((o: string) => o.trim()) : null;

                        return {
                            evaluation_id: evaluationId,
                            text: row.Pregunta,
                            type: row.Tipo || 'text', // 'multiple_choice' or 'text'
                            options: options,
                            points: parseInt(row.Puntos) || 0,
                            correct_answer: row.RespuestaCorrecta
                        };
                    });

                    const { error: qError } = await supabase.from('questions').insert(questionsToInsert);
                    if (qError) throw qError;

                    setStatus('success');
                    setStatusMessage(`Evaluación "${title}" importada con ${questionsToInsert.length} preguntas.`);

                } catch (error: any) {
                    console.error("Import Error:", error);
                    setStatus('error');
                    setStatusMessage(error.message || "Error al procesar el archivo.");
                    setIsSubmitting(false);
                }
            },
            error: (error) => {
                setStatus('error');
                setStatusMessage("Error al leer el archivo CSV.");
                setIsSubmitting(false);
            }
        });
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, backdropFilter: 'blur(3px)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-surface)', borderRadius: 'var(--border-radius)',
                width: '100%', maxWidth: '500px', display: 'flex', flexDirection: 'column',
                boxShadow: 'var(--shadow-lg)', overflow: 'hidden', border: '1px solid var(--border-color)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Importar Evaluación</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>

                    {status === 'success' ? (
                        <div style={{ textAlign: 'center', color: 'var(--color-success)' }}>
                            <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
                            <p>{statusMessage}</p>
                            <button onClick={() => { onSuccess(); onClose(); }} style={{ marginTop: '1rem', padding: '10px 20px', backgroundColor: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Aceptar
                            </button>
                        </div>
                    ) : (
                        <>
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed var(--border-color)', borderRadius: '12px',
                                    padding: '2rem', width: '100%', textAlign: 'center', cursor: 'pointer',
                                    backgroundColor: 'rgba(255,255,255,0.02)', transition: 'border-color 0.2s'
                                }}
                            >
                                <Upload size={32} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
                                <p style={{ margin: 0, fontWeight: 500 }}>Haz clic para subir CSV</p>
                                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                    {file ? file.name : "O arrastra tu archivo aquí"}
                                </p>
                                <input
                                    type="file"
                                    accept=".csv"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    style={{ display: 'none' }}
                                />
                            </div>

                            {status === 'error' && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#e2445c', fontSize: '0.9rem', backgroundColor: 'rgba(226, 68, 92, 0.1)', padding: '10px', borderRadius: '6px', width: '100%' }}>
                                    <AlertCircle size={16} />
                                    {statusMessage}
                                </div>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                                <button
                                    onClick={downloadTemplate}
                                    style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'transparent', color: 'var(--color-text-primary)', cursor: 'pointer', fontSize: '0.9rem' }}
                                >
                                    <FileSpreadsheet size={16} /> Plantilla
                                </button>
                                <button
                                    onClick={processCSV}
                                    disabled={!file || isSubmitting}
                                    style={{ flex: 1, padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', border: 'none', borderRadius: '6px', backgroundColor: 'var(--color-primary)', color: 'white', cursor: 'pointer', opacity: (!file || isSubmitting) ? 0.5 : 1, fontSize: '0.9rem' }}
                                >
                                    {isSubmitting ? 'Procesando...' : 'Importar'} <Download size={16} />
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddEvaluationModal;
