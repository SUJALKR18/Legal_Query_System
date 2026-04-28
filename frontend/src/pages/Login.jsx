import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Scale, Lock, Mail, ArrowRight, ChevronLeft } from 'lucide-react';
import { authService } from '../services/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await authService.login({ email, password });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to login. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div className="bg-mesh"></div>

            {/* Back to Home */}
            <div style={{ padding: '2rem' }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: 500,
                        transition: 'color 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.color = 'var(--text-primary)'}
                    onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                >
                    <ChevronLeft size={20} /> Back to Home
                </button>
            </div>

            <div className="container" style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
                <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '3rem', position: 'relative' }}>

                    <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                        <div style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '64px',
                            height: '64px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, var(--accent-gold), #d97706)',
                            marginBottom: '1.5rem',
                            boxShadow: '0 0 20px var(--accent-gold-glow)'
                        }}>
                            <Scale size={32} color="#000" />
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>Welcome Back</h1>
                        <p style={{ color: 'var(--text-secondary)' }}>Sign in to continue your legal research</p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: 'var(--radius-md)',
                            color: '#ef4444',
                            marginBottom: '2rem',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem'
                        }}>
                            <span>⚠️</span>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin}>
                        <div className="input-group">
                            <label className="input-label" htmlFor="email">Email Address</label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '1.25rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    className="input-field"
                                    placeholder="name@firm.com"
                                    style={{ paddingLeft: '3.25rem' }}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="input-group" style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="input-label" htmlFor="password">Password</label>
                                <a href="#" style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', textDecoration: 'none' }}>Forgot password?</a>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '1.25rem', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    className="input-field"
                                    placeholder="••••••••"
                                    style={{ paddingLeft: '3.25rem' }}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem' }} disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                            {!loading && <ArrowRight size={20} />}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)' }}>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>
                            New to the system? <Link to="/signup" style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600 }}>Create an account</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

