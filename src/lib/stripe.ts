/**
 * Stripe Integration for EDM Shuffle Marketplace
 * Handles real payment processing for digital goods
 */

import { loadStripe, Stripe } from '@stripe/stripe-js'

// Initialize Stripe with publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '')

export const getStripe = async (): Promise<Stripe | null> => {
  return await stripePromise
}

export interface StripeProduct {
  id: string
  name: string
  price: number
  currency: string
  description: string
  metadata: {
    archetype?: string
    category?: string
    downloadUrl?: string
  }
}

export interface PaymentResult {
  success: boolean
  paymentIntentId?: string
  error?: string
}

/**
 * Create a payment intent for a product
 */
export const createPaymentIntent = async (
  product: StripeProduct,
  userEmail: string
): Promise<{ clientSecret: string; paymentIntentId: string } | null> => {
  try {
    // In a real app, this would call your backend API
    // For now, we'll simulate the payment intent creation
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(product.price * 100), // Convert to cents
        currency: product.currency || 'usd',
        productId: product.id,
        userEmail,
        metadata: product.metadata,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create payment intent')
    }

    const data = await response.json()
    return {
      clientSecret: data.client_secret,
      paymentIntentId: data.id,
    }
  } catch (error) {
    console.error('Error creating payment intent:', error)
    return null
  }
}

/**
 * Process payment using Stripe Elements
 */
export const processPayment = async (
  stripe: Stripe,
  elements: any,
  clientSecret: string
): Promise<PaymentResult> => {
  try {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/marketplace?payment=success`,
      },
      redirect: 'if_required',
    })

    if (error) {
      return {
        success: false,
        error: error.message || 'Payment failed',
      }
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      return {
        success: true,
        paymentIntentId: paymentIntent.id,
      }
    }

    return {
      success: false,
      error: 'Payment was not completed',
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    }
  }
}

/**
 * Mock payment API for development
 * In production, replace with real Stripe webhook handling
 */
export const mockPaymentAPI = {
  async createPaymentIntent(product: StripeProduct, userEmail: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simulate payment intent creation
    const mockClientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substr(2, 9)}`
    const mockPaymentIntentId = `pi_mock_${Date.now()}`
    
    return {
      client_secret: mockClientSecret,
      id: mockPaymentIntentId,
      amount: Math.round(product.price * 100),
      currency: 'usd',
      status: 'requires_payment_method',
    }
  },

  async confirmPayment(paymentIntentId: string) {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate successful payment (90% success rate for demo)
    const success = Math.random() > 0.1
    
    if (success) {
      return {
        id: paymentIntentId,
        status: 'succeeded',
        amount_received: 1000, // Mock amount
      }
    } else {
      throw new Error('Your card was declined. Please try a different payment method.')
    }
  }
}

/**
 * Development mode payment processing
 */
export const processPaymentDev = async (
  product: StripeProduct,
  userEmail: string
): Promise<PaymentResult> => {
  try {
    console.log('🏪 Processing payment (dev mode):', { product, userEmail })
    
    // Create mock payment intent
    const paymentIntent = await mockPaymentAPI.createPaymentIntent(product, userEmail)
    
    // Simulate payment confirmation
    const confirmedPayment = await mockPaymentAPI.confirmPayment(paymentIntent.id)
    
    return {
      success: true,
      paymentIntentId: confirmedPayment.id,
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    }
  }
}

/**
 * Check if Stripe is properly configured
 */
export const isStripeConfigured = (): boolean => {
  return !!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
}

/**
 * Get payment method types based on amount
 */
export const getPaymentMethods = (amount: number): string[] => {
  const methods = ['card']
  
  // Add additional payment methods for higher amounts
  if (amount >= 50) {
    methods.push('klarna', 'afterpay_clearpay')
  }
  
  return methods
}