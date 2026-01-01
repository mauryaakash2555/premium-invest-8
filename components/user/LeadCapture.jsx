/**
 * FILE: components/user/LeadCapture.jsx
 * PURPOSE: Simple lead capture state machine (name → email → phone).
 * CATEGORY: user
 *
 * SIMPLE EXPLANATION:
 * Before we answer questions, we ask for basic contact details.
 * This helper decides what question to ask next.
 */

'use client';

export function nextLeadStep(currentStep) {
  if (currentStep === 'name') return 'email';
  if (currentStep === 'email') return 'phone';
  if (currentStep === 'phone') return 'done';
  return 'done';
}

export function isLeadCaptureDone(step) {
  return step === 'done';
}
