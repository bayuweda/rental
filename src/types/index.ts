export type MotorcycleStatus =
  | "available"
  | "rented"
  | "maintenance"
  | "inactive";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "ongoing"
  | "completed"
  | "cancelled";

export interface Motorcycle {
  id: string;
  name: string;
  brand: string | null;
  type: string | null;
  year: number | null;
  license_plate: string | null;
  price_per_day: number;
  status: MotorcycleStatus;
  description: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string | null;
  telegram_chat_id: number | null;
  whatsapp_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  customer_id: string;
  motorcycle_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  price_per_day: number;
  total_price: number;
  status: BookingStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BookingWithRelations extends Booking {
  customers: Customer | null;
  motorcycles: Motorcycle | null;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}