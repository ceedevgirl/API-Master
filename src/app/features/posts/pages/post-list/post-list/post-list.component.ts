import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostService } from '../../../../../core/services/post.service';
import { Post } from '../../../../../models/interface';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination/pagination.component';
import { HttpParams } from '@angular/common/http';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, RouterLink, PaginationComponent],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  posts = signal<Post[]>([]);
  totalPosts = signal<number>(0);
  currentPage = signal<number>(1);
  itemsPerPage = signal<number>(10);
  searchTerm = signal<string>(''); 
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);

  private postService = inject(PostService);
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  constructor() {
    effect(() => {
      
      this.loadPosts();
    }, { allowSignalWrites: true });
  }

  ngOnInit(): void {
    // Read query params on init
    this.activatedRoute.queryParams.subscribe(params => {
      const page = +params['page'] || 1;
      const limit = +params['limit'] || 10;
      const search = params['search']?.trim() || '';

      // Update signals if changed
      if (
        page !== this.currentPage() ||
        limit !== this.itemsPerPage() ||
        search !== this.searchTerm()
      ) {
        this.currentPage.set(page);
        this.itemsPerPage.set(limit);
        this.searchTerm.set(search);
        // loadPosts will be triggered by the effect
      } else if (this.posts().length === 0 && !this.isLoading()) {
        // Ensure posts are loaded on first init
        this.loadPosts();
      }
    });
  }

  loadPosts(): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Build query params
    let params = new HttpParams()
      .set('_page', this.currentPage().toString())
      .set('_limit', this.itemsPerPage().toString());

    if (this.searchTerm()) {
      params = params.set('q', this.searchTerm()); // JSONPlaceholder uses 'q' for search
    }

    this.postService.getPosts(params).subscribe({
      next: (response) => {
        this.posts.set(response.body || []);
        // JSONPlaceholder returns total count in X-Total-Count header
        const totalCount = response.headers.get('X-Total-Count');
        this.totalPosts.set(totalCount ? +totalCount : response.body?.length || 0);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load posts.');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    // Update URL query params
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { page: page, limit: this.itemsPerPage(), search: this.searchTerm() || null },
      queryParamsHandling: 'merge'
    });
    // loadPosts will be triggered by the effect
  }

  
  clearCache(): void {
    // Conceptual cache clearing
    console.log("Cache clear method triggered (conceptual)");
  }
}