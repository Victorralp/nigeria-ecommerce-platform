import { PaystackOptions } from '@paystack/inline-js';
import { supabase } from './supabase';
import { formatNaira } from './products';

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

export interface PaymentDetails {
  email: string;
  amount: number;
  reference: string;
  metadata: {
    orderId: string;
    customerId: string;
    items: Array<{
      id: string;
      name: string;
      quantity: number;
      price: number;
    }>;
  };
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'ussd' | 'bank' | 'qr';
  channels: ('card' | 'bank' | 'ussd' | 'qr' | 'mobile_money')[];
  logo?: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Card Payment',
    type: 'card',
    channels: ['card'],
    logo: '/icons/credit-card.svg'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    type: 'bank_transfer',
    channels: ['bank'],
    logo: '/icons/bank-transfer.svg'
  },
  {
    id: 'ussd',
    name: 'USSD',
    type: 'ussd',
    channels: ['ussd'],
    logo: '/icons/ussd.svg'
  },
  {
    id: 'qr',
    name: 'Scan to Pay',
    type: 'qr',
    channels: ['qr'],
    logo: '/icons/qr-code.svg'
  }
];

export const BANKS = [
  { name: 'Access Bank', code: '044', ussd: '*901#' },
  { name: 'Guaranty Trust Bank', code: '058', ussd: '*737#' },
  { name: 'Zenith Bank', code: '057', ussd: '*966#' },
  { name: 'First Bank of Nigeria', code: '011', ussd: '*894#' },
  { name: 'United Bank for Africa', code: '033', ussd: '*919#' },
  { name: 'Fidelity Bank', code: '070', ussd: '*770#' },
  { name: 'Union Bank', code: '032', ussd: '*826#' },
  { name: 'Stanbic IBTC', code: '221', ussd: '*909#' },
  { name: 'Sterling Bank', code: '232', ussd: '*822#' },
  { name: 'Unity Bank', code: '215', ussd: '*7799#' }
];

export async function initializePayment(details: PaymentDetails): Promise<string> {
  try {
    // Save payment intent to database
    const { data, error } = await supabase
      .from('payment_intents')
      .insert([{
        reference: details.reference,
        amount: details.amount,
        email: details.email,
        metadata: details.metadata,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;

    // Return the payment reference
    return data.reference;
  } catch (error) {
    console.error('Error initializing payment:', error);
    throw error;
  }
}

export function getPaystackConfig(details: PaymentDetails): PaystackOptions {
  if (!PAYSTACK_PUBLIC_KEY) {
    throw new Error('Paystack public key not found');
  }

  return {
    key: PAYSTACK_PUBLIC_KEY,
    email: details.email,
    amount: details.amount * 100, // Convert to kobo
    ref: details.reference,
    metadata: {
      custom_fields: [
        {
          display_name: "Order ID",
          variable_name: "order_id",
          value: details.metadata.orderId
        }
      ]
    },
    channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money'],
    currency: 'NGN',
    label: 'Order Payment',
    onClose: () => {
      console.log('Payment window closed');
    },
    callback: async (response) => {
      if (response.status === 'success') {
        // Update payment status in database
        await supabase
          .from('payment_intents')
          .update({ 
            status: 'completed',
            payment_data: response,
            updated_at: new Date().toISOString()
          })
          .eq('reference', details.reference);

        // Send SMS notification
        await sendPaymentNotification(details);
      }
    }
  };
}

export async function verifyPayment(reference: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    return data.status && data.data.status === 'success';
  } catch (error) {
    console.error('Error verifying payment:', error);
    return false;
  }
}

async function sendPaymentNotification(details: PaymentDetails) {
  try {
    // You would implement your SMS service here
    // For example, using Termii, Twilio, or any other SMS provider
    console.log('Sending payment notification via SMS...');
    
    const message = `Payment Received: ${formatNaira(details.amount)} for Order #${details.metadata.orderId}. Thank you for shopping with us!`;
    
    // This is a placeholder for the actual SMS implementation
    // await sendSMS(customerPhone, message);
    
    // Log the notification
    await supabase
      .from('notifications')
      .insert([{
        type: 'payment_success',
        recipient: details.email,
        message,
        metadata: {
          orderId: details.metadata.orderId,
          amount: details.amount
        },
        created_at: new Date().toISOString()
      }]);
  } catch (error) {
    console.error('Error sending payment notification:', error);
  }
}

export async function generatePaymentLink(details: PaymentDetails): Promise<string> {
  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_PUBLIC_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: details.email,
        amount: details.amount * 100,
        reference: details.reference,
        callback_url: `${window.location.origin}/payment/verify`,
        metadata: details.metadata
      })
    });

    const data = await response.json();
    if (data.status) {
      return data.data.authorization_url;
    }
    throw new Error('Failed to generate payment link');
  } catch (error) {
    console.error('Error generating payment link:', error);
    throw error;
  }
}

export function getUSSDCode(bankCode: string, amount: number, reference: string): string {
  const bank = BANKS.find(b => b.code === bankCode);
  if (!bank) throw new Error('Invalid bank code');

  // Format amount to remove decimals
  const formattedAmount = Math.round(amount).toString();

  // Generate USSD code based on bank
  switch (bankCode) {
    case '058': // GTBank
      return `*737*${formattedAmount}*${reference}#`;
    case '057': // Zenith Bank
      return `*966*${formattedAmount}#`;
    case '011': // First Bank
      return `*894*${formattedAmount}#`;
    default:
      return bank.ussd;
  }
} 