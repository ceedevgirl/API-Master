import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
    
    spyOn(console, 'error');
    spyOn(window, 'alert');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should handle client-side errors', () => {
    const clientError = new HttpErrorResponse({
      error: new ErrorEvent('Network error', { message: 'Network connection failed' })
    });

    service.handleError(clientError).subscribe({
      error: (error) => {
        expect(error.message).toBe('Error: Network connection failed');
      }
    });

    expect(console.error).toHaveBeenCalledWith('Error: Network connection failed');
    expect(window.alert).toHaveBeenCalledWith('Error: Error: Network connection failed');
  });

  it('should handle server-side errors', () => {
    const serverError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error',
      error: 'Server error occurred'
    });

    service.handleError(serverError).subscribe({
      error: (error) => {
        expect(error.message).toContain('Error Code: 500');
      }
    });

    expect(console.error).toHaveBeenCalled();
  });

  it('should handle 401 unauthorized errors specifically', () => {
    const unauthorizedError = new HttpErrorResponse({
      status: 401,
      statusText: 'Unauthorized',
      error: 'Unauthorized access'
    });

    service.handleError(unauthorizedError).subscribe({
      error: (error) => {
        expect(error.message).toContain('Error Code: 401');
      }
    });

    expect(console.error).toHaveBeenCalledWith('Unauthorized request. Redirecting to login...');
  });

  it('should handle 404 not found errors specifically', () => {
    const notFoundError = new HttpErrorResponse({
      status: 404,
      statusText: 'Not Found',
      error: 'Resource not found'
    });

    service.handleError(notFoundError).subscribe({
      error: (error) => {
        expect(error.message).toContain('Error Code: 404');
      }
    });

    expect(console.error).toHaveBeenCalledWith('Resource not found.');
  });

  it('should return throwError observable', () => {
    const serverError = new HttpErrorResponse({
      status: 500,
      statusText: 'Internal Server Error'
    });

    const result = service.handleError(serverError);
    
    expect(result).toBeDefined();
    result.subscribe({
      error: (error) => {
        expect(error).toBeInstanceOf(Error);
        expect(error.message).toContain('Error Code: 500');
      }
    });
  });

  it('should display alert with error message', () => {
    const serverError = new HttpErrorResponse({
      status: 403,
      statusText: 'Forbidden'
    });

    service.handleError(serverError).subscribe({
      error: () => {}
    });

    expect(window.alert).toHaveBeenCalledWith(jasmine.stringMatching(/Error: Error Code: 403/));
  });

  it('should handle unknown errors with default message', () => {
    const unknownError = new HttpErrorResponse({});

    service.handleError(unknownError).subscribe({
      error: (error) => {
        expect(error.message).toContain('Error Code: 0');
      }
    });

    expect(console.error).toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalled();
  });

  it('should log different messages for 401 and 404 status codes', () => {
    const unauthorizedError = new HttpErrorResponse({ status: 401, statusText: 'Unauthorized' });
    const notFoundError = new HttpErrorResponse({ status: 404, statusText: 'Not Found' });

    service.handleError(unauthorizedError).subscribe({ error: () => {} });
    service.handleError(notFoundError).subscribe({ error: () => {} });

    expect(console.error).toHaveBeenCalledWith('Unauthorized request. Redirecting to login...');
    expect(console.error).toHaveBeenCalledWith('Resource not found.');
  });
});