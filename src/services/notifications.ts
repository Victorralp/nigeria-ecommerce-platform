import { supabase } from './supabase';

const TERMII_API_KEY = import.meta.env.VITE_TERMII_API_KEY;
const TERMII_SENDER_ID = import.meta.env.VITE_TERMII_SENDER_ID || 'STORE';

interface NotificationData {
  recipient: string;
  message: string;
  type: 'order_confirmation' | 'payment_success' | 'delivery_update' | 'order_shipped';
  metadata?: Record<string, any>;
}

export async function sendSMS(phoneNumber: string, message: string) {
  try {
    const response = await fetch('https://api.ng.termii.com/api/sms/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: TERMII_API_KEY,
        to: formatPhoneNumber(phoneNumber),
        from: TERMII_SENDER_ID,
        sms: message,
        type: 'plain',
        channel: 'generic'
      })
    });

    const data = await response.json();
    if (!data.message_id) {
      throw new Error('Failed to send SMS');
    }

    return data.message_id;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

export async function sendOrderConfirmation(orderDetails: {
  orderId: string;
  customerPhone: string;
  customerName: string;
  amount: number;
  items: Array<{ name: string; quantity: number }>;
}) {
  const message = `Dear ${orderDetails.customerName},\n\nYour order #${orderDetails.orderId} has been confirmed.\nTotal: ₦${orderDetails.amount.toLocaleString()}\n\nWe'll notify you when it ships.`;
  
  try {
    await sendSMS(orderDetails.customerPhone, message);
    
    // Log notification
    await saveNotification({
      recipient: orderDetails.customerPhone,
      message,
      type: 'order_confirmation',
      metadata: {
        orderId: orderDetails.orderId,
        amount: orderDetails.amount
      }
    });
  } catch (error) {
    console.error('Error sending order confirmation:', error);
  }
}

export async function sendDeliveryUpdate(details: {
  orderId: string;
  customerPhone: string;
  customerName: string;
  status: string;
  estimatedDelivery?: string;
}) {
  const message = `Dear ${details.customerName},\n\nYour order #${details.orderId} ${details.status}.${
    details.estimatedDelivery ? `\nEstimated delivery: ${details.estimatedDelivery}` : ''
  }\n\nTrack your order on our website.`;

  try {
    await sendSMS(details.customerPhone, message);
    
    // Log notification
    await saveNotification({
      recipient: details.customerPhone,
      message,
      type: 'delivery_update',
      metadata: {
        orderId: details.orderId,
        status: details.status
      }
    });
  } catch (error) {
    console.error('Error sending delivery update:', error);
  }
}

export async function sendOrderShipped(details: {
  orderId: string;
  customerPhone: string;
  customerName: string;
  trackingNumber?: string;
  estimatedDelivery: string;
}) {
  const message = `Dear ${details.customerName},\n\nYour order #${details.orderId} has been shipped!${
    details.trackingNumber ? `\nTracking number: ${details.trackingNumber}` : ''
  }\nEstimated delivery: ${details.estimatedDelivery}`;

  try {
    await sendSMS(details.customerPhone, message);
    
    // Log notification
    await saveNotification({
      recipient: details.customerPhone,
      message,
      type: 'order_shipped',
      metadata: {
        orderId: details.orderId,
        trackingNumber: details.trackingNumber
      }
    });
  } catch (error) {
    console.error('Error sending shipping notification:', error);
  }
}

async function saveNotification(data: NotificationData) {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        ...data,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving notification:', error);
  }
}

function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If the number starts with 0, replace it with +234
  if (cleaned.startsWith('0')) {
    return '+234' + cleaned.substring(1);
  }
  
  // If the number doesn't have a country code, add +234
  if (!cleaned.startsWith('234')) {
    return '+234' + cleaned;
  }
  
  // If the number starts with 234 but no +, add it
  if (cleaned.startsWith('234')) {
    return '+' + cleaned;
  }
  
  return phone;
} 