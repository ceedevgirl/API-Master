import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, BehaviorSubject, tap, of } from 'rxjs';
import { Post, Comment } from '../../models/interface';
import { HttpParams, HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  // Local state management
  private postsSubject = new BehaviorSubject<Post[]>([]);
  private totalPostsSubject = new BehaviorSubject<number>(0);
  private currentPageSubject = new BehaviorSubject<number>(1);
  private isLoadedSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  public posts$ = this.postsSubject.asObservable();
  public totalPosts$ = this.totalPostsSubject.asObservable();
  public currentPage$ = this.currentPageSubject.asObservable();
  public isLoaded$ = this.isLoadedSubject.asObservable();

  constructor(private apiService: ApiService) {}

  getPosts(params: HttpParams, forceRefresh: boolean = false): Observable<HttpResponse<Post[]>> {
    // If we have cached data and not forcing refresh, return cached data
    if (!forceRefresh && this.isLoadedSubject.value && this.postsSubject.value.length > 0) {
      // Create a mock HttpResponse for cached data
      const cachedResponse = new HttpResponse({
        body: this.postsSubject.value,
        headers: {
          'x-total-count': this.totalPostsSubject.value.toString()
        } as any,
        status: 200,
        statusText: 'OK'
      });
      return of(cachedResponse);
    }

    return this.apiService.getWithResponse<Post[]>('posts', params).pipe(
      tap(response => {
        if (response.body) {
          this.postsSubject.next(response.body);
          // Extract total count from headers if available
          const totalCount = response.headers.get('x-total-count');
          if (totalCount) {
            this.totalPostsSubject.next(parseInt(totalCount, 10));
          }
          this.isLoadedSubject.next(true);
        }
      })
    );
  }

  getPostById(id: number): Observable<Post> {
    // First check if post exists in local cache
    const cachedPost = this.postsSubject.value.find(post => post.id === id);
    if (cachedPost) {
      return of(cachedPost);
    }
    
    // If not in cache, fetch from API
    return this.apiService.get<Post>(`posts/${id}`).pipe(
      tap(post => {
        // Add to cache if not already there
        const currentPosts = this.postsSubject.value;
        if (!currentPosts.find(p => p.id === post.id)) {
          this.postsSubject.next([post, ...currentPosts]);
        }
      })
    );
  }

  getCommentsByPostId(postId: number): Observable<Comment[]> {
    return this.apiService.get<Comment[]>(`posts/${postId}/comments`);
  }

  createPost(post: Omit<Post, 'id'>): Observable<Post> {
    return this.apiService.post<Post>('posts', post).pipe(
      tap(newPost => {
        // Add the new post to the beginning of the local array
        const currentPosts = this.postsSubject.value;
        this.postsSubject.next([newPost, ...currentPosts]);
        
        // Update total count
        const currentTotal = this.totalPostsSubject.value;
        this.totalPostsSubject.next(currentTotal + 1);
      })
    );
  }

  updatePost(id: number, post: Partial<Post>): Observable<Post> {
    return this.apiService.put<Post>(`posts/${id}`, post).pipe(
      tap(updatedPost => {
        // Update the post in local array
        const currentPosts = this.postsSubject.value;
        const index = currentPosts.findIndex(p => p.id === id);
        if (index !== -1) {
          const updatedPosts = [...currentPosts];
          updatedPosts[index] = updatedPost;
          this.postsSubject.next(updatedPosts);
        }
      })
    );
  }

  deletePost(id: number): Observable<any> {
    return this.apiService.delete<any>(`posts/${id}`).pipe(
      tap(() => {
        // Remove the post from local array
        const currentPosts = this.postsSubject.value;
        const filteredPosts = currentPosts.filter(post => post.id !== id);
        this.postsSubject.next(filteredPosts);
        
        // Update total count
        const currentTotal = this.totalPostsSubject.value;
        this.totalPostsSubject.next(Math.max(0, currentTotal - 1));
      })
    );
  }

  // Additional helper methods
  addPostToList(post: Post): void {
    const currentPosts = this.postsSubject.value;
    this.postsSubject.next([post, ...currentPosts]);
    
    const currentTotal = this.totalPostsSubject.value;
    this.totalPostsSubject.next(currentTotal + 1);
  }

  removePostFromList(id: number): void {
    const currentPosts = this.postsSubject.value;
    const filteredPosts = currentPosts.filter(post => post.id !== id);
    this.postsSubject.next(filteredPosts);
    
    const currentTotal = this.totalPostsSubject.value;
    this.totalPostsSubject.next(Math.max(0, currentTotal - 1));
  }

  updatePostInList(oldId: number, newPost: Post): void {
    const currentPosts = this.postsSubject.value;
    const index = currentPosts.findIndex(p => p.id === oldId);
    if (index !== -1) {
      const updatedPosts = [...currentPosts];
      updatedPosts[index] = newPost;
      this.postsSubject.next(updatedPosts);
    }
  }

  refreshPosts(params: HttpParams): Observable<HttpResponse<Post[]>> {
    return this.getPosts(params, true);
  }

  clearCache(): void {
    this.postsSubject.next([]);
    this.totalPostsSubject.next(0);
    this.currentPageSubject.next(1);
    this.isLoadedSubject.next(false);
  }

  // Get current cached posts without making API call
  getCurrentPosts(): Post[] {
    return this.postsSubject.value;
  }

  // Get current total count
  getCurrentTotal(): number {
    return this.totalPostsSubject.value;
  }
}