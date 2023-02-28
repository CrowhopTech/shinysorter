import { Component } from '@angular/core';

export type ToolbarMode = "Tagging" | "Searching" | "Settings";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'Shiny Sorter';

  currentMode: ToolbarMode = "Searching";

  constructor() { }
}
