import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    photoUrl?: string;
    department?: string;
    location?: string;
    joinDate?: string;
}

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

        // 3. Safety Timeout (Fallback)
        const timeout = setTimeout(() => {
            setIsLoading(prev => {
                if (prev) {
                    console.warn("Auth check timed out, forcing load.");
                    return false;
                }
                return prev;
            });
        }, 5000); // 5 seconds

        return () => {
            subscription.unsubscribe();
            clearTimeout(timeout);
        };
    }, []);

    const mapUser = (supabaseUser: any) => {
        // Map Supabase user metadata to our App's User interface
        // We need to fetch additional profile data if not present in metadata
        // For now, let's assume we might need to fetch profile separate or rely on metadata if synced.
        // But since we are using 'profiles' table, we should ideally fetch from there or rely on what we have.
        // If we can't fetch strictly here without async, we might default.
        // However, 'user_metadata' might not have job_title unless we sync it.

        // BETTER APPROACH: We already fetch profile in FichaPage. 
        // But the Sidebar needs it globally. 
        // Let's try to fetch the profile here quickly or fallback.

        // Actually, let's just use a default for now and rely on the Portal/Sidebar to fetch if needed?
        // No, user wants it "where it says hola max". That's SecondarySidebar.
        // SecondarySidebar uses `user.role`.

        // Let's just update this mapUser to try to get it from metadata if available, 
        // OR we should perform a DB fetch here.

        // Fetching profile...
        supabase
            .from('profiles')
            .select('job_title')
            .eq('id', supabaseUser.id)
            .single()
            .then(({ data }) => {
                const newUser: User = {
                    id: supabaseUser.id,
                    name: supabaseUser.user_metadata.full_name || supabaseUser.email?.split('@')[0] || 'Usuario',
                    email: supabaseUser.email || '',
                    role: data?.job_title || 'Colaborador', // Use DB job_title
                    photoUrl: supabaseUser.user_metadata.avatar_url || '',
                    department: 'General',
                    location: 'Oficina Central',
                    joinDate: new Date(supabaseUser.created_at).toLocaleDateString()
                };
                setUser(newUser);
                setIsLoading(false);
            });
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
            {(!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) ? (
                <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', backgroundColor: '#1e1e1e', color: '#ff4d4f' }}>
                    <h1 style={{ marginBottom: '1rem', fontSize: '2rem' }}>⚠️ Configuración Faltante</h1>
                    <p style={{ maxWidth: '600px', lineHeight: '1.6', fontSize: '1.2rem' }}>
                        No se detectaron las variables de entorno de Supabase en Vercel.
                    </p>
                    <div style={{ marginTop: '2rem', textAlign: 'left', backgroundColor: '#000', padding: '1.5rem', borderRadius: '8px', color: '#0f0', fontFamily: 'monospace' }}>
                        VITE_SUPABASE_URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Definido' : '❌ Faltante'}<br />
                        VITE_SUPABASE_ANON_KEY: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Definido' : '❌ Faltante'}
                    </div>
                    <p style={{ marginTop: '2rem', color: '#aaa' }}>
                        Por favor, ve a <strong>Vercel &gt; Settings &gt; Environment Variables</strong> y agrégalas.
                    </p>
                </div>
            ) : (
                !isLoading && children
            )}
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
