import { create } from "zustand";
import type { Message, Contact } from "../../domain";
import { connectWebSocket, disconnectWebSocket } from "../../infrastructure";

interface MessagerieState {
  messages: Message[];
  contacts: Contact[];
  contactActif: Contact | null;
  setContacts: (c: Contact[]) => void;
  setContactActif: (c: Contact | null) => void;
  setMessages: (m: Message[]) => void;
  addMessage: (m: Message) => void;
  nonLus: Record<number, number>;
  setNonLus: (n: Record<number, number>) => void;
  incrementNonLus: (id: number) => void;
  resetNonLus: (id: number) => void;
  totalNonLus: () => number;
  connect: (token: string) => void;
  disconnect: () => void;
}

export const useMessagerieStore = create<MessagerieState>((set, get) => ({
  messages: [],
  contacts: [],
  contactActif: null,
  nonLus: {},

  setContacts: (c) => set({ contacts: c }),
  setContactActif: (c) => set({ contactActif: c }),
  setMessages: (m) => set({ messages: m }),

  addMessage: (m) => {
    const contactActif = get().contactActif;
    const estConversationOuverte =
      contactActif && m.expediteurId === contactActif.id;

    if (estConversationOuverte) {
      set((s) => ({ messages: [...s.messages, m] }));
    } else {
      get().incrementNonLus(m.expediteurId);
    }
  },

  setNonLus: (n) => set({ nonLus: n }),

  incrementNonLus: (id) =>
    set((s) => ({
      nonLus: { ...s.nonLus, [id]: (s.nonLus[id] ?? 0) + 1 },
    })),

  resetNonLus: (id) =>
    set((s) => ({
      nonLus: { ...s.nonLus, [id]: 0 },
    })),

  totalNonLus: () => Object.values(get().nonLus).reduce((a, b) => a + b, 0),

  connect: (token) => {
    connectWebSocket(token, (msg) => {
      get().addMessage(msg as Message);
    });
  },

  disconnect: () => disconnectWebSocket(),
}));
