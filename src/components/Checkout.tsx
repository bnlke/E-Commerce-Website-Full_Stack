import { useState, useRef, useEffect } from 'react';
import { useCart, CartItem } from '../contexts/CartContext';
import { useTransactions } from '../hooks/useTransactions';
import { X, CreditCard, Loader, Check, Calendar, Lock, ArrowRight, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useAddresses, Address } from '../hooks/useAddresses';
import { usePaymentMethods, PaymentMethod } from '../hooks/usePaymentMethods';
import { useNavigate } from 'react-router-dom';
import StripeCheckoutModal from './StripeCheckoutModal';

interface CheckoutFormData {
  email: string;
  name: string;
  address: string;
  city: string;
  country: string;
  cardType: string;
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  state: string;
  postal_code: string;
  save_address: boolean;
  address_name: string;
  phone: string;
  selected_address_id: string;
  selected_payment_id: string;
  save_payment: boolean;
}

const cardTypes = [
  { id: 'visa', name: 'Visa' },
  { id: 'mastercard', name: 'Mastercard' },
  { id: 'amex', name: 'American Express' },
  { id: 'discover', name: 'Discover' }
];

export default function Checkout({ onClose }: { onClose: () => void }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [formData, setFormData] = useState<CheckoutFormData>({
    email: '',
    name: '',
    address: '',
    city: '',
    country: '',
    cardType: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    state: '',
    postal_code: '',
    save_address: true,
    address_name: 'Home',
    phone: '',
    selected_address_id: '',
    selected_payment_id: '',
    save_payment: true
  });
  
  const { state, dispatch } = useCart();
  const { createTransaction } = useTransactions();
  const { user } = useAuth();
  const { addresses, loading: addressesLoading, addAddress } = useAddresses();
  const { paymentMethods, loading: paymentsLoading, addPaymentMethod } = usePaymentMethods();
  const navigate = useNavigate();

  const [showStripeCheckout, setShowStripeCheckout] = useState(false);
  
  // If showStripeCheckout is true, immediately render the StripeCheckoutModal
  if (showStripeCheckout) {
    return <StripeCheckoutModal onClose={() => {
      setShowStripeCheckout(false);
      onClose();
    }} />;
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (checkoutRef.current && !checkoutRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Pre-fill email if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        email: user.email || prev.email
      }));
    }
  }, [user]);

  // Set default address if available
  useEffect(() => {
    if (addresses.length > 0 && !useNewAddress) {
      const defaultAddress = addresses.find(addr => addr.is_default) || addresses[0];
      setFormData(prev => ({
        ...prev,
        selected_address_id: defaultAddress.id,
        name: defaultAddress.name,
        address: defaultAddress.address_line1,
        city: defaultAddress.city,
        state: defaultAddress.state,
        postal_code: defaultAddress.postal_code,
        country: defaultAddress.country,
        phone: defaultAddress.phone || ''
      }));
    }
  }, [addresses, useNewAddress]);

  // Set default payment method if available
  useEffect(() => {
    if (paymentMethods.length > 0) {
      const defaultPayment = paymentMethods.find(payment => payment.is_default) || paymentMethods[0];
      setFormData(prev => ({
        ...prev,
        selected_payment_id: defaultPayment.id,
        cardType: defaultPayment.card_type,
        cardNumber: `•••• •••• •••• ${defaultPayment.last_four}`,
        expiryDate: defaultPayment.expiry_date,
        name: defaultPayment.cardholder_name
      }));
    }
  }, [paymentMethods]);

  const handleSubmitLegacy = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // If using a new address and save_address is true, save the address
      if (useNewAddress && formData.save_address && user) {
        await addAddress({
          name: formData.address_name,
          address_line1: formData.address,
          address_line2: '',
          city: formData.city,
          state: formData.state,
          postal_code: formData.postal_code,
          country: formData.country,
          is_default: addresses.length === 0, // Make default if it's the first address
          phone: formData.phone
        });
      }

      // If saving new payment method
      if (step === 'payment' && formData.save_payment && user && 
          !formData.selected_payment_id && validateCardNumber(formData.cardNumber)) {
        await addPaymentMethod({
          card_type: formData.cardType,
          last_four: formData.cardNumber.slice(-4),
          expiry_date: formData.expiryDate,
          cardholder_name: formData.name,
          is_default: paymentMethods.length === 0 // Make default if it's the first payment method
        });
      }

      const transaction = await createTransaction(state);
      if (transaction.status !== 'failed') {
        dispatch({ type: 'CLEAR_CART' });
        // Navigate to order confirmation
        navigate(`/account/orders/${transaction.id}`);
        onClose();
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'shipping') {
      setStep('payment');
    } else {
      // Show Stripe checkout instead of processing directly
      setShowStripeCheckout(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as xxxx xxxx xxxx xxxx
    const groups = [];
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    
    return groups.join(' ');
  };

  const formatExpiryDate = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Format as MM/YY
    if (digits.length > 2) {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
    
    return digits;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formattedValue }));
  };

  const handleExpiryDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatExpiryDate(e.target.value);
    setFormData(prev => ({ ...prev, expiryDate: formattedValue }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow up to 4 digits for CVV
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setFormData(prev => ({ ...prev, cvv: value }));
  };

  const validateCardNumber = (number: string) => {
    const digits = number.replace(/\s/g, '');
    return digits.length >= 13 && digits.length <= 19 && /^\d+$/.test(digits);
  };

  const validateExpiryDate = (date: string) => {
    if (!/^\d{2}\/\d{2}$/.test(date)) return false;
    
    const [month, year] = date.split('/').map(part => parseInt(part, 10));
    const now = new Date();
    const currentYear = now.getFullYear() % 100;
    const currentMonth = now.getMonth() + 1;
    
    return month >= 1 && month <= 12 && 
           (year > currentYear || (year === currentYear && month >= currentMonth));
  };

  const validateCvv = (cvv: string) => {
    return /^\d{3,4}$/.test(cvv);
  };

  const handleAddressSelect = (addressId: string) => {
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        selected_address_id: selectedAddress.id,
        name: selectedAddress.name,
        address: selectedAddress.address_line1,
        city: selectedAddress.city,
        state: selectedAddress.state,
        postal_code: selectedAddress.postal_code,
        country: selectedAddress.country,
        phone: selectedAddress.phone || ''
      }));
    }
  };

  const handlePaymentMethodSelect = (paymentId: string) => {
    const selectedPayment = paymentMethods.find(payment => payment.id === paymentId);
    if (selectedPayment) {
      setFormData(prev => ({
        ...prev,
        selected_payment_id: selectedPayment.id,
        cardType: selectedPayment.card_type,
        cardNumber: `•••• •••• •••• ${selectedPayment.last_four}`,
        expiryDate: selectedPayment.expiry_date,
        name: selectedPayment.cardholder_name
      }));
    }
  };

  const renderShippingStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
        
        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
          />
        </div>

        {/* Saved Addresses Section */}
        {user && addresses.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Saved Addresses</h4>
              <button
                type="button"
                onClick={() => setUseNewAddress(!useNewAddress)}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {useNewAddress ? 'Use Saved Address' : 'Add New Address'}
              </button>
            </div>
            
            {!useNewAddress && (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div 
                    key={address.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      formData.selected_address_id === address.id 
                        ? 'border-black ring-2 ring-black' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleAddressSelect(address.id)}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">{address.name}</div>
                      {address.is_default && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{address.address_line1}</div>
                      <div>{address.city}, {address.state} {address.postal_code}</div>
                      <div>{address.country}</div>
                      {address.phone && <div>Phone: {address.phone}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Address Form */}
        {(useNewAddress || !user || addresses.length === 0) && (
          <div className="space-y-4">
            {user && (
              <div>
                <label htmlFor="address_name" className="block text-sm font-medium text-gray-700">
                  Address Name (e.g., Home, Work)
                </label>
                <input
                  type="text"
                  id="address_name"
                  name="address_name"
                  value={formData.address_name}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            )}

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
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Street Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                  State/Province
                </label>
                <input
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
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
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm"
              />
            </div>

            {user && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="save_address"
                  name="save_address"
                  checked={formData.save_address}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                />
                <label htmlFor="save_address" className="ml-2 block text-sm text-gray-900">
                  Save this address for future orders
                </label>
              </div>
            )}
          </div>
        )}

        {/* Order Summary */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4">
              <span>Total</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep('payment')}
            disabled={!formData.email || !formData.name || (!formData.selected_address_id && (!formData.address || !formData.city || !formData.state || !formData.postal_code || !formData.country))}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Continue to Payment
          </button>
        </div>
      </div>
    );
  };

  const renderPaymentStep = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
        
        {user && paymentMethods.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-medium">Saved Payment Methods</h4>
              <button
                type="button"
                onClick={() => {
                  setFormData(prev => ({ ...prev, selected_payment_id: '' }));
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {formData.selected_payment_id ? 'Use New Card' : 'Use Saved Card'}
              </button>
            </div>
            
            {formData.selected_payment_id && (
              <div className="space-y-4">
                {paymentMethods.map((payment) => (
                  <div 
                    key={payment.id}
                    className={`border rounded-lg p-4 cursor-pointer ${
                      formData.selected_payment_id === payment.id 
                        ? 'border-black ring-2 ring-black' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handlePaymentMethodSelect(payment.id)}
                  >
                    <div className="flex justify-between">
                      <div className="font-medium">
                        {payment.card_type.toUpperCase()} •••• {payment.last_four}
                      </div>
                      {payment.is_default && (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div>{payment.cardholder_name}</div>
                      <div>Expires: {payment.expiry_date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {(!formData.selected_payment_id || !user) && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Card Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {cardTypes.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cardType: card.id }))}
                  className={`relative flex items-center justify-center p-4 border rounded-lg ${
                    formData.cardType === card.id
                      ? 'border-black ring-2 ring-black'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-sm font-medium">{card.name}</span>
                  {formData.cardType === card.id && (
                    <Check className="absolute top-2 right-2 w-4 h-4 text-black" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Card Number
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                name="cardNumber"
                placeholder="•••• •••• •••• ••••"
                required
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                maxLength={19}
                className={`block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                  formData.cardNumber && !validateCardNumber(formData.cardNumber) ? 'border-red-300' : ''
                }`}
              />
            </div>
            {formData.cardNumber && !validateCardNumber(formData.cardNumber) && (
              <p className="mt-1 text-sm text-red-600">Please enter a valid card number</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Expiry Date
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="expiryDate"
                  placeholder="MM/YY"
                  required
                  value={formData.expiryDate}
                  onChange={handleExpiryDateChange}
                  maxLength={5}
                  className={`block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                    formData.expiryDate && !validateExpiryDate(formData.expiryDate) ? 'border-red-300' : ''
                  }`}
                />
              </div>
              {formData.expiryDate && !validateExpiryDate(formData.expiryDate) && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid expiry date</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CVV
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="cvv"
                  required
                  value={formData.cvv}
                  onChange={handleCvvChange}
                  maxLength={4}
                  placeholder="123"
                  className={`block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm ${
                    formData.cvv && !validateCvv(formData.cvv) ? 'border-red-300' : ''
                  }`}
                />
              </div>
              {formData.cvv && !validateCvv(formData.cvv) && (
                <p className="mt-1 text-sm text-red-600">Please enter a valid CVV</p>
              )}
            </div>
          </div>
          
          {user && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="save_payment"
                name="save_payment"
                checked={formData.save_payment}
                onChange={handleInputChange}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="save_payment" className="ml-2 block text-sm text-gray-900">
                Save this payment method for future orders
              </label>
            </div>
          )}
        </div>
        )}

        {/* Order Summary */}
        <div className="mt-6 space-y-4">
          <h3 className="font-semibold">Order Summary</h3>
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-lg font-bold mt-4">
              <span>Total</span>
              <span>${state.total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <button
            type="button"
            onClick={() => setStep('shipping')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Back
          </button>
          <div className="space-x-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate('/account/payment-methods');
              }}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Manage payment methods
            </button>
            <button
              type="button"
              onClick={() => setShowStripeCheckout(true)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-md hover:from-blue-600 hover:to-purple-700 flex items-center justify-center"
            >
              <span>Checkout with Stripe</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div ref={checkoutRef} className="bg-white p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Checkout {step === 'shipping' ? '- Shipping' : '- Payment'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 'shipping' ? renderShippingStep() : renderPaymentStep()}
        </form>
      </div>