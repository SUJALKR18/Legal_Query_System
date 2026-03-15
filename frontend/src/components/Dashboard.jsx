import React from 'react';
import { MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import './Dashboard.css';

const Dashboard = ({ sessions, onOpenSession, onNewSession }) => {
    const solvedCount = sessions.filter(s => s.status === 'solved').length;
    const activeCount = sessions.filter(s => s.status === 'unsolved').length;

    return (
        <div className="dashboard-container">
            <motion.div
                className="dashboard-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h2 className="gold-gradient-text">Welcome back, Sujal</h2>
                <p className="subtitle">Here is an overview of your legal inquiries.</p>
            </motion.div>

            <div className="stats-grid">
                <motion.div
                    className="stat-card glass-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                >
                    <div className="stat-icon-wrapper resolved">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{solvedCount}</h3>
                        <p>Queries Solved</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card glass-panel"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                >
                    <div className="stat-icon-wrapper active">
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>{activeCount}</h3>
                        <p>Active Consultations</p>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card glass-panel new-session-card"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                    onClick={onNewSession}
                >
                    <div className="stat-icon-wrapper action">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>New</h3>
                        <p>Start Consultation</p>
                    </div>
                </motion.div>
            </div>

            <motion.div
                className="recent-sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <div className="section-header">
                    <h3>Your Sessions</h3>
                </div>

                {sessions.length === 0 ? (
                    <div className="empty-state glass-panel">
                        <MessageSquare size={32} className="empty-icon" />
                        <p>You have no active or past legal inquiries.</p>
                        <button className="btn-primary" onClick={onNewSession}>Start a Query</button>
                    </div>
                ) : (
                    <div className="sessions-list">
                        {sessions.map((session, idx) => (
                            <motion.div
                                key={session.id}
                                className="session-card glass-panel"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: 0.4 + (idx * 0.1) }}
                                onClick={() => onOpenSession(session.id)}
                            >
                                <div className="session-card-header">
                                    <h4 className="session-title">{session.title}</h4>
                                    <span className={`status-badge ${session.status}`}>
                                        {session.status === 'solved' ? (
                                            <><CheckCircle size={14} /> Solved</>
                                        ) : (
                                            <><Clock size={14} /> Unsolved</>
                                        )}
                                    </span>
                                </div>
                                <div className="session-card-footer">
                                    <span className="session-date">
                                        {new Date(session.updatedAt).toLocaleDateString(undefined, {
                                            year: 'numeric', month: 'short', day: 'numeric'
                                        })}
                                    </span>
                                    <span className="session-messages">
                                        {session.messages.length} messages
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default Dashboard;
