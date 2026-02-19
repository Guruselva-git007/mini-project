import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

let io = null;

const broadcast = (event, payload) => {
  if (!io) return;
  io.emit(event, payload);
};

export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN,
      credentials: true
    }
  });

  io.use((socket, next) => {
    const authToken = socket.handshake.auth?.token;

    if (!authToken) {
      return next();
    }

    try {
      socket.user = jwt.verify(authToken, env.JWT_SECRET);
      return next();
    } catch {
      return next(new Error("Invalid auth token"));
    }
  });

  io.on("connection", (socket) => {
    if (socket.user) {
      socket.join(`user:${socket.user.id}`);
      socket.join(`role:${socket.user.role}`);
      if (socket.user.departmentId) {
        socket.join(`department:${socket.user.departmentId}`);
      }
    }

    socket.on("issues:subscribeArea", ({ areaCode }) => {
      if (areaCode) {
        socket.join(`area:${String(areaCode).toLowerCase()}`);
      }
    });

    socket.on("issue:watch", ({ issueId }) => {
      if (issueId) {
        socket.join(`issue:${issueId}`);
      }
    });

    socket.on("issue:unwatch", ({ issueId }) => {
      if (issueId) {
        socket.leave(`issue:${issueId}`);
      }
    });
  });

  return io;
};

export const emitIssueCreated = (issue) => {
  if (!io) return;

  broadcast("issue:created", issue);
  io.to("role:Authority").emit("issue:created", issue);
  io.to("role:Admin").emit("issue:created", issue);

  if (issue.department?.id) {
    io.to(`department:${issue.department.id}`).emit("issue:created", issue);
  }
};

export const emitIssueUpdated = (issue) => {
  if (!io) return;

  broadcast("issue:updated", issue);

  if (issue.reporter?.id) {
    io.to(`user:${issue.reporter.id}`).emit("issue:updated", issue);
  }

  if (issue.department?.id) {
    io.to(`department:${issue.department.id}`).emit("issue:updated", issue);
  }
};

export const emitIssueMerged = (issue, meta = {}) => {
  if (!io) return;
  broadcast("issue:merged", {
    issue,
    meta
  });

  if (issue.department?.id) {
    io.to(`department:${issue.department.id}`).emit("issue:merged", {
      issue,
      meta
    });
  }
};

export const emitCommentAdded = (comment) => {
  if (!io) return;

  broadcast("comment:added", comment);
  io.to(`issue:${comment.issueId}`).emit("comment:added", comment);
};

export const getSocket = () => io;
