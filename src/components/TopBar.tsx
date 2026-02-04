import React from 'react';
import { useAuth } from '../context/AuthContext';

const TopBar: React.FC = () => {
    const { user } = useAuth();

    // Create initials or use first char
    const initial = user?.firstName?.charAt(0) || 'U';

    return (
        <header style={{
            height: 'var(--topbar-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end', // Right aligned items
            padding: '0 2rem',
            // borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'transparent' // Often transparent in modern dashboards if main content covers it, or match background
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary)', // Placeholder if no image
                    backgroundImage: user?.photoUrl ? `url(${user.photoUrl})` : 'none',
                    backgroundSize: 'cover',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    fontWeight: 'bold',
                    fontSize: '14px'
                }}>
                    {!user?.photoUrl && initial}
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500 }}>{user?.firstName}</span>
            </div>
        </header>
    );
};

export default TopBar;
