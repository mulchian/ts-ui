import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'translate',
  pure: false, // Important for re-evaluation on language changes
})
export class TranslatePipe implements PipeTransform {
  private readonly bookingCategoryTranslations: { [key: string]: { [lang: string]: string } } = {
    construction: { en: 'Construction', de: 'Ausbau' },
    maintenance: { en: 'Maintenance', de: 'Instandhaltung' },
    ticket: { en: 'Ticket', de: 'Ticket' },
    sponsor: { en: 'Sponsor', de: 'Sponsor' },
    wages: { en: 'Wage', de: 'Gehalt' },
    contract: { en: 'Contract', de: 'Vertrag' },
    transfer: { en: 'Transfer', de: 'Transfer' },
    scouting: { en: 'Scouting', de: 'Scouting' },
    bet: { en: 'Bet', de: 'Wette' },
    loan: { en: 'Loan', de: 'Kredit' },
    interest: { en: 'Interest', de: 'Zinsen' },
    refund: { en: 'Refund', de: 'Rückerstattung' },
    admin: { en: 'Administration', de: 'Administration' },
    other: { en: 'Other', de: 'Sonstiges' },
  };

  transform(key: string, translateType: 'bookingCategory', language: string): string {
    if (translateType !== 'bookingCategory') {
      return key;
    }
    return this.bookingCategoryTranslations[key]?.[language] || key;
  }
}
