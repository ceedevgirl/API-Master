import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { PostService } from '../../../../../core/services/post.service';
import { Router } from '@angular/router';
import { profanityValidator } from '../../../../../shared/validators/profanity-validator';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-post-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './post-create.component.html',
  styleUrls: ['./post-create.component.scss']
})
export class PostCreateComponent  {
  private fb = inject(FormBuilder);
  private postService = inject(PostService);
  private router = inject(Router);
  private sanitizer = inject(DomSanitizer);

  postForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(5), profanityValidator]],
    body: ['', [Validators.required, Validators.minLength(20), profanityValidator]],
    userId: [1, Validators.required],
    tag: ['', Validators.required],
  });

  isLoading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);


  onSubmit(): void {
    if (this.postForm.valid) {
      this.isLoading.set(true);
      this.successMessage.set(null);
      this.errorMessage.set(null);

      const newPost = this.postForm.value;

      const postToCreate = {
        title: newPost.title || '',
        body: newPost.body || '',
        userId: newPost.userId || 1,
        tag: newPost.tag || '',
      };

      this.postService.createPost(postToCreate).subscribe({
        next: (response) => {
          this.successMessage.set('Post created successfully!');
          this.isLoading.set(false);
          this.postForm.reset({ userId: 1 });
          this.router.navigate(['/posts', response.id]);
        },
        error: (err) => {
          this.errorMessage.set('Failed to create post. Please try again.');
          this.isLoading.set(false);
          console.error(err);
        }
      });
    } else {
      this.errorMessage.set('Please correct the errors in the form.');
      this.postForm.markAllAsTouched();
    }
  }

  
  getSanitizedHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  goBack(): void {
    this.router.navigate(['/posts']);
  }
}
