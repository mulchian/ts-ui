import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TippyDirective } from '@ngneat/helipopper';

@Component({
  selector: 'app-confirm-modal',
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
  standalone: false,
})
export class ConfirmModalComponent {
  @Input()
  title: string | undefined;

  @Input()
  message: string | undefined;

  @Input()
  confirmBtnText: string | undefined;

  @Input()
  tooltip: TippyDirective | undefined;

  @Output()
  confirm: EventEmitter<boolean> = new EventEmitter<boolean>();

  onConfirm() {
    this.confirm.emit(true);
  }
}
