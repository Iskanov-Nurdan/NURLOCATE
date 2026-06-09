export type UserRole = "user" | "admin" | "super_admin";

export type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_staff: boolean;
  is_superuser: boolean;
  is_active?: boolean;
};

export type Vaccination = {
  id: string;
  animal: string;
  name: string;
  vaccinated_at: string;
  expires_at: string | null;
  notes: string;
};

export type Animal = {
  id: string;
  owner: number;
  name: string;
  photo_url: string;
  species: string;
  breed: string;
  birth_date: string | null;
  sex: string;
  weight: number | null;
  medical_notes: string;
  created_at: string;
  vaccinations?: Vaccination[];
};

export type Device = {
  id: string;
  serial_number: string;
  imei: string;
  sim_iccid: string;
  firmware_version: string;
  status: "active" | "offline" | "blocked" | "unclaimed";
  mode: "standby" | "normal" | "walk" | "sos";
  battery_level: number;
  signal: number | null;
  last_seen_at: string | null;
  created_at: string;
  animal_id: string | null;
  animal_name: string | null;
};

export type Location = {
  id: string;
  device: string;
  lat: string;
  lng: string;
  accuracy: number | null;
  speed: number | null;
  altitude: number | null;
  battery_level: number;
  signal: number | null;
  mode: string;
  recorded_at: string;
  received_at: string;
  animal_id: string | null;
  animal_name: string | null;
  device_serial: string;
  online: boolean;
};

export type Geofence = {
  id: string;
  owner: number;
  name: string;
  center_lat: string;
  center_lng: string;
  radius_meters: number;
  is_danger_zone: boolean;
  is_active: boolean;
  created_at: string;
};

export type GeofenceEvent = {
  id: string;
  geofence: string;
  device: string;
  event_type: "enter" | "exit";
  created_at: string;
  geofence_name: string;
  device_serial: string;
};

export type SubscriptionPlan = {
  id: string;
  code: string;
  name: string;
  price_cents: number;
  billing_interval: string;
  features: Record<string, unknown>;
  is_active: boolean;
};

export type Subscription = {
  id: string;
  user: number;
  plan: SubscriptionPlan;
  status: string;
  starts_at: string;
  ends_at: string | null;
  auto_renew: boolean;
  username?: string;
};

export type Notification = {
  id: string;
  user: number;
  title: string;
  body: string;
  level: string;
  is_read: boolean;
  created_at: string;
};

export type NotificationSettings = {
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
};

export type AnalyticsOverview = {
  users: number;
  active_devices: number;
  offline_devices: number;
  active_subscriptions: number;
  mrr_cents: number;
  locations_today: number;
  devices_by_status: { status: string; count: number }[];
};

export type AuditLog = {
  id: string;
  actor: number | null;
  actor_username: string | null;
  action: string;
  target_type: string;
  target_id: string;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type SystemStatus = {
  api: string;
  websocket_gateway: string;
  celery: string;
  redis: string;
  iot_ingestion: string;
  active_devices: number;
  locations_total: number;
};

export type ActivityReport = {
  dailyScore: number;
  distanceKm: number;
  movingMinutes: number;
  avgSpeed: number;
  walkCount: number;
  summary: string;
};
