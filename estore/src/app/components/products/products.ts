import { ChangeDetectorRef, Component } from '@angular/core';
import { ProductsService } from '../home/services/product/products-service';
import { CommonModule } from '@angular/common';
import { Ratings } from "../ratings/ratings";
import { Product } from '../home/types/products.type';
import { ProductsStoreItem } from '../home/services/product/products.storeItem';
import { faBoxOpen } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { RouterLink } from "@angular/router";
import {faShoppingCart} from '@fortawesome/free-solid-svg-icons';
import { CartStoreItem } from '../home/services/cart/cart.storeItem';

@Component({
  selector: 'app-products',
  imports: [CommonModule, Ratings, FaIconComponent, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
  providers: [ProductsService]
})
export class Products {
  faBoxOpen = faBoxOpen;
  faShoppingCart = faShoppingCart;
  constructor(public productsStoreItem: ProductsStoreItem, private cart : CartStoreItem){}

  addToCart(product: Product): void {
    this.cart.addProduct(product);
  }
}
