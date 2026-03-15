import React, { useState, useRef, useEffect } from 'react';
import { Send, Scale, User, FileText, ChevronDown, ChevronUp, ExternalLink, Loader2, BookOpen, CheckCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import './ChatInterface.css';

// Mock data to simulate the RAG response
const mockResponse = {
    text: "Based on the Indian Penal Code (IPC), the situation you described falls under the definition of criminal intimidation. According to Section 503 of the IPC, whoever threatens another with any injury to his person, reputation or property, with intent to cause alarm to that person, commits criminal intimidation. \n\nThe punishment for this is outlined in Section 506, which states that the offender shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both.",
    citations: [
        {
            id: 1,
            actName: "Indian Penal Code, 1860",
            section: "Section 503",
            title: "Criminal Intimidation",
            text: "Whoever threatens another with any injury to his person, reputation or property, or to the person or reputation of any one in whom that person is interested, with intent to cause alarm to that person, or to cause that person to do any act which he is not legally bound to do, or to omit to do any act which that person is legally entitled to do, as the means of avoiding the execution of such threat, commits criminal intimidation.",
        },
        {
            id: 2,
            actName: "Indian Penal Code, 1860",
            section: "Section 506",
            title: "Punishment for criminal intimidation",
            text: "Whoever commits the offence of criminal intimidation shall be punished with imprisonment of either description for a term which may extend to two years, or with fine, or with both; \n\nIf threat be to cause death or grievous hurt, etc.—and if the threat be to cause death or grievous hurt, or to cause the destruction of any property by fire, or to cause an offence punishable with death or imprisonment for life, or with imprisonment for a term which may extend to seven years, or to impute unchastity to a woman, shall be punished with imprisonment of either description for a term which may extend to seven years, or with fine, or with both.",
        }
    ]
};

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

    const handleSendSubmit = (e) => {
        e.preventDefault();
        if (!inputValue.trim()) return;

        // Use callback to add user message
        onSendMessage(session.id, inputValue);
        setInputValue('');
        setIsLoading(true);

        // Simulate API call and streaming response
        setTimeout(() => {
            // In a real app, this would use the real text from an LLM.
            // We pass the simulated bot message up to App.jsx.
            onSendMessage(session.id, mockResponse.text, mockResponse.citations, 'assistant');
            setIsLoading(false);
        }, 1500);
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
