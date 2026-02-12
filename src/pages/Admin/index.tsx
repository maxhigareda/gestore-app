import React from 'react';

const AdminPage: React.FC = () => {
    return (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-text-primary)' }}>Módulo Administrativo</h1>
            <p>Selecciona una opción del menú lateral para comenzar.</p>
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3>Colaboradores</h3>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3>Organización</h3>
                </div>
                <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <h3>Asistencia</h3>
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
