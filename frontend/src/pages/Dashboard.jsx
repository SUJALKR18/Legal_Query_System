import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, MessageSquare, Clock, CheckCircle, ArrowRight, LogOut, Scale, Search, LayoutDashboard, Shield } from 'lucide-react';
import { chatService, authService } from '../services/api';
import api from '../services/api';

export default function Dashboard() {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, solved
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = authService.getCurrentUser();
        setUser(currentUser);

        // Refresh profile to ensure Admin status is current
        const refreshProfile = async () => {
            try {
                const response = await api.get('/auth/profile');
                if (response.data.user) {
                    const updatedUser = response.data.user;
                    localStorage.setItem('legal_user', JSON.stringify(updatedUser));
                    setUser(updatedUser);
                }
            } catch (err) {
                console.error('Failed to refresh profile', err);
            }
        };

        refreshProfile();
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            const data = await chatService.getSessions();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error('Failed to load sessions', err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSession = async () => {
        try {
            const data = await chatService.createSession('New Legal Query');
            navigate(`/chat/${data.session._id}`);
        } catch (err) {
            console.error('Failed to create session', err);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const filteredSessions = sessions.filter(s => {
        if (filter === 'active') return !s.isSolved;
        if (filter === 'solved') return s.isSolved;
        return true;
    });

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        }).format(date);
    };

    return (
        <div className="app-layout">
            <div className="bg-mesh"></div>

            {/* Professional Sidebar */}
            <div className="sidebar glass-panel">
                <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--accent-gold), #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 10px var(--accent-gold-glow)'
                    }}>
                        <Scale size={20} color="#000" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-primary)' }}>Legal Query System</span>
                </div>

                <div style={{ padding: '0 1.5rem 1.5rem', flexGrow: 1 }}>
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', marginBottom: '2.5rem', boxShadow: '0 0 20px var(--accent-gold-transparent)' }}
                        onClick={handleCreateSession}
                    >
                        <Plus size={18} /> New Research Session
                    </button>

                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '1rem', paddingLeft: '0.5rem' }}>
                            Workspace
                        </div>
                        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {[
                                { id: 'all', icon: <LayoutDashboard size={18} />, label: 'All Queries' },
                                { id: 'active', icon: <Clock size={18} />, label: 'Active Tasks', color: 'var(--accent-gold)' },
                                { id: 'solved', icon: <CheckCircle size={18} />, label: 'Resolved Case', color: 'var(--accent-emerald)' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    className={`btn ${filter === item.id ? 'btn-secondary' : 'btn-icon'}`}
                                    style={{
                                        width: '100%',
                                        justifyContent: 'flex-start',
                                        padding: '0.75rem 1rem',
                                        backgroundColor: filter === item.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        border: filter === item.id ? '1px solid var(--border-color)' : '1px solid transparent',
                                        color: filter === item.id ? 'var(--text-primary)' : 'var(--text-secondary)'
                                    }}
                                    onClick={() => setFilter(item.id)}
                                >
                                    <span style={{ color: item.color || 'inherit' }}>{item.icon}</span>
                                    {item.label}
                                </button>
                            ))}

                            {user?.isAdmin && (
                                <button
                                    className="btn btn-icon"
                                    style={{ width: '100%', justifyContent: 'flex-start', padding: '0.75rem 1rem', marginTop: '1rem', color: 'var(--accent-gold)' }}
                                    onClick={() => navigate('/admin')}
                                >
                                    <Shield size={18} /> Admin Oversight
                                </button>
                            )}
                        </nav>
                    </div>
                </div>

                {/* User Profile */}
                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            backgroundColor: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 700,
                            color: 'var(--accent-gold)',
                            flexShrink: 0
                        }}>
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Professional Plan</span>
                        </div>
                    </div>
                    <button className="btn-icon" onClick={handleLogout} title="Sign Out">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content" style={{ overflowY: 'auto' }}>
                <div style={{ padding: '4rem 5%', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>

                    <header style={{ marginBottom: '4rem' }} className="animate-fade-in">
                        <h1 style={{ marginBottom: '0.75rem' }}>Research Dashboard</h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)' }}>Manage your statutory research sessions and AI-powered insights.</p>
                    </header>

                    {loading ? (
                        <div style={{ display: 'flex', justifyContent: 'center', padding: '10rem 0' }}>
                            <div className="animate-pulse" style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'var(--accent-gold)', boxShadow: '0 0 20px var(--accent-gold-glow)' }}></div>
                        </div>
                    ) : filteredSessions.length === 0 ? (
                        <div className="glass-card animate-fade-in" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                backgroundColor: 'rgba(251, 191, 36, 0.05)',
                                marginBottom: '2rem',
                                color: 'var(--accent-gold)'
                            }}>
                                <Search size={40} />
                            </div>
                            <h2>No research found</h2>
                            <p style={{ marginBottom: '2.5rem', maxWidth: '450px', margin: '0 auto 2.5rem' }}>
                                {filter === 'all'
                                    ? "Start your first research session to leverage AI for complex statutory queries."
                                    : `We couldn't find any ${filter} queries in your workspace.`}
                            </p>
                            {filter === 'all' && (
                                <button className="btn btn-primary" onClick={handleCreateSession} style={{ padding: '1rem 2.5rem' }}>
                                    Launch New Session
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3">
                            {filteredSessions.map((session, index) => (
                                <div
                                    key={session._id}
                                    className="glass-card animate-fade-in"
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        padding: '1.75rem',
                                        cursor: 'pointer',
                                        height: '260px',
                                        animationDelay: `${index * 50}ms`
                                    }}
                                    onClick={() => navigate(`/chat/${session._id}`)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                        <div className={`badge ${session.isSolved ? 'badge-success' : 'badge-warning'}`}>
                                            {session.isSolved ? 'Resolved' : 'In Progress'}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {formatDate(session.updatedAt)}
                                        </div>
                                    </div>

                                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {session.title}
                                    </h3>

                                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '1.5rem' }}>
                                        {session.lastMessage || 'Beginning research session...'}
                                    </p>

                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        paddingTop: '1.25rem',
                                        borderTop: '1px solid var(--border-color)',
                                        marginTop: 'auto'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            <MessageSquare size={14} /> {session.messageCount} exchanges
                                        </div>
                                        <div style={{ color: 'var(--accent-gold)' }}>
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

