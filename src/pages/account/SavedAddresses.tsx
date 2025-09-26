import { useState } from 'react';
import { useAddresses } from '../../hooks/useAddresses';
import { MapPin, Plus, Trash2, Check, X, Home, Building, Edit, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

export default function SavedAddresses() {
  const { user } = useAuth();
  const { 
    addresses, 
    loading, 
    error, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress 
  } = useAddresses();
  
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    phone: '',
    is_default: false
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  if (!user) {
    return <Navigate to="/login" />;
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
    } else if (formData.postal_code.length !== 6) {
      errors.postal_code = 'Postal code must be exactly 6 characters';
    }
    
    if (!formData.country.trim()) {
      errors.country = 'Country is required';
    }

    if (formData.phone && formData.phone.trim() !== '') {
      const phoneDigits = formData.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (editingAddressId) {
        await updateAddress(editingAddressId, formData);
      } else {
        await addAddress(formData);
      }
      
      resetForm();
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address_line1: '',
      address_line2: '',
      city: '',
      state: '',
      postal_code: '',
      country: '',
      phone: '',
      is_default: false
    });
    setFormErrors({});
    setIsAddingAddress(false);
    setEditingAddressId(null);
  };

  const handleEdit = (addressId: string) => {
    const address = addresses.find(a => a.id === addressId);
    if (!address) return;
    
    setFormData({
      name: address.name,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      phone: address.phone || '',
      is_default: address.is_default
    });
    
    setEditingAddressId(addressId);
    setIsAddingAddress(true);
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deleteAddress(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultAddress(id);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Saved Addresses</h1>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {addresses.length === 0 && !isAddingAddress ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                <p className="text-gray-500 mb-6">Add a shipping address to make checkout faster</p>
                <button
                  onClick={() => setIsAddingAddress(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Address
                </button>
              </div>
            ) : (
              <>
                {/* Address List */}
                {addresses.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                      <h2 className="text-lg font-medium">Saved Addresses</h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {addresses.map((address) => (
                        <li key={address.id} className="px-6 py-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <div className="mt-1">
                                {address.is_default ? (
                                  <Home className="w-5 h-5 text-gray-400" />
                                ) : (
                                  <Building className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="font-medium">{address.name}</p>
                                <p>{address.address_line1}</p>
                                {address.address_line2 && <p>{address.address_line2}</p>}
                                <p>
                                  {address.city}, {address.state} {address.postal_code}
                                </p>
                                <p>{address.country}</p>
                                {address.phone && <p className="mt-1">{address.phone}</p>}
                                {address.is_default && (
                                  <span className="inline-flex items-center mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <Check className="w-3 h-3 mr-1" />
                                    Default Address
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEdit(address.id)}
                                className="p-1 text-gray-400 hover:text-gray-600"
                                title="Edit"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              
                              {!address.is_default && (
                                <button
                                  onClick={() => handleSetDefault(address.id)}
                                  className="text-sm text-gray-600 hover:text-gray-900"
                                  title="Set as default"
                                >
                                  Set default
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDelete(address.id)}
                                className={`p-1 rounded-full ${
                                  deleteConfirm === address.id
                                    ? 'bg-red-100 text-red-600'
                                    : 'text-gray-400 hover:text-red-600'
                                }`}
                                title="Delete"
                              >
                                {deleteConfirm === address.id ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                              
                              {deleteConfirm === address.id && (
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
                                  title="Cancel"
                                >
                                  <X className="w-5 h-5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Add Address Button */}
                {!isAddingAddress && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsAddingAddress(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Address
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Add/Edit Address Form */}
            {isAddingAddress && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                  <h2 className="text-lg font-medium">
                    {editingAddressId ? 'Edit Address' : 'Add New Address'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                        formErrors.name ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  
                  {/* Address Line 1 */}
                  <div>
                    <label htmlFor="address_line1" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      id="address_line1"
                      name="address_line1"
                      value={formData.address_line1}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                        formErrors.address_line1 ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.address_line1 && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address_line1}</p>
                    )}
                  </div>
                  
                  {/* Address Line 2 */}
                  <div>
                    <label htmlFor="address_line2" className="block text-sm font-medium text-gray-700">
                      Apartment, suite, etc. (optional)
                    </label>
                    <input
                      type="text"
                      id="address_line2"
                      name="address_line2"
                      value={formData.address_line2}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300"
                    />
                  </div>
                  
                  {/* City, State, Postal Code */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                          formErrors.city ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.city && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State / Province
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                          formErrors.state ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.state && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                        Postal Code
                      </label>
                      <input
                        type="text"
                        id="postal_code"
                        name="postal_code"
                        value={formData.postal_code}
                        onChange={handleInputChange}
                        maxLength={6}
                        pattern=".{6,6}"
                        title="Postal code must be exactly 6 characters"
                        onInput={(e) => {
                          e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                        }}
                        className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                          formErrors.postal_code ? 'border-red-300' : ''
                        }`}
                      />
                      {formErrors.postal_code && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.postal_code}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                        formErrors.country ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.country && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.country}</p>
                    )}
                  </div>
                  
                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone (optional)
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      pattern="[0-9]{10}"
                      title="Phone number must be exactly 10 digits"
                      maxLength={10}
                      onInput={(e) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '');
                      }}
                      className="mt-1 block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300"
                    />
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  {/* Set as Default */}
                  <div className="flex items-center">
                    <input
                      id="is_default"
                      name="is_default"
                      type="checkbox"
                      checked={formData.is_default}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                    />
                    <label htmlFor="is_default" className="ml-2 block text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <MapPin className="w-4 h-4 mr-2" />
                          {editingAddressId ? 'Update Address' : 'Save Address'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}