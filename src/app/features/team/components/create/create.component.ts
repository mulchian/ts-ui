import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { TeamService } from '../../../../core/services/team.service';
import { AuthStore } from '../../../../core/services/auth.store';
import { CommonModule } from '@angular/common';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  first,
  Observable,
  of,
  Subject,
  switchMap,
  takeUntil,
} from 'rxjs';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatInput } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButton } from '@angular/material/button';
import { map } from 'rxjs/operators';
import { noWhitespaceValidator } from '../../../../shared/forms/validators/validator';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrl: './create.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInput,
    MatSelectModule,
    MatButton,
    MatIcon,
  ],
  providers: [TeamService],
})
export class CreateComponent implements OnInit, OnDestroy {
  activated = false;
  unsubscribe$ = new Subject<void>();
  conferences = ['North', 'South'];
  submitted = false;
  private readonly router = inject(Router);
  private readonly auth = inject(AuthStore);
  private readonly teamService = inject(TeamService);
  private fb = inject(FormBuilder);
  private namePattern = /^[a-zA-Z0-9 ]*$/;
  private abbrPattern = /^[a-zA-Z0-9]{1,3}$/;

  createTeamForm = this.fb.group({
    name: this.fb.control<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(this.namePattern),
        Validators.minLength(3),
        Validators.maxLength(40),
        noWhitespaceValidator(),
      ],
      asyncValidators: [this.uniqueNameValidator()],
      updateOn: 'blur', // async Validierung erst bei blur auslösen (angenehmer)
    }),
    abbreviation: this.fb.control<string>('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.pattern(this.abbrPattern),
        Validators.minLength(1),
        Validators.maxLength(3),
        noWhitespaceValidator(),
      ],
    }),
    conference: this.fb.control<'North' | 'South'>('North', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  ngOnInit() {
    this.teamService
      .getConferenceRecommendation()
      .pipe(first())
      .subscribe(reco => this.createTeamForm.controls.conference.setValue(reco));

    this.auth.user$.pipe(takeUntil(this.unsubscribe$)).subscribe(user => {
      if (user) {
        if (!user.activated) {
          this.router.navigateByUrl('/user/activate').then(navigationSucceeded => {
            if (navigationSucceeded) {
              console.log('Navigation to activate page succeeded.');
            } else {
              console.error('Navigation to activate page failed.');
            }
          });
        } else {
          // we can create a team
          this.activated = true;
        }
      }
    });
  }

  ngOnDestroy() {
    console.log('CreateComponent destroyed');
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  onSubmit() {
    this.submitted = true;
    if (this.createTeamForm.invalid) {
      this.createTeamForm.markAllAsTouched();
      return;
    }
    const payload = this.createTeamForm.getRawValue();
    console.log('create team →', payload);
    this.teamService
      .createTeam(payload.name, payload.abbreviation, payload.conference)
      .pipe(first())
      .subscribe(response => {
        if (response.teamCreated) {
          this.router.navigateByUrl('/').then(succeeded => {
            if (succeeded) {
              console.log('Navigation to home page succeeded after team creation.');
            } else {
              console.error('Navigation to home page failed after team creation.');
            }
          });
        }
      });
  }

  errorsFor(name: 'name' | 'abbreviation' | 'conference', label: string): string[] {
    return this.errorMessages(name, label);
  }

  private errorMessages(name: 'name' | 'abbreviation' | 'conference', label = 'Feld'): string[] {
    const control = this.createTeamForm.controls[name];
    if (!control) return [];

    // Nur anzeigen, wenn invalid UND bereits „benutzt“ oder Formular abgeschickt
    const show = control.invalid && (control.touched || control.dirty || this.submitted);
    if (!show) return [];

    const e: ValidationErrors = control.errors ?? {};
    const out: string[] = [];

    if (e['required']) out.push(`${label} ist erforderlich.`);
    if (e['minlength']) {
      out.push(
        `${label} muss mind. ${e['minlength'].requiredLength} Zeichen haben (aktuell ${e['minlength'].actualLength}).`
      );
    }
    if (e['maxlength']) {
      out.push(
        `${label} darf max. ${e['maxlength'].requiredLength} Zeichen haben (aktuell ${e['maxlength'].actualLength}).`
      );
    }
    if (e['pattern']) {
      if (name === 'name') {
        out.push(`${label} darf nur Buchstaben, Zahlen und Leerzeichen enthalten.`);
      } else if (name === 'abbreviation') {
        out.push(`${label} darf nur 1-3 Buchstaben oder Zahlen enthalten.`);
      } else {
        out.push(`${label} hat ein ungültiges Format.`);
      }
    }
    if (e['whitespace']) out.push(`${label} darf nicht nur aus Leerzeichen bestehen.`);
    if (e['nameTaken']) out.push(`Dieser ${label} ist bereits vergeben.`);

    return out;
  }

  private uniqueNameValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const value = (control.value ?? '').trim();
      if (!value) return of(null); // leere Werte hier nicht als Fehler markieren
      return of(value).pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(name => this.teamService.isTeamNameTaken(name)),
        map(isTaken => (isTaken ? { nameTaken: true } : null)),
        catchError(() => of(null)) // bei Backend-Fehlern Formular nicht blocken
      );
    };
  }
}
