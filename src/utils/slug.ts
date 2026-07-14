export function generarSlug(nombre: string): string {
  return nombre
    .normalize("NFD") // Separa los acentos de la letra (ej. á -> a + ´)
    .replace(/[\u0300-\u036f]/g, "") // Borra las tildes limpiamente
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Reemplaza los espacios por guiones (la-tienda-de-ramon)
    .replace(/[^a-z0-9-]/g, ''); // Deja solo letras, números y guiones
}