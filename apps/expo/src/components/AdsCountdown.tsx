import { Text, TouchableOpacity } from "react-native";

export const ADS_COUNTDOWN_TIME = 5_000;

export type AdsCountdownProps = {
  show: boolean;
  adsCountdownTime: number;
  onPress: () => void;
  type: "snooze" | "debt";
};

export const AdsCountdown = ({
  show,
  adsCountdownTime,
  onPress,
  type,
}: AdsCountdownProps) => {
  if (!show) return null;

  return (
    <TouchableOpacity
      className="absolute bottom-8 right-0 items-center bg-snooze-gray px-4 py-2 opacity-80"
      onPress={onPress}
    >
      <Text className="text-xs text-snooze-white">
        Ads in {Math.round(adsCountdownTime)} seconds...
      </Text>
      <Text className="text-sm text-snooze-white underline">
        {type === "snooze" ? "Snooze" : "Pay Later"}
      </Text>
    </TouchableOpacity>
  );
};
