import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface EntityPickerProps<T> {
  visible: boolean;
  title: string;
  items: T[];
  loading?: boolean;
  selectedKey?: string | null;
  searchPlaceholder?: string;
  emptyText?: string;
  keyExtractor(item: T): string;
  labelExtractor(item: T): string;
  subtitleExtractor?(item: T): string | undefined | null;
  onClose(): void;
  onSelect(item: T): void;
}

export function EntityPicker<T>({
  visible,
  title,
  items,
  loading = false,
  selectedKey,
  searchPlaceholder = "Buscar item",
  emptyText = "Nenhum item encontrado.",
  keyExtractor,
  labelExtractor,
  subtitleExtractor,
  onClose,
  onSelect,
}: EntityPickerProps<T>) {
  const [search, setSearch] = useState("");

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return items;
    }

    return items.filter((item) => {
      const label = labelExtractor(item).toLowerCase();
      const subtitle = subtitleExtractor?.(item)?.toLowerCase() ?? "";
      return label.includes(term) || subtitle.includes(term);
    });
  }, [items, labelExtractor, search, subtitleExtractor]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <Feather name="search" size={16} color="#7c8db5" />
            <TextInput
              style={styles.searchInput}
              placeholder={searchPlaceholder}
              placeholderTextColor="#7c8db5"
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {loading ? (
            <View style={styles.center}>
              <ActivityIndicator color="#16C7E7" />
            </View>
          ) : (
            <FlatList
              data={filteredItems}
              keyExtractor={keyExtractor}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const key = keyExtractor(item);
                const selected = selectedKey === key;
                const subtitle = subtitleExtractor?.(item);

                return (
                  <TouchableOpacity
                    style={[styles.item, selected && styles.itemSelected]}
                    activeOpacity={0.8}
                    onPress={() => {
                      onSelect(item);
                      onClose();
                    }}
                  >
                    <View style={styles.itemContent}>
                      <Text style={styles.itemLabel}>{labelExtractor(item)}</Text>
                      {subtitle ? (
                        <Text style={styles.itemSubtitle}>{subtitle}</Text>
                      ) : null}
                    </View>
                    <Feather
                      name={selected ? "check-circle" : "circle"}
                      size={18}
                      color={selected ? "#16C7E7" : "#7c8db5"}
                    />
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={<Text style={styles.emptyText}>{emptyText}</Text>}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  content: {
    backgroundColor: "#10213E",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    height: "72%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#223654",
    borderRadius: 10,
    paddingHorizontal: 12,
    gap: 8,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    color: "#FFF",
    paddingVertical: 12,
    fontSize: 14,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#1a2f4e",
    gap: 12,
  },
  itemSelected: {
    backgroundColor: "#0d2040",
    borderRadius: 10,
    paddingHorizontal: 10,
  },
  itemContent: {
    flex: 1,
  },
  itemLabel: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  itemSubtitle: {
    color: "#7c8db5",
    fontSize: 12,
    marginTop: 2,
  },
  emptyText: {
    color: "#7c8db5",
    textAlign: "center",
    marginTop: 24,
  },
});
