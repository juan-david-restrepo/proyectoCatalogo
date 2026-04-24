import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { Nav} from '../../components/nav/nav';
import { CategoriaModel } from '../../models/producto.model';
import { LazyImgDirective } from '../../directives/lazy-img.directive';

@Component({
  selector: 'app-categoria',
  imports: [CommonModule, RouterLink, Nav, LazyImgDirective],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Categoria {

  categoria = signal<CategoriaModel | null>(null);
  productos = signal<Producto[]>([]);
  productosMostrados = signal<Producto[]>([]);
  filtroActual = signal<string>('todos');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.productosService.getCategorias().subscribe(cats => {
          const cat = cats.find(c => c.id === id);
          if (cat) {
            this.categoria.set(cat);
          }
        });

        this.productosService.getProductosPorCategoria(id).subscribe(prods => {
          this.productos.set(prods);
          this.productosMostrados.set(prods);
        });
      }
    });
  }

  filtrar(subcategoria: string) {
    this.filtroActual.set(subcategoria);
    if (subcategoria === 'todos') {
      this.productosMostrados.set(this.productos());
    } else {
      const filtrados = this.productos().filter(p => p.subcategoria === subcategoria);
      this.productosMostrados.set(filtrados);
    }
  }

  irDetalles(id: number) {
    this.router.navigate(['/detalles', id]);
  }

}
