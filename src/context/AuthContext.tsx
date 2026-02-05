import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User } from '../utils/mockData'; // Keeping User type for now, but mapping from Supabase

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 1. Get initial session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session?.user) {
                mapUser(session.user);
            } else {
                setIsLoading(false);
            }
        });

        // 2. Listen for changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session?.user) {
                mapUser(session.user);
            } else {
                setUser(null);
                setIsLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const mapUser = (supabaseUser: any) => {
        // Map Supabase user metadata to our App's User interface
        const newUser: User = {
            id: supabaseUser.id,
            name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'Usuario',
            email: supabaseUser.email || '',
            role: 'Colaborador', // Default role for now
            photoUrl: supabaseUser.user_metadata.avatar_url || '',
            department: 'General',
            location: 'Oficina Central',
            joinDate: new Date(supabaseUser.created_at).toLocaleDateString()
        };
        setUser(newUser);
        setIsLoading(false);
    };

    const login = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: window.location.origin + '/portal' // Redirect back to app
            }
        });
        if (error) throw error;
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!session, login, logout, isLoading }}>
            {!isLoading && children}
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
