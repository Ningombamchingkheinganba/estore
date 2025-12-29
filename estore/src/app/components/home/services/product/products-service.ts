import { Injectable } from '@angular/core';
import { Product } from '../../types/products.type';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

//this service will only be used inside the products component and not anywhere else so we remove injeectable
@Injectable()
export class ProductsService {
  readonly baseURL = 'http://localhost:3000/products';
  constructor(private http: HttpClient) {}
  getAllProducts(filters?: {
    mainCategoryId?:number,
    subCategoryId?: number,
    keyword?: string
  }): Observable<Product[]>{
    let params = new HttpParams();
    if (filters?.mainCategoryId != null) {
      params = params.set('mainCategoryId', filters.mainCategoryId.toString());
    }
    if (filters?.subCategoryId != null) {
      params = params.set('subCategoryId', filters.subCategoryId.toString());
    }
    if (filters?.keyword) {
      params = params.set('keyword', filters.keyword);
    }
    return this.http.get<Product[]>(this.baseURL, {params});
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.baseURL}/${id}`);
  }
}
