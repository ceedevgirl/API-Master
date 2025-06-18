import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Post } from '../../models/interface';

@Component({
  selector: 'app-posts-list',
  imports: [CommonModule, RouterModule, FormsModule],
  animations: [
    {
      name: 'crazyListIn',
      source: `
        @keyframes enter {
          0% {
            opacity: 0;
            transform: scale(0.8) rotate(-5deg);
          }
          40% {
            opacity: 0.6;
            transform: scale(1.1) rotate(5deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
        }

        :enter {
          animation: enter 600ms ease-out;
        }
      `
    }
  ],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss']
})
export class PostListComponent implements OnInit {
  posts: Post[] = [];
  filteredPosts: Post[] = []; 
  paginatedPosts: Post[] = [];
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  searchTerm = '';
  
  // Mobile menu state 
  isMobileMenuOpen = true;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

  navigateToPost(id: number): void {
  this.router.navigate(['/post', id]);
  }

  readonly tags = ['health', 'technology', 'photography', 'travel', 'design', 'education', 'lifestyle', 'food', 'development', 'ai'];

  ngOnInit(): void {
    this.apiService.getPosts().subscribe((data) => {
      this.posts = data.map((post) => {
        const tag = this.tags[Math.floor(Math.random() * this.tags.length)];
        const imageUrl = `https://picsum.photos/seed/post-${post.id}/600/400`;
        return { ...post, tag, imageUrl };
      });

      this.filteredPosts = [...this.posts];
      this.updatePagination();
    });
  }

  // Mobile menu toggle method
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onSearch(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredPosts = this.posts.filter(post =>
      post.title.toLowerCase().includes(term) || 
      post.body.toLowerCase().includes(term) ||
      post.tag.toLowerCase().includes(term)
    );

    this.currentPage = 1;
    this.updatePagination();
   
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPosts = this.filteredPosts.slice(start, end);
  }

  // Optional: Close mobile menu when clicking outside
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const mobileMenuToggle = target.closest('.mobile-menu-toggle');
    const mobileMenuContent = target.closest('.mobile-menu-content');
   const searchBar = target.closest('.search-bar');

    // Close menu if clicking outside of menu toggle or content
    if (!mobileMenuToggle && !mobileMenuContent && !searchBar && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  goToPage(page: string | number): void {
    this.currentPage = +page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.pageSize); // Fixed: use filteredPosts instead of posts
  }

  get totalPagesArray(): (string | number)[] {
    const totalPages = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 2;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (string | number)[] = [];

    if (current > 2) pages.push('...');

    const start = Math.max(1, current - 1);
    const end = Math.min(totalPages, start + maxVisible - 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages) pages.push('...');

    return pages;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }
}