export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL?: string;
  isOnline?: boolean;
  lastSeen?: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  roomId: string;
  createdAt: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  createdBy?: string;
}

export interface OnlineUser {
  userId: string;
  socketId: string;
  displayName: string;
}
