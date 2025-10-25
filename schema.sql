CREATE DATABASE IF NOT EXISTS healthpal;
USE healthpal;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('patient', 'doctor', 'donor', 'ngo', 'admin') DEFAULT 'patient',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS patients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  gender ENUM('male', 'female'),
  date_of_birth DATE,
  medical_history TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS doctors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  specialty VARCHAR(255),
  license_number VARCHAR(255),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  patient_id INT NOT NULL,
  doctor_id INT NOT NULL,
  scheduled_at DATETIME NOT NULL,
  status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
  notes TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
  FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ngos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  organization_name VARCHAR(255) NOT NULL,
  description TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS donations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  donor_id INT NOT NULL,
  ngo_id INT,
  type ENUM('medicine', 'money', 'supplies') NOT NULL,
  amount DECIMAL(10,2) DEFAULT 0.00,
  status ENUM('pending', 'received', 'cancelled') DEFAULT 'pending',
  FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (ngo_id) REFERENCES ngos(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS medicines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  quantity INT DEFAULT 0,
  requester_name VARCHAR(100),
  requester_contact VARCHAR(100),
  status ENUM('requested','in_progress','fulfilled') DEFAULT 'requested',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS equipment (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50),
  available BOOLEAN DEFAULT TRUE,
  location VARCHAR(100),
  provider_name VARCHAR(100),
  contact_info VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_name VARCHAR(100) NOT NULL,
  category ENUM('medicine','equipment') DEFAULT 'medicine',
  quantity INT DEFAULT 1,
  donor_name VARCHAR(100),
  contact_info VARCHAR(100),
  status ENUM('available','reserved','delivered') DEFAULT 'available',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



