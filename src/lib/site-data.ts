/**
 * Central mock-data store for Guruvayur Dham.
 * Swap these arrays/objects with real CMS / API data later · every component
 * in src/components/site reads from here, so the rest of the UI stays intact.
 */

export const SITE = {
  name: "Guruvayur Dham",
  tagline: "Stay 2 Minutes from the Divine",
  phone: "+91-90908 20208",
  phoneRaw: "+919090820208",
  whatsapp: "919090820208",
  email: "stay@guruvayurdham.com",
  address: "Opposite. Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001",
  shortAddress: "Natwar Nagar, Dholi Pyau, Mathura, Uttar Pradesh 281001",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.5552!2d77.6900!3d27.4924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3973715d2a2a2a2a%3A0x0!2zTWF0aHVyYSwgVXR0YXIgUHJhZGVzaA!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Mata+Pathwari+Mandir+Natwar+Nagar+Dholi+Pyau+Mathura+281001",
  checkIn: "12:00 PM",
  checkOut: "11:00 AM",
  rating: 4.9,
  reviewCount: 847,
  totalRooms: 52,
  distanceToTemple: "2 min walk to temple",
  socials: {
    facebook: "https://facebook.com/guruvayurdham",
    instagram: "https://instagram.com/guruvayurdham",
    youtube: "https://youtube.com/@guruvayurdham",
    twitter: "https://twitter.com/guruvayurdham",
  },
};

export type NavItem = { label: string; href: string; route: string };

export const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "#/", route: "/" },
  { label: "Rooms", href: "#/rooms", route: "/rooms" },
  { label: "Pooja", href: "#/pooja", route: "/pooja" },
  { label: "About", href: "#/about", route: "/about" },
  { label: "Gallery", href: "#/gallery", route: "/gallery" },
  { label: "Events", href: "#/events", route: "/events" },
  { label: "Blog", href: "#/blog", route: "/blog" },
  { label: "FAQ", href: "#/faq", route: "/faq" },
  { label: "Contact", href: "#/contact", route: "/contact" },
];

/* ============ HERO TRUST BADGES ============ */
export const TRUST_BADGES = [
  { icon: "Star", text: `4.9 Google Rating` },
  { icon: "Footprints", text: "2 min to East Nada" },
  { icon: "Car", text: "Free Parking" },
  { icon: "BedDouble", text: "50+ Rooms" },
];

/* ============ WHY CHOOSE US ============ */
export const WHY_CHOOSE_US = [
  {
    icon: "MapPin",
    title: "Walk to the Temple",
    text: "Just 200 metres from Guruvayur Temple's East Nada gate. Skip the rush-hour traffic and reach the sanctum in two minutes flat · perfect for early-morning Nirmalya Darshan.",
  },
  {
    icon: "BedDouble",
    title: "Clean, Hygienic Rooms",
    text: "Daily-sanitised AC and non-AC rooms with fresh linen, 24×7 hot water, attached bathrooms, and family-friendly layouts. Housekeeping inspects every room before check-in.",
  },
  {
    icon: "HeartHandshake",
    title: "Pilgrim-First Service",
    text: "Pooja booking assistance, early check-in requests, packed breakfast for darshan, and on-call guidance for first-time visitors. We treat every guest like family.",
  },
  {
    icon: "Wallet",
    title: "Honest, Transparent Pricing",
    text: "No hidden charges. Rates start at ₹700/night with clear add-ons for extra person, AC, and early check-in. Pay by UPI, card, or cash · your choice.",
  },
  {
    icon: "ShieldCheck",
    title: "Safe & Secure Stay",
    text: "CCTV-monitored premises, 24-hour front desk, secure key access, and a dedicated women-and-children floor. Families travel worry-free at Guruvayur Dham.",
  },
  {
    icon: "Utensils",
    title: "Pure Veg Meals Nearby",
    text: "Tie-ups with three pure-veg Brahmin hotels within 200 m. Order to your room or walk over · South Indian thali, filter coffee, and prasadam-friendly menus.",
  },
];

/* ============ ROOMS ============ */
export type RoomType = "AC" | "Non-AC" | "Family" | "Deluxe";

export interface Room {
  slug: string;
  name: string;
  type: RoomType;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  capacity: number;
  size: string; // e.g. "240 sq.ft"
  bedType: string;
  image: string;
  gallery: string[];
  badge?: string;
  description: string;
  amenities: string[]; // string keys for amenity icons
  shortDesc: string;
}

const AMENITY_KEYS = [
  "Wifi", "AC", "TV", "Geyser", "Parking", "RoomService", "Laundry", "Lift",
  "PowerBackup", "CCTV", "HotWater", "AttachedBath",
] as const;
export type AmenityKey = (typeof AMENITY_KEYS)[number];

