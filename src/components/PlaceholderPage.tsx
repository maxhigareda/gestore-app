import React from 'react';
import { useLocation } from 'react-router-dom';

const PlaceholderPage: React.FC<{ title?: string }> = ({ title }) => {
    const location = useLocation();
    const displayTitle = title || location.pathname.split('/').pop()?.replace('-', ' ').toUpperCase();

    return (
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: '1rem', textTransform: 'capitalize' }}>
                {displayTitle}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)' }}>
                Esta sección se encuentra bajo construcción.
            </p>
        </div>
    );
};

export default PlaceholderPage;
