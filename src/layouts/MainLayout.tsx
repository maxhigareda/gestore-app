import React from 'react';
import { Outlet } from 'react-router-dom';
import PrimarySidebar from '../components/PrimarySidebar';
import SecondarySidebar from '../components/SecondarySidebar';
import TopBar from '../components/TopBar';

const MainLayout: React.FC = () => {
    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
            {/* 1. Primary Sidebar (Icons) */}
            <PrimarySidebar />

            {/* 2. Secondary Sidebar (Context Menu) */}
            <SecondarySidebar />

            {/* 3. Main Content Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--color-main-background)' }}>
                <TopBar />
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', color: 'var(--color-text-primary)' }}>
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
