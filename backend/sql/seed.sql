INSERT INTO departments (name, area_code)
VALUES
  ('Roads and Transport', 'RD-001'),
  ('Sanitation', 'SN-001'),
  ('Water Supply', 'WS-001')
ON CONFLICT (name) DO NOTHING;

INSERT INTO users (full_name, email, password_hash, role, department_id)
VALUES
  ('System Admin', 'admin@civic.local', crypt('Admin@123', gen_salt('bf')), 'Admin', NULL),
  (
    'Road Authority',
    'authority@civic.local',
    crypt('Authority@123', gen_salt('bf')),
    'Authority',
    (SELECT id FROM departments WHERE area_code = 'RD-001' LIMIT 1)
  ),
  ('Sample Citizen', 'citizen@civic.local', crypt('Citizen@123', gen_salt('bf')), 'Citizen', NULL)
ON CONFLICT (email) DO NOTHING;
