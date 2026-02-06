import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, GraduationCap } from 'lucide-react';
import '../styles/theme.css';

const PrimarySidebar: React.FC = () => {
    const iconSize = 24;

    const navItems = [
        { to: '/', icon: <Home size={iconSize} />, label: 'Home' },
        { to: '/admin', icon: <Briefcase size={iconSize} />, label: 'Administrativo' },
        // { to: '/org-dev', icon: <TrendingUp size={iconSize} />, label: 'Desarrollo' }, // Hidden
        { to: '/training-my', icon: <GraduationCap size={iconSize} />, label: 'Capacitaciones' }, // Redirect to My Training
    ];

    return (
        <aside style={{
            width: 'var(--sidebar-width-primary)',
            backgroundColor: 'var(--color-surface)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: '1rem',
            borderRight: '1px solid var(--border-color)',
            zIndex: 20
        }}>
            {navItems.map((item) => (
                <NavLink
                    key={item.label}
                    to={item.to}
                    style={({ isActive }) => ({
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem',
                        borderRadius: 'var(--border-radius)',
                        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        transition: 'color 0.2s, background-color 0.2s',
                        border: isActive ? `1px solid var(--color-primary)` : '1px solid transparent'
                        //  backgroundColor: isActive ? 'rgba(0, 115, 234, 0.1)' : 'transparent' // Optional fill
                    })}
                    title={item.label}
                >
                    {item.icon}
                </NavLink>
            ))}
        </aside>
    );
};

export default PrimarySidebar;
