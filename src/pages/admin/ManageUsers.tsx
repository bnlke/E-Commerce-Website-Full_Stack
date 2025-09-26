

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface UserData {
  id: string;
  email: string;
  username: string | null;
  roles: string[];
  created_at: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data: roleAssignments, error: roleError } = await supabase.rpc('verify_role_assignments');
      if (roleError) throw roleError;

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*');
      if (profileError) throw profileError;

      const combinedData = roleAssignments.map(user => ({
        ...user,
        username: profiles?.find(p => p.id === user.user_id)?.username || null
      }));

      setUsers(combinedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdminRole(email: string, currentRoles: string[]) {
    if (actionInProgress) return;
    setActionInProgress(true);
    try {
      const isCurrentlyAdmin = currentRoles.includes('admin');
      
      // Log the activity first
      await supabase.rpc('log_admin_activity', {
        p_action: isCurrentlyAdmin ? 'removed admin role from' : 'assigned admin role to',
        p_entity_type: 'user',
        p_details: { email: email }
      });

      if (isCurrentlyAdmin) {
        // Remove admin role
        const { error } = await supabase.rpc('remove_admin_role', { user_email: email });
        if (error) throw error;
      } else {
        // Add admin role
        const { error } = await supabase.rpc('assign_admin_by_email', { user_email: email });
        if (error) throw error;
      }
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user role');
    } finally {
      setActionInProgress(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
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
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-4">Manage Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.username || 'No username'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex gap-2">
                      {user.roles.map((role) => (
                        <span
                          key={`${user.user_id}-${role}`}
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => toggleAdminRole(user.email, user.roles)}
                      className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium ${
                        user.roles.includes('admin')
                          ? 'border-red-300 text-red-700 hover:bg-red-50'
                          : 'border-purple-300 text-purple-700 hover:bg-purple-50'
                      }`}
                    >
                      <Shield className="w-4 h-4 mr-2" />
                      {user.roles.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
