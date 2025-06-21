import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import React from "react";

import FontAwesome from "react-native-vector-icons/FontAwesome";

export default function Gastos({ data, onDelete, onEdit, editingId }) {
  const isEditing = data.id === editingId;

  return (
    <View style={st.areaPessoa}>
      <View>
        <Text>Descrição: {data.description}</Text>
        <Text>R$: {data.price}</Text>
        <Text>Data: {data.data}</Text>
        <Text>Tipo: {data.type}</Text>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <TouchableOpacity onPress={() => onEdit(data)}>
          <FontAwesome name="pencil" size={30} color={"#2563eb"} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  areaPessoa: {
    backgroundColor: "#eaeaea",
    borderRadius: 8,
    marginBottom: 20,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 8,
    paddingBottom: 8,
    justifyContent: "space-between",
    flexDirection: "row",
  },
});
