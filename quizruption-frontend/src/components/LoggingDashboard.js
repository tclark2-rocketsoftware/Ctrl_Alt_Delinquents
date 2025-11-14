import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { logoutAdmin, getAdminSession } from '../utils/adminAuth';
import documentationContent from '../utils/documentationContent';
import '../styles/main.css';

/**
 * Admin Logging Dashboard Component
 * View and manage application logs securely
 */
const LoggingDashboard = () => {
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({});
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [activeTab, setActiveTab] = useState('logs'); // 'logs' or 'docs'
  const [activeDoc, setActiveDoc] = useState('quick-start');
  const navigate = useNavigate();
  const adminSession = getAdminSession();

  useEffect(() => {
    loadLogs();
    
    if (autoRefresh) {
      const interval = setInterval(loadLogs, 3000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadLogs = () => {
    const exportedData = logger.exportLogs();
    setLogs(exportedData.logs || []);
    setStats(exportedData.stats || {});
  };

  const handleClearLogs = () => {
    if (window.confirm('Are you sure you want to clear all logs?')) {
      logger.clearLogs();
      loadLogs();
    }
  };

  const handleDownload = () => {
    logger.downloadLogs();
  };

  const handleAdminLogout = () => {
    logger.logSecurityEvent('Admin Logout', {
      username: adminSession?.username,
      timestamp: new Date().toISOString()
    });
    logoutAdmin();
    navigate('/admin/login');
  };

  const filteredLogs = logs
    .filter(log => filterLevel === 'ALL' || log.level === filterLevel)
    .filter(log => 
      !searchTerm || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      JSON.stringify(log.data).toLowerCase().includes(searchTerm.toLowerCase())
    )
    .reverse(); // Show newest first

  const getLevelColor = (level) => {
    const colors = {
      DEBUG: '#888',
      INFO: '#4CAF50',
      WARN: '#FF9800',
      ERROR: '#F44336',
      SECURITY: '#9C27B0'
    };
    return colors[level] || '#000';
  };

  const getLevelBadgeStyle = (level) => ({
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    background: getLevelColor(level),
    marginRight: '8px'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h1 style={{ margin: 0, color: '#333' }}>
            🔍 Admin Dashboard
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {adminSession && (
              <span style={{ fontSize: '14px', color: '#666' }}>
                👤 Admin: <strong>{adminSession.username}</strong>
              </span>
            )}
            <button
              onClick={handleAdminLogout}
              style={{
                padding: '8px 16px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🚪 Logout
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          borderBottom: '2px solid #f0f0f0',
          paddingBottom: '8px'
        }}>
          <button
            onClick={() => setActiveTab('logs')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'logs' ? 'linear-gradient(135deg, #cc95af 0%, #ba99dc 100%)' : 'transparent',
              color: activeTab === 'logs' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'logs' ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            📊 System Logs
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            style={{
              padding: '10px 20px',
              background: activeTab === 'docs' ? 'linear-gradient(135deg, #cc95af 0%, #ba99dc 100%)' : 'transparent',
              color: activeTab === 'docs' ? 'white' : '#666',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'docs' ? 'bold' : 'normal',
              transition: 'all 0.3s'
            }}
          >
            📚 Documentation
          </button>
        </div>

        {/* Logs Tab Content */}
        {activeTab === 'logs' && (
          <>
            {/* Statistics */}
            <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '12px',
          marginBottom: '24px'
        }}>
          <div style={{
            background: '#f5f5f5',
            padding: '16px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
              {stats.total || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>Total Logs</div>
          </div>

          {stats.byLevel && Object.entries(stats.byLevel).map(([level, count]) => (
            <div
              key={level}
              style={{
                background: '#f5f5f5',
                padding: '16px',
                borderRadius: '8px',
                textAlign: 'center',
                borderLeft: `4px solid ${getLevelColor(level)}`
              }}
            >
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: getLevelColor(level) }}>
                {count}
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>{level}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{
          display: 'flex',
          gap: '12px',
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              flex: '1',
              minWidth: '200px',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="ALL">All Levels</option>
            <option value="DEBUG">Debug</option>
            <option value="INFO">Info</option>
            <option value="WARN">Warning</option>
            <option value="ERROR">Error</option>
            <option value="SECURITY">Security</option>
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span style={{ fontSize: '14px' }}>Auto-refresh</span>
          </label>

          <button
            onClick={loadLogs}
            style={{
              padding: '10px 20px',
              background: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🔄 Refresh
          </button>

          <button
            onClick={handleDownload}
            style={{
              padding: '10px 20px',
              background: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            💾 Download
          </button>

          <button
            onClick={handleClearLogs}
            style={{
              padding: '10px 20px',
              background: '#F44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            🗑️ Clear
          </button>
        </div>
          </>
        )}

        {/* Documentation Tab Content */}
        {activeTab === 'docs' && (
          <div>
            {/* Documentation Navigation */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {Object.entries(documentationContent).map(([key, doc]) => (
                <button
                  key={key}
                  onClick={() => setActiveDoc(key)}
                  style={{
                    padding: '16px',
                    background: activeDoc === key 
                      ? 'linear-gradient(135deg, #cc95af 0%, #ba99dc 100%)' 
                      : 'rgba(204, 149, 175, 0.1)',
                    color: activeDoc === key ? 'white' : '#333',
                    border: activeDoc === key ? 'none' : '2px solid rgba(204, 149, 175, 0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: activeDoc === key ? 'bold' : 'normal',
                    textAlign: 'left',
                    transition: 'all 0.3s',
                    boxShadow: activeDoc === key ? '0 4px 12px rgba(204, 149, 175, 0.3)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (activeDoc !== key) {
                      e.currentTarget.style.background = 'rgba(204, 149, 175, 0.2)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeDoc !== key) {
                      e.currentTarget.style.background = 'rgba(204, 149, 175, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>{doc.icon}</div>
                  <div style={{ fontWeight: 'bold' }}>{doc.title}</div>
                </button>
              ))}
            </div>

            {/* Documentation Content */}
            <div style={{
              background: '#f9f9f9',
              padding: '24px',
              borderRadius: '12px',
              maxHeight: '600px',
              overflowY: 'auto',
              border: '1px solid rgba(204, 149, 175, 0.2)'
            }}>
              <div style={{
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}>
                <pre style={{
                  whiteSpace: 'pre-wrap',
                  wordWrap: 'break-word',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#333',
                  margin: 0
                }}>
                  {documentationContent[activeDoc]?.content || 'Documentation not found'}
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs List - Only show when on logs tab */}
      {activeTab === 'logs' && (
        <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#333' }}>
          Recent Logs ({filteredLogs.length})
        </h2>

        {filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            No logs found
          </div>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {filteredLogs.map((log, index) => (
              <details
                key={index}
                style={{
                  background: '#f9f9f9',
                  marginBottom: '8px',
                  borderRadius: '6px',
                  borderLeft: `4px solid ${getLevelColor(log.level)}`
                }}
              >
                <summary style={{
                  padding: '12px',
                  cursor: 'pointer',
                  userSelect: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px'
                }}>
                  <span style={getLevelBadgeStyle(log.level)}>{log.level}</span>
                  <span style={{ color: '#666', fontSize: '12px' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span style={{ flex: 1, color: '#333' }}>{log.message}</span>
                </summary>

                <div style={{
                  padding: '16px',
                  background: 'white',
                  borderTop: '1px solid #eee'
                }}>
                  <pre style={{
                    margin: 0,
                    fontSize: '12px',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'Monaco, monospace',
                    color: '#333'
                  }}>
                    {JSON.stringify(log, null, 2)}
                  </pre>
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
      )}
    </div>
  );
};

export default LoggingDashboard;
