import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../env/environment';


export interface Prueba {
  id?: number;
  // ... otros campos
}
@Injectable({
  providedIn: 'root'
})

export class PruebaService {
  private baseUrl = `${environment.apiUrl}/endpoint`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Prueba[]> {
    return this.http.get<Prueba[]>(this.baseUrl);
  }

  getById(id: number): Observable<Prueba> {
    return this.http.get<Prueba>(`${this.baseUrl}/${id}`);
  }

  create(data: Prueba): Observable<Prueba> {
    return this.http.post<Prueba>(this.baseUrl, data);
  }

  update(id: number, data: Prueba): Observable<Prueba> {
    return this.http.put<Prueba>(`${this.baseUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}