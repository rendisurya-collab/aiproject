import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Save, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, uploadAvatar, updateProfile, getAvatarUrl, logout } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Harap pilih file gambar');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5MB');
      return;
    }

    setIsUploading(true);
    setError('');
    setMessage('');

    const result = await uploadAvatar(file);
    if (result.success) {
      setMessage('Avatar berhasil diperbarui');
    } else {
      setError(result.message);
    }
    setIsUploading(false);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!name.trim()) {
      setError('Nama tidak boleh kosong');
      return;
    }

    setIsSaving(true);
    const result = await updateProfile({ name, phone });
    if (result.success) {
      setMessage('Profil berhasil diperbarui');
    } else {
      setError(result.message);
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const avatarUrl = getAvatarUrl(user.avatar);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Profil Saya</h1>

        {/* Messages */}
        {message && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Avatar Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Foto Profil</h2>
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-primary-100 flex items-center justify-center">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-primary-700 font-serif font-bold text-3xl">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={handleAvatarClick}
                disabled={isUploading}
                className="absolute bottom-0 right-0 w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white hover:bg-primary-700 transition-colors shadow-md disabled:opacity-60"
                aria-label="Ganti foto profil"
              >
                <Camera className="w-4 h-4" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                aria-label="Upload foto profil"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {isUploading ? 'Mengunggah...' : 'Klik ikon kamera untuk mengganti foto'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Format: JPG, PNG, GIF, WebP. Maks 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
          <h2 className="font-semibold text-gray-900 mb-4">Informasi Akun</h2>
          <form onSubmit={handleSaveProfile} className="space-y-5">
            {/* Name */}
            <div>
              <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-500"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1.5">
                No. Telepon
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08xx-xxxx-xxxx"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="btn-primary flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
          </form>
        </div>

        {/* Logout */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="font-semibold text-gray-900 mb-2">Keluar dari Akun</h2>
          <p className="text-sm text-gray-500 mb-4">
            Anda akan keluar dari BridalNest di perangkat ini.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
