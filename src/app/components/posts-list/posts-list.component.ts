import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Post } from '../../models/interface';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';


@Component({
  selector: 'app-posts-list',
  imports: [CommonModule, RouterModule, FormsModule, PaginationComponent],
  templateUrl: './posts-list.component.html',
  styleUrls: ['./posts-list.component.scss']
})
export class PostListComponent implements OnInit {
previousPage() {
throw new Error('Method not implemented.');
}
nextPage() {
throw new Error('Method not implemented.');
}
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  paginatedPosts: Post[] = [];
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  searchTerm = '';
  isMobileMenuOpen = true;

  constructor(
    private router: Router,
    private apiService: ApiService
  ) {}

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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const mobileMenuToggle = target.closest('.mobile-menu-toggle');
    const mobileMenuContent = target.closest('.mobile-menu-content');
    const searchBar = target.closest('.search-bar');

    if (!mobileMenuToggle && !mobileMenuContent && !searchBar && this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  goToPage(page: string | number): void {
    this.currentPage = +page;
    this.updatePagination();
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

  navigateToPost(id: number): void {
    this.router.navigate(['/post', id]);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredPosts.length / this.pageSize);
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
}
