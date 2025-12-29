export interface User {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    pin: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface LoggedInUser {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  email: string;
}

export interface LoginToken {
  token: string;
  user: LoggedInUser;
  expiresInSeconds: number;
}