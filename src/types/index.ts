export type ThemeMode = 'light' | 'dark' | 'system';

export type UserRole = 'super_admin' | 'it_admin' | 'technician' | 'viewer';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  nip?: string;
  department?: string;
}

export type CustomFieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'phone'
  | 'textarea'
  | 'date'
  | 'datetime'
  | 'select'
  | 'radio'
  | 'checkbox'
  | 'image'
  | 'file'
  | 'url'
  | 'ip_address';

export interface AssetFieldDefinition {
  id: string;
  asset_type_id: string;
  field_name: string;
  field_code: string;
  field_type: CustomFieldType;
  is_required: boolean;
  is_unique: boolean;
  options?: string[]; // For select, radio, checkbox
  sort_order: number;
  placeholder?: string;
  help_text?: string;
  default_value?: any;
}

export interface AssetType {
  id: string;
  name: string;
  code: string; // e.g. "ATM", "PC", "LAP", "SRV"
  description?: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color or hex
  is_active: boolean;
  fields: AssetFieldDefinition[];
  created_at: string;
  updated_at: string;
}

export type AssetStatus = 'active' | 'inactive' | 'damaged' | 'maintenance' | 'lost' | 'disposed';

export interface AssetPhoto {
  id: string;
  asset_id: string;
  url: string;
  caption: string; // e.g. 'Foto Depan', 'Serial Number', 'Kondisi Fisik'
  uploaded_at: string;
  size?: number;
}

export interface AssetDocument {
  id: string;
  asset_id: string;
  title: string;
  file_name: string;
  file_type: 'pdf' | 'excel' | 'word' | 'txt' | 'other';
  url: string;
  file_size?: string;
  expiry_date?: string;
  uploaded_at: string;
}

export interface Asset {
  id: string;
  asset_tag: string; // e.g. "ATM-001", "LAP-042"
  asset_type_id: string;
  name: string;
  serial_number: string;
  status: AssetStatus;
  location_id?: string;
  employee_id?: string;
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  notes?: string;
  primary_photo?: string;
  photos: AssetPhoto[];
  documents: AssetDocument[];
  custom_values: Record<string, any>; // Dynamic custom field values indexed by field_code or field_id
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export type LocationType = 'region' | 'area' | 'branch' | 'room';

export interface LocationNode {
  id: string;
  name: string;
  code: string;
  type: LocationType;
  parent_id?: string | null;
  address?: string;
  coordinates?: string;
  created_at?: string;
}

export interface Employee {
  id: string;
  employee_id: string; // e.g. NIP "00385617"
  full_name: string;
  nip: string;
  email: string;
  department: string;
  job_title: string;
  phone: string;
  location_id?: string;
  status: 'active' | 'inactive' | 'on_leave';
  created_at?: string;
}

export type MaintenanceType = 'preventive' | 'corrective';
export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface MaintenancePhoto {
  id: string;
  stage: 'before' | 'after';
  url: string;
  caption?: string;
  uploaded_at: string;
}

export interface MaintenanceRecord {
  id: string;
  asset_id: string;
  maintenance_number: string; // e.g. "MNT-2026-001"
  title: string;
  maintenance_type: MaintenanceType;
  technician_name: string;
  issue_description: string;
  action_taken?: string;
  spareparts_used?: string;
  cost: number;
  status: MaintenanceStatus;
  scheduled_date: string;
  completion_date?: string;
  notes?: string;
  photos: MaintenancePhoto[];
  created_at: string;
}

export interface AssetHistory {
  id: string;
  asset_id: string;
  user_name: string;
  action: 'create' | 'update' | 'status_change' | 'assign' | 'maintenance' | 'upload_photo' | 'upload_document';
  field_changed?: string;
  old_value?: string;
  new_value?: string;
  remarks?: string;
  created_at: string;
}

export type NotificationType =
  | 'maintenance_due'
  | 'damaged_asset'
  | 'warranty_expiring'
  | 'doc_expiring'
  | 'missing_photo'
  | 'missing_location'
  | 'new_asset';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  asset_id?: string;
  created_at: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export interface DashboardFilters {
  period: 'all' | 'today' | 'this_month' | 'this_year';
  assetTypeId: string;
  locationId: string;
  status: string;
}

export interface TutorialStep {
  step: number;
  title: string;
  description: string;
  command?: string;
  tip?: string;
}

export interface TutorialItem {
  id: string;
  title: string;
  category: 'atm' | 'pc_laptop' | 'network' | 'server' | 'sop' | 'other';
  difficulty: 'Mudah' | 'Menengah' | 'Lanjutan';
  estimatedTime: string;
  symptoms: string[];
  summary: string;
  steps: TutorialStep[];
  applicableTypes: string[];
  created_by?: string;
  created_at?: string;
}
