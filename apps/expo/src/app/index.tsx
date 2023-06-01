import React, { useRef, useState } from "react";
import { Button, View } from "react-native";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";

export default function App() {
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus | null>(null);

  return (
    <View>
      <Video
        ref={video}
        source={{
          uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
        }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        isLooping
        onPlaybackStatusUpdate={(status) => setStatus(() => status)}
        className="aspect-video w-full"
      />
      <View>
        {status?.isLoaded && (
          <Button
            title={status.isPlaying ? "Pause" : "Play"}
            onPress={() =>
              status.isPlaying
                ? void video.current?.pauseAsync()
                : void video.current?.playAsync()
            }
          />
        )}
      </View>
    </View>
  );
}
