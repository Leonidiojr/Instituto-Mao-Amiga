import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../App';
import { Produto } from '../types/produto';
import { getProdutos } from '../service/produto-service';
import { formatarPreco } from '../util/formatar';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaListaProdutos'>;

const CHAVE_FAVORITOS = '@compre-bem:favoritos';
const ATRASO_BUSCA_MS = 400;

export default function TelaListaProdutos({ navigation }: Props) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [pagina, setPagina] = useState(0);
  const [ultimaPagina, setUltimaPagina] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [carregandoMais, setCarregandoMais] = useState(false);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState('');

  const [busca, setBusca] = useState('');
  const [buscaAplicada, setBuscaAplicada] = useState('');

  const [favoritos, setFavoritos] = useState<number[]>([]);

  // Guarda a requisição em andamento para cancelar respostas antigas
  // (ex.: o usuário digitou outra busca antes da anterior responder).
  const requisicaoAtual = useRef<AbortController | null>(null);

  const carregarPagina = useCallback(async (numeroPagina: number, filtro: string) => {
    requisicaoAtual.current?.abort();
    const controle = new AbortController();
    requisicaoAtual.current = controle;

    setErro('');
    if (numeroPagina === 0) {
      setCarregando(true);
    } else {
      setCarregandoMais(true);
    }

    try {
      const resposta = await getProdutos(numeroPagina, filtro, controle.signal);

      setProdutos((atual) => {
        if (numeroPagina === 0) {
          return resposta.produtos;
        }
        const idsAtuais = new Set(atual.map((p) => p.id));
        return [...atual, ...resposta.produtos.filter((p) => !idsAtuais.has(p.id))];
      });
      setPagina(numeroPagina);
      setUltimaPagina(resposta.ultimaPagina);
    } catch (e) {
      if (controle.signal.aborted) {
        return;
      }
      console.warn('Falha ao buscar produtos', e);
      setErro('Não foi possível carregar os produtos. Verifique se a API está no ar.');
    } finally {
      if (requisicaoAtual.current === controle) {
        setCarregando(false);
        setCarregandoMais(false);
        setAtualizando(false);
      }
    }
  }, []);

  // Espera o usuário parar de digitar antes de buscar na API.
  useEffect(() => {
    const timer = setTimeout(() => setBuscaAplicada(busca.trim()), ATRASO_BUSCA_MS);
    return () => clearTimeout(timer);
  }, [busca]);

  // Sempre que a busca muda, recomeça da página 0.
  useEffect(() => {
    carregarPagina(0, buscaAplicada);
  }, [buscaAplicada, carregarPagina]);

  // Cancela a requisição pendente ao sair da tela.
  useEffect(() => () => requisicaoAtual.current?.abort(), []);

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_FAVORITOS)
      .then((valor) => {
        if (!valor) return;
        const lista = JSON.parse(valor);
        if (Array.isArray(lista)) {
          setFavoritos(lista.map(Number).filter((id) => !isNaN(id)));
        }
      })
      .catch((e) => console.warn('Falha ao ler favoritos', e));
  }, []);

  function carregarMais() {
    if (carregando || carregandoMais || ultimaPagina || erro) return;
    carregarPagina(pagina + 1, buscaAplicada);
  }

  function atualizar() {
    setAtualizando(true);
    carregarPagina(0, buscaAplicada);
  }

  function tentarNovamente() {
    carregarPagina(produtos.length === 0 ? 0 : pagina + 1, buscaAplicada);
  }

  function alterarFavorito(id: number) {
    const novo = favoritos.includes(id) ? favoritos.filter((f) => f !== id) : [...favoritos, id];
    setFavoritos(novo);
    AsyncStorage.setItem(CHAVE_FAVORITOS, JSON.stringify(novo)).catch((e) =>
      console.warn('Falha ao salvar favoritos', e),
    );
  }

  function renderItem({ item }: { item: Produto }) {
    const favorito = favoritos.includes(item.id);
    return (
      <View style={styles.item}>
        <TouchableOpacity
          style={styles.itemInfo}
          onPress={() => navigation.navigate('TelaDetalheProduto', { produto: item })}>
          <Text style={styles.nome}>{item.nome}</Text>
          {item.categoria ? <Text style={styles.categoria}>{item.categoria}</Text> : null}
          <Text style={styles.preco}>{formatarPreco(item.preco)}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.botaoFavorito}
          accessibilityRole="button"
          accessibilityLabel={favorito ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
          onPress={() => alterarFavorito(item.id)}>
          <Text style={styles.favoritoTexto}>{favorito ? '♥' : '♡'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function renderRodape() {
    if (carregandoMais) {
      return <ActivityIndicator style={styles.rodape} />;
    }
    if (erro && produtos.length > 0) {
      return (
        <View style={styles.rodape}>
          <Text style={styles.erro}>{erro}</Text>
          <TouchableOpacity style={styles.botao} onPress={tentarNovamente}>
            <Text style={styles.botaoTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }

  function renderVazio() {
    if (carregando) return null;
    if (erro) {
      return (
        <View style={styles.centro}>
          <Text style={styles.erro}>{erro}</Text>
          <TouchableOpacity style={styles.botao} onPress={tentarNovamente}>
            <Text style={styles.botaoTexto}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.centro}>
        <Text style={styles.vazio}>
          {buscaAplicada ? 'Nenhum produto encontrado para essa busca.' : 'Nenhum produto cadastrado.'}
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.area} edges={['left', 'right']}>
      <TextInput
        style={styles.buscar}
        placeholder="Buscar produtos..."
        value={busca}
        onChangeText={setBusca}
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />

      {carregando && produtos.length === 0 ? (
        <ActivityIndicator size="large" style={styles.carregandoInicial} />
      ) : (
        <FlatList
          data={produtos}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          onEndReached={carregarMais}
          onEndReachedThreshold={0.5}
          refreshing={atualizando}
          onRefresh={atualizar}
          ListFooterComponent={renderRodape}
          ListEmptyComponent={renderVazio}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={produtos.length === 0 ? styles.listaVazia : undefined}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  area: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  buscar: {
    margin: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CCC',
    borderRadius: 8,
  },
  carregandoInicial: {
    marginTop: 40,
  },
  listaVazia: {
    flexGrow: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  itemInfo: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  nome: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  categoria: {
    fontSize: 13,
    color: '#727dac',
    marginTop: 2,
  },
  preco: {
    fontSize: 14,
    color: '#005f23',
    marginTop: 4,
  },
  botaoFavorito: {
    minWidth: 44,
    minHeight: 44,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoritoTexto: {
    fontSize: 22,
    color: '#C62828',
  },
  rodape: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  erro: {
    color: '#C62828',
    textAlign: 'center',
  },
  vazio: {
    color: '#666',
    textAlign: 'center',
  },
  botao: {
    backgroundColor: '#727dac',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  botaoTexto: {
    color: '#FFF',
    fontWeight: '600',
  },
});
