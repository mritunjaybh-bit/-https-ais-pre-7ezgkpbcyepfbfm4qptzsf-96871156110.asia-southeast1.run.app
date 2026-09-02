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
  error?: string;
}

/**
 * Sends both owner notification and customer confirmation emails via EmailJS.
 * Uses the exact Service ID, Public Key, Template IDs, and template variables required.
 */
export async function sendOrderEmails(
  payload: SendOrderEmailsPayload
): Promise<EmailSendResult> {
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
  const customer_address = `${payload.shippingAddress.trim()}, ${payload.cityPincode.trim()}`;
  const order_time = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const templateParams = {
    order_id: payload.orderId,
    order_items,
    order_quantity,
    order_total,
    customer_name: payload.customerName.trim(),
    customer_email: payload.customerEmail.trim(),
    customer_phone: payload.customerPhone.trim(),
    customer_address,
    order_time,
    // Supplemental helper parameters for EmailJS templates that bind to to_email / to_name / reply_to
    to_email: payload.customerEmail.trim(),
    to_name: payload.customerName.trim(),
  };

  try {
    // 1. Send Owner Notification email (template_g2buarq) to mritunjay.bhardwaj@caphevietnam.in
    const ownerParams = {
      ...templateParams,
      to_email: EMAILJS_CREDENTIALS.OWNER_EMAIL,
      to_name: 'Mritunjay Bhardwaj (Owner)',
      reply_to: payload.customerEmail.trim(),
    };

    const ownerResponse = await emailjs.send(
      EMAILJS_CREDENTIALS.SERVICE_ID,
      EMAILJS_CREDENTIALS.OWNER_TEMPLATE_ID,
      ownerParams,
      EMAILJS_CREDENTIALS.PUBLIC_KEY
    );

    // 2. Send Customer Confirmation email (template_yrtnzv3) to customer_email
    const customerParams = {
      ...templateParams,
      to_email: payload.customerEmail.trim(),
      to_name: payload.customerName.trim(),
      reply_to: EMAILJS_CREDENTIALS.OWNER_EMAIL,
    };

    const customerResponse = await emailjs.send(
      EMAILJS_CREDENTIALS.SERVICE_ID,
      EMAILJS_CREDENTIALS.CUSTOMER_TEMPLATE_ID,
      customerParams,
      EMAILJS_CREDENTIALS.PUBLIC_KEY
    );

    const ownerOk = ownerResponse.status === 200 || ownerResponse.text === 'OK';
    const customerOk = customerResponse.status === 200 || customerResponse.text === 'OK';

    return {
      success: ownerOk && customerOk,
      ownerSuccess: ownerOk,
      customerSuccess: customerOk,
      message: 'Both confirmation emails were sent successfully!',
    };
  } catch (error: any) {
    console.error('EmailJS order notification error:', error);
    return {
      success: false,
      ownerSuccess: false,
      customerSuccess: false,
      message: error?.text || error?.message || 'Failed to dispatch emails via EmailJS',
      error: String(error),
    };
  }
}
