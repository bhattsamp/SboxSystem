import { io, Socket } from 'socket.io-client'
import { storage, TOKEN_KEY } from '@/utils/storage'

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token: storage.get<string>(TOKEN_KEY) },
      transports: ['websocket', 'polling'],
      autoConnect: false,
    })
  }
  return socket
}

export const connectSocket = (): void => {
  const s = getSocket()
  if (!s.connected) s.connect()
}

export const disconnectSocket = (): void => {
  if (socket?.connected) socket.disconnect()
}
