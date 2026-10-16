export interface ServiceItem {
  id: string;
  name: string;
  category: 'health' | 'wellness' | 'consulting';
  price: number;
  currency: string;
  durationMinutes: number;
  description: string;
}

export interface AvailabilitySlot {
  id: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
  timeSlot: string; // e.g., "10:00 AM", "02:30 PM"
  isBooked: boolean;
}

export interface BookingRecord {
  bookingId: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'confirmed' | 'cancelled';
  createdAt: number;
}

export interface KnowledgeArticle {
  id: string;
  title: string;
  category: string;
  keywords: string[];
  content: string;
}

// Pre-seeded Realistic In-Memory Store
export const SERVICES_STORE: ServiceItem[] = [
  {
    id: 'srv_1',
    name: 'General Health Checkup & Consultation',
    category: 'health',
    price: 500,
    currency: 'INR',
    durationMinutes: 30,
    description: 'Comprehensive physical examination, vital signs check, and preventive healthcare advice.',
  },
  {
    id: 'srv_2',
    name: 'Dental Cleaning & Oral Screening',
    category: 'health',
    price: 800,
    currency: 'INR',
    durationMinutes: 45,
    description: 'Ultrasonic scaling, plaque removal, and preventive oral hygiene assessment.',
  },
  {
    id: 'srv_3',
    name: 'Physiotherapy & Spine Rehabilitation',
    category: 'health',
    price: 1200,
    currency: 'INR',
    durationMinutes: 60,
    description: 'Targeted physical therapy for back pain, posture correction, and mobility restoration.',
  },
  {
    id: 'srv_4',
    name: 'Stress Relief & Ayurvedic Head Massage',
    category: 'wellness',
    price: 950,
    currency: 'INR',
    durationMinutes: 45,
    description: 'Herbal oil relaxation therapy for anxiety, headaches, and tension relief.',
  },
  {
    id: 'srv_5',
    name: 'AI & Cloud Architecture Consultation',
    category: 'consulting',
    price: 3500,
    currency: 'INR',
    durationMinutes: 60,
    description: 'Technical advisory session on deploying LLMs, voice agents, and cloud architectures.',
  },
];

// Helper to generate dynamic dates (e.g. today, tomorrow, day after)
function getFormattedDate(offsetDays: number = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

export const AVAILABILITY_STORE: AvailabilitySlot[] = [
  // Today
  { id: 'slot_1', serviceId: 'srv_1', date: getFormattedDate(0), timeSlot: '10:00 AM', isBooked: false },
  { id: 'slot_2', serviceId: 'srv_1', date: getFormattedDate(0), timeSlot: '02:00 PM', isBooked: true },
  { id: 'slot_3', serviceId: 'srv_1', date: getFormattedDate(0), timeSlot: '04:30 PM', isBooked: false },
  // Tomorrow
  { id: 'slot_4', serviceId: 'srv_1', date: getFormattedDate(1), timeSlot: '09:30 AM', isBooked: false },
  { id: 'slot_5', serviceId: 'srv_1', date: getFormattedDate(1), timeSlot: '11:00 AM', isBooked: false },
  { id: 'slot_6', serviceId: 'srv_1', date: getFormattedDate(1), timeSlot: '03:00 PM', isBooked: false },
  // Day after tomorrow
  { id: 'slot_7', serviceId: 'srv_1', date: getFormattedDate(2), timeSlot: '10:00 AM', isBooked: false },
  { id: 'slot_8', serviceId: 'srv_1', date: getFormattedDate(2), timeSlot: '04:00 PM', isBooked: false },

  // Dental
  { id: 'slot_9', serviceId: 'srv_2', date: getFormattedDate(1), timeSlot: '10:30 AM', isBooked: false },
  { id: 'slot_10', serviceId: 'srv_2', date: getFormattedDate(1), timeSlot: '02:00 PM', isBooked: false },
  { id: 'slot_11', serviceId: 'srv_2', date: getFormattedDate(2), timeSlot: '11:30 AM', isBooked: false },

  // Physiotherapy
  { id: 'slot_12', serviceId: 'srv_3', date: getFormattedDate(1), timeSlot: '01:00 PM', isBooked: false },
  { id: 'slot_13', serviceId: 'srv_3', date: getFormattedDate(2), timeSlot: '05:00 PM', isBooked: false },

  // Wellness
  { id: 'slot_14', serviceId: 'srv_4', date: getFormattedDate(0), timeSlot: '05:30 PM', isBooked: false },
  { id: 'slot_15', serviceId: 'srv_4', date: getFormattedDate(1), timeSlot: '04:00 PM', isBooked: false },

  // Consulting
  { id: 'slot_16', serviceId: 'srv_5', date: getFormattedDate(1), timeSlot: '06:00 PM', isBooked: false },
];

export const KNOWLEDGE_STORE: KnowledgeArticle[] = [
  {
    id: 'kb_1',
    title: 'Clinic Operating Hours & Location',
    category: 'operations',
    keywords: ['hours', 'timing', 'open', 'close', 'location', 'address', 'where', 'weekend'],
    content: 'We are open Monday to Saturday from 8:30 AM to 8:00 PM, and on Sundays from 9:00 AM to 1:00 PM. Our center is located at Tech Park Hub, 4th Floor, MG Road, Bengaluru / Kochi Center.',
  },
  {
    id: 'kb_2',
    title: 'Appointment Cancellation & Rescheduling Policy',
    category: 'policies',
    keywords: ['cancel', 'cancellation', 'reschedule', 'refund', 'change date', 'policy'],
    content: 'Appointments can be rescheduled or cancelled without fee up to 2 hours prior to the scheduled time. Cancellations made less than 2 hours in advance are subject to a 20% convenience charge.',
  },
  {
    id: 'kb_3',
    title: 'Accepted Payment Methods & Insurance',
    category: 'billing',
    keywords: ['payment', 'upi', 'credit card', 'insurance', 'cash', 'gpay', 'paytm'],
    content: 'We accept UPI (GPay, PhonePe, Paytm), Visa/Mastercard credit and debit cards, Net Banking, and Cash. We also support cashless claims for major health insurance providers.',
  },
  {
    id: 'kb_4',
    title: 'Languages Supported by Our Team',
    category: 'support',
    keywords: ['language', 'malayalam', 'hindi', 'tamil', 'english', 'doctor speaks'],
    content: 'Our doctors and staff fluently speak English, Malayalam, Hindi, and Tamil to ensure clear communication and compassionate care.',
  },
];

export const BOOKINGS_STORE: BookingRecord[] = [];
