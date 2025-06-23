import React, { useState, useEffect } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import Gastos from "./src/components/gastos";
import { ActivityIndicator } from "react-native";

const StatusBarHeight = StatusBar.currentHeight;

export default function App() {
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [totalGastos, setTotalGastos] = useState(0);
  const [type, setType] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  const [gastos, setGastos] = useState([]);

  useEffect(() => {
    async function loadGastos() {
      try {
        const jsonValue = await AsyncStorage.getItem("@gastos");
        const dados = jsonValue != null ? JSON.parse(jsonValue) : [];
        setGastos(dados);
        setTotalGastos(dados.reduce((acc, item) => acc + item.price, 0));
      } catch (error) {
        console.log("Erro ao carregar gastos:", error);
      } finally {
        setLoading(false);
      }
    }

    loadGastos();
  }, []);

  useEffect(() => {
    async function saveGastos() {
      try {
        const getValues = JSON.stringify(gastos);
        await AsyncStorage.setItem("@gastos", getValues);
      } catch (error) {
        Alert.alert("Não foi possível salvar os dados.", error);
      }
    }

    if (!loading) {
      saveGastos();
    }
  }, [gastos, loading]);

  function handleDeleteEditingItem() {
    if (editingId) {
      const novos = gastos.filter((item) => item.id !== editingId);
      setGastos(novos);
      setTotalGastos(novos.reduce((acc, item) => acc + item.price, 0));
      setEditingId(null);
      setDescription("");
      setPrice("");
      Keyboard.dismiss();
    }
  }

  function calcularTotalPorTipo() {
    const mapa = {};

    gastos.forEach((item) => {
      const tipo = item.type?.toLowerCase() || "sem tipo";
      mapa[tipo] = (mapa[tipo] || 0) + item.price;
    });

    return mapa;
  }

  function handleSubmit() {
    if (editingId) {
      const novos = gastos.map((g) =>
        g.id === editingId ? { ...g, description, price: parseFloat(price) } : g
      );
      setGastos(novos);
      setTotalGastos(novos.reduce((acc, item) => acc + item.price, 0));
      setEditingId(null);
    } else {
      handleAddNewGasto();
    }

    setDescription("");
    setPrice("");
    Keyboard.dismiss();
  }

  function handleAddNewGasto() {
    const valor = parseFloat(price);

    if (description.trim() === "" || price === "") {
      Alert.alert("Dados inválidos!", "Preencha corretamente os campos.");
      return;
    } else if (isNaN(valor) || valor <= 0) {
      Alert.alert(
        "Dados inválidos!",
        "Insira um valor numérico maior que zero."
      );
      return;
    }

    const data = {
      id: Date.now(),
      description,
      price: valor,
      type: type.trim(),
      data: new Date().toLocaleDateString("pt-BR"),
    };

    const novosGastos = [...gastos, data];
    setGastos(novosGastos);
    setTotalGastos(novosGastos.reduce((acc, item) => acc + item.price, 0));

    setDescription("");
    setPrice("");
    setType("");
    Keyboard.dismiss();
  }

  function handleEditStart(item) {
    setDescription(item.description);
    setPrice(item.price.toString());
    setEditingId(item.id);
  }

  function handleDelete(id) {
    const novos = gastos.filter((item) => item.id !== id);
    setGastos(novos);
    setTotalGastos(novos.reduce((acc, item) => acc + item.price, 0));
  }

  if (loading) {
    return (
      <View style={{ flex: 1, height: "100%", justifyContent: "center" }}>
        <ActivityIndicator size={60} color={"#065f46"} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <TouchableWithoutFeedback
        onPress={() => Keyboard.dismiss()}
        touchSoundDisabled={true}
      >
        <View style={st.background}>
          <View style={st.container}>
            <StatusBar hidden={true} />
            <View style={st.containerTitles}>
              <Text style={st.principalTitle}>Bem-vindo de volta!</Text>
              <Text style={st.secondTitle}>
                Não deixe de registrar seus gastos diários.
              </Text>
            </View>

            <View style={st.inputsContainer}>
              <TextInput
                style={st.input}
                placeholder="Descrição"
                placeholderTextColor={"#71717a"}
                value={description}
                onChangeText={(text) => setDescription(text)}
              />

              <TextInput
                style={st.input}
                placeholder="Valor"
                placeholderTextColor={"#71717a"}
                value={price}
                onChangeText={(text) => setPrice(text)}
                keyboardType="decimal-pad"
              />

              <TextInput
                style={st.input}
                placeholder="Tipo (ex: pessoal, amigo...)"
                placeholderTextColor={"#71717a"}
                value={type}
                onChangeText={setType}
              />

              <View style={st.areaButtons}>
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={st.addButton}
                  onPress={handleSubmit}
                >
                  <Text style={st.buttonText}>
                    {editingId ? "Salvar" : "Adicionar"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    st.deleteButton,
                    !editingId && st.deleteButtonDisabled,
                  ]}
                  disabled={!editingId}
                  onPress={handleDeleteEditingItem}
                >
                  <Text
                    style={[
                      st.buttonText,
                      !editingId && { color: "#9ca3af" }, // cinza claro
                    ]}
                  >
                    Excluir
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <FlatList
              style={st.listGastos}
              showsVerticalScrollIndicator={true}
              data={gastos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Gastos
                  data={item}
                  onDelete={() => handleDelete(item.id)}
                  onEdit={() => handleEditStart(item)}
                  editingId={editingId}
                />
              )}
            />

            <View style={{ marginTop: 20 }}>
              <Text style={st.textTotal}>Total: {totalGastos.toFixed(2)}</Text>
              {Object.entries(calcularTotalPorTipo()).map(([tipo, total]) => (
                <Text key={tipo} style={st.textTotal}>
                  {tipo[0].toUpperCase() + tipo.slice(1)}: R$ {total.toFixed(2)}
                </Text>
              ))}
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: "#f0fdf4", // Verde pastel claro
    paddingTop: StatusBarHeight + 40,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    marginBottom: StatusBarHeight * 3,
  },
  containerTitles: {
    alignItems: "center",
    marginBottom: 30,
  },
  principalTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#065f46", // Verde escuro
  },
  secondTitle: {
    fontSize: 16,
    color: "#065f46",
    marginTop: 4,
  },
  inputsContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 30,
    gap: 12,
  },
  input: {
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#0f172a",
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  containerTotal: {
    justifyContent: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    paddingHorizontal: 16,
    height: 50,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  textTotal: {
    color: "#0f172a",
    fontSize: 16,
  },
  areaButtons: {
    flexDirection: "row",
    gap: 10,
  },
  addButton: {
    flex: 1,
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    elevation: 4,
  },
  editButton: {
    flex: 1,
    backgroundColor: "#facc15",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  listGastos: {
    flex: 1,
  },
  totalText: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#1e293b",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#dc2626", // vermelho
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 10,
  },
  deleteButtonDisabled: {
    backgroundColor: "#fca5a5", // vermelho claro + opacidade de desativado
  },
});
