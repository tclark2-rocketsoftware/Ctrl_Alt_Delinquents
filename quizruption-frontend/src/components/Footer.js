// Footer component with copyright and disclaimer
import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🎯 Quizruption</h3>
            <p>Transform your mind through interactive quizzes and trivia!</p>
          </div>
          
          <div className="footer-section">
            <h4>Legal</h4>
            <ul>
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/disclaimer">Disclaimer</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Contact</h4>
            <p>Questions or feedback?</p>
            <p>Email: info@quizruption.com</p>
            <p style={{ marginTop: '0.5rem' }}>
              <Link 
                to="/admin/login" 
                style={{
                  color: '#999',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  opacity: 0.6
                }}
              >
                🔒 Admin Access
              </Link>
            </p>
          </div>
        </div>
        
        <div className="footer-divider"></div>
        
        <div className="footer-bottom">
          <div className="copyright">
            <p>&copy; {currentYear} Quizruption. All rights reserved.</p>
          </div>
          
          <div className="disclaimer">
            <p>
              <strong>Disclaimer:</strong> This application is for educational and entertainment purposes only. 
              Quiz results are not intended as professional psychological assessments or medical advice. 
              Please consult qualified professionals for serious personal or health-related decisions.
            </p>
          </div>
          
          <div className="team-credit">
            <p>Developed by the <strong>Ctrl_Alt_Delinquents</strong> team</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;