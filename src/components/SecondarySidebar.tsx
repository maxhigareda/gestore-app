import React from 'react';
import { useLocation, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, BookOpen, Network, Contact, Users, ClipboardList, ChevronDown, ChevronRight } from 'lucide-react';

const SecondarySidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const path = location.pathname;
    const navigate = useNavigate();

    // Logic to determine which "Module" is active based on path
    // If path is root '/' or starts with these, it's Home module
    const isHomeModule = path === '/' || ['/portal', '/ficha', '/team', '/surveys', '/training-my', '/evaluations', '/recognition', '/org-chart', '/directory'].some(p => path.startsWith(p));
    const isAdminModule = path.startsWith('/admin');
    const isOrgDevModule = path.startsWith('/org-dev');
    const isTrainingModule = path.startsWith('/training') && !path.startsWith('/training-my');

    // Sidebar State
    const [openMenus, setOpenMenus] = React.useState<{ [key: string]: boolean }>({
        collaborators: true,
        organization: false,
        attendance: false
    });

    const toggleMenu = (key: string) => {
        setOpenMenus(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const renderHomeMenu = () => (
        <>
            <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                marginBottom: '1rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center'
            }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    backgroundColor: '#e0e0e0',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: '#333',
                    fontWeight: 'bold',
                    backgroundImage: user?.photoUrl ? `url(${user.photoUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    {!user?.photoUrl && (user?.firstName?.charAt(0) || 'U')}
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.1rem', fontWeight: 600 }}>
                    ¡Hola!
                </h3>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.1rem', fontWeight: 500 }}>
                    {user?.firstName}
                </h3>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 400 }}>
                    {user?.lastName}
                </h3>
                <span style={{
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#60a5fa',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'inline-block'
                }}>
                    {user?.role}
                </span>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 1rem' }}>
                <SidebarLink to="/portal" icon={<LayoutDashboard size={18} />} label="Portal" />
                <SidebarLink to="/ficha" icon={<FileText size={18} />} label="Ficha" />
                <SidebarLink to="/ficha" icon={<FileText size={18} />} label="Ficha" />
                <SidebarLink to="/team" icon={<Users size={18} />} label="Mi Equipo" />
                {/* <SidebarLink to="/surveys" icon={<ClipboardList size={18} />} label="Mis Encuestas" /> */}
                {/* <SidebarLink to="/surveys" icon={<ClipboardList size={18} />} label="Mis Encuestas" /> */}
                <SidebarLink to="/training-my" icon={<BookOpen size={18} />} label="Mis Capacitaciones" />
                <SidebarLink to="/evaluations" icon={<FileText size={18} />} label="Mis Evaluaciones" />
                {/* <SidebarLink to="/recognition" icon={<Award size={18} />} label="Reconocimientos" /> */}
                <SidebarLink to="/org-chart" icon={<Network size={18} />} label="Organigrama" />
                <SidebarLink to="/directory" icon={<Contact size={18} />} label="Directorio" />
            </nav>
        </>
    );

    const renderAdminMenu = () => (
        <div style={{ padding: '0 0.5rem' }}>
            <div style={{ padding: '1.5rem 1rem 0.5rem 1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Administrativo</h3>
            </div>

            {/* Colaboradores Group */}
            <div style={{ marginBottom: '0.5rem' }}>
                <div
                    onClick={() => toggleMenu('collaborators')}
                    style={{
                        padding: '10px 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={16} /> Colaboradores
                    </div>
                    {openMenus['collaborators'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {openMenus['collaborators'] && (
                    <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <SubMenuLink label="Crear Colaborador" onClick={() => navigate('/admin/collaborators/create')} />
                        <SubMenuLink label="Vigentes" onClick={() => navigate('/admin/collaborators/active')} />
                        <SubMenuLink label="Grupos" onClick={() => navigate('/admin/collaborators/groups')} />
                        <SubMenuLink label="Solicitudes" onClick={() => navigate('/admin/collaborators/requests')} />
                    </div>
                )}
            </div>

            {/* Organization Group */}
            <div style={{ marginBottom: '0.5rem' }}>
                <div
                    onClick={() => toggleMenu('organization')}
                    style={{
                        padding: '10px 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Network size={16} /> Organización
                    </div>
                    {openMenus['organization'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {openMenus['organization'] && (
                    <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <SubMenuLink label="Gestión Org." onClick={() => navigate('/admin/organization')} />
                        <SubMenuLink label="Cargos" onClick={() => { }} />
                        <SubMenuLink label="Áreas" onClick={() => { }} />
                        <SubMenuLink label="Puestos" onClick={() => { }} />
                    </div>
                )}
            </div>

            {/* Attendance Group */}
            <div style={{ marginBottom: '0.5rem' }}>
                <div
                    onClick={() => toggleMenu('attendance')}
                    style={{
                        padding: '10px 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        userSelect: 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ClipboardList size={16} /> Asistencia
                    </div>
                    {openMenus['attendance'] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>

                {openMenus['attendance'] && (
                    <div style={{ paddingLeft: '1rem', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <SubMenuLink label="Gestión Asistencia" onClick={() => navigate('/admin/attendance')} />
                        <SubMenuLink label="Ausencias" onClick={() => { }} />
                        <SubMenuLink label="Calendario" onClick={() => { }} />
                        <SubMenuLink label="Incapacidades" onClick={() => { }} />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <aside style={{
            width: 'var(--sidebar-width-secondary)',
            backgroundColor: 'var(--color-secondary-background)',
            borderRight: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* Company Logo Area */}
            <div style={{
                height: '80px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0 1.5rem',
                borderBottom: '1px solid var(--border-color)'
            }}>
                {/* Placeholder Logo */}
                <img src="/assets/GeStore.png" alt="GeStore" style={{ maxHeight: '35px', maxWidth: '100%', objectFit: 'contain' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                {isHomeModule && renderHomeMenu()}
                {isAdminModule && renderAdminMenu()}
                {isOrgDevModule && <div style={{ padding: '1.5rem' }}><h3>Desarrollo Org.</h3><p>Submenú...</p></div>}
                {isTrainingModule && <div style={{ padding: '1.5rem' }}><h3>Capacitaciones</h3><p>Submenú...</p></div>}
            </div>
        </aside>
    );
};

// Helper for Submenu Links
const SubMenuLink: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
    <div
        onClick={onClick}
        style={{
            padding: '8px 12px 8px 36px',
            fontSize: '0.85rem',
            color: 'var(--color-text-secondary)',
            cursor: 'pointer',
            borderRadius: '6px',
            transition: 'background 0.2s, color 0.2s',
            display: 'flex',
            alignItems: 'center',
            position: 'relative'
        }}
        onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.color = 'var(--color-text-primary)';
        }}
        onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = 'var(--color-text-secondary)';
        }}
    >
        <span style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-text-muted)'
        }} />
        {label}
    </div>
);

// Helper Component for Sidebar Links
const SidebarLink: React.FC<{ to: string; icon: React.ReactNode; label: string }> = ({ to, icon, label }) => (
    <NavLink
        to={to}
        style={({ isActive }) => ({
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            marginBottom: '4px',
            color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
            backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
            transition: 'all 0.2s',
            fontSize: '14px'
        })}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'}
        onMouseOut={(e) => {
            if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.backgroundColor = 'transparent';
        }}
    >
        {icon}
        <span>{label}</span>
    </NavLink>
);

export default SecondarySidebar;
