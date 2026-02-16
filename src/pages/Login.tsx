import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import '../styles/theme.css'; // Ensure theme is loaded

const Login: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async () => {
        try {
            await login(); // Google Login (keep existing logic but attached to button)
        } catch (error) {
            console.error("Login failed:", error);
            alert("Error al iniciar sesión con Google.");
        }
    };

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password
            });
            if (error) throw error;
            // AuthContext will detect change and redirect
        } catch (err: any) {
            console.error("Email login error:", err);
            setError("Credenciales incorrectas o error de conexión.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-main-background)',
            color: 'var(--color-text-primary)',
            flexDirection: 'column'
        }}>
            <div style={{
                width: '100%',
                maxWidth: '400px',
                padding: '2rem',
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-lg)',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '2rem' }}>
                    <img src="/assets/logo_gestore_v2.png" alt="GeStore" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bienvenido</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Inicia sesión en GeStore</p>
                </div>

                {error && (
                    <div style={{
                        color: 'var(--color-danger)',
                        marginBottom: '1rem',
                        fontSize: '0.9rem',
                        padding: '0.5rem',
                        backgroundColor: 'rgba(226, 68, 92, 0.1)',
                        borderRadius: '4px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)'
                        }}
                    />
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--border-radius)',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'var(--color-background)',
                            color: 'var(--color-text-primary)'
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                        style={{
                            padding: '12px',
                            borderRadius: 'var(--border-radius)',
                            border: 'none',
                            backgroundColor: 'var(--color-primary)',
                            color: 'white',
                            fontWeight: 600,
                            cursor: 'pointer',
                            opacity: loading ? 0.7 : 1
                        }}
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <div style={{ margin: '1.5rem 0', borderTop: '1px solid var(--border-color)', position: 'relative' }}>
                    <span style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        backgroundColor: 'var(--color-surface)',
                        padding: '0 10px',
                        color: 'var(--color-text-muted)',
                        fontSize: '0.8rem'
                    }}>
                        O
                    </span>
                </div>

                <div style={{ opacity: 0.5, pointerEvents: 'none', filter: 'grayscale(1)' }}>
                    <button
                        onClick={handleLogin}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: 'white',
                            color: '#333',
                            border: '1px solid #ccc',
                            borderRadius: 'var(--border-radius)',
                            fontSize: '1rem',
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '10px',
                        }}
                        title="Google Login Deshabilitado Temporalmente"
                    >
                        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: '20px', height: '20px' }} />
                        Continua con Google
                    </button>
                </div>
            </div>

            <div style={{ marginTop: '2rem', color: 'var(--color-text-muted)', fontSize: '0.8rem' }}>
                Powered by Hazu 2026
            </div>
        </div>
    );
};

export default Login;
