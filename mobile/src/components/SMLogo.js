import { View, Text, StyleSheet } from 'react-native';
import { COLORES } from '../config';

export default function SMLogo({ size = 64 }) {
  return (
    <View
      style={[
        styles.circulo,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.iniciales, { fontSize: size * 0.42 }]}>SM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circulo: {
    backgroundColor: COLORES.azul,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  iniciales: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 1,
  },
});