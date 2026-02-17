import React, { useEffect, useState } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { Plus, Edit2, Trash2, Search, Briefcase, Users } from 'lucide-react';
import ConfirmationModal from '../../../../components/ConfirmationModal';
import CreateRoleModal from './CreateRoleModal';

interface JobTitle {
    id: string;
    name: string;
    department: string;
    created_at: string;
    total_collaborators?: number; // Count to be fetched
}

const CargosPage: React.FC = () => {
    const [roles, setRoles] = useState<JobTitle[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [roleToEdit, setRoleToEdit] = useState<JobTitle | null>(null);

    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        setLoading(true);
        try {
            // 1. Fetch Roles
            const { data: rolesData, error: rolesError } = await supabase
                .from('job_titles')
                .select('*')
                .order('department', { ascending: true });

            if (rolesError) throw rolesError;

            // 2. Fetch all profiles to count
            const { data: profiles, error: profError } = await supabase
                .from('profiles')
                .select('job_title, department');

            if (profError) throw profError;

            const counts: { [key: string]: number } = {};
            if (profiles) {
                profiles.forEach((p: any) => {
                    // Match by text: Department(Area) + JobTitle(Role)
                    if (p.department && p.job_title) {
                        const key = `${p.department}-${p.job_title}`;
                        counts[key] = (counts[key] || 0) + 1;
                    }
                });
            }

            const rolesWithCounts = rolesData?.map(r => ({
                ...r,
                total_collaborators: counts[`${r.department}-${r.name}`] || 0
            })) || [];

            setRoles(rolesWithCounts);

        } catch (error) {
            console.error('Error fetching roles:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!roleToDelete) return;
        try {
            const { error } = await supabase
                .from('job_titles')
                .delete()
                .eq('id', roleToDelete.id);
            if (error) throw error;
            fetchRoles();
            setRoleToDelete(null);
        } catch (error) {
            console.error('Error deleting role:', error);
            alert('Error al eliminar el cargo.');
        }
    };

    const handleEdit = (role: JobTitle) => {
        setRoleToEdit(role);
        setIsCreateModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsCreateModalOpen(false);
        setRoleToEdit(null);
    };

    const filteredRoles = roles.filter(r =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem' }}>Cargos</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Gestión de Áreas y Puestos de la organización.</p>
                </div>
                <button
                    onClick={() => {
                        setRoleToEdit(null);
                        setIsCreateModalOpen(true);
                    }}
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <Plus size={18} /> Crear Cargo
                </button>
            </div>

            {/* Filter */}
            <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '400px' }}>
                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                    type="text"
                    placeholder="Buscar por puesto o área..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px 10px 10px 40px', borderRadius: '8px', border: '1px solid var(--border-color)', width: '100%', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                />
            </div>

            {/* Table */}
            <div style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                overflow: 'hidden',
                flex: 1,
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
                        <thead style={{ backgroundColor: 'var(--color-secondary-background)', borderBottom: '1px solid var(--border-color)' }}>
                            <tr style={{ textAlign: 'left', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                <th style={{ padding: '1rem' }}>Área</th>
                                <th style={{ padding: '1rem' }}>Puesto</th>
                                <th style={{ padding: '1rem' }}>Colaboradores</th>
                                <th style={{ padding: '1rem' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>Cargando cargos...</td></tr>
                            ) : filteredRoles.length === 0 ? (
                                <tr><td colSpan={4} style={{ padding: '2rem', textAlign: 'center' }}>No se encontraron cargos.</td></tr>
                            ) : (
                                filteredRoles.map((role) => (
                                    <tr key={role.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                display: 'inline-block',
                                                padding: '4px 10px',
                                                borderRadius: '6px',
                                                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                                color: '#3b82f6',
                                                fontSize: '0.85rem',
                                                fontWeight: 500
                                            }}>
                                                {role.department}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 500 }}>{role.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <Users size={16} color="var(--color-text-muted)" />
                                                <span>{role.total_collaborators}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                <button
                                                    onClick={() => handleEdit(role)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
                                                    title="Editar"
                                                >
                                                    <Edit2 size={18} />
                                                </button>
                                                <button
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)' }}
                                                    title="Eliminar"
                                                    onClick={() => setRoleToDelete(role)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {isCreateModalOpen && (
                <CreateRoleModal
                    onClose={handleCloseModal}
                    onSuccess={() => {
                        handleCloseModal();
                        fetchRoles();
                    }}
                    roleToEdit={roleToEdit}
                />
            )}

            <ConfirmationModal
                isOpen={!!roleToDelete}
                onClose={() => setRoleToDelete(null)}
                onConfirm={handleDelete}
                title="Eliminar Cargo"
                message={`¿Estás seguro de que deseas eliminar el puesto "${roleToDelete?.name}" del área "${roleToDelete?.department}"? Esta acción no se puede deshacer.`}
                type="danger"
                confirmText="Eliminar"
            />
        </div>
    );
};

export default CargosPage;
