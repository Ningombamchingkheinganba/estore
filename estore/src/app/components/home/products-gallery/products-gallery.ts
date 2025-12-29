import { Component } from '@angular/core';
import { Products } from "../../products/products";
import { Sidenavigation } from "../sidenavigation/sidenavigation";
import { ProductsService } from '../services/product/products-service';
import { ProductsStoreItem } from '../services/product/products.storeItem';

@Component({
  selector: 'app-products-gallery',
  imports: [Products, Sidenavigation],
  templateUrl: './products-gallery.html',
  styleUrl: './products-gallery.css',
  providers: [ProductsStoreItem, ProductsService]
})
export class ProductsGallery {


  constructor(private productStoreItem: ProductsStoreItem) {}


  onSelectSubCategory(subCategoryId: number):void {
    this.productStoreItem.loadProducts({subCategoryId: subCategoryId});
  }

}
