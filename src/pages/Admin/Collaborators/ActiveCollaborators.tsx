import React, { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabaseClient';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Collaborator {
    id: string;
    first_name: string;
    last_name: string;
    email: string; // Corporate email
    rfc: string;
    document_type: string;
    job_title: string;
    department: string;
    company_entry_date: string;
    photo_url: string;
    avatar_url: string;
}

const PAGE_SIZE = 25;

const ActiveCollaborators: React.FC = () => {
    const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCollaborators();
    }, [page, searchTerm]);

    const fetchCollaborators = async () => {
        setLoading(true);
        try {
            // Calculate range
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;

            let query = supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                // Filter by active role if needed, currently assuming all profiles are collaborators + admins
                .order('first_name', { ascending: true })
                .range(from, to);

            if (searchTerm) {
                query = query.or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Supabase Error:', error);
                throw error;
            }

            console.log('Collaborators found:', data?.length); // Debug info
            setCollaborators(data || []);
            setTotalCount(count || 0);

        } catch (error) {
            console.error('Error fetching collaborators:', error);
        } finally {
            setLoading(false);
        }
    };

    const totalPages = Math.ceil(totalCount / PAGE_SIZE);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(0); // Reset to first page on search
    };

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Colaboradores Vigentes</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Listado de personal activo.</p>
                </div>
                <div style={{ position: 'relative' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            padding: '10px 10px 10px 40px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-surface)',
                            color: 'var(--color-text-primary)',
                            minWidth: '300px'
                        }}
                    />
                </div>
            </div>

            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ overflowX: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '900px' }}>
                        <thead style={{ backgroundColor: 'var(--color-secondary-background)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr style={{ textAlign: 'left', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
                                <th style={{ padding: '1rem' }}>Nombre</th>
                                <th style={{ padding: '1rem' }}>Documento</th>
                                <th style={{ padding: '1rem' }}>Cargo</th>
                                <th style={{ padding: '1rem' }}>Área</th>
                                <th style={{ padding: '1rem' }}>Fecha Ingreso</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>Cargando...</td>
                                </tr>
                            ) : collaborators.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No se encontraron colaboradores.</td>
                                </tr>
                            ) : (
                                collaborators.map((col) => (
                                    <tr key={col.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <img
                                                src={col.photo_url || col.avatar_url || 'https://via.placeholder.com/40'}
                                                alt={col.first_name}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{col.first_name} {col.last_name}</div>
                                                <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{col.email}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 500 }}>{col.document_type || 'RFC'}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{col.rfc || 'N/A'}</div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{col.job_title || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>{col.department || 'N/A'}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {col.company_entry_date ? new Date(col.company_entry_date).toLocaleDateString() : 'N/A'}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <span style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                        Mostrando {page * PAGE_SIZE + 1} - {Math.min((page + 1) * PAGE_SIZE, totalCount)} de {totalCount}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'transparent',
                                color: 'var(--color-text-primary)',
                                cursor: 'pointer',
                                opacity: page === 0 ? 0.5 : 1
                            }}
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page >= totalPages - 1}
                            style={{
                                padding: '0.5rem',
                                border: '1px solid var(--border-color)',
                                borderRadius: '4px',
                                background: 'transparent',
                                color: 'var(--color-text-primary)',
                                cursor: 'pointer',
                                opacity: page >= totalPages - 1 ? 0.5 : 1
                            }}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveCollaborators;
