-- Stok Yönetim Sistemi - İlk Kurulum SQL

-- Veritabanı oluştur
CREATE DATABASE IF NOT EXISTS stok_yonetim 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Kullanıcı ayarları (Portable için root şifresiz)
-- Production'da şifre eklenebilir
FLUSH PRIVILEGES;

USE stok_yonetim;

-- Başarı mesajı
SELECT 'Veritabanı başarıyla oluşturuldu!' AS message;

