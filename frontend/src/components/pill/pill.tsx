import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type TaskFilter = 'todas' | 'pendentes' | 'concluidas';

interface Props {
  activeFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
}

export default function TaskFilterTabs({ activeFilter, onFilterChange }: Props) {
  const filters: { label: string; value: TaskFilter }[] = [
    { label: 'Todas', value: 'todas' },
    { label: 'Pendentes', value: 'pendentes' },
    { label: 'Concluídas', value: 'concluidas' },
  ];

  return (
    <View style={styles.container}>
      {filters.map((f) => (
        <TouchableOpacity
          key={f.value}
          style={[styles.pill, activeFilter === f.value && styles.pillActive]}
          onPress={() => onFilterChange(f.value)}
        >
          <Text style={[styles.text, activeFilter === f.value && styles.textActive]}>
            {f.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e8edf2',
  },
  pillActive: {
    backgroundColor: '#0079C7',
  },
  text: {
    color: '#555',
    fontWeight: '500',
  },
  textActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
});