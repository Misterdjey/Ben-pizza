import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pizza {
  name: string;
  category: string;
  image: string;
  ingredients: string[];
}

@Injectable({
  providedIn: 'root'
})
export class PizzaService {
  constructor(private http: HttpClient) {}

  getPizzas(): Observable<{ pizzas: Pizza[] }> {
    return this.http.get<{ pizzas: Pizza[] }>('/pizzas.json');
  }
}
