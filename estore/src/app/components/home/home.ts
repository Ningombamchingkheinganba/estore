import { Component } from '@angular/core';
import { Header } from "./header/header";
import { Catnavigation } from "./catnavigation/catnavigation";
import { Sidenavigation } from "./sidenavigation/sidenavigation";
import { Products } from "../products/products";
import { CategoryService } from './services/category/category';
import { CategoriesStoreItem } from './services/category/categories.storeItem';
import { ProductsStoreItem } from './services/product/products.storeItem';
import { ProductsService } from './services/product/products-service';
import { SearchKeyword } from './types/searchKeyword.type';
import { NavigationEnd, Router, RouterOutlet } from "@angular/router";
import { filter } from 'rxjs';
import { UserService } from './user/services/user';
import { OrderService } from './services/order/order-service';

@Component({
  selector: 'app-home',
  imports: [Header, Catnavigation, RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.css',
  providers: [CategoryService, CategoriesStoreItem, ProductsStoreItem, ProductsService, UserService, OrderService]
})
export class Home {

  constructor(
    private categoryStoreItem: CategoriesStoreItem,
    private productStoreItem: ProductsStoreItem,
    private router: Router
  ) {
    this.categoryStoreItem.loadCategories();
    this.productStoreItem.loadProducts();

    this.router.events
    .pipe(filter((event) => event instanceof NavigationEnd))
    .subscribe((event: NavigationEnd) => {
      if (event.url === '/home') {
        this.router.navigate(['/home/products']);
      }
    })
  }

  onSelectCategory(mainCategoryId: number): void {
    this.productStoreItem.loadProducts({mainCategoryId: mainCategoryId});
  }

  onSearchKeyword(searchKeyword: SearchKeyword): void {
    this.productStoreItem.loadProducts({mainCategoryId: searchKeyword.categoryId, keyword: searchKeyword.keyword});
  }

}
