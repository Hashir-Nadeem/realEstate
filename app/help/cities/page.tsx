export const metadata = {
  title: "City-wise Property FAQs in Pakistan",
  description:
    "Explore real estate FAQs for Islamabad, Lahore, Karachi and other major cities.",
};

export default function CityFaqPage() {
const cities = [
  {
  name: "Hyderabad",
  color: "text-blue-600",
  id: "hyderabad",
  faqs: [
    {
      question: "What are the best areas to invest in Hyderabad real estate?",
      answer:
        "Gachibowli, Hitech City, Kukatpally, and Banjara Hills are top investment areas due to strong infrastructure and demand.",
    },
    {
      question: "How much do apartments in Hyderabad cost?",
      answer:
        "Prices vary widely, from affordable options in Kukatpally to premium apartments in Gachibowli and Banjara Hills.",
    },
    {
      question: "Where can I find affordable apartments in Hyderabad?",
      answer:
        "LB Nagar, Miyapur, and Uppal offer budget-friendly housing with good connectivity.",
    },
    {
      question: "Are there ready-to-move flats available in Hyderabad?",
      answer:
        "Yes, many residential projects offer ready-to-move flats and villas with modern amenities.",
    },
    {
      question: "How can I find luxury villas in Hyderabad?",
      answer:
        "Luxury villas are mainly located in Gachibowli, Jubilee Hills, Banjara Hills, and Kondapur.",
    },
    {
      question: "What are the current real estate trends in Hyderabad?",
      answer:
        "High demand for gated communities, luxury apartments, and IT corridor developments.",
    },
    {
      question: "How do I choose a trusted Hyderabad real estate agent?",
      answer:
        "Look for agents with verified listings, good reviews, and strong local expertise.",
    },
    {
      question: "Can I invest in commercial property in Hyderabad?",
      answer:
        "Yes, Hitech City, Gachibowli, and Banjara Hills are top commercial investment hubs.",
    },
    {
      question: "What is the rental market like in Hyderabad?",
      answer:
        "Rental demand is strong near IT hubs like Gachibowli, Hitech City, and Kondapur.",
    },
    {
      question: "How do Hyderabad property prices vary by location?",
      answer:
        "Premium areas include Banjara Hills and Jubilee Hills, while LB Nagar and Uppal are more affordable.",
    }
  ]
  },

 {
  name: "Chennai",
  color: "text-green-600",
  id: "chennai",
  faqs: [
    {
      question: "What are the best areas to invest in Chennai real estate?",
      answer:
        "OMR, ECR, Anna Nagar, and Adyar are top locations due to strong connectivity and rising demand.",
    },
    {
      question: "How much do apartments in Chennai cost?",
      answer:
        "Prices vary by location, ranging from affordable options in Velachery to premium flats in ECR and OMR.",
    },
    {
      question: "Where can I find affordable apartments in Chennai?",
      answer:
        "Velachery, Porur, and Tambaram are popular areas offering budget-friendly housing with good amenities.",
    },
    {
      question: "Are there ready-to-move flats available in Chennai?",
      answer:
        "Yes, many residential projects across Chennai offer ready-to-move apartments and villas.",
    },
    {
      question: "How can I find luxury villas in Chennai?",
      answer:
        "Luxury villas are mainly located in ECR, OMR, and parts of South Chennai.",
    },
    {
      question: "What are the current real estate trends in Chennai?",
      answer:
        "Growing demand for gated communities, luxury apartments, and IT corridor developments along OMR and ECR.",
    },
    {
      question: "How do I choose a trusted Chennai real estate agent?",
      answer:
        "Look for agents with verified listings, strong reviews, and experience in areas like Anna Nagar and Adyar.",
    },
    {
      question: "Can I invest in commercial property in Chennai?",
      answer:
        "Yes, OMR, Guindy, and T Nagar are major business hubs for commercial investments.",
    },
    {
      question: "What is the rental market like in Chennai?",
      answer:
        "Rental demand is high in IT corridors like OMR and ECR with strong demand for apartments and villas.",
    },
    {
      question: "How do Chennai property prices vary by location?",
      answer:
        "Prices are highest in ECR, OMR, and Anna Nagar, while Porur and Tambaram are more affordable.",
    },
  ],
},

{
  name: "Delhi",
  color: "text-purple-600",
  id: "delhi",
  faqs: [
    {
      question: "What are the best areas to invest in Delhi real estate?",
      answer:
        "Top areas include South Delhi, Dwarka, Rohini, and East Delhi, offering a mix of luxury and affordable housing.",
    },
    {
      question: "Where can I find affordable apartments in Delhi?",
      answer:
        "Dwarka and Rohini are popular for affordable apartments with good connectivity and amenities.",
    },
    {
      question: "Are there luxury villas for sale in Delhi NCR?",
      answer:
        "Yes, luxury villas are available in South Delhi, Chattarpur, Vasant Vihar, and Gurugram.",
    },
    {
      question: "What are the property prices in Delhi by location?",
      answer:
        "South Delhi is premium (₹20,000–₹30,000/sq.ft), while Dwarka and Rohini are more affordable (₹6,000–₹12,000/sq.ft).",
    },
    {
      question: "Can I invest in commercial property in Delhi?",
      answer:
        "Yes, Connaught Place and other business hubs offer strong commercial investment opportunities.",
    },
    {
      question: "Are ready-to-move flats available in Delhi?",
      answer:
        "Yes, especially in East Delhi areas like Laxmi Nagar, Mayur Vihar, and Preet Vihar.",
    },
    {
      question: "What are the real estate trends in Delhi NCR?",
      answer:
        "Growing demand for gated communities, smart homes, and metro-connected housing.",
    },
    {
      question: "How do I find top real estate agents in Delhi?",
      answer:
        "Look for agents with verified listings, strong reviews, and experience in Delhi NCR markets.",
    },
    {
      question: "Which are the best upcoming residential projects in Delhi?",
      answer:
        "Upcoming projects are concentrated in Dwarka, Chattarpur, and East Delhi.",
    },
    {
      question: "How can I maximize returns on Delhi real estate investments?",
      answer:
        "Invest near metro stations, IT hubs, and choose reputed builders for better appreciation.",
    },
  ],
},

 {
  name: "Kolkata",
  color: "text-pink-600",
  id: "kolkata",
  faqs: [
    {
      question: "What are the best areas to invest in Kolkata real estate?",
      answer:
        "Top areas include Salt Lake, Rajarhat New Town, Ballygunge, and Tollygunge due to good connectivity and rising demand.",
    },
    {
      question: "Where can I find affordable apartments for sale in Kolkata?",
      answer:
        "Garia, Dum Dum, Madhyamgram, and Barasat offer budget-friendly housing options.",
    },
    {
      question: "Are there luxury flats in Kolkata?",
      answer:
        "Yes, luxury flats are available in Ballygunge, Alipore, EM Bypass, and New Town.",
    },
    {
      question: "What are the current Kolkata property prices?",
      answer:
        "Prices start around ₹3,000/sq.ft in suburbs and can go beyond ₹12,000/sq.ft in prime areas.",
    },
    {
      question: "Can I invest in commercial property in Kolkata?",
      answer:
        "Yes, Salt Lake Sector V, Park Street, and Rajarhat are major commercial hubs.",
    },
    {
      question: "Are ready-to-move flats available in Kolkata?",
      answer:
        "Yes, especially in New Town, EM Bypass, and Tollygunge.",
    },
    {
      question: "What are the real estate trends in Kolkata?",
      answer:
        "Growing demand for gated communities, affordable housing, and metro-connected properties.",
    },
    {
      question: "How do I find top real estate agents in Kolkata?",
      answer:
        "Choose agents with verified listings and strong local knowledge of key areas.",
    },
    {
      question: "Which are the best upcoming residential projects in Kolkata?",
      answer:
        "New Town, Rajarhat, and EM Bypass have many upcoming projects.",
    },
    {
      question: "How can I maximize returns on Kolkata real estate investments?",
      answer:
        "Invest near IT hubs and metro connectivity, and choose reputed builders.",
    },
  ],
},
 {
  name: "Amaravathi",
  color: "text-yellow-600",
  id: "amaravathi",
  faqs: [
    {
      question: "What are the best areas to invest in Amaravathi real estate?",
      answer:
        "Top areas include Amaravathi Capital Region, Thullur, and Velagapudi due to infrastructure growth and future potential.",
    },
    {
      question: "Where can I find apartments for sale in Amaravathi?",
      answer:
        "Apartments are available in Velagapudi, Thullur, and Capital Region across affordable and premium segments.",
    },
    {
      question: "How can I find villas for sale in Amaravathi?",
      answer:
        "Villas are mainly located in gated communities near Velagapudi and Thullur with modern amenities.",
    },
    {
      question: "Are there ready-to-move flats in Amaravathi?",
      answer:
        "Yes, several projects offer ready-to-move flats including apartments and villa communities.",
    },
    {
      question: "Can I invest in commercial property in Amaravathi?",
      answer:
        "Yes, commercial investment opportunities exist in Capital Region and main market areas.",
    },
    {
      question: "What are the current real estate trends in Amaravathi?",
      answer:
        "Demand is growing for apartments, villas, and commercial spaces due to capital development.",
    },
    {
      question: "How do I find top real estate agents in Amaravathi?",
      answer:
        "Look for agents with verified listings, strong reviews, and local expertise.",
    },
    {
      question: "What are the property prices in Amaravathi by location?",
      answer:
        "Prices are higher near Capital Region and Velagapudi, and more affordable in outskirts.",
    },
    {
      question: "Are there residential projects with modern amenities?",
      answer:
        "Yes, many projects include gyms, parks, swimming pools, and 24/7 security.",
    },
    {
      question: "How can I maximize returns on Amaravathi real estate investments?",
      answer:
        "Invest in high-growth areas, track infrastructure development, and consider rental yield.",
    },
  ],
},

 {
  name: "Vijayawada",
  color: "text-indigo-600",
  id: "vijayawada",
  faqs: [
    {
      question: "What are the best areas to invest in Vijayawada real estate?",
      answer:
        "Top areas include MG Road, Benz Circle, Auto Nagar, and Kanuru due to strong demand and growth potential.",
    },
    {
      question: "Where can I find apartments for sale in Vijayawada?",
      answer:
        "Apartments are available in MG Road, Benz Circle, and Governorpet across various price ranges.",
    },
    {
      question: "How can I find villas for sale in Vijayawada?",
      answer:
        "Villas are mainly located in Kanuru, Auto Nagar, and near the airport in gated communities.",
    },
    {
      question: "Are there ready-to-move flats in Vijayawada?",
      answer:
        "Yes, many residential projects offer ready-to-move flats with modern amenities.",
    },
    {
      question: "Can I invest in commercial property in Vijayawada?",
      answer:
        "Yes, MG Road, Benz Circle, and RTC Cross Roads are prime commercial investment locations.",
    },
    {
      question: "What are the current real estate trends in Vijayawada?",
      answer:
        "Growing demand for apartments, villas, and commercial properties along major roads.",
    },
    {
      question: "How do I find top real estate agents in Vijayawada?",
      answer:
        "Choose agents with verified listings, good reviews, and local market expertise.",
    },
    {
      question: "What are the property prices in Vijayawada by location?",
      answer:
        "Central areas like MG Road are expensive, while outskirts offer affordable options.",
    },
    {
      question: "Are there residential projects with modern amenities?",
      answer:
        "Yes, many projects include gyms, parks, pools, and 24/7 security.",
    },
    {
      question: "How can I maximize returns on Vijayawada real estate investments?",
      answer:
        "Invest in high-demand areas, monitor infrastructure growth, and consider rental yield.",
    },
  ],
},

 {
  name: "Mumbai",
  color: "text-red-600",
  id: "mumbai",
  faqs: [
    {
      question: "What are the best areas to invest in Mumbai real estate?",
      answer:
        "Top areas include Bandra, Andheri, Powai, Juhu, and Worli due to high demand and premium property value.",
    },
    {
      question: "How much do apartments in Mumbai cost?",
      answer:
        "Prices vary widely—from affordable flats in Thane and Mira Road to luxury properties in South Mumbai and Bandra.",
    },
    {
      question: "Where can I find affordable apartments in Mumbai?",
      answer:
        "Thane, Mira Road, Mulund, and Kandivali offer more budget-friendly housing options.",
    },
    {
      question: "Are there ready-to-move flats available in Mumbai?",
      answer:
        "Yes, many residential projects across Mumbai offer ready-to-move flats and gated communities.",
    },
    {
      question: "How can I find luxury villas in Mumbai?",
      answer:
        "Luxury villas are mainly located in Bandra, Juhu, Worli, and Powai.",
    },
    {
      question: "What are the current real estate trends in Mumbai?",
      answer:
        "Strong demand for luxury apartments, high-rise buildings, and commercial property in business hubs.",
    },
    {
      question: "How do I choose a trusted Mumbai real estate agent?",
      answer:
        "Look for agents with verified listings, positive reviews, and strong local expertise.",
    },
    {
      question: "Can I invest in commercial property in Mumbai?",
      answer:
        "Yes, Nariman Point, Lower Parel, Andheri, and Powai are top commercial investment areas.",
    },
    {
      question: "What is the rental market like in Mumbai?",
      answer:
        "Rental demand is very high, especially in areas near business hubs and IT zones.",
    },
    {
      question: "How do Mumbai property prices vary by location?",
      answer:
        "South Mumbai, Bandra, and Juhu are premium, while Thane and Mira Road are more affordable.",
    },
  ],
},
];
 return (
  <div className="max-w-6xl mx-auto px-4 py-10">
    
    {/* ================= HEADER ================= */}
    <div className="mb-14 text-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-3">
        ❓ Property FAQs by City
      </h1>
      <p className="text-gray-600 max-w-2xl mx-auto">
        Find answers to common real estate questions across major cities.
      </p>
    </div>

    {/* ================= NAV ================= */}
   <div className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b py-4 mb-12">
  <div className="flex flex-wrap justify-center gap-3">
    {cities.map((city) => (
      <a
        key={city.id}
        href={`#${city.id}`}
        className="px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-900 hover:text-white text-sm transition-all duration-200"
      >
        {city.name}
      </a>
    ))}
  </div>
</div>

    {/* ================= SECTIONS ================= */}
    {cities.map((city) => (
      <div
        key={city.id}
        className="mb-16 p-6 rounded-2xl bg-gray-50 border"
      >
        {/* City Title */}
        <h2
          id={city.id}
          className={`text-2xl font-bold ${city.color} mb-6 scroll-mt-24`}
        >
          {city.name}
        </h2>

        {/* FAQs */}
        <div className="space-y-4">
          {city.faqs.map((faq, index) => (
            <details
              key={index}
              className="group border rounded-xl bg-white shadow-sm hover:shadow-md transition-all"
            >
              {/* Question */}
              <summary className="cursor-pointer list-none px-5 py-4 flex justify-between items-center">
                <span className="font-medium text-gray-800">
                  {faq.question}
                </span>

                {/* Arrow */}
                <span className="ml-4 text-gray-500 transition-transform duration-300 group-open:rotate-180">
                  ▼
                </span>
              </summary>

              {/* Divider */}
              <div className="h-px bg-gray-100"></div>

              {/* Answer */}
              <div className="px-5 py-4 text-gray-600 text-sm leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    ))}
  </div>
);
}