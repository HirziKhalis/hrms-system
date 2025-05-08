
-- Create HR schema
CREATE SCHEMA hr;

-- Create custom types
CREATE TYPE employee_status AS ENUM ('active', 'inactive', 'on_leave', 'terminated');
CREATE TYPE leave_status AS ENUM ('pending', 'approved', 'rejected', 'cancelled');
CREATE TYPE attendance_status AS ENUM ('present', 'late', 'absent');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Departments Table
CREATE TABLE hr.departments (
    department_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Positions Table
CREATE TABLE hr.positions (
    position_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(100) NOT NULL,
    department_id UUID,
    FOREIGN KEY (department_id) REFERENCES hr.departments(department_id)
);

-- Employees Table
CREATE TABLE hr.employees (
    employee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    phone VARCHAR(15),
    department_id UUID,
    position_id UUID,
    supervisor_id UUID,
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status employee_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (supervisor_id) REFERENCES hr.employees(employee_id),
    FOREIGN KEY (department_id) REFERENCES hr.departments(department_id),
    FOREIGN KEY (position_id) REFERENCES hr.positions(position_id)
);

-- Roles Table
CREATE TABLE hr.roles (
    role_id SERIAL PRIMARY KEY,
    name VARCHAR(20) UNIQUE NOT NULL
);

-- Users Table (for authentication)
CREATE TABLE hr.users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT,
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hr.employees(employee_id),
    FOREIGN KEY (role_id) REFERENCES hr.roles(role_id)
);

-- Attendance Table
CREATE TABLE hr.attendance (
    attendance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status attendance_status NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES hr.employees(employee_id),
    CONSTRAINT check_time_order CHECK (check_out IS NULL OR check_in < check_out)
);

-- Leave Types Table
CREATE TABLE hr.leave_types (
    leave_type_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type_name VARCHAR(50) NOT NULL,
    default_days INT NOT NULL,
    description TEXT
);

-- Leave Requests Table
CREATE TABLE hr.leave_requests (
    request_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL,
    leave_type_id UUID NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status leave_status DEFAULT 'pending',
    approved_by UUID,
    request_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    FOREIGN KEY (employee_id) REFERENCES hr.employees(employee_id),
    FOREIGN KEY (approved_by) REFERENCES hr.employees(employee_id),
    FOREIGN KEY (leave_type_id) REFERENCES hr.leave_types(leave_type_id),
    CONSTRAINT valid_date_range CHECK (start_date <= end_date)
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for employees table
CREATE TRIGGER update_employee_updated_at
    BEFORE UPDATE ON hr.employees
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_attendance_employee_id ON hr.attendance(employee_id);
CREATE INDEX idx_leave_requests_employee_id ON hr.leave_requests(employee_id);
