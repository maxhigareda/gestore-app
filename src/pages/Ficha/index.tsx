import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { calculateVacationPeriods, getVacationSummary, type VacationRequest } from '../../utils/vacationLogic';
import PersonalInfoCard from './components/PersonalInfoCard';
import DetailsCard from './components/DetailsCard';
import EditProfileModal from './components/EditProfileModal';
import { type UserProfile, MOCK_USER_PROFILE } from '../../utils/mockData';

const FichaPage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile>(MOCK_USER_PROFILE);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchProfile();
        }
    }, [user]);

    const fetchProfile = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id) // Match by UUID
                .single();

            if (error) {
                if (error.code === 'PGRST116') {
                    // Profile doesn't exist
                    console.warn("Profile not found");
                    // Fallback to basic auth info if profile not found
                    setProfile(prev => ({
                        ...prev,
                        firstName: user.name?.split(' ')[0] || '',
                        lastName: user.name?.split(' ').slice(1).join(' ') || '',
                        email: user.email || '',
                        photoUrl: user.photoUrl || ''
                    }));
                } else {
                    console.error('Error fetching profile:', error);
                    // Fallback to basic auth info on other errors
                    setProfile(prev => ({
                        ...prev,
                        firstName: user.name?.split(' ')[0] || '',
                        lastName: user.name?.split(' ').slice(1).join(' ') || '',
                        email: user.email || '',
                        photoUrl: user.photoUrl || ''
                    }));
                }
            } else if (data) {
                // Fetch Vacation Requests
                const { data: reqs } = await supabase
                    .from('vacation_requests')
                    .select('*')
                    .eq('user_id', user.id);

                // Calculate Dynamic Balance
                // We need to import the logic OR duplicate it briefly. Importing is better.
                // But simplified: 
                // We'll trust the util if we could import it here.
                // Let's import it at top of file.

                // ... Assuming imports added ...

                // Map DB to UserProfile
                const mappedProfile: UserProfile = {
                    photoUrl: data.photo_url || user.photoUrl || '', // TODO: Storage
                    firstName: data.first_name || '',
                    lastName: data.last_name || '',
                    role: data.job_title || '',
                    rfc: data.rfc || '',
                    email: data.email || user.email || '',
                    birthDate: data.birth_date || '', // date string
                    address: data.address || '',
                    dateOfEntry: data.date_of_entry || '', // "Fecha Ingreso Grupo"

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
                    companyEntryDate: data.company_entry_date || '', // "Fecha Ingreso Compañía"

                    vacationBalance: 0
                };

                // Calculate real balance
                const reqsTyped = (reqs || []) as VacationRequest[];
                const periods = calculateVacationPeriods(mappedProfile.dateOfEntry, reqsTyped);
                const summary = getVacationSummary(periods);

                mappedProfile.vacationBalance = summary.currentRemaining;

                setProfile(mappedProfile);
            }
        } catch (error) {
            console.error('Unexpected error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Cargando perfil...</div>; // Or a more sophisticated loading spinner
    }

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
                    userId={user?.id || ''}
                    onClose={() => setIsEditModalOpen(false)}
                    onSave={fetchProfile}
                />
            )}
        </div>
    );
};

export default FichaPage;
