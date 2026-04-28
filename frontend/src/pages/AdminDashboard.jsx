import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Shield, ArrowLeft, Search, Calendar, ChevronRight, User as UserIcon, BarChart3, Clock } from 'lucide-react';
import { adminService, authService } from '../services/api';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [userSessions, setUserSessions] = useState([]);
    const [viewingChat, setViewingChat] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const user = authService.getCurrentUser();
        if (!user || !user.isAdmin) {
            navigate('/dashboard');
            return;
        }
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [usersData, statsData] = await Promise.all([
                adminService.getUsers(),
                adminService.getStats()
            ]);
            setUsers(usersData.users || []);
            setStats(statsData.stats);
        } catch (err) {
            console.error('Failed to load admin data', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (user) => {
        try {
            setSelectedUser(user);
            setViewingChat(null);
            const data = await adminService.getUserSessions(user._id);
            setUserSessions(data.sessions || []);
        } catch (err) {
            console.error('Failed to load user sessions', err);
        }
    };

    const handleViewChat = async (sessionId) => {
        try {
            const data = await adminService.getSessionDetails(sessionId);
            setViewingChat(data.session);
        } catch (err) {
            console.error('Failed to load chat details', err);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="bg-mesh"></div>
                <div className="animate-pulse" style={{ width: '60px', height: '60px', borderRadius: '15px', backgroundColor: 'var(--accent-gold)' }}></div>
            </div>
        );
    }

    return (
        <div className="app-layout" style={{ overflowY: 'auto', display: 'block' }}>
            <div className="bg-mesh"></div>

            <div className="main-content" style={{ padding: '2rem 5%', overflow: 'visible', display: 'block' }}>
                <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--accent-gold)', marginBottom: '1rem' }}>
                            <Shield size={24} />
                            <span style={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', fontSize: '0.9rem' }}>Admin Control Panel</span>
                        </div>
                        <h1>System Oversight</h1>
                    </div>
                    <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft size={18} /> User Dashboard
                    </button>
                </header>

                {/* Stats Cards */}
                <div className="grid grid-cols-3" style={{ marginBottom: '3rem', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <Users size={20} color="var(--accent-gold)" />
                            <span className="badge badge-neutral">Total Users</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalUsers || 0}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <MessageSquare size={20} color="var(--accent-blue)" />
                            <span className="badge badge-neutral">Total Sessions</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.totalSessions || 0}</div>
                    </div>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <BarChart3 size={20} color="var(--accent-emerald)" />
                            <span className="badge badge-neutral">Active Queries</span>
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 800 }}>{stats?.activeSessions || 0}</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    {/* User List */}
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)' }}>
                            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>User Directory</h3>
                            <div style={{ position: 'relative' }}>
                                <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Search by name or email..."
                                    style={{ paddingLeft: '2.5rem', fontSize: '0.9rem' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div style={{ overflowY: 'auto', maxHeight: '600px' }}>
                            {filteredUsers.map(user => (
                                <div
                                    key={user._id}
                                    onClick={() => handleViewUser(user)}
                                    style={{
                                        padding: '1.25rem 1.5rem',
                                        borderBottom: '1px solid var(--border-color)',
                                        cursor: 'pointer',
                                        backgroundColor: selectedUser?._id === user._id ? 'rgba(255,255,255,0.05)' : 'transparent',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-tertiary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', fontWeight: 800 }}>
                                            {user.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div style={{ flexGrow: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
                                        </div>
                                        {user.isAdmin && <Shield size={14} color="var(--accent-gold)" />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Content View */}
                    <div className="glass-panel" style={{ borderRadius: 'var(--radius-lg)', padding: '2rem' }}>
                        {!selectedUser ? (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', opacity: 0.5 }}>
                                <Users size={48} style={{ marginBottom: '1.5rem' }} />
                                <p>Select a user to view their research history</p>
                            </div>
                        ) : !viewingChat ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Research History</div>
                                        <h2 style={{ marginBottom: '0.25rem' }}>{selectedUser.name}</h2>
                                        <p style={{ color: 'var(--text-muted)' }}>{selectedUser.email} • Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="badge badge-warning" style={{ textTransform: 'uppercase' }}>{selectedUser.isAdmin ? 'Admin' : 'User'} Account</div>
                                </div>

                                <div style={{ overflowY: 'auto', maxHeight: '500px', paddingRight: '0.5rem' }}>
                                    <div className="grid grid-cols-1" style={{ gap: '1rem' }}>
                                        {userSessions.length === 0 ? (
                                            <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                                No research sessions found for this user.
                                            </div>
                                        ) : (
                                            userSessions.map(session => (
                                                <div
                                                    key={session._id}
                                                    className="glass-card"
                                                    onClick={() => handleViewChat(session._id)}
                                                    style={{ padding: '1.25rem', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: session.isSolved ? 'var(--accent-emerald)' : 'var(--accent-gold)' }}>
                                                            <MessageSquare size={20} />
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{session.title}</div>
                                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={12} /> {new Date(session.updatedAt).toLocaleDateString()}</span>
                                                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Shield size={12} /> {session.messageCount} exchanges</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} color="var(--text-muted)" />
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <button className="btn-icon" onClick={() => setViewingChat(null)} style={{ background: 'rgba(255,255,255,0.05)' }}>
                                        <ArrowLeft size={18} />
                                    </button>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{viewingChat.title}</h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>Viewing transcript for {selectedUser.name}</p>
                                    </div>
                                </div>

                                <div style={{ flexGrow: 1, overflowY: 'auto', paddingRight: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', maxHeight: '500px' }}>
                                    {viewingChat.messages.map((msg, i) => (
                                        <div key={i} style={{
                                            padding: '1.25rem',
                                            borderRadius: 'var(--radius-md)',
                                            background: msg.role === 'user' ? 'rgba(255,255,255,0.03)' : 'var(--bg-tertiary)',
                                            border: msg.role === 'user' ? '1px solid var(--border-color)' : '1px solid rgba(251, 191, 36, 0.2)',
                                            marginLeft: msg.role === 'user' ? '2rem' : '0',
                                            marginRight: msg.role === 'assistant' ? '2rem' : '0'
                                        }}>
                                            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '0.75rem', color: msg.role === 'user' ? 'var(--text-muted)' : 'var(--accent-gold)' }}>
                                                {msg.role === 'user' ? selectedUser.name : 'Legal Query Assistant'}
                                            </div>
                                            <div style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
