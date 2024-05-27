export interface Tarea {
  id: string;
  nombre: string;
  descripcion: string;
  fechaLimite: string;
  orden: number;
  completada: boolean;
  prioridad: number;
}
