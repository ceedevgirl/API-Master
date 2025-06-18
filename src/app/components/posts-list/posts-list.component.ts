import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { RouterModule } from '@angular/router';

import { Post } from '../../models/interface';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
  paginatedPosts: Post[] = [];
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  

  constructor(private apiService: ApiService) {}

 readonly tags = ['health', 'technology', 'photography', 'travel', 'design', 'education', 'lifestyle', 'food', 'development', 'ai'];

ngOnInit(): void {
  this.apiService.getPosts().subscribe((data) => {
    this.posts = data.map((post) => {
      const tag = this.tags[Math.floor(Math.random() * this.tags.length)];

      // Generate a consistent but random-looking image URL from Picsum
      const imageUrl = `https://picsum.photos/seed/post-${post.id}/600/400`;

      return { ...post, tag, imageUrl };
    });

    this.updatePagination();
  });
}


  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPosts = this.posts.slice(start, end);
  }

  goToPage(page: string | number): void {
    this.currentPage = +page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.posts.length / this.pageSize);
  }

  //  get totalPagesArray(): number[] {
  //   return Array(this.totalPages).fill(0).map((_, i) => i + 1);
  // }
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
