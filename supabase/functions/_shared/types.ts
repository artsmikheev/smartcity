export type LeadRequestType =
  | 'manager_call'
  | 'mortgage_consultation'
  | 'apartment_booking'
  | 'layout_request'
  | 'price_request'
  | 'partner_request'
  | 'other'
  | string;

export interface LeadWebhookRecord {
  id: string;
  public_reference: string;
  name: string;
  phone: string;
  request_type: LeadRequestType;
  contact_channel: string;
  comment: string | null;
  apartment_id: string | null;
  layout_id: string | null;
  created_at: string;
}

export interface LeadInsertWebhook {
  type: 'INSERT' | string;
  table: string;
  schema: string;
  record: LeadWebhookRecord;
  old_record: null;
}