export const ROOMS: Room[] = [
  {
    slug: "deluxe-ac-room",
    name: "Deluxe AC Room",
    type: "Deluxe",
    price: 2200,
    originalPrice: 2800,
    rating: 4.9,
    reviews: 213,
    capacity: 2,
    size: "260 sq.ft",
    bedType: "1 King Bed",
    image:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=900&fit=crop",
    ],
    badge: "Most Popular",
    description:
      "Our flagship Deluxe AC Room is designed for couples and pilgrim duos who want a touch of comfort after a long temple day. The room features a plush king-size bed dressed in crisp white linen, a wooden headboard, warm saffron accent wall, and a study desk by the window. The en-suite bathroom has a glass shower cubicle, premium fixtures, 24×7 hot water, and complimentary herbal toiletries. A mini-fridge, LED TV with Tamil and Malayalam channels, high-speed WiFi, and an in-room safe round out the experience. Wake up to temple bells and the gentle aroma of incense · that's the Guruvayur Dham morning ritual.",
    shortDesc:
      "King bed, AC, premium linen, en-suite bath, mini-fridge, WiFi. Perfect for couples.",
    amenities: ["AC", "Wifi", "TV", "Geyser", "HotWater", "AttachedBath", "RoomService", "PowerBackup"],
  },
  {
    slug: "standard-ac-room",
    name: "Standard AC Room",
    type: "AC",
    price: 1500,
    originalPrice: 1900,
    rating: 4.8,
    reviews: 187,
    capacity: 2,
    size: "200 sq.ft",
    bedType: "1 Queen Bed",
    image:
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=900&fit=crop",
    ],
    badge: "Best Value",
    description:
      "A practical, well-appointed AC room for pilgrims who want cool comfort without breaking the bank. The room has a queen-size bed, bedside reading lamps, a wardrobe, and a writing desk. The attached bathroom has a hot-water geyser, fresh towels, and basic toiletries. The room faces the inner courtyard, so it stays quiet even during peak temple hours · ideal for a midday nap between darshan slots. AC, WiFi, and LED TV are standard, and housekeeping cleans every morning by 10 AM unless you place a Do-Not-Disturb tag.",
    shortDesc:
      "Queen bed, AC, courtyard-facing, quiet. Great value for couples and solo pilgrims.",
    amenities: ["AC", "Wifi", "TV", "Geyser", "HotWater", "AttachedBath", "PowerBackup"],
  },
  {
    slug: "non-ac-room",
    name: "Non-AC Budget Room",
    type: "Non-AC",
    price: 700,
    originalPrice: 950,
    rating: 4.6,
    reviews: 142,
    capacity: 2,
    size: "160 sq.ft",
    bedType: "1 Double Bed",
    image:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=1200&h=900&fit=crop",
    ],
    description:
      "Our most affordable room, built for budget-conscious pilgrims and backpackers. The Non-AC Budget Room has a double bed, ceiling fan with remote, large window with cross-ventilation, and a clean attached bathroom with hot water from 5 AM to 10 PM. Linen is changed daily, and the room is professionally cleaned before every check-in. Despite the price, you still get free WiFi, complimentary chai every morning at reception, and the same 2-minute walk to East Nada that every Guruvayur Dham guest enjoys.",
    shortDesc:
      "Double bed, ceiling fan, hot water, WiFi. The most affordable way to stay close.",
    amenities: ["Wifi", "TV", "Geyser", "HotWater", "AttachedBath", "Parking"],
  },
  {
    slug: "family-suite-ac",
    name: "Family Suite AC",
    type: "Family",
    price: 3500,
    originalPrice: 4200,
    rating: 4.9,
    reviews: 96,
    capacity: 4,
    size: "380 sq.ft",
    bedType: "1 King + 2 Single",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=900&fit=crop",
    ],
    badge: "Best for Families",
    description:
      "A spacious two-room suite perfect for families of 3-4 travelling with children or elderly parents. The master bedroom has a king bed; the connecting room has two single beds that can be joined. Both rooms share a large, freshly-renovated bathroom with both shower and bucket-and-mug setup for traditional comfort. The suite includes a small sitting area with a sofa and coffee table, a mini-kitchenette with an electric kettle and cups (filter coffee sachets on request), 55-inch LED TV, and a private balcony overlooking the temple-side garden. AC in both rooms, soundproofed connecting door, and a dedicated housekeeping attendant.",
    shortDesc:
      "Two rooms, king + 2 singles, balcony, mini-kitchenette. Spreads the family out comfortably.",
    amenities: ["AC", "Wifi", "TV", "Geyser", "HotWater", "AttachedBath", "RoomService", "Laundry", "PowerBackup", "Parking"],
  },
  {
    slug: "deluxe-non-ac",
    name: "Deluxe Non-AC Room",
    type: "Non-AC",
    price: 1100,
    originalPrice: 1400,
    rating: 4.7,
    reviews: 118,
    capacity: 3,
    size: "210 sq.ft",
    bedType: "1 Double + 1 Floor Mattress",
    image:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&h=900&fit=crop",
    ],
    description:
      "A larger non-AC room ideal for small families or three adults travelling together. Comes with a double bed plus a rolled-out floor mattress (Indian style · perfect for kids), ceiling fan, large louvered windows for cross-breeze, and a freshly tiled attached bathroom with 24×7 hot water. The room has a small puja niche with an idol shelf · many guests light a diya before leaving for darshan. Excellent value for pilgrims who don't need AC but want extra space and the comfort of an attached bathroom.",
    shortDesc:
      "Double bed + floor mattress, attached bath, puja niche. Suits families of three.",
    amenities: ["Wifi", "TV", "Geyser", "HotWater", "AttachedBath", "Parking", "PowerBackup"],
  },
  {
    slug: "ac-dormitory",
    name: "AC Dormitory Bed",
    type: "AC",
    price: 450,
    rating: 4.5,
    reviews: 64,
    capacity: 1,
    size: "Shared Hall",
    bedType: "Single Bunk",
    image:
      "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=800&h=600&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1551776235-dde6d482980b?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&h=900&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&h=900&fit=crop",
    ],
    description:
      "Air-conditioned 8-bed dormitory for solo travellers, students, and group pilgrims. Each bed has a personal reading light, charging socket, privacy curtain, and a metal locker for valuables. Separate dorms for men and women, with shared clean bathrooms (4 stalls each) and 24×7 hot water. The dorm has a common lounge with a TV, water dispenser, and a small library of Malayalam and English magazines. Perfect for budget travellers who want AC comfort and the company of fellow devotees without paying for a private room.",
    shortDesc:
      "Single bunk in AC hall, personal locker, separate men's & women's dorms.",
    amenities: ["AC", "Wifi", "HotWater", "CCTV", "PowerBackup", "Parking", "Lift"],
  },
];

/* ============ POOJA & OFFERINGS ============ */
export interface Pooja {
  id: string;
  name: string;
  price: number;
  duration: string;
  description: string;
  prasadam: string;
  image: string;
  significance: string;
}

