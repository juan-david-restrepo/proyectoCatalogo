import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';
import { ImageLoaderService } from '../services/image-loader.service';

@Directive({
  selector: '[appLazyImg]',
  standalone: true,
})
export class LazyImgDirective implements AfterViewInit, OnDestroy {
  @Input('appLazyImg') src: string = '';

  constructor(
    private el: ElementRef<HTMLImageElement>,
    private imageLoader: ImageLoaderService
  ) {}

  ngAfterViewInit() {
    const img = this.el.nativeElement;
    
    this.imageLoader.init();
    
    img.dataset['src'] = this.src;
    img.src = '';
    
    this.imageLoader.observe(img);
  }

  ngOnDestroy() {}
}