import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Mail, Trash2, Download, Search, Filter, RefreshCw } from 'lucide-react';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

interface NewsletterStats {
  total_subscribers: number;
  active_subscribers: number;
  unsubscribed: number;
  last_week_subscribers: number;
}

export default function NewsletterSubscribers() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  async function fetchSubscribers() {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSubscribers(data || []);
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch subscribers');
    } finally {
      setLoading(false);
    }
  }

  async function fetchStats() {
    try {
      const { data, error } = await supabase.rpc('get_newsletter_stats');
      if (error) throw error;
      if (data && data.length > 0) {
        setStats(data[0]);
      }
    } catch (err) {
      console.error('Error fetching newsletter stats:', err);
    }
  }

  async function handleUnsubscribe(email: string) {
    if (!window.confirm(`Are you sure you want to unsubscribe ${email}?`)) {
      return;
    }

    try {
      const { data, error } = await supabase.rpc('unsubscribe_from_newsletter', {
        p_email: email
      });

      if (error) throw error;

      // Refresh data
      fetchSubscribers();
      fetchStats();
    } catch (err) {
      console.error('Error unsubscribing:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe');
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!window.confirm(`Are you sure you want to permanently delete ${email}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh data
      fetchSubscribers();
      fetchStats();
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete subscriber');
    }
  }

  function handleExport() {
    setIsExporting(true);
    
    try {
      // Filter subscribers based on current filters
      let dataToExport = subscribers;
      
      if (searchQuery) {
        dataToExport = dataToExport.filter(sub => 
          sub.email.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Convert to CSV
      const headers = ['Email', 'Status', 'Subscribed Date'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(sub => [
          sub.email,
          sub.status,
          new Date(sub.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting subscribers:', err);
      setError(err instanceof Error ? err.message : 'Failed to export subscribers');
    } finally {
      setIsExporting(false);
    }
  }

  // Filter subscribers based on search query
  const filteredSubscribers = subscribers.filter(subscriber =>
    subscriber.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Newsletter Subscribers</h2>
          <div className="flex space-x-2">
            <button
              onClick={handleExport}
              disabled={isExporting || subscribers.length === 0}
              className="flex items-center space-x-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md transition-colors disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
            </button>
            <button
              onClick={() => {
                fetchSubscribers();
                fetchStats();
              }}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total Subscribers</p>
                  <p className="text-2xl font-bold">{stats.total_subscribers}</p>
                </div>
                <Mail className="w-8 h-8 text-blue-500" />
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-600 font-medium">Active Subscribers</p>
                  <p className="text-2xl font-bold">{stats.active_subscribers}</p>
                </div>
                <Mail className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-red-600 font-medium">Unsubscribed</p>
                  <p className="text-2xl font-bold">{stats.unsubscribed}</p>
                </div>
                <Mail className="w-8 h-8 text-red-500" />
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Last 7 Days</p>
                  <p className="text-2xl font-bold">{stats.last_week_subscribers}</p>
                </div>
                <Mail className="w-8 h-8 text-purple-500" />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-200"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-200"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : filteredSubscribers.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No subscribers found</h3>
            <p className="mt-2 text-sm text-gray-500">
              {searchQuery ? 'Try adjusting your search or filter criteria' : 'No one has subscribed to the newsletter yet'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscribed On
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscribers.map((subscriber) => (
                  <tr key={subscriber.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{subscriber.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscriber.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {subscriber.status === 'active' ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {subscriber.status === 'active' && (
                        <button
                          onClick={() => handleUnsubscribe(subscriber.email)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                          title="Unsubscribe"
                        >
                          Unsubscribe
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(subscriber.id, subscriber.email)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}