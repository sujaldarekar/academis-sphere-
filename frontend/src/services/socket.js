import io from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (userId) => {
  if (!socket) {
    socket = io(SOCKET_URL);
    socket.emit('join-user', userId);
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event listeners
export const onNewNotification = (callback) => {
  if (socket) {
    socket.on('new-notification', callback);
  }
};

export const onDocumentStatusUpdate = (callback) => {
  if (socket) {
    socket.on('document-status-updated', callback);
  }
};

// Socket event emitters
export const emitDocumentApproved = (data) => {
  if (socket) {
    socket.emit('document-approved', data);
  }
};

export const emitDocumentRejected = (data) => {
  if (socket) {
    socket.emit('document-rejected', data);
  }
};

export const emitSendNotification = (data) => {
  if (socket) {
    socket.emit('send-notification', data);
  }
};
