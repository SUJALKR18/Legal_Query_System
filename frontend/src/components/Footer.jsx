import React from 'react';
import { AlertCircle, BookOpen } from 'lucide-react';
import './Footer.css';

const Footer = () => {
    return (
        <footer className="app-footer">
            <div className="footer-content">
                <div className="disclaimer-alert glass-panel">
                    <div className="alert-icon">
                        <AlertCircle size={24} />
                    </div>
                    <div className="alert-text">
                        <h4>Important Legal Disclaimer</h4>
                        <p>
                            LexQueryia provides AI-generated information based on statutory texts and case laws for educational and informational purposes only.
                            <strong> The responses generated do not constitute professional legal advice. </strong>
                            Always consult with a qualified legal professional regarding your specific situation before taking any action.
                        </p>
                    </div>
                </div>

                <div className="footer-bottom">
                    <div className="footer-copyright">
                        &copy; {new Date().getFullYear()} LexQueryia. Pre-alpha Release.
                    </div>
                    <div className="footer-links">
                        <a href="#" className="footer-link">Terms of Service</a>
                        <a href="#" className="footer-link">Privacy Policy</a>
                        <a href="#" className="footer-link">
                            <BookOpen size={14} className="inline-icon" />
                            Dataset Sources
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
