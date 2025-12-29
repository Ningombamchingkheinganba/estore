import { computed, Injectable, signal } from '@angular/core';
import { Category } from '../../types/category';
import { CategoryService } from './category';

@Injectable()

export class CategoriesStoreItem {
    //underscore means only for this file
    private readonly _categories = signal<Category[]>([]);

    readonly categories = this._categories.asReadonly();

    readonly topLevelCategories = computed(() => 
        this._categories().filter((category : Category) => category.parent_category_id === null)
    );

    constructor(private categoryService: CategoryService) {
        this.loadCategories();
    }

    loadCategories() {
        this.categoryService.getAllCategories().subscribe({
            next: (categories) => {
                this._categories.set(categories);
            }
        })
    }
}