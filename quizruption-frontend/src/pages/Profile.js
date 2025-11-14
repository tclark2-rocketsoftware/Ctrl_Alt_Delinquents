import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateUserProfile, getUserStats, getQuizzes, deleteQuiz } from '../services/api';
import { Link } from 'react-router-dom';
import logger from '../utils/logger';

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
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userQuizzes, setUserQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [quizError, setQuizError] = useState(null);

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
      loadUserQuizzes();
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

  const loadUserQuizzes = async () => {
    if (!user) return;
    try {
      setLoadingQuizzes(true);
      const all = await getQuizzes();
      setUserQuizzes(all.filter(q => q.created_by === user.id));
      setQuizError(null);
    } catch (err) {
      setQuizError('Failed to load your quizzes');
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const handleDeleteQuiz = async (quizId, title) => {
    if (!window.confirm(`Delete quiz "${title}"? This cannot be undone.`)) return;
    try {
      await deleteQuiz(quizId);
      setUserQuizzes(prev => prev.filter(q => q.id !== quizId));
    } catch (err) {
      alert('Error deleting quiz: ' + (err.message || 'Unknown'));
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
      console.log('Saving profile data:', profileData);
      
      const updatedUser = await updateUserProfile(profileData);
      console.log('Profile updated successfully:', updatedUser);
      
      // Update the user context with the new data
      updateUser(updatedUser);
      
      // Update local state to reflect the saved changes
      setProfileData({
        display_name: updatedUser.display_name || '',
        bio: updatedUser.bio || '',
        location: updatedUser.location || '',
        website: updatedUser.website || '',
        profile_image_url: updatedUser.profile_image_url || ''
      });
      
      setEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      
      let errorMessage = 'Error updating profile. Please try again.';
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
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

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be less than 5MB.');
      return;
    }

    try {
      setUploadingImage(true);
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Upload image
      const response = await fetch(`http://localhost:8000/api/upload/profile-image?token=${encodeURIComponent(token)}`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const data = await response.json();
      
      // Update profile data with new image URL
      handleInputChange('profile_image_url', data.image_url);
      
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
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
                <img 
                  src={profileData.profile_image_url.startsWith('http') 
                    ? profileData.profile_image_url 
                    : `http://localhost:8000${profileData.profile_image_url}`
                  } 
                  alt="Profile" 
                />
              ) : (
                <span>{getInitials(profileData.display_name || user?.username)}</span>
              )}
            </div>
            {editing && (
              <div className="avatar-upload">
                <div className="upload-section">
                  <label htmlFor="image-upload" className="upload-button">
                    {uploadingImage ? (
                      <span>📤 Uploading...</span>
                    ) : (
                      <>
                        <span>📸 Choose Image</span>
                      </>
                    )}
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ display: 'none' }}
                  />
                  <p className="upload-hint">Max 5MB • JPG, PNG, GIF, WebP</p>
                  {profileData.profile_image_url && (
                    <div className="image-preview-section">
                      <div className="image-preview">
                        <img 
                          src={profileData.profile_image_url.startsWith('http') 
                            ? profileData.profile_image_url 
                            : `http://localhost:8000${profileData.profile_image_url}`
                          } 
                          alt="Preview" 
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('profile_image_url', '')}
                        className="remove-image-btn"
                        disabled={uploadingImage}
                      >
                        🗑️ Remove
                      </button>
                    </div>
                  )}
                </div>
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
          <h2>📋 Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/create" className="action-card">
              <div className="action-icon">✏️</div>
              <h3>Create New Quiz</h3>
              <p>Build a personality or trivia quiz</p>
            </Link>
          </div>
        </div>

        {/* User's Quizzes Management */}
        <div className="profile-quizzes-section">
          <h2>🗂 Your Quizzes</h2>
          {loadingQuizzes ? (
            <div className="loading">Loading your quizzes...</div>
          ) : quizError ? (
            <div className="error">{quizError}</div>
          ) : userQuizzes.length === 0 ? (
            <div className="empty-state small">
              <p>You have not created any quizzes yet.</p>
              <Link to="/create" className="btn-primary">Create your first quiz</Link>
            </div>
          ) : (
            <div className="user-quiz-list">
              {userQuizzes.map(q => (
                <div key={q.id} className="user-quiz-row">
                  <div className="user-quiz-info">
                    <div className="user-quiz-title-line">
                      <strong className="user-quiz-title">{q.title}</strong>
                      <span className={`user-quiz-type badge badge-${q.type}`}>{q.type}</span>
                      <span className="user-quiz-date">{new Date(q.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="user-quiz-meta">Questions: {q.questions?.length || 0}</div>
                  </div>
                  <div className="user-quiz-actions">
                    <Link to={`/quiz/${q.id}`} className="btn-small primary">▶ Start</Link>
                    <Link to={`/edit/${q.id}`} className="btn-small">✏️ Edit</Link>
                    <button onClick={() => handleDeleteQuiz(q.id, q.title)} className="btn-small danger">🗑️ Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;