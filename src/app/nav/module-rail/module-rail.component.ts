import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavModule } from '../nav.types';

@Component({
  selector: 'app-module-rail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './module-rail.component.html',
  styleUrls: ['./module-rail.component.scss'],
})
export class ModuleRailComponent {
  @Input() modules: NavModule[] = [];
  @Input() activeModuleId: string | null = null;
  @Output() moduleSelected = new EventEmitter<string>();

  select(moduleId: string): void {
    this.moduleSelected.emit(moduleId);
  }
}
