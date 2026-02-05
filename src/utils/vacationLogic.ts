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

// Table of entitlements
// 1: 12, 2: 14, 3: 16, 4: 18, 5: 20
// 6-10: 22, 11-15: 24, 16-20: 26, 21-25: 28, 26-30: 30, 31-35: 32
const getDaysForYear = (yearNum: number): number => {
    if (yearNum === 1) return 12;
    if (yearNum === 2) return 14;
    if (yearNum === 3) return 16;
    if (yearNum === 4) return 18;
    if (yearNum === 5) return 20;
    if (yearNum >= 6 && yearNum <= 10) return 22;
    if (yearNum >= 11 && yearNum <= 15) return 24;
    if (yearNum >= 16 && yearNum <= 20) return 26;
    if (yearNum >= 21 && yearNum <= 25) return 28;
    if (yearNum >= 26 && yearNum <= 30) return 30;
    if (yearNum >= 31 && yearNum <= 35) return 32;
    return 32;
};

export interface VacationRequest {
    id: string;
    start_date: string;
    end_date: string;
    days_requested: number;
    status: 'Solicitada' | 'Aprobada' | 'Rechazada';
    type: string;
}

export interface VacationPeriod {
    id: string;
    period: string; // "2023-2024"
    start_date: Date;
    end_date: Date;
    days_entitled: number;
    days_taken: number;
    days_pending: number; // Future
    status: 'Vencido' | 'Actual' | 'Futuro';
}

export const calculateVacationPeriods = (dateOfEntryStr: string | null, requests: VacationRequest[]): VacationPeriod[] => {
    if (!dateOfEntryStr) return [];

    // Normalize entry date to noon to avoid timezone shift issues roughly
    const entryDate = new Date(dateOfEntryStr);
    const today = new Date();
    const periods: VacationPeriod[] = [];

    // Iterate from entry year to current year (or next anniversary)
    // We define a period as AnniversaryYear to AnniversaryYear+1

    let loopDate = new Date(entryDate);
    let yearCount = 1;

    while (loopDate <= today) {
        // Start of period
        const start = new Date(loopDate);

        // End of period (Start + 1 year)
        const end = new Date(start);
        end.setFullYear(end.getFullYear() + 1);

        // Determine status
        let status: 'Vencido' | 'Actual' | 'Futuro' = 'Vencido';
        if (today >= start && today < end) {
            status = 'Actual';
        } else if (today < start) {
            status = 'Futuro'; // Shouldn't happen in this loop usually unless we project ahead
        }

        // Entitlement
        const days = getDaysForYear(yearCount);

        // Calculations based on requests in this period
        // Simplification: Request belongs to period if start_date is within [start, end)
        const requestsInPeriod = requests.filter(r => {
            const rStart = new Date(r.start_date);
            return rStart >= start && rStart < end;
        });

        const taken = requestsInPeriod
            .filter(r => r.status === 'Aprobada')
            .reduce((sum, r) => sum + r.days_requested, 0);

        const pending = requestsInPeriod
            .filter(r => r.status === 'Solicitada')
            .reduce((sum, r) => sum + r.days_requested, 0);

        periods.push({
            id: `period-${yearCount}`,
            period: `${start.getFullYear()}-${end.getFullYear()}`,
            start_date: start,
            end_date: end,
            days_entitled: days,
            days_taken: taken,
            days_pending: pending,
            status
        });

        // Advance
        loopDate.setFullYear(loopDate.getFullYear() + 1);
        yearCount++;
    }

    // Special case: If we haven't reached "Actual" because today IS the anniversary or something?
    // The loop runs while loopDate <= today. 
    // Example: Entry 2020. Today 2024.
    // loops: 2020-21 (V), 2021-22 (V), 2022-23 (V), 2023-24 (A if today < 2024 anniversary)
    // If today is exactly 2024 anniversary, loopDate hits 2024. Body creates 2024-25. Status Actual.

    // We reverse to show newest first? Or oldest first? Usually Newest on top.
    return periods.reverse();
};

export interface VacationSummary {
    totalAccrued: number;
    totalTaken: number; // Approved only
    accruedExpired: number; // Unused days from past years
    future: number; // Pending requests
    currentRemaining: number; // Remaining in THIS year
}

export const getVacationSummary = (periods: VacationPeriod[]): VacationSummary => {
    let totalAccrued = 0;
    let totalTaken = 0;
    let accruedExpired = 0;
    let future = 0;
    let currentRemaining = 0;

    periods.forEach(p => {
        totalAccrued += p.days_entitled;
        totalTaken += p.days_taken;
        future += p.days_pending;

        if (p.status === 'Vencido') {
            const unused = Math.max(0, p.days_entitled - p.days_taken);
            accruedExpired += unused;
        } else if (p.status === 'Actual') {
            const available = p.days_entitled;
            // Remaining = Available - Taken - Pending ?? User said "Restantes son las que me quedan sin solicitar"
            // Usually "Remaining" means "Available to take"
            // User: "Futuro serian todas las que solicité pero no me han aprobado"
            // "Restantes son las qwu me quedan en este año sin solicitar" -> (Entitlement - Taken - Pending)??
            // Or just (Entitlement - Taken)? 
            // If I have 12, request 5 pending. Remaining? 12? or 7?
            // "Sin solicitar" implies removing the solicited ones. So (Entitled - Taken - Pending).
            currentRemaining = Math.max(0, available - p.days_taken - p.days_pending);
        }
    });

    return {
        totalAccrued,
        totalTaken, // Total taken history
        accruedExpired,
        future,
        currentRemaining
    };
};
