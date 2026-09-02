/**
 * Razorpay Payment Gateway Service
 *
 * Implements Razorpay Standard Web Checkout:
 * 1. Calls backend POST /api/create-order to create an authentic Razorpay order with amount in paise
 * 2. Opens Razorpay Standard Checkout modal with generated order_id
 * 3. On success, passes (razorpay_payment_id, razorpay_order_id, razorpay_signature)
 *    to backend POST /api/verify-payment for HMAC-SHA256 signature verification
 */

export const RAZORPAY_CONFIG = {
  // Test / Live Key ID (Vite client-side prefix: VITE_RAZORPAY_KEY_ID)
  KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || '',
  MERCHANT_NAME: 'Cà Phê Vietnam',
  DESCRIPTION: 'Authentic Vietnamese Coffee Powders & Blends',
  THEME_COLOR: '#785a00',
};

export interface RazorpayPaymentSuccessPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
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

export interface BackendOrderResponse {
  order_id: string;
  amount: number;
  currency: string;
}

export interface VerificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  order_id?: string;
  payment_id?: string;
}

/**
 * Step 1: Create Order on Backend
 * Calls POST /api/create-order to initiate an order in Razorpay
 */
export async function createRazorpayOrder(
  amountPaise: number,
  receipt?: string,
  currency: string = 'INR'
): Promise<BackendOrderResponse> {
  const response = await fetch('/api/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `Failed to create payment order (HTTP ${response.status})`);
  }

  if (!data.order_id) {
    throw new Error('Backend did not return a valid Razorpay order ID.');
  }

  return data as BackendOrderResponse;
}

/**
 * Step 3: Verify Signature on Backend
 * Calls POST /api/verify-payment to check HMAC-SHA256 signature
 */
export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): Promise<VerificationResponse> {
  const response = await fetch('/api/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data?.error || 'Payment signature verification failed.');
  }

  return data as VerificationResponse;
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
 * Step 2: Opens the Razorpay Checkout Modal
 * 1. Creates order via /api/create-order
 * 2. Launches Razorpay Standard modal with backend order_id
 * 3. On success, verifies signature via /api/verify-payment
 * 4. Resolves with verified payment payload or rejects with clear error
 */
export async function openRazorpayCheckout(
  options: PaymentOptions
): Promise<RazorpayPaymentSuccessPayload> {
  if (!RAZORPAY_CONFIG.KEY_ID) {
    throw new Error('Razorpay Key ID (VITE_RAZORPAY_KEY_ID) is not configured in environment variables.');
  }

  const isLoaded = await loadRazorpaySDK();
  if (!isLoaded || !(window as any).Razorpay) {
    throw new Error('Razorpay payment gateway failed to load. Please check your internet connection.');
  }

  // Calculate amount in paise (1 INR = 100 paise)
  const amountPaise = Math.max(100, Math.round(options.amountINR * 100));

  // 1. Call Backend to create authenticated Razorpay Order
  const backendOrder = await createRazorpayOrder(amountPaise, options.orderId, 'INR');

  return new Promise((resolve, reject) => {
    const razorpayOptions = {
      key: RAZORPAY_CONFIG.KEY_ID,
      amount: backendOrder.amount,
      currency: backendOrder.currency,
      name: RAZORPAY_CONFIG.MERCHANT_NAME,
      description: `Order ${options.orderId} - Vietnamese Coffee`,
      order_id: backendOrder.order_id,
      image: '/app-favicon.ico',
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
        contact: options.customerPhone,
      },
      notes: {
        store_order_id: options.orderId,
        shipping_address: options.shippingAddress,
      },
      theme: {
        color: RAZORPAY_CONFIG.THEME_COLOR,
      },
      modal: {
        backdropclose: false,
        escape: true,
        ondismiss: function () {
          reject(new Error('Payment window was closed before completion. Your order has not been placed.'));
        },
      },
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id?: string;
        razorpay_signature?: string;
      }) {
        const orderIdToVerify = response.razorpay_order_id || backendOrder.order_id;
        const paymentId = response.razorpay_payment_id;
        const signature = response.razorpay_signature;

        if (!paymentId || !signature) {
          reject(new Error('Payment response missing payment ID or signature from Razorpay.'));
          return;
        }

        try {
          // 2. Call Backend to verify HMAC-SHA256 signature
          const verification = await verifyRazorpayPayment({
            razorpay_order_id: orderIdToVerify,
            razorpay_payment_id: paymentId,
            razorpay_signature: signature,
          });

          if (verification.success) {
            resolve({
              razorpay_payment_id: paymentId,
              razorpay_order_id: orderIdToVerify,
              razorpay_signature: signature,
            });
          } else {
            reject(new Error(verification.error || 'Payment signature verification failed.'));
          }
        } catch (verifyErr: any) {
          console.error('[Verification failed]:', verifyErr);
          reject(
            new Error(
              verifyErr?.message || 'Payment signature verification failed on backend. Do not fulfill order.'
            )
          );
        }
      },
    };

    try {
      const rzpInstance = new (window as any).Razorpay(razorpayOptions);

      rzpInstance.on('payment.failed', function (resp: { error: RazorpayPaymentFailurePayload }) {
        console.error('Razorpay payment.failed event:', resp);
        const desc = resp?.error?.description || 'Payment was declined or failed by your bank/UPI provider.';
        reject(new Error(desc));
      });

      rzpInstance.open();
    } catch (err: any) {
      console.error('Razorpay initialization error:', err);
      reject(new Error(err?.message || 'Failed to initialize payment gateway modal.'));
    }
  });
}
