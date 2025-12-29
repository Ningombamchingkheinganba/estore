import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { matchPasswords } from './validators/match-passwords.validator';
import { UserService } from '../services/user';
import { User } from '../../types/user.type';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-user-signup',
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './user-signup.html',
  styleUrl: './user-signup.css',
})
export class UserSignup {
  userSignupForm!: FormGroup;
  alertMessage: string = '';
  alertType: number = 0; // 0-success, 1-warning, 2-error

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.userSignupForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      firstName: ['', Validators.required],
      lastName: [''],
      address: [''],
      city: [''],
      state: [''],
      pin: [''],
    },
    {
      validators: matchPasswords
    })
  }

  get firstName(): AbstractControl<any, any> | null {
    return this.userSignupForm.get('firstName')!;
  }

  get email(): AbstractControl<any, any> | null {
    return this.userSignupForm.get('email')!;
  }

  get password(): AbstractControl<any, any> | null {
    return this.userSignupForm.get('password')!;
  }

  get confirmPassword(): AbstractControl<any, any> | null {
    return this.userSignupForm.get('confirmPassword')!;
  }

  onSubmit() {
    if (this.userSignupForm.invalid) { 
      this.alertMessage = 'Please fill in all the required fields';
      this.alertType = 1;
      this.userSignupForm.markAllAsTouched();
      return;
    }

    const  {firstName, lastName, address,city, state, pin, email, password} = this.userSignupForm.value;
    const newUser: User = {
      firstName,
      lastName,
      address,
      city,
      state,
      pin,
      email,
      password,
    }

    this.userSignupForm.disable();

    this.userService.createUser(newUser).subscribe({
      next: (res) => {
        console.log(res);
        this.userSignupForm.enable();
        if (res.message === "Success") {
          this.alertMessage = "User created successfully";
          this.alertType = 0;
          this.userSignupForm.reset();
        } else if (res.message === "Email already exists") {
          this.alertMessage = res.message;
          this.alertType = 1;
        }
      },
      error: (err) => {
        this.userSignupForm.enable();
        this.alertMessage = err.message || "An error occurred";
        this.alertType = 2;
      }
    });
  }
}
