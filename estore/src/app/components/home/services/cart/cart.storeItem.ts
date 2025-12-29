import { computed, effect, Injectable, signal } from '@angular/core';
import { CartItem } from '../../types/cart.type';
import { Product } from '../../types/products.type';

@Injectable({
    providedIn: 'root'
})

export class CartStoreItem {
    
    private readonly _products = signal<CartItem[]>(this.loadFromSession());

    private _saveEffect = effect(() =>  {
        if (typeof window !== 'undefined') {
            const products = this._products();
            if (products.length === 0) {
                sessionStorage.removeItem('cart');
            } else {
                sessionStorage.setItem('cart', JSON.stringify(products));
            }
        }
    })
    
    readonly totalAmount = computed(() => 
        this._products().reduce((sum, item) => sum + item.amount, 0)
    );

    readonly totalProducts = computed(() => 
        this._products().reduce((count, item) => count + item.quantity, 0)
    )

    readonly cart = computed(() => ({
        products: this._products(),
        totalAmount: this.totalAmount(),
        totalProducts: this.totalProducts()
    }));

    addProduct(product: Product): void {
        const currentItems = this._products();
        const existingIndex = currentItems.findIndex(item => item.product.id === product.id);

        if (existingIndex === -1) {
            this._products.set([
                ...currentItems,
                {
                    product,
                    quantity: 1,
                    amount: Number(product.price)
                }
            ])
        } else {
            const updatedItems = [...currentItems];
            const existing = updatedItems[existingIndex]; //existing
            updatedItems[existingIndex] = {
                ...existing,
                quantity: existing.quantity + 1,
                amount: existing.amount + Number(product.price)
            }
            this._products.set(updatedItems);
        }
    }

    decreaseProductQuantity(cartItem: CartItem): void {
        const updatedItems = this._products().map((item) => {
            if (item.product.id === cartItem.product.id) {
                if (item.quantity <= 1) {
                    return null
                }

                return {
                    ...item,
                    quantity: item.quantity - 1,
                    amount: item.amount - Number(item.product.price)
                };
            }
            return item;
        }).filter(Boolean) as CartItem[];
        this._products.set(updatedItems);
    }

    removeProduct(cartItem: CartItem): void {
        const updatedItems = this._products().filter(item => item.product.id !== cartItem.product.id);
        this._products.set(updatedItems);
    }

    private loadFromSession(): CartItem[] {
        if (typeof window !== 'undefined') {
            const storeProducts = sessionStorage.getItem('cart');
            try {
                return storeProducts ? JSON.parse(storeProducts) : [];
            } catch (error) {
                return [];
            }
        }
        return [];
    }

    clearCart(): void {
        sessionStorage.clear();
        this.cart().products = [];
        this.cart().totalAmount = 0;
        this.cart().totalProducts = 0;

        sessionStorage.removeItem('cart');
        this._products.set([]);
    }
}