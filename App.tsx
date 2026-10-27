import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TelaListaProdutos from './src/screen/TelaListaProdutos';
import TelaDetalheProduto from './src/screen/TelaDetalheProduto';
import { Produto } from './src/types/produto';

export type RootStackParamList = {
  TelaListaProdutos: undefined;
  TelaDetalheProduto: { produto: Produto };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="TelaListaProdutos">
          <Stack.Screen
            name="TelaListaProdutos"
            component={TelaListaProdutos}
            options={{ title: 'Lista de Produtos' }}
          />
          <Stack.Screen
            name="TelaDetalheProduto"
            component={TelaDetalheProduto}
            options={{ title: 'Detalhes do Produto' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
