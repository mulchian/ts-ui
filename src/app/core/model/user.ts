import { Moment } from 'moment-timezone';

export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  realName: string | null;
  city: string | null;
  gender: string;
  birthday: Moment | null;
  registerDate: Moment;
  lastActiveTime: Moment | null;
  admin: boolean;
  deactivated: boolean;
  activationSent: boolean;
  activated: boolean;
  profilePicture: [];
}
