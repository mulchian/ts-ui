import { Moment } from 'moment-timezone';

export interface Building {
  id: number;
  name: string;
  teaser: string;
  level: number;
  maxLevel: number;
  description: string;
  upgradeTime: Moment;
  buildingLevels: BuildingLevel[];
}

export interface BuildingLevel {
  id: number;
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
