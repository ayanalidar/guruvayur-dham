/**
 * SEO Pages — config + content for all SEO-optimized landing pages.
 *
 * Each page has:
 *   - slug: the URL hash (e.g. "janmashtami" → /#/janmashtami)
 *   - category: for navbar grouping (festivals | hotels-near | darshan-timings)
 *   - navLabel: short label for the navbar dropdown
 *   - title: the H1 + <title> tag
 *   - metaDescription: 150-160 char meta description
 *   - heroImage: background image URL
 *   - jsonLdType: which JSON-LD schema to inject (Event | TouristAttraction | FAQPage)
 *   - eyebrow: small label above the title
 *   - intro: 2-3 paragraph introduction (the main SEO content)
 *   - sections: array of { heading, body } — additional content sections
 *   - faqs: array of { q, a } — for FAQ accordion + FAQPage JSON-LD
 *   - ctaHeadline: the booking CTA text
 *
 * To add a new SEO page:
 *   1. Add an entry to the SEO_PAGES array below
 *   2. Add a route in src/app/page.tsx: if (path === "/<slug>") return <SEOPage slug="<slug>" />
 *   3. The sitemap + navbar pick it up automatically from this config
 */

export type SEOPageCategory = "festivals" | "hotels-near" | "darshan-timings";

export type SEOPage = {
  slug: string;
  category: SEOPageCategory;
  navLabel: string;
  title: string;
  metaDescription: string;
  heroImage: string;
  jsonLdType: "Event" | "TouristAttraction" | "FAQPage";
  eyebrow: string;
  intro: string[];
  sections: Array<{ heading: string; body: string[] }>;
  faqs: Array<{ q: string; a: string }>;
  ctaHeadline: string;
};

