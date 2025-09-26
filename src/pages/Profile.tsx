import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Camera, Loader, User } from 'lucide-react';
import { CreditCard, Package, MapPin } from 'lucide-react';
import RoleCheck from '../components/RoleCheck';
import SubscriptionStatus from '../components/SubscriptionStatus';

export default function Profile() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [username, setUsername] = useState(profile?.username || '');
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      setError(null);

      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      await updateProfile({ avatar_url: publicUrl });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile({ username });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex justify-between items-start mb-8">
            <h1 className="text-3xl font-bold">Profile</h1>
            <button
              onClick={() => signOut()}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>

          {/* Avatar Section */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <User className="w-16 h-16" />
                  </div>
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-black text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors"
              >
                {uploading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </label>
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                disabled={uploading}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 p-3 bg-gray-50 rounded-md">
                {user.email}
              </p>
            </div>

            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black"
                  />
                </div>

                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(profile?.username || '');
                      setIsEditing(false);
                    }}
                    className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Username
                    </label>
                    <p className="mt-1 p-3 bg-gray-50 rounded-md">
                      {profile?.username || 'Not set'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-sm text-gray-600 hover:text-gray-900"
                  >
                    Edit
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Subscription Status */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Subscription Status</h2>
            <SubscriptionStatus />
          </div>
          
          {/* Role Information */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Role Information</h2>
            <RoleCheck />
          </div>
          
          {/* Account Management */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Account Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div 
                onClick={() => navigate('/account/orders')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <Package className="w-6 h-6 text-gray-700 mr-3" />
                  <h3 className="text-lg font-bold">Order History</h3>
                </div>
                <p className="text-gray-600">View your past orders and track current orders</p>
              </div>
              
              <div 
                onClick={() => navigate('/account/addresses')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <MapPin className="w-6 h-6 text-gray-700 mr-3" />
                  <h3 className="text-lg font-bold">Saved Addresses</h3>
                </div>
                <p className="text-gray-600">Manage your shipping and billing addresses</p>
              </div>
              
              <div 
                onClick={() => navigate('/account/payment-methods')}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center mb-4">
                  <CreditCard className="w-6 h-6 text-gray-700 mr-3" />
                  <h3 className="text-lg font-bold">Payment Methods</h3>
                </div>
                <p className="text-gray-600">Manage your saved payment methods</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}