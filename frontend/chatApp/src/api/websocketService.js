import config from "../config/config";

class WebSocketService {
  constructor() {
    this.socket = null;
    this.callbacks = {};
    this.reconnectInterval = 3000;
    this.shouldReconnect = true;

    this.token = null;
    this.currentRoom = null;
  }

  connect(token, roomName) {
    if (!token || !roomName) return;
    this.shouldReconnect = true;

    // ✅ GUARD: already connected to same room
     if (
    this.socket &&
    this.socket.readyState === WebSocket.OPEN &&
    this.currentRoom === roomName
  ) {
    return;
  }

    this.token = token;
    this.currentRoom = roomName;

    if (this.socket) {
      this.disconnect();
    }

    let baseUrl = config.wsUrl;
  const urlObj = new URL(baseUrl)
  const wsProtocol = urlObj.protocol === "https:"?"wss:":"ws:";

    const wsUrl = `${wsProtocol}//${urlObj.host}/ws/chat/${roomName}/?token=${token}`;
    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => this.trigger("open");
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.trigger("message", data);
      } catch (e) {}
    };

    this.socket.onclose = (event) => {
      this.trigger("close");
      if (this.shouldReconnect && event.code !== 1000) {
        setTimeout(() => {
          if (this.token && this.currentRoom) {
            this.connect(this.token, this.currentRoom);
          }
        }, this.reconnectInterval);
      }
    };

    this.socket.onerror = (error) => this.trigger("error", error);
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  sendMessage(data) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
    }
  }

  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter((cb) => cb !== callback);
  }

  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((cb) => cb(data));
    }
  }
}

export default new WebSocketService();
