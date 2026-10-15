/* ==========================================================================
   CONFIG - the only file you edit to turn this page into a different gym.
   Everything on the page is rendered from this object by script.js.

   Cloning for a new niche:
     1. Copy the folder.
     2. Edit this file (copy, times, coaches, images, theme.accent).
     3. Swap the THEME TOKENS block at the top of styles.css if you want a
        different palette, radius or type scale.
     4. Replace the files in /images.

   Everything marked DEMO DATA is invented for the Ironline Strength demo.
   Replace it with the real gym's numbers, or delete the key to hide it.
   ========================================================================== */

window.CONFIG = {
  /* ---- Brand --------------------------------------------------------- */
  brand: {
    name: "Ironline Strength",            // used in the payload, alt text, map title, success panel
    wordmark: ["Ironline", "Strength"],   // header + footer logo; second word drops away on small phones
    city: "Austin, TX",
  },

  /* ---- Page meta ----------------------------------------------------- */
  meta: {
    title: "Ironline Strength | Free first class in Austin, TX",
    description:
      "Group strength and conditioning in Austin. Book a free first class in under a minute. No card needed.",
  },

  /* ---- Theme --------------------------------------------------------- */
  theme: {
    accent: "#DE3221",   // the ONE accent colour. Hover tint, error tint and focus are derived from it in CSS.
    overrides: {},       // optional extra tokens, e.g. { "--bg": "#0b0f14", "--radius": "2px" }
  },

  /* ---- Booking ------------------------------------------------------- */
  // Leave empty to simulate a successful booking after 900ms (logged to the console).
  // Point it at an n8n Webhook node (POST, JSON). Allow your site origin under the node's CORS option.
  webhookUrl: "",

  cta: {
    label: "Book free class",            // the ONE CTA label: header, sticky bar, final CTA
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

  /* ---- Hero ---------------------------------------------------------- */
  heroVideo: "", // e.g. "images/hero.mp4" (muted, looping, 6 to 8s). Empty = use the still. Ignored if the visitor prefers reduced motion.
  hero: {
    headline: "First class is on us",   // max 2 lines, under 8 words
    subtext: "Try a full coached group class for free. No card needed, and every move is scaled to you.", // max 20 words
    image: { src: "images/hero.jpg", alt: "Members mid-workout in the Ironline gym" },
    // DEMO DATA: believable, slightly uneven numbers. Replace with the gym's real figures.
    rating: { score: "4.9", count: "187", source: "Google reviews" },
    members: { count: "240+", label: "members" },
  },

  /* ---- Social proof (3 quotes, keep each to ~3 lines) ------------------ */
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
      name: "Priya Nair",
      tenure: "Training here for 8 months",
      image: { src: "images/member-2.jpg", alt: "Priya Nair, member" },
    },
    {
      quote: "I came for the free class and stayed because the room pushes you without the ego.",
      name: "Tom Alvarado",
      tenure: "Training here for 3 years",
      image: { src: "images/member-3.jpg", alt: "Tom Alvarado, member" },
    },
  ],

  /* ---- Your first class, start to finish -------------------------------- */
  firstClass: {
    title: "Your first class, start to finish",
    intro: "Nothing about your first visit should be a surprise.",
    steps: [
      {
        label: "Arrive 10 minutes early",
        text: "A coach meets you at the door, checks you in, and shows you where everything is.",
        image: { src: "images/first-class-1.jpg", alt: "A coach welcoming a new member at the front desk" },
      },
      {
        label: "Wear gym clothes and trainers",
        text: "Shorts or leggings, a tee, and flat shoes. Bring water and we will handle the rest.",
        image: { src: "images/first-class-2.jpg", alt: "Members in everyday training clothes tying their shoes" },
      },
      {
        label: "A warm-up anyone can do",
        text: "Easy movement led by your coach to get loose. No experience needed.",
        image: { src: "images/first-class-3.jpg", alt: "The class warming up together on the floor" },
      },
      {
        label: "A workout scaled to you",
        text: "Every movement is adjusted to your level, so nobody gets thrown in the deep end.",
        image: { src: "images/first-class-4.jpg", alt: "A coach adjusting a new member's barbell setup" },
      },
    ],
  },

  /* ---- Schedule (trial slots) ------------------------------------------ */
  // DEMO DATA. `day` is sent in the payload; `short` is the chip label.
  schedule: {
    title: "Pick your time",
    intro: "Tap a slot and we will fill in the form for you.",
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
  },

  /* ---- Coaches (2) ------------------------------------------------------ */
  // DEMO DATA: fictional coaches.
  coaches: {
    title: "Meet your coaches",
    list: [
      {
        name: "Dani Reyes",
        focus: "Barbell strength",
        line: "Teaches the squat, press and deadlift to first-timers and competitive lifters alike.",
        image: { src: "images/coach-1.jpg", alt: "Coach Dani Reyes holding a barbell" },
      },
      {
        name: "Cal Brennan",
        focus: "Conditioning and mobility",
        line: "Builds the engine classes, and keeps new members moving well and injury free.",
        image: { src: "images/coach-2.jpg", alt: "Coach Cal Brennan coaching a class" },
      },
    ],
  },

  /* ---- Location --------------------------------------------------------- */
  location: {
    title: "No surprises on day one",
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
  },

  /* ---- Final CTA -------------------------------------------------------- */
  finalCta: {
    title: "Come train with us",
    text: "One free class. No card. Pick a time and we will see you there.",
    image: { src: "images/gym-wide.jpg", alt: "The Ironline gym floor ready for class" },
  },

  /* ---- Footer ----------------------------------------------------------- */
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
