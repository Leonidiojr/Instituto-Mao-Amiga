import { Pagina, Produto } from '../types/produto';
import { get } from './api';

export const TAMANHO_PAGINA = 20;

export type PaginaProdutos = {
  produtos: Produto[];
  ultimaPagina: boolean;
};

/**
 * Busca uma página de produtos na API Spring Boot e devolve o "content".
 * GET /api/v1/produtos?page=0&size=20[&filtro=texto]
 */
export async function getProdutos(
  pagina: number,
  filtro: string,
  signal?: AbortSignal,
): Promise<PaginaProdutos> {
  let query = `page=${pagina}&size=${TAMANHO_PAGINA}`;
  const texto = filtro.trim();
  if (texto) {
    query += `&filtro=${encodeURIComponent(texto)}`;
  }

  const resposta = await get<Pagina<Produto>>(`/produtos?${query}`, signal);

  const produtos = resposta.content ?? [];
  const totalPaginas = resposta.totalPages ?? resposta.page?.totalPages;

  let ultimaPagina: boolean;
  if (resposta.last !== undefined) {
    ultimaPagina = resposta.last;
  } else if (totalPaginas !== undefined) {
    ultimaPagina = pagina >= totalPaginas - 1;
  } else {
    ultimaPagina = produtos.length < TAMANHO_PAGINA;
  }

  return { produtos, ultimaPagina };
}
