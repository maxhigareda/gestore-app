export interface UserProfile {
    // Personal Info
    photoUrl?: string; // Empty for now
    firstName: string;
    lastName: string;
    role: string;
    rfc: string;
    email: string;
    birthDate: string; // YYYY-MM-DD
    address: string;
    dateOfEntry: string; // YYYY-MM-DD

    // Resumen Fields
    area: string;
    division: string;
    company: string;
    costCenter: string;
    supervisor: string;
    team: string; // 'Equipo'
    substitute: string; // 'Suplente'
    regimeType: string; // 'Tipo de régimen'
    workLocation: string; // 'Ubicación del trabajo'
    patronalRegistration: string; // 'Registro Patronal'
    contractType: string;
    companyEntryDate: string; // 'Fecha de Ingreso Compañía'
    vacationBalance: number;

    // Contact & Extended Personal
    phoneOffice?: string;
    phonePersonal?: string;
    emailPersonal?: string;
    maritalStatus?: string;
    birthCountry?: string; // 'México' or 'Otro'
    documentType?: string; // RFC vs Other
    curp?: string;
    nss?: string;
    paymentMethod?: string;
    emergencyName?: string;
    emergencyPhone?: string;

    // New Fields (Advanced)
    salary?: number;
    shift?: string;
    schedule?: string;
    workDays?: string[];
    compensationType?: string;
}

export const MOCK_USER_PROFILE: UserProfile = {
    firstName: 'Max',
    lastName: 'Torres',
    role: 'Desarrollador Full Stack',
    rfc: 'XAXX010101000',
    email: 'max.torres@ge-store.com',
    birthDate: '1995-05-15',
    address: 'Av. Reforma 222, CDMX',
    dateOfEntry: '2022-01-10',

    area: 'Tecnología',
    division: 'Sistemas',
    company: 'Store Intelligence',
    costCenter: 'CC-001-TECH',
    supervisor: 'Carlos Manager',
    team: 'Desarrollo Web',
    substitute: 'N/A',
    regimeType: 'Sueldos y Salarios',
    workLocation: 'Oficinas Centrales',
    patronalRegistration: 'Y554433221',
    contractType: 'Indeterminado',
    companyEntryDate: '2022-01-10',
    vacationBalance: 12
};

export interface VacationRequest {
    id: string;
    startDate: string;
    endDate: string;
    days: number;
    type: string;
    status: 'Aprobado' | 'Solicitada';
}

export interface VacationAccrual {
    id: string;
    date: string;
    days: number;
    type: string;
    expirationDate: string;
    period: string;
}

export const MOCK_VACATION_REQUESTS: VacationRequest[] = Array.from({ length: 10 }, (_, i) => ({
    id: `vac-${i}`,
    startDate: `2024-0${(i % 9) + 1}-10`,
    endDate: `2024-0${(i % 9) + 1}-15`,
    days: 5,
    type: 'Legales Store Intelligence',
    status: i % 3 === 0 ? 'Solicitada' : 'Aprobado', // Mix of statuses
}));

export const MOCK_VACATION_ACCRUALS: VacationAccrual[] = [
    { id: 'acc-1', date: '12-07-2025', days: 18.0, type: 'Legales Store Intelligence', expirationDate: '12-01-2026', period: '2024-2025' },
    { id: 'acc-2', date: '12-07-2024', days: 14.0, type: 'Legales Store Intelligence', expirationDate: '12-01-2025', period: '2023-2024' },
];

export const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const now = new Date();
    let age = now.getFullYear() - birth.getFullYear();
    const m = now.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
        age--;
    }
    return age;
};
