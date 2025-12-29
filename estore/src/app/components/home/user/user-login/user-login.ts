import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../services/user';
import { NgClass } from '@angular/common';
import {Location} from '@angular/common';
import { LoginToken } from '../../types/user.type';

@Component({
  selector: 'app-user-login',
  imports: [FormsModule, ReactiveFormsModule, RouterModule, NgClass],
  templateUrl: './user-login.html',
  styleUrl: './user-login.css',
})
export class UserLogin {

  userLoginForm!: FormGroup;

  alertMessage: string = '';
  alertType: number = 0;

  constructor(private fb: FormBuilder,
    private userService: UserService,
    private location: Location
  ) {
    this.userLoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    })
  }

  get email(): AbstractControl<any, any> | null {
    return this.userLoginForm.get('email')!;
  }

  get password(): AbstractControl<any, any> | null {
    return this.userLoginForm.get('password')!;
  }
  
  onSubmit() {
    if(this.userLoginForm.invalid) {
      this.alertMessage = 'Please fill in all the required fields';
      this.alertType = 1;
      this.userLoginForm.markAllAsTouched();
      return;
    }

    const {email, password} = this.userLoginForm.value;

    this.userLoginForm.disable();

    this.userService.login(email, password).subscribe({

      next: (res : LoginToken) => {
        this.userLoginForm.enable();
        if (res.token) {
          res.user.email = this.email?.value;
          this.userService.activateToken(res);
          this.alertMessage = "Login successfully";
          this.alertType = 0;
          this.userLoginForm.reset();
        } else {
          this.alertMessage = "Invalid login attempt.";
          this.alertType = 1;
        }
        setTimeout(() => {
          console.log("Redirecting...");
          this.location.back();
        }, 1000);
      },
      error: (err) => {
        this.userLoginForm.enable();
        this.alertMessage = err.error.message || "Login failed. Please try again.";
        this.alertType = 2;
      }
    })
  }
}
