export type Produto = {
  id: number;
  nome: string;
  descricao?: string;
  preco: number;
  quantidade?: number;
  imagem?: string;
  categoria?: string;
};

/**
 * Formato da resposta paginada do Spring Data (Page<T>).
 *
 * Até o Spring Boot 3.2 os dados de paginação vêm na raiz
 * (totalPages, number, last...). A partir do 3.3, com
 * PageSerializationMode.VIA_DTO, eles vêm dentro de "page".
 * Os dois formatos são aceitos.
 */
export type Pagina<T> = {
  content: T[];
  totalPages?: number;
  totalElements?: number;
  number?: number;
  size?: number;
  first?: boolean;
  last?: boolean;
  empty?: boolean;
  page?: {
    size: number;
    number: number;
    totalElements: number;
    totalPages: number;
  };
};
