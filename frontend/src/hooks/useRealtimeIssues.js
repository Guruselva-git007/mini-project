import { useEffect } from "react";
import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const useRealtimeIssues = ({ token, handlers = {} }) => {
  useEffect(() => {
    if (!token) return undefined;

    const socket = io(socketUrl, {
      auth: {
        token
      }
    });

    if (handlers.onIssueCreated) {
      socket.on("issue:created", handlers.onIssueCreated);
    }

    if (handlers.onIssueUpdated) {
      socket.on("issue:updated", handlers.onIssueUpdated);
    }

    if (handlers.onIssueMerged) {
      socket.on("issue:merged", handlers.onIssueMerged);
    }

    if (handlers.onCommentAdded) {
      socket.on("comment:added", handlers.onCommentAdded);
    }

    return () => {
      socket.disconnect();
    };
  }, [token, handlers]);
};

export default useRealtimeIssues;
