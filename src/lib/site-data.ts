/**
 * Central mock-data store for Guruvayur Dham.
 * Swap these arrays/objects with real CMS / API data later · every component
 * in src/components/site reads from here, so the rest of the UI stays intact.
 */

export const SITE = {
  name: "Guruvayur Dham",
  tagline: "2 Minutes from Mathura Station",
  phone: "+91-90908 20208",
  phoneRaw: "+919090820208",
  whatsapp: "919090820208",
  email: "bookings@guruvayurdham.co.in",
  emails: {
    bookings: "bookings@guruvayurdham.co.in",
    manager: "manager@guruvayurdham.co.in",
    sales: "sales@guruvayurdham.co.in",
  },
  domain: "guruvayurdham.co.in",
  address: "Mata Pathwari Mandir, Natwar Nagar, Dholi Pyau, Mathura 281001",
  shortAddress: "Natwar Nagar, Dholi Pyau, Mathura 281001",
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.5552!2d77.6900!3d27.4924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3973715d2a2a2a2a%3A0x0!2zMjfCsDI5JzQwLjYiTiA3N8KwNDEnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Mata+Pathwari+Mandir+Natwar+Nagar+Dholi+Pyau+Mathura+281001",
  checkIn: "12:00 PM",
  checkOut: "11:00 AM",
  rating: 4.9,
  reviewCount: 847,
  totalRooms: 16,
  distanceToTemple: "Walk to Mata Pathwari Mandir",
  nearbyTemples: [
    { name: "Shri Krishna Janmabhoomi", distance: "1.5 km", timings: "5 AM - 12 PM, 4 - 9:30 PM", description: "Birthplace of Lord Krishna" },
    { name: "Dwarkadhish Temple", distance: "2 km", timings: "6:30 - 10:30 AM, 4 - 7 PM", description: "Grand temple of Lord Krishna as King of Dwarka" },
    { name: "Banke Bihari Temple", distance: "15 km (Vrindavan)", timings: "7:45 AM - 12 PM, 5:30 - 9:30 PM", description: "Famous Krishna temple in Vrindavan" },
    { name: "Prem Mandir", distance: "15 km (Vrindavan)", timings: "8:30 AM - 8:30 PM", description: "Stunning white marble temple in Vrindavan" },
    { name: "Radha Rani Mandir", distance: "45 km (Barsana)", timings: "6 AM - 9 PM", description: "Birthplace of Radha Rani in Barsana" },
    { name: "Raman Reti", distance: "10 km (Gokul)", timings: "6 AM - 8 PM", description: "Sacred sand where Krishna played as a child" },
    { name: "Mata Pathwari Mandir", distance: "Next door", timings: "5 AM - 9 PM", description: "Adjacent temple at walking distance" },
  ],
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
  { label: "Planner", href: "#/planner", route: "/planner" },
  { label: "Events", href: "#/events", route: "/events" },
  { label: "Blog", href: "#/blog", route: "/blog" },
  { label: "FAQ", href: "#/faq", route: "/faq" },
  { label: "Contact", href: "#/contact", route: "/contact" },
];

/* ============ HERO TRUST BADGES ============ */
export const TRUST_BADGES = [
  { icon: "Star", text: `4.9 Google Rating` },
  { icon: "Train", text: "2 Min from Mathura Station" },
  { icon: "Footprints", text: "Walk to Krishna Janmabhoomi" },
  { icon: "BedDouble", text: "16 Premium Rooms" },
];

