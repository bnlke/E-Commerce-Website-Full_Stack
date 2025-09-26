import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Address {
  id: string;
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export function useAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  interface AddressFormData {
    name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
    phone?: string;
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.address_line1.trim()) {
      errors.address_line1 = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      errors.state = 'State/Province is required';
    }
    
    if (!formData.postal_code.trim()) {
      errors.postal_code = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.postal_code)) {
      errors.postal_code = 'Postal code must be exactly 6 digits';
    }
    
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }
    
    if (formData.phone && formData.phone.trim() !== '') {
      if (!/^\d{10}$/.test(formData.phone)) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (user) {
      fetchAddresses();
    } else {
      setAddresses([]);
      setLoading(false);
    }
  }, [user]);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_addresses')
        .select('*')
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAddresses(data || []);
    } catch (err) {
      console.error('Error fetching addresses:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch addresses');
    } finally {
      setLoading(false);
    }
  };

  const addAddress = async (addressData: AddressFormData) => {
    try {
      setLoading(true);
      
      // Ensure user_id is set to the current user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('user_addresses')
        .insert([{
          ...addressData,
          user_id: userData.user.id
        }])
        .select()
        .single();

      if (error) throw error;

      // If this is set as default, update all other addresses
      if (addressData.is_default && data) {
        await setDefaultAddress(data.id);
      } else {
        // Just refresh the list
        await fetchAddresses();
      }

      return data;
    } catch (err) {
      console.error('Error adding address:', err);
      setError(err instanceof Error ? err.message : 'Failed to add address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAddress = async (id: string, updates: Partial<Omit<Address, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_addresses')
        .update(updates)
        .eq('id', id)
        .select();

      if (error) throw error;

      // If this is set as default, update all other addresses
      if (updates.is_default && data && data.length > 0) {
        await setDefaultAddress(id);
      } else {
        // Just refresh the list
        await fetchAddresses();
      }

      return data?.[0];
    } catch (err) {
      console.error('Error updating address:', err);
      setError(err instanceof Error ? err.message : 'Failed to update address');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      // Check if this is the default address
      const addressToDelete = addresses.find(addr => addr.id === id);
      
      const { error } = await supabase
        .from('user_addresses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // If we deleted the default address and there are other addresses,
      // set the first remaining one as default
      if (addressToDelete?.is_default && addresses.length > 1) {
        const remainingAddresses = addresses.filter(addr => addr.id !== id);
        if (remainingAddresses.length > 0) {
          await setDefaultAddress(remainingAddresses[0].id);
        }
      } else {
        // Just refresh the list
        await fetchAddresses();
      }

      return true;
    } catch (err) {
      console.error('Error deleting address:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete address');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase
        .rpc('set_default_address', { p_address_id: id });

      if (error) throw error;

      await fetchAddresses();
      return true;
    } catch (err) {
      console.error('Error setting default address:', err);
      setError(err instanceof Error ? err.message : 'Failed to set default address');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addresses,
    loading,
    error,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };
}