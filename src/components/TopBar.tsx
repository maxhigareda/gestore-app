import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopBar: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Create initials or use first char
    const initial = user?.firstName?.charAt(0) || user?.name?.charAt(0) || 'U';

    return (
        <header style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end', // Right aligned items
            padding: '0 2rem',
            backgroundColor: 'transparent'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.firstName || user?.name}</span>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)', // Placeholder if no image
                    backgroundImage: user?.photoUrl ? `url(${user.photoUrl})` : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    {!user?.photoUrl && initial}
                </div>

                <button
                    onClick={handleLogout}
                    title="Cerrar Sesión"
                    style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        marginLeft: '8px'
                    }}
                >
                    <LogOut size={20} />
                </button>
            </div>
        </header>
    );
};

export default TopBar;
