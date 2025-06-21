import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './core/auth/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'My Blog';
  searchTerm: string = '';
  isMenuOpen: boolean = false;

  constructor(public authService: AuthService, private router: Router) {}

  logout(): void {
    this.authService.logout();
  }

  performSearch(): void {
    if (this.searchTerm.trim()) {
      this.router.navigate(['/posts'], {
        queryParams: { search: this.searchTerm.trim() },
      });
    } else {
      this.router.navigate(['/posts']);
    }
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.router.navigate(['/posts'], {
      queryParams: { search: null },
      queryParamsHandling: 'merge',
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }
}