export const SEO_PAGES: SEOPage[] = [
  // ════════════════════════════════════════════════════════════════════════
  // FESTIVAL PAGES (5)
  // ════════════════════════════════════════════════════════════════════════
  {
    slug: "janmashtami",
    category: "festivals",
    navLabel: "Janmashtami",
    title: "Janmashtami in Mathura — Krishna's Birthday Celebration 2026",
    metaDescription:
      "Celebrate Janmashtami in Mathura — Krishna's birthplace. Book rooms near Krishna Janmabhoomi. Darshan timings, pooja booking & travel guide for 2026.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Festival Guide · August 2026",
    intro: [
      "Janmashtami in Mathura is the most sacred celebration of Lord Krishna's birth, observed with unparalleled devotion in the very city where he was born. Each year, millions of pilgrims from across India and the world gather in Mathura to witness the midnight celebrations at Krishna Janmabhoomi — the exact site of Krishna's birth. The festival typically falls in August or September, based on the Hindu lunar calendar, and the entire Braj region transforms into a vibrant tapestry of devotion, music, and celebration.",
      "Guruvayur Dham, located in Natwar Nagar near Mata Pathwari Mandir, offers the ideal base for your Janmashtami pilgrimage. At just a few minutes' walk from key temple sites, our pilgrim home provides clean AC and non-AC rooms, 24×7 hot water, and on-site pooja booking assistance. We understand the unique needs of devotees during this peak festival season — from early morning darshan timings to midnight aarti coordination — and our team is dedicated to making your spiritual journey seamless and fulfilling.",
      "Booking your stay well in advance is crucial for Janmashtami. Rooms in Mathura sell out 60-90 days before the festival, and prices surge significantly during this period. We recommend booking at least 2 months ahead to secure your preferred room type at the best available rate. Our team can also coordinate darshan passes, pooja bookings, and local transportation to ensure you experience the full splendor of Krishna's birthday celebration without any logistical stress.",
    ],
    sections: [
      {
        heading: "Janmashtami 2026 Dates & Schedule",
        body: [
          "Janmashtami 2026 is expected to be celebrated on August 26-27, 2026 (based on the Ashtami tithi of Krishna Paksha in Bhadrapada month). The main celebrations begin at midnight, marking the exact moment of Krishna's birth. Krishna Janmabhoomi temple opens special darshan slots starting from late evening, with the midnight aarti being the highlight of the festival.",
          "Key events include the Mangala Aarti at dawn, Abhishek (ceremonial bathing of the deity), Raslila performances throughout the day, and the grand midnight celebration. The Dahi Handi event takes place the following day in various parts of Mathura and nearby Gokul, where teams form human pyramids to break clay pots of butter — reenacting young Krishna's playful steals.",
        ],
      },
      {
        heading: "Where to Stay for Janmashtami",
        body: [
          "During Janmashtami, Mathura sees an influx of over 2 million pilgrims. Hotels near Krishna Janmabhoomi and the main temple areas book out weeks in advance. Guruvayur Dham offers a strategic location in Natwar Nagar, Dholi Pyau — close enough to walk to major temples yet away from the overwhelming crowds. Our rooms range from budget-friendly non-AC options at ₹700/night to deluxe AC rooms and family suites, accommodating solo pilgrims, couples, and large family groups.",
          "We strongly advise against arriving without a confirmed booking during Janmashtami. Many pilgrims end up sleeping in temple corridors or paying exorbitant rates for substandard accommodation. Book your room at Guruvayur Dham at least 60 days in advance to guarantee a clean, safe, and comfortable stay during this peak festival period.",
        ],
      },
      {
        heading: "How to Reach Mathura for Janmashtami",
        body: [
          "Mathura is well-connected by rail and road. Mathura Junction railway station is just 3 km from Guruvayur Dham, with direct trains from Delhi (2 hours), Agra (1 hour), Mumbai (12 hours), and Varanasi (8 hours). During Janmashtami, special trains are added on popular routes. The nearest airport is Agra (60 km), with Delhi's Indira Gandhi International Airport (150 km) offering more flight options.",
          "For pilgrims driving from Delhi, the Yamuna Expressway provides a smooth 2.5-hour journey. Free parking for 25+ vehicles is available at Guruvayur Dham. We also arrange complimentary pickup from Mathura railway station for guests staying 2 or more nights — just WhatsApp us your train details in advance.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is Janmashtami 2026 in Mathura?",
        a: "Janmashtami 2026 is expected on August 26-27, 2026. The main midnight celebration takes place at Krishna Janmabhoomi temple. We recommend arriving by August 25 to settle in and attend the pre-festival preparations.",
      },
      {
        q: "How early should I book a room for Janmashtami?",
        a: "Book at least 60-90 days in advance. Mathura hotels sell out completely during Janmashtami, and prices surge 2-3x closer to the festival. Guruvayur Dham accepts advance bookings with flexible cancellation up to 7 days before check-in.",
      },
      {
        q: "What is the dress code for Janmashtami at Krishna Janmabhoomi?",
        a: "Men should wear dhoti-kurta or traditional Indian attire (no shorts or sleeveless shirts). Women should wear saree, salwar kameez, or modest traditional wear. Head covering is recommended. Leather items (belts, wallets, bags) are not allowed inside the sanctum.",
      },
      {
        q: "Can I book Janmashtami pooja through Guruvayur Dham?",
        a: "Yes! We coordinate Abhishek, Mangala Aarti, and special Janmashtami poojas directly with the temple. Book through our pooja booking page or WhatsApp us at +91-90908 20208. We charge zero commission — you pay the official temple rate.",
      },
      {
        q: "Is it safe to visit Mathura during Janmashtami?",
        a: "Yes, Mathura is generally safe during Janmashtami with heavy police deployment. However, expect very large crowds at Krishna Janmabhoomi. We recommend visiting with elderly family members during early morning hours (before 8 AM) when crowds are thinner.",
      },
    ],
    ctaHeadline:
      "Book Your Janmashtami Stay — Rooms Filling Fast for August 2026",
  },

  {
    slug: "holi-in-mathura",
    category: "festivals",
    navLabel: "Holi in Mathura",
    title: "Holi in Mathura — Lathmar Holi, Phoolon ki Holi & Festival Guide 2026",
    metaDescription:
      "Experience Holi in Mathura — Lathmar Holi in Barsana, Phoolon ki Holi in Vrindavan. Complete festival guide, dates, travel tips. Book rooms now.",
    heroImage:
      "https://images.unsplash.com/photo-1583077783049-9c1e9e0f1a3e?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Festival Guide · March 2026",
    intro: [
      "Holi in Mathura and the Braj region is unlike any other Holi celebration in the world. This is the land where Lord Krishna himself played Holi with Radha and the Gopis, and the tradition continues with unmatched fervor centuries later. The celebrations span over a week, starting from Barsana (Radha's village) and moving through Nandgaon, Vrindavan, and finally Mathura — each location offering a unique and deeply spiritual version of the festival of colors.",
      "The most famous celebration is Lathmar Holi in Barsana, where women playfully beat men with sticks (lathis) as the men try to protect themselves with shields. This reenacts the legend of Krishna visiting Radha's village and being chased away by the women. A few days later, the Phoolon ki Holi (Flower Holi) at the Banke Bihari Temple in Vrindavan is a breathtakingly beautiful celebration where devotees are showered with flower petals instead of colored powder.",
      "Guruvayur Dham in Mathura serves as your perfect base for the Braj Holi circuit. Located in Natwar Nagar near Mata Pathwari Mandir, we're just 15 km from Vrindavan and 40 km from Barsana. Our team can arrange guided day trips to each Holi celebration site, coordinate transportation, and ensure you return to a clean, comfortable room each evening after the festivities.",
    ],
    sections: [
      {
        heading: "Holi 2026 Dates & Celebration Schedule",
        body: [
          "Holi 2026 falls on March 3-4, 2026, but the Braj celebrations begin days earlier. Lathmar Holi in Barsana typically takes place 7-8 days before the main Holi day (around February 24-25). The Phoolon ki Holi at Banke Bihari Temple in Vrindavan is usually held a few days before Holi (around February 27-28). The main Holi celebration at Dwarkadhish Temple in Mathura takes place on the day of Holi itself.",
          "We recommend arriving at least 3-4 days before the main Holi day to experience the full spectrum of Braj Holi celebrations. This allows you to visit Barsana for Lathmar Holi, Vrindavan for Phoolon ki Holi, and Mathura for the temple Holi — each offering a distinct and unforgettable experience.",
        ],
      },
      {
        heading: "Best Places to Experience Holi in Braj",
        body: [
          "Barsana (40 km from Mathura): Home of Radha, famous for Lathmar Holi where women chase men with sticks. The celebration at Radha Rani Temple is the most unique Holi experience in India. Visit a day before for the pre-celebration and on the day for the main event.",
          "Nandgaon (45 km from Mathura): Krishna's village, where the men from Barsana come to play Holi the next day. The Krishna Temple here hosts a lively color-throwing celebration. The mood is playful and devotional, with traditional Holi songs (Hori) echoing through the village.",
          "Vrindavan (15 km from Mathura): The Banke Bihari Temple hosts the famous Phoolon ki Holi (flower Holi) in the morning, followed by traditional color Holi in the afternoon. The temple town transforms into a sea of colors, with processions, devotional music, and dance. Arrive early (by 8 AM) as the temple gets extremely crowded.",
          "Mathura (at Guruvayur Dham): The Dwarkadhish Temple hosts a grand Holi celebration with a traditional procession (Shobha Yatra) through the city. The celebration here is more temple-focused and family-friendly compared to the wilder celebrations in Barsana.",
        ],
      },
      {
        heading: "Tips for Celebrating Holi in Braj",
        body: [
          "Wear old clothes that you don't mind getting permanently stained. White clothes show colors best for photos but will be ruined afterward. Apply coconut oil to your skin and hair before going out — it makes the colors easier to wash off. Protect your camera/phone in a waterproof pouch. Carry a small bag with water and snacks, as shops may be closed during peak celebration hours.",
          "Women should be cautious in crowded areas — stay in groups and avoid isolated spots. The celebrations at temple premises (Banke Bihari, Dwarkadhish) are family-friendly and safe. The street celebrations in Barsana can get intense; if you're uncomfortable, observe from a distance or a rooftop.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is Holi 2026 in Mathura?",
        a: "Holi 2026 falls on March 3-4, 2026. Lathmar Holi in Barsana is typically 7-8 days before (around Feb 24-25). Phoolon ki Holi in Vrindavan is a few days before the main Holi. Book rooms for at least 5 days to experience all celebrations.",
      },
      {
        q: "What is Lathmar Holi?",
        a: "Lathmar Holi is celebrated in Barsana, Radha's village. Women playfully beat men with sticks (lathis) while men protect themselves with shields. It reenacts Krishna visiting Radha's village and being chased away. It's one of India's most unique cultural celebrations.",
      },
      {
        q: "Is Holi in Mathura safe for families?",
        a: "Temple celebrations (Dwarkadhish, Banke Bihari) are family-friendly and safe. Street celebrations in Barsana can be intense. We recommend families with children attend temple Holi celebrations and observe street celebrations from rooftops or designated viewing areas.",
      },
      {
        q: "What should I wear for Holi in Mathura?",
        a: "Wear old white clothes that you don't mind discarding. Apply coconut oil on skin and hair to make colors easier to wash. Protect electronics in waterproof pouches. Women should wear modest, fitted clothing (leggings + kurti) to avoid unwanted attention in crowds.",
      },
      {
        q: "How far is Barsana from Mathura?",
        a: "Barsana is approximately 40 km from Mathura (1-hour drive). Guruvayur Dham can arrange day trips to Barsana for Lathmar Holi. We recommend hiring a local driver who knows the routes, as roads can be congested during Holi season.",
      },
    ],
    ctaHeadline: "Book Your Holi Stay — Experience the World's Most Colorful Festival",
  },

  {
    slug: "diwali-in-mathura",
    category: "festivals",
    navLabel: "Diwali in Mathura",
    title: "Diwali in Mathura — Festival of Lights, Dev Deepawali & Temple Celebrations",
    metaDescription:
      "Celebrate Diwali in Mathura — Dev Deepawali on Yamuna ghats, temple illuminations, Govardhan Puja. Book rooms for Diwali 2026. Pooja booking available.",
    heroImage:
      "https://images.unsplash.com/photo-1605021154661-9c7c1c1a1d6e?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Festival Guide · October/November 2026",
    intro: [
      "Diwali in Mathura is a deeply spiritual experience that transcends the typical firecracker celebrations found elsewhere in India. As the birthplace of Lord Krishna, Mathura observes Diwali with a unique blend of devotion and grandeur. The city's temples are illuminated with thousands of oil lamps (diyas), and the ghats of the Yamuna River come alive during Dev Deepawali — the festival of lights for the gods.",
      "The celebrations begin with Dhanteras and continue through Narak Chaturdashi (the day Krishna defeated the demon Narakasura), Lakshmi Puja on the main Diwali night, and culminate with Govardhan Puja — a celebration unique to the Braj region commemorating Krishna lifting the Govardhan Hill to protect villagers from torrential rains.",
      "Staying at Guruvayur Dham during Diwali offers you a front-row seat to these sacred celebrations. Our proximity to Mata Pathwari Mandir and other key temples means you can easily participate in late-night aartis and early morning abhishekams. We arrange special Diwali pooja bookings, local temple tours, and Yamuna ghat visits — all while providing a peaceful retreat from the festive crowds.",
    ],
    sections: [
      {
        heading: "Diwali 2026 Dates & Key Celebrations",
        body: [
          "Diwali 2026 falls on November 8, 2026 (Sunday), based on the Amavasya (new moon) of the Kartik month. The celebrations span five days: Dhanteras (Nov 6), Narak Chaturdashi (Nov 7), Lakshmi Puja / Diwali (Nov 8), Govardhan Puja (Nov 9), and Bhai Dooj (Nov 10). Dev Deepawali on the Yamuna ghats is celebrated 15 days after Diwali, on the Kartik Purnima (Nov 23).",
          "The most spectacular event is the Dev Deepawali celebration at Vishram Ghat on the Yamuna River, where over 1,000 diyas are lit along the steps. This is a sight that photographs cannot do justice — the entire ghat glows with golden light, reflecting on the river while devotional hymns echo through the night.",
        ],
      },
      {
        heading: "Govardhan Puja — Unique to Braj",
        body: [
          "Govardhan Puja, celebrated the day after Diwali, is deeply significant in Mathura. It commemorates the day Lord Krishna lifted the Govardhan Hill on his little finger to protect the people of Braj from the wrath of Indra (the rain god). Devotees prepare mountains of food (Annakoot) in temples, symbolizing the hill Krishna lifted.",
          "The Krishna Janmabhoomi and Dwarkadhish temples host grand Annakoot celebrations where hundreds of vegetarian dishes are prepared and offered to the deity before being distributed as prasad. Guruvayur Dham can arrange early morning visits to these temples for the Annakoot darshan, where you can witness this spectacular display of devotion and receive the blessed prasad.",
        ],
      },
      {
        heading: "Diwali Pooja Booking at Mathura Temples",
        body: [
          "Several special poojas are performed during Diwali at Mathura's temples. The Lakshmi-Krishna Puja at Krishna Janmabhoomi is the most sought-after, where the deities are adorned in special Diwali finery and the temple is illuminated with thousands of lights. The Abhishek ceremony at Dwarkadhish Temple on Diwali morning is another powerful experience.",
          "Guruvayur Dham coordinates all Diwali pooja bookings at zero commission. Whether you want to book a Lakshmi Puja, an Abhishek, or an Annakoot offering, our team works directly with temple authorities to secure your slots. Contact us at least 2 weeks before Diwali to ensure availability, as these poojas are in high demand.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is Diwali 2026 in Mathura?",
        a: "Diwali 2026 is on November 8, 2026. Govardhan Puja is November 9, and Dev Deepawali on the Yamuna ghats is November 23 (Kartik Purnima). Book rooms for at least 3 nights to experience the full spectrum of celebrations.",
      },
      {
        q: "What is Dev Deepawali in Mathura?",
        a: "Dev Deepawali (Festival of Lights for the Gods) is celebrated on Kartik Purnima, 15 days after Diwali. Over 1,000 diyas are lit at Vishram Ghat on the Yamuna River. It's one of the most beautiful and spiritual sights in Mathura, far less crowded than the main Diwali night.",
      },
      {
        q: "What is Govardhan Puja?",
        a: "Govardhan Puja celebrates Krishna lifting the Govardhan Hill to protect villagers from rain. Temples prepare Annakoot (mountain of food) — hundreds of dishes offered to the deity. It's unique to the Braj region and a must-see if you're visiting the day after Diwali.",
      },
      {
        q: "Are firecrackers allowed during Diwali in Mathura?",
        a: "Mathura follows Supreme Court guidelines on firecrackers — only green crackers are permitted during specific hours (8-10 PM). Temple celebrations focus on diyas and lamps rather than firecrackers. The Yamuna ghat area is a no-cracker zone to protect the river ecosystem.",
      },
      {
        q: "Can I book Diwali pooja through Guruvayur Dham?",
        a: "Yes! We coordinate Lakshmi Puja, Abhishek, and Annakoot offerings at Krishna Janmabhoomi and Dwarkadhish temples. Book at least 2 weeks in advance. Zero commission — you pay only the official temple rate. WhatsApp +91-90908 20208.",
      },
    ],
    ctaHeadline: "Book Your Diwali Stay — Experience the Divine Festival of Lights",
  },

  {
    slug: "radhashtami",
    category: "festivals",
    navLabel: "Radhashtami",
    title: "Radhashtami in Mathura — Radha's Appearance Day Celebration & Guide",
    metaDescription:
      "Celebrate Radhashtami in Mathura & Vrindavan — Radha Rani's appearance day. Darshan timings, temple guide, pooja booking. Book rooms near Banke Bihari Temple.",
    heroImage:
      "https://images.unsplash.com/photo-1623691884827-ec241a91efed?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Festival Guide · August/September 2026",
    intro: [
      "Radhashtami commemorates the divine appearance day of Radha Rani, the eternal consort of Lord Krishna and the embodiment of pure devotional love. Celebrated 15 days after Krishna Janmashtami, Radhashtami holds immense spiritual significance in the Braj region, particularly in Barsana (Radha's birthplace) and Vrindavan (where Radha and Krishna's divine pastimes unfolded).",
      "Unlike the grand public celebrations of Janmashtami, Radhashtami is a more intimate and deeply devotional festival. The temples are adorned with flowers, the deities of Radha are dressed in special finery, and devotional songs praising Radha's qualities echo through the temple corridors. It is believed that Radha's blessings on this day can grant the highest form of spiritual liberation — pure love for Krishna.",
      "Guruvayur Dham provides a peaceful and comfortable base for your Radhashtami pilgrimage. From our location in Mathura, you can easily visit the Radha Rani Temple in Barsana (40 km) and the Banke Bihari Temple in Vrindavan (15 km), where the most significant Radhashtami celebrations take place. Our team can coordinate temple visits, pooja bookings, and transportation for a hassle-free spiritual journey.",
    ],
    sections: [
      {
        heading: "Radhashtami 2026 Date & Significance",
        body: [
          "Radhashtami 2026 is expected to be celebrated on September 10, 2026, falling on the Ashtami (8th day) of the Shukla Paksha (bright fortnight) in the Bhadrapada month. This is exactly 15 days after Janmashtami. On this day, devotees observe a fast until noon, take a ritual bath, and visit Radha temples to offer prayers and flowers.",
          "According to Braj tradition, Radha appeared in Barsana as the daughter of Vrishbhanu and Kirtida. The Radha Rani Temple in Barsana, built on the spot where she is believed to have appeared, is the most important pilgrimage site for Radhashtami. The celebration here includes a grand abhishek of the deity, followed by a procession through the village.",
        ],
      },
      {
        heading: "Where to Celebrate Radhashtami",
        body: [
          "Barsana (40 km from Mathura): The Radha Rani Temple (Ladli Lal Temple) hosts the most significant Radhashtami celebration. The deity is bathed with panchamrit (milk, curd, ghee, honey, and sugar), dressed in new clothes, and adorned with flower garlands. The temple is decorated with marigold and rose flowers, and devotional songs (bhajans) are sung throughout the day.",
          "Vrindavan (15 km from Mathura): The Banke Bihari Temple and the Radha Vallabh Temple host special Radhashtami celebrations. The deities are dressed in special white and gold outfits, and the temples are illuminated with decorative lights. The ISKCON temple in Vrindavan also hosts a grand celebration with kirtan and prasad distribution.",
          "Mathura: The Dwarkadhish Temple and Krishna Janmabhoomi observe Radhashtami with special aartis and abhishekams. The celebrations here are less crowded than Barsana and Vrindavan, making it a good option for families with elderly members or young children.",
        ],
      },
      {
        heading: "Radhashtami Pooja & Offerings",
        body: [
          "Devotees offer special items to Radha Rani on this day, including fresh flowers (especially roses and lotuses), chandan (sandalwood paste), new clothes, and sweets. The most auspicious offering is the Mahabhog — a grand feast of 56 dishes (Chappan Bhog) prepared and offered to the deity before being distributed as prasad.",
          "Guruvayur Dham can arrange Radhashtami pooja bookings at all major temples in the Braj region. Whether you want to sponsor a abhishek at the Radha Rani Temple in Barsana or offer a Chappan Bhog at Banke Bihari, our team coordinates everything at zero commission. Contact us at least 1 week before Radhashtami to ensure your pooja is scheduled.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is Radhashtami 2026?",
        a: "Radhashtami 2026 is expected on September 10, 2026 — 15 days after Janmashtami. It falls on the Ashtami of Shukla Paksha in Bhadrapada month. If you're visiting for Janmashtami, extending your stay for Radhashtami is highly recommended.",
      },
      {
        q: "Where is the best place to celebrate Radhashtami?",
        a: "The Radha Rani Temple in Barsana (40 km from Mathura) is the most significant. In Vrindavan, the Banke Bihari Temple and ISKCON temple host grand celebrations. Guruvayur Dham can arrange day trips to both locations.",
      },
      {
        q: "What should I offer to Radha Rani on Radhashtami?",
        a: "Fresh flowers (roses, lotuses), chandan (sandalwood), new clothes, and sweets are traditional offerings. The most auspicious is Chappan Bhog (56 dishes). Guruvayur Dham can arrange this offering at any major temple — WhatsApp +91-90908 20208.",
      },
      {
        q: "Is Radhashtami crowded?",
        a: "Radhashtami is significantly less crowded than Janmashtami, making it ideal for a more peaceful temple visit. However, Barsana and Vrindavan still see large gatherings. Visit temples early morning (before 9 AM) for the most peaceful darshan.",
      },
      {
        q: "Can I combine Janmashtami and Radhashtami trips?",
        a: "Absolutely! Since Radhashtami is 15 days after Janmashtami, you can book two short stays or one extended stay. Guruvayur Dham offers special rates for extended stays during the festival season. Contact us for details.",
      },
    ],
    ctaHeadline: "Book Your Radhashtami Stay — Experience Radha Rani's Divine Blessings",
  },

  {
    slug: "kartik-purnima",
    category: "festivals",
    navLabel: "Kartik Purnima",
    title: "Kartik Purnima in Mathura — Dev Deepawali, Yamuna Snan & Temple Guide",
    metaDescription:
      "Kartik Purnima in Mathura — Dev Deepawali on Yamuna ghats, sacred Yamuna bath, temple celebrations. Book rooms for the holiest full moon. Guide & pooja booking.",
    heroImage:
      "https://images.unsplash.com/photo-1605306691369-6c4c3c1c1a8e?w=1920&h=1080&fit=crop",
    jsonLdType: "Event",
    eyebrow: "Festival Guide · November 2026",
    intro: [
      "Kartik Purnima, the full moon night of the Kartik month, is considered the holiest day in the Hindu calendar for taking a sacred bath in the Yamuna River. In Mathura, this day is celebrated as Dev Deepawali — the festival of lights for the gods — where all the ghats along the Yamuna are illuminated with thousands of oil lamps, creating a celestial spectacle that mirrors the mythical city of the gods.",
      "According to Hindu mythology, Lord Krishna was especially fond of the Kartik month. It is believed that any religious act performed during this month — especially on Kartik Purnima — yields multiplied spiritual merit. Pilgrims from across India gather at Mathura's Vishram Ghat to take the sacred Yamuna Snan (holy bath) at dawn, followed by deep-daan (offering of lamps) at sunset.",
      "Guruvayur Dham offers the perfect location for your Kartik Purnima pilgrimage. Just minutes from Vishram Ghat, our pilgrim home allows you to easily participate in both the dawn sacred bath and the evening lamp offerings. We can arrange guided ghat visits, deep-daan ceremonies, and special Kartik Purnima poojas at nearby temples.",
    ],
    sections: [
      {
        heading: "Kartik Purnima 2026 Date & Significance",
        body: [
          "Kartik Purnima 2026 falls on November 23, 2026. It is the full moon day of the Kartik month (October-November), which is considered the holiest month in the Hindu calendar. According to tradition, Lord Shiva killed the demon Tripurasura on this day, and the gods celebrate by lighting lamps across the heavens — hence the name Dev Deepawali (Diwali of the gods).",
          "In Mathura, the day is especially significant because of the Yamuna River. It is believed that Yamuna, the daughter of the sun god Surya, grants special blessings to anyone who bathes in her waters on Kartik Purnima. The sacred bath is typically performed before sunrise, and devotees offer arghya (water oblation) to the sun god while standing in the river.",
        ],
      },
      {
        heading: "Dev Deepawali at Vishram Ghat",
        body: [
          "The highlight of Kartik Purnima in Mathura is the Dev Deepawali celebration at Vishram Ghat, the most sacred ghat on the Yamuna in Mathura. According to legend, Krishna rested (vishram) here after defeating the demon Kamsa. On Kartik Purnima evening, over 1,000 diyas (oil lamps) are placed along the steps of the ghat, creating a breathtaking golden pathway that reflects on the river's surface.",
          "The celebration begins at sunset with the lighting of the first lamp by the temple priest, followed by a grand Ganga Aarti — a fire ceremony performed with large multi-tiered oil lamps. Devotees release small leaf-boats with diyas into the river, symbolizing the carrying away of negative karma. The atmosphere is filled with the sound of conch shells, bells, and devotional hymns. Arrive by 5 PM to secure a good viewing spot, as the ghat gets very crowded by sunset.",
        ],
      },
      {
        heading: "Sacred Bath & Pooja Rituals",
        body: [
          "The sacred Yamuna Snan (holy bath) is performed before sunrise, ideally between 4:30 AM and 6:00 AM. Devotees bathe in the river wearing clean clothes, offer arghya to the sun god, and then visit the nearby temples for darshan. After the bath, it is customary to offer deep-daan — lighting a diya and floating it on the river — and to donate food, clothes, or money to the poor.",
          "Guruvayur Dham can arrange a guided Kartik Purnima experience that includes: early morning guided visit to Vishram Ghat for the sacred bath, deep-daan ceremony (we provide the diya and materials), special pooja at Krishna Janmabhoomi, and evening viewing of the Dev Deepawali lamp lighting. Contact us at least 1 week before Kartik Purnima to book this package.",
        ],
      },
    ],
    faqs: [
      {
        q: "When is Kartik Purnima 2026?",
        a: "Kartik Purnima 2026 is on November 23, 2026. The sacred bath is performed before sunrise (around 5 AM), and the Dev Deepawali lamp lighting takes place at sunset (around 5:30 PM). Book rooms for at least 1 night (Nov 22-23) to experience both.",
      },
      {
        q: "What is Dev Deepawali at Vishram Ghat?",
        a: "Dev Deepawali (Diwali of the Gods) is celebrated on Kartik Purnima at Vishram Ghat in Mathura. Over 1,000 oil lamps are lit along the ghat steps, followed by a grand aarti. It's one of the most visually stunning spiritual events in India.",
      },
      {
        q: "Is it safe to bathe in the Yamuna on Kartik Purnima?",
        a: "Yes, at Vishram Ghat the water is relatively clean and the steps make it easy to enter and exit safely. However, avoid deeper sections. We recommend going with a guide (Guruvayur Dham provides guided ghat visits). Wear lightweight clothes that you don't mind getting wet.",
      },
      {
        q: "What should I offer on Kartik Purnima?",
        a: "Traditional offerings include deep-daan (floating a diya on the river), arghya (water offered to the sun), food donation, and new clothes for the poor. Guruvayur Dham can arrange all offerings including the diya and materials — just WhatsApp +91-90908 20208.",
      },
      {
        q: "How is Kartik Purnima different from Diwali?",
        a: "Diwali (Nov 8, 2026) celebrates Krishna's defeat of Narakasura and the return of light. Kartik Purnima (Nov 23, 2026) celebrates the gods' own Diwali — it's 15 days after Diwali and focuses on the sacred Yamuna bath and Dev Deepawali lamp lighting. Both are significant but Kartik Purnima is more spiritually focused.",
      },
    ],
    ctaHeadline: "Book Your Kartik Purnima Stay — Witness the Divine Dev Deepawali",
  },

  // ════════════════════════════════════════════════════════════════════════
  // HOTELS NEAR PAGES (4)
  // ════════════════════════════════════════════════════════════════════════
  {
    slug: "hotels-near-banke-bihari-vrindavan",
    category: "hotels-near",
    navLabel: "Near Banke Bihari",
    title: "Hotels Near Banke Bihari Temple Vrindavan — Stay in Mathura (15 min away)",
    metaDescription:
      "Best hotels near Banke Bihari Temple Vrindavan. Guruvayur Dham in Mathura — 15 min away. Clean AC rooms, 24×7 hot water, free parking. Book now.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near Banke Bihari Temple",
    intro: [
      "The Banke Bihari Temple in Vrindavan is one of the most revered Krishna temples in India, attracting over 10 million devotees annually. Finding a clean, comfortable hotel near the temple can be challenging — Vrindavan's hotel infrastructure is limited, and rooms during peak season and festivals sell out weeks in advance. Many pilgrims end up in overpriced, poorly maintained guesthouses with no AC, unreliable hot water, and unsafe surroundings.",
      "Guruvayur Dham in Mathura offers a superior alternative: a well-maintained pilgrim home just 15 minutes' drive from Banke Bihari Temple. Located in Natwar Nagar near Mata Pathwari Mandir, our property provides clean AC and non-AC rooms with 24×7 hot water, free WiFi, complimentary breakfast, and secure parking — amenities that are rare in Vrindavan's temple-area guesthouses. Our rooms are professionally cleaned daily, and our 24-hour front desk ensures you always have support.",
      "Staying in Mathura rather than Vrindavan offers several advantages: better infrastructure (hospitals, ATMs, restaurants), lower room rates, easier access to Mathura Junction railway station (3 km), and proximity to other key pilgrimage sites like Krishna Janmabhoomi and Dwarkadhish Temple. Guruvayur Dham can arrange day trips to Vrindavan with a local driver, including visits to Banke Bihari, ISKCON, Prem Mandir, and other temples.",
    ],
    sections: [
      {
        heading: "Distance from Guruvayur Dham to Banke Bihari Temple",
        body: [
          "Banke Bihari Temple is approximately 15 km from Guruvayur Dham — a 20-25 minute drive via the Mathura-Vrindavan road. The route is straightforward and well-paved. During peak hours and festival seasons, travel time can increase to 35-40 minutes due to traffic. We recommend visiting the temple early morning (before 9 AM) or late afternoon (after 4 PM) to avoid both crowds and traffic.",
          "Guruvayur Dham can arrange a dedicated car and driver for your Vrindavan temple tour. Our drivers are familiar with the best drop-off points (the temple area is vehicle-restricted, so you'll be dropped at the nearest accessible point, a 3-minute walk from the temple entrance). Round-trip transportation including waiting time starts at ₹800.",
        ],
      },
      {
        heading: "Banke Bihari Temple Darshan Timings",
        body: [
          "The Banke Bihari Temple is unique among Krishna temples — the deity is believed to be so beautiful that prolonged darshan could overwhelm devotees, so the temple curtain is drawn every few minutes to 'give the Lord a rest.' This makes the darshan experience distinctive and deeply moving.",
          "Summer timings (April-October): Morning darshan 7:45 AM - 12:00 PM, Evening darshan 5:30 PM - 9:30 PM. Winter timings (November-March): Morning 8:00 AM - 1:00 PM, Evening 4:30 PM - 8:30 PM. The temple is closed in the afternoon. On weekends and festivals, expect long queues (1-2 hour wait). Mangala Aarti is held only on specific festival days and requires a special pass.",
        ],
      },
      {
        heading: "Why Stay in Mathura Instead of Vrindavan?",
        body: [
          "Better value: Mathura hotels are 30-40% cheaper than equivalent Vrindavan properties. A deluxe AC room that costs ₹2,200/night at Guruvayur Dham would cost ₹3,500+ in Vrindavan during peak season.",
          "Better amenities: Mathura has more modern infrastructure — hospitals, pharmacies, ATMs, restaurants, and shopping. Vrindavan's temple-area guesthouses often lack basic amenities like reliable WiFi and 24-hour hot water.",
          "Better connectivity: Mathura Junction railway station (3 km from Guruvayur Dham) has direct trains from Delhi, Agra, Mumbai, and Varanasi. Vrindavan's nearest station (Vrindavan Road) has limited train connectivity.",
          "Multi-temple access: Staying in Mathura gives you easy access to Krishna Janmabhoomi, Dwarkadhish Temple, and Vishram Ghat — all within 5 km. Vrindavan is 15 km away, and Gokul/Barsana are also accessible by road.",
        ],
      },
    ],
    faqs: [
      {
        q: "How far is Guruvayur Dham from Banke Bihari Temple?",
        a: "Guruvayur Dham is 15 km from Banke Bihari Temple — a 20-25 minute drive. We can arrange a car and driver for round-trip transportation including waiting time, starting at ₹800.",
      },
      {
        q: "Is it better to stay in Mathura or Vrindavan?",
        a: "Mathura offers better value (30-40% cheaper rooms), better amenities (hospitals, ATMs, restaurants), and better railway connectivity. Vrindavan is closer to the temple but has limited hotel infrastructure. Guruvayur Dham in Mathura is the ideal choice for most pilgrims.",
      },
      {
        q: "What are Banke Bihari Temple timings?",
        a: "Summer (Apr-Oct): 7:45 AM-12 PM, 5:30 PM-9:30 PM. Winter (Nov-Mar): 8 AM-1 PM, 4:30 PM-8:30 PM. Temple is closed in the afternoon. Visit early morning for the shortest queues.",
      },
      {
        q: "Can Guruvayur Dham arrange Vrindavan temple tours?",
        a: "Yes! We arrange day trips to Vrindavan covering Banke Bihari, ISKCON, Prem Mandir, and other temples. Includes car, driver, and local guide. Contact us at +91-90908 20208 for pricing and booking.",
      },
      {
        q: "Are there AC rooms available near Banke Bihari Temple?",
        a: "AC rooms in Vrindavan's temple area are rare and expensive. Guruvayur Dham in Mathura (15 min away) offers clean AC rooms starting at ₹1,500/night with 24×7 hot water, free WiFi, and free parking. Book early for festival season availability.",
      },
    ],
    ctaHeadline: "Book Your Stay Near Banke Bihari Temple — Clean Rooms, Great Rates",
  },

  {
    slug: "hotels-near-krishna-janmabhoomi",
    category: "hotels-near",
    navLabel: "Near Krishna Janmabhoomi",
    title: "Hotels Near Krishna Janmabhoomi Mathura — Stay 10 Minutes Away",
    metaDescription:
      "Best hotels near Krishna Janmabhoomi Mathura. Guruvayur Dham — 10 min from temple. AC rooms, 24×7 hot water, free parking. Book direct & save.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near Krishna Janmabhoomi",
    intro: [
      "The Krishna Janmabhoomi Temple in Mathura marks the exact birthplace of Lord Krishna — one of the most sacred sites in Hinduism. Millions of devotees visit each year to pay homage at the prison cell where Devaki gave birth to Krishna over 5,000 years ago. Finding a clean, comfortable hotel near the temple is essential for pilgrims who want to attend early morning aartis and multiple darshans throughout the day.",
      "Guruvayur Dham is located just 10 minutes' drive from Krishna Janmabhoomi, in Natwar Nagar near Mata Pathwari Mandir. This strategic location allows you to easily attend the temple's morning Mangala Aarti (5:00 AM) and return for the evening Sandhya Aarti without any logistical stress. Unlike the crowded hotels in the immediate temple vicinity, our neighborhood is quiet and residential — perfect for restful sleep between temple visits.",
      "Our pilgrim home offers rooms for every budget: non-AC budget rooms at ₹700/night, standard AC rooms at ₹1,500/night, deluxe AC rooms at ₹2,200/night, and family suites at ₹3,500/night. All rooms include 24×7 hot water, free WiFi, daily housekeeping, and complimentary chai. Our front desk is available 24 hours to assist with temple visit planning, pooja bookings, and local transportation.",
    ],
    sections: [
      {
        heading: "Krishna Janmabhoomi Temple Guide",
        body: [
          "The Krishna Janmabhoomi complex encompasses the main temple, the birthplace prison cell (Garbha Griha), and several smaller shrines. The temple is heavily secured due to its historical significance, and visitors must pass through security checks and metal detectors. Electronic devices, cameras, and bags are not allowed inside — secure lockers are available free of charge at the entrance.",
          "Darshan timings: Summer (April-October) 5:00 AM - 12:00 PM and 4:00 PM - 9:30 PM. Winter (November-March) 5:30 AM - 12:00 PM and 3:30 PM - 8:30 PM. The Mangala Aarti at 5:00 AM (summer) / 5:30 AM (winter) is the most auspicious darshan — the deity is fresh from the night's rest, and the atmosphere is serene and deeply spiritual. Rajbhog Aarti at noon and Sandhya Aarti at sunset are also significant.",
        ],
      },
      {
        heading: "What to Expect at Krishna Janmabhoomi",
        body: [
          "Security: The temple has airport-level security. Carry only essentials (wallet, keys). Leave phones, cameras, bags, and leather items at your hotel or in the free lockers. Dress modestly — men should wear dhoti/kurta or pants and shirt (no shorts). Women should wear saree, salwar kameez, or modest dress. Head covering is recommended.",
          "Best time to visit: Early morning (5:00-7:00 AM) for Mangala Aarti — least crowded and most spiritual. Weekdays are less crowded than weekends. Avoid major festivals (Janmashtami, Holi) unless you're prepared for massive crowds (2+ hour wait times). Guruvayur Dham staff can advise on the best visiting times based on current conditions.",
          "Photography: Strictly prohibited inside the temple complex. You can take photos outside the main gate area. There are official photographers near the entrance who can take your photo with the temple in the background for a small fee.",
        ],
      },
      {
        heading: "Other Temples Near Krishna Janmabhoomi",
        body: [
          "Dwarkadhish Temple (2 km): A magnificent temple dedicated to Krishna in his 'King of Dwarka' form. Known for its intricate architecture and vibrant Holi celebrations. Darshan: 6:30-10:30 AM, 4:00-7:00 PM.",
          "Vishram Ghat (1.5 km): The most sacred ghat on the Yamuna in Mathura, where Krishna rested after defeating Kamsa. Visit at sunrise for the sacred bath or at sunset for the beautiful Yamuna Aarti.",
          "Geeta Mandir (3 km): A modern temple with inscriptions of the entire Bhagavad Gita on its walls. Peaceful and less crowded than Janmabhoomi.",
          "Guruvayur Dham can arrange a guided temple tour covering all these sites in half a day, including transportation and a knowledgeable local guide.",
        ],
      },
    ],
    faqs: [
      {
        q: "How far is Guruvayur Dham from Krishna Janmabhoomi?",
        a: "Guruvayur Dham is approximately 3 km (10 minutes' drive) from Krishna Janmabhoomi Temple. Auto-rickshaws cost ₹50-80 one way. We can also arrange complimentary pickup from the temple area for our guests.",
      },
      {
        q: "What are Krishna Janmabhoomi darshan timings?",
        a: "Summer (Apr-Oct): 5:00 AM-12 PM, 4:00 PM-9:30 PM. Winter (Nov-Mar): 5:30 AM-12 PM, 3:30 PM-8:30 PM. Mangala Aarti at opening time is the most auspicious and least crowded darshan.",
      },
      {
        q: "Can I take my phone/camera inside Krishna Janmabhoomi?",
        a: "No. Electronic devices, cameras, bags, and leather items are strictly prohibited. Free lockers are available at the entrance. We recommend leaving valuables at Guruvayur Dham and carrying only your wallet and keys.",
      },
      {
        q: "What is the dress code for Krishna Janmabhoomi?",
        a: "Men: dhoti/kurta or pants and shirt (no shorts, no sleeveless). Women: saree, salwar kameez, or modest dress. Head covering recommended. Remove footwear before entering. No leather items (belt, wallet, bag) inside sanctum.",
      },
      {
        q: "How much time should I allocate for Krishna Janmabhoomi visit?",
        a: "On a normal day, 1-2 hours including security checks, darshan, and prasad. During festivals or weekends, 2-3 hours due to longer queues. Visit early morning (5-7 AM) for the fastest darshan experience.",
      },
    ],
    ctaHeadline: "Book Your Stay Near Krishna Janmabhoomi — 10 Minutes from the Temple",
  },

  {
    slug: "hotels-near-dwarkadhish-temple",
    category: "hotels-near",
    navLabel: "Near Dwarkadhish",
    title: "Hotels Near Dwarkadhish Temple Mathura — Stay 8 Minutes Away",
    metaDescription:
      "Best hotels near Dwarkadhish Temple Mathura. Guruvayur Dham — 8 min away. AC rooms from ₹1,500/night, 24×7 hot water, free parking. Book direct.",
    heroImage:
      "https://images.unsplash.com/photo-1623691884827-ec241a91efed?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near Dwarkadhish Temple",
    intro: [
      "The Dwarkadhish Temple in Mathura is one of the most magnificent and historically significant Krishna temples in India. Built in 1814 by Seth Gokul Das Parikh, the temple showcases stunning Rajasthani architecture with intricate carvings, ornate pillars, and a towering shikhara. Dedicated to Krishna in his form as the 'King of Dwarka,' the temple is especially famous for its grand Holi celebrations and daily aartis that draw hundreds of devotees.",
      "Guruvayur Dham is located just 8 minutes' drive from the Dwarkadhish Temple, making it the ideal accommodation for pilgrims who want to attend the temple's morning Mangala Aarti and evening Sandhya Aarti without staying in the crowded and noisy temple-area hotels. Our quiet residential neighborhood in Natwar Nagar provides a peaceful retreat between temple visits, with clean rooms, 24×7 hot water, and home-cooked vegetarian meals available on request.",
      "Unlike the guesthouses immediately surrounding the temple (which can be noisy, cramped, and lack basic amenities), Guruvayur Dham offers a professional hotel experience at pilgrim-friendly prices. Our rooms are sanitized daily, our staff speaks Hindi and English, and our 24-hour front desk can assist with temple visit planning, pooja bookings, and local transportation. We also offer free covered parking for 25+ vehicles — a rare amenity in the temple area.",
    ],
    sections: [
      {
        heading: "Dwarkadhish Temple Darshan Timings & Aarti Schedule",
        body: [
          "The Dwarkadhish Temple follows a structured darshan schedule with specific times for different aartis and ceremonies. Morning darshan: 6:30 AM - 10:30 AM (Mangala Aarti at 6:30 AM, Shringar Darshan at 8:30 AM). The temple closes from 10:30 AM to 4:00 PM. Evening darshan: 4:00 PM - 7:00 PM (Sandhya Aarti at 7:00 PM in summer, 6:30 PM in winter).",
          "The most popular darshan is the Shringar Darshan at 8:30 AM, when the deity is dressed in elaborate costumes and adorned with fresh flower garlands. The temple is known for changing the deity's dress multiple times a day, each representing a different pastime of Krishna. During Holi, the temple hosts a grand celebration where devotees play colors with the deity — a unique experience not found at other Krishna temples.",
        ],
      },
      {
        heading: "What Makes Dwarkadhish Temple Special",
        body: [
          "Architecture: The temple's Rajasthani-style architecture features intricately carved pillars, a grand entrance gateway, and a 5-story shikhara (spire). The main hall (Sabha Mandap) can accommodate over 500 devotees. The walls are adorned with paintings depicting Krishna's pastimes.",
          "Festivals: The temple is renowned for its Holi celebrations, which span a full week (Holi Utsav). The deity is brought out in a special procession (Shobha Yatra) through the streets of Mathura. Other major festivals include Janmashtami, Radhashtami, and Diwali — each with unique celebrations.",
          "Annakoot: The day after Diwali (Govardhan Puja), the temple prepares a mountain of 56 dishes (Chappan Bhog) offered to the deity. This is one of the most spectacular events to witness — the entire main hall is filled with food offerings arranged in a mountain shape.",
        ],
      },
      {
        heading: "Getting to Dwarkadhish Temple from Guruvayur Dham",
        body: [
          "The temple is approximately 2.5 km from Guruvayur Dham — an 8-minute drive or 25-minute walk. Auto-rickshaws are readily available for ₹50-70 one way. For early morning aarti (6:30 AM), we recommend booking an auto the previous evening or asking our front desk to arrange one.",
          "During festivals and peak season, the area around the temple is vehicle-restricted. You'll need to walk the last 200 meters from the nearest vehicle drop point. Wear comfortable shoes and carry minimal belongings — the temple requires you to leave shoes and bags outside (shoe stands are available for ₹5-10 per pair).",
        ],
      },
    ],
    faqs: [
      {
        q: "How far is Guruvayur Dham from Dwarkadhish Temple?",
        a: "Guruvayur Dham is 2.5 km (8 minutes' drive) from Dwarkadhish Temple. Auto-rickshaws cost ₹50-70 one way. Walking takes about 25 minutes through the market area.",
      },
      {
        q: "What are Dwarkadhish Temple timings?",
        a: "Morning: 6:30 AM - 10:30 AM (Mangala Aarti 6:30 AM, Shringar Darshan 8:30 AM). Evening: 4:00 PM - 7:00 PM (Sandhya Aarti at sunset). Temple is closed 10:30 AM - 4:00 PM.",
      },
      {
        q: "When is the best time to visit Dwarkadhish Temple?",
        a: "For the most spiritual experience, attend the 6:30 AM Mangala Aarti. For the most visually spectacular darshan, visit at 8:30 AM for Shringar Darshan (deity in elaborate dress). During Holi week, the temple hosts unique celebrations not found elsewhere.",
      },
      {
        q: "Is photography allowed in Dwarkadhish Temple?",
        a: "Photography is prohibited inside the main sanctum but allowed in the courtyard and exterior areas. There are official photographers outside the temple who can take your photo for a small fee. Leave valuable cameras at your hotel.",
      },
      {
        q: "Can I book Dwarkadhish Temple pooja through Guruvayur Dham?",
        a: "Yes! We coordinate Mangala Aarti sponsorship, Abhishek, and Annakoot offerings at Dwarkadhish Temple. Zero commission — you pay only the official temple rate. WhatsApp +91-90908 20208 at least 1 week before your visit.",
      },
    ],
    ctaHeadline: "Book Your Stay Near Dwarkadhish Temple — 8 Minutes Away",
  },

  {
    slug: "hotels-near-mata-pathwari-mandir",
    category: "hotels-near",
    navLabel: "Near Mata Pathwari",
    title: "Hotels Near Mata Pathwari Mandir Mathura — Stay Right Next Door",
    metaDescription:
      "Stay at Guruvayur Dham — directly opposite Mata Pathwari Mandir, Mathura. Clean AC rooms from ₹700/night. 24×7 hot water, free parking, on-site pooja booking.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Hotels Near Mata Pathwari Mandir",
    intro: [
      "Mata Pathwari Mandir is a revered local temple in Natwar Nagar, Mathura, dedicated to the Divine Mother. While less internationally known than Krishna Janmabhoomi or Dwarkadhish, this temple holds deep significance for local devotees and is known for fulfilling the prayers of those seeking blessings for health, prosperity, and family well-being. The temple's intimate, community-focused atmosphere offers a more personal spiritual experience compared to the larger, more crowded temples.",
      "Guruvayur Dham is located directly opposite Mata Pathwari Mandir — quite literally across the road. This means you can step out of your room and be at the temple entrance in under a minute. The temple's morning aarti (5:30 AM) and evening aarti (7:00 PM) are beautiful, community-centered ceremonies that you can attend without any travel time or logistics. Many of our guests appreciate being able to participate in the temple's daily rhythms without disrupting their rest.",
      "Staying next to Mata Pathwari Mandir also places you in a quiet, residential neighborhood away from the tourist crowds. The area has local markets, pure-veg restaurants, and easy access to auto-rickshaws for visiting the more famous temples. Guruvayur Dham offers clean, comfortable rooms with all modern amenities — AC, 24×7 hot water, free WiFi, daily housekeeping — at budget-friendly prices starting at ₹700/night.",
    ],
    sections: [
      {
        heading: "About Mata Pathwari Mandir",
        body: [
          "Mata Pathwari Mandir is a locally cherished temple that has served the Natwar Nagar community for decades. The temple's presiding deity is the Divine Mother in her benevolent form, and devotees visit throughout the day to offer prayers, light diyas, and seek blessings. The temple is especially popular among local families for ceremonies like mundan (head-shaving ceremony for children), griha pravesh (housewelling), and navratra celebrations.",
          "The temple is open daily from 5:00 AM to 9:00 PM. The morning Mangala Aarti at 5:30 AM and the evening Sandhya Aarti at 7:00 PM are the most auspicious times to visit. During Navratri (twice a year, in spring and autumn), the temple hosts special celebrations with kirtan, bhog, and extended darshan hours. The temple also hosts a free community kitchen (bhandara) on specific festival days.",
        ],
      },
      {
        heading: "Advantages of Staying Near Mata Pathwari Mandir",
        body: [
          "Zero travel time: The temple is across the road from Guruvayur Dham. You can attend aarti in your room clothes and be back in 2 minutes. This is especially valuable for elderly pilgrims and families with young children.",
          "Quiet neighborhood: Unlike the crowded areas around Krishna Janmabhoomi or Dwarkadhish, Natwar Nagar is a peaceful residential area. You'll get restful sleep without the noise of traffic, loudspeakers, or late-night crowds.",
          "Local amenities: The area has pure-veg restaurants, grocery stores, pharmacies, and ATMs within walking distance. The local markets offer authentic Mathura peda, textiles, and religious items at fair (non-tourist) prices.",
          "Easy access to major temples: Krishna Janmabhoomi (3 km), Dwarkadhish Temple (2.5 km), and Vishram Ghat (2 km) are all within a 10-minute auto-rickshaw ride. Vrindavan is 15 km away.",
        ],
      },
      {
        heading: "Room Options at Guruvayur Dham",
        body: [
          "Non-AC Budget Room (₹700/night): Double bed, ceiling fan, attached bathroom with hot water, WiFi. Ideal for budget pilgrims and backpackers.",
          "Standard AC Room (₹1,500/night): Queen bed, AC, attached bathroom, TV, WiFi. Most popular option for couples and solo pilgrims.",
          "Deluxe AC Room (₹2,200/night): King bed, premium linen, mini-fridge, study desk, AC, TV, WiFi. Perfect for those wanting extra comfort.",
          "Family Suite AC (₹3,500/night): 2 bedrooms, living area, AC, accommodates up to 5 guests. Ideal for families and groups.",
          "All rooms include daily housekeeping, 24×7 hot water, free WiFi, complimentary morning chai, and free parking. Book directly for the best rates — no booking fees.",
        ],
      },
    ],
    faqs: [
      {
        q: "How close is Guruvayur Dham to Mata Pathwari Mandir?",
        a: "Guruvayur Dham is directly opposite Mata Pathwari Mandir — less than a 1-minute walk across the road. You can attend aarti and be back in your room in under 2 minutes.",
      },
      {
        q: "What are Mata Pathwari Mandir timings?",
        a: "The temple is open daily 5:00 AM - 9:00 PM. Morning Mangala Aarti at 5:30 AM, evening Sandhya Aarti at 7:00 PM. During Navratri, the temple has extended hours and special celebrations.",
      },
      {
        q: "Is the area around Mata Pathwari Mandir safe?",
        a: "Yes, Natwar Nagar is a quiet, residential neighborhood — much safer and more peaceful than the crowded areas around the main temples. The area has good street lighting, local shops, and is walkable at all hours.",
      },
      {
        q: "Can I walk to Krishna Janmabhoomi from Guruvayur Dham?",
        a: "Krishna Janmabhoomi is 3 km away — a 35-40 minute walk through the market area. Most guests prefer an auto-rickshaw (₹50-80, 10 minutes). Dwarkadhish Temple is 2.5 km and Vishram Ghat is 2 km away.",
      },
      {
        q: "Are there restaurants near Mata Pathwari Mandir?",
        a: "Yes, there are several pure-veg restaurants within walking distance of Guruvayur Dham. We also offer in-room meal delivery from our partner restaurants (South Indian thali, North Indian meals, filter coffee). Ask our front desk for recommendations.",
      },
    ],
    ctaHeadline: "Book Your Stay Opposite Mata Pathwari Mandir — Steps from the Temple",
  },

  // ════════════════════════════════════════════════════════════════════════
  // DARSHAN TIMING PAGES (4)
  // ════════════════════════════════════════════════════════════════════════
  {
    slug: "krishna-janmabhoomi-darshan-timings",
    category: "darshan-timings",
    navLabel: "Krishna Janmabhoomi Timings",
    title: "Krishna Janmabhoomi Darshan Timings 2026 — Aarti Schedule & Guide",
    metaDescription:
      "Complete Krishna Janmabhoomi darshan timings 2026. Mangala Aarti, Rajbhog, Sandhya Aarti schedule. Entry fee, dress code, security guide. Plan your visit.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Darshan Timing Guide",
    intro: [
      "The Krishna Janmabhoomi Temple in Mathura is built on the exact site where Lord Krishna was born over 5,000 years ago. It is one of the most sacred pilgrimage sites in Hinduism, attracting millions of devotees each year. Knowing the correct darshan timings is essential for planning your visit — the temple has specific windows for different aartis and ceremonies, and the schedule changes seasonally.",
      "This guide provides the most up-to-date Krishna Janmabhoomi darshan timings for 2026, including the Mangala Aarti (early morning), Shringar Darshan (morning decoration), Rajbhog Aarti (noon offering), and Sandhya Aarti (evening). We also cover entry requirements, dress code, security procedures, and tips for the best darshan experience.",
      "Guruvayur Dham, located just 3 km (10 minutes) from Krishna Janmabhoomi, is the ideal accommodation for pilgrims planning multiple temple visits. Our proximity allows you to attend the early morning Mangala Aarti (5:00 AM) and return for a restful break before the evening Sandhya Aarti — something that's difficult when staying in hotels farther away.",
    ],
    sections: [
      {
        heading: "Krishna Janmabhoomi Darshan Timings 2026",
        body: [
          "Summer Schedule (April to October): Mangala Aarti & Temple Opening: 5:00 AM. General Darshan: 5:30 AM - 12:00 PM. Rajbhog Aarti: 12:00 PM - 12:30 PM (temple closes for 30 min). Afternoon Darshan: 12:30 PM - 1:00 PM (brief). Temple Closed: 1:00 PM - 4:00 PM. Evening Darshan: 4:00 PM - 9:30 PM. Sandhya Aarti: 7:00 PM (summer). Temple Closes: 9:30 PM.",
          "Winter Schedule (November to March): Mangala Aarti & Temple Opening: 5:30 AM. General Darshan: 6:00 AM - 12:00 PM. Temple Closed: 12:30 PM - 3:30 PM. Evening Darshan: 3:30 PM - 8:30 PM. Sandhya Aarti: 6:30 PM (winter). Temple Closes: 8:30 PM. Note: Winter mornings can be foggy in December-January, which may delay the opening by 15-30 minutes.",
        ],
      },
      {
        heading: "Best Time for Darshan (Least Crowded)",
        body: [
          "Early Morning (5:00-6:30 AM): The best time for a peaceful darshan. The Mangala Aarti at 5:00 AM (summer) or 5:30 AM (winter) is the most spiritual experience — the deity is fresh from the night's rest, the atmosphere is serene, and crowds are minimal. You can get close to the sanctum and spend several minutes in darshan. Arrive 15 minutes before aarti to find a good spot.",
          "Late Morning (10:30-11:45 AM): The second-best window. Most devotees have already completed their darshan by 10 AM, so the crowd thins out. This is a good time for families with children or elderly members who can't wake up early.",
          "Avoid: Weekends (Saturday-Sunday) see 2-3x the normal crowd. Festival days (Janmashtami, Holi, Diwali) see massive crowds with 2+ hour wait times. Public holidays and school vacation periods are also very crowded. If you must visit during these times, arrive at least 1 hour before the temple opens.",
        ],
      },
      {
        heading: "Entry Requirements & Security",
        body: [
          "Entry fee: Free. No ticket required for general darshan. Special darshan passes (for closer access) are available for ₹50-100 at the temple counter, but these are not always necessary — general darshan provides a perfectly good view.",
          "Security: The temple has airport-level security. You must pass through metal detectors and bag scanning. Prohibited items: mobile phones, cameras, electronic devices, leather items (bags, wallets, belts), matches, lighters, sharp objects. Free lockers are available at the entrance — leave your valuables there.",
          "Dress code: Men should wear dhoti/kurta or pants and shirt (no shorts, no sleeveless). Women should wear saree, salwar kameez, or modest dress. Head covering is recommended. Remove footwear before entering the temple complex (shoe stands available for ₹5-10).",
        ],
      },
    ],
    faqs: [
      {
        q: "What are Krishna Janmabhoomi morning timings?",
        a: "Summer (Apr-Oct): Temple opens 5:00 AM, Mangala Aarti 5:00 AM, darshan until 12:00 PM. Winter (Nov-Mar): Temple opens 5:30 AM, Mangala Aarti 5:30 AM, darshan until 12:00 PM. The 5:00 AM Mangala Aarti is the most auspicious and peaceful darshan.",
      },
      {
        q: "What are Krishna Janmabhoomi evening timings?",
        a: "Summer: 4:00 PM - 9:30 PM, Sandhya Aarti at 7:00 PM. Winter: 3:30 PM - 8:30 PM, Sandhya Aarti at 6:30 PM. The temple is closed in the afternoon (1:00-4:00 PM summer, 12:30-3:30 PM winter).",
      },
      {
        q: "Is there an entry fee for Krishna Janmabhoomi?",
        a: "No, entry is free for general darshan. Special darshan passes (for closer access) are available for ₹50-100 but are not required — general darshan provides a good view. There is no VIP darshan system.",
      },
      {
        q: "Can I take my phone inside Krishna Janmabhoomi?",
        a: "No. Mobile phones, cameras, and all electronic devices are strictly prohibited. Free lockers are available at the entrance. We recommend leaving valuables at your hotel and carrying only your wallet and keys.",
      },
      {
        q: "How much time should I plan for Krishna Janmabhoomi visit?",
        a: "On a weekday morning: 45-60 minutes (including security, darshan, prasad). On weekends: 1.5-2 hours. During festivals: 2-3 hours due to long queues. Visit at 5:00 AM for the fastest, most peaceful experience.",
      },
    ],
    ctaHeadline: "Stay 10 Minutes from Krishna Janmabhoomi — Book Your Room",
  },

  {
    slug: "banke-bihari-darshan-timings",
    category: "darshan-timings",
    navLabel: "Banke Bihari Timings",
    title: "Banke Bihari Temple Darshan Timings 2026 — Vrindavan Aarti Schedule",
    metaDescription:
      "Complete Banke Bihari Temple Vrindavan darshan timings 2026. Mangala Aarti, Shringar, Sandhya Aarti schedule. Best time to visit, crowd guide, tips.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Darshan Timing Guide",
    intro: [
      "The Banke Bihari Temple in Vrindavan is one of the most beloved Krishna temples in India, known for its unique darshan tradition where the curtain is drawn every few minutes to 'give the Lord a rest' — a practice based on the belief that the deity's beauty is so overwhelming that devotees could lose consciousness from prolonged viewing. This distinctive tradition makes visiting Banke Bihari a deeply moving and unforgettable experience.",
      "Understanding the Banke Bihari darshan timings is crucial for planning your visit. The temple has specific windows for different ceremonies, and the schedule changes seasonally. The temple is also closed for several hours in the afternoon, which catches many pilgrims by surprise. This guide provides the complete 2026 timing schedule, along with tips for the best darshan experience and how to avoid the massive crowds that gather here daily.",
      "Guruvayur Dham in Mathura (15 km / 20 minutes from Banke Bihari) is the ideal base for your Vrindavan temple visit. We can arrange transportation, guide you on the best visiting times, and provide a comfortable room to rest before and after your temple visit. Many of our guests visit Banke Bihari early morning, return for breakfast and rest, then visit other Vrindavan temples (ISKCON, Prem Mandir) in the afternoon.",
    ],
    sections: [
      {
        heading: "Banke Bihari Darshan Timings 2026",
        body: [
          "Summer Schedule (April to October): Morning Darshan: 7:45 AM - 12:00 PM. Shringar Aarti: 8:30 AM (deity dressed in new clothes). Temple Closed: 12:00 PM - 5:30 PM. Evening Darshan: 5:30 PM - 9:30 PM. Sandhya Aarti: 7:00 PM (summer). Temple Closes: 9:30 PM.",
          "Winter Schedule (November to March): Morning Darshan: 8:00 AM - 1:00 PM. Shringar Aarti: 9:00 AM. Temple Closed: 1:00 PM - 4:30 PM. Evening Darshan: 4:30 PM - 8:30 PM. Sandhya Aarti: 6:00 PM (winter). Temple Closes: 8:30 PM.",
          "Note: The famous Mangala Aarti is NOT held daily — it is performed only on specific festival days (Janmashtami, Radhashtami, Akshaya Tritiya, and a few others). On these days, the temple opens as early as 4:00 AM, and special passes are required. Regular visitors cannot attend Mangala Aarti.",
        ],
      },
      {
        heading: "The Unique Curtain Tradition",
        body: [
          "Unlike other Krishna temples where the deity is visible continuously, at Banke Bihari the curtain (parda) is drawn every few minutes. The priest pulls the curtain closed, waits a moment, then opens it again. This practice, unique to Banke Bihari, is based on the belief that the deity's beauty is so captivating that devotees could faint or become emotionally overwhelmed. The brief pauses allow devotees to 'recover' before the next darshan.",
          "This means your darshan happens in short, intense bursts rather than a continuous view. When the curtain opens, the atmosphere fills with the sound of devotees calling out 'Radhe Radhe!' and 'Banke Bihari Lal ki Jai!' The experience is electric and deeply moving. Each curtain opening lasts about 30-60 seconds before it's drawn again for 30-45 seconds.",
          "During peak hours, the temple gets very crowded and the curtain is drawn more frequently to manage the flow. For a more relaxed experience with longer darshan windows, visit during the first hour after opening (7:45-8:45 AM summer, 8:00-9:00 AM winter) or the last hour before closing.",
        ],
      },
      {
        heading: "Tips for Visiting Banke Bihari Temple",
        body: [
          "Best time to visit: Weekday mornings (7:45-9:00 AM) for the shortest queues and most peaceful darshan. Avoid weekends, when wait times can exceed 2 hours. During festivals (Janmashtami, Holi), the temple is so crowded that darshan is nearly impossible without a special pass.",
          "What to wear: Dress modestly. Men: dhoti/kurta or pants and shirt (no shorts). Women: saree or salwar kameez. Remove shoes at the designated shoe stand (₹5-10 per pair). Head covering is appreciated but not mandatory.",
          "What not to bring: Cameras and mobile phones are not allowed inside the temple. Leave them at your hotel or in the free lockers near the entrance. Bags are also not permitted — carry only your wallet and keys. Leather items (wallets, belts) are generally allowed at Banke Bihari (unlike Krishna Janmabhoomi) but check at the security counter.",
          "Prasad: Don't forget to collect prasad on your way out. The temple distributes free prasad (sweets) after each aarti. There are also shops outside the temple where you can buy additional prasad and souvenirs.",
        ],
      },
    ],
    faqs: [
      {
        q: "What are Banke Bihari morning darshan timings?",
        a: "Summer (Apr-Oct): 7:45 AM - 12:00 PM. Winter (Nov-Mar): 8:00 AM - 1:00 PM. Shringar Aarti (when the deity is dressed in new clothes) is at 8:30 AM (summer) / 9:00 AM (winter). Visit in the first hour for the shortest queues.",
      },
      {
        q: "What are Banke Bihari evening darshan timings?",
        a: "Summer: 5:30 PM - 9:30 PM, Sandhya Aarti at 7:00 PM. Winter: 4:30 PM - 8:30 PM, Sandhya Aarti at 6:00 PM. The temple is closed in the afternoon (12:00-5:30 PM summer, 1:00-4:30 PM winter).",
      },
      {
        q: "Why is the curtain drawn at Banke Bihari Temple?",
        a: "The curtain (parda) is drawn every few minutes because the deity's beauty is believed to be so overwhelming that devotees could faint. The brief pauses allow devotees to 'recover' before the next darshan. This unique tradition is only found at Banke Bihari.",
      },
      {
        q: "Can I attend Mangala Aarti at Banke Bihari?",
        a: "Mangala Aarti is NOT held daily — only on specific festival days (Janmashtami, Radhashtami, Akshaya Tritiya). On these days, the temple opens at 4:00 AM and special passes are required. Regular visitors cannot attend without a pass.",
      },
      {
        q: "How far is Banke Bihari from Mathura?",
        a: "Banke Bihari Temple is 15 km (20-25 min drive) from Mathura. Guruvayur Dham can arrange round-trip transportation including waiting time, starting at ₹800. Auto-rickshaws cost ₹200-300 one way. Visit early morning to avoid traffic and crowds.",
      },
    ],
    ctaHeadline: "Stay 20 Minutes from Banke Bihari — Book Your Room at Guruvayur Dham",
  },

  {
    slug: "dwarkadhish-temple-timings",
    category: "darshan-timings",
    navLabel: "Dwarkadhish Timings",
    title: "Dwarkadhish Temple Mathura Timings 2026 — Darshan & Aarti Schedule",
    metaDescription:
      "Complete Dwarkadhish Temple Mathura darshan timings 2026. Mangala Aarti, Shringar, Sandhya Aarti schedule. Best visiting time, entry guide, pooja booking.",
    heroImage:
      "https://images.unsplash.com/photo-1623691884827-ec241a91efed?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Darshan Timing Guide",
    intro: [
      "The Dwarkadhish Temple in Mathura is one of the most architecturally magnificent and spiritually significant Krishna temples in the Braj region. Built in 1814, the temple is renowned for its stunning Rajasthani architecture, intricate carvings, and the unique tradition of dressing the deity in multiple elaborate costumes throughout the day. Understanding the Dwarkadhish Temple timings is essential for planning your visit and experiencing the different darshans.",
      "Unlike some temples that have continuous darshan, the Dwarkadhish Temple follows a structured schedule with specific times for different aartis and ceremonies. The most popular darshan is the Shringar Darshan at 8:30 AM, when the deity is adorned in elaborate costumes and fresh flower garlands. The temple is also famous for its grand Holi celebrations, which span a full week and are among the most vibrant in Mathura.",
      "Guruvayur Dham is located just 2.5 km (8 minutes' drive) from the Dwarkadhish Temple, making it the perfect base for attending both the morning Mangala Aarti and the evening Sandhya Aarti. Our proximity means you can return to your room between darshans for rest, meals, or a change of clothes — a luxury that pilgrims staying farther away don't have.",
    ],
    sections: [
      {
        heading: "Dwarkadhish Temple Darshan Timings 2026",
        body: [
          "Summer Schedule (April to October): Mangala Aarti: 6:30 AM. Shringar Darshan: 8:30 AM (deity in elaborate dress). General Morning Darshan: 6:30 AM - 10:30 AM. Temple Closed: 10:30 AM - 4:00 PM. Evening Darshan: 4:00 PM - 7:00 PM. Sandhya Aarti: 7:00 PM (summer). Temple Closes: 7:00 PM (after Sandhya Aarti).",
          "Winter Schedule (November to March): Mangala Aarti: 7:00 AM. Shringar Darshan: 8:30 AM. General Morning Darshan: 7:00 AM - 10:30 AM. Temple Closed: 10:30 AM - 3:30 PM. Evening Darshan: 3:30 PM - 6:30 PM. Sandhya Aarti: 6:30 PM (winter). Temple Closes: 6:30 PM.",
          "Note: The Dwarkadhish Temple closes relatively early (7:00 PM summer, 6:30 PM winter) compared to other Mathura temples. Plan your evening visit accordingly. The temple does not have a late-night darshan window.",
        ],
      },
      {
        heading: "Special Darshans & Ceremonies",
        body: [
          "Shringar Darshan (8:30 AM daily): The most visually spectacular darshan. The deity is dressed in elaborate costumes — different each day — representing different pastimes of Krishna. The dress changes include royal attire, bridal wear for Radha-Krishna, and festival-specific costumes. The Shringar takes about 30 minutes, during which the curtain is drawn. After Shringar, the deity is revealed in the new outfit.",
          "Rajbhog Aarti (12:00 PM): The noon offering when a grand meal (bhog) of 56 dishes is offered to the deity. The temple closes briefly during this time. If you're present, you can witness the aarti from a distance. The bhog is later distributed as prasad.",
          "Sandhya Aarti (7:00 PM summer / 6:30 PM winter): The evening aarti is a beautiful ceremony with large oil lamps, conch shells, and devotional singing. The temple closes after this aarti. Arrive 30 minutes early to get a good spot, as the aarti hall gets crowded.",
          "Holi Utsav (March): The temple's most famous celebration, spanning a full week. The deity is brought out in a procession (Shobha Yatra), and devotees play colors with the deity. If you're visiting during Holi, this is a once-in-a-lifetime experience.",
        ],
      },
      {
        heading: "Visiting Tips & Logistics",
        body: [
          "Best time to visit: For Shringar Darshan, arrive by 8:15 AM (15 minutes before Shringar begins). For Sandhya Aarti, arrive by 6:30 PM (30 minutes early). Weekday mornings are the least crowded.",
          "Entry: Free. No entry fee for general darshan. The temple has a shoe stand near the entrance (₹5-10 per pair). Cameras and phones are not allowed inside the sanctum but can be carried in the courtyard area.",
          "Dress code: Modest clothing. Men: dhoti/kurta or pants and shirt. Women: saree or salwar kameez. No shorts or sleeveless tops. Remove footwear before entering.",
          "Accessibility: The temple has steps at the entrance. Wheelchair access is limited — contact the temple office in advance if you need assistance. Elderly devotees can request priority darshan through the temple office.",
        ],
      },
    ],
    faqs: [
      {
        q: "What are Dwarkadhish Temple morning timings?",
        a: "Summer (Apr-Oct): 6:30 AM - 10:30 AM. Winter (Nov-Mar): 7:00 AM - 10:30 AM. Mangala Aarti at opening, Shringar Darshan at 8:30 AM (deity in elaborate dress — the most popular darshan).",
      },
      {
        q: "What are Dwarkadhish Temple evening timings?",
        a: "Summer: 4:00 PM - 7:00 PM, Sandhya Aarti at 7:00 PM. Winter: 3:30 PM - 6:30 PM, Sandhya Aarti at 6:30 PM. The temple closes after Sandhya Aarti — there is no late-night darshan.",
      },
      {
        q: "What is Shringar Darshan at Dwarkadhish Temple?",
        a: "Shringar Darshan at 8:30 AM is when the deity is dressed in elaborate costumes — different each day, representing different pastimes of Krishna. It's the most visually spectacular darshan and the most popular among devotees. Arrive by 8:15 AM.",
      },
      {
        q: "When is the Dwarkadhish Temple Holi celebration?",
        a: "The temple hosts a week-long Holi Utsav (typically in March). The deity is brought out in a Shobha Yatra procession, and devotees play colors. It's one of the most famous Holi celebrations in Mathura. Book rooms 60+ days in advance.",
      },
      {
        q: "How far is Dwarkadhish Temple from Guruvayur Dham?",
        a: "Guruvayur Dham is 2.5 km (8 minutes' drive) from Dwarkadhish Temple. Auto-rickshaws cost ₹50-70 one way. Walking takes 25 minutes through the market area. We can arrange complimentary drop-off for early morning aarti.",
      },
    ],
    ctaHeadline: "Stay 8 Minutes from Dwarkadhish Temple — Book Your Room Today",
  },

  {
    slug: "mathura-temple-darshan-guide",
    category: "darshan-timings",
    navLabel: "Mathura Temple Guide",
    title: "Mathura Temple Darshan Guide 2026 — Complete Temple List & Timings",
    metaDescription:
      "Complete Mathura temple darshan guide 2026. All major temples, darshan timings, aarti schedules, entry fees, dress codes. Plan your Mathura pilgrimage.",
    heroImage:
      "https://images.unsplash.com/photo-1604608672516-f1b9b1d37076?w=1920&h=1080&fit=crop",
    jsonLdType: "TouristAttraction",
    eyebrow: "Complete Temple Guide",
    intro: [
      "Mathura, the birthplace of Lord Krishna, is home to dozens of sacred temples, each with its own unique history, significance, and darshan schedule. For pilgrims visiting Mathura for the first time, navigating the various temples, their timings, and their specific requirements can be overwhelming. This comprehensive guide covers all major temples in Mathura with their 2026 darshan timings, entry requirements, and visiting tips.",
      "Whether you're planning a one-day temple tour or an extended pilgrimage, this guide will help you optimize your itinerary. We've organized the temples by proximity and significance, so you can visit them efficiently without backtracking. Most temples in Mathura are within a 5 km radius of the city center, making it possible to visit 4-5 temples in a single day.",
      "Guruvayur Dham, located in Natwar Nagar near Mata Pathwari Mandir, serves as the perfect base for your Mathura temple tour. Our central location puts you within 10 minutes of all major temples, and our team can arrange guided temple tours with knowledgeable local guides who can explain the history and significance of each site.",
    ],
    sections: [
      {
        heading: "Major Temples in Mathura — Timings & Guide",
        body: [
          "1. Krishna Janmabhoomi Temple (3 km from Guruvayur Dham): The most sacred temple — built on Krishna's birthplace. Summer: 5:00 AM-12 PM, 4:00 PM-9:30 PM. Winter: 5:30 AM-12 PM, 3:30 PM-8:30 PM. No phones/cameras/leather inside. Free entry. Mangala Aarti at opening is the most auspicious darshan.",
          "2. Dwarkadhish Temple (2.5 km): Magnificent Rajasthani architecture, famous for Shringar Darshan and Holi. Summer: 6:30 AM-10:30 AM, 4:00 PM-7:00 PM. Winter: 7:00 AM-10:30 AM, 3:30 PM-6:30 PM. Sandhya Aarti at closing. Free entry.",
          "3. Vishram Ghat (2 km): Sacred Yamuna ghat where Krishna rested after defeating Kamsa. Open 24 hours. Yamuna Aarti at sunrise and sunset (6:00 AM and 6:00 PM approx). Free. Dev Deepawali on Kartik Purnima (Nov 23, 2026) is spectacular.",
          "4. Geeta Mandir (3 km): Modern temple with Bhagavad Gita inscriptions on walls. 6:00 AM-12 PM, 4:00 PM-9:00 PM. Free entry. Less crowded — good for peaceful meditation.",
          "5. Mata Pathwari Mandir (across from Guruvayur Dham): Local temple, community-focused. 5:00 AM-9:00 PM. Aarti at 5:30 AM and 7:00 PM. Free. Special Navratri celebrations.",
        ],
      },
      {
        heading: "Temple Tour Itinerary — Half Day & Full Day",
        body: [
          "Half-Day Tour (4 hours): Start at Krishna Janmabhoomi at 5:30 AM for Mangala Aarti → walk to Dwarkadhish Temple (8:30 AM Shringar Darshan) → auto-rickshaw to Vishram Ghat (9:30 AM Yamuna darshan) → return to Guruvayur Dham by 10:00 AM for breakfast. This itinerary covers the 3 most important sites in Mathura.",
          "Full-Day Tour (8 hours): Morning: Krishna Janmabhoomi (5:30 AM) → Dwarkadhish (8:30 AM) → Vishram Ghat (10:00 AM) → Geeta Mandir (11:00 AM) → lunch at Guruvayur Dham. Afternoon: Drive to Vrindavan (2:00 PM) → Prem Mandir (2:30 PM) → ISKCON Temple (4:00 PM) → Banke Bihari Temple (5:30 PM evening darshan) → return to Mathura by 8:00 PM.",
          "Guruvayur Dham can arrange both tours with a car, driver, and optional guide. The half-day tour starts at ₹800 (car + driver). The full-day tour including Vrindavan starts at ₹1,500. Contact us at +91-90908 20208 to book.",
        ],
      },
      {
        heading: "General Tips for Mathura Temple Visits",
        body: [
          "Dress code: All temples require modest dress. Men: dhoti/kurta or pants and shirt (no shorts). Women: saree or salwar kameez. Carry a scarf or dupatta for head covering. Some temples require you to remove shirts (men) for entry into the sanctum — check at the entrance.",
          "Footwear: All temples require you to remove shoes before entering. Shoe stands are available at every temple (₹5-10 per pair). Wear slip-on shoes or sandals for convenience. Avoid expensive footwear.",
          "Electronics: Krishna Janmabhoomi strictly prohibits phones, cameras, and electronics. Other temples (Dwarkadhish, Banke Bihari) allow phones in the courtyard but not in the sanctum. When in doubt, leave electronics at your hotel.",
          "Best visiting season: October-March (pleasant weather, 15-25°C). Avoid April-June (extreme heat, 40°C+). July-September is monsoon (humid but fewer crowds). Festival seasons (Janmashtami, Holi, Diwali) are the most crowded but also the most spiritually charged.",
          "Pooja booking: Guruvayur Dham can arrange pooja bookings at all major Mathura and Vrindavan temples at zero commission. Whether you want a Mangala Aarti sponsorship, Abhishek, or Annakut offering, contact us at +91-90908 20208 at least 1 week before your visit.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many temples are in Mathura?",
        a: "Mathura has over 50 temples, but the 5 most important are: Krishna Janmabhoomi, Dwarkadhish, Vishram Ghat, Geeta Mandir, and Mata Pathwari Mandir. For a pilgrimage, visiting these 5 plus a day trip to Vrindavan (Banke Bihari, ISKCON, Prem Mandir) covers the most significant sites.",
      },
      {
        q: "Can I visit all Mathura temples in one day?",
        a: "Yes, you can visit the 5 main Mathura temples in a half-day (4 hours) starting at 5:30 AM. For a more relaxed experience with Vrindavan included, plan a full day (8 hours). Guruvayur Dham arranges guided temple tours with car and driver.",
      },
      {
        q: "What is the best time to visit Mathura temples?",
        a: "October-March has the best weather (15-25°C). Visit temples early morning (5:30-8:00 AM) for the most peaceful darshan and shortest queues. Avoid weekends and major festivals unless you're prepared for large crowds.",
      },
      {
        q: "Is there an entry fee for Mathura temples?",
        a: "No, all major Mathura temples have free entry. Some offer special darshan passes (₹50-100) for closer access, but these are optional. Shoe stands charge ₹5-10 per pair. There are no VIP/paid darshan systems at most temples.",
      },
      {
        q: "Can I book pooja at Mathura temples through Guruvayur Dham?",
        a: "Yes! We coordinate pooja bookings at Krishna Janmabhoomi, Dwarkadhish, Vishram Ghat, and all Vrindavan temples. Zero commission — you pay only the official temple rate. WhatsApp +91-90908 20208 at least 1 week before your visit.",
      },
    ],
    ctaHeadline: "Book Your Mathura Temple Tour — Stay at the Center of It All",
  },
];

// Helper: get all SEO page slugs (for routing + sitemap)
export const SEO_PAGE_SLUGS = SEO_PAGES.map((p) => p.slug);

// Helper: get a page by slug
export function getSEOPage(slug: string): SEOPage | undefined {
  return SEO_PAGES.find((p) => p.slug === slug);
}

// Helper: get pages by category (for navbar grouping)
export function getSEOPagesByCategory(category: SEOPageCategory): SEOPage[] {
  return SEO_PAGES.filter((p) => p.category === category);
}
