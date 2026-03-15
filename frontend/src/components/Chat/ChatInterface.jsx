import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, User, FileText, ChevronDown, ChevronUp, ExternalLink, Loader2, BookOpen, CheckCircle, ArrowLeft, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';

const API_BASE = 'http://localhost:8000';

const CitationPanel = ({ citation }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="citation-card glass-panel">
            <div
                className="citation-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="citation-title-group">
                    <FileText size={16} className="citation-icon" />
                    <div className="citation-meta">
                        <span className="citation-act">{citation.actName}</span>
                        <span className="citation-section">{citation.section}</span>
                    </div>
                </div>
                <div className="citation-toggle">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="citation-content-wrapper"
                    >
                        <div className="citation-content">
                            <h5>{citation.title}</h5>
                            <div className="citation-text">
                                <ReactMarkdown>{citation.text}</ReactMarkdown>
                            </div>
                            <div className="citation-actions">
                                <a href="#" className="verify-link">
                                    Verify Source <ExternalLink size={12} />
                                </a>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DisclaimerBanner = ({ text }) => (
    <div className="response-disclaimer">
        <AlertTriangle size={14} />
        <span>{text}</span>
    </div>
);

const Message = ({ message }) => {
    const isBot = message.role === 'assistant';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`message-wrapper ${isBot ? 'bot-message' : 'user-message'}`}
        >
            <div className="message-avatar">
                {isBot ? <Scale size={18} /> : <User size={18} />}
            </div>

            <div className="message-content">
                <div className="message-sender">{isBot ? 'LexQueryia AI' : 'You'}</div>

                <div className="message-bubble">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>

                {message.disclaimer && (
                    <DisclaimerBanner text={message.disclaimer} />
                )}

                {message.citations && message.citations.length > 0 && (
                    <div className="citations-container">
                        <div className="citations-header">
                            <BookOpen size={14} /> Referenced Legal Statutes
                        </div>
                        {message.citations.map((citation) => (
                            <CitationPanel key={citation.id} citation={citation} />
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

const ChatInterface = ({ session, onSendMessage, onMarkSolved, onBackToDashboard }) => {
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [session.messages, isLoading]);

    const handleSendSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        const userQuery = inputValue.trim();

        // Add user message
        onSendMessage(session.id, userQuery);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE}/api/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    query: userQuery,
                    session_id: session.id,
                }),
            });

            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }

            const data = await response.json();

            // Add assistant message with real citations and disclaimer
            onSendMessage(
                session.id,
                data.answer,
                data.citations,
                'assistant',
                data.disclaimer
            );
        } catch (error) {
            console.error('Query failed:', error);
            onSendMessage(
                session.id,
                `⚠️ **Error:** Could not reach the LexQueryia backend. Please ensure the server is running at \`${API_BASE}\`.\n\nDetails: ${error.message}`,
                null,
                'assistant'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendSubmit(e);
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-interface-header glass-panel">
                <div className="chat-header-info">
                    <button className="btn-icon back-btn" onClick={onBackToDashboard}>
                        <ArrowLeft size={18} />
                    </button>
                    <div className="chat-header-text">
                        <h3>{session.title || "New Consultation"}</h3>
                        <span className={`status-badge ${session.status}`}>
                            {session.status === 'solved' ? 'Solved' : 'Unsolved'}
                        </span>
                    </div>
                </div>

                {session.status === 'unsolved' && session.messages.length > 1 && (
                    <button
                        className="btn-primary mark-solved-btn"
                        onClick={() => onMarkSolved(session.id)}
                    >
                        <CheckCircle size={16} />
                        <span>Mark as Solved</span>
                    </button>
                )}
            </div>

            <div className="messages-area glass-panel">
                <div className="messages-list">
                    {session.messages.map((msg) => (
                        <Message key={msg.id} message={msg} />
                    ))}

                    {isLoading && (
                        <div className="message-wrapper bot-message loading-indicator">
                            <div className="message-avatar">
                                <Loader2 size={18} className="spinner" />
                            </div>
                            <div className="message-content">
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            <div className="input-area-wrapper">
                <form onSubmit={handleSendSubmit} className="input-form glass-panel">
                    <textarea
                        className="chat-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Describe your legal situation or ask a question..."
                        rows={1}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="send-button"
                        disabled={!inputValue.trim() || isLoading}
                    >
                        <Send size={18} />
                    </button>
                </form>
                <div className="input-footer">
                    LexQueryia can make mistakes. Consider verifying critical information with a legal professional.
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
