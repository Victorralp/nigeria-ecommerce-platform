import { supabase } from './supabase';

export const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba',
  'Yobe', 'Zamfara'
];

export const SHIPPING_ZONES = {
  lagos: {
    name: 'Lagos Zone',
    states: ['Lagos'],
    baseRate: 2000,
    estimatedDays: '1-2'
  },
  southWest: {
    name: 'South West Zone',
    states: ['Ogun', 'Oyo', 'Osun', 'Ondo', 'Ekiti'],
    baseRate: 3000,
    estimatedDays: '2-3'
  },
  southSouth: {
    name: 'South South Zone',
    states: ['Edo', 'Delta', 'Bayelsa', 'Rivers', 'Cross River', 'Akwa Ibom'],
    baseRate: 3500,
    estimatedDays: '3-4'
  },
  southEast: {
    name: 'South East Zone',
    states: ['Abia', 'Anambra', 'Ebonyi', 'Enugu', 'Imo'],
    baseRate: 3500,
    estimatedDays: '3-4'
  },
  northCentral: {
    name: 'North Central Zone',
    states: ['Benue', 'FCT', 'Kogi', 'Kwara', 'Nasarawa', 'Niger', 'Plateau'],
    baseRate: 4000,
    estimatedDays: '3-5'
  },
  northEast: {
    name: 'North East Zone',
    states: ['Adamawa', 'Bauchi', 'Borno', 'Gombe', 'Taraba', 'Yobe'],
    baseRate: 4500,
    estimatedDays: '4-6'
  },
  northWest: {
    name: 'North West Zone',
    states: ['Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Jigawa', 'Sokoto', 'Zamfara'],
    baseRate: 4500,
    estimatedDays: '4-6'
  }
};

export interface ShippingRate {
  baseRate: number;
  estimatedDays: string;
  zone: string;
}

export function calculateShippingRate(state: string, weight: number = 1): ShippingRate {
  // Find the zone for the state
  const zone = Object.entries(SHIPPING_ZONES).find(([_, zoneData]) => 
    zoneData.states.includes(state)
  );

  if (!zone) {
    throw new Error('Invalid state selected');
  }

  const [zoneName, zoneData] = zone;
  
  // Base rate for the first kg
  let rate = zoneData.baseRate;
  
  // Add additional cost for each kg after the first
  if (weight > 1) {
    rate += (weight - 1) * 500; // ₦500 per additional kg
  }

  return {
    baseRate: rate,
    estimatedDays: zoneData.estimatedDays,
    zone: zoneData.name
  };
}

export interface DeliveryAddress {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  state: string;
  city: string;
  street: string;
  additionalInfo?: string;
}

export async function saveDeliveryAddress(userId: string, address: DeliveryAddress) {
  const { error } = await supabase
    .from('delivery_addresses')
    .insert([{
      user_id: userId,
      ...address,
      created_at: new Date().toISOString()
    }]);

  if (error) throw error;
}

export async function getDeliveryAddresses(userId: string): Promise<DeliveryAddress[]> {
  const { data, error } = await supabase
    .from('delivery_addresses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Payment integration placeholder
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'bank_transfer' | 'ussd' | 'bank' | 'wallet';
  icon: string;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'card',
    name: 'Card Payment',
    type: 'card',
    icon: '💳'
  },
  {
    id: 'bank_transfer',
    name: 'Bank Transfer',
    type: 'bank_transfer',
    icon: '🏦'
  },
  {
    id: 'ussd',
    name: 'USSD',
    type: 'ussd',
    icon: '📱'
  },
  {
    id: 'bank',
    name: 'Pay with Bank',
    type: 'bank',
    icon: '🏛️'
  }
]; 