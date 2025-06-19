import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss'
})
export class PaginationComponent {
  @Input() currentPage!: number;
  @Input() totalPagesArray: (number | string)[] = [];
  @Input() totalPages!: number;

  @Output() pageChange = new EventEmitter<number>();
  @Output() previous = new EventEmitter<void>();
  @Output() next = new EventEmitter<void>();

  goToPage(page: number | string): void {
    if (typeof page === 'number') {
      this.pageChange.emit(page);
    }
  }

  goToPrevious(): void {
    this.previous.emit();
  }

  goToNext(): void {
    this.next.emit();
  }

}
