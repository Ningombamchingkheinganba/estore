import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { LoggedInUser, LoginToken, User } from '../../types/user.type';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: "root"
})
export class UserService {

  constructor(private http: HttpClient) { 
    this.loadtoken();
  }

  private isAuthenticated = signal<boolean>(false);
  private loggedInUserInfo = signal<LoggedInUser>({} as LoggedInUser);

  private autoLogoutTimer: any;
  private authToken!: string;

  get isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  get isUserAuthenticated$(): Observable<boolean> {
    return toObservable(this.isAuthenticated);
  }

  get loggedInUserInfo$(): Observable<LoggedInUser> {
    return toObservable(this.loggedInUserInfo);
  }

  get loggedInUser(): LoggedInUser {
    return this.loggedInUserInfo();
  }

  get token(): string {
    return this.authToken;
  }

  get loggedInUser$(): Observable<LoggedInUser> {
    return toObservable(this.loggedInUserInfo);
  }
  
  createUser(user: User): Observable<any> {
    const url = 'http://localhost:3000/users/signup';
    return this.http.post<any>(url, user);
  }

  login(email: string, password: string): Observable<any> {
    const url = 'http://localhost:3000/users/login';
    return this.http.post<any>(url, { email: email, password : password });
  }

  activateToken(token: LoginToken): void {
    localStorage.setItem('token', token.token);
    localStorage.setItem(
      "expiry",
      new Date(Date.now() + token.expiresInSeconds * 1000).toISOString()
    )

    localStorage.setItem('firstName', token.user.firstName);
    localStorage.setItem('lastName', token.user.lastName);
    localStorage.setItem('address', token.user.address);
    localStorage.setItem('city', token.user.city);
    localStorage.setItem('state', token.user.state);
    localStorage.setItem('pin', token.user.pin);
    localStorage.setItem('email', token.user.email);

    this.isAuthenticated.set(true);
    this.loggedInUserInfo.set(token.user);
    this.setAutoLogoutTimer(token.expiresInSeconds * 1000);
    this.authToken = token.token;
  }

  logout(): void {
    localStorage.clear();
    this.isAuthenticated.set(false);
    this.loggedInUserInfo.set({} as LoggedInUser);
    clearTimeout(this.autoLogoutTimer);
  }

  private setAutoLogoutTimer(duration: number): void {
    this.autoLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration)
  }

  loadtoken(): void {
    if (typeof window !== 'undefined') {
      const token  = localStorage.getItem('token');
      const expiry = localStorage.getItem('expiry');
  
      if (!token || !expiry) {
        return;
      }
  
      const expiresIn = new Date(expiry).getTime() - Date.now();
      if (expiresIn > 0) {
        const user: LoggedInUser = {
          firstName: localStorage.getItem('firstName') || '',
          lastName: localStorage.getItem('lastName') || '',
          address: localStorage.getItem('address') || '',
          city: localStorage.getItem('city') || '',
          state: localStorage.getItem('state') || '',
          pin: localStorage.getItem('pin') || '',
          email: localStorage.getItem('email') || ''
        }
        this.isAuthenticated.set(true);
        this.loggedInUserInfo.set(user);
        this.setAutoLogoutTimer(expiresIn);
        this.authToken = token;
      } else {
        this.logout();
      }
    }
  }
}
