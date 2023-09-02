import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ToolbarMode } from '../app.component';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnInit {

  @Output() modeChange = new EventEmitter<ToolbarMode>();

  @Output() onTagClick = new EventEmitter();

  @Output() onSearchClick = new EventEmitter();

  @Output() onSettingsClick = new EventEmitter();

  @Output() onSidebarClick = new EventEmitter();

  @Input()
  currentMode: ToolbarMode = "Searching";

  @Input()
  sidebarButtonVisible: boolean = false;

  constructor() { }

  ngOnInit(): void {
  }

  setMode(newMode: ToolbarMode) {
    if (this.currentMode != newMode) {
      this.modeChange.emit(newMode);
      if (newMode === 'Tagging') {
        this.onTagClick.emit();
      }
      if (newMode === 'Searching') {
        this.onSearchClick.emit();
      }
      if (newMode === 'Settings') {
        this.onSettingsClick.emit();
      }
    }
    this.currentMode = newMode;
  }

}
