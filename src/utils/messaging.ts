import { VisitRecord, InquiryRecord, SalonConfig } from '../types';

/**
 * Format Indian phone number for WhatsApp URL (removes non-digits, prepends 91 if 10 digits)
 */
export function formatPhoneForWhatsApp(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `91${cleaned}`;
  }
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned;
  }
  return cleaned;
}

/**
 * Format date for friendly English display (e.g., 27 Oct 2026)
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/**
 * Format date-time for friendly English display (e.g., 27 Oct 2026, 05:30 PM)
 */
export function formatFriendlyDateTime(dateTimeStr: string): string {
  if (!dateTimeStr) return '';
  try {
    const d = new Date(dateTimeStr);
    if (isNaN(d.getTime())) return dateTimeStr;
    return d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateTimeStr;
  }
}

/**
 * Generates formatted WhatsApp Bill / Invoice message in English
 */
export function createBillWhatsAppMessage(visit: VisitRecord, config: SalonConfig): string {
  const servicesList = visit.services
    .map((s) => `• ${s.name} - ₹${s.price}`)
    .join('\n');

  const customText = visit.customServiceDescription
    ? `\n• Additional: ${visit.customServiceDescription}`
    : '';

  const paymentText =
    visit.paymentMode === 'cash'
      ? 'Cash'
      : visit.paymentMode === 'upi'
      ? 'UPI / Online'
      : visit.paymentMode === 'card'
      ? 'Card'
      : 'Pending / Due';

  const dueDetails =
    visit.dueAmount > 0
      ? `\n⚠️ *Outstanding Due:* ₹${visit.dueAmount}`
      : `\n✅ *Payment Status:* Paid (₹${visit.paidAmount})`;

  const nextDueText = visit.nextDueDate
    ? `\n\n📅 *Recommended Next Visit Due:* ${formatFriendlyDate(visit.nextDueDate)}\n🔔 We will send you a timely grooming reminder!`
    : '';

  return `*✂️ ${config.name.toUpperCase()} ✂️*
_${config.tagline || 'Premium Hair Styling, Beard Grooming & Skin Care'}_
📍 ${config.address}
📞 Phone / WhatsApp: ${config.phone}
${config.upiId ? `💳 UPI ID: ${config.upiId}\n` : ''}────────────────────────
🧾 *CUSTOMER INVOICE / RECEIPT* (#${visit.invoiceNo})
👤 *Customer:* ${visit.customerName}
📱 *Mobile:* ${visit.phone}
${visit.address ? `🏠 *Address:* ${visit.address}\n` : ''}⏰ *Visit Time:* ${formatFriendlyDateTime(visit.visitDateTime)}
────────────────────────
💇‍♂️ *Services Availed:*
${servicesList || '• Salon Services'}${customText}

────────────────────────
💰 *Subtotal:* ₹${visit.totalAmount}
${visit.discount > 0 ? `🏷️ *Discount:* -₹${visit.discount}\n` : ''}💵 *Final Net Amount:* ₹${visit.finalAmount}
💳 *Payment Mode:* ${paymentText}${dueDetails}${nextDueText}

🙏 *Thank you for choosing ${config.name}!*
Have a great day and see you again soon! ✨`;
}

/**
 * Generates concise Mobile Text Message (SMS) for the Bill
 */
export function createBillSMSMessage(visit: VisitRecord, config: SalonConfig): string {
  const serviceNames = visit.services.map((s) => s.name).join(', ');
  const dueInfo = visit.dueAmount > 0 ? ` Due: Rs.${visit.dueAmount}` : ' Paid';
  const nextDueDateInfo = visit.nextDueDate ? ` Next Due: ${formatFriendlyDate(visit.nextDueDate)}` : '';

  return `${config.name.toUpperCase()}
Inv: #${visit.invoiceNo} | Date: ${formatFriendlyDate(visit.visitDateTime)}
Cust: ${visit.customerName} (${visit.phone})
Services: ${serviceNames || 'Salon Services'}
Total: Rs.${visit.finalAmount} (${visit.paymentMode.toUpperCase()}${dueInfo})${nextDueDateInfo}
Loc: ${config.address}
Ph: ${config.phone}
Thank you!`;
}

