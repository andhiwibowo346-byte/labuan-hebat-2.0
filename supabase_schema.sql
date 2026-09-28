-- =====================================================================
-- IT ASSET MANAGEMENT (ITAM) - SUPABASE POSTGRESQL PRODUCTION SCHEMA
-- Dynamic Custom Fields, Hierarchical Locations, RBAC, RLS & Audit Trail
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES & PERMISSIONS
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) UNIQUE NOT NULL, -- 'super_admin', 'it_admin', 'technician', 'viewer'
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 2. USERS PROFILE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nip VARCHAR(50),
    department VARCHAR(100),
    avatar_url TEXT,
    role_id UUID REFERENCES public.roles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HIERARCHICAL LOCATIONS (Region -> Area -> Cabang -> Ruangan)
CREATE TABLE IF NOT EXISTS public.locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('region', 'area', 'branch', 'room')),
    parent_id UUID REFERENCES public.locations(id) ON DELETE CASCADE,
    address TEXT,
    coordinates VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. EMPLOYEES
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    nip VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    department VARCHAR(100) NOT NULL,
    job_title VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ASSET TYPES (Dynamic Category Management)
CREATE TABLE IF NOT EXISTS public.asset_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE, -- e.g. ATM, PC, LAP, SRV
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Box',
    color VARCHAR(30) DEFAULT '#4f46e5',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ASSET FIELDS (Dynamic Custom Field Definitions)
CREATE TABLE IF NOT EXISTS public.asset_fields (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE CASCADE,
    field_name VARCHAR(100) NOT NULL,
    field_code VARCHAR(100) NOT NULL,
    field_type VARCHAR(30) NOT NULL CHECK (field_type IN (
        'text', 'number', 'email', 'phone', 'textarea',
        'date', 'datetime', 'select', 'radio', 'checkbox',
        'image', 'file', 'url', 'ip_address'
    )),
    is_required BOOLEAN DEFAULT false,
    is_unique BOOLEAN DEFAULT false,
    options JSONB DEFAULT '[]'::jsonb, -- Array of strings for select/radio/checkbox
    sort_order INT DEFAULT 0,
    placeholder TEXT,
    help_text TEXT,
    default_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_type_id, field_code)
);

-- 7. ASSETS
CREATE TABLE IF NOT EXISTS public.assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_tag VARCHAR(100) UNIQUE NOT NULL, -- e.g. "ATM-001"
    asset_type_id UUID REFERENCES public.asset_types(id) ON DELETE RESTRICT,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(100),
    status VARCHAR(30) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'damaged', 'maintenance', 'lost', 'disposed')),
    location_id UUID REFERENCES public.locations(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    purchase_date DATE,
    purchase_cost NUMERIC(15,2),
    warranty_expiry DATE,
    notes TEXT,
    primary_photo TEXT,
    custom_data JSONB DEFAULT '{}'::jsonb, -- Fast query cache for dynamic values
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ASSET FIELD VALUES (Normalized EAV store for strict integrity & uniqueness checks)
CREATE TABLE IF NOT EXISTS public.asset_field_values (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    field_id UUID REFERENCES public.asset_fields(id) ON DELETE CASCADE,
    field_code VARCHAR(100) NOT NULL,
    value_text TEXT,
    value_json JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(asset_id, field_id)
);

-- 9. ASSET PHOTOS (Multiple photos: Front, Back, Serial Number, Condition, Installation)
CREATE TABLE IF NOT EXISTS public.asset_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    photo_type VARCHAR(50) DEFAULT 'general',
    url TEXT NOT NULL,
    caption TEXT,
    file_size BIGINT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ASSET DOCUMENTS (PDF, Excel, Word, BAST, Invoice, Manual)
CREATE TABLE IF NOT EXISTS public.asset_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    url TEXT NOT NULL,
    file_size VARCHAR(50),
    expiry_date DATE,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. MAINTENANCE
CREATE TABLE IF NOT EXISTS public.maintenance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    maintenance_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    maintenance_type VARCHAR(30) NOT NULL CHECK (maintenance_type IN ('preventive', 'corrective')),
    technician_name VARCHAR(255) NOT NULL,
    issue_description TEXT NOT NULL,
    action_taken TEXT,
    spareparts_used TEXT,
    cost NUMERIC(15,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_date DATE NOT NULL,
    completion_date DATE,
    notes TEXT,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. MAINTENANCE PHOTOS (Before & After evidence)
CREATE TABLE IF NOT EXISTS public.maintenance_photos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    maintenance_id UUID REFERENCES public.maintenance(id) ON DELETE CASCADE,
    stage VARCHAR(20) NOT NULL CHECK (stage IN ('before', 'after')),
    url TEXT NOT NULL,
    caption TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ASSET HISTORY / AUDIT TRAIL
CREATE TABLE IF NOT EXISTS public.asset_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    asset_id UUID REFERENCES public.assets(id) ON DELETE CASCADE,
    user_name VARCHAR(255) NOT NULL,
    action VARCHAR(50) NOT NULL,
    field_changed VARCHAR(100),
    old_value TEXT,
    new_value TEXT,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE & SEARCH
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_assets_asset_tag ON public.assets(asset_tag);
CREATE INDEX IF NOT EXISTS idx_assets_serial_number ON public.assets(serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_status ON public.assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_type ON public.assets(asset_type_id);
CREATE INDEX IF NOT EXISTS idx_assets_location ON public.assets(location_id);
CREATE INDEX IF NOT EXISTS idx_assets_employee ON public.assets(employee_id);
CREATE INDEX IF NOT EXISTS idx_assets_custom_data ON public.assets USING gin(custom_data);
CREATE INDEX IF NOT EXISTS idx_asset_field_values_unique ON public.asset_field_values(field_id, value_text);
CREATE INDEX IF NOT EXISTS idx_asset_history_asset_id ON public.asset_history(asset_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_asset_id ON public.maintenance(asset_id);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================================
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_field_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.asset_history ENABLE ROW LEVEL SECURITY;

-- Read policies: Authenticated users can view records
CREATE POLICY "Allow authenticated read on all itam tables" ON public.assets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on asset_types" ON public.asset_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on asset_fields" ON public.asset_fields FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on locations" ON public.locations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on employees" ON public.employees FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on maintenance" ON public.maintenance FOR SELECT TO authenticated USING (true);
CREATE POLICY "Allow authenticated read on asset_history" ON public.asset_history FOR SELECT TO authenticated USING (true);

-- Write policies based on role
CREATE POLICY "Allow SuperAdmin and IT Admin full access" ON public.assets 
    FOR ALL TO authenticated 
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() AND r.name IN ('super_admin', 'it_admin')
        )
    );

CREATE POLICY "Allow Technician maintenance and asset updates" ON public.maintenance
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.users u
            JOIN public.roles r ON u.role_id = r.id
            WHERE u.id = auth.uid() AND r.name IN ('super_admin', 'it_admin', 'technician')
        )
    );

-- Trigger for auto-updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON public.assets FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON public.locations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_maintenance_updated_at BEFORE UPDATE ON public.maintenance FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
