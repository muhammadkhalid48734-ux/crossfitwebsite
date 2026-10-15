/* ==========================================================================
   CONFIG - the only file you edit to turn this site into a different gym.
   Every page (index, first-class, schedule, coaches, memberships, visit)
   is rendered from this object by script.js.

   Cloning for a new niche:
     1. Copy the folder.
     2. Edit this file (copy, times, coaches, plans, images, theme.accent).
     3. Swap the THEME TOKENS block at the top of styles.css if you want a
        different palette, radius or type scale.
     4. Replace the files in /images.

   Everything marked DEMO DATA is invented for the Ironline Strength demo.
   Replace it with the real gym's numbers, or delete the key to hide it.
   ========================================================================== */

window.CONFIG = {
  /* ---- Brand --------------------------------------------------------- */
  brand: {
    name: "Ironline Strength",            // payload, alt text, map title, success panel
    wordmark: ["Ironline", "Strength"],   // header + footer logo; second word drops away on small phones
    city: "Austin, TX",
  },

  /* ---- Theme --------------------------------------------------------- */
  theme: {
    accent: "#DE3221",   // the ONE accent colour. Hover tint, error tint and focus are derived from it in CSS.
    overrides: {},       // optional extra tokens, e.g. { "--bg": "#0b0f14", "--radius": "2px" }
  },

  /* ---- Navigation (header + footer + mobile menu) ----------------------- */
  nav: [
    { label: "First class", href: "first-class.html", page: "first-class" },
    { label: "Schedule",    href: "schedule.html",    page: "schedule" },
    { label: "Coaches",     href: "coaches.html",     page: "coaches" },
    { label: "Memberships", href: "memberships.html", page: "memberships" },
    { label: "Visit",       href: "visit.html",       page: "visit" },
  ],

  /* ---- Page meta (tab title + description for each page) ---------------- */
  meta: {
    home: {
      title: "Ironline Strength | Free first class in Austin, TX",
      description: "Group strength and conditioning in Austin. Book a free first class in under a minute. No card needed.",
    },
    "first-class": {
      title: "Your first class | Ironline Strength",
      description: "Exactly what happens at your first Ironline class: what to wear, what to bring and how every workout is scaled to you.",
    },
    schedule: {
      title: "Class schedule | Ironline Strength",
      description: "Morning, midday and evening classes at Ironline Strength in Austin. Pick a slot for your free first class.",
    },
    coaches: {
      title: "Coaches | Ironline Strength",
      description: "Meet the coaches at Ironline Strength: small classes, hands-on coaching and a plan for every body.",
    },
    memberships: {
      title: "Memberships | Ironline Strength",
      description: "Simple month to month memberships at Ironline Strength. No joining fee, no contract. Try a class free first.",
    },
    visit: {
      title: "Visit | Ironline Strength",
      description: "Address, parking, hours and contact details for Ironline Strength in Austin, TX.",
    },
  },

  /* ---- Booking ------------------------------------------------------- */
  // Leave empty to simulate a successful booking after 900ms (logged to the console).
  // Point it at an n8n Webhook node (POST, JSON). Allow your site origin under the node's CORS option.
  webhookUrl: "",

  // Pages without a booking form send visitors here. The page must be one that renders the booking card.
  bookingPage: "schedule.html",

  cta: {
    label: "Book free class",            // the ONE CTA label: header, sticky bar, final CTA, plan cards
    submitLabel: "Book my free class",   // the form's submit button
    submittingLabel: "Booking your class",
    retryLabel: "Try again",
    microcopy: "No card needed. Cancel anytime.",
  },

  form: {
    title: "Your free class",
    intro: "Pick a time, then tell us who is coming.",
    labels: {
      firstName: "First name",
      phone: "Phone",
      email: "Email",
      slot: "Preferred class slot",
    },
    placeholders: { firstName: "Alex", phone: "(512) 555-0142", email: "you@example.com" }, // DEMO DATA
    errors: {
      firstName: "Enter your first name so your coach can greet you.",
      phone: "Enter your full phone number, area code first.",
      email: "Enter an email like name@example.com so we can send your confirmation.",
      slot: "Pick a day, then a time, to finish booking.",
      submit: "We could not send your booking. Your details are still here, so check your connection and try again.",
    },
    success: {
      title: "You are booked, {firstName}",          // {firstName} is replaced
      body: "A confirmation email is on the way to {email}.", // {email} is replaced
      note: "Arrive 10 minutes early and wear shoes you can move in.",
    },
  },

  /* ================== HOME ================================================= */
  heroVideo: "", // e.g. "images/hero.mp4" (muted, looping, 6 to 8s). Empty = use the still. Ignored if the visitor prefers reduced motion.
  hero: {
    headline: "First class is on us",   // max 2 lines, under 8 words
    subtext: "Try a full coached group class for free. No card needed, and every move is scaled to you.", // max 20 words
    image: { src: "images/hero.jpg", alt: "Members squatting with barbells in a group class" },
    // DEMO DATA: believable, slightly uneven numbers. Replace with the gym's real figures.
    rating: { score: "4.9", count: "187", source: "Google reviews" },
    members: { count: "240+", label: "members" },
  },

  // DEMO DATA: fictional members.
  testimonials: [
    {
      quote: "I had not touched a barbell in years. Day one felt welcoming, not scary.",
      name: "Marcus Webb",
      tenure: "Training here for 2 years",
      image: { src: "images/member-1.jpg", alt: "Marcus Webb, member" },
    },
    {
      quote: "The coaches know my name and my bad shoulder. Best hour of my day.",
      name: "Katie Moore",
      tenure: "Training here for 8 months",
      image: { src: "images/member-2.jpg", alt: "Katie Moore, member" },
    },
    {
      quote: "I came for the free class and stayed because the room pushes you without the ego.",
      name: "Tom Alvarado",
      tenure: "Training here for 3 years",
      image: { src: "images/member-3.jpg", alt: "Tom Alvarado, member" },
    },
  ],

  /* ================== FIRST CLASS ========================================= */
  firstClass: {
    title: "Your first class, start to finish",   // home section + stepper heading
    intro: "Nothing about your first visit should be a surprise. Tap a moment to see it.",
    moreLabel: "Read the full first class guide",
    // The four moments. Each has a photo; the label is the content, so there are no step numbers.
    steps: [
      {
        label: "Arrive 10 minutes early",
        text: "A coach meets you at the door, checks you in, and shows you where everything is.",
        image: { src: "images/first-class-1.jpg", alt: "A coach and a member talking by the gym door" },
      },
      {
        label: "Wear gym clothes and trainers",
        text: "Shorts or leggings, a tee, and flat shoes. Bring water and we will handle the rest.",
        image: { src: "images/first-class-2.jpg", alt: "Trainers on a plyo box in the gym" },
      },
      {
        label: "A warm-up anyone can do",
        text: "Easy movement led by your coach to get loose. No experience needed.",
        image: { src: "images/first-class-3.jpg", alt: "The class warming up together with light weights" },
      },
      {
        label: "A workout scaled to you",
        text: "Every movement is adjusted to your level, so nobody gets thrown in the deep end.",
        image: { src: "images/first-class-4.jpg", alt: "A coach helping a member set up at the barbell" },
      },
    ],
    // Content for first-class.html
    page: {
      title: "Everyone starts somewhere",
      intro: "Most of our members had never touched a barbell. Here is exactly how a first visit goes.",
      image: { src: "images/community.jpg", alt: "Members laughing together in the gym" },
    },
    bring: {
      title: "What to bring",
      intro: "Not much. We supply the equipment, the coaching and the encouragement.",
      image: { src: "images/bring-gear.jpg", alt: "Training shoes, a slam ball and a skipping rope on the gym floor" },
      items: [
        { icon: "drop",         label: "A water bottle", text: "There is a refill station by the door." },
        { icon: "sneaker",      label: "Flat shoes",     text: "Trainers or lifting shoes. No bare feet on the floor." },
        { icon: "towel",        label: "A towel",        text: "Optional. We keep spares at the front desk." },
        { icon: "check-circle", label: "Nothing else",   text: "No card, no deposit, no forms to print. Your coach already has your name." },
      ],
    },
    faqsTitle: "Questions we hear a lot",
    faqs: [
      { q: "Do I need to be fit to join?", a: "No. Every class is scaled, so a first timer and a regular do the same session at different weights." },
      { q: "What if I have an injury?", a: "Tell your coach when you arrive. They will swap any movement that does not work for you." },
      { q: "Is the first class really free?", a: "Yes. No card, no deposit, and no pressure to join afterward." },
      { q: "How long is a class?", a: "About an hour, including the warm-up and a short cool-down." },
      { q: "Can I bring a friend?", a: "Yes. Book them a free class too and you can train side by side." },
      { q: "What if I need to cancel?", a: "Reply to your confirmation email or call us. There is never a charge." },
    ],
  },

  /* ================== SCHEDULE ============================================ */
  // DEMO DATA. `day` is sent in the payload; `short` is the chip label.
  // Slots are grouped into Morning / Midday / Evening automatically from their time.
  schedule: {
    title: "Pick your time",
    intro: "Mornings, lunch breaks and evenings. Tap a slot and we will fill in the form for you.",
    moreLabel: "See the full schedule",
    periods: [
      { key: "morning", label: "Morning" },
      { key: "midday",  label: "Midday" },
      { key: "evening", label: "Evening" },
    ],
    days: [
      { day: "Monday", short: "Mon", slots: [
        { time: "6:00 AM", label: "Strength" }, { time: "12:00 PM", label: "Conditioning" }, { time: "5:30 PM", label: "Strength" } ] },
      { day: "Tuesday", short: "Tue", slots: [
        { time: "6:00 AM", label: "Conditioning" }, { time: "12:00 PM", label: "Strength" }, { time: "6:30 PM", label: "Conditioning" } ] },
      { day: "Wednesday", short: "Wed", slots: [
        { time: "6:00 AM", label: "Strength" }, { time: "12:00 PM", label: "Mixed" }, { time: "5:30 PM", label: "Strength" } ] },
      { day: "Thursday", short: "Thu", slots: [
        { time: "6:00 AM", label: "Conditioning" }, { time: "5:30 PM", label: "Strength" }, { time: "6:30 PM", label: "Conditioning" } ] },
      { day: "Friday", short: "Fri", slots: [
        { time: "6:00 AM", label: "Strength" }, { time: "12:00 PM", label: "Conditioning" }, { time: "5:30 PM", label: "Mixed" } ] },
      { day: "Saturday", short: "Sat", slots: [
        { time: "8:00 AM", label: "Team workout" }, { time: "9:30 AM", label: "Strength" } ] },
    ],
    // Content for schedule.html
    page: {
      title: "Find a class that fits your week",
      intro: "Every slot below is open for your free first class. Pick one and book it on this page.",
      image: { src: "images/classes-wide.jpg", alt: "Two members training on the gym floor with a barbell" },
    },
    classTypesTitle: "What the classes are",
    classTypes: [
      { label: "Strength",     text: "Heavy, simple barbell work. Squat, press and pull, with a coach on every set." },
      { label: "Conditioning", text: "Short, hard intervals on bikes, rowers and bodyweight. Built for fitness, not for show." },
      { label: "Mixed",        text: "A bit of both, scaled to whoever is in the room that day." },
      { label: "Team workout", text: "Saturday partner session. Louder, friendlier and a good first class with a friend." },
    ],
    durationNote: "Every class runs about an hour.",
  },

  /* ================== COACHES ============================================= */
  // DEMO DATA: fictional coaches.
  coaches: {
    title: "Meet your coaches",
    moreLabel: "Read their stories",
    list: [
      {
        name: "Dani Reyes",
        focus: "Barbell strength",
        line: "Teaches the squat, press and deadlift to first-timers and competitive lifters alike.",
        bio: "Dani has coached barbell strength for ten years and still gets excited by a first deadlift. Expect clear cues, patient resets and a lot of encouragement.",
        credentials: ["Level 2 strength coach", "Former state powerlifting competitor", "First aid and CPR certified"],
        ask: "Ask Dani about squat technique, coming back after a break, or your first pull-up.",
        image: { src: "images/coach-1.jpg", alt: "Coach Dani Reyes standing in the gym" },
      },
      {
        name: "Cal Brennan",
        focus: "Conditioning and mobility",
        line: "Builds the engine classes, and keeps new members moving well and injury free.",
        bio: "Cal runs the conditioning and mobility classes. He builds every session around how people actually move, so new members leave feeling better, not wrecked.",
        credentials: ["Mobility specialist", "Endurance coach", "First aid and CPR certified"],
        ask: "Ask Cal about shoulder and hip mobility, pacing a workout, or training around an injury.",
        image: { src: "images/coach-2.jpg", alt: "Coach Cal Brennan in a coach shirt" },
      },
    ],
    page: {
      title: "Coaches who remember your name",
      intro: "Small classes, hands-on coaching and a plan for every body.",
      image: { src: "images/hero.jpg", alt: "Members squatting with barbells in a group class" },
    },
    credentialsTitle: "Background",
  },

  /* ================== MEMBERSHIPS ========================================= */
  // DEMO DATA: invented prices. Replace with the gym's real plans.
  memberships: {
    page: {
      title: "Simple membership, no tricks",
      intro: "Start with a free class. If it clicks, pick the plan that fits. No joining fee, no contract.",
      image: { src: "images/equipment-wide.jpg", alt: "Ropes and straps hanging on the gym wall" },
    },
    plansTitle: "Pick a plan after your free class",
    plans: [
      {
        name: "Starter",
        price: "$89",
        per: "per month",
        blurb: "For a steady weekly rhythm.",
        features: ["Three classes a week", "Coaching in every session", "Pause any month"],
      },
      {
        name: "Unlimited",
        price: "$129",
        per: "per month",
        blurb: "Train as often as you like.",
        features: ["Unlimited classes", "Open gym on Saturdays", "One guest pass a month", "Pause any month"],
        featured: true,
        tag: "Most popular",
      },
      {
        name: "Drop in",
        price: "$25",
        per: "per class",
        blurb: "For busy weeks and visitors.",
        features: ["Pay as you go", "Book any open class", "No commitment"],
      },
    ],
    includedTitle: "Every plan includes",
    included: [
      { icon: "users-three",    text: "Coached classes in small groups, never a video" },
      { icon: "barbell",        text: "Workouts scaled to every level and every body" },
      { icon: "calendar-check", text: "Month to month, cancel or pause any time" },
      { icon: "hand-heart",     text: "A free first class before you commit" },
    ],
    faqsTitle: "Before you ask",
    faqs: [
      { q: "Is there a contract?", a: "No. Memberships are month to month, and you can pause or cancel any time." },
      { q: "Is there a joining fee?", a: "No joining fee, ever." },
      { q: "Can I switch plans?", a: "Yes. Change plan whenever you like and it starts from the next billing date." },
      { q: "Do you offer student or military rates?", a: "Ask your coach after your first class and they will sort it out." },
    ],
  },

  /* ================== VISIT / LOCATION ==================================== */
  location: {
    title: "No surprises on day one",
    moreLabel: "Parking, hours and contact",
    // DEMO DATA: made-up address. Point lat/lng at the real gym.
    address: { street: "1840 Foundry Lane", city: "Austin", state: "TX", zip: "78702" },
    lat: 30.2646,
    lng: -97.7183,
    mapImage: "",              // optional static map image path; if empty an OpenStreetMap embed is used
    mapAlt: "Map showing the gym location in east Austin",
    directionsLabel: "Get directions",
    facts: [
      { icon: "car-simple", label: "Parking", text: "Free lot behind the building, plus street parking on Foundry Lane." },
      { icon: "backpack",   label: "What to bring", text: "Water bottle and a towel if you like. We have spares." },
      { icon: "clock",      label: "How early", text: "Arrive 10 minutes before class so you can check in without rushing." },
    ],
    page: {
      title: "Find the box",
      intro: "Easy to reach, easy to park and easy to walk into.",
      image: { src: "images/entrance.jpg", alt: "The wooden entrance doors of the gym in a brick wall" },
    },
    entranceTitle: "Look for the wooden doors",
    entranceImage: { src: "images/first-class-1.jpg", alt: "A coach greeting a member at the gym door" },
    entranceText: "We are the brick building with the big wooden doors. Ring the bell if they are closed and a coach will let you in.",
    hoursTitle: "Opening hours",
    contactTitle: "Talk to a human",
    contactText: "Questions before you book? Call, email or message us. We reply the same day.",
  },

  /* ================== FINAL CTA (every page) ============================== */
  finalCta: {
    title: "Come train with us",
    text: "One free class. No card. Pick a time and we will see you there.",
    image: { src: "images/gym-wide.jpg", alt: "The gym floor with racks and open space" },
  },

  /* ================== FOOTER (every page) ================================= */
  // DEMO DATA: placeholder contact details and social links.
  footer: {
    phone: "(512) 555-0142",
    email: "hello@ironlinestrength.example",
    hours: [
      { days: "Monday to Friday", hours: "5:30 AM to 8:00 PM" },
      { days: "Saturday", hours: "7:30 AM to 12:00 PM" },
      { days: "Sunday", hours: "Closed" },
    ],
    socials: [
      { label: "Instagram", icon: "instagram-logo", url: "https://www.instagram.com/" },
      { label: "Facebook", icon: "facebook-logo", url: "https://www.facebook.com/" },
    ],
  },
};
