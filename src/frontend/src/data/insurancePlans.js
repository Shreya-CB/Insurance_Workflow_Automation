const insurancePlans = {
  term: [
    {
      id: "term",
      name: "LifeSecure Basic",
      coverage: 500000,
      premium: 3000,
      term_years: 10,
      benefits: ["Nominee protection", "Tax benefits"],
    },
    {
      id: "term",
      name: "LifeSecure Premium",
      coverage: 1000000,
      premium: 5200,
      term_years: 20,
      benefits: ["Accidental death rider", "Tax benefits"],
    },
  ],
  vehicle: [
    {
      id: "vehicle",
      name: "AutoShield Basic",
      coverage: 200000,
      premium: 2500,
      term_years: 10,
      benefits: ["Third-party coverage", "Accident damage", "Cashless garages"],
    },
    {
      id: "vehicle",
      name: "AutoShield Pro",
      coverage: 500000,
      premium: 4200,
      term_years: 20,
      benefits: ["Own damage", "Theft protection", "24x7 Roadside assistance"],
    },
  ],
  health: [
    {
      id: "health",
      name: "HealthPlus Silver",
      coverage: 500000,
      premium: 6500,
      term_years: 10,
      benefits: ["Free annual checkup", "OPD coverage", "Cashless hospitals"],
    },
    {
      id: "health",
      name: "HealthPlus Gold",
      coverage: 1000000,
      premium: 9000,
      term_years: 20,
      benefits: ["Pre-existing cover", "Ambulance coverage", "Dental/vision"],
    },
  ],
  home: [
    {
      id: "home",
      name: "SafeHome Basic",
      coverage: 1000000,
      premium: 4000,
      term_years: 10,
      benefits: ["Fire", "Burglary", "Natural disasters"],
    },
    {
      id: "home",
      name: "SafeHome Plus",
      coverage: 2500000,
      premium: 7000,
      term_years: 20,
      benefits: ["Flood cover", "Earthquake cover", "All-risk protection"],
    },
  ],
  pension: [
    {
        id: "pension",
        name: "SecurePension Plan",
        coverage: 1000000,
        premium: 5000,
        term_years: 10,
        benefits: [
          "Guaranteed lifetime income",
          "Annual payout options",
          "Return of purchase price to nominee"
        ],
    },
    {
        id: "pension",
        name: "EliteRetire Plan",
        coverage: 3000000,
        premium: 12000,
        term_years: 20,
        benefits: [
          "Higher annuity rate for early investors",
          "Joint life cover option",
          "Loyalty additions on 10+ year terms"
        ],
    },
  ],

  life: [
  {
    id: "life",
    name: "LifeShield Term Plan",
    coverage: 5000000,
    premium: 6000,
    term_years: 10,
    benefits: [
      "Pure life cover with flexible terms",
      "Tax benefits under Section 80C",
      "Add-on accidental cover available"
    ],
  },
  {
    id: "life",
    name: "LifeSaver Plus Plan",
    coverage: 10000000,
    premium: 11000,
    term_years: 20,
    benefits: [
      "Comprehensive life and income protection",
      "Optional critical illness rider",
      "Family income payout on demise"
    ],
  },
]

};

export default insurancePlans;
