import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, CheckCircle, Scale, Building2, BookOpen, AlertTriangle, FileText, ChevronDown, ChevronRight, Loader2, User, Info } from 'lucide-react';
import { chatService } from '../services/api';

// Legal disclaimer component
const LegalDisclaimer = () => (
    <div style={{ backgroundColor: 'var(--accent-gold-transparent)', border: '1px solid var(--border-focus)', borderRadius: 'var(--radius-md)', padding: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <Info size={24} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <strong style={{ color: 'var(--accent-gold)' }}>Statutory Research Notice:</strong> This AI agent retrieves information specifically from the provided statutory corpus. While it provides precise citations, this does not constitute legal advice. Always cross-reference with official gazettes.
        </div>
    </div>
);

// Source citation component
const CitationSource = ({ source, index }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div style={{ backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', marginBottom: '0.75rem', overflow: 'hidden', transition: 'all 0.2s' }}>
            <div
                onClick={() => setExpanded(!expanded)}
                style={{ padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', backgroundColor: expanded ? 'rgba(255,255,255,0.03)' : 'transparent' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexGrow: 1, minWidth: 0 }}>
                    <div style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '6px',
                        backgroundColor: 'var(--bg-tertiary)',
                        color: 'var(--accent-gold)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        border: '1px solid var(--border-color)'
                    }}>
                        #{index + 1}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {source.act_name} {source.year && `(${source.year})`}
                        </span>
                        {source.section && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                Section {source.section}: {source.section_title}
                            </span>
                        )}
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                    <div className="badge badge-neutral" style={{ fontSize: '0.65rem', border: 'none', background: 'rgba(255,255,255,0.05)' }}>
                        {Math.round(source.similarity * 100)}% relevance
                    </div>
                    {expanded ? <ChevronDown size={18} color="var(--text-muted)" /> : <ChevronRight size={18} color="var(--text-muted)" />}
                </div>
            </div>

            {expanded && (
                <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.2)', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', color: 'var(--accent-emerald)' }}>
                        <FileText size={16} />
                        <span style={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem' }}>Official Clause Text</span>
                    </div>
                    <p style={{ whiteSpace: 'pre-wrap', margin: 0, paddingLeft: '1rem', borderLeft: '2px solid var(--accent-emerald-transparent)' }}>
                        {source.text}
                    </p>
                </div>
            )}
        </div>
    );
};

