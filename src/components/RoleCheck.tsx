import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Shield, ShieldAlert, User, Users } from 'lucide-react';

export default function RoleCheck() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkRoles() {
      try {
        // Get user roles
        const { data: userRoles, error: rolesError } = await supabase.rpc('get_user_roles');
        if (rolesError) throw rolesError;
        setRoles(userRoles.map((r: { role_name: string }) => r.role_name));

        // Check if user is admin
        const { data: adminCheck, error: adminError } = await supabase.rpc('has_role', {
          role_name: 'admin'
        });
        if (adminError) throw adminError;
        setIsAdmin(adminCheck);

        // If admin, fetch all users
        if (adminCheck) {
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select(`
              *,
              user_roles (
                roles (
                  name
                )
              )
            `);
          if (profilesError) throw profilesError;
          setAllUsers(profiles);
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (user) {
      checkRoles();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="text-center text-gray-600">
        Please log in to view role information
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading role information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current User Role Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <Shield className="w-5 h-5 mr-2" />
          Your Roles
        </h2>
        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role}
              className={`flex items-center space-x-2 p-2 rounded ${
                role === 'admin' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
              }`}
            >
              {role === 'admin' ? (
                <ShieldAlert className="w-4 h-4" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="capitalize">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Section */}
      {isAdmin && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            All Users (Admin View)
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roles
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {allUsers.map((profile) => (
                  <tr key={profile.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {profile.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt=""
                            className="h-8 w-8 rounded-full"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-500" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {profile.username || 'No username'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        {profile.user_roles?.map((userRole: any) => (
                          <span
                            key={userRole.roles.name}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              userRole.roles.name === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {userRole.roles.name}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}