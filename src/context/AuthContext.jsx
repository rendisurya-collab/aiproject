import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

const API_URL = '/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for existing session
    const storedToken = localStorage.getItem('bridalnest_token');
    const storedUser = localStorage.getItem('bridalnest_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      fetchProfile(storedToken);
    }
    setIsLoading(false);
  }, []);

  const fetchProfile = async (authToken) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('bridalnest_user', JSON.stringify(data.user));
      } else {
        // Token expired or invalid
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('bridalnest_token', data.token);
        localStorage.setItem('bridalnest_user', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, message: 'Tidak dapat terhubung ke server' };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        setToken(data.token);
        localStorage.setItem('bridalnest_token', data.token);
        localStorage.setItem('bridalnest_user', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error('Register error:', err);
      return { success: false, message: 'Tidak dapat terhubung ke server' };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const res = await fetch(`${API_URL}/auth/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        const updatedUser = { ...user, avatar: data.avatar };
        setUser(updatedUser);
        localStorage.setItem('bridalnest_user', JSON.stringify(updatedUser));
        return { success: true, avatar: data.avatar };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error('Avatar upload error:', err);
      return { success: false, message: 'Gagal mengunggah avatar' };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
        localStorage.setItem('bridalnest_user', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, message: data.message };
    } catch (err) {
      console.error('Update profile error:', err);
      return { success: false, message: 'Gagal memperbarui profil' };
    }
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('bridalnest_token');
    localStorage.removeItem('bridalnest_user');
  };

  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    return avatarPath;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout: handleLogout,
        uploadAvatar,
        updateProfile,
        getAvatarUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
