import { useState } from 'react';
import { Mail } from 'lucide-react';
import { useNewsletter } from '../hooks/useNewsletter';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const { subscribe, loading, error, success, alreadySubscribed } = useNewsletter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await subscribe(email);
    if (result) {
      setEmail('');
    }
  };

  return (
    <section className="py-20 px-4 bg-gray-900 text-white">
      <div className="container mx-auto max-w-2xl text-center">
        <div className="inline-block p-4 bg-gray-800 rounded-full mb-4">
          <Mail className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-bold mb-4">Join Our Newsletter</h2>
        <p className="text-gray-300 mb-8">
          Subscribe to get special offers, free giveaways, and updates.
        </p>
        
        {success ? (
          <div className="bg-gray-800 p-6 rounded-lg max-w-md mx-auto">
            <h3 className="text-xl font-bold mb-2">{alreadySubscribed ? 'Already Subscribed!' : 'Thank You!'}</h3>
            <p className="text-gray-300">
              {alreadySubscribed 
                ? 'You are already subscribed to our newsletter.' 
                : 'You\'ve been successfully subscribed to our newsletter.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 text-white placeholder-gray-400 w-full"
            />
            <button 
              type="submit"
              disabled={loading}
              className="bg-white text-black px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
        )}
        
        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}
        
        <p className="mt-6 text-sm text-gray-400">
          By subscribing, you agree to our Privacy Policy and Terms. You can unsubscribe at any time.
        </p>
      </div>
    </section>
  );
}