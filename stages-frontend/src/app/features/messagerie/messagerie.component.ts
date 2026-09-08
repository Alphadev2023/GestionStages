import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  AfterViewChecked,
  ElementRef,
  ViewChild,
  ChangeDetectorRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { NavbarComponent } from '../../shared/components/navbar/navbar.component';
import { MessagerieService } from '../../core/services/messagerie.service';
import { AuthService } from '../../core/services/auth.service';
import { MessageResponse } from '../../core/models/message.model';

interface Contact {
  id: number;
  nomComplet: string;
  email: string;
  role: string;
  nomEntreprise?: string;
}

@Component({
  selector: 'app-messagerie',
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  templateUrl: './messagerie.component.html',
})
export class MessagerieComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer?: ElementRef;

  auth = inject(AuthService);
  svc = inject(MessagerieService);
  http = inject(HttpClient);
  cdr = inject(ChangeDetectorRef);

  contacts = signal<Contact[]>([]);
  contactSelectionne = signal<Contact | null>(null);
  chargementMessages = signal(false);
  contenu = '';
  envoi = signal(false);

  messagesAffiches: MessageResponse[] = [];

  private shouldScroll = false;
  private sub?: Subscription;

  readonly contactActifClass =
    'w-full px-4 py-3 bg-primary-50 border-l-4 border-primary-600 transition-colors';
  readonly contactInactifClass =
    'w-full px-4 py-3 hover:bg-gray-50 border-l-4 border-transparent transition-colors';

  ngOnInit() {
    this.chargerContacts();

    this.sub = this.svc.messageRecu$.subscribe((msg) => {
      const contact = this.contactSelectionne();
      if (contact && msg.expediteurId === contact.id) {
        this.messagesAffiches = [...this.messagesAffiches, msg];
        this.shouldScroll = true;
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.svc.conversationActiveId.set(null);
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollBas();
      this.shouldScroll = false;
    }
  }

  chargerContacts() {
    this.http.get<any>('/api/users/contacts').subscribe({
      next: (res) => this.contacts.set(res.data || []),
    });
  }

  selectionnerContact(contact: Contact) {
    this.contactSelectionne.set(contact);
    this.messagesAffiches = [];
    this.chargementMessages.set(true);

    this.svc.conversationActiveId.set(contact.id);
    this.svc.marquerCommeLu(contact.id);

    this.svc.getConversation(contact.id).subscribe({
      next: (res) => {
        this.messagesAffiches = res.data.content;
        this.chargementMessages.set(false);
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: () => this.chargementMessages.set(false),
    });
  }

  envoyer() {
    const dest = this.contactSelectionne();
    if (!this.contenu.trim() || !dest || this.envoi()) return;
    this.envoi.set(true);
    const texte = this.contenu;
    this.contenu = '';

    this.svc.envoyer({ destinataireId: dest.id, contenu: texte }).subscribe({
      next: (res) => {
        this.messagesAffiches = [...this.messagesAffiches, res.data];
        this.shouldScroll = true;
        this.envoi.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.contenu = texte;
        this.envoi.set(false);
      },
    });
  }

  getMsgRowClass(msg: MessageResponse): string {
    return msg.expediteurId === this.auth.user()?.userId
      ? 'flex justify-end gap-2 items-end'
      : 'flex justify-start gap-2 items-end';
  }

  getMsgBubbleClass(msg: MessageResponse): string {
    return msg.expediteurId === this.auth.user()?.userId
      ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-sm shadow-sm'
      : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-2 max-w-sm shadow-sm border border-gray-100';
  }

  getRoleColor(role: string): string {
    const map: Record<string, string> = {
      ETUDIANT: 'bg-blue-500',
      ENTREPRISE: 'bg-green-600',
      ENSEIGNANT: 'bg-purple-600',
      ADMIN: 'bg-red-600',
    };
    return map[role] ?? 'bg-gray-500';
  }

  private scrollBas() {
    setTimeout(() => {
      if (this.messagesContainer) {
        const el = this.messagesContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    }, 30);
  }
}
