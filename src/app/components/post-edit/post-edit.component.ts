import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule} from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { DomSanitizer } from '@angular/platform-browser';
import { ApiService } from '../../core/services/api.service';
import { Post } from '../../models/interface';

@Component({
  selector: 'app-post-edit',
  imports: [CommonModule, ReactiveFormsModule],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './post-edit.component.html',
  styleUrls: ['./post-edit.component.scss']
})
export class PostEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  postForm!: FormGroup;
  postId!: number;
  originalPost!: Post;
  showSuccessToast = false;
  isLoading = true;
  loadError = false;

  ngOnInit(): void {
    // Initialize empty form first to avoid template errors
    this.initializeEmptyForm();
    
    this.postId = Number(this.route.snapshot.paramMap.get('id'));
    
    if (!this.postId || isNaN(this.postId)) {
      console.error('Invalid post ID');
      this.router.navigate(['']);
      return;
    }

    this.loadPost();
  }

  private initializeEmptyForm(): void {
    this.postForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      body: ['', [Validators.required, Validators.minLength(10)]],
      tag: ['', Validators.required]
    });
  }

  private loadPost(): void {
    this.isLoading = true;
    this.loadError = false;

    this.apiService.getPostWithComments(this.postId).subscribe({
      next: (post) => {
        console.log('✅ Post loaded successfully:', post);
        this.originalPost = post;
        
        // Populate form with existing post data
        this.postForm.patchValue({
          title: post.title || '',
          body: post.body || '',
          tag: post.tag 
        });
        
        this.isLoading = false;
        console.log('📝 Form populated with:', this.postForm.value);
      },
      error: (err) => {
        console.error('❌ Failed to load post:', err);
        this.isLoading = false;
        this.loadError = true;
        
        // Show error message for a few seconds, then redirect
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1000);
      }
    });
  }

  onSubmit(): void {
    if (this.postForm.invalid) {
      console.log('❌ Form is invalid');
      // Mark all fields as touched to show validation errors
      this.postForm.markAllAsTouched();
      return;
    }

    // Check if anything actually changed
    const formData = this.postForm.value;
    const hasChanges = 
      formData.title !== this.originalPost.title ||
      formData.body !== this.originalPost.body ||
      formData.tag !== (this.originalPost.tag || 'general');

    if (!hasChanges) {
      console.log('ℹ️ No changes detected, redirecting...');
      this.showSuccessToast = true;
      setTimeout(() => {
        this.router.navigate(['/']);
      }, 1500);
      return;
    }

    this.isLoading = true;
    console.log('🔄 Updating post with changes:', formData);

    const sanitizedData = {
      title: this.sanitizer.sanitize(1, formData.title) || formData.title,
      body: this.sanitizer.sanitize(1, formData.body) || formData.body,
      tag: this.sanitizer.sanitize(1, formData.tag) || formData.tag,
    };

    const updatedPost: Post = {
      ...this.originalPost, // Keep all original data
      ...sanitizedData,     // Override with new data
      id: this.postId
    };

    this.apiService.updatePost(this.postId, updatedPost).subscribe({
      next: (response) => {
        console.log('✅ Post updated successfully:', response);
        this.showSuccessToast = true;
        this.isLoading = false;
        
        // Navigate back after showing success message
        setTimeout(() => {
          this.router.navigate(['/']);
        }, 1500);
      },
      error: (err) => {
        console.error('❌ Failed to update post:', err);
        this.isLoading = false;
        alert('Failed to update post. Please try again.');
      }
    });
  }

  onCancel(): void {
    // Check if there are unsaved changes
    if (this.hasUnsavedChanges()) {
      const confirmLeave = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmLeave) {
        return;
      }
    }
    
    this.router.navigate(['/']);
  }

  private hasUnsavedChanges(): boolean {
    if (!this.originalPost || !this.postForm.value) {
      return false;
    }

    const formData = this.postForm.value;
    return (
      formData.title !== this.originalPost.title ||
      formData.body !== this.originalPost.body ||
      formData.tag !== (this.originalPost.tag )
    );
  }

  // Retry loading if there was an error
  retryLoad(): void {
    this.loadPost();
  }
}