import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link } from "expo-router";
import classNames from "classnames";

import { useAdMode } from "~/store/useAdMode";

const Homepage = () => {
  const { adMode, setAdMode } = useAdMode();

  return (
    <SafeAreaView className="mt-6 items-center">
      <Text className="my-4 text-center text-2xl font-semibold">
        Preferred Adjustment
      </Text>
      <View className="flex-row gap-4">
        <TouchableOpacity
          className={classNames("rounded-3xl border bg-white", {
            "border-snooze-button bg-snooze-button": adMode === "snooze",
          })}
          onPress={() => setAdMode("snooze")}
        >
          <Text
            className={classNames("w-36 py-2 text-center text-lg text-black", {
              "text-snooze-white": adMode === "snooze",
            })}
          >
            Snooze
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={classNames("rounded-3xl border bg-white", {
            "border-snooze-button bg-snooze-button": adMode === "ad debt",
          })}
          onPress={() => setAdMode("ad debt")}
        >
          <Text
            className={classNames("w-36 py-2 text-center text-lg text-black", {
              "text-snooze-white": adMode === "ad debt",
            })}
          >
            Ad Debt
          </Text>
        </TouchableOpacity>
      </View>
      <Image
        className="mt-6 aspect-video w-full"
        source={{ uri: "https://placekitten.com/200/300" }}
        alt="description"
      />
      <Text className="mt-6 text-2xl capitalize text-snooze-button">
        {adMode}
      </Text>
      <Text className="mx-4 mt-6 text-base">
        When your video is about to reach the scheduled ad insertion time, a
        prompt labeled &quot;snooze&quot; will appear five seconds prior. By
        clicking this button, your current video will pause, and a selection
        screen for choosing the snooze duration will be displayed in the center
        of the screen.
      </Text>
      <Text className="my-6 text-2xl text-snooze-button">
        Continue with <Text className="capitalize">{adMode}</Text> ?
      </Text>
      <Link href="/playlist" asChild>
        <TouchableOpacity className="rounded-3xl bg-snooze-button">
          <Text className="w-32 py-2 text-center text-lg text-snooze-white">
            Confirm
          </Text>
        </TouchableOpacity>
      </Link>
    </SafeAreaView>
  );
};

export default Homepage;
