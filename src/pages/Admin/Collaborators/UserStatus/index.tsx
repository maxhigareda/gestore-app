import React, { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { MailCheck, MailWarning, UserCheck, Clock } from 'lucide-react';

interface UserStatus {
    user_id: string;
    email: string;
    full_name: string | null;
    job_title: string | null;
    email_confirmed_at: string | null;
    created_at: string;
}

const UserStatusPage: React.FC = () => {
    const [users, setUsers] = useState<UserStatus[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'confirmed' | 'pending'>('all');

    useEffect(() => {
        fetchUsersStatus();
    }, []);

    const fetchUsersStatus = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase.rpc('get_users_status');

            if (error) throw error;

            setUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users status:', error);
            alert(`Error al cargar datos: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.full_name && user.full_name.toLowerCase().includes(searchTerm.toLowerCase()));

        if (!matchesSearch) return false;

        // Filter by Status
        if (statusFilter === 'confirmed') return !!user.email_confirmed_at;
        if (statusFilter === 'pending') return !user.email_confirmed_at;

        return true;
    });

    const confirmedCount = users.filter(u => u.email_confirmed_at).length;
    const pendingCount = users.length - confirmedCount;

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <UserCheck size={28} /> Estado de Usuarios
                    </h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Monitorea qué empleados han confirmado su acceso a GeStore</p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ backgroundColor: 'rgba(0, 202, 114, 0.1)', color: 'var(--color-success)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <MailCheck size={18} /> {confirmedCount} Confirmados
                    </div>
                    <div style={{ backgroundColor: 'rgba(226, 68, 92, 0.1)', color: 'var(--color-danger)', padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                        <MailWarning size={18} /> {pendingCount} Pendientes
                    </div>
                </div>
            </div>

            <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
                <input
                    type="text"
                    placeholder="Buscar por nombre o correo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        maxWidth: '400px',
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)'
                    }}
                />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'confirmed' | 'pending')}
                    style={{
                        padding: '10px 15px',
                        borderRadius: '8px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-primary)',
                        cursor: 'pointer'
                    }}
                >
                    <option value="all">Todos los estatus</option>
                    <option value="confirmed">Solo Confirmados</option>
                    <option value="pending">Solo Pendientes</option>
                </select>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>Cargando datos...</div>
            ) : (
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--border-radius)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden'
                }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead style={{ backgroundColor: 'var(--color-background)', borderBottom: '2px solid var(--border-color)' }}>
                            <tr>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Colaborador</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Correo</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Puesto</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Fecha Registro</th>
                                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Estatus</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                        No se encontraron usuarios.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.user_id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{user.full_name || 'Sin Nombre (Perfil Incompleto)'}</div>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                            {user.email}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                            {user.job_title || '-'}
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                                            {new Date(user.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            {user.email_confirmed_at ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                                                    backgroundColor: 'rgba(0, 202, 114, 0.1)', color: 'var(--color-success)'
                                                }}>
                                                    <MailCheck size={14} /> Confirmado
                                                </span>
                                            ) : (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                                                    padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                                                    backgroundColor: 'rgba(226, 68, 92, 0.1)', color: 'var(--color-danger)'
                                                }}>
                                                    <Clock size={14} /> Pendiente
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserStatusPage;