/* ============ WHY CHOOSE US ============ */
export const WHY_CHOOSE_US = [
  {
    icon: "Train",
    title: "2 Min from Mathura Station",
    text: "Just a 2-minute walk from Mathura Railway Station. Skip the traffic and reach your room in minutes — perfect for pilgrims arriving by train from Delhi, Agra, or beyond.",
  },
  {
    icon: "MapPin",
    title: "Walk to Krishna Janmabhoomi",
    text: "Only 1.5 km from Shri Krishna Janmabhoomi and 2 km from Dwarkadhish Temple. Explore Mathura's sacred sites on foot, or take a short auto to Vrindavan (15 km) for Banke Bihari and Prem Mandir darshan.",
  },
  {
    icon: "BedDouble",
    title: "16 Premium Rooms",
    text: "Deluxe, Super Deluxe, Superior, and GVD Suite categories — each with fresh linen, 24×7 hot water, attached bathrooms, and family-friendly layouts. Daily sanitised and inspected before every check-in.",
  },
  {
    icon: "HeartHandshake",
    title: "Pilgrim-First Service",
    text: "Pooja booking assistance, early check-in requests, packed breakfast for early darshan, and on-call guidance for first-time Mathura visitors. We treat every guest like family.",
  },
  {
    icon: "Wallet",
    title: "Honest, Transparent Pricing",
    text: "No hidden charges. Pay by UPI, card, or cash · your choice. Festival-season rates published upfront with clear add-ons for extra person and early check-in.",
  },
  {
    icon: "Utensils",
    title: "Pure Veg Meals",
    text: "Tie-ups with pure-veg restaurants within 200 m. Order to your room or walk over · North Indian thali, chai, and prasadam-friendly menus. In-room dining available via QR code.",
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
    slug: "deluxe-room",
    name: "Deluxe Room",
    type: "Deluxe",
    price: 1500,
    originalPrice: 2000,
    rating: 4.8,
    reviews: 142,
    capacity: 2,
    size: "240 sq.ft",
    bedType: "King Bed",
    image: "/rooms/deluxe-room-main.jpg",
    gallery: [
      "/rooms/deluxe-room-main.jpg",
      "/rooms/deluxe-room-1.jpg",
      "/rooms/deluxe-room-2.jpg",
      "/rooms/deluxe-room-3.jpg",
    ],
    badge: "Best Value",
    description: "Our Deluxe Room is designed for comfort and simplicity. Featuring a plush king bed, fresh linen, 24×7 hot water, and a clean modern bathroom — it's the perfect base for your Mathura pilgrimage. Step out and you're 2 minutes from Mathura Station and a short walk to Shri Krishna Janmabhoomi.",
    amenities: ["Wifi", "AC", "TV", "Geyser", "HotWater", "AttachedBath", "PowerBackup", "Parking"],
    shortDesc: "4 rooms · King bed · 240 sq.ft · AC",
  },
  {
    slug: "super-deluxe-room",
    name: "Super Deluxe Room",
    type: "Deluxe",
    price: 2200,
    originalPrice: 2800,
    rating: 4.9,
    reviews: 98,
    capacity: 3,
    size: "320 sq.ft",
    bedType: "King + Sofa Bed",
    image: "/rooms/super-deluxe-room-main.jpg",
    gallery: [
      "/rooms/super-deluxe-room-main.jpg",
      "/rooms/super-deluxe-room-1.jpg",
      "/rooms/super-deluxe-room-2.jpg",
      "/rooms/super-deluxe-room-3.jpg",
    ],
    badge: "Popular",
    description: "The Super Deluxe Room offers extra space and a comfortable sitting area — ideal for small families or groups of 2-3 pilgrims. With premium furnishings, a king bed plus sofa bed, and enhanced amenities, you'll have room to relax after a long day of temple visits in Mathura and Vrindavan.",
    amenities: ["Wifi", "AC", "TV", "Geyser", "HotWater", "AttachedBath", "PowerBackup", "Parking", "RoomService", "Laundry"],
    shortDesc: "5 rooms · King + sofa · 320 sq.ft · AC",
  },
  {
    slug: "superior-room",
    name: "Superior Room",
    type: "Deluxe",
    price: 2800,
    originalPrice: 3500,
    rating: 4.9,
    reviews: 76,
    capacity: 4,
    size: "400 sq.ft",
    bedType: "2 King Beds",
    image: "/rooms/superior-room-main.jpg",
    gallery: [
      "/rooms/superior-room-main.jpg",
      "/rooms/superior-room-1.jpg",
      "/rooms/superior-room-2.jpg",
      "/rooms/superior-room-3.jpg",
    ],
    badge: "Family Choice",
    description: "Our Superior Room is a spacious family room with two king beds, comfortably sleeping 4 guests. Designed for families visiting Mathura and Vrindavan together — plenty of space for children, luggage, and relaxing between darshan rounds. All premium amenities included.",
    amenities: ["Wifi", "AC", "TV", "Geyser", "HotWater", "AttachedBath", "PowerBackup", "Parking", "RoomService", "Laundry", "Lift", "CCTV"],
    shortDesc: "5 rooms · 2 king beds · 400 sq.ft · AC",
  },
  {
    slug: "gvd-suite",
    name: "GVD Suite",
    type: "Deluxe",
    price: 3500,
    originalPrice: 4500,
    rating: 5.0,
    reviews: 41,
    capacity: 4,
    size: "520 sq.ft",
    bedType: "King + Living Room",
    image: "/rooms/gvd-suite-main.jpg",
    gallery: [
      "/rooms/gvd-suite-main.jpg",
      "/rooms/gvd-suite-1.jpg",
      "/rooms/gvd-suite-2.jpg",
      "/rooms/gvd-suite-3.jpg",
      "/rooms/gvd-suite-4.jpg",
      "/rooms/gvd-suite-5.jpg",
    ],
    badge: "Signature",
    description: "The GVD Suite is our signature offering — a spacious suite with a separate living room, premium decor, and the finest furnishings in the house. Includes complimentary breakfast, welcome tea on arrival, and priority darshan assistance. Only 2 suites available. The ultimate pilgrimage stay in Mathura.",
    amenities: ["Wifi", "AC", "TV", "Geyser", "HotWater", "AttachedBath", "PowerBackup", "Parking", "RoomService", "Laundry", "Lift", "CCTV"],
    shortDesc: "2 suites · King + living room · 520 sq.ft · AC",
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
    id: "mangala-aarti",
    name: "Mangala Aarti",
    price: 51,
    duration: "15 min",
    description:
      "The first morning aarti offered to the deity before sunrise. Devotees can sponsor this auspicious aarti in their name. Includes chanting of morning prayers and lamp offering.",
    prasadam: "Blessed flowers + sweets",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Mangala Aarti marks the awakening of the deity. Sponsoring it is believed to bring prosperity and new beginnings.",
  },
  {
    id: "abhishek",
    name: "Abhishek (Holy Bath)",
    price: 1100,
    duration: "45 min",
    description:
      "The sacred bathing ceremony of the deity with milk, curd, ghee, honey, and Ganga Jal (Panchamrit). Performed by the temple priest with Vedic chanting.",
    prasadam: "Panchamrit + blessed flowers",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Abhishek is considered one of the most powerful offerings for spiritual purification and fulfilling heartfelt wishes.",
  },
  {
    id: "rajbhog-aarti",
    name: "Rajbhog Aarti",
    price: 251,
    duration: "30 min",
    description:
      "The midday royal offering where the deity is served a grand meal of 56 bhogs (Chhappan Bhog). Devotees can sponsor this elaborate feast in their family's name.",
    prasadam: "Blessed sweets + food prasadam",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Rajbhog represents offering the best to the Lord. Sponsoring it is believed to bring abundance and remove scarcity.",
  },
  {
    id: "sandhya-aarti",
    name: "Sandhya Aarti",
    price: 101,
    duration: "20 min",
    description:
      "The evening lamp ceremony at sunset. Multiple diyas are lit and waved before the deity while devotional hymns are sung. A deeply moving experience.",
    prasadam: "Blessed lamp wick + flowers",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Sandhya Aarti marks the transition from day to night. Sponsoring it brings peace and harmony to the family.",
  },
  {
    id: "pushpanjali",
    name: "Pushpanjali (Flower Offering)",
    price: 21,
    duration: "10 min",
    description:
      "A simple flower offering at the sanctum. The priest showers flowers on the deity while chanting your name. Perfect for visitors on a short schedule.",
    prasadam: "Blessed flowers",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "The simplest and most affordable offering. Recommended for first-time visitors and daily devotion.",
  },
  {
    id: "phool-bangla",
    name: "Phool Bangla (Flower Palace)",
    price: 5100,
    duration: "2 hours",
    description:
      "An elaborate decoration where the entire sanctum is adorned with thousands of fresh flowers, creating a floral palace for the deity. A spectacular visual offering.",
    prasadam: "Special prasadam + blessed flowers",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Phool Bangla is a grand offering popular during festivals and special occasions. Sponsors are blessed with beauty, harmony, and joy.",
  },
  {
    id: "annadan",
    name: "Annadan (Food Donation)",
    price: 2100,
    duration: "Full day",
    description:
      "Sponsor a full day of meals for pilgrims and devotees at the temple annakshetra. Feeds approximately 100 people with pure vegetarian prasadam meals.",
    prasadam: "Blessed food prasadam",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Annadan is considered the highest form of donation in Hindu tradition. 'Annadan is Mahadan' — feeding devotees brings infinite blessings.",
  },
];

