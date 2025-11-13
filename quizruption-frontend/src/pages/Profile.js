import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getUserStats } from '../services/api';
import { Link } from 'react-router-dom';

function Profile() {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    display_name: '',
    bio: '',
    location: '',
    website: '',
    profile_image_url: ''
  });
  const [stats, setStats] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        display_name: user.display_name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        profile_image_url: user.profile_image_url || ''
      });
      
      // Load user stats
      loadUserStats();
    }
  }, [user]);

  const loadUserStats = async () => {
    try {
      setLoading(true);
      const userStats = await getUserStats(user.id);
      setStats(userStats);
    } catch (error) {
      console.error('Error loading user stats:', error);
      setStats({
        stats: {
          quizzes_created: 0,
          quizzes_taken: 0,
          personality_traits_discovered: 0,
          joke_suggestions_submitted: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedUser = await updateUserProfile(profileData);
      updateUser(updatedUser);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      display_name: user.display_name || '',
      bio: user.bio || '',
      location: user.location || '',
      website: user.website || '',
      profile_image_url: user.profile_image_url || ''
    });
    setEditing(false);
  };

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : user?.username?.[0]?.toUpperCase() || 'U';
  };

  if (!user) {
    return <div className="loading">Please log in to view your profile.</div>;
  }

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {profileData.profile_image_url ? (
                <img src={profileData.profile_image_url} alt="Profile" />
              ) : (
                <span>{getInitials(profileData.display_name || user?.username)}</span>
              )}
            </div>
            {editing && (
              <div className="avatar-upload">
                <input
                  type="url"
                  placeholder="Profile image URL"
                  value={profileData.profile_image_url}
                  onChange={(e) => handleInputChange('profile_image_url', e.target.value)}
                  className="form-control"
                />
              </div>
            )}
          </div>
          
          <div className="profile-info">
            {editing ? (
              <div className="profile-edit-form">
                <input
                  type="text"
                  placeholder="Display Name"
                  value={profileData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  className="form-control profile-name-input"
                />
                <p className="username">@{user?.username}</p>
                <textarea
                  placeholder="Tell us about yourself..."
                  value={profileData.bio}
                  onChange={(e) => handleInputChange('bio', e.target.value)}
                  className="form-control profile-bio-input"
                  rows="3"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={profileData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="form-control"
                />
                <input
                  type="url"
                  placeholder="Website URL"
                  value={profileData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="form-control"
                />
              </div>
            ) : (
              <div className="profile-display">
                <h1>{profileData.display_name || user?.username}</h1>
                <p className="username">@{user?.username}</p>
                {profileData.bio && <p className="bio">{profileData.bio}</p>}
                <div className="profile-details">
                  {profileData.location && (
                    <span className="detail-item">📍 {profileData.location}</span>
                  )}
                  {profileData.website && (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" className="detail-item">
                      🌐 Website
                    </a>
                  )}
                  <span className="detail-item">
                    📅 Joined {new Date(user?.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
            
            <div className="profile-actions">
              {editing ? (
                <div className="edit-actions">
                  <button 
                    onClick={handleSave} 
                    disabled={saving}
                    className="btn-primary"
                  >
                    {saving ? '💾 Saving...' : '💾 Save Changes'}
                  </button>
                  <button onClick={handleCancel} className="btn-secondary">
                    ❌ Cancel
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="btn-primary">
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section with Navigation Links */}
        {stats && (
          <div className="profile-stats">
            <h2>📊 Your Quiz Journey</h2>
            <div className="stats-grid">
              <Link to="/profile/created" className="stat-card">
                <div className="stat-number">{stats.stats?.quizzes_created || 0}</div>
                <div className="stat-label">Quizzes Created</div>
                <div className="stat-link-text">View All →</div>
              </Link>
              <Link to="/profile/taken" className="stat-card">
                <div className="stat-number">{stats.stats?.quizzes_taken || 0}</div>
                <div className="stat-label">Quizzes Taken</div>
                <div className="stat-link-text">View Results →</div>
              </Link>
              <Link to="/profile/jokes" className="stat-card">
                <div className="stat-number">{stats.stats?.joke_suggestions_submitted || 0}</div>
                <div className="stat-label">Joke Suggestions</div>
                <div className="stat-link-text">Manage →</div>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="profile-quick-actions">
          <h2>� Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/create" className="action-card">
              <div className="action-icon">✏️</div>
              <h3>Create New Quiz</h3>
              <p>Build a personality or trivia quiz</p>
            </Link>
            <Link to="/dashboard" className="action-card">
              <div className="action-icon">🎯</div>
              <h3>Browse Quizzes</h3>
              <p>Discover new quizzes to take</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;