export const POOJAS: Pooja[] = [
  {
    id: "palpayasam",
    name: "Palpayasam",
    price: 50,
    duration: "Same day",
    description:
      "The most beloved offering at Guruvayur · sweet, slow-cooked rice-and-milk porridge prepared in the temple kitchen. Offered to Lord Guruvayurappan and distributed as prasadam.",
    prasadam: "1 packet Palpayasam (≈250 g)",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Believed to fulfill vows (mannathu) related to childbirth, marriage, and recovery from illness.",
  },
  {
    id: "thulabharam",
    name: "Thulabharam",
    price: 1500,
    duration: "1 hour",
    description:
      "The devotee is weighed against offerings (jaggery, sugar, rice, coins, or bananas) on a giant temple scale. The offering is then donated to the temple.",
    prasadam: "Small packet of prasadam",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Traditional vow-fulfilment for newborns, recovery from illness, or major life milestones.",
  },
  {
    id: "choroonu",
    name: "Choroonu (Annaprasham)",
    price: 800,
    duration: "45 min",
    description:
      "The first rice-feeding ceremony for infants, conducted inside the temple precincts in the presence of Lord Guruvayurappan. Performed by the temple tantri.",
    prasadam: "Sweet payasam + blessed rice",
    image:
      "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop",
    significance:
      "The most sacred Annaprasham in Kerala · initiates a child into solid food with divine blessing.",
  },
  {
    id: "archana",
    name: "Archana",
    price: 100,
    duration: "15 min",
    description:
      "A simple, daily nama-archana offered to the Lord with flowers and recitation of the 1008 names of Lord Vishnu. Names of the devotee and family are read out.",
    prasadam: "Blessed flowers + sandalwood paste",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Ideal daily offering for spiritual merit, health, and family well-being.",
  },
  {
    id: "pushpanjali",
    name: "Pushpanjali",
    price: 75,
    duration: "10 min",
    description:
      "A short flower offering at the sanctum · the priest showers flowers on the deity while chanting your name and gotra. Perfect for travellers on a tight schedule.",
    prasadam: "Blessed flowers",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "The simplest temple offering · recommended for first-time visitors and short stops.",
  },
  {
    id: "mala",
    name: "Mala Offering",
    price: 250,
    duration: "20 min",
    description:
      "Garland of fresh flowers (jasmine, marigold, or lotus) adorned on Lord Guruvayurappan in your name. Includes naming the devotee at the sanctum.",
    prasadam: "Prasadam packet",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Symbolises surrender of the ego · popular for students appearing for exams and new beginnings.",
  },
  {
    id: "bhagavatha-sapthaham",
    name: "Bhagavatha Sapthaham",
    price: 5000,
    duration: "7 days",
    description:
      "A seven-day recitation of the entire Srimad Bhagavatam performed by trained scholars in the temple hall. Can be sponsored in your family's name.",
    prasadam: "Daily prasadam + special invitation on day 7",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Considered the highest spiritual merit offering · sponsors are honoured throughout the seven days.",
  },
];

/* ============ PLAN YOUR DARSHAN ============ */
export const DARSHAN_CARDS = [
  {
    icon: "Clock",
    title: "Temple Timings",
    text: "Nirmalyam 3:00 AM • Seeveli 7:30 AM • General Darshan till 9:15 PM",
    cta: "View Full Schedule",
    href: "#blog",
    accent: "saffron",
  },
  {
    icon: "Flame",
    title: "Pooja Booking",
    text: "Palpayasam, Thulabharam, Choroonu, Archana & more. Book in 60 seconds.",
    cta: "Book a Pooja",
    href: "#pooja",
    accent: "maroon",
  },
  {
    icon: "CalendarDays",
    title: "Festival Calendar",
    text: "Utsavam, Ashtami Rohini, Ekadasi · plan your visit around major festivals.",
    cta: "View Festivals",
    href: "#events",
    accent: "gold",
  },
];

/* ============ TESTIMONIALS ============ */
export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  text: string;
  avatar?: string;
  room?: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Anand Krishnan",
    city: "Chennai",
    rating: 5,
    text: "Stayed for two nights during Ekadasi. The room was spotless, the staff arranged our 3 AM Nirmalya Darshan slot, and we were inside the temple in literally four minutes from check-out. The filter coffee at reception was a beautiful touch. Will come back every year.",
    room: "Deluxe AC Room",
  },
  {
    name: "Lakshmi Pillai",
    city: "Bengaluru",
    rating: 5,
    text: "Travelled with my 70-year-old mother and two kids. The Family Suite gave us all space, the elevator worked, and the staff kept a wheelchair ready for amma. They even booked our Thulabharam pooja in advance. Felt like staying with relatives, not at a hotel.",
    room: "Family Suite AC",
  },
  {
    name: "Rajesh Menon",
    city: "Mumbai",
    rating: 5,
    text: "Booked the budget non-AC room for a quick darshan trip. Honestly didn't expect much for ₹700, but the room was clean, hot water ran 24×7, and the location is unbeatable. Free chai at 6 AM before darshan was a sweet surprise. Outstanding value.",
    room: "Non-AC Budget Room",
  },
  {
    name: "Sunita Nair",
    city: "Kolkata",
    rating: 5,
    text: "We did our daughter's Choroonu here. The Guruvayur Dham team coordinated with the temple tantri, arranged the prasadam kit, and even booked a photographer. The whole ceremony felt sacred and stress-free. Forever grateful.",
    room: "Deluxe AC Room",
  },
  {
    name: "Vinod Sharma",
    city: "Delhi",
    rating: 4,
    text: "Excellent location and very honest pricing. The AC room was comfortable, WiFi worked well, and check-in was instant via WhatsApp. Slight noise from East Nada Road during festival evening, but nothing earplugs can't fix. Would recommend.",
    room: "Standard AC Room",
  },
];

/* ============ GALLERY ============ */
export const GALLERY_TABS = [
  "Rooms",
  "Temple",
  "Facilities",
  "Surroundings",
] as const;
export type GalleryTab = (typeof GALLERY_TABS)[number];

