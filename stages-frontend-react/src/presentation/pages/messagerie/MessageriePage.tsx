import { useEffect, useRef, useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Navbar } from '../../components/Navbar';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { useAuthStore } from '../../../application/auth/useAuthStore';
import { useMessagerieStore } from '../../../application/messagerie/useMessagerieStore';
import { useContacts } from '../../../application/users/useUsers';
import { messagerieService } from '../../../infrastructure';
import { useQueryClient } from '@tanstack/react-query';
import type { Contact } from '../../../domain';

const ROLE_COLORS: Record<string,string> = {
  ETUDIANT:'bg-blue-500', ENTREPRISE:'bg-green-600', ENSEIGNANT:'bg-purple-600', ADMIN:'bg-red-600'
};

export function MessageriePage() {
  const { user, token }   = useAuthStore();
  const { data: contacts } = useContacts();
  const store              = useMessagerieStore();
  const [contenu, setContenu] = useState('');
  const [envoi,   setEnvoi]   = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  // Connexion WebSocket
  useEffect(() => {
    if (token) store.connect(token);
    return () => store.disconnect();
  }, [token]);

  // Charger contacts
  useEffect(() => {
    if (contacts) store.setContacts(contacts);
  }, [contacts]);

  // Charger conversation quand contact change
  useEffect(() => {
    const c = store.contactActif;
    if (!c) return;
    store.resetNonLus(c.id);
    messagerieService.getConversation(c.id, { size:50 })
      .then(r => store.setMessages(r.data.data.content));
  }, [store.contactActif?.id]);

  // Scroll bas
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [store.messages]);

  function selectionnerContact(c: Contact) {
    store.setContactActif(c);
    store.resetNonLus(c.id);
  }

  async function envoyer() {
    const dest = store.contactActif;
    if (!contenu.trim() || !dest || envoi) return;
    setEnvoi(true);
    const texte = contenu;
    setContenu('');
    try {
      const res = await messagerieService.envoyer({ destinataireId: dest.id, contenu: texte });
      store.setMessages([...store.messages, res.data.data]);
    } catch {
      setContenu(texte);
    } finally {
      setEnvoi(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); envoyer(); }
  }

  return (
    <>
      <Sidebar />
      <div className="ml-64 min-h-screen bg-gray-50">
        <Navbar title="Messagerie" />

        <div className="flex" style={{ height:'calc(100vh - 4rem)' }}>

          {/* Sidebar contacts */}
          <div className="w-72 bg-white border-r border-gray-200 flex flex-col shrink-0">
            <div className="px-4 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800 text-sm">
                Contacts ({(contacts??[]).length})
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!contacts ? <Spinner text="Chargement..." /> :
                (contacts??[]).map(c => (
                  <button key={c.id} onClick={()=>selectionnerContact(c)}
                    className={'w-full px-4 py-3 border-l-4 transition-colors text-left hover:bg-gray-50 ' +
                      (store.contactActif?.id===c.id ? 'bg-primary-50 border-primary-600' : 'border-transparent')}>
                    <div className="flex items-center gap-3">
                      <div className={'w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 '+(ROLE_COLORS[c.role]??'bg-gray-500')}>
                        {c.nomComplet.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{c.nomComplet}</p>
                        <p className="text-xs text-gray-500 truncate">{c.nomEntreprise ?? c.role}</p>
                      </div>
                      {(store.nonLus[c.id]??0) > 0 && (
                        <span className="shrink-0 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                          {store.nonLus[c.id]}
                        </span>
                      )}
                    </div>
                  </button>
                ))
              }
            </div>
          </div>

          {/* Zone conversation */}
          <div className="flex-1 flex flex-col min-w-0">
            {!store.contactActif ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p className="text-lg font-medium">Selectionnez un contact</p>
                  <p className="text-sm mt-1">pour demarrer une conversation</p>
                </div>
              </div>
            ) : (
              <>
                {/* En-tete */}
                <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-3 shrink-0">
                  <div className={'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold '+(ROLE_COLORS[store.contactActif.role]??'bg-gray-500')}>
                    {store.contactActif.nomComplet.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{store.contactActif.nomComplet}</p>
                    <p className="text-xs text-gray-500">{store.contactActif.nomEntreprise ?? store.contactActif.role}</p>
                  </div>
                </div>

                {/* Messages */}
                <div ref={messagesRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
                  {store.messages.map(msg => {
                    const isMine = msg.expediteurId === user?.userId;
                    return (
                      <div key={msg.id} className={'flex items-end gap-2 '+(isMine?'justify-end':'justify-start')}>
                        {!isMine && (
                          <div className={'w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 '+(ROLE_COLORS[store.contactActif!.role]??'bg-gray-500')}>
                            {msg.nomExpediteur.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className={isMine
                          ? 'bg-primary-600 text-white rounded-2xl rounded-br-sm px-4 py-2 max-w-sm shadow-sm'
                          : 'bg-white text-gray-900 rounded-2xl rounded-bl-sm px-4 py-2 max-w-sm shadow-sm border border-gray-100'}>
                          <p className="text-sm whitespace-pre-wrap">{msg.contenu}</p>
                          <p className="text-xs opacity-50 mt-1 text-right">{msg.createdAt.slice(11,16)}</p>
                        </div>
                      </div>
                    );
                  })}
                  {store.messages.length===0 && (
                    <p className="text-center text-gray-400 text-sm py-8">
                      Aucun message — commencez la conversation
                    </p>
                  )}
                </div>

                {/* Saisie */}
                <div className="bg-white border-t border-gray-200 px-4 py-3 flex gap-3 shrink-0">
                  <input value={contenu} onChange={e=>setContenu(e.target.value)} onKeyDown={handleKey}
                    placeholder="Ecrire un message... (Entree pour envoyer)"
                    className="input-field flex-1" />
                  <Button onClick={envoyer} disabled={!contenu.trim()||envoi} className="shrink-0 px-5">
                    {envoi?'...':'Envoyer'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}