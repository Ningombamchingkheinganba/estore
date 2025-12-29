import { Component, inject, signal } from '@angular/core';
import { Ratings } from "../../ratings/ratings";
import { ActivatedRoute } from '@angular/router';
import { ProductsService } from '../services/product/products-service';
import { Product } from '../types/products.type';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CartStoreItem } from '../services/cart/cart.storeItem';
import {faShoppingCart} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-product-details',
  imports: [Ratings, CommonModule, FontAwesomeModule],
  templateUrl: './product-details.html',
  styleUrl: './product-details.css',
})
export class ProductDetails {
  private readonly route = inject(ActivatedRoute);
  private readonly productsService = inject(ProductsService);
  private readonly cart  = inject(CartStoreItem);
  readonly product = signal<Product | null>(null);
  faShoppingCart = faShoppingCart;

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    const productId = idParam ? Number(idParam) : null;
    if (productId != null && !isNaN(productId)) {
      this.productsService.getProduct(productId)
      .pipe(takeUntilDestroyed()) //automatically destroyed no need to have ondestroy
      .subscribe(product => {
        this.product.set(Array.isArray(product) ? product[0] : product);
      });
    }
  }

  addToCart(): void {
    const product = this.product();
    if (product) {
      this.cart.addProduct(product);
    }
  }

}