export interface GalleryImage {
  tab: GalleryTab;
  src: string;
  alt: string;
  caption: string;
  span?: "tall" | "wide" | "normal";
}

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    tab: "Rooms",
    src: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=800&fit=crop",
    alt: "Deluxe AC room with king bed and saffron accent wall at Guruvayur Dham",
    caption: "Deluxe AC Room · king bed, premium linen",
    span: "tall",
  },
  {
    tab: "Rooms",
    src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
    alt: "Standard AC room interior with queen bed",
    caption: "Standard AC Room · quiet courtyard view",
  },
  {
    tab: "Rooms",
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    alt: "Family suite living area at Guruvayur Dham",
    caption: "Family Suite · separate sitting area",
    span: "wide",
  },
  {
    tab: "Temple",
    src: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=800&fit=crop",
    alt: "Guruvayur Temple gopuram at sunrise",
    caption: "Guruvayur Temple East Nada · 2 min walk",
    span: "tall",
  },
  {
    tab: "Temple",
    src: "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&h=600&fit=crop",
    alt: "Temple oil lamps and diya arrangement",
    caption: "Evening deeparadhana lamps",
  },
  {
    tab: "Temple",
    src: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
    alt: "Marigold and jasmine garlands for pooja",
    caption: "Fresh pooja garlands at dawn",
    span: "wide",
  },
  {
    tab: "Facilities",
    src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    alt: "Reception lobby of Guruvayur Dham",
    caption: "24×7 reception with pilgrim helpdesk",
  },
  {
    tab: "Facilities",
    src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=800&fit=crop",
    alt: "Pure veg restaurant interior near the property",
    caption: "Tie-up pure-veg restaurant next door",
    span: "tall",
  },
  {
    tab: "Facilities",
    src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=600&fit=crop",
    alt: "Parking area with cars at Guruvayur Dham",
    caption: "Free secure parking for 25+ vehicles",
    span: "wide",
  },
  {
    tab: "Surroundings",
    src: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=600&fit=crop",
    alt: "Kerala backwater near Guruvayur",
    caption: "Nearby Punnathur Kotta elephant sanctuary",
  },
  {
    tab: "Surroundings",
    src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=800&fit=crop",
    alt: "Temple pond and surrounding architecture",
    caption: "Rudratheertham temple tank",
    span: "tall",
  },
  {
    tab: "Surroundings",
    src: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=600&fit=crop",
    alt: "Street market near Guruvayur temple",
    caption: "East Nada bazaar · souvenirs and prasadam",
    span: "wide",
  },
];

/* ============ EVENTS & FESTIVALS ============ */
export interface FestEvent {
  name: string;
  date: string;
  dateISO: string;
  description: string;
  highlight: string;
  image: string;
}

export const EVENTS: FestEvent[] = [
  {
    name: "Guruvayur Utsavam",
    date: "Feb 26 – Mar 7, 2026",
    dateISO: "2026-02-26",
    description:
      "The annual 10-day festival of Guruvayur Temple. Each day features a grand procession of Lord Guruvayurappan atop caparisoned elephants, accompanied by traditional Kerala percussion (Panchavadyam and Melam). The festival concludes with the Aarattu holy dip ceremony at the Rudratheertham temple tank. Rooms sell out 3 months in advance · book early.",
    highlight: "Grand elephant procession + Aarattu",
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&h=600&fit=crop",
  },
  {
    name: "Ashtami Rohini",
    date: "Aug 25, 2026",
    dateISO: "2026-08-25",
    description:
      "Sri Krishna Jayanti · the birth anniversary of Lord Krishna, of whom Guruvayurappan is a form. The temple is decorated with flowers and lights, and a special abhishekam is performed at midnight. Children dressed as little Krishnas line up for darshan · a heart-melting sight. Special Palpayasam is distributed to all devotees.",
    highlight: "Midnight Krishna abhishekam + children's procession",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Guruvayur Ekadasi",
    date: "Dec 8, 2026",
    dateISO: "2026-12-08",
    description:
      "The most important Ekadasi of the year at Guruvayur · commemorates the installation of the idol by Guru (Brihaspati) and Vayu. The famous Chembai Sangeetholsavam, a 10-day Carnatic music festival honouring the legendary Chembai Vaidyanatha Bhagavathar, concludes on this night with a mass chorus of hundreds of musicians singing at the temple hall.",
    highlight: "Chembai Sangeetholsavam grand finale chorus",
    image:
      "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop",
  },
  {
    name: "Vishu",
    date: "Apr 14, 2026",
    dateISO: "2026-04-14",
    description:
      "The Malayalam New Year · devotees throng to see the Vishukkani, the auspicious first sight arranged in front of Lord Guruvayurappan with rice, gold, flowers, and a mirror. The temple opens at 2:30 AM for Vishukkani darshan. Families traditionally start the year with the Lord's darshan, making this one of our busiest single days.",
    highlight: "Vishukkani darshan at 2:30 AM",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
  },
  {
    name: "Mandala Pooja Season",
    date: "Nov 16 – Dec 27, 2026",
    dateISO: "2026-11-16",
    description:
      "The 41-day Mandalam pilgrimage season · Sabarimala pilgrims break their journey at Guruvayur for darshan and Ayyappa pooja. Special ayyappa abhishekams, mala-dharana ceremonies, and kettunira arrangements are available at the temple. Guruvayur Dham offers extended check-out (2 PM) and packed meals for pilgrim groups during this season.",
    highlight: "41-day Sabarimala pilgrimage stopover",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Sree Krishna Jayanthi Kalam",
    date: "Year-round",
    dateISO: "2026-01-01",
    description:
      "Throughout the year, Guruvayur Dham hosts special monthly Krishna Jayanthi celebrations on Rohini nakshatra day, with bhajan sessions, prasadam distribution, and discounted room rates for group bookings of 10+ pilgrims. Ask our front desk about the next Rohini date when you check in.",
    highlight: "Monthly Rohini-day bhajan + group discounts",
    image:
      "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=600&fit=crop",
  },
];

