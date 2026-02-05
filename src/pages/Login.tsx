import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import '../styles/theme.css'; // Ensure theme is loaded

const Login: React.FC = () => {
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async () => {
        try {
            await login();
        } catch (error) {
            console.error("Login failed:", error);
            alert("Error al iniciar sesión con Google.");
        }
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-text-primary)'
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
                    <img src="/assets/GeStore.png" alt="GeStore" style={{ height: '60px', marginBottom: '1rem' }} />
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Bienvenido</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Inicia sesión en GeStore</p>
                </div>

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
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        transition: 'background-color 0.2s',
                        marginTop: '1rem'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                    <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="G" style={{ width: '20px', height: '20px' }} />
                    Continua con Google
                </button>
            </div>
        </div>
    );
};

export default Login;
