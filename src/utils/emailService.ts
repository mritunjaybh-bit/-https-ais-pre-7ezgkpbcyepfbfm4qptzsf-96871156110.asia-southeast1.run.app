import emailjs from '@emailjs/browser';
import { CartItem } from '../types';

export const EMAILJS_CREDENTIALS = {
  SERVICE_ID: 'service_g3orv2b',
  PUBLIC_KEY: 'ELHAjVMVjQAEVIiWB',
  OWNER_TEMPLATE_ID: 'template_g2buarq',
  CUSTOMER_TEMPLATE_ID: 'template_yrtnzv3',
  OWNER_EMAIL: 'mritunjay.bhardwaj@caphevietnam.in',
};

export interface SendOrderEmailsPayload {
  orderId: string;
  items: CartItem[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  cityPincode: string;
  finalTotalINR: number;
}

export interface EmailSendResult {
  success: boolean;
  ownerSuccess: boolean;
  customerSuccess: boolean;
  message: string;
  ownerError?: string;
  customerError?: string;
  error?: string;
}

/**
 * Sends both owner notification and customer confirmation emails via EmailJS.
 *
 * Exact Template IDs & Variables:
 * - Service ID: service_g3orv2b
 * - Public Key: ELHAjVMVjQAEVIiWB
 * - Owner Notification Template ID: template_g2buarq -> mritunjay.bhardwaj@caphevietnam.in
 * - Customer Confirmation Template ID: template_yrtnzv3 -> customer_email
 *
 * Template Variables passed:
 *   order_id, order_items, order_quantity, order_total, customer_name,
 *   customer_email, customer_phone, customer_address, order_time
 */
export async function sendOrderEmails(
  payload: SendOrderEmailsPayload
): Promise<EmailSendResult> {
  const customerEmailClean = payload.customerEmail.trim();
  const customerNameClean = payload.customerName.trim();
  const customerPhoneClean = payload.customerPhone.trim();
  const customerAddressClean = `${payload.shippingAddress.trim()}, ${payload.cityPincode.trim()}`;

  const order_items = payload.items
    .map(
      (item) =>
        `${item.quantity}x ${item.name} (${item.selectedSize}${
          item.selectedGrind ? ` - ${item.selectedGrind}` : ''
        }) - ₹${item.unitPriceINR * item.quantity}`
    )
    .join('\n');

  const order_quantity = payload.items.reduce((sum, item) => sum + item.quantity, 0);
  const order_total = `₹${payload.finalTotalINR}`;
  const order_time = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Base template variables required by prompt
  const baseVariables = {
    order_id: payload.orderId,
    order_items,
    order_quantity,
    order_total,
    customer_name: customerNameClean,
    customer_email: customerEmailClean,
    customer_phone: customerPhoneClean,
    customer_address: customerAddressClean,
    order_time,
  };

  let ownerSuccess = false;
  let customerSuccess = false;
  let ownerErrorMsg = '';
  let customerErrorMsg = '';

  // 1. Send Owner Notification email (template_g2buarq) to mritunjay.bhardwaj@caphevietnam.in
  try {
    const ownerParams = {
      ...baseVariables,
      // Recipient variables in case EmailJS template binds to to_email / email
      to_email: EMAILJS_CREDENTIALS.OWNER_EMAIL,
      owner_email: EMAILJS_CREDENTIALS.OWNER_EMAIL,
      to_name: 'Mritunjay Bhardwaj (Owner)',
      reply_to: customerEmailClean,
    };

    console.log('[EmailJS] Dispatching Owner Notification (template_g2buarq)...', ownerParams);
    const ownerResponse = await emailjs.send(
      EMAILJS_CREDENTIALS.SERVICE_ID,
      EMAILJS_CREDENTIALS.OWNER_TEMPLATE_ID,
      ownerParams,
      EMAILJS_CREDENTIALS.PUBLIC_KEY
    );

    if (ownerResponse.status === 200 || ownerResponse.text === 'OK') {
      ownerSuccess = true;
      console.log('[EmailJS] Owner notification dispatched successfully.');
    } else {
      ownerErrorMsg = `Owner template returned status ${ownerResponse.status}: ${ownerResponse.text}`;
      console.warn('[EmailJS] Owner notification status issue:', ownerErrorMsg);
    }
  } catch (err: any) {
    ownerErrorMsg = err?.text || err?.message || 'Owner email failed to send';
    console.error('[EmailJS] Owner notification error:', err);
  }

  // 2. Send Customer Confirmation email (template_yrtnzv3) to customer_email
  try {
    const customerParams = {
      ...baseVariables,
      // Exact field mappings so EmailJS template receives the recipient address under all standard variable conventions:
      customer_email: customerEmailClean,
      to_email: customerEmailClean,
      email: customerEmailClean,
      user_email: customerEmailClean,
      to_name: customerNameClean,
      reply_to: EMAILJS_CREDENTIALS.OWNER_EMAIL,
    };

    console.log('[EmailJS] Dispatching Customer Confirmation (template_yrtnzv3) to:', customerEmailClean, customerParams);
    const customerResponse = await emailjs.send(
      EMAILJS_CREDENTIALS.SERVICE_ID,
      EMAILJS_CREDENTIALS.CUSTOMER_TEMPLATE_ID,
      customerParams,
      EMAILJS_CREDENTIALS.PUBLIC_KEY
    );

    if (customerResponse.status === 200 || customerResponse.text === 'OK') {
      customerSuccess = true;
      console.log('[EmailJS] Customer confirmation dispatched successfully to:', customerEmailClean);
    } else {
      customerErrorMsg = `Customer template returned status ${customerResponse.status}: ${customerResponse.text}`;
      console.warn('[EmailJS] Customer confirmation status issue:', customerErrorMsg);
    }
  } catch (err: any) {
    customerErrorMsg = err?.text || err?.message || 'Customer email failed to send';
    console.error('[EmailJS] Customer confirmation error:', err);
  }

  const bothSucceeded = ownerSuccess && customerSuccess;

  let compositeMessage = '';
  if (bothSucceeded) {
    compositeMessage = 'Both order confirmation emails (Owner & Customer) sent successfully via EmailJS.';
  } else if (!ownerSuccess && !customerSuccess) {
    compositeMessage = `Failed to send both emails: ${ownerErrorMsg || customerErrorMsg}`;
  } else if (!ownerSuccess) {
    compositeMessage = `Customer email sent, but owner notification failed: ${ownerErrorMsg}`;
  } else {
    compositeMessage = `Owner notified, but customer confirmation to ${customerEmailClean} failed: ${customerErrorMsg}`;
  }

  return {
    success: bothSucceeded,
    ownerSuccess,
    customerSuccess,
    message: compositeMessage,
    ownerError: ownerErrorMsg || undefined,
    customerError: customerErrorMsg || undefined,
    error: bothSucceeded ? undefined : (ownerErrorMsg || customerErrorMsg),
  };
}
