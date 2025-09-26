import { useState } from 'react';
import { supabase } from '../lib/supabase';

interface SubscriptionResult {
  success: boolean;
  already_subscribed?: boolean;
  message?: string;
  error?: string;
}

interface SubscribeResponse {
  success: boolean;
  message?: string;
  error?: string;
  emailId?: string;
}

interface SubscriptionStatus {
  is_subscribed: boolean;
  subscription_date: string | null;
}

export function useNewsletter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [alreadySubscribed, setAlreadySubscribed] = useState(false);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

  const subscribe = async (email: string) => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);
    setAlreadySubscribed(false);
    setIsAlreadySubscribed(false);

    try {
      // First check if already subscribed
      const { data: statusData, error: statusError } = await supabase.rpc<SubscriptionStatus>(
        'check_subscription_status',
        { p_email: email }
      );

      if (statusError) throw statusError;
      
      if (statusData && statusData.is_subscribed) {
        setIsAlreadySubscribed(true);
        setSuccess(true);
        setError(null);
        setLoading(false);
        return true;
      }

      // Subscribe the user in the database
      const { data: subscriptionResult, error: dbError } = await supabase.rpc<SubscriptionResult>(
        'subscribe_to_newsletter',
        { p_email: email }
      );

      if (dbError) throw dbError;
      
      // If already subscribed, show success but don't send email
      if (subscriptionResult && subscriptionResult.already_subscribed) {
        setSuccess(true);
        setAlreadySubscribed(true);
        return true;
      }
      
      // Attempt to send welcome email, but don't fail if it doesn't work
      if (subscriptionResult && subscriptionResult.success && !subscriptionResult.already_subscribed) {
        try {
          await supabase.functions.invoke<SubscribeResponse>(
            'send-newsletter-email',
            {
              body: { email },
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );
        } catch (emailError) {
          // Log the error but don't fail the subscription
          console.warn('Welcome email could not be sent:', emailError);
        }
      }
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Newsletter subscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to subscribe. Please try again.');
      setIsAlreadySubscribed(false);
      setSuccess(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribe = async (email: string) => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: dbError } = await supabase.rpc('unsubscribe_from_newsletter', {
        p_email: email
      });
      
      setIsAlreadySubscribed(false);

      if (dbError) throw dbError;
      
      // Attempt to send unsubscribe confirmation email, but don't fail if it doesn't work
      try {
        await supabase.functions.invoke<SubscribeResponse>(
          'send-unsubscribe-email',
          {
            body: { email },
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
      } catch (emailError) {
        // Log the error but don't fail the unsubscription
        console.warn('Unsubscribe confirmation email could not be sent:', emailError);
      }
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Newsletter unsubscription error:', err);
      setError(err instanceof Error ? err.message : 'Failed to unsubscribe. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    subscribe,
    unsubscribe,
    loading,
    isAlreadySubscribed,
    error,
    success,
    alreadySubscribed
  };
}