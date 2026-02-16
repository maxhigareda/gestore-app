import React from 'react';
import { Briefcase, Calendar, DollarSign, Edit, Star } from 'lucide-react';

interface HistoryEvent {
    id: string;
    date: string;
    type: 'INGRESO' | 'CAMBIO_PUESTO' | 'AUMENTO_SUELDO' | 'MODIFICACION_DATOS' | 'RECONOCIMIENTO';
    title: string;
    description: string;
    author: string;
}

const MOCK_HISTORY: HistoryEvent[] = [
    {
        id: '1',
        date: '2025-01-15',
        type: 'MODIFICACION_DATOS',
        title: 'Actualización de Perfil',
        description: 'Se actualizó la dirección y teléfono de contacto.',
        author: 'Admin'
    },
    {
        id: '2',
        date: '2024-06-01',
        type: 'AUMENTO_SUELDO',
        title: 'Ajuste Salarial',
        description: 'Incremento anual por desempeño (10%).',
        author: 'Recursos Humanos'
    },
    {
        id: '3',
        date: '2023-01-10',
        type: 'CAMBIO_PUESTO',
        title: 'Promoción',
        description: 'Promovido de "Analista Senior" a "Gerente de Proyecto".',
        author: 'Director General'
    },
    {
        id: '4',
        date: '2021-08-15',
        type: 'INGRESO',
        title: 'Ingreso a la Compañía',
        description: 'Contratación como Analista Senior en el departamento de Tecnología.',
        author: 'Recursos Humanos'
    }
];

const getEventIcon = (type: HistoryEvent['type']) => {
    switch (type) {
        case 'INGRESO': return <Calendar size={18} color="#2563EB" />;
        case 'CAMBIO_PUESTO': return <Briefcase size={18} color="#D97706" />;
        case 'AUMENTO_SUELDO': return <DollarSign size={18} color="#16A34A" />;
        case 'MODIFICACION_DATOS': return <Edit size={18} color="#6B7280" />;
        case 'RECONOCIMIENTO': return <Star size={18} color="#F59E0B" />;
        default: return <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#CBD5E1' }} />;
    }
};

const HistoriaTab: React.FC = () => {
    return (
        <div style={{ maxWidth: '800px' }}>
            <h3 style={{ marginBottom: '2rem', fontSize: '1.2rem', fontWeight: 600 }}>Linea de Tiempo Laboral</h3>

            <div style={{ position: 'relative', paddingLeft: '20px' }}>
                {/* Vertical Line */}
                <div style={{
                    position: 'absolute',
                    left: '29px',
                    top: '10px',
                    bottom: '0',
                    width: '2px',
                    backgroundColor: 'var(--border-color)'
                }} />

                {MOCK_HISTORY.map((event) => (
                    <div key={event.id} style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem', position: 'relative' }}>
                        {/* Icon Node */}
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--color-surface)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            flexShrink: 0
                        }}>
                            {getEventIcon(event.type)}
                        </div>

                        {/* Content Card */}
                        <div style={{
                            flex: 1,
                            backgroundColor: 'var(--color-surface)',
                            padding: '1.2rem',
                            borderRadius: '8px',
                            border: '1px solid var(--border-color)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{event.title}</span>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{event.date}</span>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', marginBottom: '0.8rem', lineHeight: '1.5' }}>
                                {event.description}
                            </p>
                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontStyle: 'italic' }}>
                                Registrado por: {event.author}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HistoriaTab;
