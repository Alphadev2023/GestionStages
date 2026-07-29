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
    set((s) => ({ messages: [...s.messages, m] }));
    const contactActif = get().contactActif;
    if (!contactActif || m.expediteurId !== contactActif.id) {
      get().incrementNonLus(m.expediteurId);
    }
  },

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
