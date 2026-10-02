/**
 * Central mock-data store for Guruvayur Dham.
 * Swap these arrays/objects with real CMS / API data later · every component
 * in src/components/site reads from here, so the rest of the UI stays intact.
 */

export const SITE = {
  name: "GuruVayur Dham",
  tagline: "2 Minutes from Mathura Station",
  // Two contact numbers - +91-90908 20208 is MAIN (also WhatsApp), +91 8445555584 is secondary
  phone: "+91-90908 20208",          // primary (used for tel: links + WhatsApp)
  phoneRaw: "+919090820208",
  phone2: "+91 8445555584",           // secondary (display only)
  phone2Raw: "+918445555584",
  phones: "+91-90908 20208, +91 8445555584",  // combined display string
  whatsapp: "919090820208",          // WhatsApp uses primary
  email: "bookings@guruvayurdham.co.in",
  emails: {
    bookings: "bookings@guruvayurdham.co.in",
    manager: "manager@guruvayurdham.co.in",
    sales: "sales@guruvayurdham.co.in",
  },
  domain: "guruvayurdham.co.in",
  // Real GSTIN (UP state code 09)
  gstin: "09ABAFG2373H1ZG",
  // Address per invoice sample (includes house no. + "Opp." prefix)
  address: "68/396 Mali Para, Opp. Mata Pathwari Mandir, Dholi Pyau, Mathura, Uttar Pradesh - 281001",
  shortAddress: "Mali Para, Dholi Pyau, Mathura 281001",
  // Bank details per invoice sample
  bank: {
    name: "AU Small Finance Bank",
    accountNumber: "2502421377158310",
    ifsc: "AUBL0004213",
    branch: "Mathura",
  },
  mapEmbed:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3549.5552!2d77.6900!3d27.4924!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3973715d2a2a2a2a%3A0x0!2zMjfCsDI5JzQwLjYiTiA3N8KwNDEnMjQuMCJF!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin",
  mapLink: "https://www.google.com/maps/search/?api=1&query=Mata+Pathwari+Mandir+Dholi+Pyau+Mathura+281001",
  // Google Business Profile - admin can override GOOGLE_PLACE_ID + GOOGLE_BUSINESS_PROFILE_URL
  // via Settings → INTEGRATION. ReviewsWidget fetches /api/google-business for live rating.
  googleBusinessProfileUrl: "https://www.google.com/maps/search/?api=1&query=Guruvayur+Dham+Mata+Pathwari+Mandir+Mathura",
  googleReviewsUrl: "https://www.google.com/maps/search/?api=1&query=Guruvayur+Dham+Mata+Pathwari+Mandir+Mathura",
  googlePlaceId: "", // admin sets via Settings (GOOGLE_PLACE_ID) for live Places API access
  checkIn: "11:30 AM",
  checkOut: "11:00 AM",
  rating: 4.8,
  reviewCount: 120,
  totalRooms: 15,
  distanceToTemple: "Walk to Mata Pathwari Mandir",
  // Default GST rates (editable via admin → Settings → INTEGRATION category)
  // Per India GST brackets - admin can override these in CMS.
  // When IGST > 0, CGST and SGST are ignored (inter-state supply).
  defaultGstRates: {
    cgst: 2.5,   // % - within-state, intra-state bookings
    sgst: 2.5,   // % - within-state, intra-state bookings
    igst: 0,     // % - inter-state bookings (if 0, CGST+SGST apply)
  },
  nearbyTemples: [
    // ===== Mathura (Day 1) - 4 mandirs from PDF 2 =====
    {
      name: "Shri Krishna Janmabhoomi",
      distance: "3 km · ~15-20 min drive",
      timings: "5:00 AM - 12:00 PM, 4:00 - 9:00 PM",
      description: "Birthplace of Lord Krishna - the garbha-griha (prison cell where Kansa held Vasudev-Devaki) is the holiest spot. Janmashtami midnight abhishek with 108 medicines from Kamdhenu Gomukh.",
      deity: "Bal-Mukund / Vasudev Krishna",
      worshipMethod: "Panchamrit Mahabhishek + Shila-pooja at the garbha-griha stone. Midnight 108-medicine abhishek on Janmashtami.",
      prasadam: "Makhan-Mishri, Panjeeri, Panchmewa, Dhaniya Panjeeri",
      bestTimeToVisit: "Before 6 AM (most peaceful); Janmashtami midnight for the 108-medicine abhishek",
      specialRules: "",
      dham: "Mathura",
      category: "Janmabhoomi",
    },
    {
      name: "Shri Dwarkadhish Temple",
      distance: "2 km · ~15 min drive",
      timings: "6:30 - 10:30 AM, 4:00 - 7:00 PM",
      description: "Built 1814 by Seth Gokuldas Parekh near Vishram Ghat. Krishna worshipped in his Rajadhiraj (King of Dwarka) form. Ashtayam seva (8 services) follows Pushtimarg tradition.",
      deity: "Rajadhiraj Dwarkadhish",
      worshipMethod: "Ashtayam seva - Mangala, Gwal, Rajbhog, Utthapan, Bhog, Sandhya Aarti, Shayan (8 services across the day). Savan swings, Sharad Purnima white dress, Holi abeer-gulal.",
      prasadam: "Rajbhog thali, Sharad Purnima special white-food, Holi special abeer sweets",
      bestTimeToVisit: "Sandhya Aarti at 6 PM; Savan for swings; Sharad Purnima for white attire",
      specialRules: "Pushtimarg sampradaya - Vallabh kul seva",
      dham: "Mathura",
      category: "Rajadhiraj",
    },
    {
      name: "Shri Bhuteshwar Mahadev",
      distance: "1.8 km · ~10 min drive",
      timings: "5:00 AM - 1:00 PM, 4:00 - 9:00 PM",
      description: "Mathura's Kshetrapal (city protector) - ancient Shiva linga where Krishna came to take permission before entering Mathura. Also a Shakti peeth (Sati's hair fell here).",
      deity: "Bhuteshwar Shiva (Kshetrapal) + Sati Shakti",
      worshipMethod: "Bhasma + Ak-Dhatura + Bel-patra + Yamuna water abhishek. Rudra-path on Savan Mondays + Mahaaarti.",
      prasadam: "Bhasma, Bel leaves, Dhatura fruits (offered, not consumed)",
      bestTimeToVisit: "Savan Monday (Rudra-path + Maha-aarti); Mahashivratri",
      specialRules: "Braj Parikrama starts and ends here with Kshetrapal's permission",
      dham: "Mathura",
      category: "Shaiva-Shakti",
    },
    {
      name: "Vishram Ghat & Yamuna Maharani Mandir",
      distance: "2.2 km · ~15 min drive",
      timings: "Open all day · Sandhya Aarti around sunset",
      description: "Where Krishna + Balaram rested after killing Kansa. Starting point of the 25-pradakshina Braj parikrama. Yamuna Maharani Mandir adjacent.",
      deity: "Yamuna Maharani (Suryaputri)",
      worshipMethod: "Chunari Manorath + Deepadan (lamp offering). Sunrise + sunset Yamuna Aarti.",
      prasadam: "Yamuna-water, Deep-prasadam, Panchamrit",
      bestTimeToVisit: "Sunrise (Mangala Aarti) or sunset (Sandhya Aarti)",
      specialRules: "Begin Braj Parikrama here - take Kshetrapal's permission at Bhuteshwar first",
      dham: "Mathura",
      category: "Yamuna-Poojan",
    },

    // ===== Gokul (Day 2) - 4 mandirs from PDF 3 =====
    {
      name: "Shri Nand Bhavan (Chaurasi Khambha)",
      distance: "10 km · ~25 min drive (Gokul)",
      timings: "6:00 AM - 8:00 PM",
      description: "Vishwakarma-built palace of Nand Baba with 84 carved pillars symbolizing the 84 lakh species - Krishna's childhood home where Yashoda + Nand raised him. The main darshan is of Nand Bhavan Gokul's famous golden cradle (Sone ke jhule ka darshan) where child Krishna's bal-leela is enacted daily.",
      deity: "Bal Krishna, Balaram, Yashoda Maiya, Nandray Ji",
      worshipMethod: "Bal Laddu Gopal palna (swing) seva. Devotees tie mouli + chunari for santan-prapti (child boon). Sone ke jhule (golden cradle) darshan is the highlight.",
      prasadam: "Matki fresh white Makhan, Mishri, Doodh-Peda, Malpua",
      bestTimeToVisit: "Janmashtami (palna seva at midnight with golden cradle); daily morning aarti",
      specialRules: "Pilgrims tie chunari for child boon - do not remove others' chunari",
      dham: "Gokul",
      category: "Nand-Mahal",
    },
    {
      name: "Shri Nand Bhavan Gokul (Sone ke Jhule ka Darshan)",
      distance: "10.5 km · ~25 min drive (Gokul)",
      timings: "6:00 AM - 12:00 PM, 4:00 - 8:00 PM",
      description: "Sacred Nand Bhavan shrine in Gokul where the golden cradle (Sone ka Jhula) of child Krishna is the principal darshan. The beautifully adorned golden cradle is rocked by purohits during morning aarti and on every Janmashtami at midnight, recreating Yashoda Maiya's bal-seva. Devotees come from across Braj for this rare Sone ke jhule ka darshan.",
      deity: "Bal Krishna in the golden cradle (Sone ka Jhula)",
      worshipMethod: "Palna seva (rocking the cradle) with bal-bhog + Laddu Gopal shringar. Devotees offer makhan-mishri and tie chunari for santan-prapti.",
      prasadam: "Makhan-Mishri, Bal-bhog Peda, Panjeeri",
      bestTimeToVisit: "Janmashtami midnight golden cradle aarti; daily morning palna seva; Gokul Ashtami",
      specialRules: "Photography of the golden cradle is restricted during aarti; respect devotee queues",
      dham: "Gokul",
      category: "Sone-Jhula-Darshan",
    },
    {
      name: "Shri Chintaharan Mahadev (Gokul)",
      distance: "11.5 km · ~30 min drive (Gokul)",
      timings: "5:30 AM - 12:00 PM, 4:00 - 9:00 PM",
      description: "Ancient Shiva shrine in Gokul where Lord Shiva himself is believed to have relieved Nand Baba of all worldly worries (chinta-haran) after Krishna's birth. The swayambhu linga here is bathed with Yamuna water and bhasma. Highly revered by Brajvasis and pilgrims seeking mental peace.",
      deity: "Chintaharan Mahadev (Lord Shiva as the remover of worries)",
      worshipMethod: "Bhasma + Bel-patra + Dhatura abhishek with Yamuna water. Rudra-path on Mondays and Mahashivratri. Maha-aarti in Sawan.",
      prasadam: "Bhasma, Bel leaves, Dhatura fruits (offered, not consumed)",
      bestTimeToVisit: "Savan Mondays (Rudra-path + Maha-aarti); Mahashivratri; daily morning abhishek",
      specialRules: "Remove footwear at the gate; Gokul temple customs apply",
      dham: "Gokul",
      category: "Shaiva-Chintaharan",
    },
    {
      name: "Shri Raman Reti",
      distance: "11 km · ~30 min drive (Gokul)",
      timings: "5:30 AM - 12:00 PM, 3:00 - 8:30 PM",
      description: "Sacred sandy ground where Krishna played with friends (Shridama, Subal) + cows. Sant Gynananand Maharaj's tapasya sthal. Famous for raj-snan - rolling in the sacred dust.",
      deity: "Raman Bihari Ji",
      worshipMethod: "Raj-snan (rolling in dust for physical + mental peace). Gau-seva, deer-feeding. Daily dhup-deep archana of Raman Bihari Ji.",
      prasadam: "Sacred dust tilak (raj-tilak) on forehead",
      bestTimeToVisit: "Morning (cool sand, deer active); Magh Purnima for special raj-snan",
      specialRules: "Remove footwear; the dust itself is the prasadam - don't wash it off immediately",
      dham: "Gokul",
      category: "Raj-Snan-Tirth",
    },
    {
      name: "Shri Brahmand Ghat",
      distance: "12 km · ~30 min drive (Gokul)",
      timings: "6:00 AM - 8:00 PM",
      description: "Where child Krishna ate mud + when Yashoda opened his mouth, saw the entire universe (Brahmand) inside. Sacred clay worship + clay prasad.",
      deity: "Brahmand Bihari (Krishna with universe in mouth)",
      worshipMethod: "Sacred clay (pavitra mati) worship + tilak on forehead. Symbolic clay-achamana + Yamuna Aarti.",
      prasadam: "Mati (clay) prasad - symbolic khand-mishri; Dughd (milk) naivedya",
      bestTimeToVisit: "Sunrise + Yamuna Aarti sunset",
      specialRules: "The clay is sacred - collect only a small pinch as prasadam",
      dham: "Gokul",
      category: "Brahmand-Darshan",
    },
    {
      name: "Shri Thakurani Ghat (Vallabh Baithak Ji)",
      distance: "12.5 km · ~30 min drive (Gokul)",
      timings: "6:00 AM - 8:00 PM",
      description: "Gokul's most prominent ghat where Vallabhacharya received direct darshan of Yamuna Maharani + composed the Shri Yamunashtak stotra. Pushtimarg sampradaya's first Baithak Ji.",
      deity: "Yamuna Maharani + Vallabh Mahaprabhu",
      worshipMethod: "Brahm-sambandh diksha (Pushtimarg initiation). Yamuna-ji stotra path. Deepadan.",
      prasadam: "Yamuna water, Pushtimarg thaal prasadam",
      bestTimeToVisit: "Yamuna Jayanti; daily aarti times",
      specialRules: "Pushtimarg Vaishnav initiation site - respect sampradaya customs",
      dham: "Gokul",
      category: "Pushtimarg-Udgam",
    },

    // ===== Vrindavan (Day 3) - 4 mandirs from PDF 4 =====
    {
      name: "Shri Banke Bihari Temple",
      distance: "15 km · ~25 min drive (Vrindavan)",
      timings: "7:45 AM - 12:00 PM, 5:30 - 9:30 PM (NO Mangala Aarti except Janmashtami)",
      description: "Self-manifested (prakatya) Radha-Krishna combined vigraha from Swami Haridas's tapasya in Nidhivan, 15th century. Curtain opens/closes every 2 minutes so devotees don't 'bind' Bihari Ji.",
      deity: "Shri Banke Bihari (Radha-Krishna combined, tribhanga)",
      worshipMethod: "Sakhya-bhav / Lad-pyar seva. Curtain opens every 2 min (no continuous darshan). NO Mangala Aarti except Janmashtami (Bihari Ji 'tired' from ras-leela).",
      prasadam: "Matki Peda, Bal-bhog Kachori-Jalebi, evening Mohan-thal",
      bestTimeToVisit: "Morning (cool + less crowded); Janmashtami midnight (only day with Mangala Aarti)",
      specialRules: "No evening visits during Janmashtami rush - book accommodation 60+ days in advance. Don't stare fixedly (Bihari Ji gets 'bound').",
      dham: "Vrindavan",
      category: "Sakhi-Bhav-Seva",
    },
    {
      name: "Shri Prem Mandir",
      distance: "16 km · ~30 min drive (Vrindavan)",
      timings: "8:30 AM - 12:00 PM, 4:30 - 8:30 PM",
      description: "54-acre Italian Carrara marble temple built by Jagadguru Kripalu Maharaj. Walls carved with Krishna's leela. Evening LED lighting + musical fountains show ras-leela + Giridhar-dharan.",
      deity: "Radha-Govind + Sita-Ram yugal",
      worshipMethod: "Sankirtan-pradhana upasana + nitya aarti-vandana (pure Vedic bhav). Evening LED + fountain show daily.",
      prasadam: "Sankirtan prasad; no traditional food prasadam at temple (available at shops outside)",
      bestTimeToVisit: "Sunset for LED + fountain show (daily); winter evenings clearer",
      specialRules: "No photography inside garbha-griha; modest dress required",
      dham: "Vrindavan",
      category: "Sthapatya-Prakash-Chhata",
    },
    {
      name: "Shri Radha Raman Temple",
      distance: "15.5 km · ~30 min drive (Vrindavan)",
      timings: "8:00 AM - 12:30 PM, 6:00 - 8:00 PM",
      description: "Self-manifested (svayambhu) from Damodar Shaligram shila in 1542 by Gopal Bhatt Goswami (Gaudiya sampradaya). 500-year unbroken kitchen fire still cooks bhog. No separate Radha murti.",
      deity: "Shri Radha Raman Dev Ji (svayambhu shaligram)",
      worshipMethod: "Morning Dughd-Mishri Mahabhishek + sattvik Ashtayam raga-seva. 500-year unbroken kitchen fire cooks bhog thali.",
      prasadam: "Dughd-Mishri mahabhishek prasadam; bhog thali from unbroken agni",
      bestTimeToVisit: "Morning Mangala + Sandhya Aarti; Gaur Purnima (Holi); Radhashtami",
      specialRules: "Gaudiya Vaishnav sampradaya - Gomati chakra + Radha's crown on left side of vigraha",
      dham: "Vrindavan",
      category: "Svayambhu-Shaligram",
    },
    {
      name: "Pavitra Nidhivan Raj",
      distance: "15.5 km · ~30 min drive (Vrindavan)",
      timings: "5:00 AM - 12:00 PM, 4:00 PM - sunset (STRICT)",
      description: "Sacred grove where Krishna + Radha + gopis perform ras-leela every night. Trees embrace in pairs (yugal form). Rang Mahal has nightly shayan seva (chandan bed + datun + paan + water + shringar - found used next morning).",
      deity: "Radha-Krishna yugal + Swami Haridas samadhi",
      worshipMethod: "Daytime parikrama of the grove. Rang Mahal shayan seva decorated each evening - found used each morning (proof of nightly ras-leela).",
      prasadam: "Chandan, paan-beeda; offerings from Rang Mahal",
      bestTimeToVisit: "Morning (7-10 AM) - leave before sunset STRICTLY",
      specialRules: "STRICT: After sunset, even animals + birds leave the grove. NO HUMAN may stay overnight - strictly forbidden. Plan morning-only visit.",
      dham: "Vrindavan",
      category: "Nitya-Ras-Sthali",
    },

    // ===== Plus the original temples from before (kept for completeness) =====
    {
      name: "Radha Rani Mandir",
      distance: "45 km · ~60 min drive (Barsana)",
      timings: "5:00 AM - 2:00 PM, 4:00 - 9:00 PM",
      description: "Birthplace of Radha Rani in Barsana - Ladli Lal (Radha-Krishna together). One of the most important Braj temples.",
      deity: "Ladli Lal (Radha-Krishna)",
      worshipMethod: "Daily aarti; Holi special Lathmar at Radha Rani Mandir (Barsana's famous Lathmar Holi).",
      prasadam: "Gupt-Khajur, Makhan-Mishri; Holi special gujiya + thandai",
      bestTimeToVisit: "Radhashtami + Holi (Lathmar Holi); daily morning aarti",
      specialRules: "",
      dham: "Barsana",
      category: "Radha-Janmabhoomi",
    },
    {
      name: "Mata Pathwari Mandir",
      distance: "Next door · 1 min walk",
      timings: "5:00 AM - 9:00 PM",
      description: "Adjacent temple at walking distance from Guruvayur Dham - convenient for morning darshan before pilgrimage begins.",
      deity: "Mata Pathwari Devi",
      worshipMethod: "Daily aarti + Chunari Manorath on special days",
      prasadam: "Prasad packets; Halwa-Puri on Sundays",
      bestTimeToVisit: "Morning aarti (6 AM); Navratri",
      specialRules: "",
      dham: "Mathura",
      category: "Local-Devata",
    },
    // ===== New temples from timings document =====
    {
      name: "Birla Mandir (Gita Mandir)",
      distance: "7 km · ~20-25 min drive",
      timings: "6:00 AM - 12:00 PM, 4:00 - 8:00 PM",
      description: "Also known as Gita Mandir - a beautiful temple with inscriptions from the Bhagavad Gita on its walls.",
      deity: "Lord Krishna + Laxmi Narayan",
      worshipMethod: "Daily aarti + Gita path",
      prasadam: "Prasad packets",
      bestTimeToVisit: "Morning aarti (6 AM); evening Sandhya Aarti",
      specialRules: "",
      dham: "Mathura",
      category: "Gita-Stambh",
    },
    {
      name: "ISKCON Temple (Sri Sri Krishna Balaram Mandir)",
      distance: "16 km · ~30 min drive (Vrindavan)",
      timings: "4:30 AM - 1:00 PM, 4:00 - 8:45 PM",
      description: "ISKCON Vrindavan's flagship temple founded by Srila Prabhupada in 1975. Beautiful Krishna-Balaram deities along with Gaura-Nitai. Morning Mangala Aarti at 4:30 AM is a deeply spiritual experience. The temple complex includes the Samadhi of Srila Prabhupada, a guest house, and the famous Govindas restaurant serving pure-vegetarian sattvic meals.",
      deity: "Krishna-Balaram + Gaura-Nitai + Srila Prabhupada Samadhi",
      worshipMethod: "Sankirtan + ISKCON standard aarti schedule. Mangala Aarti 4:30 AM, Darshan Aarti, Gurvastaka, Sandhya Aarti, Bhog Aarti. Sunday feast programme with free prasadam for all visitors.",
      prasadam: "Maha-prasadam from ISKCON kitchen + Govindas restaurant meals",
      bestTimeToVisit: "Mangala Aarti 4:30 AM; Sandhya Aarti 7 PM; Sunday feast programme",
      specialRules: "No shoes inside; cover head with dupatta/dhoti; no photography of deities during aarti",
      dham: "Vrindavan",
      category: "ISKCON-Gaudiya",
    },
    {
      name: "Chaar Dham Mandir (Vrindavan)",
      distance: "16.5 km · ~30 min drive (Vrindavan)",
      timings: "6:00 AM - 12:00 PM, 4:00 - 9:00 PM",
      description: "A unique temple complex in Vrindavan that brings together the four sacred dhams (Badrinath, Dwarka, Jagannath Puri, and Rameshwaram) under one roof, allowing devotees to receive the blessings of all four holy pilgrimage sites in a single visit. Beautifully crafted replicas of each dham's main deity, with architecture echoing the original shrines.",
      deity: "Badrinath (Badrivishal), Dwarkadhish, Lord Jagannath + Rameshwaram Shiva",
      worshipMethod: "Daily aarti + dham-specific festivals on their respective Jayantis. Char-dham parikrama within the temple compound grants the punya of all four dhams.",
      prasadam: "Prasad packets; special chappan bhog on festivals",
      bestTimeToVisit: "Morning aarti; Ekadashi days; festival days of each dham",
      specialRules: "Covered dress code; footwear deposit at the entrance",
      dham: "Vrindavan",
      category: "Chaar-Dham-Yatra",
    },
    {
      name: "Om Gopal Ashram (Vrindavan)",
      distance: "15.5 km · ~30 min drive (Vrindavan)",
      timings: "5:00 AM - 12:00 PM, 4:00 - 9:00 PM",
      description: "Serene ashram in Vrindavan dedicated to Gopal Krishna, with a peaceful atmosphere for meditation, kirtan, and devotional seva. The ashram houses a beautiful deity of Gopal Krishna and offers free prasadam meals to pilgrims and sadhus. Daily morning and evening aartis are followed by kirtan sessions open to all visitors.",
      deity: "Gopal Krishna (child form holding a calf)",
      worshipMethod: "Daily aarti + kirtan + Gopal mantra japa. Seva of cows at the attached goshala. Free anna-daan (food distribution) for pilgrims.",
      prasadam: "Free anna-daan meals; Gopal bhog sweets",
      bestTimeToVisit: "Morning mangala aarti; evening sandhya aarti + kirtan; Gopal Ashtami",
      specialRules: "Maintain ashram silence during meditation hours; cover head inside the sanctum",
      dham: "Vrindavan",
      category: "Gopal-Ashram-Seva",
    },
    {
      name: "Govardhan Hill (21 km Parikrama)",
      distance: "22 km · ~40 min drive (Govardhan)",
      timings: "Open all day · Parikrama 24 hours (best 4-9 AM / 4-9 PM)",
      description: "Sacred hill lifted by Lord Krishna on his little finger for 7 days to protect Braj from Indra's fury. The 21 km Govardhan Parikrama (circumambulation) is one of the most sacred Braj yatras - performed barefoot by millions of devotees every year. The parikrama passes through Daan Ghati, Radha Kund, Shyam Kund, Mansi Kund, Kusum Sarovar and other sacred spots.",
      deity: "Giriraj Govardhan (Krishna as the hill itself)",
      worshipMethod: "21 km barefoot parikrama with dandavat (prostration) optional. Govardhan sila worship at home for those initiated. Giriraj abhishek at Daan Ghati.",
      prasadam: "Govardhan raj (sacred dust) tilak; chappan bhog on Govardhan Puja (Diwali next day)",
      bestTimeToVisit: "Govardhan Puja (day after Diwali); Guru Purnima; daily dawn parikrama",
      specialRules: "Barefoot parikrama only; no leather items on the parikrama path; respect cows and sadhus along the route",
      dham: "Govardhan",
      category: "Giriraj-Parikrama",
    },
    {
      name: "Daan Ghati (Govardhan)",
      distance: "21 km · ~40 min drive (Govardhan)",
      timings: "5:00 AM - 12:00 PM, 4:00 - 10:00 PM",
      description: "The most famous starting point of the 21 km Govardhan Parikrama. Daan Ghati is where Krishna is believed to have played the divine game of asking for daan (donation) from the gopis in disguise. The temple here houses Giriraj Ji (a sacred Govardhan sila) and is the principal abhishek sthal where devotees offer milk, curd, and Yamuna water to the hill.",
      deity: "Giriraj Govardhan (sacred sila) + Krishna as Daanveer",
      worshipMethod: "Abhishek of Giriraj sila with panchamrit. Offer daan (donation) to Brajvasis and cows. Begin parikrama here.",
      prasadam: "Panchamrit abhishek prasadam; Govardhan raj tilak",
      bestTimeToVisit: "Govardhan Puja; daily morning abhishek; start of parikrama",
      specialRules: "Barefoot inside the temple; collect a pinch of Govardhan raj as prasadam",
      dham: "Govardhan",
      category: "Giriraj-Abhishek",
    },
    {
      name: "Radha Kund (Govardhan)",
      distance: "22 km · ~45 min drive (Govardhan)",
      timings: "Open all day · Aarti at sunrise + sunset",
      description: "The most sacred Kund (holy pond) in all of Braj, created by Radha Rani herself when she dug it with her bangles to wash Krishna after he killed the demon Aristhasur. Krishna then dug Shyam Kund to wash himself. Bathing in Radha Kund on Radhashtami is considered the highest spiritual blessing in Gaudiya Vaishnav tradition.",
      deity: "Radha Rani + Krishna (Shyamsundar)",
      worshipMethod: "Parikrama of both Radha Kund and Shyam Kund (combined 4 km). Holy dip on Radhashtami + Kartik Purnima. Deep-daan at sunset.",
      prasadam: "Sacred Kund water (symbolic); chandan tilak; deep prasadam",
      bestTimeToVisit: "Radhashtami; Kartik month; Amla Ekadashi; sunrise/sunset aarti",
      specialRules: "Barefoot parikrama; no bathing with soap in the Kund; dress modestly",
      dham: "Govardhan",
      category: "Radha-Kund-Tirtha",
    },
    {
      name: "Shyam Kund (Govardhan)",
      distance: "22 km · ~45 min drive (Govardhan)",
      timings: "Open all day · Aarti at sunrise + sunset",
      description: "Sacred pond dug by Krishna himself with his flute to wash off the demon Aristhasur's blood. Adjacent to Radha Kund, Shyam Kund is considered Krishna's own private bathing place. Together with Radha Kund, performing parikrama of both kunds grants liberation from all material desires according to Gaudiya scriptures.",
      deity: "Shyamsundar Krishna",
      worshipMethod: "Parikrama (with Radha Kund) + deep-daan. Holy dip at sunrise. Chanting of Shyam-sahasranama.",
      prasadam: "Sacred Kund water; deep prasadam; chandan tilak",
      bestTimeToVisit: "Kartik month; Radhashtami; sunrise holy dip",
      specialRules: "Barefoot parikrama; modest dress; no leather items",
      dham: "Govardhan",
      category: "Shyam-Kund-Tirtha",
    },
    {
      name: "Mansi Kund (Govardhan)",
      distance: "22.5 km · ~45 min drive (Govardhan)",
      timings: "Open all day · Best visited 6 AM - 9 PM",
      description: "Sacred Kund on the Govardhan Parikrama path where, according to legend, the minds (mans = mind) of devotees are purified by the holy waters. Many devotees perform tarpan (offerings to ancestors) and pitru-shanti rituals here. Calm, less crowded than Radha/Shyam Kund - ideal for meditation and peaceful parikrama breaks.",
      deity: "Pitru Devatas + Giriraj Govardhan",
      worshipMethod: "Tarpan + pitru-shanti pooja. Holy dip on Amavasya and Pitra Paksha. Silent meditation.",
      prasadam: "Sacred Kund water (symbolic); sesame seed offerings",
      bestTimeToVisit: "Pitra Paksha (Mahalaya); Amavasya; Kartik month",
      specialRules: "Maintain silence; perform tarpan only with proper guidance from purohits",
      dham: "Govardhan",
      category: "Pitru-Tirtha",
    },
    {
      name: "Kusum Sarovar (Govardhan)",
      distance: "23 km · ~45 min drive (Govardhan)",
      timings: "Open all day · Best at sunrise + sunset",
      description: "Beautiful historic sarovar on the parikrama path where Radha Rani is believed to have come to collect flowers (kusum) for Krishna. The stunning 18th-century chhatri-pavilions on the bank were built by Maharaja Suraj Mal of Bharatpur in memory of his queen. A peaceful, picturesque stop on the Govardhan Parikrama - perfect for sunset reflection.",
      deity: "Radha-Krishna Yugal (Kusum-haran leela sthal)",
      worshipMethod: "Parikrama of the sarovar + silent meditation at the chhatris. Kusum (flower) offerings to the waters. Photography of the architecture.",
      prasadam: "Sacred flowers; sarovar water (symbolic)",
      bestTimeToVisit: "Sunset for photography; Sharad Purnima; Kartik month",
      specialRules: "Maintain the serene atmosphere; no loud noise; respect the heritage structures",
      dham: "Govardhan",
      category: "Kusum-Sarovar-Leela",
    },
    {
      name: "Radha Damodar Mandir",
      distance: "15.5 km · ~30 min drive (Vrindavan)",
      timings: "4:30 AM - 1:00 PM, 4:30 - 9:00 PM",
      description: "Ancient temple with deities of Radha-Damodar worshipped by Srila Jiva Goswami. The sitting place (baithak) of Jiva Goswami is inside.",
      deity: "Radha-Damodar + Jiva Goswami samadhi",
      worshipMethod: "Gaudiya sampradaya seva. Daily aarti + kirtan. Baithak ji darshan.",
      prasadam: "Bhog prasadam from Gaudiya kitchen",
      bestTimeToVisit: "Morning Mangala (4:30 AM); Kartik month for special Damodarastakam",
      specialRules: "Gaudiya Vaishnav sampradaya",
      dham: "Vrindavan",
      category: "Gaudiya-Baithak",
    },
    {
      name: "Shri Rangji Mandir",
      distance: "15 km · ~25 min drive (Vrindavan)",
      timings: "5:30 - 11:00 AM, 4:00 - 9:00 PM",
      description: "Largest temple in Vrindavan with South Indian architecture. Deity of Lord Ranganath (reclining Vishnu). Unique Brahmotsava festival in March.",
      deity: "Sri Ranganath (reclining Vishnu/Krishna)",
      worshipMethod: "South Indian Vaishnav tradition. Daily abhishek + aarti. Annual Brahmotsava with chariot festival.",
      prasadam: "South Indian style prasadam",
      bestTimeToVisit: "Morning abhishek; Brahmotsava festival (March)",
      specialRules: "South Indian temple customs - remove shoes outside complex",
      dham: "Vrindavan",
      category: "Sri-Vaishnav",
    },
    {
      name: "Seva Kunj",
      distance: "15.5 km · ~30 min drive (Vrindavan)",
      timings: "6:00 AM - 12:00 PM, 4:00 PM - sunset",
      description: "Sacred grove next to Nidhivan where Radha-Krishna perform raas-leela every night. Contains the small temple of Seva Kunj where the priest leaves food and decorations each night - found used by morning.",
      deity: "Radha-Krishna yugal",
      worshipMethod: "Daytime parikrama only. STRICT: no entry after sunset - even animals leave.",
      prasadam: "Flowers and chandan from the kunj",
      bestTimeToVisit: "Morning (6-10 AM); leave before sunset STRICTLY",
      specialRules: "STRICT: No humans after sunset. Same rules as Nidhivan.",
      dham: "Vrindavan",
      category: "Nitya-Ras-Sthali",
    },
    {
      name: "Radha Vallabh Mandir",
      distance: "15.5 km · ~30 min drive (Vrindavan)",
      timings: "5:00 AM - 12:00 PM, 6:00 - 9:00 PM",
      description: "Famous temple where Krishna is worshipped without Radha - instead, a 'Sweke' (golden crown) represents Radha. Known for unique 'seva' style and delicious 'kehari' prasad.",
      deity: "Radha Vallabh Ji (Krishna with golden crown representing Radha)",
      worshipMethod: "Radha-Vallabh sampradaya. Unique seva with 'jhanji' (flower decoration). Morning aarti + evening 'shringar'.",
      prasadam: "Kehari prasad (famous sweet rice preparation)",
      bestTimeToVisit: "Morning aarti; evening shringar (6 PM)",
      specialRules: "Radha-Vallabh sampradaya - no separate Radha murti",
      dham: "Vrindavan",
      category: "Radha-Vallabh-Sampradaya",
    },

    {
      name: "Pagal Baba Mandir",
      distance: "16 km · ~30 min drive (Vrindavan)",
      timings: "6:00 AM - 12:00 PM, 3:00 - 8:00 PM",
      description: "Modern white marble temple built by Pagal Baba. Known for its clean architecture and the Durga temple on the premises. Popular with families for its spacious complex.",
      deity: "Krishna + Durga",
      worshipMethod: "Daily aarti + darshan",
      prasadam: "Prasad packets",
      bestTimeToVisit: "Morning; afternoon (opens at 3 PM - earliest evening opening)",
      specialRules: "",
      dham: "Vrindavan",
      category: "Modern-Temple",
    },
    {
      name: "Kirti Mandir (Barsana)",
      distance: "45 km · ~60 min drive (Barsana)",
      timings: "6:00 AM - 12:00 PM, 4:00 - 8:30 PM",
      description: "Birthplace of Radha Rani's friend Kirti. Adjacent to the main Radha Rani temple. Beautiful views of Barsana hills.",
      deity: "Kirti Devi + Radha Rani",
      worshipMethod: "Daily aarti + darshan. Visit alongside Radha Rani Mandir.",
      prasadam: "Prasad packets",
      bestTimeToVisit: "Morning; visit together with Radha Rani Mandir",
      specialRules: "",
      dham: "Barsana",
      category: "Radha-Sakhi-Sthali",
    },
    {
      name: "Shri Nand Baba Temple (Nandgaon)",
      distance: "50 km · ~75 min drive (Nandgaon)",
      timings: "5:00 AM - 2:00 PM, 4:00 - 9:00 PM",
      description: "Krishna's foster father Nand Baba's home in Nandgaon. Hilltop temple with panoramic views of Braj. Connected to Nand Bhavan in Gokul.",
      deity: "Nand Baba + Yashoda + Bal Krishna",
      worshipMethod: "Daily aarti + darshan. Special celebrations during Holi (Nandgaon vs Barsana Lathmar Holi).",
      prasadam: "Prasad packets; special Holi sweets",
      bestTimeToVisit: "Morning aarti; Holi season for Lathmar Holi",
      specialRules: "",
      dham: "Nandgaon",
      category: "Nand-Sthali",
    },
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
  { label: "Home", href: "/", route: "/" },
  { label: "Rooms", href: "/rooms", route: "/rooms" },
  { label: "Pooja", href: "/pooja", route: "/pooja" },
  { label: "About", href: "/about", route: "/about" },
  { label: "Gallery", href: "/gallery", route: "/gallery" },
  { label: "Events", href: "/events", route: "/events" },
  { label: "Blog", href: "/blog", route: "/blog" },
  { label: "FAQ", href: "/faq", route: "/faq" },
  { label: "Contact", href: "/contact", route: "/contact" },
];

/* ============ HERO TRUST BADGES ============ */
export const TRUST_BADGES = [
  { icon: "Star", text: `4.8 Google Rating` },
  { icon: "Train", text: "2 Min from Mathura Station" },
  { icon: "Footprints", text: "Walk to Krishna Janmabhoomi" },
  { icon: "BedDouble", text: "15 Premium Rooms" },
];

/* ============ WHY CHOOSE US ============ */
export const WHY_CHOOSE_US = [
  {
    icon: "Train",
    title: "2 Min from Mathura Station",
    text: "Just a 2-minute walk from Mathura Railway Station. Skip the traffic and reach your room in minutes - perfect for pilgrims arriving by train from Delhi, Agra, or beyond.",
  },
  {
    icon: "MapPin",
    title: "Walk to Krishna Janmabhoomi",
    text: "Only 3 km from Shri Krishna Janmabhoomi and 2 km from Dwarkadhish Temple. Explore Mathura's sacred sites on foot, or take a short auto to Vrindavan (15 km) for Banke Bihari and Prem Mandir darshan.",
  },
  {
    icon: "BedDouble",
    title: "15 Premium Rooms",
    text: "Deluxe, Super Deluxe, Superior, and GVD Suite categories - each with fresh linen, 24×7 hot water, attached bathrooms, and family-friendly layouts. Daily sanitised and inspected before every check-in.",
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
export type RoomType = "AC" | "Non-AC" | "Family" | "Deluxe" | "Suite";

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
    name: "Family Suit / Quad Room",
    type: "Deluxe",
    price: 2450,
    originalPrice: 3000,
    rating: 4.8,
    reviews: 142,
    capacity: 8,
    size: "320 sq.ft",
    bedType: "2 Double Beds",
    image: "/rooms/deluxe-room-main.jpg",
    gallery: [
      "/rooms/deluxe-room-main.jpg",
      "/rooms/deluxe-room-1.jpg",
      "/rooms/deluxe-room-2.jpg",
      "/rooms/deluxe-room-3.jpg",
    ],
    badge: "Best for Groups",
    description: "Designed for families and groups traveling together, this spacious Family Room combines modern comfort with warm, inviting interiors. Featuring two comfortable double beds with plush cushioned headboards, premium linen, and stylish wood-paneled feature walls, the room provides ample space for up to 6-8 adults to relax after a long day of sightseeing. Ambient cove lighting, individual bedside reading lamps, and dedicated power sockets ensure a cozy, hassle-free stay.",
    amenities: [
      "2 Double Beds",
      "Accommodates up to 6-8 Adults",
      "Premium White Linens",
      "Plush Pillows & Cozy Blankets",
      "Modern False Ceiling + Warm Ambient Lighting",
      "Bedside Reading Wall Sconces",
      "Fully Air-Conditioned",
      "Intercom Telephone",
      "Complimentary Bottled Water",
      "Multiple Charging Points",
      "Free High-Speed Wi-Fi",
      "En-suite Private Bathroom",
      "24/7 Hot & Cold Water",
      "Fresh Bath Towels",
      "Complimentary Guest Toiletries",
    ],
    shortDesc: "2 double beds · 6-8 guests · 320 sq.ft · AC",
  },
  {
    slug: "super-deluxe-room",
    name: "King Deluxe Room",
    type: "Deluxe",
    price: 1250,
    originalPrice: 1600,
    rating: 4.8,
    reviews: 98,
    capacity: 2,
    size: "240 sq.ft",
    bedType: "King-Size Bed",
    image: "/rooms/super-deluxe-room-main.jpg",
    gallery: [
      "/rooms/super-deluxe-room-main.jpg",
      "/rooms/super-deluxe-room-1.jpg",
      "/rooms/super-deluxe-room-2.jpg",
      "/rooms/super-deluxe-room-3.jpg",
    ],
    badge: "Popular Choice",
    description: "The King Deluxe Room features a king-size bed with an illuminated laser-cut headboard, an extended built-in lounge sofa in timber finish, and contemporary geometric fluted paneling. Tall plush headboard and LED TV create a relaxed, modern feel - ideal for couples or solo pilgrims wanting extra comfort. Plug-and-play charging points, mood lighting, and a private en-suite bathroom with 24/7 hot water round out the experience.",
    amenities: [
      "King-Size Bed",
      "Illuminated Laser-Cut Headboard",
      "Extended Built-in Lounge Sofa",
      "Timber Finish Interiors",
      "Contemporary Geometric Paneling",
      "LED TV",
      "Fully Air-Conditioned",
      "Free High-Speed Wi-Fi",
      "En-suite Private Bathroom",
      "24/7 Hot & Cold Water",
      "Complimentary Bottled Water",
      "Multiple Charging Points",
      "Intercom Telephone",
    ],
    shortDesc: "King bed + lounge sofa · 2 guests · 240 sq.ft · AC",
  },
  {
    slug: "superior-room",
    name: "Premium Double Bed Room",
    type: "Deluxe",
    price: 1450,
    originalPrice: 1800,
    rating: 4.8,
    reviews: 76,
    capacity: 3,
    size: "280 sq.ft",
    bedType: "Double Bed + Single",
    image: "/rooms/superior-room-main.jpg",
    gallery: [
      "/rooms/superior-room-main.jpg",
      "/rooms/superior-room-1.jpg",
      "/rooms/superior-room-2.jpg",
      "/rooms/superior-room-3.jpg",
      "/rooms/superior-room-4.jpg",
    ],
    badge: "Family Choice",
    description: "The Premium Double Bed Room showcases contemporary geometric fluted paneling, a tall plush headboard, LED TV, a vanity station, and split AC. Designed for small families or groups of 2-3 pilgrims, this room balances modern design with the practical comforts needed for a Mathura pilgrimage - close to Mathura Junction Station and the major Braj temples.",
    amenities: [
      "Double Bed + Optional Single",
      "Contemporary Fluted Paneling",
      "Tall Plush Headboard",
      "LED TV",
      "Vanity Station",
      "Split AC",
      "Free High-Speed Wi-Fi",
      "En-suite Private Bathroom",
      "24/7 Hot & Cold Water",
      "Complimentary Bottled Water",
      "Multiple Charging Points",
      "Intercom Telephone",
      "Fresh Bath Towels & Toiletries",
    ],
    shortDesc: "Double + single · 3 guests · 280 sq.ft · Split AC",
  },
  {
    slug: "gvd-suite",
    name: "Privilege Suite with Seating",
    type: "Suite",
    price: 2699,
    originalPrice: 3500,
    rating: 4.8,
    reviews: 41,
    capacity: 4,
    size: "420 sq.ft",
    bedType: "King + Living Area",
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
    description: "Our Privilege Suite is the signature offering at Guruvayur Dham - a premium suite with a full living area, plush full-length couch, curved backlit headboard, and a Smart TV with Netflix/OTT access. Separate seating area makes it ideal for families wanting extra space to unwind after a full day of Mathura-Vrindavan-Gokul darshan. Includes priority check-in, welcome tea on arrival, and complimentary breakfast for two.",
    amenities: [
      "King-Size Bed + Full Living Area",
      "Plush Full-Length Couch",
      "Curved Backlit Headboard",
      "Smart TV with Netflix/OTT",
      "Separate Seating Area",
      "Fully Air-Conditioned",
      "Free High-Speed Wi-Fi",
      "En-suite Premium Bathroom",
      "24/7 Hot & Cold Water",
      "Complimentary Breakfast for Two",
      "Welcome Tea on Arrival",
      "Priority Check-in",
      "Intercom Telephone",
      "Multiple Charging Points",
      "Fresh Bath Towels & Premium Toiletries",
    ],
    shortDesc: "King + living area · 4 guests · 420 sq.ft · Smart TV",
  },
  {
    slug: "family-comfort-triple-room",
    name: "Family Comfort Triple Room",
    type: "Family",
    price: 1800,
    originalPrice: 2200,
    rating: 4.8,
    reviews: 52,
    capacity: 3,
    size: "260 sq.ft",
    bedType: "1 Double + 1 Single/Diwan",
    image: "/rooms/family-comfort-triple-room-main.jpg",
    gallery: [
      "/rooms/family-comfort-triple-room-main.jpg",
      "/rooms/family-comfort-triple-room-1.jpg",
      "/rooms/family-comfort-triple-room-2.jpg",
      "/rooms/family-comfort-triple-room-3.jpg",
    ],
    badge: "Triple Sharing",
    description: "The Family Comfort Triple Room is purpose-built for small families or groups of 3 pilgrims. Setup includes 1 Double Bed plus 1 Single Bed/Diwan, textured designer walls, cove lighting, and multi-guest flexibility - perfect for parents + child or 3 friends traveling together. Close to Mathura Junction Railway Station (~5-7 min drive) and a short auto ride to Krishna Janmabhoomi, Dwarkadhish, and Vishram Ghat.",
    amenities: [
      "1 Double Bed + 1 Single/Diwan",
      "Textured Designer Walls",
      "Cove Lighting",
      "Multi-Guest Flexibility",
      "Fully Air-Conditioned",
      "LED TV",
      "Free High-Speed Wi-Fi",
      "En-suite Private Bathroom",
      "24/7 Hot & Cold Water",
      "Complimentary Bottled Water",
      "Multiple Charging Points",
      "Intercom Telephone",
      "Fresh Bath Towels & Toiletries",
    ],
    shortDesc: "1 double + 1 single · 3 guests · 260 sq.ft · AC",
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
  // Which mandir this pooja is offered at (empty = general pooja across all temples)
  mandir?: string;
  // Which Dham - Mathura / Gokul / Vrindavan / Barsana
  dham?: string;
}

export const POOJAS: Pooja[] = [
  // === General poojas (bookable across any Mathura temple via GVD) ===
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
    mandir: "Any Mathura mandir",
    dham: "Mathura",
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
    mandir: "Any Mathura mandir",
    dham: "Mathura",
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
    mandir: "Any Mathura mandir",
    dham: "Mathura",
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
    mandir: "Any Mathura mandir",
    dham: "Mathura",
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
    mandir: "Any Mathura mandir",
    dham: "Mathura",
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
    mandir: "Any Mathura mandir",
    dham: "Mathura",
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
      "Annadan is considered the highest form of donation in Hindu tradition. 'Annadan is Mahadan' - feeding devotees brings infinite blessings.",
    mandir: "Any Mathura mandir",
    dham: "Mathura",
  },

  // === Mandir-specific poojas (offered at specific Mathura temples) ===
  {
    id: "krishna-janmabhoomi-mahabhishek",
    name: "Krishna Janmabhoomi Mahabhishek",
    price: 1100,
    duration: "45 min",
    description:
      "Panchamrit Mahabhishek at the garbha-griha stone (where Lord Krishna appeared). Includes milk, curd, ghee, honey, sugar + Yamuna Jal abhishek with Vedic chanting by the temple pandit. Book through GVD - zero commission, official temple rate.",
    prasadam: "Panchamrit + Makhan-Mishri + Panjeeri + Panchmewa",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "The garbha-griha stone is the most sacred spot in Mathura. Sponsoring the Mahabhishek here is said to fulfill heartfelt desires + cleanse karmic obstacles.",
    mandir: "Shri Krishna Janmabhoomi Mandir Sansthan, Mathura",
    dham: "Mathura",
  },
  {
    id: "dwarkadhish-ashtayam-seva",
    name: "Dwarkadhish Ashtayam Seva",
    price: 2500,
    duration: "Full day (8 services)",
    description:
      "Sponsor one or more of the 8 Pushtimarg seva services at Dwarkadhish Temple: Mangala, Gwal, Rajbhog, Utthapan, Bhog, Sandhya Aarti, Shayan. Performed by Vallabh kul vaishnav sevaks. Includes your name in the seva register.",
    prasadam: "Rajbhog thali prasadam (sweets + namkeen + fruit)",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Ashtayam seva at Dwarkadhish (Rajadhiraj form) follows Vallabhacharya's Pushtimarg tradition. Sponsoring any of the 8 services brings the blessing of the King of Dwarka.",
    mandir: "Shri Dwarkadhish Temple, Mathura (near Vishram Ghat)",
    dham: "Mathura",
  },
  {
    id: "bhuteshwar-rudra-path",
    name: "Bhuteshwar Rudra-Path + Maha-Aarti",
    price: 750,
    duration: "1 hour",
    description:
      "Bhasma + Ak-Dhatura + Bel-patra + Yamuna Jal abhishek on the ancient Shiva linga at Bhuteshwar Mahadev (Mathura's Kshetrapal). Includes Rudra-path chanting by 5 Vedic pandits + Maha-aarti. Especially powerful on Savan Mondays + Mahashivratri.",
    prasadam: "Bhasma + Bel leaves + Dhatura fruit (offered, not consumed)",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Bhuteshwar is Mathura's city protector. Krishna himself came here for permission before entering Mathura. Beginning your Braj pilgrimage here ensures safe + successful yatra.",
    mandir: "Shri Bhuteshwar Mahadev Mandir, Mathura",
    dham: "Mathura",
  },
  {
    id: "vishram-ghat-deepadan",
    name: "Vishram Ghat Deepadan + Yamuna Poojan",
    price: 251,
    duration: "30 min",
    description:
      "Sponsor 108 floating diyas at Vishram Ghat where Krishna rested after killing Kansa. Includes Yamuna Maharani poojan + Chunari Manorath + Vedic chanting. Performed at sunset for the magical floating-lamp aarti.",
    prasadam: "Deep-prasadam + Yamuna-water + Panchamrit",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Vishram Ghat is the starting point of the 25-pradakshina Braj parikrama. Deepadan here is believed to bring peace to ancestors + remove obstacles from the yatra.",
    mandir: "Vishram Ghat + Yamuna Maharani Mandir, Mathura",
    dham: "Mathura",
  },
  {
    id: "nand-bhavan-palna-seva",
    name: "Nand Bhavan Bal Gopal Palna Seva",
    price: 501,
    duration: "30 min",
    description:
      "Sponsor the Bal Laddu Gopal palna (swing) seva at Shri Nand Bhavan (Chaurasi Khambha Mandir, Gokul) - Krishna's childhood home. Includes Mouli + Chunari offering for santan-prapti (child boon). Performed by the temple pujari with kirtan.",
    prasadam: "Matki fresh white Makhan + Mishri + Doodh-Peda + Malpua",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "The 84 carved pillars of Nand Bhavan symbolize 84 lakh species - sponsoring palna seva here is believed to grant child boon (santan-prapti) + free 84 lakh yonis.",
    mandir: "Shri Nand Bhavan (Chaurasi Khambha), Gokul",
    dham: "Gokul",
  },
  {
    id: "banke-bihari-curtain-darshan",
    name: "Banke Bihari Special Curtain Darshan",
    price: 1100,
    duration: "20 min",
    description:
      "Special darshan at Shri Banke Bihari Temple (Vrindavan) - the self-manifested Radha-Krishna combined vigraha from Swami Haridas's tapasya. Sponsorship includes Pushpa-bhog (floral offering) + your name read aloud during the unique 2-minute curtain darshan.",
    prasadam: "Matki Peda + Bal-bhog Kachori-Jalebi + evening Mohan-thal",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Banke Bihari is the only temple where the curtain opens/closes every 2 minutes (so Bihari Ji doesn't get 'bound'). NO Mangala Aarti except Janmashtami (Bihari Ji is 'tired' from ras-leela). Sponsoring curtain darshan is rare + blessed.",
    mandir: "Shri Banke Bihari Temple, Vrindavan",
    dham: "Vrindavan",
  },
  {
    id: "prem-mandir-aarti-sankirtan",
    name: "Prem Mandir Sandhya Aarti + Sankirtan",
    price: 351,
    duration: "1 hour (sunset)",
    description:
      "Sponsor the sunset Sandhya Aarti at Shri Prem Mandir (Vrindavan) - 54-acre Italian Carrara marble temple built by Jagadguru Kripalu Maharaj. Includes Sankirtan-pradhana upasana + stay for the evening LED lighting + musical fountain show (ras-leela + Giridhar-dharan).",
    prasadam: "Sankirtan prasad + blessed flowers",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Prem Mandir follows pure Vedic bhav upasana. Sponsoring the sunset aarti here brings the blessing of Radha-Govind + Sita-Ram yugal - perfect for couples + families.",
    mandir: "Shri Prem Mandir, Vrindavan",
    dham: "Vrindavan",
  },
  {
    id: "radha-raman-mahabhishek",
    name: "Radha Raman Dughd-Mishri Mahabhishek",
    price: 1500,
    duration: "1 hour (morning)",
    description:
      "Morning Dughd-Mishri (milk + sugar) Mahabhishek on the self-manifested Shaligram shila of Shri Radha Raman (1542, Gaudiya sampradaya). Performed by Gopal Bhatt Goswami pujari lineage. Includes bhog cooked on the 500-year unbroken kitchen fire.",
    prasadam: "Dughd-Mishri mahabhishek prasadam + bhog thali from the unbroken agni",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Radha Raman is svayambhu (self-manifested) - no chisel ever touched the shila. The 500-year unbroken kitchen fire is a rare living tradition. Sponsoring this Mahabhishek on Gaur Purnima (Holi) or Radhashtami is exceptionally auspicious.",
    mandir: "Shri Radha Raman Temple, Vrindavan",
    dham: "Vrindavan",
  },
  {
    id: "nidhivan-shayan-seva",
    name: "Nidhivan Rang Mahal Shayan Seva",
    price: 750,
    duration: "Evening (before sunset only)",
    description:
      "Sponsor the Rang Mahal shayan seva - chandan ka palan (sandalwood bed), daatun, paan ka beeda, jal (water), shringar material - decorated each evening before sunset. Found used the next morning (proof of Krishna's nightly ras-leela).",
    prasadam: "Chandan + paan-beeda + offerings from Rang Mahal",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Nidhivan is the most mysterious grove in Vrindavan - every night Krishna + Radha + gopis perform ras-leela here. Sponsoring the shayan seva is believed to grant divine dreams + spiritual awakening. STRICT: Grove closes at sunset - no human may stay overnight.",
    mandir: "Pavitra Nidhivan Raj, Vrindavan",
    dham: "Vrindavan",
  },
  {
    id: "raman-reti-raj-snan",
    name: "Raman Reti Raj-Snan + Gau-Seva",
    price: 351,
    duration: "45 min",
    description:
      "Sponsor the sacred raj-snan (rolling in the dust) + Gau-seva (cow service) + deer-feeding at Shri Raman Reti, Gokul. The dust itself is the prasadam (raj-tilak on forehead). Includes daily dhup-deep archana of Raman Bihari Ji.",
    prasadam: "Sacred dust tilak (raj-tilak) on forehead",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Raman Reti is where Krishna played with Shridama, Subal + cows. Rolling in the sacred dust is believed to cleanse daivic (physical) + maansik (mental) obstacles. Especially powerful on Magh Purnima.",
    mandir: "Shri Raman Reti Ashram, Gokul",
    dham: "Gokul",
  },
  {
    id: "brahmand-ghat-mati-poojan",
    name: "Brahmand Ghat Mati-Poojan",
    price: 251,
    duration: "20 min",
    description:
      "Sponsor the sacred clay (pavitra mati) worship + tilak at Shri Brahmand Ghat, Gokul - where child Krishna ate mud and showed Yashoda the entire universe in his mouth. Includes symbolic clay-achamana + Yamuna Aarti at sunset.",
    prasadam: "Mati (clay) prasad - symbolic khand-mishri + Dughd (milk) naivedya",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Brahmand Ghat is the only place where Krishna revealed the entire Brahmand (universe) from his mouth. Taking a pinch of the sacred clay as prasadam is believed to grant cosmic perspective + remove ignorance.",
    mandir: "Shri Brahmand Ghat, Gokul",
    dham: "Gokul",
  },
  {
    id: "thakurani-ghat-brahm-sambandh",
    name: "Thakurani Ghat Brahm-Sambandh Diksha",
    price: 2100,
    duration: "2 hours (by appointment)",
    description:
      "Receive Brahm-Sambandh diksha (Pushtimarg initiation) at Shri Thakurani Ghat (Vallabh Mahaprabhu's first Baithak Ji, Gokul). Performed by Vallabh kul vaishnav acharya. Includes Yamuna Maharani stotra path + Deepadan.",
    prasadam: "Yamuna water + Pushtimarg thaal prasadam + diksha thread",
    image:
      "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=600&h=400&fit=crop",
    significance:
      "Thakurani Ghat is where Vallabhacharya received direct darshan of Yamuna Maharani + composed the Shri Yamunashtak stotra. This is the Pushtimarg sampradaya's first Baithak Ji - the most sacred initiation site for Pushtimarg Vaishnavs.",
    mandir: "Shri Thakurani Ghat (Vallabh Mahaprabhu Baithak Ji), Gokul",
    dham: "Gokul",
  },
  {
    id: "radha-rani-lathmar-holi-seva",
    name: "Radha Rani Mandir Holi Seva (Barsana)",
    price: 5100,
    duration: "Full day (Holi season only)",
    description:
      "Sponsor the famous Lathmar Holi seva at Shri Radha Rani Mandir, Barsana (birthplace of Radha Rani). Includes Ladli Lal aarti + special gujiya + thandai prasadam + reserved viewing spot for the Lathmar Holi procession.",
    prasadam: "Gupt-Khajur + Makhan-Mishri + Holi special gujiya + thandai",
    image:
      "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600&h=400&fit=crop",
    significance:
      "Barsana is the only place where Holi is celebrated as Lathmar (men from Nandgaon are playfully beaten by women of Barsana with sticks). Sponsoring the seva at Radha Rani Mandir brings the special blessing of Ladli Lal on Holi + Radhashtami.",
    mandir: "Shri Radha Rani Mandir, Barsana",
    dham: "Barsana",
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
    text: "Travelled with my 70-year-old mother and two kids. The Family Suite gave us all space, the elevator worked, and the staff kept a wheelchair ready for amma. They even booked our Mangala Aarti + Abhishek pooja in advance. Felt like staying with relatives, not at a hotel.",
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
    text: "We did our daughter's Mundan ceremony here at the Mata Pathwari Mandir. The Guruvayur Dham team coordinated with the temple pandit, arranged the prasadam kit, and even booked a photographer. The whole ceremony felt sacred and stress-free. Forever grateful.",
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
  "Temples",
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
  // ===== Rooms tab - all 22 brochure room photos =====
  // Deluxe Room (Family Suit/Quad Room - 2 double beds, 6-8 guests, yellow curved headboards)
  {
    tab: "Rooms",
    src: "/rooms/deluxe-room-main.jpg",
    alt: "Family Suit/Quad Room with two double beds, yellow curved headboards, wood-paneled walls",
    caption: "Family Suit / Quad Room · 2 double beds · 6-8 guests · ₹2,450/night",
    span: "wide",
  },
  {
    tab: "Rooms",
    src: "/rooms/deluxe-room-1.jpg",
    alt: "Family Suit/Quad Room alternate angle showing yellow headboards and botanical artwork",
    caption: "Family Suit · alternate angle · wood paneling",
  },
  {
    tab: "Rooms",
    src: "/rooms/deluxe-room-2.jpg",
    alt: "Two-bed family room with brown padded headboards and diagonal striped wall paneling",
    caption: "Family Suit · two-bed variant",
    span: "tall",
  },
  {
    tab: "Rooms",
    src: "/rooms/deluxe-room-3.jpg",
    alt: "Two single beds with distinct bedspreads on tiled floor",
    caption: "Family Suit · single beds variant",
  },

  // Super Deluxe Room (King Deluxe - king + lounge sofa + TV)
  {
    tab: "Rooms",
    src: "/rooms/super-deluxe-room-main.jpg",
    alt: "King Deluxe Room with king bed, teal lounge sofa, wall-mounted TV, cove lighting",
    caption: "King Deluxe Room · king + lounge sofa · ₹1,250/night",
    span: "wide",
  },
  {
    tab: "Rooms",
    src: "/rooms/super-deluxe-room-1.jpg",
    alt: "King Deluxe Room with channel-tufted headboard, wood paneling, botanical artwork",
    caption: "King Deluxe · channel-tufted headboard",
    span: "tall",
  },
  {
    tab: "Rooms",
    src: "/rooms/super-deluxe-room-2.jpg",
    alt: "Double bed with blue runner, blue accent pillows, landscape painting above",
    caption: "King Deluxe · alt angle · blue accents",
  },
  {
    tab: "Rooms",
    src: "/rooms/super-deluxe-room-3.jpg",
    alt: "Double bed with second bed visible, textured gold wallpaper",
    caption: "King Deluxe · multi-bed variant",
    span: "wide",
  },

  // Superior Room (Premium Double Bed - fluted paneling + tall headboard + vanity)
  {
    tab: "Rooms",
    src: "/rooms/superior-room-main.jpg",
    alt: "Premium Double Bed Room with king bed, tall vertical channel headboard, vanity nook with backlit mirror",
    caption: "Premium Double Bed Room · tall headboard + vanity · ₹1,450/night",
    span: "tall",
  },
  {
    tab: "Rooms",
    src: "/rooms/superior-room-1.jpg",
    alt: "Premium Double Bed Room with yellow vertical channel-tufted headboard",
    caption: "Premium Double · yellow channel headboard",
  },
  {
    tab: "Rooms",
    src: "/rooms/superior-room-2.jpg",
    alt: "Premium Double Bed Room with olive-green channel-tufted headboard and floating vanity shelf",
    caption: "Premium Double · olive-green + floating vanity",
    span: "wide",
  },
  {
    tab: "Rooms",
    src: "/rooms/superior-room-3.jpg",
    alt: "Premium Double Bed Room with diagonal wall paneling and illuminated vanity mirror",
    caption: "Premium Double · diagonal panel + vanity",
  },
  {
    tab: "Rooms",
    src: "/rooms/superior-room-4.jpg",
    alt: "Premium Double Bed Room with vertical channel-tufted headboard and recessed ceiling lighting",
    caption: "Premium Double · vertical channel · recessed lighting",
  },

  // GVD Suite (Privilege Suite - full living + Smart TV with Netflix)
  {
    tab: "Rooms",
    src: "/rooms/gvd-suite-main.jpg",
    alt: "Privilege Suite with king bed, ornate white decorative headboard, wall-mounted TV displaying Netflix",
    caption: "Privilege Suite with Seating · king + Smart TV with Netflix · ₹2,699/night",
    span: "wide",
  },
  {
    tab: "Rooms",
    src: "/rooms/gvd-suite-1.jpg",
    alt: "Privilege Suite with king bed, padded headboard, green accent wall panel, wall-mounted TV",
    caption: "Privilege Suite · padded headboard · green accent",
    span: "tall",
  },
  {
    tab: "Rooms",
    src: "/rooms/gvd-suite-2.jpg",
    alt: "Privilege Suite variant with double bed, single mattress on floor, red patterned bed runner",
    caption: "Privilege Suite · double + single mattress variant",
  },
  {
    tab: "Rooms",
    src: "/rooms/gvd-suite-3.jpg",
    alt: "Privilege Suite variant with double bed and second bed visible, textured gold wallpaper",
    caption: "Privilege Suite · multi-bed variant",
    span: "wide",
  },
  {
    tab: "Rooms",
    src: "/rooms/gvd-suite-4.jpg",
    alt: "Privilege Suite alternate angle with double bed, wood paneling, landscape painting",
    caption: "Privilege Suite · alt angle",
  },
  {
    tab: "Rooms",
    src: "/rooms/gvd-suite-5.jpg",
    alt: "Privilege Suite with queen bed, vertical channel-tufted headboard, recessed ceiling lighting",
    caption: "Privilege Suite · vertical channel · recessed lighting",
  },

  // Family Comfort Triple Room (1 Double + 1 Single/Diwan)
  {
    tab: "Rooms",
    src: "/rooms/family-comfort-triple-room-main.jpg",
    alt: "Family Comfort Triple Room with double bed, single mattress on floor, red patterned bed runner, textured gold wallpaper",
    caption: "Family Comfort Triple Room · 1 double + 1 single · ₹1,800/night",
    span: "wide",
  },
  {
    tab: "Rooms",
    src: "/rooms/family-comfort-triple-room-1.jpg",
    alt: "Family Comfort Triple Room with double bed and second bed visible, textured gold wallpaper",
    caption: "Family Triple · double + second bed",
    span: "tall",
  },
  {
    tab: "Rooms",
    src: "/rooms/family-comfort-triple-room-2.jpg",
    alt: "Family Comfort Triple Room with double bed, blue runner, blue accent pillows, wood-paneled walls",
    caption: "Family Triple · blue accents · wood paneling",
  },
  {
    tab: "Rooms",
    src: "/rooms/family-comfort-triple-room-3.jpg",
    alt: "Family Comfort Triple Room two-bed variant with brown padded headboards and diagonal striped wall paneling",
    caption: "Family Triple · two-bed variant",
    span: "wide",
  },

  // ===== Temples tab - all 14 Braj mandirs (real photos) =====
  {
    tab: "Temples",
    src: "/temples/krishna-janmabhoomi.jpg",
    alt: "Shri Krishna Janmabhoomi temple - birthplace of Lord Krishna",
    caption: "Shri Krishna Janmabhoomi · Mathura · birthplace of Krishna · 3 km from GVD",
    span: "tall",
  },
  {
    tab: "Temples",
    src: "/temples/dwarkadhish-temple.jpg",
    alt: "Shri Dwarkadhish Temple - Krishna in Rajadhiraj form",
    caption: "Shri Dwarkadhish Temple · Mathura · Rajadhiraj form · 2 km from GVD",
  },
  {
    tab: "Temples",
    src: "/temples/bhuteshwar-mahadev.jpg",
    alt: "Shri Bhuteshwar Mahadev - Mathura's Kshetrapal Shiva linga",
    caption: "Shri Bhuteshwar Mahadev · Mathura · Kshetrapal · 1.8 km from GVD",
    span: "wide",
  },
  {
    tab: "Temples",
    src: "/temples/vishram-ghat.jpg",
    alt: "Vishram Ghat at sunset - where Krishna rested after killing Kansa",
    caption: "Vishram Ghat + Yamuna Maharani Mandir · Mathura · 2.2 km from GVD",
  },
  {
    tab: "Temples",
    src: "/temples/nand-bhavan.jpg",
    alt: "Shri Nand Bhavan (Chaurasi Khambha) - Krishna's childhood home in Gokul",
    caption: "Shri Nand Bhavan (Chaurasi Khambha) · Gokul · 10 km from GVD",
  },
  {
    tab: "Temples",
    src: "/temples/raman-reti.jpg",
    alt: "Shri Raman Reti - sacred sand where Krishna played as a child",
    caption: "Shri Raman Reti · Gokul · 11 km from GVD · raj-snan (sacred dust rolling)",
    span: "tall",
  },
  {
    tab: "Temples",
    src: "/temples/brahmand-ghat.jpg",
    alt: "Shri Brahmand Ghat - where Krishna showed the universe in his mouth",
    caption: "Shri Brahmand Ghat · Gokul · 12 km from GVD · sacred clay prasadam",
  },
  {
    tab: "Temples",
    src: "/temples/thakurani-ghat.jpg",
    alt: "Shri Thakurani Ghat - Vallabhacharya's first Baithak Ji in Gokul",
    caption: "Shri Thakurani Ghat (Vallabh Baithak Ji) · Gokul · 12.5 km from GVD",
    span: "wide",
  },
  {
    tab: "Temples",
    src: "/temples/banke-bihari.jpg",
    alt: "Shri Banke Bihari Temple - self-manifested Radha-Krishna combined vigraha",
    caption: "Shri Banke Bihari Temple · Vrindavan · 15 km from GVD · curtain darshan every 2 min",
  },
  {
    tab: "Temples",
    src: "/temples/prem-mandir.jpg",
    alt: "Shri Prem Mandir - Italian Carrara marble temple with evening LED show",
    caption: "Shri Prem Mandir · Vrindavan · 16 km from GVD · evening LED + fountain show",
    span: "tall",
  },
  {
    tab: "Temples",
    src: "/temples/radha-raman.jpg",
    alt: "Shri Radha Raman Temple - self-manifested shaligram with 500-year unbroken kitchen fire",
    caption: "Shri Radha Raman Temple · Vrindavan · 15.5 km from GVD · 500-year unbroken agni",
  },
  {
    tab: "Temples",
    src: "/temples/nidhivan.jpg",
    alt: "Pavitra Nidhivan Raj - sacred grove of nightly ras-leela",
    caption: "Pavitra Nidhivan Raj · Vrindavan · 15.5 km from GVD · STRICT - closes at sunset",
    span: "wide",
  },
  {
    tab: "Temples",
    src: "/temples/radha-rani-barsana.jpg",
    alt: "Shri Radha Rani Mandir at Barsana - birthplace of Radha Rani",
    caption: "Shri Radha Rani Mandir · Barsana · 45 km from GVD · Lathmar Holi",
  },
  {
    tab: "Temples",
    src: "/temples/mata-pathwari.jpg",
    alt: "Mata Pathwari Mandir - adjacent temple at walking distance",
    caption: "Mata Pathwari Mandir · Mathura · next door to GVD · 1 min walk",
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
    caption: "Vishram Ghat on the Yamuna river - evening aarti",
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
    alt: "Street market near Krishna Janmabhoomi temple, Mathura",
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
    name: "Shri Krishna Janmashtami",
    date: "Aug 26, 2026",
    dateISO: "2026-08-26",
    description:
      "Midnight celebration of Lord Krishna's birth at Krishna Janmabhoomi. Panchamrit Mahabhishek at the garbha-griha stone. Nand Bhavan (Gokul) hosts Bal Laddu Gopal palna seva at midnight. Banke Bihari holds the ONLY Mangala Aarti of the year. Book 60+ days in advance.",
    highlight: "Midnight abhishek at Krishna Janmabhoomi + Palna seva at Nand Bhavan + Banke Bihari's only Mangala Aarti",
    image: "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Nandotsav (Day After Janmashtami)",
    date: "Aug 27, 2026",
    dateISO: "2026-08-27",
    description:
      "Celebration at Gokul (Dev Bhumi) marking Nand Baba's joy at Krishna's birth. Special celebrations at Nand Bhavan (Chaurasi Khambha) with Bal Gopal palna seva, distribution of sweets, and community festivities.",
    highlight: "Gokul celebrations at Nand Bhavan + Bal Gopal palna seva + sweet distribution",
    image: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Braj Ki Holi",
    date: "Mar 14, 2026",
    dateISO: "2026-03-14",
    description:
      "The grand Holi celebration across Mathura, Vrindavan, and the Sapta Dev temples. Colorful processions, abeer-gulal at Dwarkadhish Temple, and festive atmosphere across all Braj. The largest Holi celebration in India.",
    highlight: "Grand Holi across Mathura + Vrindavan + Sapta Dev temples",
    image: "https://images.unsplash.com/photo-1583075499-8e9a69bb0c1a?w=800&h=600&fit=crop",
  },
  {
    name: "Lathmar Holi at Barsana",
    date: "Mar 11, 2026",
    dateISO: "2026-03-11",
    description:
      "World-famous Lathmar Holi at Barsana - men from Nandgaon playfully beaten by women of Barsana with sticks. At Shri Radha Rani Mandir (birthplace of Radha Rani). Book 60+ days in advance.",
    highlight: "Lathmar Holi at Radha Rani Mandir, Barsana",
    image: "https://images.unsplash.com/photo-1583075499-8e9a69bb0c1a?w=800&h=600&fit=crop",
  },
  {
    name: "Lathmar Holi at Nandgaon",
    date: "Mar 12, 2026",
    dateISO: "2026-03-12",
    description:
      "The return Lathmar Holi at Nandgaon - women from Barsana visit Nandgaon and the roles reverse. At Shri Nand Baba Temple, Nandgaon.",
    highlight: "Return Lathmar Holi at Nand Baba Temple, Nandgaon",
    image: "https://images.unsplash.com/photo-1583075499-8e9a69bb0c1a?w=800&h=600&fit=crop",
  },
  {
    name: "Phoolon Wali Holi (Flower Holi)",
    date: "Mar 14, 2026",
    dateISO: "2026-03-14",
    description:
      "Special Holi with flowers at Banke Bihari Temple, Vrindavan. Devotees are showered with tons of fresh flower petals instead of colors. A visually stunning and spiritually uplifting experience unique to Banke Bihari.",
    highlight: "Flower Holi at Banke Bihari Temple, Vrindavan",
    image: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Brajmar Holi at Gokul",
    date: "Mar 13, 2026",
    dateISO: "2026-03-13",
    description:
      "Gokul's special Holi celebration with colors, music, and dance at Raman Reti and Nand Bhavan. Celebrates Krishna's childhood pranks.",
    highlight: "Gokul Holi at Raman Reti + Nand Bhavan",
    image: "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Huranga at Baldev (Dauji Temple)",
    date: "Mar 13, 2026",
    dateISO: "2026-03-13",
    description:
      "Unique Holi celebration at Dauji Temple, Baldev (Balaram's town). The Huranga is a playful fight where men and women throw colors at each other in a covered courtyard. A rare and energetic tradition specific to Baldev.",
    highlight: "Huranga at Dauji Temple, Baldev",
    image: "https://images.unsplash.com/photo-1583075499-8e9a69bb0c1a?w=800&h=600&fit=crop",
  },
  {
    name: "Radhashtami",
    date: "Sep 10, 2026",
    dateISO: "2026-09-10",
    description:
      "Appearance day of Radha Rani at Shri Radha Rani Mandir, Barsana. Grand Mahabhishek + procession. Radha Raman Temple (Vrindavan) celebrates with Dughd-Mishri Mahabhishek. Banke Bihari has special Ladli Lal shringar.",
    highlight: "Mahabhishek at Radha Rani Mandir (Barsana) + Dughd-Mishri at Radha Raman + Ladli Lal shringar at Banke Bihari",
    image: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Vasant Panchami",
    date: "Feb 1, 2026",
    dateISO: "2026-02-01",
    description:
      "Start of spring season. Special celebrations at Vrindavan temples with yellow attire, Saraswati poojan, and the beginning of Holi season preparations.",
    highlight: "Spring festival at Vrindavan temples + yellow attire + Saraswati poojan",
    image: "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Hariyali Teej",
    date: "Aug 7, 2026",
    dateISO: "2026-08-07",
    description:
      "Monsoon festival celebrating the green season. Special celebrations at Vrindavan temples with swings (jhula), green attire, and mehndi traditions.",
    highlight: "Monsoon swings festival at Vrindavan temples + green attire + mehndi",
    image: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Jhulan Utsav (Swing Festival)",
    date: "Jul 20 - Aug 19, 2026",
    dateISO: "2026-07-20",
    description:
      "Month-long swing festival at Vrindavan temples during Shravan. Krishna and Radha placed on beautifully decorated swings at Banke Bihari, Radha Raman, and other temples.",
    highlight: "Month-long swing festival at Vrindavan temples during Shravan",
    image: "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Raslila Mahotsav",
    date: "Jul - Nov, 2026",
    dateISO: "2026-07-20",
    description:
      "Seasonal Raslila performances across Vrindavan and Mathura during the Shravan-Kartik period. Traditional folk theatre depicting Krishna's ras-leela with the gopis.",
    highlight: "Traditional Raslila performances across Vrindavan + Mathura",
    image: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
  },
  {
    name: "Sharad Purnima",
    date: "Oct 7, 2026",
    dateISO: "2026-10-07",
    description:
      "Full moon night celebrating Krishna's Ras Utsav. Special moonlight darshan at Vrindavan temples. Dwarkadhish dressed in white attire (shwet dhaval vastra). Kheer prepared and left under moonlight as prasadam.",
    highlight: "Moonlight Ras Utsav at Vrindavan + white attire at Dwarkadhish + kheer prasadam",
    image: "https://images.unsplash.com/photo-1572883454114-64346b8e5f6d?w=800&h=600&fit=crop",
  },
  {
    name: "Krishna Chhath Mela",
    date: "Nov 7, 2026",
    dateISO: "2026-11-07",
    description:
      "Special Chhath Puja celebrations at Mathura's Yamuna ghats. Devotees offer arghya to the Sun God at sunrise and sunset. Unique to Mathura with Krishna-specific rituals alongside traditional Chhath practices.",
    highlight: "Chhath Puja at Mathura Yamuna ghats + sunrise/sunset arghya",
    image: "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Govardhan Puja / Annakoot",
    date: "Oct 22, 2026",
    dateISO: "2026-10-22",
    description:
      "Day after Diwali - Krishna lifted Govardhan Hill. 21-km parikrama of Govardhan Hill. Annakoot (mountain of food) at Dwarkadhish Temple. Banke Bihari has Chappan Bhog (56-bhog thali).",
    highlight: "Govardhan parikrama (21 km) + Annakoot at Dwarkadhish + Chappan Bhog at Banke Bihari",
    image: "https://images.unsplash.com/photo-1601050690536-2b9a86c2f6fd?w=800&h=600&fit=crop",
  },
  {
    name: "Annakut Mahotsav at Vrindavan",
    date: "Oct 22, 2026",
    dateISO: "2026-10-22",
    description:
      "Separate Annakut celebration at Vrindavan temples. Hundreds of food items arranged in mountain formation at Govind Dev Ji, Radha Vallabh, and other Vrindavan temples.",
    highlight: "Annakut at Govind Dev Ji + Radha Vallabh + Vrindavan temples",
    image: "https://images.unsplash.com/photo-1601050690536-2b9a86c2f6fd?w=800&h=600&fit=crop",
  },
  {
    name: "Yam Dwitiya / Bhai Dooj",
    date: "Oct 23, 2026",
    dateISO: "2026-10-23",
    description:
      "Day when Yamuna invited her brother Yama for a meal at Vishram Ghat, Mathura. Brothers and sisters bathe at Vishram Ghat and perform tilak rituals. Special aarti at Vishram Ghat.",
    highlight: "Bhai Dooj at Vishram Ghat, Mathura + tilak rituals + Yamuna aarti",
    image: "https://images.unsplash.com/photo-1572883454114-1cf0031ede2a?w=800&h=600&fit=crop",
  },
  {
    name: "Kartik Purnima / Dev Diwali",
    date: "Nov 5, 2026",
    dateISO: "2026-11-05",
    description:
      "Full moon of Kartik - holiest day for Yamuna poojan. Sacred dip at Vishram Ghat + 108 floating diyas deep-daan. Yamuna Aarti at sunset. Thakurani Ghat (Gokul) has special Pushtimarg seva. Beginning of 25-pradakshina Braj parikrama.",
    highlight: "Yamuna dip at Vishram Ghat + 108 diyas deep-daan + Begin Braj Parikrama",
    image: "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=600&fit=crop",
  },
  {
    name: "Akshay Dwitiya",
    date: "May 8, 2026",
    dateISO: "2026-05-08",
    description:
      "Auspicious day in Mathura and Vrindavan marking the start of the Chaturmas period (4 holy months). Special door-opening ceremonies at temples. Begin Parikrama season.",
    highlight: "Chaturmas start + temple door ceremonies at Mathura + Vrindavan",
    image: "https://images.unsplash.com/photo-1591025207163-942350e47db2?w=800&h=600&fit=crop",
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
      "Mathura is home to some of the most sacred Krishna temples in India. The most important is Shri Krishna Janmabhoomi - the birthplace of Lord Krishna - which opens at 5:00 AM every morning. The morning aarti is at 5:30 AM in summer and 6:30 AM in winter. General darshan continues until 12:00 PM, when the temple closes for the afternoon. It reopens at 4:00 PM and stays open until 9:30 PM. During Janmashtami, the temple stays open all night for the midnight abhishekam marking Krishna's birth.",
      "Dwarkadhish Temple, dedicated to Lord Krishna as the King of Dwarka, is 2 km from Guruvayur Dham. It opens at 6:30 AM for morning darshan (Mangala Aarti at 6:30 AM, Shringar Aarti at 7:15 AM), closes at 10:30 AM, reopens at 4:00 PM, and closes at 7:00 PM after Sandhya Aarti. The temple is especially beautiful during Holi, when the Dwarkadhish Holi procession starts from here.",
      "Banke Bihari Temple in Vrindavan (15 km from Mathura) has unique timings: morning darshan 7:45 AM to 12:00 PM, and evening darshan 5:30 PM to 9:30 PM. The temple famously does not allow cameras - a rule strictly enforced. During the summer, the temple closes for a midday break and the idol is moved to a cooler room. Plan your visit early morning for the shortest queue.",
      "Prem Mandir in Vrindavan is open from 8:30 AM to 8:30 PM continuously. Unlike other temples, it doesn't close for an afternoon break. The evening light-and-sound show at 7:30 PM is a must-see - the entire white marble temple is illuminated with colourful LED lights. Entry is free. This is the most accessible temple for elderly pilgrims and families with children.",
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
      "Children below 10 are not required to follow the dress code strictly, but traditional clothes are appreciated. Photography is prohibited inside all temple sanctums - leave cameras and phones in the locker facilities provided. Guruvayur Dham provides a free locker in every room for valuables.",
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
      "Mathura is in western Uttar Pradesh, 145 km south of Delhi and 60 km north of Agra. The city is well-connected by rail, road, and the nearest airports. Guruvayur Dham is located just 2 minutes from Mathura Junction railway station - the closest accommodation to the station in the city.",
      "By air: The nearest international airport is Indira Gandhi International Airport in Delhi (DEL), about 150 km north of Mathura - a 3-hour drive via the Yamuna Expressway. Pre-paid taxis cost ₹3,000-4,500. Alternatively, Agra's Kheria Airport (AGR) is 60 km south - a 1.5-hour drive. Agra airport has limited flights, so Delhi is the more practical option.",
      "By train: Mathura Junction (MTJ) is on the Delhi-Mumbai main line and is connected to every major Indian city. Over 50 daily trains serve Mathura, including Shatabdi Express from Delhi (2 hours), Taj Express from Delhi (2.5 hours), and trains from Agra (30 min), Vrindavan (15 min via the Vrindavan-Mathura shuttle), Mumbai, Jaipur, and Varanasi. Guruvayur Dham is a 2-minute walk from the station - you can see the property from the platform exit.",
      "By bus: UPSRTC (Uttar Pradesh State Road Transport) operates buses to Mathura from Delhi (every 30 min, ₹150-300, 3 hours), Agra (every 15 min, ₹50, 1 hour), Vrindavan (every 10 min, ₹10, 15 min), and Jaipur (3 daily, ₹250, 5 hours). Private Volvo sleeper buses from Delhi (3 hours, ₹300-500) and Jaipur (5 hours, ₹400-600) arrive at the Mathura bus stand, 1 km from Guruvayur Dham.",
      "By car: From Delhi, take the Yamuna Expressway (165 km, 2.5 hours, toll ₹400 one-way). From Agra, take NH-19 north (60 km, 1.5 hours). From Vrindavan, take the Mathura-Vrindavan road (15 km, 30 min). From Jaipur, take NH-21 via Bharatpur (200 km, 4 hours). Free parking for 25+ vehicles is available at Guruvayur Dham - reserve your spot on WhatsApp before arrival during festival season.",
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
      "Spring (March to April) is when Holi transforms Mathura into the world's most colourful celebration. Lathmar Holi in Barsana (45 km), Phoolon ki Holi in Vrindavan (15 km), and the Dwarkadhish Temple procession in Mathura are once-in-a-lifetime experiences. Temperatures are comfortable (25-35°C). Book 60+ days ahead - this is the most popular time for international tourists.",
      "Summer (May to June) is hot - daytime temperatures reach 40-45°C. The temples are less crowded, and you can often get a room without prior booking on weekdays. AC rooms are essential. Carry an umbrella, light cotton clothes, and plenty of water. Hotel rates drop 20-30%. Morning and evening darshan are strongly preferred - the temple floors get hot underfoot by noon.",
      "Monsoon (July to September) brings relief from the heat with temperatures dropping to 30-35°C. The Yamuna river swells, and the ghats are beautiful. Temples are far less crowded - you can sometimes walk straight into the sanctum on weekday evenings. Rooms are discounted 25-40%. Carry a sturdy umbrella and waterproof footwear. The risk of train delays increases during heavy rain.",
      "If you must pick one week: the week leading up to Janmashtami (August) is the most magical - temples are decorated, kirtans fill the air, and the midnight abhishekam at Krishna Janmabhoomi is an unforgettable experience. For weather without festival crowds: the first two weeks of December are ideal - pleasant temperatures, thin crowds, and the temples are freshly decorated for winter.",
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
      "The Braj region around Mathura is dense with sacred sites connected to Lord Krishna's life. From his birthplace to his childhood playgrounds, every village and hill has a story. After your darshan at Krishna Janmabhoomi, consider spending extra days exploring these sacred destinations - all within an hour's drive from Guruvayur Dham.",
      "1. Shri Krishna Janmabhoomi (3 km, 15 min): The birthplace of Lord Krishna, built over the prison cell where Devaki and Vasudeva were imprisoned. The main temple has a marble stone marking the exact spot of Krishna's birth. Open 5 AM-12 PM, 4-9:30 PM. Free entry. Photography prohibited inside. This is the most important temple in Mathura - start your pilgrimage here.",
      "2. Dwarkadhish Temple (2 km, 7 min): A grand 17th-century temple dedicated to Lord Krishna as the King of Dwarka. Known for its intricate Rajasthani architecture and the famous Holi procession that starts from here. Open 6:30-10:30 AM, 4-7 PM. Free entry. The Sandhya Aarti at 6:30 PM is especially beautiful.",
      "3. Banke Bihari Temple, Vrindavan (15 km, 30 min): The most famous Krishna temple in Vrindavan, known for its unique darshan style where the curtain is pulled open and closed every few minutes (the Lord is said to get shy if stared at too long). Open 7:45 AM-12 PM, 5:30-9:30 PM. No photography. Visit early morning for the shortest queue.",
      "4. Prem Mandir, Vrindavan (15 km, 30 min): A stunning white marble temple built in 2012, dedicated to Radha-Krishna. Beautifully illuminated at night with LED lights. Open 8:30 AM-8:30 PM. Free entry. The evening light-and-sound show at 7:30 PM is a must-see. Most accessible temple for elderly pilgrims - no stairs, wide walkways.",
      "5. Radha Rani Mandir, Barsana (45 km, 1.5 hours): The birthplace of Radha Rani, perched on a hilltop. This is where the famous Lathmar Holi takes place every March. Open 6 AM-9 PM. Free entry. The climb to the top involves 200+ steps - an auto can take you up for ₹50. The view from the top is spectacular.",
      "6. Raman Reti, Gokul (10 km, 20 min): The sacred sand where baby Krishna is said to have played. Pilgrims rub the sand on their bodies as a blessing. Open 6 AM-8 PM. Free entry. A peaceful spot for meditation, away from the crowds. The nearby Gokulnath Temple is also worth visiting.",
      "7. Gowardhan Hill (22 km, 45 min): The hill Krishna lifted to protect villagers from Indra's wrath. Pilgrims perform parikrama (circumambulation) - a 21 km walk around the hill that takes 4-5 hours. Mansi Ganga Kund at the base is a holy bathing spot. Visit during Gowardhan Puja (day after Diwali) for the Annakoot celebration.",
      "8. Vishram Ghat, Mathura (2.2 km, 15 min): The most important ghat on the Yamuna river in Mathura, where Krishna is said to have rested after killing his uncle Kamsa. The evening aarti at sunset is beautiful - hundreds of floating diyas on the Yamuna. Free. Best visited at sunrise or sunset.",
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
      "1. Verify the actual distance to Mathura Junction. Many properties claim 'near station' but are 2-3 km away. Ask for the exact distance - anything beyond 500 m means a 7+ minute walk, which is exhausting for elderly pilgrims with luggage. Guruvayur Dham is 2 minutes from Mathura Junction - you can see it from the platform exit.",
      "2. Book 60+ days ahead for Janmashtami and Holi. These two festivals see 10× the normal pilgrim crowd. All reputable properties within 2 km of Krishna Janmabhoomi are sold out 2 months in advance. Last-minute bookings on these dates either pay 3× the normal rate or land you far from the temples.",
      "3. Always confirm AC actually works. Many budget listings advertise 'AC room' but the AC is either broken or switched off at night. Ask explicitly: 'Is the AC 24×7? Does it have a remote in the room?' At Guruvayur Dham, every AC room has a working remote and 24×7 cooling.",
      "4. Ask about 24×7 hot water. Standard in good hotels, but many budget lodges run the geyser only from 5 AM to 9 AM. If you want a shower after the noon darshan or before evening aarti, you need 24-hour hot water. Confirm before booking.",
      "5. Check the check-in/check-out times. Standard is 11:30 AM check-in, 11 AM check-out. Some properties push 24-hour check-out which can ruin your schedule. Guruvayur Dham offers flexible early check-in for ₹200 extra when the room is ready.",
      "6. Don't pay 100% advance. Reputable properties take 10-25% as booking advance via UPI and the balance on arrival. Anyone demanding full payment via personal UPI is a red flag.",
      "7. Verify room photos are recent. Ask the property to send a fresh WhatsApp photo of the exact room. At Guruvayur Dham, every room has a unique number and live photos are on our website.",
      "8. Confirm parking if driving. On-street parking near temples is impossible during festival days. Ask: 'Do you have on-premise parking? Is it covered?' Guruvayur Dham has free parking for 25+ vehicles.",
      "9. Ask about Vrindavan transport. Mathura to Vrindavan is 15 km - you'll need auto-rickshaws or taxis daily. A hotel that can arrange trusted drivers saves time and money. Guruvayur Dham arranges transport on request.",
      "10. Book poojas in advance. Major poojas at Krishna Janmabhoomi have waiting lists during festival season. Your accommodation should help you book these - Guruvayur Dham's reception does this free for all guests.",
      "11. Check for proximity to multiple temples. Krishna Janmabhoomi (3 km), Dwarkadhish (2 km), and Vishram Ghat (2.2 km) are all short drives from Guruvayur Dham. For Vrindavan temples, you'll need transport - stay in Mathura and do day trips.",
      "12. Save the WhatsApp number. WhatsApp is the fastest way to reach the front desk. Save +91 84455 55584 for direct WhatsApp booking and 24×7 support - average response time under 5 minutes.",
    ],
  },
  // === Hindi blog posts from PDFs 2/3/4 (authentic Mathura-Gokul-Vrindavan temple guides) ===
  {
    slug: "mathura-ke-divy-devaley-evam-upasana-paddhati",
    title: "मथुरा के दिव्य देवालय एवं उपासना-पद्धति · ब्रजभूमि की पावन परम्परा",
    excerpt:
      "ब्रजभूमि की पावन परम्परा, विग्रह स्वरूप, विशिष्ट अर्चना विधि एवं सांस्कृतिक महत्व की मार्गदर्शिका - श्री कृष्ण जन्मभूमि, द्वारकाधीश, भूतेश्वर महादेव, विश्राम घाट",
    category: "मथुरा मंदिर दर्शन",
    readTime: "10 min",
    date: "Feb 18, 2026",
    image:
      "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=800&h=500&fit=crop",
    content: [
      "ब्रज उपासना मर्म: भगवान श्रीकृष्ण की पावन जन्मभूमि मथुरा में पूजा केवल अनुष्ठानिक क्रिया नहीं, बल्कि 'राग-भोग-श्रृंगार' भाव की सेवा है। यहाँ देवाधिदेव को राजाधिराज, बाल गोपाल और युगल सरकार के विभिन्न रूपों में भावपूर्ण लाड लड़ाया जाता है।",
      "१. श्री कृष्ण जन्मभूमि मंदिर संस्थान (प्राकट्य धाम) - द्वापर युग में कंस के कारागार का मूल स्थान, जहाँ भाद्रपद कृष्ण अष्टमी की निशीथ वेला में भगवान विष्णु ने श्रीकृष्ण रूप में अवतार लिया था। गर्भगृह एवं केशवदेव मंदिर (मथुरा नगरी) में बाल-मुकुंद/वासुदेव कृष्ण पूजे जाते हैं। पूजा विशेषता: यहाँ बाल स्वरूप व गर्भगृह के शिलाखंड की पूजा होती है। पंचामृत (दूध, दही, घृत, शहद, शर्करा) से महाभिषेक की प्रधानता है। विशिष्ट अर्चन: जन्माष्टमी पर मध्यरात्रि १२:०० बजे १०८ औषधियों व कामधेनु गौमुख से अभिषेक कर 'धिरकटा' (मंगला) शंखनाद किया जाता है। भोग अर्पण: माखन-मिश्री, पंजीरी, पंचमेवा व धनिया की पंजीरी का विशेष नैवेद्य।",
      "२. श्री द्वारकाधीश मंदिर (राजाधिराज स्वरूप) - सन् १८१४ में सेठ गोकुलदास पारेख द्वारा निर्मित यह मंदिर यमुना तट के समीप स्थित है। सम्प्रदाय: वल्लभ कुल/पुष्टिमार्ग। यहाँ श्रीकृष्ण अपने द्वारका के छत्रपति 'राजाधिराज' रूप में पूजे जाते हैं। अष्टयाम सेवा: मंगला, ग्वाल, राजभोग, उत्थापन, भोग, संध्या आरती और शयन तक ८ पहर की नियमित राजसी पूजा। ऋतु अनुसार श्रृंगार: सावन में सोने-चांदी के भव्य हिंडोले (झूला उत्सव), शरद पूर्णिमा पर श्वेत धवल वस्त्र तथा होली पर अबीर-गुलाल की दिव्य छटा।",
      "३. श्री भूतेश्वर महादेव मंदिर (मथुरा के क्षेत्रपाल) - मान्यता है कि भगवान श्रीकृष्ण के मथुरा आगमन से पूर्व ही भगवान शिव यहाँ नगर-रक्षक रूप में विराजमान हैं। ब्रज परिक्रमा का आरंभ व समापन इनकी आज्ञा से होता है। पूजा विधि: भस्म, आक-धतूरा, बेलपत्र एवं यमुना जल से अभिषेक। सावन के प्रत्येक सोमवार को रुद्र-पाठ व महाआरती। विशेषता: यह सिद्ध शक्तिपीठ भी है जहाँ माता सती के केश गिरे थे; अतः यहाँ शिव और शक्ति दोनों का समन्वय पूजित है।",
      "४. विश्राम घाट एवं यमुना महारानी मंदिर (यमुना पूजन) - कंस वध के उपरांत भगवान श्रीकृष्ण व बलराम जी ने इसी पावन घाट पर विश्राम किया था। यहाँ से ब्रज की २५ प्रमुख तीर्थ चौकियों की परिक्रमा शुरू होती है। अधिष्ठात्री: श्री यमुना महारानी (सूर्यपुत्री)। प्रधान विधि: चुनरी मनोरथ एवं दीपदान। सूर्योदय व सूर्यास्त पर यमुना आरती का अलौकिक दृश्य - सैकड़ों तैरते दीयों के साथ।",
      "यात्रा सुझाव: गुरुवायुर धाम (GVD) से श्री कृष्ण जन्मभूमि १.५ किमी (~१०-१५ मिनट ड्राइव) दूर है। भूतेश्वर महादेव १.८ किमी (~१० मिनट)। द्वारकाधीश २ किमी (~१५ मिनट)। विश्राम घाट २.२ किमी (~१५ मिनट)। एक दिन में सभी चार मंदिरों के दर्शन सुविधाजनक हैं - सुबह ५ बजे जन्मभूमि से शुरुआत करें।",
      "पावन प्रसाद: जन्मभूमि से माखन-मिश्री व पंजीरी; द्वारकाधीश से राजभोग थाली; भूतेश्वर से भस्म व बेलपत्र; विश्राम घाट से दीप-प्रसाद व यमुना-जल।",
    ],
  },
  {
    slug: "gokul-dham-ke-pramukh-mandir-evam-pavan-puja-parampara",
    title: "गोकुल धाम के प्रमुख मंदिर एवं पावन पूजा परम्परा · बाल-लीलाओं की रजधानी",
    excerpt:
      "बाल-लीलाओं की रजधानी: समस्त प्रमुख देवालय, विग्रह स्वरूप, विशिष्ट पूजा विधियां एवं नैवेद्य - नंद भवन, रमण रेती, ब्रह्मांड घाट, ठाकुरानी घाट",
    category: "गोकुल मंदिर दर्शन",
    readTime: "10 min",
    date: "Feb 19, 2026",
    image:
      "https://images.unsplash.com/photo-1583075499-8e9a69bb0c1a?w=800&h=500&fit=crop",
    content: [
      "गोकुल धाम का आध्यात्मिक रहस्य: जन्म मथुरा में लेने के उपरांत वासुदेव जी ने कन्हैया को यमुना पार गोकुल में नंदबाबा के यहाँ सुरक्षित पहुँचाया था। मथुरा में जहाँ प्रभु 'ईश्वर व राजाधिराज' रूप में पूजे जाते हैं, वहीं गोकुल में वे वात्सल्य भाव से 'यशोदा नंदन व बाल-गोपाल' रूप में पलना झुलाए जाते हैं।",
      "१. श्री नंद भवन (चौरासी खंभा मंदिर) - गोकुल का प्रधान महल। यही वह ऐतिहासिक महल है जहाँ नंदबाबा व यशोदा मैया ने कान्हा का पालन-पोषण किया। इसमें चौरासी नक्काशीदार खंभे हैं, जो ८४ लाख योनियों के भवबंधन काटने के प्रतीक हैं। विश्वकर्मा जी द्वारा निर्मित स्तंभ तथा कृष्ण के स्वर्ण पालने का दर्शन। पूजा विशेषता: यहाँ बाल रूप लड्डू गोपाल को पलना (झूला) झुलाने की विशेष पूजा होती है। भक्त संतान प्राप्ति हेतु मौली व चुनरी बाँधते हैं। भोग: मटकी का ताजा सफेद माखन, मिश्री, दूध पेड़ा और मालपुआ।",
      "२. श्री रमण रेती (बाल क्रीड़ा रज-भूमि) - इस रेतीले आंगन में कन्हैया अपने सखाओं (श्रीदामा, सुबल आदि) व गायों के संग धूल में खेलते व लोटते थे। संत ज्ञानानंद जी महाराज की यहाँ दीर्घकालीन तपस्या स्थली रही। यहाँ भक्तगण प्रभु के बाल-स्पर्श युक्त पावन रज में लोटकर 'रज-स्नान' करते हैं, जिससे दैहिक व मानसिक शांति मिलती है। पूजा विशेषता: मिट्टी (रज) का तिलक लगाना, गौ-सेवा, हिरणों को दाना अर्पण तथा रमण बिहारी जी का नित्य धूप-दीप अर्चन।",
      "३. श्री ब्रह्मांड घाट मंदिर - यहाँ कन्हैया ने बाल्यकाल में मिट्टी खाई थी। जब माता यशोदा ने मुख खोलने को कहा, तो कान्हा के मुख में समस्त चराचर जगत, चौदह भुवन व स्वयं यशोदा मैया को अपना ही रूप दिखाई दिया। पूजा विशेषता: ब्रह्मांड घाट की पावन मिट्टी की पूजा व माथे पर तिलक; मिट्टी रूपी 'प्रसादी माटी' का आचमन व यमुना जी की आरती। भोग: माटी भोग (प्रतीकात्मक शुद्ध खांड-मिश्री) एवं दुग्ध नैवेद्य।",
      "४. श्री ठाकुरानी घाट (वल्लभ महाप्रभु बैठक जी) - पुष्टिमार्ग का उद्गम स्थल। गोकुल का यह सर्वप्रमुख घाट है जहाँ श्री वल्लभाचार्य जी को यमुना महारानी ने साक्षात दर्शन दिए थे और यहीं उन्होंने प्रसिद्ध स्तोत्र 'श्री यमुनाष्टक' की रचना की थी। पुष्टिमार्गीय वैष्णव संप्रदाय का आध्यात्मिक केंद्र और ब्रह्म-संबंध दीक्षा स्थल।",
      "यात्रा सुझाव: गुरुवायुर धाम (GVD) से गोकुल के सभी ४ मंदिर १०-१३ किमी (~२५-३० मिनट ड्राइव) दूर हैं। एक दिन में सभी के दर्शन संभव हैं। सुबह ६ बजे नंद भवन से शुरुआत करें, दोपहर तक ब्रह्मांड घाट पहुँचें, शाम को ठाकुरानी घाट पर यमुना आरती के साथ दिन समाप्त करें।",
      "विशेष नोट: गोकुल में कृष्ण 'बाल-गोपाल' रूप में पूजे जाते हैं - अतः यहाँ की सेवा वात्सल्य भाव से होती है, राजसी अनुष्ठानों जैसी नहीं। बाल-लीला का भाव रखें - पलना झुलाने जैसी सरल सेवा सबसे प्रिय है।",
    ],
  },
  {
    slug: "vrindavan-dham-ke-pramukh-devaley-evam-puja-visheshtaye",
    title: "वृंदावन धाम के प्रमुख देवालय एवं पूजा विशेषताएं · राधा-माधव की नित्य क्रीड़ा-स्थली",
    excerpt:
      "राधा-माधव की नित्य क्रीड़ा-स्थली: प्रमुख मंदिर, स्थापत्य कला, दर्शन नियम व विशिष्ट भोग-श्रृंगार - बांके बिहारी, प्रेम मंदिर, राधा रमण, निधिवन राज",
    category: "वृंदावन मंदिर दर्शन",
    readTime: "11 min",
    date: "Feb 20, 2026",
    image:
      "https://images.unsplash.com/photo-1604607678-2c1f0d6f3d8b?w=800&h=500&fit=crop",
    content: [
      "वृंदावन धाम का भक्ति-तत्व: वृंदावन प्रेम-भक्ति की सर्वोच्च पीठ है। यहाँ भगवान श्रीकृष्ण 'ठाकुर जी' और 'बिहारी जी' रूप में लाड़-प्यार की त्रिभंग ललित मुद्रा में पूजे जाते हैं। यहाँ कोई घंटानाद नहीं होता ताकि ठाकुर जी के सुख में विघ्न न पड़े।",
      "१. श्री बांके बिहारी मंदिर (सर्वोपरि जन-आस्था) - संगीत सम्राट स्वामी हरिदास जी की तन्मय साधना से निधिवन में साक्षात राधा-कृष्ण के संयुक्त विग्रह रूप में प्रकट हुए। प्रकटकर्ता: स्वामी हरिदास जी (१५वीं शती)। भाव: सखी भाव/लाड़-प्यार सेवा। विशेषता एवं झांकी पर्दा: यहाँ हर दो मिनट में पर्दा खोला और बंद किया जाता है ताकि कोई भक्त अपनी एकटक दृष्टि से बिहारी जी को बांध न ले। घंटी व मंगला आरती नहीं: बिहारी जी को रात्रि में रासलीला के बाद थकावट न हो, इसलिए यहाँ सुबह मंगला आरती नहीं होती (वर्ष में केवल जन्माष्टमी पर)। भोग: मटकी का पेड़ा, बालभोग में कचौड़ी-जलेबी, शाम को मोहनथाल।",
      "२. श्री प्रेम मंदिर (दिव्य प्रेम मंदिर) - निर्माता: जगद्गुरु श्री कृपालु जी महाराज। स्वरूप: राधा गोविंद व सीताराम युगल। ५४ एकड़ में फैला यह मंदिर इतालवी कैराड़ा संगमरमर से निर्मित है। इसकी दीवारों पर श्रीकृष्ण की लीलाओं का सजीव शिल्प उकेरा गया है। विशेषता: संध्या समय अत्याधुनिक बहुरंगी प्रकाश (LED Lighting) तथा संगीतमय फव्वारे द्वारा रासलीला व गोवर्धन धारण लीला का प्रदर्शन। पूजा पद्धति: युगल सरकार की संकीर्तन-प्रधान उपासना एवं विशुद्ध वैदिक भाव से नित्य आरती-वंदन।",
      "३. श्री राधा रमण मंदिर (स्वयंभू शालिग्राम विग्रह) - प्रकटकर्ता: श्री गोपाल भट्ट गोस्वामी (सन् १५४२)। दामोदर शालिग्राम शिला से बिना किसी छेनी-हथौड़े के स्वयं प्रकट हुआ अत्यंत मनोहारी विग्रह। ५०० वर्षों से अखंड रसोई अग्नि: मंदिर में रसोई की अग्नि पिछले पाँच सौ वर्षों से कभी नहीं बुझी है; इसी से भोग तैयार होता है। राधा रानी का स्वरूप: यहाँ राधा जी की कोई पृथक प्रतिमा नहीं है; विग्रह के वाम भाग में गोमती चक्र व राधा जी का ताज पूजित रहता है। पूजा विशेषता: प्रातः काल दूध-मिश्री से महाभिषेक व अत्यंत सात्विक अष्टयाम राग सेवा।",
      "४. पवित्र निधिवन राज (नित्य रास स्थली) - मान्यता है कि यहाँ आज भी हर रात्रि को भगवान श्रीकृष्ण, श्री राधा जी एवं गोपियों संग रासलीला करने पधारते हैं। यहाँ के वृक्ष युगल रूप में एक-दूसरे से आलिंगनबद्ध हैं। रात्रि में शयन सेवा: रंग महल में प्रतिदिन शाम को चंदन का पलंग, दातुन, पान का बीड़ा, जल व श्रृंगार सामग्री सजाई जाती है; सुबह वह उपयोग की हुई मिलती है। कड़ा नियम: सूर्यास्त के बाद पशु-पक्षी भी इस वन को छोड़ देते हैं। रात्रि में किसी भी मनुष्य का रुकना सर्वथा वर्जित है।",
      "यात्रा सुझाव: गुरुवायुर धाम (GVD) से वृंदावन के सभी ४ मंदिर १५-१६ किमी (~२५-३० मिनट ड्राइव) दूर हैं। एक दिन में सभी के दर्शन संभव हैं - सुबह ८ बजे बांके बिहारी से शुरुआत करें, दोपहर तक राधा रमण पहुँचें, शाम को प्रेम मंदिर के LED + फव्वारे शो देखें, और सूर्यास्त से पहले निधिवन जाएँ।",
      "⚠️ निधिवन के लिए विशेष सतर्कता: सूर्यास्त के बाद निधिवन में किसी भी मनुष्य का ठहरना वर्जित है। सुबह ७-१० बजे के बीच ही दर्शन करें, सूर्यास्त से कम से कम ३० मिनट पहले बाहर निकल जाएँ। यह नियम अत्यंत कड़ाई से लागू है - वन के पशु-पक्षी भी स्वयं सूर्यास्त से पहले वन छोड़ देते हैं।",
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
    a: "Standard check-in is 11:30 AM and check-out is 11:00 AM. Early check-in (from 8 AM) is available for ₹200 extra if the room is ready. Late check-out till 2 PM is ₹300; half-day extension till 6 PM is ₹600.",
  },
  {
    q: "Do you offer free pickup from the railway station or bus stand?",
    a: "Yes, complimentary pickup from Mathura Junction Railway Station (2 km) is included for guests staying 2 or more nights. Just WhatsApp us your train details 2 hours before arrival. Pickup from Agra Cantt (60 km) is ₹600.",
  },
  {
    q: "Is parking free? Do you have space for buses?",
    a: "Yes · we have free covered parking for 25 cars and 5 bikes inside the property. For tempo travellers and buses, we arrange dedicated parking at a partner lot 300 m away for ₹200/night.",
  },
  {
    q: "Can I book a pooja through you? Which poojas are available?",
    a: "Absolutely · we book all major Mathura temple poojas on behalf of our guests at the official temple rate, with no commission. Popular options include Mangala Aarti (₹51), Pushpanjali (₹21), Sandhya Aarti (₹101), Rajbhog Aarti (₹251), Abhishek (₹1,100), and Annadan (₹2,100). Browse the Pooja section above and click 'Book This Pooja' on WhatsApp.",
  },
  {
    q: "What is the dress code for the temple?",
    a: "Modest clothing is required at all Mathura-Braj temples. Men should wear trousers or dhoti and a shirt (no shorts or sleeveless tops). Women should wear saree, salwar kameez, or a long dress with a dupatta to cover the head inside the sanctum. Always remove footwear before entering the temple complex. We keep spare stoles and socks at reception (refundable ₹100 deposit) for guests who arrive unprepared. Krishna Janmabhoomi also restricts leather items and electronics inside the inner sanctum.",
  },
  {
    q: "Do you serve food at the property?",
    a: "We don't have an in-house restaurant, but we have tie-ups with three pure-veg restaurants within 200 m · order from your room and they deliver in 20 minutes, or walk over for a sit-down meal. Complimentary chai and biscuits are served at reception every morning from 6 to 8 AM.",
  },
  {
    q: "Are pets allowed?",
    a: "Unfortunately, no. The temple vicinity is a pet-free zone by municipal regulation, and our own insurance does not cover pets on the premises. We can recommend a trusted pet boarding facility in Agra (60 km) if you're travelling with a pet.",
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
    a: "Yes, we welcome guests of all nationalities. We accept payment in INR via UPI, cards (Visa/Mastercard/RuPay), and cash. For foreign currency, we direct you to the licensed forex counter at Mathura Junction. Our staff speaks English, Hindi, Braj Bhasha, and Bengali.",
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
