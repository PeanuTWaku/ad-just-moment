import { Redirect, useSearchParams } from "expo-router";

import { DebtPlayer } from "~/components/DebtPlayer";
import { SnoozePlayer } from "~/components/SnoozePlayer";
import { useAdMode } from "~/store/useAdMode";

const VideoPage = () => {
  const { videoId } = useSearchParams<{ videoId: string }>();
  const mode = useAdMode((state) => state.adMode);

  if (!videoId) {
    return <Redirect href="/playlist"></Redirect>;
  }

  if (mode === "snooze") {
    return <SnoozePlayer videoId={videoId} />;
  }

  if (mode === "ad debt") {
    return <DebtPlayer videoId={videoId} />;
  }

  return <Redirect href="/"></Redirect>;
};

export default VideoPage;
