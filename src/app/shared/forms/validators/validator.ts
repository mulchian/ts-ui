import { FormControl } from '@angular/forms';

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
