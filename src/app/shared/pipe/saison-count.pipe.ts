import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'saisonCount',
})
export class SaisonCountPipe implements PipeTransform {
  transform(duration: number): string {
    if (duration > 1) {
      return duration + ' Saisons';
    } else {
      return duration + ' Saison';
    }
  }
}
