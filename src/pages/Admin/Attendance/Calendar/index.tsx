import React, { useState, useMemo } from 'react';
import { useUnifiedRequests, type UnifiedRequest } from '../../../../hooks/useUnifiedRequests';
import { useAuth } from '../../../../context/AuthContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter } from 'lucide-react';

const CalendarPage: React.FC = () => {
    const { user } = useAuth();
    const { requests } = useUnifiedRequests(user?.id || '');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedArea, setSelectedArea] = useState('Todas'); // Placeholder for Area Filter

    // Filter Logic
    const filteredRequests = useMemo(() => {
        let filtered = requests.filter(r => r.status === 'Aprobada' || r.status === 'Solicitada'); // Show pending too? Google Cal usually shows confirmed. User said "veremos las vacaciones...". Let's show approved primarily, maybe pending in lighter color?
        // Logic: Show Approved Only for clean view, or both.
        // Let's show "Aprobada" as solid, "Solicitada" as striped/lighter.
        return filtered;
    }, [requests]);

    // Calendar Grid Logic
    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year: number, month: number) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Adjust to Monday start (0=Mon, 6=Sun)
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    // Generate Grid
    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null); // Empty slots
    for (let i = 1; i <= daysInMonth; i++) calendarDays.push(new Date(year, month, i));

    // Navigation
    const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
    const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

    // Events for a specific day
    const getEventsForDay = (date: Date) => {
        return filteredRequests.filter(req => {
            const start = new Date(req.startDate);
            const end = new Date(req.endDate);
            // Reset hours for comparison
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);
            return date >= start && date <= end;
        });
    };

    // Summary Counts (Current Month)
    const vacationCount = filteredRequests.filter(r => r.type === 'vacation' && new Date(r.startDate).getMonth() === month).length;
    const permissionCount = filteredRequests.filter(r => r.type === 'permission' && new Date(r.startDate).getMonth() === month).length;

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column' }}>

            {/* Header & Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Calendario de Asistencia</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Visualiza vacaciones y permisos del equipo.</p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>

                    {/* Area Filter Mockup */}
                    <div style={{ position: 'relative' }}>
                        <Filter size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                        <select
                            value={selectedArea}
                            onChange={(e) => setSelectedArea(e.target.value)}
                            style={{ padding: '10px 10px 10px 32px', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-primary)' }}
                        >
                            <option value="Todas">Todas las Áreas</option>
                            <option value="IT">Tecnología</option>
                            <option value="RH">Recursos Humanos</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--border-color)', padding: '4px' }}>
                        <button onClick={prevMonth} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}><ChevronLeft size={20} /></button>
                        <span style={{ padding: '0 1rem', fontWeight: 600, minWidth: '140px', textAlign: 'center' }}>{monthNames[month]} {year}</span>
                        <button onClick={nextMonth} style={{ padding: '8px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-primary)' }}><ChevronRight size={20} /></button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <SummaryCard title="Vacaciones este mes" count={vacationCount} color="var(--color-primary)" icon={<CalendarIcon size={20} />} />
                <SummaryCard title="Permisos este mes" count={permissionCount} color="purple" icon={<CalendarIcon size={20} />} />
            </div>

            {/* Calendar Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                backgroundColor: 'var(--border-color)',
                gap: '1px',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                {/* Weekday Headers */}
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                    <div key={day} style={{ backgroundColor: 'var(--color-secondary-background)', padding: '10px', textAlign: 'center', fontWeight: 600, fontSize: '0.9rem' }}>
                        {day}
                    </div>
                ))}

                {/* Days */}
                {calendarDays.map((date, idx) => {
                    if (!date) return <div key={`empty-${idx}`} style={{ backgroundColor: 'var(--color-surface)', minHeight: '120px' }} />;

                    const events = getEventsForDay(date);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                        <div key={date.toISOString()} style={{ backgroundColor: 'var(--color-surface)', minHeight: '120px', padding: '8px', position: 'relative' }}>
                            <div style={{
                                textAlign: 'right',
                                marginBottom: '4px',
                                fontSize: '0.9rem',
                                fontWeight: isToday ? 'bold' : 'normal',
                                color: isToday ? 'var(--color-primary)' : 'inherit'
                            }}>
                                {date.getDate()}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {events.slice(0, 3).map(ev => (
                                    <EventBar key={ev.id} event={ev} />
                                ))}
                                {events.length > 3 && (
                                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', cursor: 'pointer', textAlign: 'center' }}>
                                        + {events.length - 3} más
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const SummaryCard = ({ title, count, color, icon }: any) => (
    <div style={{
        backgroundColor: 'var(--color-surface)',
        padding: '1.5rem',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
    }}>
        <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: color, color: 'white', opacity: 0.8 }}>
            {icon}
        </div>
        <div>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{title}</p>
            <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{count}</h3>
        </div>
    </div>
);

const EventBar = ({ event }: { event: UnifiedRequest }) => {
    const isVacation = event.type === 'vacation';
    const bgColor = isVacation ? 'var(--color-primary)' : '#9333ea'; // Green/Blue vs Purple

    // Initials or Short Name: First Name + Initial
    const names = event.userName.split(' ');
    const shortName = `${names[0]} ${names[1] ? names[1].charAt(0) + '.' : ''}`;

    return (
        <div style={{
            backgroundColor: bgColor,
            color: 'white',
            fontSize: '0.75rem',
            padding: '2px 4px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            cursor: 'default',
            opacity: event.status === 'Solicitada' ? 0.6 : 1 // Dim if pending
        }} title={`${event.userName} - ${event.type}`}>
            {shortName}
        </div>
    );
}

export default CalendarPage;
