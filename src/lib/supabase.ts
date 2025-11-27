import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  wallet_address: string | null;
  username: string;
  bio: string;
  is_seller: boolean;
  created_at: string;
  updated_at: string;
};

export type Product = {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  type: 'product' | 'service';
  price: number;
  currency: string;
  seller_wallet: string;
  unique_link: string;
  tags: string[];
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = {
  id: string;
  product_id: string | null;
  buyer_wallet: string;
  seller_wallet: string;
  amount: number;
  platform_fee: number;
  seller_amount: number;
  currency: string;
  transaction_hash: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
};

export type ServiceCategory = {
  id: string;
  name: string;
  description: string;
  created_at: string;
};
