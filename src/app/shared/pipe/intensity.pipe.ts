import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'intensityPipe',
})
export class IntensityPipe implements PipeTransform {
  transform(intensity: number): string {
    switch (intensity) {
      case 3:
        return 'signal_cellular_alt';
      case 2:
        return 'signal_cellular_alt_2_bar';
      default:
        return 'signal_cellular_alt_1_bar';
    }
  }
}
