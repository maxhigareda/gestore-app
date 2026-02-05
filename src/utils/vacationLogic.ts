export const calculateVacationEntitlement = (dateOfEntry: string | null): number => {
    if (!dateOfEntry) return 0;

    const entryDate = new Date(dateOfEntry);
    const today = new Date();

    let yearsOfService = today.getFullYear() - entryDate.getFullYear();

    // Adjust if anniversary hasn't happened yet this year
    const m = today.getMonth() - entryDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < entryDate.getDate())) {
        yearsOfService--;
    }

    if (yearsOfService < 1) return 0; // Less than a year, maybe 0 or proportional? User said "1 year = 12 days" as base.

    // Logic Table
    // 1 año | 12 días
    // 2 años | 14 días
    // 3 años | 16 días
    // 4 años | 18 días
    // 5 años | 20 días
    // 6 - 10 años | 22 días
    // 11 - 15 años | 24 días
    // 16 - 20 años | 26 días
    // 21 - 25 años | 28 días
    // 26 - 30 años | 30 días
    // 31 - 35 años | 32 días

    if (yearsOfService === 1) return 12;
    if (yearsOfService === 2) return 14;
    if (yearsOfService === 3) return 16;
    if (yearsOfService === 4) return 18;
    if (yearsOfService === 5) return 20;

    if (yearsOfService >= 6 && yearsOfService <= 10) return 22;
    if (yearsOfService >= 11 && yearsOfService <= 15) return 24;
    if (yearsOfService >= 16 && yearsOfService <= 20) return 26;
    if (yearsOfService >= 21 && yearsOfService <= 25) return 28;
    if (yearsOfService >= 26 && yearsOfService <= 30) return 30;
    if (yearsOfService >= 31 && yearsOfService <= 35) return 32;

    return 32; // Cap at 32 or continue? Assuming cap for now or following pattern
};

export interface VacationRequest {
    id: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: 'Solicitada' | 'Aprobada' | 'Rechazada';
    type: string;
}
