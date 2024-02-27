export type OnvifUserType = 'administrator' | 'operator' | 'mediaUser';

export type OnvifUser = {
  id: number;
  userName: string;
  userType: string;
};