/* ============ PLAN YOUR DARSHAN ============ */
export const DARSHAN_CARDS = [
  {
    icon: "Clock",
    title: "Temple Timings",
    text: "Krishna Janmabhoomi 5 AM-12 PM, 4-9:30 PM • Dwarkadhish 6:30-10:30 AM, 4-7 PM",
    cta: "View Full Schedule",
    href: "#blog",
    accent: "saffron",
  },
  {
    icon: "Flame",
    title: "Pooja Booking",
    text: "Pushpanjali, Abhishek, Mangala Aarti, Rajbhog, Annadan & more. Book in 60 seconds.",
    cta: "Book a Pooja",
    href: "#pooja",
    accent: "maroon",
  },
  {
    icon: "CalendarDays",
    title: "Festival Calendar",
    text: "Janmashtami, Holi, Kartik Purnima, Gowardhan Puja · plan your visit around major festivals.",
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
    text: "Stayed for two nights during Janmashtami. The room was spotless, the staff arranged our 5 AM Mangala Aarti darshan slot, and we were inside the temple in literally four minutes from check-out. The chai at reception was a beautiful touch. Will come back every year.",
    room: "Deluxe AC Room",
  },
  {
    name: "Lakshmi Sharma",
    city: "Bengaluru",
    rating: 5,
    text: "Travelled with my 70-year-old mother and two kids. The Family Suite gave us all space, the elevator worked, and the staff kept a wheelchair ready for amma. They even booked our Archana pooja in advance. Felt like staying with relatives, not at a hotel.",
    room: "Family Suite AC",
  },
  {
    name: "Rajesh Sharma",
    city: "Mumbai",
    rating: 5,
    text: "Booked the Deluxe room for a quick darshan trip. Honestly didn't expect much for ₹1,500, but the room was clean, hot water ran 24×7, and the location is unbeatable. Free chai at 6 AM before darshan was a sweet surprise. Outstanding value.",
    room: "Deluxe Room",
  },
  {
    name: "Sunita Sharma",
    city: "Kolkata",
    rating: 5,
    text: "We did our daughter's Annaprashan here. The Guruvayur Dham team coordinated with the temple pandit, arranged the prasadam kit, and even booked a photographer. The whole ceremony felt sacred and stress-free. Forever grateful.",
    room: "Deluxe AC Room",
  },
  {
    name: "Vinod Sharma",
    city: "Delhi",
    rating: 4,
    text: "Excellent location and very honest pricing. The AC room was comfortable, WiFi worked well, and check-in was instant via WhatsApp. Slight noise from temple road during festival evening, but nothing earplugs can't fix. Would recommend.",
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
    alt: "Shri Krishna Janmabhoomi temple at sunrise",
    caption: "Shri Krishna Janmabhoomi temple gate · 2 min walk",
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
    alt: "Yamuna river at Vishram Ghat, Mathura",
    caption: "Vishram Ghat on the Yamuna river — evening aarti",
  },
  {
    tab: "Surroundings",
    src: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=800&h=800&fit=crop",
    alt: "Temple pond and surrounding architecture",
    caption: "Yamuna temple tank",
    span: "tall",
  },
  {
    tab: "Surroundings",
    src: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=600&fit=crop",
    alt: "Street market near Guruvayur temple",
    caption: "temple gate bazaar · souvenirs and prasadam",
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
    name: "Janmashtami",
    date: "Aug 26, 2026",
    dateISO: "2026-08-26",
    description:
      "The birth anniversary of Lord Krishna, celebrated with unparalleled grandeur in Mathura and Vrindavan. Krishna Janmabhoomi temple hosts midnight abhishekam marking the exact moment of Krishna's birth. Temples across Braj are illuminated with thousands of lamps, devotees perform rasleela, and children dress as little Krishnas. Rooms sell out 60+ days in advance.",
    highlight: "Midnight abhishekam at Krishna Janmabhoomi + rasleela",
    image:
      "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Holi — Lathmar Holi",
    date: "Mar 14, 2026",
    dateISO: "2026-03-14",
    description:
      "The world-famous Lathmar Holi of Barsana and Nandgaon, just 45 km from Mathura. Women playfully chase men with sticks while clouds of coloured powder fill the air. Mathura's Dwarkadhish temple hosts the grand Holi procession. Phoolon ki Holi (Holi with flowers) at Vrindavan's Banke Bihari temple is a must-see. Book 60+ days in advance.",
    highlight: "Lathmar Holi in Barsana + Phoolon ki Holi in Vrindavan",
    image:
      "https://images.unsplash.com/photo-1583075499-8e9a69bb0c1a?w=800&h=600&fit=crop",
  },
  {
    name: "Kartik Purnima",
    date: "Nov 5, 2026",
    dateISO: "2026-11-05",
    description:
      "The full moon of Kartik month — one of the holiest days for Krishna devotees. Devotees take a sacred dip in the Yamuna river at Vishram Ghat in Mathura, followed by deep-daan (floating lamps on the river). Temples across Mathura-Vrindavan stay open late for special darshan. A deeply spiritual experience.",
    highlight: "Yamuna sacred dip + deep-daan at Vishram Ghat",
    image:
      "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Gowardhan Puja",
    date: "Oct 22, 2026",
    dateISO: "2026-10-22",
    description:
      "The day after Diwali — celebrates Lord Krishna lifting the Gowardhan hill to protect devotees from Indra's wrath. Pilgrims visit Gowardhan Hill (22 km from Mathura) for parikrama (circumambulation) and Annakoot (mountain of food offered to the deity). Mathura temples prepare elaborate food displays.",
    highlight: "Gowardhan parikrama + Annakoot celebration",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&h=600&fit=crop",
  },
  {
    name: "Diwali in Mathura",
    date: "Oct 21, 2026",
    dateISO: "2026-10-21",
    description:
      "Mathura celebrates Diwali as the festival of Krishna's homecoming. Every temple, home, and ghat is illuminated with diyas. The Yamuna ghats host spectacular deep-daan ceremonies. Dwarkadhish Temple hosts a grand aarti, and Krishna Janmabhoomi stays open for special night darshan. A magical time to visit Braj.",
    highlight: "Yamuna deep-daan + grand Dwarkadhish aarti",
    image:
      "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=600&fit=crop",
  },
  {
    name: "Radhashtami",
    date: "Sep 10, 2026",
    dateISO: "2026-09-10",
    description:
      "The appearance day of Radha Rani, celebrated with great devotion in Barsana (45 km from Mathura). Radha Rani Mandir hosts a grand abhishekam and procession. Devotees from across India gather to celebrate the divine love of Radha-Krishna. Special kirtan and bhajan sessions throughout the day.",
    highlight: "Grand abhishekam at Radha Rani Mandir, Barsana",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
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
    slug: "mathura-temple-darshan-timings",
    title: "Mathura Temple Darshan Timings · Complete 2026 Guide",
    excerpt:
      "Krishna Janmabhoomi opens 5 AM, Dwarkadhish 6:30 AM · here's the full darshan schedule for all Mathura temples, with tips for the shortest queue.",
    category: "Temple Guide",
    readTime: "5 min",
    date: "Jan 12, 2026",
    image:
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=500&fit=crop",
    content: [
      "Mathura is home to some of the most sacred Krishna temples in India. The most important is Shri Krishna Janmabhoomi — the birthplace of Lord Krishna — which opens at 5:00 AM every morning. The morning aarti is at 5:30 AM in summer and 6:30 AM in winter. General darshan continues until 12:00 PM, when the temple closes for the afternoon. It reopens at 4:00 PM and stays open until 9:30 PM. During Janmashtami, the temple stays open all night for the midnight abhishekam marking Krishna's birth.",
      "Dwarkadhish Temple, dedicated to Lord Krishna as the King of Dwarka, is 2 km from Guruvayur Dham. It opens at 6:30 AM for morning darshan (Mangala Aarti at 6:30 AM, Shringar Aarti at 7:15 AM), closes at 10:30 AM, reopens at 4:00 PM, and closes at 7:00 PM after Sandhya Aarti. The temple is especially beautiful during Holi, when the Dwarkadhish Holi procession starts from here.",
      "Banke Bihari Temple in Vrindavan (15 km from Mathura) has unique timings: morning darshan 7:45 AM to 12:00 PM, and evening darshan 5:30 PM to 9:30 PM. The temple famously does not allow cameras — a rule strictly enforced. During the summer, the temple closes for a midday break and the idol is moved to a cooler room. Plan your visit early morning for the shortest queue.",
      "Prem Mandir in Vrindavan is open from 8:30 AM to 8:30 PM continuously. Unlike other temples, it doesn't close for an afternoon break. The evening light-and-sound show at 7:30 PM is a must-see — the entire white marble temple is illuminated with colourful LED lights. Entry is free. This is the most accessible temple for elderly pilgrims and families with children.",
      "For the shortest queue at Krishna Janmabhoomi, visit on weekdays (Tuesday-Thursday) between 8:00 AM and 10:00 AM. Weekends and festival days see 5-10× the crowd. Guruvayur Dham's reception provides daily crowd forecasts and can help you plan the best time to visit each temple.",
    ],
  },
  {
    slug: "dress-code-mathura-temples",
    title: "Dress Code for Mathura Temples · What to Wear (and Avoid)",
    excerpt:
      "Traditional wear preferred, remove footwear, no leather inside sanctum. Here's the complete guide for all Mathura and Vrindavan temples.",
    category: "Temple Guide",
    readTime: "4 min",
    date: "Jan 8, 2026",
    image:
      "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=500&fit=crop",
    content: [
      "Mathura temples follow traditional North Indian dress customs. Men should wear dhoti, kurta, or traditional Indian attire. While Western clothes are generally accepted at most temples (unlike South Indian temples where men must remove upper garments), traditional wear is strongly preferred at Krishna Janmabhoomi. Shorts, sleeveless shirts, and torn clothes are not permitted. A simple kurta or shirt with trousers is acceptable at most temples.",
      "Women should wear saree, salwar kameez, or modest traditional clothing. At Krishna Janmabhoomi, women are required to cover their heads with a dupatta or saree pallu inside the sanctum. Jeans and Western outfits are permitted at most temples but traditional attire is appreciated. Girls below 12 have no specific dress requirements.",
      "Footwear must be removed at all temples. Free shoe storage is available at Krishna Janmabhoomi (₹2-5 token fee). Leather items (wallets, belts, bags) are generally allowed in the outer temple area but not inside the inner sanctum of some temples. Mobile phones must be switched off or on silent. Photography is strictly prohibited inside Krishna Janmabhoomi and Banke Bihari Temple.",
      "White, saffron, and cream colours are the most auspicious and respectful choices. Avoid wearing black on festival days. Carry a scarf or shawl to cover your head when entering Krishna Janmabhoomi. Guruvayur Dham keeps spare dupattas and dhotis at the reception for guests who arrive unprepared, available against a refundable deposit.",
      "Children below 10 are not required to follow the dress code strictly, but traditional clothes are appreciated. Photography is prohibited inside all temple sanctums — leave cameras and phones in the locker facilities provided. Guruvayur Dham provides a free locker in every room for valuables.",
    ],
  },
  {
    slug: "how-to-reach-mathura",
    title: "How to Reach Mathura · By Air, Train, Bus & Car",
    excerpt:
      "Nearest airport is Agra (60 km) or Delhi (150 km). Mathura Junction is 2 min walk from Guruvayur Dham. Complete routes for every mode.",
    category: "Travel Guide",
    readTime: "6 min",
    date: "Jan 5, 2026",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop",
    content: [
      "Mathura is in western Uttar Pradesh, 145 km south of Delhi and 60 km north of Agra. The city is well-connected by rail, road, and the nearest airports. Guruvayur Dham is located just 2 minutes from Mathura Junction railway station — the closest accommodation to the station in the city.",
      "By air: The nearest international airport is Indira Gandhi International Airport in Delhi (DEL), about 150 km north of Mathura — a 3-hour drive via the Yamuna Expressway. Pre-paid taxis cost ₹3,000-4,500. Alternatively, Agra's Kheria Airport (AGR) is 60 km south — a 1.5-hour drive. Agra airport has limited flights, so Delhi is the more practical option.",
      "By train: Mathura Junction (MTJ) is on the Delhi-Mumbai main line and is connected to every major Indian city. Over 50 daily trains serve Mathura, including Shatabdi Express from Delhi (2 hours), Taj Express from Delhi (2.5 hours), and trains from Agra (30 min), Vrindavan (15 min via the Vrindavan-Mathura shuttle), Mumbai, Jaipur, and Varanasi. Guruvayur Dham is a 2-minute walk from the station — you can see the property from the platform exit.",
      "By bus: UPSRTC (Uttar Pradesh State Road Transport) operates buses to Mathura from Delhi (every 30 min, ₹150-300, 3 hours), Agra (every 15 min, ₹50, 1 hour), Vrindavan (every 10 min, ₹10, 15 min), and Jaipur (3 daily, ₹250, 5 hours). Private Volvo sleeper buses from Delhi (3 hours, ₹300-500) and Jaipur (5 hours, ₹400-600) arrive at the Mathura bus stand, 1 km from Guruvayur Dham.",
      "By car: From Delhi, take the Yamuna Expressway (165 km, 2.5 hours, toll ₹400 one-way). From Agra, take NH-19 north (60 km, 1.5 hours). From Vrindavan, take the Mathura-Vrindavan road (15 km, 30 min). From Jaipur, take NH-21 via Bharatpur (200 km, 4 hours). Free parking for 25+ vehicles is available at Guruvayur Dham — reserve your spot on WhatsApp before arrival during festival season.",
      "Local transport: Auto-rickshaws are the most common way to get around Mathura (₹30-80 for short hops). For Vrindavan (15 km), shared autos cost ₹30 per person, private auto ₹150-200, or e-rickshaws. For day trips to Barsana (45 km), Gokul (10 km), or Gowardhan (22 km), hire a taxi for ₹1,500-2,500 for a full day. Guruvayur Dham can arrange trusted drivers on request.",
    ],
  },
  {
    slug: "best-time-to-visit-mathura",
    title: "Best Time to Visit Mathura · Weather, Crowds & Festivals",
    excerpt:
      "October to March is ideal. Janmashtami (Aug) and Holi (Mar) are the biggest festivals. Summer is hot but less crowded.",
    category: "Travel Guide",
    readTime: "5 min",
    date: "Jan 3, 2026",
    image:
      "https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?w=800&h=500&fit=crop",
    content: [
      "Mathura experiences a typical North Indian climate with four distinct seasons: winter (November-February), spring (March-April), summer (May-June), and monsoon (July-September). Each season has its own character, and the best time to visit depends on whether you want comfortable weather, fewer crowds, or the chance to witness a major festival.",
      "Winter (November to February) is the peak pilgrim season. Daytime temperatures are pleasant at 20-25°C, mornings can be chilly at 8-12°C. This is when most major festivals fall: Kartik Purnima (November), Diwali (October-November), Gowardhan Puja, and the run-up to Janmashtami decorations. Expect heavy crowds on weekends and festival days; book rooms at least 2 months in advance. Guruvayur Dham is fully booked for Janmashtami and Holi by early summer.",
      "Spring (March to April) is when Holi transforms Mathura into the world's most colourful celebration. Lathmar Holi in Barsana (45 km), Phoolon ki Holi in Vrindavan (15 km), and the Dwarkadhish Temple procession in Mathura are once-in-a-lifetime experiences. Temperatures are comfortable (25-35°C). Book 60+ days ahead — this is the most popular time for international tourists.",
      "Summer (May to June) is hot — daytime temperatures reach 40-45°C. The temples are less crowded, and you can often get a room without prior booking on weekdays. AC rooms are essential. Carry an umbrella, light cotton clothes, and plenty of water. Hotel rates drop 20-30%. Morning and evening darshan are strongly preferred — the temple floors get hot underfoot by noon.",
      "Monsoon (July to September) brings relief from the heat with temperatures dropping to 30-35°C. The Yamuna river swells, and the ghats are beautiful. Temples are far less crowded — you can sometimes walk straight into the sanctum on weekday evenings. Rooms are discounted 25-40%. Carry a sturdy umbrella and waterproof footwear. The risk of train delays increases during heavy rain.",
      "If you must pick one week: the week leading up to Janmashtami (August) is the most magical — temples are decorated, kirtans fill the air, and the midnight abhishekam at Krishna Janmabhoomi is an unforgettable experience. For weather without festival crowds: the first two weeks of December are ideal — pleasant temperatures, thin crowds, and the temples are freshly decorated for winter.",
    ],
  },
  {
    slug: "places-to-visit-near-mathura",
    title: "Top 10 Places to Visit Near Mathura (Within 50 km)",
    excerpt:
      "Krishna Janmabhoomi, Banke Bihari, Prem Mandir, Radha Rani Mandir, Gowardhan · the best day-trips from Mathura with timings and distances.",
    category: "Travel Guide",
    readTime: "7 min",
    date: "Dec 30, 2025",
    image:
      "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=800&h=500&fit=crop",
    content: [
      "The Braj region around Mathura is dense with sacred sites connected to Lord Krishna's life. From his birthplace to his childhood playgrounds, every village and hill has a story. After your darshan at Krishna Janmabhoomi, consider spending extra days exploring these sacred destinations — all within an hour's drive from Guruvayur Dham.",
      "1. Shri Krishna Janmabhoomi (1.5 km, 5 min): The birthplace of Lord Krishna, built over the prison cell where Devaki and Vasudeva were imprisoned. The main temple has a marble stone marking the exact spot of Krishna's birth. Open 5 AM-12 PM, 4-9:30 PM. Free entry. Photography prohibited inside. This is the most important temple in Mathura — start your pilgrimage here.",
      "2. Dwarkadhish Temple (2 km, 7 min): A grand 17th-century temple dedicated to Lord Krishna as the King of Dwarka. Known for its intricate Rajasthani architecture and the famous Holi procession that starts from here. Open 6:30-10:30 AM, 4-7 PM. Free entry. The Sandhya Aarti at 6:30 PM is especially beautiful.",
      "3. Banke Bihari Temple, Vrindavan (15 km, 30 min): The most famous Krishna temple in Vrindavan, known for its unique darshan style where the curtain is pulled open and closed every few minutes (the Lord is said to get shy if stared at too long). Open 7:45 AM-12 PM, 5:30-9:30 PM. No photography. Visit early morning for the shortest queue.",
      "4. Prem Mandir, Vrindavan (15 km, 30 min): A stunning white marble temple built in 2012, dedicated to Radha-Krishna. Beautifully illuminated at night with LED lights. Open 8:30 AM-8:30 PM. Free entry. The evening light-and-sound show at 7:30 PM is a must-see. Most accessible temple for elderly pilgrims — no stairs, wide walkways.",
      "5. Radha Rani Mandir, Barsana (45 km, 1.5 hours): The birthplace of Radha Rani, perched on a hilltop. This is where the famous Lathmar Holi takes place every March. Open 6 AM-9 PM. Free entry. The climb to the top involves 200+ steps — an auto can take you up for ₹50. The view from the top is spectacular.",
      "6. Raman Reti, Gokul (10 km, 20 min): The sacred sand where baby Krishna is said to have played. Pilgrims rub the sand on their bodies as a blessing. Open 6 AM-8 PM. Free entry. A peaceful spot for meditation, away from the crowds. The nearby Gokulnath Temple is also worth visiting.",
      "7. Gowardhan Hill (22 km, 45 min): The hill Krishna lifted to protect villagers from Indra's wrath. Pilgrims perform parikrama (circumambulation) — a 21 km walk around the hill that takes 4-5 hours. Mansi Ganga Kund at the base is a holy bathing spot. Visit during Gowardhan Puja (day after Diwali) for the Annakoot celebration.",
      "8. Vishram Ghat, Mathura (1.5 km, 5 min): The most important ghat on the Yamuna river in Mathura, where Krishna is said to have rested after killing his uncle Kamsa. The evening aarti at sunset is beautiful — hundreds of floating diyas on the Yamuna. Free. Best visited at sunrise or sunset.",
      "9. Nandgaon (50 km, 1.5 hours): The village where Krishna spent his childhood with foster parents Nanda and Yashoda. The Nand Bhavan temple on the hilltop offers panoramic views. Visit during Holi season for the Nandgaon vs Barsana Lathmar Holi exchange.",
      "10. Kesi Ghat, Vrindavan (15 km, 30 min): Where Krishna is said to have killed the demon Kesi. The evening Yamuna Aarti here is one of the most beautiful in Braj. Free. Pair with Banke Bihari and Prem Mandir for a full-day Vrindavan circuit.",
    ],
  },
  {
    slug: "mathura-room-booking-tips",
    title: "Mathura Room Booking Tips · 12 Things Every Pilgrim Should Know",
    excerpt:
      "When to book, how to verify location, what to ask before paying, and how to score the best deal on rooms near Mathura temples.",
    category: "Booking Tips",
    readTime: "6 min",
    date: "Dec 28, 2025",
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=500&fit=crop",
    content: [
      "Booking a room in Mathura is straightforward once you know what to look for. After hosting thousands of pilgrims at Guruvayur Dham, here are 12 things we wish every guest knew before booking.",
      "1. Verify the actual distance to Mathura Junction. Many properties claim 'near station' but are 2-3 km away. Ask for the exact distance — anything beyond 500 m means a 7+ minute walk, which is exhausting for elderly pilgrims with luggage. Guruvayur Dham is 2 minutes from Mathura Junction — you can see it from the platform exit.",
      "2. Book 60+ days ahead for Janmashtami and Holi. These two festivals see 10× the normal pilgrim crowd. All reputable properties within 2 km of Krishna Janmabhoomi are sold out 2 months in advance. Last-minute bookings on these dates either pay 3× the normal rate or land you far from the temples.",
      "3. Always confirm AC actually works. Many budget listings advertise 'AC room' but the AC is either broken or switched off at night. Ask explicitly: 'Is the AC 24×7? Does it have a remote in the room?' At Guruvayur Dham, every AC room has a working remote and 24×7 cooling.",
      "4. Ask about 24×7 hot water. Standard in good hotels, but many budget lodges run the geyser only from 5 AM to 9 AM. If you want a shower after the noon darshan or before evening aarti, you need 24-hour hot water. Confirm before booking.",
      "5. Check the check-in/check-out times. Standard is 12 PM check-in, 11 AM check-out. Some properties push 24-hour check-out which can ruin your schedule. Guruvayur Dham offers flexible early check-in for ₹200 extra when the room is ready.",
      "6. Don't pay 100% advance. Reputable properties take 10-25% as booking advance via UPI and the balance on arrival. Anyone demanding full payment via personal UPI is a red flag.",
      "7. Verify room photos are recent. Ask the property to send a fresh WhatsApp photo of the exact room. At Guruvayur Dham, every room has a unique number and live photos are on our website.",
      "8. Confirm parking if driving. On-street parking near temples is impossible during festival days. Ask: 'Do you have on-premise parking? Is it covered?' Guruvayur Dham has free parking for 25+ vehicles.",
      "9. Ask about Vrindavan transport. Mathura to Vrindavan is 15 km — you'll need auto-rickshaws or taxis daily. A hotel that can arrange trusted drivers saves time and money. Guruvayur Dham arranges transport on request.",
      "10. Book poojas in advance. Major poojas at Krishna Janmabhoomi have waiting lists during festival season. Your accommodation should help you book these — Guruvayur Dham's reception does this free for all guests.",
      "11. Check for proximity to multiple temples. Krishna Janmabhoomi (1.5 km), Dwarkadhish (2 km), and Vishram Ghat (1.5 km) are all walkable from Guruvayur Dham. For Vrindavan temples, you'll need transport — stay in Mathura and do day trips.",
      "12. Save the WhatsApp number. WhatsApp is the fastest way to reach the front desk. Save +91-90908 20208 for direct WhatsApp booking and 24×7 support — average response time under 5 minutes.",
    ],
  },
];


