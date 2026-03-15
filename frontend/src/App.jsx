import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/Chat/ChatInterface';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'chat'

  const [sessions, setSessions] = useState([
    {
      id: 'session-123',
      title: 'Property Dispute - Section 503',
      status: 'solved',
      updatedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      messages: [
        {
          id: 1,
          role: 'user',
          content: 'I have a neighbor threatening to damage my property, what can I do?',
          citations: null
        },
        {
          id: 2,
          role: 'assistant',
          content: "Based on the Indian Penal Code (IPC), the situation you described falls under the definition of criminal intimidation. According to Section 503 of the IPC...",
          citations: [
            {
              id: 1,
              actName: "Indian Penal Code, 1860",
              section: "Section 503",
              title: "Criminal Intimidation",
              text: "Whoever threatens another with any injury to his person, reputation or property...",
            }
          ]
        }
      ]
    }
  ]);

  const [activeSessionId, setActiveSessionId] = useState(null);

  const handleOpenSession = (sessionId) => {
    setActiveSessionId(sessionId);
    setCurrentView('chat');
  };

  const handleNewSession = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: 'New Legal Query',
      status: 'unsolved',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: Date.now(),
          role: 'assistant',
          content: "Welcome to LexQueryia. I am an AI legal assistant trained on Indian statutory acts and central regulations. Please describe your legal query or situation, and I will provide relevant law sections and act references.\n\n*Note: My responses are for informational purposes only and do not constitute professional legal counsel.*",
          citations: null
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setCurrentView('chat');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setActiveSessionId(null);
  };

  const handleSendMessage = (sessionId, text, citations = null, role = 'user') => {
    setSessions(prevSessions =>
      prevSessions.map(session => {
        if (session.id === sessionId) {
          // Determine a dynamic title if it's the first real user message
          let newTitle = session.title;
          if (role === 'user' && session.messages.length === 1 && newTitle === 'New Legal Query') {
            // Take the first 30 chars of the user query as title
            newTitle = text.substring(0, 30) + (text.length > 30 ? '...' : '');
          }

          return {
            ...session,
            title: newTitle,
            updatedAt: new Date().toISOString(),
            messages: [
              ...session.messages,
              {
                id: Date.now() + Math.random(), // Ensure unique ID even if rapid
                role,
                content: text,
                citations
              }
            ]
          };
        }
        return session;
      })
    );
  };

  const handleMarkSolved = (sessionId) => {
    setSessions(prevSessions =>
      prevSessions.map(session =>
        session.id === sessionId
          ? { ...session, status: 'solved', updatedAt: new Date().toISOString() }
          : session
      )
    );
  };

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className="app-container">
      <Header />

      <main className="main-content">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%' }}
            >
              <Dashboard
                sessions={sessions}
                onOpenSession={handleOpenSession}
                onNewSession={handleNewSession}
              />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              style={{ width: '100%', display: 'flex', flexDirection: 'column', flex: 1 }}
            >
              {activeSession && (
                <ChatInterface
                  session={activeSession}
                  onSendMessage={handleSendMessage}
                  onMarkSolved={handleMarkSolved}
                  onBackToDashboard={handleBackToDashboard}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
