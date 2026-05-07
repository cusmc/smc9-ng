import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NavModule, NavItem } from '../nav.types';
import { NavService } from '../nav.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() module: NavModule | null = null;
  @Input() open = false;
  @Output() closeMobile = new EventEmitter<void>();

  constructor(private nav: NavService) {}

  handleItemClick(item: NavItem): void {
    if (item.externalUrl) {
      window.open(item.externalUrl, '_blank');
    }
    this.closeMobile.emit();
  }
}
