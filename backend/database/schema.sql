-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create HR schema
CREATE SCHEMA IF NOT EXISTS hr;

-- Employee Table
CREATE TABLE IF NOT EXISTS hr.employees (
    employee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    supervisor_id UUID REFERENCES hr.employees(employee_id),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS hr.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID REFERENCES hr.employees(employee_id),
    username VARCHAR(50) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role VARCHAR(50) NOT NULL,
    role_id INT REFERENCES hr.roles(role_id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update timestamp on employee update
CREATE OR REPLACE FUNCTION hr.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON hr.employees
FOR EACH ROW
EXECUTE PROCEDURE hr.update_updated_at_column();

-- Indexes
CREATE INDEX IF NOT EXISTS idx_employees_email ON hr.employees(email);
CREATE INDEX IF NOT EXISTS idx_employees_department ON hr.employees(department);

-- ================================
-- Role-Based Access Control (RBAC)
-- ================================

-- Roles table
CREATE TABLE IF NOT EXISTS hr.roles (
    role_id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Permissions table
CREATE TABLE IF NOT EXISTS hr.permissions (
    permission_id SERIAL PRIMARY KEY,
    permission_name VARCHAR(100) NOT NULL UNIQUE
);

-- Role-Permission mapping
CREATE TABLE IF NOT EXISTS hr.role_permissions (
    role_id INT REFERENCES hr.roles(role_id) ON DELETE CASCADE,
    permission_id INT REFERENCES hr.permissions(permission_id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Insert default roles
INSERT INTO hr.roles (role_name) VALUES
('admin'),
('manager'),
('user')
ON CONFLICT DO NOTHING;

-- Insert default permissions
INSERT INTO hr.permissions (permission_name) VALUES
('create_employee'),
('update_employee'),
('delete_employee'),
('view_employee')
ON CONFLICT DO NOTHING;
