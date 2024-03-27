import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: true,
  name: 'talentPipe',
})
export class TalentPipe implements PipeTransform {
  transform(value: number): string {
    let stars = '';
    const starCount = value / 2;

    if (starCount > 0) {
      stars = '★'.repeat(starCount);
    }
    if (value % 2 === 1) {
      stars += '☆';
    }
    return stars;
  }
}
