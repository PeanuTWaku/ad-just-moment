import { useRef, useState } from "react";
import {
  Dimensions,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  ResizeMode,
  Video,
  VideoFullscreenUpdate,
  type AVPlaybackStatus,
  type VideoFullscreenUpdateEvent,
} from "expo-av";
import { Link, useRouter } from "expo-router";
import * as ScreenOrientation from "expo-screen-orientation";
import classNames from "classnames";

import { api } from "~/utils/api";
import {
  loadVideo,
  useIOSAudio,
  useUnlockScreenOrientation,
} from "~/utils/video";
import { MAX_DEBT, useDebtStore } from "~/store/useDebtStore";
import { ADS_COUNTDOWN_TIME, AdsCountdown } from "./AdsCountdown";
import { type Ads } from "./SnoozePlayer";

type DebtPlayerProps = {
  videoId: string;
};

export const DebtPlayer = ({ videoId }: DebtPlayerProps) => {
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);
  const [adsInfo, setAdsInfo] = useState<Ads>([]);
  const [isVideo, setIsVideo] = useState(true);
  const [videoPosition, setVideoPosition] = useState(0);
  const [showDebtCountdown, setShowDebtCountdown] = useState(false);
  const { debt, isFull, addDebt, payDebt } = useDebtStore();

  const router = useRouter();
  const [isPayingDebt, setIsPayingDebt] = useState(false);

  const videoQuery = api.video.byId.useQuery(
    { id: videoId },
    {
      onSuccess: (data) => {
        setAdsInfo(data.ads);
        void loadVideo(videoRef.current, data.uri);
      },
    },
  );

  const handlePlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    setStatus(status);
    if (!status.isLoaded) return;

    if (status.didJustFinish && isPayingDebt) {
      const ad = payDebt();
      if (ad) {
        await loadVideo(videoRef.current, ad);
        return;
      }
      setIsPayingDebt(false);
    }

    // when an ad finishes, load the video
    if (!isVideo && status.didJustFinish) {
      await loadVideo(videoRef.current, videoQuery.data?.uri ?? "", {
        positionMillis: videoPosition,
      });
      setIsVideo(true);
      return;
    }

    // when the video is playing and there's an ad, pause the video
    const firstAd = adsInfo[0];
    if (isVideo && firstAd && status.positionMillis >= firstAd.insertAt) {
      setIsVideo(false);
      setVideoPosition(status.positionMillis);
      await loadVideo(videoRef.current, firstAd.uri);
      setAdsInfo(adsInfo.slice(1));
      setShowDebtCountdown(false);
      return;
    }

    if (
      isVideo &&
      firstAd &&
      firstAd.insertAt - status.positionMillis <= ADS_COUNTDOWN_TIME
    ) {
      setShowDebtCountdown(true);
    }
  };

  const handleFullscreenUpdate = async ({
    fullscreenUpdate,
  }: VideoFullscreenUpdateEvent) => {
    if (Platform.OS !== "android") return;

    switch (fullscreenUpdate) {
      case VideoFullscreenUpdate.PLAYER_DID_PRESENT:
        await ScreenOrientation.unlockAsync(); // only on Android required
        break;
      case VideoFullscreenUpdate.PLAYER_WILL_DISMISS:
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT,
        ); // only on Android required
        break;
    }
  };

  useUnlockScreenOrientation();

  const isPlaying = status?.isLoaded && status.isPlaying;
  useIOSAudio(videoRef, isPlaying);

  const { width, height } = Dimensions.get("window");
  const isInLandscape = width > height;

  const debtCountDownTime = calculateCountDownTime({
    showDebtCountdown,
    firstAd: adsInfo[0],
    positionMillis: status?.isLoaded ? status.positionMillis : null,
  });

  const handlePayLaterPressed = () => {
    if (isFull()) {
      return;
    }
    const firstAd = adsInfo[0];
    if (!firstAd) {
      return;
    }
    addDebt(firstAd.uri);
    setAdsInfo(adsInfo.slice(1));
    setShowDebtCountdown(false);
  };

  const handlePayNowPressed = async () => {
    if (isPayingDebt) {
      setIsPayingDebt(false);
      return;
    }

    if (!isVideo) return;

    const ad = payDebt();
    if (!ad || !status?.isLoaded) return;

    setIsVideo(false);
    setVideoPosition(status.positionMillis);

    setIsPayingDebt(true);
    await loadVideo(videoRef.current, ad);
  };

  if (videoQuery.isLoading)
    return (
      <SafeAreaView>
        <Text>Loading...</Text>
        <Link href="/playlist">Back to Playlist</Link>
      </SafeAreaView>
    );

  if (videoQuery.isError)
    return (
      <SafeAreaView>
        <Text>Something went wrong</Text>
        <Link href="/playlist">Back to Playlist</Link>
      </SafeAreaView>
    );

  return (
    <SafeAreaView className="portrait:h-full landscape:bg-black">
      <View className="w-full">
        <View className="relative items-center justify-center">
          <Video
            ref={videoRef}
            useNativeControls={isVideo}
            resizeMode={ResizeMode.CONTAIN}
            onPlaybackStatusUpdate={(status) =>
              void handlePlaybackStatusUpdate(status)
            }
            onFullscreenUpdate={(e) => void handleFullscreenUpdate(e)}
            className="aspect-video w-full"
            style={isInLandscape ? { height: Math.floor(height) } : {}}
          />

          <AdsCountdown
            type="debt"
            show={showDebtCountdown}
            adsCountdownTime={debtCountDownTime}
            onPress={() => void handlePayLaterPressed()}
          />
          <DebtCircle
            type="inVedio"
            show={!showDebtCountdown && isInLandscape}
            debt={debt}
            isFull={isFull}
            isPayingDebt={isPayingDebt}
            onPress={() => void handlePayNowPressed()}
          />
        </View>
      </View>

      <View className="w-full items-start gap-2 p-4">
        <Text className="text-lg font-semibold">{videoQuery.data.title}</Text>
        <Text className="text-base font-light text-snooze-darkgray">
          Video Source: {videoQuery.data.channelName}
        </Text>

        <TouchableOpacity
          className="rounded-full bg-snooze-button px-4 py-2"
          onPress={() => router.push("/playlist")}
        >
          <Text className="font-semibold text-white">Back to Playlist</Text>
        </TouchableOpacity>
      </View>

      <DebtCircle
        type="outVideo"
        debt={debt}
        isFull={isFull}
        isPayingDebt={isPayingDebt}
        onPress={() => void handlePayNowPressed()}
        show={!isInLandscape}
      />
    </SafeAreaView>
  );
};

