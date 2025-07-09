import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';
import { CommonModule } from '@angular/common';
import { MatCardActions, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatDivider } from '@angular/material/divider';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  imports: [CommonModule, MatCardTitle, MatDivider, MatCardContent, MatButton, MatCardActions],
})
export class ConfirmModalComponent {
  @Input() title: string | undefined;
  @Input() message: string | undefined;
  @Input() confirmBtnText: string | undefined;
  @Input() tooltip: TippyDirective | undefined;
  @Output() confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  onConfirm() {
    this.confirm.emit(true);
  }
}
