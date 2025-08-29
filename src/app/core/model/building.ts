import { Moment } from 'moment-timezone';

export interface Building {
  id: number;
  name: string;
  teaser: string;
  level: number;
  maxLevel: number;
  description: string;
  upgradeTime: Moment | null;
  buildingLevels: BuildingLevel[];
  // these properties are used for the UI to show the countdown for the upgrade
  intervalId: any | undefined;
  remainingTime: string | undefined;
}

export interface BuildingLevel {
  id: number;
  idBuilding: number;
  level: number;
  buildTime: number;
  price: number;
  description: string;
  buildingEffects: BuildingEffect[];
  requiredBuilding: BuildingLevel | null;
}

export interface BuildingEffect {
  id: number;
  name: string;
  description: string;
  value: number;
}
