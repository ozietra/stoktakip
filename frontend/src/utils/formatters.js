// Sayı formatlama
export const formatNumber = (number, decimals = 2) => {
  if (number === null || number === undefined) return '0';
  return parseFloat(number).toLocaleString('tr-TR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};

// Para birimi formatlama
export const formatCurrency = (amount, currency = 'TRY', decimals = 2) => {
  if (amount === null || amount === undefined) return '₺0,00';
  
  const symbols = {
    TRY: '₺',
    USD: '$',
    EUR: '€',
    GBP: '£'
  };

  const formatted = formatNumber(amount, decimals);
  return `${symbols[currency] || currency}${formatted}`;
};

// Tarih formatlama
export const formatDate = (date, format = 'short') => {
  if (!date) return '-';
  
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('tr-TR');
  }
  
  if (format === 'long') {
    return d.toLocaleString('tr-TR');
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('tr-TR');
  }
  
  return d.toLocaleDateString('tr-TR');
};

// Yüzde formatlama
export const formatPercentage = (value, decimals = 0) => {
  if (value === null || value === undefined) return '0%';
  return `%${formatNumber(value, decimals)}`;
};

// Telefon formatlama
export const formatPhone = (phone) => {
  if (!phone) return '-';
  // 0555 555 55 55 formatına çevir
  const cleaned = phone.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{4})(\d{3})(\d{2})(\d{2})$/);
  if (match) {
    return `${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
  }
  return phone;
};

// Dosya boyutu formatlama
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

// SKU/Kod formatlama (büyük harf)
export const formatCode = (code) => {
  if (!code) return '';
  return code.toUpperCase();
};

// İlk harfi büyük yapma
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Metin kısaltma
export const truncate = (str, length = 50) => {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