/* ============ FAQS ============ */
export const FAQS = [
  {
    q: "How far is Guruvayur Dham from Shri Krishna Janmabhoomi?",
    a: "We are exactly 2 minutes (a 2-minute walk) from the temple's temple gate. You can see the temple from our rooftop terrace, and the walk is on a flat, well-lit road · safe even at 3 AM for Mangala Aarti darshan.",
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
    a: "Absolutely · we book all major Guruvayur temple poojas on behalf of our guests at the official temple rate, with no commission. Popular options include prasadam (₹50), Archana (₹100), Pushpanjali (₹75), Archana (₹1,500), Annaprashan (₹800), and Bhagavatha Sapthaham (₹5,000). Browse the Pooja section above and click 'Book This Pooja' on WhatsApp.",
  },
  {
    q: "What is the dress code for the temple?",
    a: "Men must wear a mundu/dhoti and remove their upper garment before entering the sanctum. Women must wear a saree or salwar kameez with dupatta. We keep spare mundus and sarees at reception (refundable ₹100 deposit) for guests who arrive unprepared. Children under 10 have a relaxed dress code.",
  },
  {
    q: "Do you serve food at the property?",
    a: "We don't have an in-house restaurant, but we have tie-ups with three pure-veg pure-veg restaurants within 200 m · order from your room and they deliver in 20 minutes, or walk over for a sit-down meal. Complimentary chai and chai are served at reception every morning from 6 to 8 AM.",
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
    a: "Cancellations made 7+ days before check-in: 90% refund. 3-6 days before: 50% refund. Less than 72 hours before: no refund. Festival dates (Janmashtami, Holi) have a strict no-refund policy but can be rescheduled within 60 days at no charge.",
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
