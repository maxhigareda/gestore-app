import React from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, Users, ClipboardList, BookOpen, Award, Network, Contact } from 'lucide-react';

const SecondarySidebar: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const path = location.pathname;

    // Logic to determine which "Module" is active based on path
    // If path is root '/' or starts with these, it's Home module
    const isHomeModule = path === '/' || ['/portal', '/ficha', '/team', '/surveys', '/training-my', '/evaluations', '/recognition', '/org-chart', '/directory'].some(p => path.startsWith(p));
    const isAdminModule = path.startsWith('/admin');
    const isOrgDevModule = path.startsWith('/org-dev');
    const isTrainingModule = path.startsWith('/training') && !path.startsWith('/training-my');

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
                    backgroundColor: '#e0e0e0', // Placeholder for photo
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem',
                    color: '#333',
                    fontWeight: 'bold'
                }}>
                    {user?.photoUrl ? <img src={user.photoUrl} alt="User" style={{ borderRadius: '50%', width: '100%', height: '100%' }} /> : 'Foto'}
                </div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>¡Hola {user?.name.split(' ')[0]} {path === '/' /* just a trick to get surname if needed, but simplified per request */}!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-primary)' }}>{user?.role}</p>
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', padding: '0 1rem' }}>
                <SidebarLink to="/portal" icon={<LayoutDashboard size={18} />} label="Portal" />
                <SidebarLink to="/ficha" icon={<FileText size={18} />} label="Ficha" />
                <SidebarLink to="/team" icon={<Users size={18} />} label="Mi equipo" />
                <SidebarLink to="/surveys" icon={<ClipboardList size={18} />} label="Mis Encuestas" />
                <SidebarLink to="/training-my" icon={<BookOpen size={18} />} label="Mis Capacitaciones" />
                <SidebarLink to="/evaluations" icon={<FileText size={18} />} label="Mis Evaluaciones" />
                <SidebarLink to="/recognition" icon={<Award size={18} />} label="Reconocimientos" />
                <SidebarLink to="/org-chart" icon={<Network size={18} />} label="Organigrama" />
                <SidebarLink to="/directory" icon={<Contact size={18} />} label="Directorio" />
            </nav>
        </>
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
                {isAdminModule && <div style={{ padding: '1.5rem' }}><h3>Administrativo</h3><p>Submenú...</p></div>}
                {isOrgDevModule && <div style={{ padding: '1.5rem' }}><h3>Desarrollo Org.</h3><p>Submenú...</p></div>}
                {isTrainingModule && <div style={{ padding: '1.5rem' }}><h3>Capacitaciones</h3><p>Submenú...</p></div>}
            </div>
        </aside>
    );
};

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
