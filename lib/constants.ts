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

// Routes
export const ROUTES = {
  home: "/",
  dashboard: "/dashboard",
  signIn: "/auth/signin",
  newBike: "/bikes/new",
  bike: (id: string) => `/bikes/${id}`,
} as const