const calculateCountDownTime = ({
  showDebtCountdown,
  firstAd,
  positionMillis,
}: {
  showDebtCountdown: boolean;
  firstAd: Ads[number] | undefined;
  positionMillis: number | null | undefined;
}) => {
  if (!showDebtCountdown) return 0;
  if (firstAd == null) return 0;
  if (positionMillis == null) return 0;
  return (firstAd.insertAt - positionMillis) / 1000;
};

type DebtCircleProps = {
  debt: string[];
  isFull: () => boolean;
  isPayingDebt: boolean;
  onPress: () => void;
  show: boolean;
  type: "inVedio" | "outVideo";
};

const DebtCircle = ({
  debt,
  isFull,
  isPayingDebt,
  onPress,
  show,
  type,
}: DebtCircleProps) => {
  if (!show) return <></>;

  if (type === "inVedio") {
    return (
      <TouchableOpacity
        className={classNames(
          "absolute bottom-6 right-14 h-16 w-16 items-center justify-center rounded-full bg-snooze-panel",
          {
            "opacity-50": !isFull(),
          },
          {
            "bg-slate-200": isPayingDebt,
          },
        )}
        onPress={() => onPress()}
      >
        <Text
          className={classNames("text-snooze-white", {
            "text-black": isPayingDebt,
          })}
        >
          {debt.length} / {MAX_DEBT}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      className={classNames(
        "absolute bottom-8 right-8 h-16 w-16 items-center justify-center rounded-full bg-snooze-panel",
        {
          "opacity-50": !isFull(),
        },
        {
          "bg-slate-200": isPayingDebt,
        },
      )}
      onPress={() => onPress()}
    >
      <Text
        className={classNames("text-snooze-white", {
          "text-black": isPayingDebt,
        })}
      >
        {debt.length} / {MAX_DEBT}
      </Text>
    </TouchableOpacity>
  );
};
