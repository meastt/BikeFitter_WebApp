/**
 * Zod validation schemas for input validation
 * Ensures data integrity before database writes
 */

import { z } from 'zod'

// ===== Bike Validation =====

export const bikeCreateSchema = z.object({
  name: z.string().min(1, 'Bike name is required').max(100, 'Name too long').optional(),
  frame_id: z.string().uuid('Invalid frame ID').optional(),
  stem_mm: z
    .number()
    .int('Stem length must be a whole number')
    .min(40, 'Stem length must be at least 40mm')
    .max(150, 'Stem length must be at most 150mm')
    .optional(),
  spacer_mm: z
    .number()
    .int('Spacer stack must be a whole number')
    .min(0, 'Spacer stack cannot be negative')
    .max(50, 'Spacer stack must be at most 50mm')
    .optional(),
  bar_reach_category: z.enum(['short', 'med', 'long'], {
    errorMap: () => ({ message: 'Bar reach must be short, med, or long' }),
  }).optional(),
  saddle_height_mm: z
    .number()
    .int('Saddle height must be a whole number')
    .min(500, 'Saddle height seems too low')
    .max(1200, 'Saddle height seems too high')
    .optional(),
  saddle_setback_mm: z
    .number()
    .int('Saddle setback must be a whole number')
    .min(-50, 'Saddle setback out of range')
    .max(150, 'Saddle setback out of range')
    .optional(),
  manual_stack_mm: z
    .number()
    .int('Stack must be a whole number')
    .min(400, 'Stack seems too low')
    .max(800, 'Stack seems too high')
    .optional(),
  manual_reach_mm: z
    .number()
    .int('Reach must be a whole number')
    .min(300, 'Reach seems too low')
    .max(600, 'Reach seems too high')
    .optional(),
  manual_seat_tube_angle_deg: z
    .number()
    .min(65, 'Seat tube angle out of range')
    .max(82, 'Seat tube angle out of range')
    .optional(),
  manual_head_tube_length_mm: z
    .number()
    .int('Head tube length must be a whole number')
    .min(80, 'Head tube length seems too low')
    .max(300, 'Head tube length seems too high')
    .optional(),
  manual_wheelbase_mm: z
    .number()
    .int('Wheelbase must be a whole number')
    .min(900, 'Wheelbase seems too low')
    .max(1300, 'Wheelbase seems too high')
    .optional(),
})

export const bikeUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  frame_id: z.string().uuid().optional(),
  stem_mm: z.number().int().min(40).max(150).optional(),
  spacer_mm: z.number().int().min(0).max(50).optional(),
  bar_reach_category: z.enum(['short', 'med', 'long']).optional(),
  saddle_height_mm: z.number().int().min(500).max(1200).optional(),
  saddle_setback_mm: z.number().int().min(-50).max(150).optional(),
})

// ===== User Profile Validation =====

export const userProfileSchema = z.object({
  height_cm: z
    .number()
    .int('Height must be a whole number')
    .min(140, 'Height seems too low')
    .max(230, 'Height seems too high')
    .optional(),
  inseam_cm: z
    .number()
    .int('Inseam must be a whole number')
    .min(60, 'Inseam seems too low')
    .max(120, 'Inseam seems too high')
    .optional(),
  torso_cm: z
    .number()
    .int('Torso must be a whole number')
    .min(40, 'Torso seems too low')
    .max(90, 'Torso seems too high')
    .optional(),
  arm_cm: z
    .number()
    .int('Arm must be a whole number')
    .min(40, 'Arm seems too low')
    .max(100, 'Arm seems too high')
    .optional(),
  flexibility_level: z
    .number()
    .int()
    .min(1, 'Flexibility level must be 1, 2, or 3')
    .max(3, 'Flexibility level must be 1, 2, or 3')
    .optional(),
  riding_style: z.enum(['comfort', 'endurance', 'race'], {
    errorMap: () => ({ message: 'Riding style must be comfort, endurance, or race' }),
  }).optional(),
  pain_points: z.array(z.string()).optional(),
})

// ===== Fit Validation =====

export const fitCreateSchema = z.object({
  target_reach_mm: z.number().int().min(300).max(600),
  target_stack_mm: z.number().int().min(400).max(800),
  ideal_stem_mm: z.number().int().min(40).max(150),
  ideal_spacer_mm: z.number().int().min(0).max(50),
  ideal_bar_reach_mm: z.number().int().min(60).max(100),
  discomfort_score: z.number().int().min(0).max(100),
})

// ===== Type exports for use in application =====

export type BikeCreateInput = z.infer<typeof bikeCreateSchema>
export type BikeUpdateInput = z.infer<typeof bikeUpdateSchema>
export type UserProfileInput = z.infer<typeof userProfileSchema>
export type FitCreateInput = z.infer<typeof fitCreateSchema>

// ===== Helper for safe parsing with user-friendly errors =====

export function safeValidate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  // Format Zod errors into user-friendly message
  const firstError = result.error.errors[0]
  const field = firstError.path.join('.')
  const message = firstError.message

  return {
    success: false,
    error: field ? `${field}: ${message}` : message,
  }
}
