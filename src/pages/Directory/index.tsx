import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Search } from 'lucide-react';

interface Profile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    full_name?: string; // Optional if we construct it
    photo_url: string;
    avatar_url?: string;
    job_title: string;
    department: string;
    supervisor: string;
    company_entry_date: string;
}

const DirectoryPage: React.FC = () => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchProfiles();
    }, []);

    const fetchProfiles = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name', { ascending: true });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProfiles = profiles.filter(profile =>
        profile.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.job_title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header & Search */}
            <div style={{
                padding: '0 0.5rem 1.5rem 0.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Directorio</h2>
                    <p style={{ color: 'var(--color-text-muted)' }}>Lista de colaboradores registrados</p>
                </div>

                <div style={{ position: 'relative', minWidth: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, correo o puesto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 10px 10px 40px',
                            borderRadius: '20px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-secondary-background)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                </div>
            </div>

            {/* Table */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--border-radius)',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                flex: 1,
                overflowY: 'auto'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                    <thead style={{ backgroundColor: 'var(--color-secondary-background)', position: 'sticky', top: 0 }}>
                        <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Colaborador</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Rol</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Área</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Supervisor</th>
                            <th style={{ padding: '1rem', fontWeight: 600 }}>Fecha Ingreso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    Cargando directorio...
                                </td>
                            </tr>
                        ) : filteredProfiles.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                                    No se encontraron colaboradores.
                                </td>
                            </tr>
                        ) : (
                            filteredProfiles.map(profile => (
                                <tr key={profile.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <img
                                            src={profile.photo_url || profile.avatar_url || 'https://via.placeholder.com/40'}
                                            alt={profile.full_name}
                                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <span style={{ fontWeight: 500 }}>{profile.first_name} {profile.last_name}</span>
                                            <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{profile.email}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                            color: '#60a5fa',
                                            padding: '4px 10px',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 500
                                        }}>
                                            {profile.job_title || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{profile.department || 'N/A'}</td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>{profile.supervisor || 'N/A'}</td>
                                    <td style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        {profile.company_entry_date ? new Date(profile.company_entry_date).toLocaleDateString() : 'N/A'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DirectoryPage;
