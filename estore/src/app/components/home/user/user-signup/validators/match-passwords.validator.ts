import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

// export const matchPasswords:ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
//     const password = control.get('password');
//     const confirmPassword = control.get('confirmPassword');

//     if (password?.value !== confirmPassword?.value) {
//       return { 'passwordMismatch': true };
//     }
//     return null;
// }

export const matchPasswords: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (!password || !confirmPassword) return null;

  if (password.value !== confirmPassword.value) {
    confirmPassword.setErrors({ passwordMismatch: true });
    return { passwordMismatch: true };
  } else {
    // remove mismatch error if fixed
    if (confirmPassword.hasError('passwordMismatch')) {
      confirmPassword.setErrors(null);
    }
    return null;
  }
};