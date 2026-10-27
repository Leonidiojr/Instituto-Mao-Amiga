import { Image, ScrollView, StyleSheet, Text } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { formatarPreco } from '../util/formatar';

type Props = NativeStackScreenProps<RootStackParamList, 'TelaDetalheProduto'>;

export default function TelaDetalheProduto({ route }: Props) {
  const { produto } = route.params;
  const temImagem = !!produto.imagem && /^https?:\/\//.test(produto.imagem);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.conteudo}>
      {temImagem ? <Image source={{ uri: produto.imagem }} style={styles.imagem} /> : null}
      <Text style={styles.nome}>{produto.nome}</Text>
      <Text style={styles.preco}>{formatarPreco(produto.preco)}</Text>
      {produto.categoria ? <Text style={styles.extra}>Categoria: {produto.categoria}</Text> : null}
      {produto.quantidade !== undefined ? (
        <Text style={styles.extra}>Em estoque: {produto.quantidade}</Text>
      ) : null}
      {produto.descricao ? <Text style={styles.descricao}>{produto.descricao}</Text> : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  conteudo: {
    padding: 15,
  },
  imagem: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: 8,
    marginBottom: 15,
  },
  nome: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000268',
  },
  preco: {
    fontSize: 18,
    fontWeight: '600',
    color: '#005f23',
    marginTop: 5,
  },
  extra: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
  },
  descricao: {
    fontSize: 15,
    color: '#666',
    marginTop: 10,
    lineHeight: 22,
  },
});
