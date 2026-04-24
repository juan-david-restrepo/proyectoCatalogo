import { Injectable, NgZone } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ImageLoaderService {
  private loadedImages = new Set<string>();
  private prefetchedImages = new Set<string>();
  private observer: IntersectionObserver | null = null;

  constructor(private zone: NgZone) {}

  init() {
    if (typeof window === 'undefined') return;
    
    this.zone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const img = entry.target as HTMLImageElement;
              const src = img.dataset['src'] || img.src;
              this.loadImage(img, src);
              this.observer?.unobserve(img);
            }
          });
        },
        { rootMargin: '200px' }
      );

      this.setupPrefetch();
    });
  }

  observe(img: HTMLImageElement) {
    this.observer?.observe(img);
  }

  private loadImage(img: HTMLImageElement, src: string) {
    if (this.loadedImages.has(src)) {
      img.classList.add('loaded');
      return;
    }

    const tempImg = new Image();
    tempImg.onload = () => {
      this.zone.run(() => {
        img.classList.add('loaded');
        this.loadedImages.add(src);
        this.prefetchNearby(src);
      });
    };
    tempImg.src = src;
  }

  private prefetchNearby(currentSrc: string) {
    const allImgs = document.querySelectorAll('img[data-src]');
    let found = false;
    let prefetchCount = 0;

    allImgs.forEach(img => {
      const src = (img as HTMLImageElement).dataset['src'];
      if (found && prefetchCount < 6 && src && !this.prefetchedImages.has(src)) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
        this.prefetchedImages.add(src);
        prefetchCount++;
      }
      if (src === currentSrc) found = true;
    });
  }

  private setupPrefetch() {
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.prefetchVisibleImages();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  private prefetchVisibleImages() {
    const viewportHeight = window.innerHeight;
    const buffer = viewportHeight * 2;
    const allImgs = document.querySelectorAll('img');
    let prefetched = 0;

    allImgs.forEach(img => {
      const rect = img.getBoundingClientRect();
      const src = (img as HTMLImageElement).dataset['src'] || img.src;
      
      if (rect.top > 0 && rect.top < viewportHeight + buffer && prefetched < 4) {
        if (!this.loadedImages.has(src) && !this.prefetchedImages.has(src)) {
          const preload = new Image();
          preload.src = src;
          this.prefetchedImages.add(src);
          this.zone.run(() => img.classList.add('loaded'));
          prefetched++;
        }
      }
    });
  }

  destroy() {
    this.observer?.disconnect();
  }
}