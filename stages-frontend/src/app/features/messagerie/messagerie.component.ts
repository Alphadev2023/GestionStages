import { Component, OnInit, OnDestroy, signal, inject,
         AfterViewChecked, ElementRef, ViewChild, ChangeDetectorRef } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { Subscription } from "rxjs";
import { SidebarComponent } from "../../shared/components/sidebar/sidebar.component";
import { NavbarComponent } from "../../shared/components/navbar/navbar.component";
import { MessagerieService } from "../../core/services/messagerie.service";
import { AuthService } from "../../core/services/auth.service";
import { MessageResponse } from "../../core/models/message.model";

interface Contact {
  id: number;
  nomComplet: string;
  email: string;
  role: string;
  nomEntreprise?: string;
  nonLus: number;
}

@Component({
  selector: "app-messagerie",
  standalone: true,
  imports: [FormsModule, SidebarComponent, NavbarComponent],
  template: `
    <app-sidebar />
    <div class="ml-64 min-h-screen bg-gray-50">
      <app-navbar title="Messagerie" />

      <div class="flex" style="height: calc(100vh - 4rem)">

        <!-- Sidebar contacts -->
        <div class="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
          <div class="px-4 py-3 border-b border-gray-100">
            <h3 class="font-semibold text-gray-800 text-sm">Contacts</h3>
          </div>
          <div class="flex-1 overflow-y-auto">
            @if (contacts().length === 0) {
              <p class="text-xs text-gray-400 text-center mt-8 px-4">Chargement...</p>
            }
            @for (c of contacts(); track c.id) {
              <button (click)="selectionnerContact(c)"
                [class]="contactSelectionne()?.id === c.id ? contactActifClass : contactInactifClass">
                <div class="flex items-center gap-3 w-full">
                  <div class="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
                    [class]="getRoleColor(c.role)">
                    {{ c.nomComplet.charAt(0).toUpperCase() }}
                  </div>
                  <div class="flex-1 min-w-0 text-left">
                    <p class="text-sm font-medium text-gray-900 truncate">{{ c.nomComplet }}</p>
                    <p class="text-xs text-gray-500 truncate">{{ c.nomEntreprise ?? c.role }}</p>
                  </div>
                  @if (c.nonLus > 0) {
                    <span class="shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {{ c.nonLus }}
                    </span>
                  }
                </div>
              </button>
            }
          </div>
        </div>

        <!-- Zone conversation -->
        <div class="flex-1 flex flex-col min-w-0">
          @if (!contactSelectionne()) {
            <div class="flex-1 flex items-center justify-center bg-gray-50">
              <div class="text-center text-gray-400">
                <p class="text-lg font-medium">Selectionnez un contact</p>
                <p class="text-sm mt-1">pour demarrer une conversation</p>
              </div>
            </div>
          } @else {
            <!-- En-tete -->
            <div class="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
              <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                [class]="getRoleColor(contactSelectionne()!.role)">
                {{ contactSelectionne()!.nomComplet.charAt(0).toUpperCase() }}
              </div>
              <div>
                <p class="font-semibold text-gray-900 text-sm">{{ contactSelectionne()!.nomComplet }}</p>
                <p class="text-xs text-gray-500">{{ contactSelectionne()!.nomEntreprise ?? contactSelectionne()!.role }}</p>
              </div>
            </div>

            <!-- Messages -->
            <div #messagesContainer class="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
              @if (chargementMessages()) {
                <div class="text-center text-gray-400 text-sm py-4">Chargement...</div>
              }
              @for (msg of messagesAffiches; track msg.id) {
                <div [class]="getMsgRowClass(msg)">
                  @if (msg.expediteurId !== auth.user()?.userId) {
                    <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 self-end"
                      [class]="getRoleColor(contactSelectionne()!.role)">
                      {{ msg.nomExpediteur.charAt(0).toUpperCase() }}
                    </div>
                  }
                  <div [class]="getMsgBubbleClass(msg)">
                    <p class="text-sm whitespace-pre-wrap">{{ msg.contenu }}</p>
                    <p class="text-xs opacity-50 mt-1 text-right">{{ msg.createdAt.slice(11, 16) }}</p>
                  </div>
                </div>
              }
              @empty {
                @if (!chargementMessages()) {
                  <div class="text-center text-gray-400 text-sm py-8">
                    Aucun message — commencez la conversation
                  </div>
                }
              }
            </div>

            <!-- Saisie -->
            <div class="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0">
              <input [(ngModel)]="contenu"
                (keyup.enter)="envoyer()"
                placeholder="Ecrire un message... (Entree pour envoyer)"
                class="input-field flex-1" />
              <button (click)="envoyer()"
                [disabled]="!contenu.trim() || envoi()"
                class="btn-primary px-5 shrink-0">
                {{ envoi() ? "..." : "Envoyer" }}
              </button>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MessagerieComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild("messagesContainer") messagesContainer?: ElementRef;

  auth              = inject(AuthService);
  svc               = inject(MessagerieService);
  http              = inject(HttpClient);
  cdr               = inject(ChangeDetectorRef);

  contacts           = signal<Contact[]>([]);
  contactSelectionne = signal<Contact | null>(null);
  chargementMessages = signal(false);
  contenu            = "";
  envoi              = signal(false);

  // Tableau local des messages affiches — mis a jour manuellement
  messagesAffiches: MessageResponse[] = [];

  private shouldScroll = false;
  private sub?: Subscription;

  readonly contactActifClass   = "w-full px-4 py-3 bg-primary-50 border-l-4 border-primary-600 transition-colors";
  readonly contactInactifClass = "w-full px-4 py-3 hover:bg-gray-50 border-l-4 border-transparent transition-colors";

  ngOnInit() {
    this.svc.connect();
    this.chargerContacts();

    // Ecouter les nouveaux messages via RxJS Subject
    this.sub = this.svc.messageRecu$.subscribe(msg => {
      const contact = this.contactSelectionne();

      if (contact && msg.expediteurId === contact.id) {
        // Message du contact actif : afficher directement
        this.messagesAffiches = [...this.messagesAffiches, msg];
        this.shouldScroll = true;
        this.cdr.detectChanges();
      } else if (msg.expediteurId !== this.auth.user()?.userId) {
        // Autre contact : incrementer badge
        this.contacts.update(list =>
          list.map(c => c.id === msg.expediteurId
            ? { ...c, nonLus: c.nonLus + 1 }
            : c
          )
        );
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
    this.svc.disconnect();
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.scrollBas();
      this.shouldScroll = false;
    }
  }

  chargerContacts() {
    this.http.get<any>("http://localhost:8082/api/users/contacts").subscribe({
      next: res => {
        this.contacts.set((res.data || []).map((c: any) => ({ ...c, nonLus: 0 })));
      }
    });
  }

  selectionnerContact(contact: Contact) {
    this.contactSelectionne.set({ ...contact, nonLus: 0 });
    this.messagesAffiches = [];
    this.chargementMessages.set(true);

    // Remettre a zero le badge
    this.contacts.update(list =>
      list.map(c => c.id === contact.id ? { ...c, nonLus: 0 } : c)
    );

    this.svc.getConversation(contact.id).subscribe({
      next: res => {
        this.messagesAffiches = res.data.content;
        this.chargementMessages.set(false);
        this.shouldScroll = true;
        this.cdr.detectChanges();
      },
      error: () => this.chargementMessages.set(false)
    });
  }

  envoyer() {
    const dest = this.contactSelectionne();
    if (!this.contenu.trim() || !dest || this.envoi()) return;
    this.envoi.set(true);
    const texte = this.contenu;
    this.contenu = "";

    this.svc.envoyer({ destinataireId: dest.id, contenu: texte }).subscribe({
      next: res => {
        this.messagesAffiches = [...this.messagesAffiches, res.data];
        this.shouldScroll = true;
        this.envoi.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.contenu = texte;
        this.envoi.set(false);
      }
    });
  }

  getMsgRowClass(msg: MessageResponse): string {
    return msg.expediteurId === this.auth.user()?.userId
      ? "flex justify-end gap-2 items-end"
      : "flex justify-start gap-2 items-end";
  }

  getMsgBubbleClass(msg: MessageResponse): string {
    return msg.expediteurId === this.auth.user()?.userId
      ? "bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-sm shadow-sm"
      : "bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-2 max-w-sm shadow-sm border border-gray-100";
  }

  getRoleColor(role: string): string {
    const map: Record<string, string> = {
      ETUDIANT:   "bg-blue-500",
      ENTREPRISE: "bg-green-600",
      ENSEIGNANT: "bg-purple-600",
      ADMIN:      "bg-red-600",
    };
    return map[role] ?? "bg-gray-500";
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
