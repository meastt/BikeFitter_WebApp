/**
 * Unit conversion utilities for bike fit calculations
 */

/**
 * Convert centimeters to millimeters
 * @param cm - Length in centimeters
 * @returns Length in millimeters
 */
export function cmToMm(cm: number): number {
  return cm * 10
}

/**
 * Identity function for millimeter values (for consistency/readability)
 * @param value - Value in millimeters
 * @returns Same value in millimeters
 */
export function mm(value: number): number {
  return value
}

/**
 * Convert millimeters to centimeters
 * @param mm - Length in millimeters
 * @returns Length in centimeters
 */
export function mmToCm(mm: number): number {
  return mm / 10
}
