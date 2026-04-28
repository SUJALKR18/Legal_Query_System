import { useNavigate } from 'react-router-dom';
import { Scale, Shield, Zap, Search, Globe, ChevronRight, MessageSquare, BookOpen, CheckCircle } from 'lucide-react';

export default function Landing() {
    const navigate = useNavigate();

    return (
        <div style={{ position: 'relative', overflowX: 'hidden' }}>
            <div className="bg-mesh"></div>

            {/* Premium Background Layer */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url('file:///C:/Users/sujal/.gemini/antigravity/brain/1718731e-f706-4971-b4ae-3503c7a4bada/legal_tech_background_1777312707838.png')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: 0.08,
                pointerEvents: 'none',
                zIndex: -1
            }}></div>

            {/* Navbar */}
            <nav style={{
                padding: '1.5rem 2rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                maxWidth: '1200px',
                margin: '0 auto',
                width: '100%'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--accent-gold), #d97706)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px var(--accent-gold-glow)'
                    }}>
                        <Scale size={24} color="#000" />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Legal Query System</span>
                </div>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <button className="btn btn-outline" onClick={() => navigate('/login')}>Login</button>
                    <button className="btn btn-primary" onClick={() => navigate('/signup')}>Get Started</button>
                </div>
            </nav>

            {/* Hero Section */}
            <section style={{
                padding: '5rem 0',
                textAlign: 'center',
                position: 'relative'
            }}>
                <div className="container">
                    <div style={{ maxWidth: '850px', margin: '0 auto' }} className="animate-fade-in">
                        <div className="badge badge-warning" style={{ marginBottom: '1.5rem' }}>
                            Trusted Legal Research Tool
                        </div>
                        <h1 style={{ marginBottom: '1.5rem', fontSize: 'clamp(2rem, 5vw, 3rem)' }}>
                            Advanced <span className="text-gold">Statutory Retrieval</span> & Research Assistant
                        </h1>
                        <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
                            Empower your legal practice with a precision-tuned RAG system.
                            Instantly retrieve exact citations, verified clause text, and jurisdictional insights across
                            our extensive library of national acts and statutory frameworks.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button className="btn btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/signup')}>
                                Start Researching Now <ChevronRight size={20} />
                            </button>
                            <button className="btn btn-secondary" style={{ padding: '0.75rem 2rem', fontSize: '1rem' }} onClick={() => navigate('/login')}>
                                View Demo
                            </button>
                        </div>
                    </div>
                </div>

                {/* Glass Mockup */}
                <div className="container" style={{ marginTop: '4rem' }}>
                    <div className="glass-panel animate-fade-in" style={{
                        borderRadius: 'var(--radius-xl)',
                        padding: '1rem',
                        border: '1px solid var(--border-color)',
                        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.5)',
                        maxWidth: '1000px',
                        margin: '0 auto',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <div style={{ height: '400px', borderRadius: 'var(--radius-lg)', background: 'var(--bg-primary)', overflow: 'hidden', position: 'relative', display: 'flex' }}>
                            {/* Fake Chat Sidebar */}
                            <div style={{ width: '220px', height: '100%', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1.25rem', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                                <div style={{ height: '12px', width: '60%', background: 'var(--accent-gold)', opacity: 0.3, borderRadius: '2px', marginBottom: '1rem' }}></div>
                                {[
                                    "Privacy Compliance Research",
                                    "Statutory Penalties Review",
                                    "Disclosure Requirements",
                                    "Authorization Framework"
                                ].map((txt, i) => (
                                    <div key={i} style={{ padding: '0.75rem', background: i === 0 ? 'rgba(255,255,255,0.05)' : 'transparent', borderRadius: '8px', border: i === 0 ? '1px solid var(--border-color)' : 'none' }}>
                                        <div style={{ height: '8px', width: '80%', background: 'var(--text-muted)', borderRadius: '2px' }}></div>
                                    </div>
                                ))}
                            </div>

                            {/* Fake Chat Content */}
                            <div style={{ flexGrow: 1, padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'radial-gradient(circle at top right, rgba(251, 191, 36, 0.03), transparent)' }}>
                                {/* User Message */}
                                <div style={{ alignSelf: 'flex-end', padding: '0.8rem 1.25rem', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid var(--accent-gold)', borderRadius: '1.25rem 1.25rem 0 1.25rem', maxWidth: '70%' }}>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 500 }}>
                                        What is the penalty for unauthorized data disclosure under the IT Act?
                                    </div>
                                </div>

                                {/* Assistant Message */}
                                <div style={{ alignSelf: 'flex-start', padding: '1.25rem', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '1.25rem 1.25rem 1.25rem 0', maxWidth: '90%' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-gold)' }}></div>
                                        <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Statutory Synthesis</div>
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                                        Under **Section 66 of the Information Technology Act, 2000**, unauthorized access or disclosure with fraudulent intent is punishable with imprisonment for up to **3 years** or a fine of up to **₹5 lakh**, or both.
                                    </div>

                                    {/* Fake Citation */}
                                    <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '24px', height: '24px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
                                            <CheckCircle size={14} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>Verified Citation</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontWeight: 600 }}>IT Act, 2000 • Section 66 (Punishment)</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Indicator */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: 0.4, marginTop: 'auto' }}>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Index: Central Acts 2026.4</div>
                                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Latent Space: 1536D</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section style={{ padding: '5rem 0', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                <div className="container">
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <h2 style={{ fontSize: '2rem' }}>Why Professionals Choose Us</h2>
                        <p>Built for precision, speed, and analytical depth.</p>
                    </div>

                    <div className="grid grid-cols-3">
                        {[
                            { icon: <Shield />, title: "Precision Citations", desc: "Our RAG engine is optimized for mapping queries accurately to relevant statutory sections." },
                            { icon: <Zap />, title: "Instant Access", desc: "No more manual searching through documents. Get answers instantly with optimized indexing." },
                            { icon: <Globe />, title: "Wide Coverage", desc: "Access a diverse range of national acts and statutory frameworks in one place." },
                            { icon: <Search />, title: "Semantic Search", desc: "Understand the intent behind legal queries beyond simple keyword matching." },
                            { icon: <MessageSquare />, title: "Contextual Analysis", desc: "A robust AI assistant that maintains context throughout your research session." },
                            { icon: <BookOpen />, title: "Full Statutory Text", desc: "Access the complete original text for every cited section for verification." },
                        ].map((f, i) => (
                            <div key={i} className="glass-card" style={{ padding: '2rem' }}>
                                <div style={{ color: 'var(--accent-gold)', marginBottom: '1rem' }}>{f.icon}</div>
                                <h3 style={{ fontSize: '1.25rem' }}>{f.title}</h3>
                                <p style={{ fontSize: '0.9rem', margin: 0 }}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            {/* CTA */}
            <section style={{ padding: '6rem 0', textAlign: 'center', position: 'relative' }}>
                <div className="glow-circle" style={{ width: '300px', height: '300px', background: 'var(--accent-gold-transparent)', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}></div>
                <div className="container">
                    <h2 style={{ marginBottom: '1.5rem', fontSize: '2rem' }}>Ready to modernize your research?</h2>
                    <p style={{ marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
                        Join researchers and legal professionals using AI to power their statutory analysis.
                    </p>
                    <button className="btn btn-primary" style={{ padding: '0.75rem 3rem' }} onClick={() => navigate('/signup')}>
                        Create Free Account
                    </button>
                    <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'center', gap: '1.5rem', opacity: 0.6 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Data Encryption</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={16} /> Verified Statutes</div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer style={{ padding: '3rem 0', borderTop: '1px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>© 2026 Legal Query System. Built for the modern researcher.</div>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <span>Privacy Policy</span>
                        <span>Terms of Service</span>
                        <span>Official Database</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