/**
 * Generates WhatsApp Reminder for 3-Day / Custom Inquiry Follow-up in English
 */
export function createInquiryWhatsAppMessage(inquiry: InquiryRecord, config: SalonConfig): string {
  const serviceMention = inquiry.serviceRequired
    ? `"${inquiry.serviceRequired}"`
    : 'salon grooming service';

  return `*✂️ ${config.name.toUpperCase()} ✂️*
📍 ${config.address}
📞 Call / WhatsApp: ${config.phone}
────────────────────────
Hello *${inquiry.customerName}*! 👋

Greetings from *${config.name}*!

You inquired about our ${serviceMention} and asked us to remind you today.

✨ Would you like us to reserve your appointment slot for today? 

💇‍♂️ *Service:* ${inquiry.serviceRequired || 'Hair Styling / Grooming'}
${inquiry.notes ? `📝 Note: ${inquiry.notes}\n` : ''}
Please reply with your preferred time so we can keep everything ready for you!
📞 For slot booking: *${config.phone}*

Thank you,
*${config.name}*`;
}

/**
 * Generates Mobile Text Message (SMS) for 3-Day Inquiry Reminder
 */
export function createInquirySMSMessage(inquiry: InquiryRecord, config: SalonConfig): string {
  return `${config.name.toUpperCase()}: Hello ${inquiry.customerName}, as requested, this is your reminder for ${inquiry.serviceRequired || 'salon grooming'}. Visit us today at ${config.address} or call ${config.phone} to book your slot. Thank you!`;
}

/**
 * Generates WhatsApp Next Due Date Reminder for Visits in English
 */
export function createVisitDueReminderMessage(visit: VisitRecord, config: SalonConfig): string {
  const lastServices = visit.services.map((s) => s.name).join(', ') || 'Hair Cut & Grooming';

  return `*✂️ ${config.name.toUpperCase()} ✂️*
📍 ${config.address}
📞 Contact: ${config.phone}
────────────────────────
Hello *${visit.customerName}*! 👋

Hope you are having a wonderful week! During your last visit on ${formatFriendlyDate(visit.visitDateTime)}, you enjoyed our ${lastServices}.

✂️ Your recommended routine maintenance due date has arrived (${formatFriendlyDate(visit.nextDueDate)})!

To keep your style sharp, fresh, and confident, book your slot today:
📞 Call / WhatsApp: *${config.phone}*

We look forward to welcoming you back to Hairport Salon! 💈✨`;
}

/**
 * Generates Mobile Text Message (SMS) for Service Due Reminder
 */
export function createVisitDueSMSMessage(visit: VisitRecord, config: SalonConfig): string {
  return `${config.name.toUpperCase()}: Dear ${visit.customerName}, your grooming routine due date is here (${formatFriendlyDate(visit.nextDueDate)}). Call ${config.phone} or visit us at ${config.address}. Look sharp!`;
}

/**
 * Open WhatsApp directly with prefilled message
 */
export function openWhatsApp(phone: string, message: string): void {
  const formattedPhone = formatPhoneForWhatsApp(phone);
  const encodedText = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedText}`;
  window.open(url, '_blank');
}

/**
 * Open Mobile Text Message (SMS) app with prefilled body
 */
export function openSMS(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, '');
  const encoded = encodeURIComponent(message);
  // Cross-platform check: iOS uses '&body=', Android uses '?body='
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';
  const url = `sms:${cleaned}${separator}body=${encoded}`;
  
  // Also try navigator.share if available on mobile devices
  if (navigator.share && /mobile/i.test(navigator.userAgent)) {
    navigator.share({
      title: 'Hairport Salon Bill',
      text: message,
    }).catch(() => {
      window.location.href = url;
    });
  } else {
    window.location.href = url;
  }
}
