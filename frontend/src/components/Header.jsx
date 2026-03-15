import React from 'react';
import { Scale, ShieldCheck } from 'lucide-react';
import './Header.css';

const Header = () => {
  return (
    <header className="app-header glass-panel">
      <div className="header-container">
        <div className="logo-section">
          <div className="logo-icon-container">
            <Scale className="logo-icon" size={28} />
          </div>
          <div className="logo-text">
            <h1>LexQueryia</h1>
            <span className="subtitle">AI Legal Assistant</span>
          </div>
        </div>
        
        <nav className="header-nav">
          <button className="nav-link active">Query</button>
          <button className="nav-link">Citations</button>
          <button className="nav-link">History</button>
        </nav>
        
        <div className="header-actions">
          <div className="trust-badge">
            <ShieldCheck size={16} />
            <span>Verifiable Sources</span>
          </div>
          <button className="btn-primary login-btn">Sign In</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
