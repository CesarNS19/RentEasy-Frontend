import { Injectable } from '@angular/core';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';

@Injectable({ providedIn: 'root' })
export class PushService {

  constructor(private messaging: Messaging) {}

  requestPermission() {
    return Notification.requestPermission().then(() => {
      return getToken(this.messaging, {
        vapidKey: "TU_VAPID_KEY_WEB"
      }).then(token => {
        console.log("TOKEN PUSH:", token);
        return token;
      });
    });
  }

  listenMessages() {
    onMessage(this.messaging, (payload) => {
      new Notification(payload.notification?.title || "Nuevo mensaje", {
        body: payload.notification?.body
      });
    });
  }
}
