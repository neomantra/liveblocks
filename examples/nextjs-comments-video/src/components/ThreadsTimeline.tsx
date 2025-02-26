import { ThreadMetadata, useThreads, useUser } from "@/liveblocks.config";
import { ClientSideSuspense } from "@liveblocks/react";
import { ErrorBoundary } from "react-error-boundary";
import styles from "./ThreadsTimeline.module.css";
import { ThreadData } from "@liveblocks/core";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Comment } from "@liveblocks/react-comments/primitives";
import {
  resetAllHighlights,
  useHighlightPinListener,
  useHighlightThread,
} from "@/utils";
import { formatTime } from "@/components/Duration";
import { Mention } from "@/components/Mention";
import { Link } from "@/components/Link";
import { useState } from "react";

export function ThreadsTimeline() {
  return (
    // @ts-ignore
    <ErrorBoundary fallback={<div>error</div>}>
      <ClientSideSuspense fallback={null}>
        {() => <PinnedThreads />}
      </ClientSideSuspense>
    </ErrorBoundary>
  );
}

function PinnedThreads() {
  const { threads } = useThreads();

  return (
    <div className={styles.pinnedThreads}>
      {threads.map((thread) => (
        <PinnedThread key={thread.id} thread={thread} />
      ))}
    </div>
  );
}

function PinnedThread({ thread }: { thread: ThreadData<ThreadMetadata> }) {
  const { user } = useUser(thread.comments?.[0].userId || "");
  const highlightThread = useHighlightThread(thread.id);
  const [highlightedPin, setHighlightedPin] = useState(false);

  // On highlight event, highlight this pin
  useHighlightPinListener((threadId) => {
    if (thread.id !== threadId) {
      setHighlightedPin(false);
      return;
    }

    setHighlightedPin(false);
    setTimeout(() => setHighlightedPin(true));
  });

  // Not intended to be on the timeline, or all comments deleted
  if (thread.metadata.time === -1 || !thread.comments.length) {
    return null;
  }

  return (
    <div
      className={styles.pinnedThread}
      onClick={highlightThread}
      onPointerEnter={highlightThread}
      onPointerLeave={resetAllHighlights}
      style={{ left: `${thread.metadata.timePercentage}%` }}
      data-highlight={highlightedPin || undefined}
    >
      <Tooltip.Root>
        <Tooltip.Trigger>
          <div className={styles.avatarPin}>
            <img src={user.avatar} alt={user.name} />
          </div>
        </Tooltip.Trigger>
        <Tooltip.Content className={styles.tooltip}>
          <div className={styles.tooltipHeader}>
            <img src={user.avatar} alt="" />
            {user.name}
          </div>
          <div className={styles.tooltipBody}>
            <span>{formatTime(thread.metadata.time) + " "}</span>
            <Comment.Body
              body={thread.comments[0].body}
              components={{
                Mention,
                Link,
              }}
            />
          </div>
        </Tooltip.Content>
      </Tooltip.Root>
    </div>
  );
}
