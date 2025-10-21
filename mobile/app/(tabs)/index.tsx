import { createHomeStyles } from "@/assets/styles/home.styles";
import useTheme from "@/hooks/useTheme";
import {
  Alert,
  FlatList,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Header from "@/components/Header";
import TodoInput from "@/components/TodoInput";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import LoadingState from "@/components/LoadingState";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { Ionicons } from "@expo/vector-icons";
import EmptyState from "@/components/EmptyState";
import { useState } from "react";

type Todo = Doc<"todos">;

export default function Index() {
  const { colors } = useTheme();
  const [editingTodoId, setEditingTodoId] = useState<Id<"todos"> | null>(null);
  const [editingText, setEditingText] = useState<string>("");

  const homeStyles = createHomeStyles(colors);

  const todos = useQuery(api.todos.getTodos);
  // console.log("Todos:", todos);
  const toggleTodo = useMutation(api.todos.toggleTodo);
  const deleteTodo = useMutation(api.todos.deleteTodo);
  const updateTodo = useMutation(api.todos.updateTodo);

  const isLoading = todos === undefined;

  if (isLoading) return <LoadingState />;

  const handleToggleTodo = async (id: Id<"todos">) => {
    try {
      await toggleTodo({ id });
    } catch (error) {
      console.error("Error toggling todo:", error);
      Alert.alert("Error", "There was an error updating the todo item.");
    }
  };

  const handleDeleteTodo = async (id: Id<"todos">) => {
    try {
      // show the Alart to confirm deletion with options Yes and No
      Alert.alert("Delete Todo", "Are you sure you want to delete this todo?", [
        {
          text: "No",
          style: "cancel",
        },
        {
          text: "Yes",
          onPress: async () => {
            await deleteTodo({ id });
          },
          style: "destructive",
        },
      ]);
    } catch (error) {
      console.error("Error deleting todo:", error);
      Alert.alert("Error", "There was an error deleting the todo item.");
    }
  };

  const renderTodoItem = ({ item }: { item: Todo }) => {
    const isEditing = editingTodoId === item._id;
    return (
      <View style={homeStyles.todoItemWrapper}>
        <LinearGradient
          colors={colors.gradients.surface}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={homeStyles.todoItem}
        >
          <TouchableOpacity
            style={homeStyles.checkbox}
            activeOpacity={0.7}
            onPress={() => handleToggleTodo(item._id)}
          >
            <LinearGradient
              colors={
                item.isCompleted
                  ? colors.gradients.success
                  : colors.gradients.muted
              }
              style={[
                homeStyles.checkboxInner,
                {
                  borderColor: item.isCompleted ? "transparent" : colors.border,
                },
              ]}
            >
              {item.isCompleted && (
                <Ionicons name="checkmark" size={18} color={"#fff"} />
              )}
              {/* <Text style={homeStyles.todoText}>{item.text}</Text> */}
            </LinearGradient>
          </TouchableOpacity>

          {isEditing && editingTodoId === item._id ? (
            <View style={homeStyles.editContainer}>
              <TextInput
                style={homeStyles.editInput}
                value={editingText}
                onChangeText={setEditingText}
                autoFocus
                multiline
                placeholder="Edit your todo..."
                placeholderTextColor={colors.textMuted}
              />
              <View style={homeStyles.editButtons}>
                <TouchableOpacity onPress={handleSaveEdit} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.success}
                    style={homeStyles.editButton}
                  >
                    <Ionicons name="checkmark" size={16} color={"#fff"} />
                    <Text style={homeStyles.editButtonText}>Save</Text>
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancelEdit} activeOpacity={0.8}>
                  <LinearGradient
                    colors={colors.gradients.muted}
                    style={homeStyles.editButton}
                  >
                    <Ionicons name="close" size={16} color={"#fff"} />
                    <Text style={homeStyles.editButtonText}>Canecl</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={homeStyles.todoTextContainer}>
              <Text
                style={[
                  homeStyles.todoText,
                  item.isCompleted && {
                    textDecorationLine: "line-through",
                    color: colors.textMuted,
                    opacity: 0.6,
                  },
                ]}
              >
                {item.text}
              </Text>

              <View style={homeStyles.todoActions}>
                <TouchableOpacity
                  onPress={() => handleEditTodo(item)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.warning}
                    style={homeStyles.actionButton}
                  >
                    <Ionicons name="pencil" size={16} color={"#fff"} />
                  </LinearGradient>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDeleteTodo(item._id)}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={colors.gradients.danger}
                    style={homeStyles.actionButton}
                  >
                    <Ionicons name="trash" size={16} color={"#fff"} />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </LinearGradient>
      </View>
    );
  };

  const handleEditTodo = (todo: Todo) => {
    setEditingTodoId(todo._id);
    setEditingText(todo.text);
  };

  const handleSaveEdit = async () => {
    if (editingTodoId) {
      try {
        await updateTodo({ id: editingTodoId!, text: editingText });
        setEditingTodoId(null);
        setEditingText("");
      } catch (error) {
        console.error("Error updating todo:", error);
        Alert.alert("Error", "There was an error updating the todo item.");
        setEditingText("");
        setEditingTodoId(null);
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
    setEditingText("");
  };

  return (
    <LinearGradient
      colors={colors.gradients.background}
      style={homeStyles.container}
    >
      <StatusBar barStyle={colors.statusBarStyle} />
      <SafeAreaView style={homeStyles.safeArea}>
        <Header />
        <TodoInput />

        <FlatList
          data={todos}
          renderItem={renderTodoItem}
          keyExtractor={(item) => item._id}
          style={homeStyles.todoList}
          contentContainerStyle={homeStyles.todoListContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<EmptyState />}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}
