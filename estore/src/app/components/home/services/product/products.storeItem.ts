import { Injectable, signal } from '@angular/core';
import { Product } from '../../types/products.type';
import { ProductsService } from './products-service';

@Injectable()

export class ProductsStoreItem {
    private readonly _products = signal<Product[]>([])
    readonly products = this._products.asReadonly()

    constructor(private productsService: ProductsService) {
        this.loadProducts();
    }

    loadProducts(filters?: {mainCategoryId?: number, subCategoryId?: number, keyword?: string}):void {
        this.productsService.getAllProducts(filters).subscribe({
            next: (products) => {
                this._products.set(products);
            },
            error: (error) => {
                console.log(error)
            }
        })
    }
}