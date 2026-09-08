// Polyfill nécessaire pour sockjs-client, qui référence l'objet Node "global"
(window as any).global = window;
