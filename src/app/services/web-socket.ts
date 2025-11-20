import { Injectable } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private stompClient: Client | null = null;

  connect(callback: () => void) {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8081/ws'),
      reconnectDelay: 5000 
    });

    this.stompClient.onConnect = () => {
      console.log('🟢 Conectado al WebSocket');
      callback();
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ Error STOMP: ', frame);
    };

    this.stompClient.activate();
  }

  subscribe(topic: string, handler: (msg: IMessage) => void) {
    this.stompClient?.subscribe(topic, handler);
  }

  publish(destination: string, body: any) {
    this.stompClient?.publish({
      destination,
      body: JSON.stringify(body)
    });
  }

  disconnect() {
    this.stompClient?.deactivate();
  }
}
