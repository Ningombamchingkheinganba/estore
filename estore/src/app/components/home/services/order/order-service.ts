import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CartStoreItem } from '../cart/cart.storeItem';
import { UserService } from '../../user/services/user';
import { DeliveryAddress } from '../../types/cart.type';
import { Observable, of } from 'rxjs';
import { Order, OrderItem, PastOrder, PastOrderProduct } from '../../types/order.type';

@Injectable()
export class OrderService {

  constructor(
    private http: HttpClient,
    private cartStore: CartStoreItem,
    private userService: UserService
  ) { }

  saveOrder(
    deliveryAddress: DeliveryAddress,
    userEmail: string
  ): Observable<any> {
    const url:string = 'http://localhost:3000/orders/add';
    const orderDetails: OrderItem[] = [];
    this.cartStore.cart().products.forEach((product) => {
      const orderItem: OrderItem = {
        productId: product.product.id,
        qty: product.quantity,
        price: product.product.price,
        amount: product.amount,
      };
      orderDetails.push(orderItem);
    });

    const order: Order = {
      userName: deliveryAddress.userName,
      address: deliveryAddress.address,
      city: deliveryAddress.city,
      state: deliveryAddress.state,
      pin: deliveryAddress.pin,
      total: this.cartStore.cart().totalAmount,
      userEmail: userEmail,
      orderDetails :  orderDetails,
    };

    return this.http.post(url, order, {
      headers: {authorization: this.userService.token},
    })
  }

  getOrders(userEmail: string): Observable<PastOrder[]> {
    const token = this.userService.token;
    if (!token) {
      return of([])
    }
    const url = `http://localhost:3000/orders/allorders?userEmail=${userEmail}`;
    return this.http.get<PastOrder[]>(url, {
      headers: {authorization: this.userService.token},
    });
  }

  getOrderProducts(orderId: number): Observable<PastOrderProduct[]> {
    const url = `http://localhost:3000/orders/orderproducts?orderId=${orderId}`;
    return this.http.get<PastOrderProduct[]>(url, {
      headers: {authorization: this.userService.token},
    });
  }
  
}
