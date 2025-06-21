import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../../../core/services/api.service';
import { Post, Comment } from '../../../../../models/interface';
import { finalize } from 'rxjs/operators';
import { AuthService } from '../../../../../core/auth/auth.service';

@Component({
  selector: 'app-post-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-details.component.html',
  styleUrl: './post-details.component.scss'
})
export class PostDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  private authService = inject(AuthService); 

  post = signal<Post | null>(null);
  comments = signal<Comment[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const postId = params.get('id');
      if (postId) {
        this.fetchPostDetails(Number(postId));
      } else {
        this.error.set('Post ID not found in route.');
        this.isLoading.set(false);
      }
    });
  }

  fetchPostDetails(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    
    this.apiService.get<Post>(`posts/${id}`).pipe(
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (postData) => {
        this.post.set(postData);
        
        this.fetchComments(id);
      },
      error: (err) => {
        this.error.set('Failed to load post: ' + err.message);
      }
    });
  }

  fetchComments(postId: number): void {
    this.apiService.get<Comment[]>(`posts/${postId}/comments`).subscribe({
      next: (commentsData) => {
        this.comments.set(commentsData);
      },
      error: (err) => {
        
        console.error('Failed to load comments:', err);
      }
    });
  }

  // Method to check authentication status
  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }

    deletePost(): void {
    const postId = this.post()?.id;
    if (postId && confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      this.isLoading.set(true);
      this.error.set(null);
      this.apiService.delete<any>(`posts/${postId}`).pipe(
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        next: () => {
          alert('Post deleted successfully!');
          this.router.navigate(['/posts']); 
        },
        error: (err) => {
          this.error.set('Failed to delete post: ' + err.message);
        }
      });
    }
  }
}