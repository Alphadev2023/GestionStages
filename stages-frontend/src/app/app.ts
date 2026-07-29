import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { MessagerieService } from './core/services/messagerie.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent],
  template: `<router-outlet /><app-toast />`,
})
export class App {
  private auth = inject(AuthService);
  private messagerie = inject(MessagerieService);

  constructor() {
    // Connecte/déconnecte le WebSocket messagerie automatiquement
    // dès que l'état d'authentification change (login, logout, ou déjà connecté au démarrage)
    effect(() => {
      if (this.auth.isAuth()) {
        this.messagerie.connect();
      } else {
        this.messagerie.disconnect();
      }
    });
  }
}
