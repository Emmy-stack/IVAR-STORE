import { DEFAULT_CONTACT } from './constants';

/**
 * Normalizes phone numbers (especially Nigerian numbers starting with 0)
 * e.g., '07041545267' -> '2347041545267'
 */
export function normalizeWhatsAppNumber(rawNumber?: string): string {
  if (!rawNumber) return DEFAULT_CONTACT.whatsappInternational;
  
  // Strip all non-numeric characters
  const digits = rawNumber.replace(/\D/g, '');
  
  // If Nigerian format starting with 0 and 11 digits (e.g. 07041545267)
  if (digits.startsWith('0') && digits.length === 11) {
    return '234' + digits.substring(1);
  }
  
  // If already starting with 234
  if (digits.startsWith('234')) {
    return digits;
  }
  
  return digits || DEFAULT_CONTACT.whatsappInternational;
}

/**
 * Generates the WhatsApp Buy Now click-to-chat URL with dynamic account details
 */
export function getBuyAccountWhatsAppUrl({
  productId,
  title,
  price,
  phoneNumber,
}: {
  productId: string;
  title: string;
  price: number;
  phoneNumber?: string;
}): string {
  const normalizedPhone = normalizeWhatsAppNumber(phoneNumber);
  const formattedPrice = new Intl.NumberFormat('en-NG').format(price);
  
  const message = `Hello IVAR STORE, I want to buy this Free Fire account.

Product ID: ${productId}
Account Title: ${title}
Price: ₦${formattedPrice}

Is this account still available?`;

  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Generates the "Want to Sell Your Account?" WhatsApp URL
 */
export function getSellAccountWhatsAppUrl(
  phoneNumber?: string,
  customMessage?: string
): string {
  const normalizedPhone = normalizeWhatsAppNumber(phoneNumber);
  const message = customMessage || DEFAULT_CONTACT.sellAccountMessage;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Formats a currency value into Nigerian Naira (₦)
 */
export function formatNaira(amount: number): string {
  return '₦' + new Intl.NumberFormat('en-NG').format(amount);
}
