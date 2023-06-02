import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Picker } from "@react-native-picker/picker";

export type SnoozePanelProps = {
  show: boolean;
  onCancelPressed: () => void;
  onConfirmPressed: (time: { minutes: number; seconds: number }) => void;
};

export const SnoozePanel = ({
  show,
  onCancelPressed,
  onConfirmPressed,
}: SnoozePanelProps) => {
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedSecond, setSelectedSecond] = useState(30);

  if (!show) return null;

  const selectableMinutes = [0, 1, 2, 3, 4, 5, 6];
  const selectableSeconds = [0, 30];

  return (
    <View className="absolute inset-0 rounded bg-snooze-panel p-4">
      <View className="items-center gap-4">
        <Text className="text-lg font-semibold text-snooze-white">Snooze</Text>
        <View className="flex-row items-center gap-2">
          <TimePicker
            items={selectableMinutes}
            selectedValue={selectedMinute}
            onValueChange={setSelectedMinute}
          />
          <Text className="text-white">min</Text>
          <TimePicker
            items={selectableSeconds}
            selectedValue={selectedSecond}
            onValueChange={setSelectedSecond}
          />
          <Text className="text-white">sec</Text>
        </View>

        <View className="flex-row justify-center gap-4">
          <TouchableOpacity
            onPress={onCancelPressed}
            className="rounded-full border border-snooze-white px-4 py-2"
          >
            <Text className="text-snooze-white">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() =>
              onConfirmPressed({
                minutes: selectedMinute,
                seconds: selectedSecond,
              })
            }
            className="rounded-full bg-snooze-white px-4 py-2"
          >
            <Text className="text-snooze-button">Confirm</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

type TimePickerProps<T> = {
  selectedValue: number;
  onValueChange: (itemValue: number) => void;
  items: T[];
};

const TimePicker = <T extends { toString: () => string }>({
  selectedValue,
  onValueChange,
  items,
}: TimePickerProps<T>) => {
  return (
    <Picker
      style={{
        backgroundColor: "#000000",
        color: "#ffffff",
        width: 100,
        height: 75,
        overflow: "hidden",
        justifyContent: "center",
        borderRadius: 10,
        padding: 0,
      }}
      itemStyle={{
        textAlign: "center",
        color: "#ffffff",
        padding: 0,
        margin: 0,
      }}
      mode="dropdown"
      prompt="Select Minutes"
      selectedValue={selectedValue}
      onValueChange={onValueChange}
    >
      {items.map((item) => (
        <Picker.Item
          key={item.toString()}
          label={item.toString()}
          value={item}
        />
      ))}
    </Picker>
  );
};
