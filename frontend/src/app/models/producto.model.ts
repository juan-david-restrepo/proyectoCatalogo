// src/app/models/producto.model.ts

export interface CategoriaModel {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

export interface Producto {
  id: number;
  nombre: string;
  precio: number;
  imagen: string;
  descripcion: string;
  medidas: string;
  material: string;
  // La BD devuelve categoria_id (snake_case); el backend lo puede mapear o dejarlo así:
  categoria_id: number;   // ← viene del backend / MySQL
  categoriaId?: number;   // alias opcional si quieres mantener compatibilidad en plantillas

  subcategoria?: 'camas' | 'mesas_noche' | 'colchones' | 'escritorios' |
  'mesas_aux' | 'cajoneros' | 'sofas' | 'sofa_camas' |
  'sillas_aux' | 'mesas_tv' | 'comedores' | 'sillas_comedor' |
  'sillas_barra';
}
