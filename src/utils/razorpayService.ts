/**
 * Razorpay Payment Gateway Service
 *
 * ==============================================================================
 * RAZORPAY TEST MODE CREDENTIALS (PLACEHOLDER)
 * ==============================================================================
 * Key ID: 'rzp_test_1DP5mmOlF5G5ag' (Default Razorpay Test Key for UPI/Cards/Wallets)
 *
 * TO SWITCH TO LIVE MODE:
 * 1. Log in to your Razorpay Dashboard (https://dashboard.razorpay.com).
 * 2. Navigate to: Settings -> API Keys -> Generate Key.
 * 3. Copy your live Key ID (format: rzp_live_XXXXXXXXXXXXXXXX) and set it here
 *    or provide it via the VITE_RAZORPAY_KEY_ID environment variable.
 * ==============================================================================
 */

export const RAZORPAY_CONFIG = {
  // PLACEHOLDER TEST KEY: Replace with your live key 'rzp_live_...' when ready for production
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
  MERCHANT_NAME: 'Cà Phê Vietnam',
  DESCRIPTION: 'Authentic Vietnamese Coffee Powders & Blends',
  THEME_COLOR: '#785a00',
};

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayPaymentFailurePayload {
  code: string | number;
  description: string;
  source?: string;
  step?: string;
  reason?: string;
}

export interface PaymentOptions {
  orderId: string;
  amountINR: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
}

/**
 * Ensures the Razorpay checkout.js script is loaded on the page.
 */
export function loadRazorpaySDK(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay checkout SDK.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay Checkout Modal.
 * Resolves with success payload on successful payment.
 * Rejects with error on failed payment or user dismissal.
 */
export async function openRazorpayCheckout(
  options: PaymentOptions
): Promise<RazorpayPaymentSuccessPayload> {
  const isLoaded = await loadRazorpaySDK();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error('Razorpay payment gateway failed to load. Please check your internet connection.');
  }

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: RAZORPAY_CONFIG.KEY_ID,
      amount: Math.round(options.amountINR * 100), // Amount in paise (1 INR = 100 paise)
      currency: 'INR',
      name: RAZORPAY_CONFIG.MERCHANT_NAME,
      description: `Order ${options.orderId} - Vietnamese Coffee`,
      image: '/app-favicon.ico',
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      notes: {
        order_id: options.orderId,
        shipping_address: options.shippingAddress,
      },
      theme: {
        color: RAZORPAY_CONFIG.THEME_COLOR,
      },
      modal: {
        backdropclose: false,
        escape: true,
        ondismiss: function () {
          reject(new Error('Payment window was closed before completion. Your card was not charged.'));
        },
      },
      handler: function (response: RazorpayPaymentSuccessPayload) {
        if (response && response.razorpay_payment_id) {
          resolve(response);
        } else {
          reject(new Error('Payment could not be verified by gateway.'));
        }
      },
    };

    try {
      const rzpInstance = new (window as any).Razorpay(razorpayOptions);

      rzpInstance.on('payment.failed', function (resp: { error: RazorpayPaymentFailurePayload }) {
        console.error('Razorpay payment.failed event:', resp);
        const desc = resp?.error?.description || 'Payment was declined or failed by bank.';
        reject(new Error(desc));
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('Razorpay initialization error:', err);
      reject(new Error(err?.message || 'Failed to initialize payment gateway.'));
    }
  });
}