export default function Chat() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        loadSession();
    }, [id]);

    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (isInitialLoad.current && messages.length > 0) {
            scrollToBottom();
            isInitialLoad.current = false;
        } else if (sending) {
            scrollToBottom();
        }
    }, [messages, sending]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const loadSession = async () => {
        try {
            setLoading(true);
            const data = await chatService.getSession(id);
            setSession(data.session);
            setMessages(data.session.messages || []);
        } catch (err) {
            console.error('Failed to load session', err);
            navigate('/dashboard');
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async (e) => {
        e.preventDefault();
        if (!query.trim() || sending) return;

        const userQuery = query.trim();
        setQuery('');
        setSending(true);

        const tempUserMessage = { _id: Date.now().toString(), role: 'user', content: userQuery, sources: [] };
        setMessages(prev => [...prev, tempUserMessage]);

        try {
            const data = await chatService.sendQuery(id, userQuery);
            setMessages(prev => {
                const withoutTemp = prev.filter(m => m._id !== tempUserMessage._id);
                return [...withoutTemp, ...data.messages];
            });

            if (session.title === 'New Legal Query' && data.session.title !== 'New Legal Query') {
                setSession(prev => ({ ...prev, title: data.session.title }));
            }
        } catch (err) {
            console.error('Failed to send query', err);
            setMessages(prev => prev.filter(m => m._id !== tempUserMessage._id));
            alert('Could not reach the legal engine. Please check your connection.');
            setQuery(userQuery);
        } finally {
            setSending(false);
        }
    };

    const markAsSolved = async () => {
        try {
            await chatService.solveSession(id);
            setSession(prev => ({ ...prev, isSolved: true }));
        } catch (err) {
            console.error('Failed to mark as solved', err);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <div className="bg-mesh"></div>
                <Loader2 size={40} color="var(--accent-gold)" className="animate-spin" />
            </div>
        );
    }

    return (
        <div className="app-layout">
            <div className="bg-mesh"></div>
            <div className="main-content">

                {/* Professional Sticky Header */}
                <header className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <button className="btn-icon" onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <ArrowLeft size={18} />
                        </button>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{session?.title || 'Statutory Inquiry'}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                                <span className={`badge ${session?.isSolved ? 'badge-success' : 'badge-warning'}`} style={{ fontSize: '0.65rem' }}>
                                    {session?.isSolved ? 'RESOLVED' : 'ACTIVE SESSION'}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                                    Case ID: {id.substring(0, 8).toUpperCase()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {!session?.isSolved && (
                        <button className="btn btn-secondary" onClick={markAsSolved} style={{ padding: '0.6rem 1.25rem', fontSize: '0.85rem' }}>
                            <CheckCircle size={16} color="var(--accent-emerald)" /> Mark as Resolved
                        </button>
                    )}
                </header>

                {/* Message Scroll Area */}
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '3rem 1.5rem' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>

                        <LegalDisclaimer />

                        {messages.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '6rem 0' }} className="animate-fade-in">
                                <div style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '20px',
                                    background: 'linear-gradient(135deg, var(--accent-gold), #d97706)',
                                    marginBottom: '2rem',
                                    boxShadow: '0 0 30px var(--accent-gold-glow)'
                                }}>
                                    <Scale size={40} color="#000" />
                                </div>
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Enter Statutory Inquiry</h2>
                                <p style={{ maxWidth: '500px', margin: '0 auto 3rem', color: 'var(--text-secondary)' }}>
                                    Ask any legal question. Our RAG engine will find the exact sections and relevant clauses for your research.
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
                                    <button className="btn btn-secondary" onClick={() => setQuery("What are the key provisions for data privacy within the act?")}>
                                        Data Privacy Provisions
                                    </button>
                                    <button className="btn btn-secondary" onClick={() => setQuery("Define the penalties for unauthorized access to the database.")}>
                                        Penalty Definitions
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
                                {messages.map((msg, index) => (
                                    <div key={msg._id || index} style={{
                                        display: 'flex',
                                        gap: '1.5rem',
                                        flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                                        alignItems: 'flex-start'
                                    }}>
                                        {/* Avatar */}
                                        <div style={{ flexShrink: 0, marginTop: '0.25rem' }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: msg.role === 'user' ? 'var(--bg-tertiary)' : 'linear-gradient(135deg, var(--accent-gold), #d97706)',
                                                border: '1px solid var(--border-color)',
                                                boxShadow: msg.role === 'assistant' ? '0 0 15px var(--accent-gold-transparent)' : 'none'
                                            }}>
                                                {msg.role === 'user' ? <User size={20} color="var(--text-secondary)" /> : <Scale size={20} color="#000" />}
                                            </div>
                                        </div>

                                        {/* Message Bubble */}
                                        <div style={{ maxWidth: '80%', minWidth: 0 }}>
                                            <div className="glass-card" style={{
                                                padding: '1.5rem',
                                                background: msg.role === 'user' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(12, 18, 29, 0.95)',
                                                borderTopRightRadius: msg.role === 'user' ? '4px' : 'var(--radius-lg)',
                                                borderTopLeftRadius: msg.role === 'assistant' ? '4px' : 'var(--radius-lg)',
                                                border: msg.role === 'user' ? '1px solid rgba(255, 255, 255, 0.2)' : '1px solid rgba(255, 255, 255, 0.2)',
                                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)'
                                            }}>
                                                <div
                                                    style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word', lineHeight: 1.8, fontSize: '1.05rem' }}
                                                    dangerouslySetInnerHTML={{
                                                        __html: (msg.content || '')
                                                            .replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                                            .replace(/\*\*(.*?)\*\*/g, '<strong style="color: var(--accent-gold);">$1</strong>')
                                                    }}
                                                />
                                            </div>

                                            {/* Specialized Citations Block */}
                                            {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                                                <div style={{ marginTop: '1.25rem' }} className="animate-fade-in">
                                                    <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                                        <BookOpen size={14} color="var(--accent-gold)" /> Verified Statutory Citations
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                        {msg.sources.map((source, i) => (
                                                            <CitationSource key={i} source={source} index={i} />
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {sending && (
                                    <div style={{ display: 'flex', gap: '1.5rem' }} className="animate-fade-in">
                                        <div style={{ flexShrink: 0 }}>
                                            <div style={{
                                                width: '44px', height: '44px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                background: 'linear-gradient(135deg, var(--accent-gold), #d97706)'
                                            }}>
                                                <Loader2 size={24} color="#000" className="animate-spin" />
                                            </div>
                                        </div>
                                        <div className="glass-card" style={{ padding: '1.5rem', borderTopLeftRadius: '4px', minWidth: '120px' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)' }}></div>
                                                <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', animationDelay: '200ms' }}></div>
                                                <div className="animate-pulse" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--accent-gold)', animationDelay: '400ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Input Bottom Bar */}
                <div style={{ padding: '2rem', borderTop: '1px solid var(--border-color)', background: 'rgba(5, 8, 15, 0.5)', backdropFilter: 'blur(20px)' }}>
                    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                        <form onSubmit={handleSend} style={{ position: 'relative' }}>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={session?.isSolved ? "Closed Session - start a new inquiry to continue research." : "Search within statutory acts (e.g. 'What are the disclosure requirements?')"}
                                disabled={sending || session?.isSolved}
                                className="chat-input-field"
                            />
                            <button
                                type="submit"
                                disabled={!query.trim() || sending || session?.isSolved}
                                style={{
                                    position: 'absolute',
                                    right: '0.8rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '14px',
                                    backgroundColor: query.trim() && !sending && !session?.isSolved ? 'var(--accent-gold)' : 'var(--bg-tertiary)',
                                    color: query.trim() && !sending && !session?.isSolved ? '#000' : 'var(--text-muted)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: 'none',
                                    cursor: query.trim() && !sending && !session?.isSolved ? 'pointer' : 'not-allowed',
                                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    boxShadow: query.trim() && !sending && !session?.isSolved ? '0 0 20px var(--accent-gold-glow)' : 'none',
                                }}
                            >
                                {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                            </button>
                        </form>
                        <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            STATUTORY ENGINE V1.2 • AGGRESSIVE RAG OPTIMIZATION ACTIVE
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}

