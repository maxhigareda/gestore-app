import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import PersonalInfoCard from './components/PersonalInfoCard';
import DetailsCard from './components/DetailsCard';
import EditProfileModal from './components/EditProfileModal';
import { type UserProfile, MOCK_USER_PROFILE } from '../../utils/mockData';

const FichaPage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user?.id) // Match by UUID
                .single();

            if (error) {
                // If profile doesn't exist or error, we might fallback to mock or basic auth data
                console.warn("Could not fetch profile, using Basic Auth info + Mock defaults", error);

                // If we have auth user, at least update names/email
                if (user) {
                    setProfile(prev => ({
                        ...prev,
                        firstName: user.name.split(' ')[0],
                        lastName: user.name.split(' ').slice(1).join(' '),
                        email: user.email,
                        photoUrl: user.photoUrl
                    }));
                }
            } else if (data) {
                // Map DB columns to Frontend UserProfile
                setProfile({
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    role: data.job_title || '',
                    rfc: data.rfc || '',
                    email: data.email || user?.email || '',
                    birthDate: data.birth_date || '',
                    address: data.address || '',
                    dateOfEntry: data.company_entry_date || '',

                    area: data.department || '',
                    division: data.division || '',
                    company: data.company || '',
                    costCenter: data.cost_center || '',
                    supervisor: data.supervisor || '',
                    team: data.team || '',
                    substitute: data.substitute || '',
                    regimeType: data.regime_type || '',
                    workLocation: data.work_location || '',
                    patronalRegistration: data.patronal_registration || '',
                    contractType: data.contract_type || '',
                    companyEntryDate: data.company_entry_date || '',
                    vacationBalance: 12, // TODO: Store this in DB or calculate
                    photoUrl: data.photo_url || user?.photoUrl || ''
                });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '350px 1fr',
            gap: '2rem',
            height: '100%',
            maxHeight: 'calc(100vh - 120px)'
        }}>
            {/* 1. Left Column: Personal Info */}
            <div style={{ height: '100%', overflow: 'hidden' }}>
                <PersonalInfoCard
                    user={profile}
                    onEdit={() => setIsEditModalOpen(true)}
                />
            </div>

            {/* 2. Right Column: Tabbed Details */}
            <div style={{ height: '100%', overflow: 'hidden' }}>
                <DetailsCard user={profile} />
            </div>

            {/* Edit Modal */}
            {isEditModalOpen && (
                <EditProfileModal
                    user={profile}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={fetchProfile}
                />
            )}
        </div>
    );
};

export default FichaPage;
