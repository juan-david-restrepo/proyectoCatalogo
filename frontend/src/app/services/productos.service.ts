import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoriaModel, Producto } from '../models/producto.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private api = environment.apiUrl; // ej: 'http://localhost:3000/api'

  constructor(private http: HttpClient) {}

  /** Lista todas las categorías */
  getCategorias(): Observable<CategoriaModel[]> {
    return this.http.get<CategoriaModel[]>(`${this.api}/categorias`);
  }

  /** Lista todos los productos */
  getTodosProductos(): Observable<Producto[]> {
    return this.http.get<Producto[]>(`${this.api}/productos`);
  }

  /** Producto por ID */
  getProductoById(id: number): Observable<Producto | undefined> {
    return this.http.get<Producto>(`${this.api}/productos/${id}`);
  }

  /**
   * Productos de una categoría.
   * Opcionalmente filtra por subcategoría: getProductosPorCategoria(1, 'camas')
   */
  getProductosPorCategoria(
    categoriaId: number,
    subcategoria?: string
  ): Observable<Producto[]> {
    let url = `${this.api}/categorias/${categoriaId}/productos`;
    if (subcategoria) url += `?subcategoria=${subcategoria}`;
    return this.http.get<Producto[]>(url);
  }

  /** Productos por IDs específicos */
  getProductosPorIds(ids: number[]): Observable<Producto[]> {
    const idsParam = ids.join(',');
    return this.http.get<Producto[]>(`${this.api}/productos?ids=${idsParam}`);
  }
}
