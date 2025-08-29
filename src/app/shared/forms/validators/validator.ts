import { AbstractControl, FormControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value === 'string' && value.trim().length === 0) {
      return { whitespace: true };
    }
    return null;
  };
}

export function confirmValidator(controlName: string) {
  let confirmControl: FormControl;
  let mainControl: FormControl;

  return (control: FormControl) => {
    if (!control.parent) {
      return null;
    }

    if (!confirmControl) {
      confirmControl = control;
      mainControl = control.parent.get(controlName) as FormControl;
      mainControl.valueChanges.subscribe(() => {
        confirmControl.updateValueAndValidity();
      });
    }

    if (mainControl.value !== confirmControl.value) {
      return { notmatch: true };
    }

    return null;
  };
}
