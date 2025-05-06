export interface VisitReservation {
  id: number;
  booth_activity_id: number;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  visit_datetime: string;
  reservation_platform?: string;
  reservation_url?: string;
  notes?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;
  updated_at: string;
  activity_title: string;
  activity_description?: string;
  brand_name: string;
  venue_name: string;
}

export interface BoothActivity {
  id: number;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  is_reservation_available: boolean;
  brand_name: string;
  venue_name: string;
} 