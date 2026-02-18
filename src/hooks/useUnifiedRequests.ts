import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface UnifiedRequest {
    id: string;
    type: 'vacation' | 'permission';
    requestType: string;
    userId: string;
    userName: string;
    supervisorId?: string;
    managerId?: string;
    startDate: string;
    endDate: string;
    status: 'Solicitada' | 'Aprobada' | 'Rechazada';
    days: number;
    reason?: string;
    created_at: string;
}

export const useUnifiedRequests = (userId?: string) => {
    const [requests, setRequests] = useState<UnifiedRequest[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            // 1. Fetch Vacations
            const { data: vacData, error: vacError } = await supabase
                .from('vacation_requests')
                .select('*');

            if (vacError) throw vacError;

            // 2. Fetch Permissions
            const { data: permData, error: permError } = await supabase
                .from('permission_requests')
                .select('*');

            if (permError) throw permError;

            // 3. Get User IDs
            const userIds = new Set<string>();
            vacData?.forEach((r: any) => userIds.add(r.user_id));
            permData?.forEach((r: any) => userIds.add(r.user_id));

            // 4. Fetch Profiles
            let profilesMap: { [key: string]: any } = {};
            if (userIds.size > 0) {
                const { data: profilesData, error: profError } = await supabase
                    .from('profiles')
                    .select('id, first_name, last_name, supervisor, manager_id')
                    .in('id', Array.from(userIds));

                if (profError) console.error('Error fetching profiles:', profError);

                profilesData?.forEach((p: any) => {
                    profilesMap[p.id] = p;
                });
            }

            // 5. Normalize & Merge
            const unified: UnifiedRequest[] = [];

            vacData?.forEach((r: any) => {
                const profile = profilesMap[r.user_id];
                unified.push({
                    id: r.id,
                    type: 'vacation',
                    requestType: 'Vacaciones',
                    userId: r.user_id,
                    userName: profile ? `${profile.first_name} ${profile.last_name}` : 'Desconocido',
                    supervisorId: profile?.supervisor,
                    managerId: profile?.manager_id,
                    startDate: r.start_date,
                    endDate: r.end_date,
                    status: r.status,
                    days: r.days_taken,
                    reason: r.comments,
                    created_at: r.created_at
                });
            });

            permData?.forEach((r: any) => {
                const profile = profilesMap[r.user_id];
                unified.push({
                    id: r.id,
                    type: 'permission',
                    requestType: r.type || 'Permiso',
                    userId: r.user_id,
                    userName: profile ? `${profile.first_name} ${profile.last_name}` : 'Desconocido',
                    supervisorId: profile?.supervisor,
                    managerId: profile?.manager_id,
                    startDate: r.start_date,
                    endDate: r.end_date,
                    status: r.status,
                    days: r.days_requested,
                    reason: r.reason,
                    created_at: r.created_at
                });
            });

            // Sort by Date Descending
            unified.sort((a, b) => new Date(b.created_at || b.startDate).getTime() - new Date(a.created_at || a.startDate).getTime());

            // Optional: Filter by specific userId if provided, otherwise return all
            // Note: The original RequestsPage fetched ALL. If we want to support single user view, we'd filter here.
            // But since current usage in Admin pages implies fetching all to filter on client side, we leave as is.
            setRequests(unified);

        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    return { requests, loading, fetchRequests };
};
