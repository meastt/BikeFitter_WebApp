/**
 * Application-wide constants
 */

// Branding
export const APP_NAME = "BikeFit"
export const APP_TAGLINE = "Built for cyclists who tinker."

// Bike specifications and validation ranges
export const BIKE_SPECS = {
  stem: {
    min: 40,
    max: 140,
    step: 10,
    default: 80,
    unit: "mm",
    label: "Stem Length",
  },
  spacer: {
    min: 0,
    max: 50,
    step: 5,
    default: 10,
    unit: "mm",
    label: "Spacer Stack",
  },
  barReach: {
    short: {
      value: "short",
      label: "Short (70–75mm)",
      range: [70, 75],
    },
    med: {
      value: "med",
      label: "Medium (75–80mm)",
      range: [75, 80],
    },
    long: {
      value: "long",
      label: "Long (85mm+)",
      range: [85, Infinity],
    },
  },
} as const

// Default bike name
export const DEFAULT_BIKE_NAME = "My Bike"

// Profile specifications and validation ranges
export const PROFILE_DEFAULTS = {
  height: {
    min: 140,
    max: 220,
    unit: "cm",
    label: "Height",
  },
  inseam: {
    min: 60,
    max: 110,
    unit: "cm",
    label: "Inseam",
  },
  torso: {
    min: 40,
    max: 80,
    unit: "cm",
    label: "Torso Length",
  },
  arm: {
    min: 50,
    max: 90,
    unit: "cm",
    label: "Arm Length",
  },
  flexibility: {
    low: { value: 1, label: "Low - I'm not very flexible" },
    medium: { value: 2, label: "Medium - Average flexibility" },
    high: { value: 3, label: "High - Very flexible" },
  },
  ridingStyle: {
    comfort: { value: "comfort", label: "Comfort - Relaxed, upright position" },
    endurance: { value: "endurance", label: "Endurance - Balanced for long rides" },
    race: { value: "race", label: "Race - Aggressive, aerodynamic" },
  },
  painPoints: [
    { value: "hands", label: "Hands or wrists" },
    { value: "neck", label: "Neck or shoulders" },
    { value: "back", label: "Lower back" },
    { value: "saddle", label: "Saddle area" },
  ],
} as const

// Routes
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  signIn: "/auth/signin",
  profile: "/profile",
  newBike: "/bikes/new",
  bike: (id: string) => `/bikes/${id}`,
} as const
