import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';
import { PUSH_API_URL, VAPID_PUBLIC_KEY } from './push.config';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly swPush = inject(SwPush);
  private readonly http = inject(HttpClient);

  readonly isSupported = this.swPush.isEnabled;
  readonly enabled = signal(false);
  readonly lastResult = signal<string | null>(null);

  constructor() {
    this.checkSubscription();
  }

  async subscribe(): Promise<void> {
    const subscription = await this.swPush.requestSubscription({
      serverPublicKey: VAPID_PUBLIC_KEY,
    });
    await firstValueFrom(
      this.http.post(`${PUSH_API_URL}/subscribe`, subscription),
    );
    this.enabled.set(true);
  }

  async unsubscribe(): Promise<void> {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    await subscription?.unsubscribe();
    this.enabled.set(false);
  }

  async notify(title: string, body: string): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ enviadas: number }>(`${PUSH_API_URL}/push`, {
          title,
          body,
        }),
      );
      this.lastResult.set(
        `Notificación enviada a ${response.enviadas} suscripción(es).`,
      );
    } catch {
      this.lastResult.set(
        'No se pudo enviar la notificación. Revisa que la API esté activa.',
      );
    }
  }

  private async checkSubscription(): Promise<void> {
    if (!this.isSupported) {
      return;
    }
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    this.enabled.set(!!subscription);
  }
}
