import { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useNewsletter } from '../../hooks/useNewsletter';
import { Mail, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Unsubscribe() {
  const [email, setEmail] = useState('');
  const { unsubscribe, loading, error, success } = useNewsletter();
  const location = useLocation();

  useEffect(() => {
    // Check for email in URL parameters
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await unsubscribe(email);
  };

  return (
    <div className="min-h-screen pt-36 pb-12 flex flex-col bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md mt-8">
        <div className="text-center">
          <Mail className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Unsubscribe from Newsletter
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            We're sorry to see you go. Please confirm your email address to unsubscribe.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Unsubscribed Successfully</h3>
              <p className="mt-2 text-sm text-gray-500">
                You have been successfully unsubscribed from our newsletter.
              </p>
              <div className="mt-6">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to home
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-gray-500 focus:outline-none focus:ring-gray-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full justify-center rounded-md border border-transparent bg-gray-900 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Unsubscribe'}
                </button>
              </div>

              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to home
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}