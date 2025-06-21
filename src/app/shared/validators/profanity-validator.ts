import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function profanityValidator(control: AbstractControl): ValidationErrors | null {
  const forbiddenWords = ['badword', 'swear', 'damn', 'ass', 'fuck', 'shit']; // Example list
  const text = control.value as string;

  if (!text) {
    return null; // Don't validate empty string
  }

  const hasProfanity = forbiddenWords.some(word =>
    text.toLowerCase().includes(word)
  );

  return hasProfanity ? { profanity: true } : null;
}