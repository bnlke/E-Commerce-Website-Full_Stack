import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, AlertCircle, Info, ArrowLeft, Loader } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [validToken, setValidToken] = useState(false);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { updatePassword } = useAuth();
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      setIsCheckingToken(true);
      setValidToken(false);
      setError(null);
      
      try {
        // Get the URL and hash
        const url = window.location.href;
        const hash = window.location.hash;
        console.log('Checking reset parameters, URL hash length:', hash.length);
        
        // Check for recovery type in query params
        const queryParams = new URLSearchParams(location.search);
        const type = queryParams.get('type');
        
        if (type === 'recovery') {
          console.log('Recovery type found in URL parameters');
          
          // Get the current session which should be set by the recovery link
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            console.log('Active session found for recovery');
            setValidToken(true);
            setIsCheckingToken(false);
            return;
          }
        }
        
        // Check for access_token in query parameters
        const accessTokenParam = queryParams.get('access_token');
        if (accessTokenParam) {
          console.log('Found access_token in query parameters');
          
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: accessTokenParam,
              refresh_token: queryParams.get('refresh_token') || '',
            });
            
            if (error) {
              console.error('Error setting session with query token:', error);
              throw error;
            }
            
            if (data.session) {
              console.log('Session established with token from query parameters');
              setAccessToken(accessTokenParam);
              setValidToken(true);
              setIsCheckingToken(false);
              return;
            }
          } catch (err) {
            console.error('Failed to use query token:', err);
          }
        }
        
        // Check if we have an active session already
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('Active session found, user can reset password');
          setValidToken(true);
          setIsCheckingToken(false);
          return;
        }
        
        // Check for hash fragment with access_token
        if (hash && hash.includes('access_token=')) {
          console.log('Found access token in URL hash');
          
          // Extract the token from the hash
          const hashParams = new URLSearchParams(hash.substring(1));
          const token = hashParams.get('access_token');
          
          if (!token) {
            throw new Error('No access token found in hash parameters');
          }
          
          // Try to set the session with this token
          try {
            const { data, error } = await supabase.auth.setSession({
              access_token: token,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (error) {
              console.error('Error setting session with hash token:', error);
              throw error;
            }
            
            if (data.session) {
              console.log('Session established with token from URL hash');
              setAccessToken(token);
              setValidToken(true);
              setIsCheckingToken(false);
              return;
            }
          } catch (err) {
            console.error('Failed to use hash token:', err);
            throw err;
          }
        }
      
        // If we get here, no valid parameters were found
        setError('Invalid reset link: No valid parameters found');
        setValidToken(false);
      } catch (err) {
        console.error('Error checking reset token:', err);
        setError('Error verifying reset link. Please try again or request a new link.');
        setValidToken(false);
      } finally {
        setIsCheckingToken(false);
      }
    }

    checkSession();
  }, [location]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Updating password with', accessToken ? 'provided token' : 'current session');
      
      // For Supabase recovery flow, we just need to update the password
      // The session is already established by clicking the recovery link
      await updatePassword(newPassword, accessToken);
      console.log('Password updated successfully');

      // Password was successfully updated
      navigate('/login', { 
        state: { message: 'Password updated successfully. Please log in with your new password.' }
      });
    } catch (err: any) {
      console.error('Password reset error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update password');
      
      // If the token is invalid or expired, suggest requesting a new reset link
      if (err.message.includes('token') || err.message.includes('session')) {
        setError('Your password reset link has expired. Please request a new one.');
        setValidToken(false);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-12 flex flex-col bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Reset Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your new password below
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isCheckingToken ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-3">
              <Loader className="h-10 w-10 text-gray-500 animate-spin" />
              <p className="text-gray-600">Verifying your reset link...</p>
            </div>
          ) : !validToken ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="text-center mb-4">
                <Link 
                  to="/forgot-password"
                  className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Request a password reset link
                </Link>
              </div>
              
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="new-password"
                    name="new-password"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <Eye className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1 relative">
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <Eye className="h-5 w-5 text-gray-400" />
                    ) : (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex flex-col space-y-4">
                <button
                  type="submit"
                  disabled={!newPassword || !confirmPassword}
                  className="flex w-full justify-center rounded-md border border-transparent bg-gray-900 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Update Password
                </button>
                
                <Link 
                  to="/login"
                  className="text-center text-sm text-gray-600 hover:text-gray-900 block w-full text-center mt-4"
                >
                  Back to login
                </Link>
              </div>
            </form>
          ) : (
            <>
              <div className="bg-blue-50 text-blue-600 p-4 rounded-lg mb-6 flex items-start space-x-3">
                <Info className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Password Reset</p>
                  <p className="mt-1">You can now set a new password for your account.</p>
                </div>
              </div>
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="new-password"
                      name="new-password"
                      type={showNewPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      tabIndex={-1}
                    >
                      {showNewPassword ? (
                        <Eye className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
                    Confirm Password
                  </label>
                  <div className="mt-1 relative">
                    <input
                      id="confirm-password"
                      name="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? (
                        <Eye className="h-5 w-5 text-gray-400" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full justify-center rounded-md border border-transparent bg-gray-900 py-3 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                  </button>
                  
                  <Link 
                    to="/login"
                    className="text-center text-sm text-gray-600 hover:text-gray-900 block w-full text-center mt-4"
                  >
                    Back to login
                  </Link>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}