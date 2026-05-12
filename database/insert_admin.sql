USE itech_store;

INSERT INTO admins (
  id,
  name,
  email,
  cpf,
  password_hash,
  status,
  created_at,
  approved_at
) VALUES (
  'admin-master',
  'Administrador iTech',
  'admin@itech.com',
  '11144477735',
  SHA2('1234', 256),
  'approved',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  password_hash = VALUES(password_hash),
  status = 'approved',
  approved_at = NOW();
