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

    const handleGoogleLogin = () => {
        // In a real app, this would trigger Firebase/Google Auth
        login();
    };

    return (
        <div style={{
            height: '100vh',
            width: '100vw',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--color-main-background)',
            color: 'var(--color-text-primary)'
        }}>
            <div style={{
                backgroundColor: 'var(--color-secondary-background)',
                padding: '3rem',
                borderRadius: 'var(--border-radius)',
                boxShadow: 'var(--shadow-md)',
                textAlign: 'center',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>GeStore</h1>
                <p style={{ marginBottom: '2rem', color: 'var(--color-text-secondary)' }}>
                    Gestiona tus procesos internos
                </p>

                <button
                    onClick={handleGoogleLogin}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        width: '100%',
                        padding: '12px',
                        backgroundColor: '#ffffff',
                        color: '#3c4043',
                        border: '1px solid #dadce0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        fontWeight: 500,
                        transition: 'background-color 0.2s',
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                    {/* Google G Logo SVG */}
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" width="18px" height="18px" viewBox="0 0 48 48">
                        <g>
                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        </g>
                    </svg>
                    Sign in with Google
                </button>
            </div>
        </div>
    );
};

export default Login;
