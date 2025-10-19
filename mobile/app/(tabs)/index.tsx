import useTheme from "@/hooks/useTheme";
import { Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const { toggleDarkMode } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* <Text>Edit app/index.tsx to edit this screen. hello </Text> */}
      <TouchableOpacity onPress={toggleDarkMode}>
        <Text>Chnage Colors</Text>
      </TouchableOpacity>
    </View>
  );
}