/* ============ BLOG POSTS ============ */
export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  image: string;
  content: string[]; // paragraphs
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "guruvayur-temple-darshan-timings",
    title: "Guruvayur Temple Darshan Timings · Complete 2026 Guide",
    excerpt:
      "Nirmalyam at 3 AM to closing at 9:15 PM · here's the full darshan schedule, special pooja slots, and when to go for the shortest queue.",
    category: "Temple Guide",
    readTime: "5 min",
    date: "Jan 12, 2026",
    image:
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=500&fit=crop",
    content: [
      "Guruvayur Temple opens at 3:00 AM every day with the Nirmalya Darshan · the most sacred darshan of the day, when the idol is still adorned with the previous night's flowers and the holy sandalwood paste. This darshan is considered extremely auspicious and is a must for first-time visitors who can manage the early wake-up. The queue starts forming from 2:15 AM, but during festival days and weekends, pilgrims line up as early as 1:30 AM.",
      "After Nirmalyam, the sanctum closes briefly for the Seeveli procession at 7:30 AM, where Lord Guruvayurappan is taken around the inner pradakshina path on the back of an elephant. The idol is then bathed and re-dressed for the morning Usha Pooja. General darshan resumes around 8:30 AM and continues with brief interruptions for each major pooja · Usha Pooja, Ethirettu Pooja, Pantheerady Pooja, and Ucha Pooja · until the temple closes at 12:30 PM for the afternoon break.",
      "The temple reopens at 4:30 PM for the evening session, which is when most casual visitors arrive. The highlight of the evening is the Deeparadhana at 6:15 PM · the lamp-lighting ceremony where hundreds of oil lamps are simultaneously lit around the sanctum, and the idol is shown in full aarti splendour. This is the most crowded darshan of the day; expect at least a 90-minute queue during peak season.",
      "If you want the shortest queue, the best slots are (1) Nirmalyam at 3:00 AM, (2) just after Ucha Pooja at 12:00 PM when the afternoon crowd hasn't built up, and (3) the 7:30 PM post-deeparadhana slot when many families have left for dinner. Avoid weekends, full-moon days, and Ekadasi unless you have a special reason · the crowd on those days can be 5-10× a regular weekday.",
      "Special darshan tickets (₹100 per person) are available at the temple counter and let you skip part of the general queue. Senior citizens above 65, pregnant women, and parents with infants under 1 year get a free priority darshan line on the right side of the sanctum · show an ID at the gate. Guruvayur Dham's reception can guide you on the day's expected crowd levels and help you pick the right slot before you leave for the temple.",
    ],
  },
  {
    slug: "dress-code-guruvayur-temple",
    title: "Dress Code for Guruvayur Temple · What to Wear (and Avoid)",
    excerpt:
      "Men must remove their upper garment. Women must wear saree or salwar. Here's the complete dress code, with practical tips for first-timers.",
    category: "Temple Guide",
    readTime: "4 min",
    date: "Jan 8, 2026",
    image:
      "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=500&fit=crop",
    content: [
      "Guruvayur Temple enforces a strict traditional dress code rooted in Kerala temple custom. Men must wear a mundu (dhoti) or veshti · a single piece of cotton cloth wrapped around the waist, reaching the ankles. Upper garments (shirts, kurtas, t-shirts) must be removed before entering the inner sanctum. Men may keep a small towel or angavastram on the shoulder, but the chest must remain bare. This rule applies to all men, regardless of age, religion, or nationality, with no exceptions.",
      "Women must wear either a saree, a salwar kameez with dupatta, or a long skirt and blouse. Trousers, jeans, leggings, and short tops are not permitted inside the sanctum. Girls below 12 may wear frocks. Many women pilgrims carry a spare saree in their bag and change in the dedicated dressing rooms near the East Nada entrance · Guruvayur Dham also keeps a few spare sarees and mundus at the reception for guests who arrive unprepared, available against a refundable deposit.",
      "Footwear must be removed at the designated counters near each temple gate. There are three footwear deposit counters · East Nada, West Nada, and South Nada · and each charges a nominal ₹2-5 per pair. Socks are allowed inside the temple if the marble floor gets too hot during the day, but many traditional pilgrims prefer to walk barefoot as a mark of devotion. The temple floor is washed daily and is generally clean, but during monsoon (June-September) it can get slippery.",
      "Avoid wearing black clothing on festival days · Kerala tradition associates black with Lord Ayyappa and certain Shaivite rituals, and some temple staff may politely turn you away. White, saffron, cream, and pastel shades are the safest and most respectful choices. Leather items (belts, wallets, bags) are allowed but many devotees prefer to leave them at their rooms. Mobile phones must be switched off inside the sanctum · there are free locker facilities outside the gates.",
      "Children below 10 do not have to follow the dress code strictly, but traditional clothes are appreciated. Photography is strictly prohibited inside the temple complex · leave your camera at the room. Guruvayur Dham provides a free locker in every room for valuables, and our reception can store larger items if needed. The dress code may seem strict to first-time visitors, but it preserves the sanctity that makes Guruvayur special · embrace it as part of the pilgrimage.",
    ],
  },
  {
    slug: "how-to-reach-guruvayur",
    title: "How to Reach Guruvayur · By Air, Train, Bus & Car",
    excerpt:
      "Nearest airport is Kochi (87 km). Nearest major railhead is Thrissur (29 km). Complete routes with travel time and cost for every mode.",
    category: "Travel Guide",
    readTime: "6 min",
    date: "Jan 5, 2026",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop",
    content: [
      "Guruvayur is in Thrissur district of central Kerala, well-connected by rail, road, and the nearest airports. The town is small and walkable · once you arrive, you can cover the temple, the elephant sanctuary, and the main market on foot. Here's a breakdown of every travel option with realistic travel times, costs, and the best routes we recommend to Guruvayur Dham guests.",
      "By air: The nearest international airport is Cochin International Airport (COK), about 87 km south of Guruvayur · a 2-hour taxi ride costing ₹2,500-3,500 depending on the time of day. Pre-paid taxis are available at the airport 24×7, and most drivers know Guruvayur Dham by name. Alternatively, you can take the airport metro to Aluva railway station (30 min, ₹60), then a direct train to Guruvayur (90 min, ₹50-150). For those coming from the north, Calicut International Airport (CCJ) is 100 km away · roughly a 2.5-hour drive.",
      "By train: Guruvayur has its own railway station (GUV), a small terminus about 1 km from the temple, with direct daily trains from Chennai, Mumbai, Bangalore, Thiruvananthapuram, and several Kerala towns. The most convenient connection is from Thrissur Junction (TCR), 29 km away · Thrissur is on the main Konkan-Mangalore line and is connected to every major Indian city. From Thrissur, local trains run to Guruvayur every 2 hours (₹25, 45 min), and taxis charge ₹600-800. Guruvayur Dham offers a complimentary pickup from Guruvayur railway station for guests staying 2+ nights · just WhatsApp us your train details in advance.",
      "By bus: Kerala State Road Transport Corporation (KSRTC) operates direct buses to Guruvayur from all major Kerala cities · Thrissur (every 15 min, ₹45, 1 hour), Kochi (every 30 min, ₹120, 2.5 hours), Kozhikode (every hour, ₹150, 3 hours), and Thiruvananthapuram (3 daily, ₹280, 6 hours). Private inter-city sleeper buses from Bangalore (8 hours, ₹800-1200) and Chennai (12 hours, ₹1200-1800) arrive at the nearby Thrissur KSRTC stand, from where you take a local bus or taxi. The Guruvayur bus stand is 800 m from the temple · an easy 10-minute walk with light luggage.",
      "By car: Self-drive from Kochi takes the NH-66 north via Angamaly, Chalakudy, and Kodungallur · a scenic 2-hour drive through coconut groves and backwaters. From Bangalore, the route is Salem-Coimbatore-Palakkad-Thrissur-Guruvayur, about 410 km and a 9-hour drive with breaks. Free parking for 25+ vehicles is available at Guruvayur Dham · reserve your spot on WhatsApp before arrival, especially during festival season when street parking is impossible to find.",
      "Local transport within Guruvayur is mostly by auto-rickshaw (₹30 minimum, ₹50-80 for short hops) and the occasional e-rickshaw. Most pilgrim points · temple, elephant sanctuary, Rudratheertham tank, and the main market · are within a 1-km radius of the temple and walkable. For day trips to nearby Athirappilly Waterfalls (60 km), Kerala Kalamandalam (35 km), or Palayur Church (25 km), hire a taxi from the stand near the West Nada · typical rates are ₹1,800-2,500 for a full-day 8-hour trip.",
    ],
  },
  {
    slug: "best-time-to-visit-guruvayur",
    title: "Best Time to Visit Guruvayur · Weather, Crowds & Festivals",
    excerpt:
      "October to February is ideal weather. December-January is peak festival season. Monsoon (June-September) is peaceful and green.",
    category: "Travel Guide",
    readTime: "5 min",
    date: "Jan 3, 2026",
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&h=500&fit=crop",
    content: [
      "Guruvayur enjoys a tropical monsoon climate with three distinct seasons · winter (October-February), summer (March-May), and monsoon (June-September). Each season has its own character, and the best time to visit depends on what you're looking for: comfortable weather, fewer crowds, or the chance to witness a major festival.",
      "Winter (October to February) is the peak pilgrim season · and for good reason. Daytime temperatures hover around 28-32°C with low humidity, mornings are pleasant at 22°C, and rainfall is rare. This is also when most major festivals fall: Guruvayur Utsavam (Feb-Mar), Mandala Pooja season (Nov-Dec), Guruvayur Ekadasi (Dec), and Vishu (Apr 14, technically spring but with winter-like weather). Expect heavy crowds on weekends and festival days; book rooms at least 2 months in advance. Guruvayur Dham is fully booked for Ekadasi and Vishu by early October.",
      "Summer (March to May) is hot and humid · daytime temperatures reach 35-38°C with high humidity that makes the heat feel more intense. The temple is less crowded, but the marble floor inside the sanctum gets uncomfortably hot underfoot by noon, so morning and evening darshan are strongly preferred. This is when our AC rooms see the highest demand. Hotel rates drop 20-30% in this season, and you can often get a same-day room without prior booking on weekdays. Carry an umbrella, light cotton clothes, and a water bottle · heatstroke is a real risk for elderly pilgrims walking from distant parking.",
      "Monsoon (June to September) is the most underrated season · and our personal favourite for a quiet pilgrimage. Kerala receives heavy rain from June onwards, and Guruvayur turns lush green. The temple is far less crowded (you can sometimes walk straight into the sanctum on weekday evenings), rooms are discounted 25-40%, and the post-rain smell of the temple grounds is magical. The downsides: occasional flooding of East Nada Road, limited elephant processions (Seeveli is shorter during heavy rain), and the risk of train delays. Carry a sturdy umbrella, waterproof footwear, and pack clothes in plastic bags inside your luggage.",
      "If you must pick one week of the year: the first week of December is the sweet spot · the Mandala-Makaravilakku season has ended the peak Sabarimala rush but Guruvayur Ekadasi hasn't yet arrived, weather is pleasant, and the temple is decorated for the upcoming festival. The second-best pick is the last week of February · right after Utsavam concludes, when the temple is freshly cleaned, the weather is still cool, and the festival crowds have thinned out.",
      "Avoid if possible: Vishu (Apr 14), Guruvayur Ekadasi (Dec), and the Utsavam closing day · unless you specifically want to attend these festivals, the crowds are overwhelming for casual visitors. Also avoid the second Saturday of every month · special abhishekam days draw large crowds from across Kerala. Guruvayur Dham's WhatsApp broadcast sends weekly crowd forecasts to all opted-in guests; message us at +91 98765 43210 with 'forecast' to subscribe.",
    ],
  },
  {
    slug: "places-to-visit-near-guruvayur",
    title: "Top 10 Places to Visit Near Guruvayur (Within 60 km)",
    excerpt:
      "Punnathur Kotta elephant sanctuary, Athirappilly Falls, Kerala Kalamandalam · the best day-trips from Guruvayur, with timings and entry fees.",
    category: "Travel Guide",
    readTime: "7 min",
    date: "Dec 30, 2025",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop",
    content: [
      "Guruvayur is more than just the temple · the surrounding region of central Kerala is packed with cultural, natural, and spiritual attractions that make for excellent day trips. After your darshan and pooja, consider spending an extra day or two exploring these gems, all within an hour's drive from Guruvayur Dham. Most can be covered in 4-6 hour round trips; the front desk can arrange a trusted taxi for ₹1,800-2,500 per day.",
      "1. Punnathur Kotta Elephant Sanctuary (3 km, 15 min): The most popular nearby attraction · an ancestral palace converted into a sanctuary for the temple's 50+ elephants. Walk through the courtyard, watch the elephants being bathed and fed (mornings are best), and learn about the role of elephants in Kerala temple festivals. Entry ₹10, open 9 AM to 5 PM, closed on certain festival days · check before you go. Guruvayur Dham is walking distance from here.",
      "2. Athirappilly & Vazhachal Waterfalls (60 km, 1.5 hours): Kerala's largest waterfall · 80 ft of the Chalakudy River cascading into a dramatic gorge, surrounded by dense Sholayar forest. Often called the 'Niagara of India', it's a popular filming location for Indian cinema. Combine with the smaller Vazhachal Falls 5 km downstream. Entry ₹50, best visited July-February (during monsoon the falls are spectacular but access can be restricted). Plan a half-day trip; carry lunch, as food options near the falls are limited.",
      "3. Kerala Kalamandalam (35 km, 1 hour): A deemed university for Indian performing arts, founded in 1930 by poet Vallathol Narayana Menon. Watch students train in Kathakali, Mohiniyattam, Koodiyattam, and traditional Kerala percussion. Guided tours run twice daily (9:30 AM and 3 PM) and include a 45-minute performance demonstration. Entry ₹250 with camera. A must for culture enthusiasts · budget at least 3 hours for the visit.",
      "4. Vadakkunnathan Temple, Thrissur (29 km, 45 min): An ancient Shiva temple dating back over 1,000 years, with classical Kerala architecture and murals. The temple is the focal point of the famous Thrissur Pooram festival (April-May). Note: same dress code as Guruvayur (men bare-chested, women in saree/salwar). Non-Hindus are not allowed inside the sanctum but can walk around the outer walls. Free entry.",
      "5. Paramekkavu & Thiruvambadi Temples, Thrissur (29 km): The two rival Bhagavathy temples whose elephant processions are the heart of Thrissur Pooram. Both temples have beautiful architecture and are open to all visitors. Combine with a walk around the Thrissur Round (the circular road around Vadakkunnathan) for a great half-day cultural circuit.",
      "6. Palayur Church / St. Thomas Church (25 km, 40 min): One of the seven churches founded by St. Thomas the Apostle in 52 AD · among the oldest churches in India. The current building dates to 1607 but the original baptismal pond is still preserved. A significant Christian pilgrimage site and an interesting interfaith visit from Guruvayur. Open daily 7 AM to 7 PM, free entry.",
      "7. Peechi Dam & Wildlife Sanctuary (25 km, 45 min): A scenic dam and botanical garden with boating facilities, plus a 125-sq-km wildlife sanctuary known for its bird population. The Peechi-Vazhani Wildlife Sanctuary offers guided treks (₹200, advance booking required) · leopards, bison, and over 100 bird species have been recorded. Best visited November-March.",
      "8. Shakthan Thampuran Palace, Thrissur (29 km): A 18th-century palace of the Cochin royal family, now a museum with galleries on royal history, sculpture, and a valuable coin collection. Built in a mix of Dutch and traditional Kerala architecture. Entry ₹20, open 9 AM to 5 PM (closed Mondays). Allow 90 minutes.",
      "9. Chavakkad Beach (25 km, 40 min): A clean, less-crowded beach at the mouth of the Chettuva River · great for sunset, with a historic lighthouse and a backwater boating option. The nearby Blangad beach is even quieter. Avoid swimming here as currents are strong; enjoy the view, the seafood shacks, and the sunset photography.",
      "10. Vadanappally Beach & Snehatheeram Beach (30 km, 45 min): Snehatheeram ('Love Shore') won the Best Beach in India award in 2010 · a long crescent of golden sand with a cliff-top park. The sunset view here is one of the best in Kerala. Pair with Vadanappally for a relaxed evening trip; both beaches have basic amenities and are family-friendly.",
    ],
  },
  {
    slug: "guruvayur-room-booking-tips",
    title: "Guruvayur Room Booking Tips · 12 Things Every Pilgrim Should Know",
    excerpt:
      "When to book, how to avoid scams, what to ask before paying, and how to score the best deal on rooms near the temple.",
    category: "Booking Tips",
    readTime: "6 min",
    date: "Dec 28, 2025",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop",
    content: [
      "Booking a room in Guruvayur is straightforward once you know what to look for, but the surge of pilgrims during festival season attracts its share of overpricing, false location claims, and bait-and-switch listings. After hosting thousands of pilgrims at Guruvayur Dham, here are the 12 things we wish every guest knew before booking.",
      "1. Verify the actual walking distance to East Nada. Many properties claim 'walking distance' or 'near temple' but are 2-3 km away. Ask for the exact distance in metres · anything beyond 500 m means a 7+ minute walk, which is exhausting for elderly pilgrims and dangerous at 2:30 AM for Nirmalyam darshan. Guruvayur Dham is 200 m from East Nada · verify any property on Google Maps before paying.",
      "2. Book 60+ days ahead for festival dates. Guruvayur Ekadasi (Dec), Vishu (Apr 14), and Utsavam (Feb-Mar) see 10× the normal pilgrim crowd. All reputable properties within 1 km of the temple are sold out by mid-October. Last-minute bookings on these dates either pay 3× the normal rate or land you in a far-flung lodge with no AC.",
      "3. Always confirm AC actually works. Many budget listings advertise 'AC room' but the AC is either broken or switched off between 11 PM and 5 AM 'to save power'. Ask explicitly: 'Is the AC 24×7? Does it have a remote in the room?' At Guruvayur Dham, every AC room has a working remote and 24×7 cooling · no excuses.",
      "4. Ask about 24×7 hot water. Standard in every hotel, but many budget lodges in Guruvayur run the geyser only from 5 AM to 9 AM. If you want a shower after the noon darshan or before evening deeparadhana, you need 24-hour hot water. Confirm in writing before booking.",
      "5. Check the actual check-in/check-out times. Standard is 12 PM check-in, 11 AM check-out · but some properties push 24-hour check-out (i.e., check-out at the same time as check-in) which can ruin your schedule if you arrive early morning. Guruvayur Dham offers flexible early check-in for ₹200 extra when the room is ready.",
      "6. Avoid paying the full amount as advance. Reputable properties take 10-25% as booking advance via UPI or bank transfer and the balance on arrival. Anyone demanding 100% advance via personal UPI (not a business account) is a red flag · it's almost impossible to get a refund if they don't honour the booking.",
      "7. Verify the room photos are recent. Many listings on aggregator sites use stock or doctored photos. Ask the property to send a fresh WhatsApp photo of the exact room number being booked. At Guruvayur Dham, every room has a unique number and live photos are available on request.",
      "8. Confirm parking if you're driving. During festival days, on-street parking near the temple is impossible. Many properties list 'parking available' but mean 'parking on the street 500 m away'. Ask specifically: 'Do you have on-premise parking? Is it covered? Is there a charge?' Guruvayur Dham has free covered parking for 25+ vehicles.",
      "9. Ask about lift access if you're on a higher floor. Many older Guruvayur properties are 3-4 storeys with no lift · a serious problem for elderly pilgrims and those with knee issues. If you have mobility concerns, insist on a ground or first-floor room with lift access.",
      "10. Don't fall for 'temple view' claims. The actual temple is visible only from a handful of rooftop terraces within 200 m · most 'temple view' rooms just face the temple-side road. A real temple view (where you can see the gopuram from the window) is rare and commands a 30-50% premium. Ask for a photo of the actual view from the room window.",
      "11. Book poojas in advance, not at the temple. Major poojas like Thulabharam, Choroonu, and Bhagavatha Sapthaham have 2-3 week waiting lists. Your accommodation should help you book these in advance · Guruvayur Dham's reception does this free for all guests. Don't pay extra 'agents' who offer to do this for a commission.",
      "12. Save the property's WhatsApp number. WhatsApp is the fastest way to reach the front desk for room service, early check-out, taxi booking, or any issue. Phone calls during peak hours may go unanswered. Save our number +91 98765 43210 for direct WhatsApp booking and 24×7 support · average response time under 5 minutes.",
    ],
  },
];

