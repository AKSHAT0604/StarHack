import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const QuestsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Quests Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
});

export default QuestsScreen;
