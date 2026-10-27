export function formatarPreco(valor: number | undefined): string {
  if (valor === undefined || valor === null || isNaN(valor)) {
    return '—';
  }
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
