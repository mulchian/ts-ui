import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInput } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDivider } from '@angular/material/divider';

@Component({
  selector: 'app-input-modal',
  templateUrl: './input-modal.component.html',
  styleUrl: './input-modal.component.scss',
  imports: [CommonModule, MatButton, MatCardModule, FormsModule, MatFormFieldModule, MatInput, MatDivider],
})
export class InputModalComponent {
  @Input() title!: string;
  @Input() inputLabel!: string;
  @Input() inputValue: string | undefined;
  @Input() inputPlaceholder!: string;
  @Input() inputType: string = 'text';
  @Input() confirmBtnText!: string;
  @Output() confirm: EventEmitter<string> = new EventEmitter<string>();
  @Output() cancel: EventEmitter<void> = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit(this.inputValue);
  }

  onCancel() {
    this.cancel.emit();
  }
}
