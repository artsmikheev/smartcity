// Source: restore-archive/supabase/migrations/0001_init.sql.
// UUID, text, date and timestamp columns are strings; numeric columns are numbers.

export type AppRole =
  | 'client'
  | 'sales_manager'
  | 'content_manager'
  | 'sales_lead'
  | 'partner'
  | 'admin';

export type ContentStatus = 'draft' | 'preview' | 'published' | 'archived';

export type AvailabilityStatus =
  | 'available'
  | 'reserved'
  | 'sold'
  | 'hidden'
  | 'unknown';

export type LeadStatus =
  | 'new'
  | 'assigned'
  | 'in_progress'
  | 'qualified'
  | 'won'
  | 'lost'
  | 'duplicate';

export type LeadRequestType =
  | 'manager_call'
  | 'mortgage_consultation'
  | 'apartment_booking'
  | 'layout_request'
  | 'price_request'
  | 'partner_request'
  | 'other';

export type PromoStatus = 'draft' | 'scheduled' | 'active' | 'expired' | 'archived';

export type SocialPlatform =
  | 'telegram'
  | 'vk'
  | 'youtube'
  | 'whatsapp'
  | 'instagram'
  | 'site'
  | 'other';

export type Building = {
  id: string;
  slug: string;
  title: string;
  address_label: string | null;
  order_index: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Layout = {
  id: string;
  slug: string;
  title: string;
  rooms: number;
  area_min: number | null;
  area_max: number | null;
  plan_path: string | null;
  description: string | null;
  order_index: number;
  published: boolean;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type Apartment = {
  id: string;
  building_id: string;
  layout_id: string;
  number: string;
  floor: number;
  rooms: number;
  area: number;
  price: number | null;
  currency: string;
  availability_status: AvailabilityStatus;
  availability_updated_at: string | null;
  price_updated_at: string | null;
  is_demo: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  display_name: string | null;
  phone: string | null;
  email: string | null;
  avatar_path: string | null;
  created_at: string;
  updated_at: string;
};

export type UserRole = {
  user_id: string;
  role: AppRole;
  created_at: string;
};

export type PriceHistory = {
  id: string;
  apartment_id: string;
  price: number;
  effective_from: string;
  effective_to: string | null;
  changed_by: string | null;
  created_at: string;
};

export type Favorite = {
  user_id: string;
  apartment_id: string;
  created_at: string;
};

export type Promo = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  cover_path: string | null;
  terms: string | null;
  status: PromoStatus;
  starts_at: string | null;
  ends_at: string | null;
  cta_label: string | null;
  cta_request_type: LeadRequestType | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_path: string | null;
  body_md: string;
  tags: string[];
  status: ContentStatus;
  author_id: string | null;
  published_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type SocialLink = {
  id: string;
  platform: SocialPlatform;
  url: string;
  label: string;
  order_index: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
};

export type ConstructionUpdate = {
  id: string;
  slug: string;
  title: string;
  body_md: string;
  report_month: string;
  building_id: string | null;
  media_paths: string[];
  status: ContentStatus;
  published_at: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
};

export type ConsentVersion = {
  id: string;
  version: string;
  body: string;
  legal_basis: string;
  published_at: string | null;
  superseded_at: string | null;
  created_at: string;
};

export type Lead = {
  id: string;
  public_reference: string;
  user_id: string | null;
  name: string;
  phone: string;
  contact_channel: string;
  comment: string | null;
  request_type: LeadRequestType;
  source: string | null;
  apartment_id: string | null;
  layout_id: string | null;
  status: LeadStatus;
  assigned_to: string | null;
  consent_version: string;
  consented_at: string;
  dedupe_key: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type LeadEvent = {
  id: string;
  lead_id: string;
  event_type: string;
  actor: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export type LeadTask = {
  id: string;
  lead_id: string;
  assignee: string | null;
  due_at: string | null;
  sla_status: string;
  completed_at: string | null;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  created_at: string;
};

// RequiredKeys contains exactly the NOT NULL columns without a SQL DEFAULT,
// including primary-key columns without a default. All other columns may be
// omitted on insert, but only SQL-nullable columns accept an explicit null.
type Insert<Row, RequiredKeys extends keyof Row> = Pick<Row, RequiredKeys> &
  Partial<Omit<Row, RequiredKeys>>;

type Table<
  Row extends Record<string, unknown>,
  RequiredKeys extends keyof Row,
  Relationships extends {
    foreignKeyName: string;
    columns: string[];
    isOneToOne: boolean;
    referencedRelation: string;
    referencedColumns: string[];
  }[] = [],
> = {
  Row: Row;
  Insert: Insert<Row, RequiredKeys>;
  Update: Partial<Row>;
  Relationships: Relationships;
};

export interface Database {
  public: {
    Tables: {
      buildings: Table<Building, 'slug' | 'title'>;
      layouts: Table<Layout, 'slug' | 'title' | 'rooms'>;
      apartments: Table<
        Apartment,
        'building_id' | 'layout_id' | 'number' | 'floor' | 'rooms' | 'area',
        [
          {
            foreignKeyName: 'apartments_building_id_fkey';
            columns: ['building_id'];
            isOneToOne: false;
            referencedRelation: 'buildings';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'apartments_layout_id_fkey';
            columns: ['layout_id'];
            isOneToOne: false;
            referencedRelation: 'layouts';
            referencedColumns: ['id'];
          },
        ]
      >;
      // 'users' relationships below refer to auth.users, not public.profiles.
      // No auth tables are invented in this public-only schema.
      profiles: Table<
        Profile,
        'id',
        [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      user_roles: Table<
        UserRole,
        'user_id' | 'role',
        [
          {
            foreignKeyName: 'user_roles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      price_history: Table<
        PriceHistory,
        'apartment_id' | 'price' | 'effective_from',
        [
          {
            foreignKeyName: 'price_history_apartment_id_fkey';
            columns: ['apartment_id'];
            isOneToOne: false;
            referencedRelation: 'apartments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'price_history_changed_by_fkey';
            columns: ['changed_by'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      favorites: Table<
        Favorite,
        'apartment_id',
        [
          {
            foreignKeyName: 'favorites_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'favorites_apartment_id_fkey';
            columns: ['apartment_id'];
            isOneToOne: false;
            referencedRelation: 'apartments';
            referencedColumns: ['id'];
          },
        ]
      >;
      promos: Table<Promo, 'slug' | 'title'>;
      blog_posts: Table<
        BlogPost,
        'slug' | 'title',
        [
          {
            foreignKeyName: 'blog_posts_author_id_fkey';
            columns: ['author_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      social_links: Table<SocialLink, 'platform' | 'url' | 'label'>;
      construction_updates: Table<
        ConstructionUpdate,
        'slug' | 'title' | 'report_month',
        [
          {
            foreignKeyName: 'construction_updates_building_id_fkey';
            columns: ['building_id'];
            isOneToOne: false;
            referencedRelation: 'buildings';
            referencedColumns: ['id'];
          },
        ]
      >;
      consent_versions: Table<ConsentVersion, 'version' | 'body' | 'legal_basis'>;
      leads: Table<
        Lead,
        | 'public_reference'
        | 'name'
        | 'phone'
        | 'contact_channel'
        | 'request_type'
        | 'consent_version'
        | 'consented_at'
        | 'dedupe_key',
        [
          {
            foreignKeyName: 'leads_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_apartment_id_fkey';
            columns: ['apartment_id'];
            isOneToOne: false;
            referencedRelation: 'apartments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_layout_id_fkey';
            columns: ['layout_id'];
            isOneToOne: false;
            referencedRelation: 'layouts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'leads_assigned_to_fkey';
            columns: ['assigned_to'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      lead_events: Table<
        LeadEvent,
        'lead_id' | 'event_type',
        [
          {
            foreignKeyName: 'lead_events_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_events_actor_fkey';
            columns: ['actor'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      lead_tasks: Table<
        LeadTask,
        'lead_id',
        [
          {
            foreignKeyName: 'lead_tasks_lead_id_fkey';
            columns: ['lead_id'];
            isOneToOne: false;
            referencedRelation: 'leads';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lead_tasks_assignee_fkey';
            columns: ['assignee'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
      audit_log: Table<
        AuditLog,
        'action' | 'entity_type',
        [
          {
            foreignKeyName: 'audit_log_actor_fkey';
            columns: ['actor'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ]
      >;
    };
    Views: { [key in never]: never };
    Functions: {
      submit_lead: {
        Args: {
          p_name: string;
          p_phone: string;
          p_contact_channel: string;
          p_comment: string | null;
          p_request_type: LeadRequestType;
          p_source: string | null;
          p_apartment_id: string | null;
          p_layout_id: string | null;
          p_consent_version: string;
          p_consented_at: string;
          p_payload?: Record<string, unknown>;
        };
        Returns: { public_reference: string }[];
      };
      has_role: {
        Args: { _user_id: string; _role: AppRole };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: AppRole;
      content_status: ContentStatus;
      availability_status: AvailabilityStatus;
      lead_status: LeadStatus;
      lead_request_type: LeadRequestType;
      promo_status: PromoStatus;
      social_platform: SocialPlatform;
    };
    CompositeTypes: { [key in never]: never };
  };
}