/* ============ FAQS ============ */
export const FAQS = [
  {
    q: "How far is Guruvayur Dham from Guruvayur Temple?",
    a: "We are exactly 200 metres (a 2-minute walk) from the temple's East Nada gate. You can see the temple gopuram from our rooftop terrace, and the walk is on a flat, well-lit road · safe even at 3 AM for Nirmalyam darshan.",
  },
  {
    q: "What are the check-in and check-out times?",
    a: "Standard check-in is 12:00 PM and check-out is 11:00 AM. Early check-in (from 8 AM) is available for ₹200 extra if the room is ready. Late check-out till 2 PM is ₹300; half-day extension till 6 PM is ₹600.",
  },
  {
    q: "Do you offer free pickup from the railway station or bus stand?",
    a: "Yes, complimentary pickup from Guruvayur Railway Station (1 km) is included for guests staying 2 or more nights. Just WhatsApp us your train details 2 hours before arrival. Pickup from Thrissur Junction (29 km) is ₹600.",
  },
  {
    q: "Is parking free? Do you have space for buses?",
    a: "Yes · we have free covered parking for 25 cars and 5 bikes inside the property. For tempo travellers and buses, we arrange dedicated parking at a partner lot 300 m away for ₹200/night.",
  },
  {
    q: "Can I book a pooja through you? Which poojas are available?",
    a: "Absolutely · we book all major Guruvayur temple poojas on behalf of our guests at the official temple rate, with no commission. Popular options include Palpayasam (₹50), Archana (₹100), Pushpanjali (₹75), Thulabharam (₹1,500), Choroonu (₹800), and Bhagavatha Sapthaham (₹5,000). Browse the Pooja section above and click 'Book This Pooja' on WhatsApp.",
  },
  {
    q: "What is the dress code for the temple?",
    a: "Men must wear a mundu/dhoti and remove their upper garment before entering the sanctum. Women must wear a saree or salwar kameez with dupatta. We keep spare mundus and sarees at reception (refundable ₹100 deposit) for guests who arrive unprepared. Children under 10 have a relaxed dress code.",
  },
  {
    q: "Do you serve food at the property?",
    a: "We don't have an in-house restaurant, but we have tie-ups with three pure-veg Brahmin hotels within 200 m · order from your room and they deliver in 20 minutes, or walk over for a sit-down meal. Complimentary filter coffee and chai are served at reception every morning from 6 to 8 AM.",
  },
  {
    q: "Are pets allowed?",
    a: "Unfortunately, no. The temple vicinity is a pet-free zone by municipal regulation, and our own insurance does not cover pets on the premises. We can recommend a trusted pet boarding facility in Thrissur (29 km) if you're travelling with a pet.",
  },
  {
    q: "Do you have a lift? My mother has knee issues.",
    a: "Yes, all four floors are served by a 6-passenger elevator with backup power. We also have two ground-floor rooms specifically designed for elderly and mobility-impaired guests · request these at the time of booking and we'll prioritise them.",
  },
  {
    q: "Can I get a refund if I cancel my booking?",
    a: "Cancellations made 7+ days before check-in: 90% refund. 3-6 days before: 50% refund. Less than 72 hours before: no refund. Festival dates (Ekadasi, Vishu, Utsavam) have a strict no-refund policy but can be rescheduled within 60 days at no charge.",
  },
  {
    q: "Is WiFi free? How fast is it?",
    a: "Yes · free, unlimited WiFi throughout the property, including rooms. Speeds are 50-100 Mbps (sufficient for video calls, Netflix, and remote work). Power backup covers the WiFi router, so it stays online during outages.",
  },
  {
    q: "Do you accept international guests and foreign currency?",
    a: "Yes, we welcome guests of all nationalities. We accept payment in INR via UPI, cards (Visa/Mastercard/RuPay), and cash. For foreign currency, we direct you to the licensed forex counter next door. Our staff speaks English, Hindi, Malayalam, and Tamil.",
  },
  {
    q: "Can I store my luggage after check-out?",
    a: "Of course · free luggage storage for up to 8 hours after check-out, in a locked room at reception. Perfect for a final darshan or shopping before your train. Just collect your bags before 9 PM.",
  },
  {
    q: "Do you offer group discounts for pilgrim batches?",
    a: "Yes · groups of 10+ guests staying 2+ nights get 15% off the total bill, plus a complimentary group darshan briefing and packed breakfast on the first morning. School and college pilgrimage groups get an additional 5% off. WhatsApp us for group quotes.",
  },
];

/* ============ CONTACT REASONS ============ */
export const CONTACT_REASONS = [
  "General Enquiry",
  "Room Booking",
  "Pooja Booking",
  "Group / Pilgrimage Booking",
  "Festival Season Booking",
  "Feedback / Complaint",
];

/* ============ HELPERS ============ */
export function formatINR(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

export const waLink = (message: string) =>
  `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(message)}`;
