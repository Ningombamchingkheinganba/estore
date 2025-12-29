import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartItem } from '../../types/cart.type';
import { Observable } from 'rxjs';
import {loadStripe, Stripe} from '@stripe/stripe-js';
import { environment } from '../../../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class StripeService {

  private stripePromise: Promise<Stripe | null>;

  constructor(private http: HttpClient, private router: Router) {
    this.stripePromise = loadStripe(environment.stripePublicKey);
  }

  async redirectToCheckout(cartItems: CartItem[]): Promise<string | void> {
    const stripe = await this.stripePromise as Stripe;

    if (!stripe) {
      console.log('Stripe SDK failed to load.');
      return;
    }

    this.createCheckoutSession(cartItems).subscribe({
      next: (session : {url : string}) => {
        window.location.href = session.url;
      },
      error: (error) => {
        console.log("Error creating checkout session", error);
        this.router.navigate(['/home/cart'], {
          queryParams: {
            status: {status: "checkout_error", message: error.error.message}
          }
        });
      }
    })
  }

  private createCheckoutSession(cartItems: CartItem[]): Observable<{url: string}> {
    const url = 'http://localhost:3000/checkout/create-checkout-session';
    const body = {
      cartItems: cartItems.map((item) => ({
        name:item.product.product_name,
        price: item.product.price,
        quantity: item.quantity
      }))
    }

    console.log(body);
    return this.http.post<{url: string}>(url, body);
  }
}
