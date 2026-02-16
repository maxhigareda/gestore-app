import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { Search, Phone, Mail, DollarSign, Calendar } from 'lucide-react';

const MyTeamPage: React.FC = () => {
    const { user } = useAuth();
    const [teamMembers, setTeamMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 25;

    useEffect(() => {
        if (user) {
            fetchTeam();
        }
    }, [user]);

    const fetchTeam = async () => {
        try {
            // Fetch profiles where manager_id is the current user's ID
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('manager_id', user?.id)
                .order('full_name');

            if (error) throw error;
            setTeamMembers(data || []);
        } catch (error) {
            console.error('Error fetching team:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredMembers = teamMembers.filter(member =>
        member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredMembers.length / itemsPerPage);
    const paginatedMembers = filteredMembers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Mi Equipo</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        Gestiona a tus {teamMembers.length} reportes directos.
                    </p>
                </div>

                <div style={{ position: 'relative' }}>
                    <Search size={20} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre o puesto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            padding: '0.6rem 1rem 0.6rem 2.5rem',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            width: '300px'
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div>Cargando equipo...</div>
            ) : filteredMembers.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--color-text-muted)' }}>
                    {searchTerm ? 'No se encontraron resultados.' : 'No tienes reportes directos asignados.'}
                </div>
            ) : (
                <div style={{
                    flex: 1,
                    overflow: 'auto',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--color-surface)', zIndex: 10 }}>
                            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Colaborador</th>
                                <th style={{ padding: '1rem' }}>Puesto / Área</th>
                                <th style={{ padding: '1rem' }}>Contacto</th>
                                <th style={{ padding: '1rem' }}>Ingreso</th>
                                <th style={{ padding: '1rem' }}>Sueldo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedMembers.map((member) => (
                                <tr key={member.id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s' }} className="hover-row">
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden',
                                            backgroundColor: '#e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            {member.photo_url ? (
                                                <img src={member.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                <span style={{ fontSize: '1rem', fontWeight: 600, color: '#666' }}>
                                                    {member.first_name?.charAt(0)}{member.last_name?.charAt(0)}
                                                </span>
                                            )}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{member.full_name}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{member.email}</div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ fontWeight: 500 }}>{member.job_title || 'Sin Puesto'}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{member.department || 'Sin Área'}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '4px' }}>
                                            <Phone size={14} /> {member.phone_personal || '-'}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                                            <Mail size={14} /> {member.email_personal || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={16} color="var(--color-text-muted)" />
                                            {member.company_entry_date || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--color-success)' }}>
                                            <DollarSign size={16} />
                                            {member.salary ? member.salary.toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '-'}
                                        </div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                                            {member.compensation_type || 'Fijo'}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Anterior
                    </button>
                    <span style={{ display: 'flex', alignItems: 'center', padding: '0 1rem' }}>
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="btn-secondary"
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Siguiente
                    </button>
                </div>
            )}

            <style>{`
                .btn-secondary {
                    background: var(--color-surface);
                    border: 1px solid var(--border-color);
                    color: var(--color-text-primary);
                    border-radius: 4px;
                    cursor: pointer;
                }
                .btn-secondary:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .hover-row:hover {
                    background-color: var(--color-background);
                }
            `}</style>
        </div>
    );
};

export default MyTeamPage;
