import { Component, Input } from "@angular/core";

@Component({
  selector: "app-navbar",
  standalone: true,
  template: `
    <header class="h-16 bg-white border-b border-gray-200 flex items-center px-6 ml-64">
      <h2 class="text-lg font-semibold text-gray-800">{{ title }}</h2>
    </header>
  `
})
export class NavbarComponent {
  @Input() title = "";
}
