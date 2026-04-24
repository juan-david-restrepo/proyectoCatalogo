import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductosService } from '../../services/productos.service';
import { CategoriaModel, Producto } from '../../models/producto.model';
import { Nav} from '../../components/nav/nav';

interface CarouselSlide {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
}

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, Nav],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit, OnDestroy {

  categorias = signal<CategoriaModel[]>([]);
  todosProductos = signal<Producto[]>([]);
  topProductos = signal<Producto[]>([]);
  productosExclusivos = signal<Producto[]>([]);

  topProductosIds = [1, 35, 80, 60, 100, 170, 120, 75, 97, 135];
  exclusivosIds = [4, 55, 129, 61];
  topGroupIndex = signal(0);

  private readonly ITEMS_PER_GROUP = 5;

  slides: CarouselSlide[] = [
    {
      id: 66,
      nombre: 'MODULAR CONFORT',
      precio: 5100000,
      imagen: 'https://res.cloudinary.com/dj5dehk8y/image/upload/v1776977684/DSCF1453.JPG_1_uqqxqk.jpg',
      descripcion: 'Sofá modular de diseño sofisticado. Módulos versátiles que se reorganizan según tus necesidades.'
    },
    {
      id: 160,
      nombre: 'COMEDOR MARBELLA',
      precio: 2780000,
      imagen: 'https://res.cloudinary.com/dj5dehk8y/image/upload/v1776977686/DSCF7799.JPG_kt1lrz.jpg',
      descripcion: 'Base elegante con cubierta chapilla y base en madera Flor Morado. Acabado impecable.'
    },
    {
      id: 3,
      nombre: 'CAMA BALI',
      precio: 2880000,
      imagen: 'https://res.cloudinary.com/dj5dehk8y/image/upload/v1776977667/DSCF0046.JPG_1_yz2sse.jpg',
      descripcion: 'Diseño tropical con curvas orgánicas que crean un ambiente relajante y acogedor.'
    },
    {
      id: 114,
      nombre: 'SOFÁ CAMA TORELLO',
      precio: 3140000,
      imagen: 'https://res.cloudinary.com/dj5dehk8y/image/upload/v1776977686/DSCF0167.JPG_v4mobp.jpg',
      descripcion: 'Tapizado antifluido con patas en Flor Morado. Funcionalidad y estilo en uno.'
    }
  ];

  currentSlide = signal(0);
  private autoplayInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    private productosService: ProductosService,
    private router: Router
  ) {}

  ngOnInit() {
    this.productosService.getCategorias().subscribe(cats => {
      this.categorias.set(cats);
    });

    this.productosService.getTodosProductos().subscribe(prods => {
      this.todosProductos.set(prods);
    });

    this.productosService.getProductosPorIds(this.topProductosIds).subscribe(prods => {
      const ordered = this.topProductosIds.map(id => prods.find(p => p.id === id)).filter((p): p is Producto => p !== undefined);
      this.topProductos.set(ordered);
    });

    this.productosService.getProductosPorIds(this.exclusivosIds).subscribe(prods => {
      const ordered = this.exclusivosIds.map(id => prods.find(p => p.id === id)).filter((p): p is Producto => p !== undefined);
      this.productosExclusivos.set(ordered);
    });

    this.startAutoplay();
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  nextSlide() {
    this.currentSlide.set((this.currentSlide() + 1) % this.slides.length);
  }

  prevSlide() {
    this.currentSlide.set((this.currentSlide() - 1 + this.slides.length) % this.slides.length);
  }

  goToSlide(index: number) {
    this.currentSlide.set(index);
    this.stopAutoplay();
    this.startAutoplay();
  }

  get currentSlideData(): CarouselSlide {
    return this.slides[this.currentSlide()];
  }

  formatPrice(price: number): string {
    return '$' + price.toLocaleString('es-CO');
  }

  irCategoria(id: number) {
    this.router.navigate(['/categoria', id]);
  }

  irDetalles(id: number) {
    this.router.navigate(['/detalles', id]);
  }

  prevTopCarousel() {
    if (this.topGroupIndex() > 0) {
      this.topGroupIndex.update(i => i - 1);
    }
  }

  nextTopCarousel() {
    const maxGroup = Math.floor(this.topProductos().length / this.ITEMS_PER_GROUP) - 1;
    if (this.topGroupIndex() < maxGroup) {
      this.topGroupIndex.update(i => i + 1);
    }
  }

  get topCarouselTransform(): string {
    return 'translateX(-' + (this.topGroupIndex() * 100) + '%)';
  }

}
