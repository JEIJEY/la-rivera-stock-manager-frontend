// EventBus.js
export default class EventBus {
  constructor() {
    this.events = {};
    console.log("✅ EventBus cargado correctamente");
  }

  on(eventName, callback) {
    if (!this.events[eventName]) this.events[eventName] = [];
    this.events[eventName].push(callback);
    console.log(`👂 Escuchando evento: ${eventName}`);
    return () => this.off(eventName, callback);
  }

  emit(eventName, data) {
    if (!this.events[eventName]) return;
    console.log(`📢 Emitiendo evento: ${eventName}`, data);
    this.events[eventName].forEach(cb => cb(data));
  }
}

// Instancia global
export const appEvents = new EventBus();
