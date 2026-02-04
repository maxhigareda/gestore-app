import React from 'react';
import PersonalInfoCard from './components/PersonalInfoCard';
import DetailsCard from './components/DetailsCard';
import { MOCK_USER_PROFILE } from '../../utils/mockData';

const FichaPage: React.FC = () => {
    // In a real app, we would fetch data here based on auth user
    const user = MOCK_USER_PROFILE;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '2rem',
            height: '100%',
            maxHeight: 'calc(100vh - 120px)' // Adjust for TopBar + Padding
        }}>
            {/* 1. Left Column: Personal Info */}
            <div style={{ height: '100%', overflow: 'hidden' }}>
                <PersonalInfoCard user={user} />
            </div>

            {/* 2. Right Column: Tabbed Details */}
            <div style={{ height: '100%', overflow: 'hidden' }}>
                <DetailsCard user={user} />
            </div>
        </div>
    );
};

export default FichaPage;
