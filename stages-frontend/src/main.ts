import { bootstrapApplication } from "@angular/platform-browser";
import { App } from "./app/app";
import { appConfig } from "./app/app.config";

(window as any).global = window;

bootstrapApplication(App, appConfig).catch(console.error);
