export interface User {
  id: number;
  username: string;
  password: string;
  email: string;
  realName: string | null;
  city: string | null;
  gender: string;
  birthday: string | null;
  registerDate: string | null;
  lastActiveTime: number;
  admin: boolean;
  deactivated: boolean;
  activationSent: boolean;
  activated: boolean;
  profilePicture: [];
}
