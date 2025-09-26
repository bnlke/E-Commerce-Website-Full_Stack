import { useState } from 'react';
import { usePaymentMethods, PaymentMethod } from '../../hooks/usePaymentMethods';
import { CreditCard, Trash2, Plus, Check, X, AlertCircle, Calendar, Lock, Loader } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const cardTypes = [
  { id: 'visa', name: 'Visa', icon: '💳' },
  { id: 'mastercard', name: 'Mastercard', icon: '💳' },
  { id: 'amex', name: 'American Express', icon: '💳' },
  { id: 'discover', name: 'Discover', icon: '💳' }
];

export default function PaymentMethods() {
  const { user } = useAuth();
  const { 
    paymentMethods, 
    loading, 
    error, 
    addPaymentMethod, 
    deletePaymentMethod, 
    setDefaultPaymentMethod 
  } = usePaymentMethods();
  
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [formData, setFormData] = useState({
    card_type: 'visa',
    card_number: '',
    expiry_date: '',
    cvv: '',
    cardholder_name: '',
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
    
    if (!formData.card_number.trim()) {
      errors.card_number = 'Card number is required';
    } else if (!/^\d{16}$/.test(formData.card_number.replace(/\s/g, ''))) {
      errors.card_number = 'Card number must be 16 digits';
    }
    
    if (!formData.expiry_date.trim()) {
      errors.expiry_date = 'Expiry date is required';
    } else if (!/^\d{2}\/\d{2}$/.test(formData.expiry_date)) {
      errors.expiry_date = 'Expiry date must be in MM/YY format';
    }
    
    if (!formData.cvv.trim()) {
      errors.cvv = 'CVV is required';
    } else if (!/^\d{3,4}$/.test(formData.cvv)) {
      errors.cvv = 'CVV must be 3 or 4 digits';
    }
    
    if (!formData.cardholder_name.trim()) {
      errors.cardholder_name = 'Cardholder name is required';
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
      const result = await addPaymentMethod(formData);
      if (result) {
        setIsAddingCard(false);
        setFormData({
          card_type: 'visa',
          card_number: '',
          expiry_date: '',
          cvv: '',
          cardholder_name: '',
          is_default: false
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'card_number') {
      // Format card number with spaces every 4 digits
      const formatted = value
        .replace(/\s/g, '')
        .replace(/(\d{4})/g, '$1 ')
        .trim();
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'expiry_date') {
      // Format expiry date as MM/YY
      const cleaned = value.replace(/\D/g, '');
      let formatted = cleaned;
      
      if (cleaned.length > 2) {
        formatted = cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
      }
      
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        [name]: type === 'checkbox' ? checked : value 
      }));
    }
    
    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await deletePaymentMethod(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
    }
  };

  const handleSetDefault = async (id: string) => {
    await setDefaultPaymentMethod(id);
  };

  const formatCardNumber = (last_four: string) => {
    return `•••• •••• •••• ${last_four}`;
  };

  const getCardIcon = (cardType: string) => {
    const card = cardTypes.find(c => c.id === cardType.toLowerCase());
    return card ? card.icon : '💳';
  };

  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Payment Methods</h1>
        
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
            {paymentMethods.length === 0 && !isAddingCard ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payment methods</h3>
                <p className="text-gray-500 mb-6">Add a payment method to make checkout faster</p>
                <button
                  onClick={() => setIsAddingCard(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Payment Method
                </button>
              </div>
            ) : (
              <>
                {/* Payment Methods List */}
                {paymentMethods.length > 0 && (
                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b">
                      <h2 className="text-lg font-medium">Saved Payment Methods</h2>
                    </div>
                    <ul className="divide-y divide-gray-200">
                      {paymentMethods.map((method) => (
                        <li key={method.id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="text-2xl mr-3">{getCardIcon(method.card_type)}</span>
                              <div>
                                <p className="font-medium">
                                  {method.card_type.charAt(0).toUpperCase() + method.card_type.slice(1)} {formatCardNumber(method.last_four)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {method.cardholder_name} • Expires {method.expiry_date}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              {method.is_default ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <Check className="w-3 h-3 mr-1" />
                                  Default
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleSetDefault(method.id)}
                                  className="text-sm text-gray-600 hover:text-gray-900"
                                >
                                  Set as default
                                </button>
                              )}
                              
                              <button
                                onClick={() => handleDelete(method.id)}
                                className={`p-1 rounded-full ${
                                  deleteConfirm === method.id
                                    ? 'bg-red-100 text-red-600'
                                    : 'text-gray-400 hover:text-red-600'
                                }`}
                              >
                                {deleteConfirm === method.id ? (
                                  <Check className="w-5 h-5" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                              
                              {deleteConfirm === method.id && (
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="p-1 rounded-full text-gray-400 hover:text-gray-600"
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
                
                {/* Add Payment Method Button */}
                {!isAddingCard && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => setIsAddingCard(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Payment Method
                    </button>
                  </div>
                )}
              </>
            )}
            
            {/* Add Payment Method Form */}
            {isAddingCard && (
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
                  <h2 className="text-lg font-medium">Add Payment Method</h2>
                  <button
                    onClick={() => setIsAddingCard(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Card Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Type
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {cardTypes.map((card) => (
                        <button
                          key={card.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, card_type: card.id }))}
                          className={`relative flex items-center justify-center p-4 border rounded-lg ${
                            formData.card_type === card.id
                              ? 'border-black ring-2 ring-black'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-sm font-medium">{card.name}</span>
                          {formData.card_type === card.id && (
                            <Check className="absolute top-2 right-2 w-4 h-4 text-black" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Card Number */}
                  <div>
                    <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">
                      Card Number
                    </label>
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        id="card_number"
                        name="card_number"
                        value={formData.card_number}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19} // 16 digits + 3 spaces
                        className={`block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                          formErrors.card_number ? 'border-red-300' : ''
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <span className="text-gray-400">{getCardIcon(formData.card_type)}</span>
                      </div>
                    </div>
                    {formErrors.card_number && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.card_number}</p>
                    )}
                  </div>
                  
                  {/* Expiry Date and CVV */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiry_date" className="block text-sm font-medium text-gray-700">
                        Expiry Date
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="text"
                          id="expiry_date"
                          name="expiry_date"
                          value={formData.expiry_date}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                            formErrors.expiry_date ? 'border-red-300' : ''
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Calendar className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      {formErrors.expiry_date && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.expiry_date}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                        CVV
                      </label>
                      <div className="mt-1 relative">
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          maxLength={4}
                          className={`block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                            formErrors.cvv ? 'border-red-300' : ''
                          }`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Lock className="h-4 w-4 text-gray-400" />
                        </div>
                      </div>
                      {formErrors.cvv && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.cvv}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Cardholder Name */}
                  <div>
                    <label htmlFor="cardholder_name" className="block text-sm font-medium text-gray-700">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      id="cardholder_name"
                      name="cardholder_name"
                      value={formData.cardholder_name}
                      onChange={handleInputChange}
                      placeholder="John Doe"
                      className={`block w-full rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm border-gray-300 ${
                        formErrors.cardholder_name ? 'border-red-300' : ''
                      }`}
                    />
                    {formErrors.cardholder_name && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.cardholder_name}</p>
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
                      Set as default payment method
                    </label>
                  </div>
                  
                  {/* Security Note */}
                  <div className="text-xs text-gray-500 flex items-start">
                    <Lock className="w-4 h-4 mr-1 flex-shrink-0 mt-0.5" />
                    <p>
                      Your payment information is securely stored. We do not store your full card number or CVV.
                    </p>
                  </div>
                  
                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingCard(false)}
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
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Save Payment Method
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