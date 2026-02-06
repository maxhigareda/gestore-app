
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
    reason?: string;
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

    const parts = dateOfEntryStr.split('-');
    const entryYear = parseInt(parts[0]);
    const entryMonth = parseInt(parts[1]) - 1; // 0-indexed
    const entryDay = parseInt(parts[2]);

    const entryDate = new Date(entryYear, entryMonth, entryDay);
    const today = new Date();

    const periods: VacationPeriod[] = [];

    let loopDate = new Date(entryDate);
    let yearsCompleted = 0;

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

        periods.push({
            id: `period-${yearsCompleted}`,
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

    // We reverse to show newest first
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

        // Math consistency: Entitled = Taken + Pending + Expired + Remaining
        if (p.status === 'Vencido') {
            // If expired, whatever wasn't taken or pending is lost (expired)
            // Note: If you have a pending request in an expired period, it's counted in 'future'
            // properly, and removed from expired to avoid double counting.
            const unused = Math.max(0, p.days_entitled - p.days_taken - p.days_pending);
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
