import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Link, useRouter } from "expo-router";
import { FlashList } from "@shopify/flash-list";

import { api } from "~/utils/api";
import { useDebtStore } from "~/store/useDebtStore";

const PlaylistPage = () => {
  const videos = api.video.all.useQuery();
  const router = useRouter();
  const { clearAllDebt } = useDebtStore();

  return (
    <SafeAreaView>
      <View className=" p-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-2xl font-semibold">AdJustMoment</Text>
          <TouchableOpacity
            className="rounded-2xl bg-snooze-button"
            onPress={() => {
              clearAllDebt();
              void router.push("/");
            }}
          >
            <Text className="px-4 py-2 font-semibold uppercase text-snooze-white">
              Reset
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text className="px-6 pb-4 text-xl font-medium">Playlist</Text>

      <View className="h-96 w-full">
        <FlashList
          data={videos.data}
          keyExtractor={(video) => video.id}
          estimatedItemSize={10}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
          renderItem={({ item: video }) => (
            <Link href={video.id} key={video.id}>
              <View className="flex-row">
                <View className="h-20 px-2">
                  <Image
                    alt={video.title}
                    source={{ uri: video.thumbnail }}
                    className="aspect-video h-full rounded-md "
                  />
                </View>
                <View className="flex-auto px-2">
                  <Text className="text-lg font-medium">{video.title}</Text>
                  <Text className="text-sm font-light">
                    {video.channelName}
                  </Text>
                </View>
              </View>
            </Link>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default PlaylistPage;
