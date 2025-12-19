import config from "../config/config";

class WebSocketService {
  constructor() {
    this.heartbeatTimer = null; // for online status
    this.socket = null;
    this.callbacks = {};
    this.reconnectInterval = 3000;
    this.shouldReconnect = true;
    this.reconnectTimer = null;

    this.token = null;
    this.currentRoom = null;
  }

  connect(token, conversationId) {
    if (!token || !conversationId) return;
    this.shouldReconnect = true;

    // ✅ GUARD: already connected to same room
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.currentRoom === conversationId
    ) {
      return;
    }

    this.token = token;
    this.currentRoom = conversationId;

    if (this.socket) {
      this.disconnect();
    }



    let wsUrl = `${config.wsUrl}/ws/chat/${conversationId}/?token=${token}`;

    // Auto-upgrade to WSS if on HTTPS
    if (window.location.protocol === 'https:' && wsUrl.startsWith('ws://')) {
      wsUrl = wsUrl.replace('ws://', 'wss://');
    }

    this.socket = new WebSocket(wsUrl);

    this.socket.onopen = () => {
      this.trigger("open")
      // Start heartbeat
      this.startHeartBeat();
    };
    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.trigger("message", data);
      } catch (e) { }
    };

    this.socket.onclose = (event) => {
      this.trigger("close");
      if (this.shouldReconnect && event.code !== 1000) {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
          this.reconnectTimer = null;
          if (this.token && this.currentRoom) {
            this.connect(this.token, this.currentRoom);
          }
        }, this.reconnectInterval);
      }
    };

    this.socket.onerror = (error) => {
      this.trigger("error", error);
      // force close so onclose + reconnect can run
      if (this.socket) {
        this.socket.close();
      }
    };
  }

// Heartbeat to keep connection alive
  startHeartBeat() {
    // saftey never create multiple intervals
    this.stopHeartBeat();
    this.heartbeatTimer = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) { 
this.socket.send(JSON.stringify({ type: "ping" }));   }
    }, 30000); // every 30 seconds
  }
 
  // Stop heartbeat
  stopHeartBeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  // ==========================

  disconnect({ permanent = false } = {}) {
    if (permanent) {
      this.shouldReconnect = false;
    }
    this.stopHeartBeat(); // stop heartbeat
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
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
    this.callbacks[event] = this.callbacks[event].filter(
      (cb) => cb !== callback
    );
  }

  trigger(event, data) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((cb) => cb(data));
    }
  }
}

export default new WebSocketService();
