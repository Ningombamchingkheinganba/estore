import { Component, effect, signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import { CartStoreItem } from '../services/cart/cart.storeItem';
import {faBoxOpen} from '@fortawesome/free-solid-svg-icons';
import {faShoppingCart} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule, NgClass } from '@angular/common';
import { Ratings } from '../../ratings/ratings';
import { CartItem } from '../types/cart.type';
import { LoggedInUser } from '../types/user.type';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../user/services/user';
import { OrderService } from '../services/order/order-service';
import { StripeService } from '../services/stripe/stripe-service';
import { firstValueFrom, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-cart',
  imports: [FontAwesomeModule, CommonModule, Ratings, ReactiveFormsModule, FormsModule, NgClass],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  faTrash = faTrash;
  faBoxOpen = faBoxOpen;
  faShoppingCart = faShoppingCart;

  alertType: number = 0;
  alertMessage: string = '';
  disableCheckout: boolean = false;
  paymentSuccess = signal(false);

  user = signal<LoggedInUser>({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pin: '',
    email: ''
  });

  orderForm!: WritableSignal<FormGroup>;

  constructor(
    private router: Router, 
    public cartStore: CartStoreItem,
    private userService: UserService,
    private orderService: OrderService,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private stripeService: StripeService
  ) {
    this.orderForm = signal(this.createOrderForm(this.user()));

    effect(() => {
      if (this.paymentSuccess()) {
        return;
      }
      const newUser = this.user();
      this.orderForm.set(this.createOrderForm(newUser));
    })

    this.route.queryParams.pipe(
      switchMap(async (params) => {
        if (params['status'] === 'success' && !this.paymentSuccess()) {
          this.paymentSuccess.set(true);
          // restore from localStorage
          if (typeof window !== 'undefined') { 
          
          const storeFormData = localStorage.getItem('orderFormData');
  
          if (storeFormData) {
            try {
              const formData = JSON.parse(storeFormData);
              this.orderForm().patchValue(formData);
              localStorage.removeItem('orderFormData');
              const user = await firstValueFrom(this.userService.loggedInUser$);
              if (user) {
                this.user.set(user);
                this.saveOrder();
              }
            } catch (error) {
              console.error("Error parsing stored form data", error);
              this.alertType = 2;
              this.alertMessage = "Failed to restore your address. Please retry.";
              return of(null)
            }
          }
        }
          return this.userService.loggedInUser$;
        } else if (params['status'] === 'cancel') {
          this.alertType = 2;
          this.alertMessage = "Payment cancelled. Please try again.";
          return of(null);
        } else {
          return of(null);
        }
      })
    ).subscribe();

    //need to check
    this.userService.loggedInUser$.subscribe((user) => {
      this.user.set(user);
    })
  }

  private createOrderForm(user: LoggedInUser): FormGroup {
    return this.fb.group({
      name: [user.firstName && user.lastName ? `${user.firstName} ${user.lastName}`.trim() : '', Validators.required],
      address: [user.address || "", Validators.required],
      city: [user.city || "", Validators.required],
      state: [user.state || "", Validators.required],
      pin: [user.pin || "", Validators.required],
    })
  }

  navigateToHome(): void {
    this.router.navigate(['home/products']);
  }

  updateQuantity($event: any, cartItem: CartItem): void {
    if ($event.target.innerText === "+") {
      this.cartStore.addProduct(cartItem.product);
    } else if ($event.target.innerText === "-") {
      this.cartStore.decreaseProductQuantity(cartItem);
    }
  }

  removeCartItem(cartItem: CartItem): void {
    this.cartStore.removeProduct(cartItem);
  }

  checkout(): void {
    if (!this.userService.isUserAuthenticated) {
      this.alertType = 2;
      this.alertMessage = 'Please login to proceed with payment.';
      return;
    }

    if (this.cartStore.cart().products.length > 0 && this.orderForm().valid) {
      localStorage.setItem("orderFormData", JSON.stringify(this.orderForm().value));
      this.stripeService.redirectToCheckout(this.cartStore.cart().products);
    } else {
      this.alertType = 2;
      this.alertMessage = 'Please fill in all the required fields correctly.';
    }
    
  }

  private saveOrder(): void {
    // if (!this.userService.isUserAuthenticated) {
    //   this.alertType = 2;
    //   this.alertMessage = 'Please login to register your order.';
    //   return;
    // }
    const form = this.orderForm();
    if (form.invalid) {
      this.alertType = 2;
      this.alertMessage = 'Please fill in all the required fields correctly.';
      return;
    }

    const deliveryAddress = {
      userName: form.get("name")?.value,
      address: form.get("address")?.value,
      city: form.get("city")?.value,
      state: form.get("state")?.value,
      pin: form.get("pin")?.value
    };

    const email = this.user()?.email;

    if (!email) {
      this.alertType = 2;
      this.alertMessage = 'User email not found. Please log in again.';
      return;
    }

    this.orderService.saveOrder(deliveryAddress, email).subscribe({
      next: (res) => {
        console.log("res", res);
        this.cartStore.clearCart();
        this.alertType = 0;
        this.alertMessage = 'Order registered successfully!';
        this.disableCheckout = true;
      },
      error: (error) => {
        this.alertType = 2;
        if (error.error.message === "Authorization failed!") {
          this.alertMessage = "Please login to register your order.";
        } else {
          this.alertMessage = error.error.message || "An unexpected error occurred.";
        }
      }
    })
  }

}
