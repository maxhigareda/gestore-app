import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
    id: string;
    name: string; // e.g., "Max Torres"
    role: string; // e.g., "Desarrollador"
    photoUrl?: string;
    firstName: string; // "Max"
}

interface AuthContextType {
    user: User | null;
    login: () => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    const login = () => {
        // Mock login logic
        setUser({
            id: '123',
            name: 'Max Torres',
            firstName: 'Max',
            role: 'Administrador',
            photoUrl: '', // Empty initially as requested
        });
    };

    const logout = () => {
        setUser(null);
    };

    const isAuthenticated = !!user;

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
