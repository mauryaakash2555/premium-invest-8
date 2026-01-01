/**
 * FILE: lib/utils/validator.js
 * PURPOSE: Shared zod schemas and safe-parse helpers.
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * This file holds "shape rules" for incoming JSON so APIs can reject bad requests.
 */

import { z } from "zod";

export const zod = { z };

export function safeParse(schema, data) {
  const parsed = schema.safeParse(data);
  return parsed;
}
