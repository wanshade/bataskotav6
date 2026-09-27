const rawAdminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP?.trim() ?? '';

export const adminWhatsAppNumber = rawAdminWhatsApp
  .replace(/\D/g, '')
  .replace(/^0/, '62');

export const adminWhatsAppDisplay = rawAdminWhatsApp || 'WhatsApp admin';

export const adminWhatsAppUrl = adminWhatsAppNumber
  ? `https://wa.me/${adminWhatsAppNumber}`
  : '#';
