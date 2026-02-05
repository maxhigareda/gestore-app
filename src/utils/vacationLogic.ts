import type { VacationRequest } from './vacationLogic'; // Self reference fix if needed? No, definitions are here.

// Table of entitlements based on COMPLETED years
const getDaysForYear = (yearsCompleted: number): number => {
    if (yearsCompleted < 1) return 0; // First year working (0 completed) = 0 days available
    if (yearsCompleted === 1) return 12;
    if (yearsCompleted === 2) return 14;
    if (yearsCompleted === 3) return 16;
    if (yearsCompleted === 4) return 18;
    if (yearsCompleted === 5) return 20;
    if (yearsCompleted >= 6 && yearsCompleted <= 10) return 22;
    if (yearsCompleted >= 11 && yearsCompleted <= 15) return 24;
    if (yearsCompleted >= 16 && yearsCompleted <= 20) return 26;
    if (yearsCompleted >= 21 && yearsCompleted <= 25) return 28;
    if (yearsCompleted >= 26 && yearsCompleted <= 30) return 30;
    if (yearsCompleted >= 31 && yearsCompleted <= 35) return 32;
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

    // Normalize entry date
    // Append T12:00:00 to ensure we don't shift day due to timezone
    // Or just split YYYY-MM-DD
    const parts = dateOfEntryStr.split('-');
    const entryYear = parseInt(parts[0]);
    const entryMonth = parseInt(parts[1]) - 1; // 0-indexed
    const entryDay = parseInt(parts[2]);

    const entryDate = new Date(entryYear, entryMonth, entryDay);
    const today = new Date();

    const periods: VacationPeriod[] = [];

    // Start logic
    let loopDate = new Date(entryDate);
    let yearsCompleted = 0;

    // Calculate 100 years into future max to prevent infinite loops if something is wrong
    // Stop when loopDate > today (meaning we have covered the current period)
    // Wait, if today is 2026-02-05 and entry is 2021-07-12
    // 2021 (0) -> 2022
    // 2022 (1) -> 2023
    // 2023 (2) -> 2024
    // 2024 (3) -> 2025
    // 2025 (4) -> 2026-07-12. Today fits here.

    // Condition: We want to generate the period that CONTAINS today.
    // So loop while start date of period <= today.

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
            status = 'Futuro';
        }

        // Entitlement based on years completed AT START of this period
        // For the first period (0-1 year), yearsCompleted is 0. Entitlement 0.
        // For the 5th period (4-5 year), yearsCompleted is 4. Entitlement 18.
        const days = getDaysForYear(yearsCompleted);

        // Calculations based on requests in this period
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

        // Show period if it's the current one OR if yearsCompleted > 0 (meaning we have entitlement history)
        // Or show all? Usually showing Year 0 with 0 days is fine for clarity "Antigüedad", but user might prefer hiding it.
        // Let's show all for completeness, or at least from Year 1.
        // If yearsCompleted === 0, days is 0.

        // User requested: "hasta el 12 de julio cumplo 5... hasta ese día me salen las vacaciones de 4 años"
        // This implies they expect to see the "4 year" period as the current/latest one.

        periods.push({
            id: `period-${yearsCompleted}`, // Use completed years as ID
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
        yearsCompleted++;
    }

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
            // Balance logic: Available - Taken - Pending
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
