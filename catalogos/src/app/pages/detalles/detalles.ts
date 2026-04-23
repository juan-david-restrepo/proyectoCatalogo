import { Component, ChangeDetectionStrategy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { Producto } from '../../models/producto.model';
import { Nav} from '../../components/nav/nav';
import { LazyImgDirective } from '../../directives/lazy-img.directive';

@Component({
  selector: 'app-detalles',
  imports: [CommonModule, RouterLink, Nav, LazyImgDirective],
  templateUrl: './detalles.html',
  styleUrl: './detalles.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Detalles implements OnInit {

  producto = signal<Producto | null>(null);
  zoomActivo = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productosService: ProductosService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.productosService.getProductoById(id).subscribe(prod => {
          if (prod) {
            this.producto.set(prod);
          } else {
            this.router.navigate(['/home']);
          }
        });
      }
    });
  }

  abrirZoom() {
    this.zoomActivo.set(true);
    document.body.style.overflow = 'hidden';
  }

  cerrarZoom() {
    this.zoomActivo.set(false);
    document.body.style.overflow = 'auto';
  }
}
