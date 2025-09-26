import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users, Package, ShoppingBag, Settings, Activity, User, Trash2, Mail } from 'lucide-react';
import ManageUsers from './ManageUsers';
import ManageProducts from './ManageProducts';
import NewsletterSubscribers from './NewsletterSubscribers';

interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalSubscribers: number;
}

interface AdminActivity {
  id: string;
  action: string;
  entity_type: string;
  details: any;
  created_at: string;
  profiles: {
    username: string;
  } | null;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalSubscribers: 0
  });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<AdminActivity[]>([]);
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'products' | 'orders' | 'newsletter'>('dashboard');
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [deletingActivity, setDeletingActivity] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setError(null);
        // Fetch total users
        const { count: userCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Fetch total products
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Fetch total orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });
          
        // Fetch newsletter stats
        const { data: newsletterStats } = await supabase
          .rpc('get_newsletter_stats');
          
        const subscriberCount = newsletterStats?.[0]?.active_subscribers || 0;

        // Fetch recent activities
        const { data: activityData, error: activityError } = await supabase
          .from('admin_activities')
          .select(`
            *,
            profiles (
              username
            )
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (activityError) throw activityError;

        setStats({
          totalUsers: userCount || 0,
          totalProducts: productCount || 0,
          totalOrders: orderCount || 0,
          totalSubscribers: subscriberCount
        });
        setActivities(activityData || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }

    // Set up real-time channel
    const adminActivitiesChannel = supabase
      .channel('admin-activities')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_activities'
        },
        (payload) => {
          setActivities(prev => prev.filter(activity => activity.id !== payload.old.id));
        }
      )
      .subscribe();

    setChannel(adminActivitiesChannel);
    fetchStats();

    // Cleanup subscription on unmount
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);  // Empty dependency array

  const deleteActivity = async (activityId: string) => {
    try {
      setDeletingActivity(activityId);
      setError(null);
      
      // Delete the activity directly
      const { error } = await supabase
        .from('admin_activities')
        .delete()
        .eq('id', activityId);

      if (error) {
        throw error;
      }

      // Update local state immediately for better UX
      setActivities(prev => prev.filter(activity => activity.id !== activityId));

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete activity');
    } finally {
      setDeletingActivity(null);
    }
  };

  const stats_cards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      title: 'Newsletter Subscribers',
      value: stats.totalSubscribers,
      icon: Mail,
      color: 'bg-indigo-50 text-indigo-600'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-green-50 text-green-600'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingBag,
      color: 'bg-purple-50 text-purple-600'
    }
  ];

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <ManageUsers />;
      case 'newsletter':
        return <NewsletterSubscribers />;
      case 'products':
        return <ManageProducts />;
      case 'orders':
        return <div>Orders management coming soon</div>;
      default:
        return (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {stats_cards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-500">{stat.title}</p>
                        <h3 className="text-3xl font-bold mt-2">{stat.value}</h3>
                      </div>
                      <div className={`p-3 rounded-full ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button 
                  onClick={() => setActiveView('users')}
                  className="flex items-center justify-center space-x-2 bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
                >
                  <Users className="w-5 h-5" />
                  <span>Manage Users</span>
                </button>
                <button 
                  onClick={() => setActiveView('newsletter')}
                  className="flex items-center justify-center space-x-2 bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
                >
                  <Mail className="w-5 h-5" />
                  <span>Newsletter</span>
                </button>
                <button 
                  onClick={() => setActiveView('products')}
                  className="flex items-center justify-center space-x-2 bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
                >
                  <Package className="w-5 h-5" />
                  <span>Add Product</span>
                </button>
                <button 
                  onClick={() => setActiveView('orders')}
                  className="flex items-center justify-center space-x-2 bg-gray-50 p-4 rounded-lg hover:bg-gray-100"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>View Orders</span>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                    {error}
                  </div>
                )}
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">
                    No recent activity to display
                  </p>
                ) : (
                  (showAllActivities ? activities : activities.slice(0, 2)).map((activity) => (
                    <div key={activity.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-white rounded-full">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.profiles?.username || 'Unknown user'}
                          </p>
                          <p className="text-sm text-gray-600">
                            {activity.action} {activity.entity_type}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(activity.created_at).toLocaleString()}
                          </p>
                          {activity.details && (
                            <div className="mt-2 p-2 bg-white rounded border text-sm text-gray-600">
                              {Object.entries(activity.details).map(([key, value]) => (
                                <div key={key} className="flex gap-2">
                                  <span className="font-medium">{key}:</span>
                                  <span>{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteActivity(activity.id)}
                          disabled={deletingActivity === activity.id}
                          className={`p-2 transition-colors ${
                            deletingActivity === activity.id
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-400 hover:text-red-500'
                          }`}
                          title="Delete activity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
                {activities.length > 2 && (
                  <button
                    onClick={() => setShowAllActivities(!showAllActivities)}
                    className="w-full mt-4 py-2 px-4 bg-gray-50 hover:bg-gray-100 rounded-lg text-gray-600 font-medium transition-colors"
                  >
                    {showAllActivities ? 'Show Less' : `Show All Activities (${activities.length})`}
                  </button>
                )}
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            {activeView !== 'dashboard' && (
              <button
                onClick={() => setActiveView('dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                Back to Dashboard
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
    </div>
  );
}