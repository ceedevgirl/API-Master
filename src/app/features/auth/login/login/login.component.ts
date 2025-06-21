import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {

private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm = this.fb.group({
    username: ['user', Validators.required], // Pre-fill for ease of testing
    password: ['password', Validators.required] // Pre-fill for ease of testing
  });

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading.set(true);
      this.errorMessage.set(null);

      const { username, password } = this.loginForm.value;

      this.authService.login(username || '', password || '').subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(['/posts']);
          } else {
            this.errorMessage.set('Login failed. Invalid credentials.');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          this.errorMessage.set('An error occurred during login. Please try again.');
          this.isLoading.set(false);
          console.error('Login error:', err);
        }
      });
    } else {
      this.errorMessage.set('Please enter both username and password.');
      this.loginForm.markAllAsTouched();
    }
  }
}