import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss']
})
export class PaginationComponent implements OnChanges {
  @Input() totalItems: number = 0;
  @Input() itemsPerPage: number = 10;
  @Input() currentPage: number = 1;
  @Output() pageChange = new EventEmitter<number>();

  totalPages: number = 0;
  pages: (number | string)[] = []; // pages can now contain numbers or '...'

  ngOnChanges(changes: SimpleChanges): void {
    // Recalculate if totalItems, itemsPerPage, or currentPage changes
    if (changes['totalItems'] || changes['itemsPerPage'] || changes['currentPage']) {
      this.calculatePages();
    }
  }

  private calculatePages(): void {
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);
    const pagesToDisplay: (number | string)[] = [];
    const maxPagesToShow = 5; // You can adjust this number (e.g., 5, 7, etc.)
    const ellipsis = '...';

    if (this.totalPages <= maxPagesToShow) {
      // If total pages are less than or equal to maxPagesToShow, show all
      for (let i = 1; i <= this.totalPages; i++) {
        pagesToDisplay.push(i);
      }
    } else {
      // Logic for showing limited pages with ellipses
      let startPage: number;
      let endPage: number;

      // Determine the range of pages to show around the current page
      if (this.currentPage <= Math.floor(maxPagesToShow / 2) + 1) {
        startPage = 1;
        endPage = maxPagesToShow - 1; // Show first few pages + 1 ellipsis
      } else if (this.currentPage + Math.floor(maxPagesToShow / 2) >= this.totalPages) {
        startPage = this.totalPages - (maxPagesToShow - 2); // Show last few pages + 1 ellipsis
        endPage = this.totalPages;
      } else {
        startPage = this.currentPage - Math.floor(maxPagesToShow / 2) + 1; // Show pages around current page
        endPage = this.currentPage + Math.floor(maxPagesToShow / 2) - 1;
      }


      // Always include the first page
      pagesToDisplay.push(1);

      // Add ellipsis if needed after the first page
      if (startPage > 2) {
        pagesToDisplay.push(ellipsis);
      }

      // Add pages in the calculated range
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < this.totalPages) { // Avoid duplicating 1 and totalPages if they are in the range
            pagesToDisplay.push(i);
        }
      }

      // Add ellipsis if needed before the last page
      if (endPage < this.totalPages - 1) {
        pagesToDisplay.push(ellipsis);
      }

      // Always include the last page (if not already included and totalPages > 1)
      if (this.totalPages > 1 && !pagesToDisplay.includes(this.totalPages)) {
          pagesToDisplay.push(this.totalPages);
      }
      // Deduplicate to avoid issues if range overlaps start/end pages
      this.pages = Array.from(new Set(pagesToDisplay));
      this.pages.sort((a, b) => {
        if (typeof a === 'string' || typeof b === 'string') return 0; // Keep ellipses in place during sort
        return (a as number) - (b as number);
      });
    }
     // Finalize pages to display, removing consecutive ellipses or putting them in correct order
     const finalPages: (number | string)[] = [];
     let lastElementWasEllipsis = false;
     for (const page of pagesToDisplay) {
        if (page === ellipsis) {
            if (!lastElementWasEllipsis) {
                finalPages.push(ellipsis);
                lastElementWasEllipsis = true;
            }
        } else {
            finalPages.push(page);
            lastElementWasEllipsis = false;
        }
     }
     this.pages = finalPages.filter((item, index, array) => {
        // Remove duplicates again after sort or additional logic
        return array.indexOf(item) === index;
     });
     this.pages.sort((a,b) => (a === ellipsis || b === ellipsis) ? 0 : (a as number) - (b as number));

     // Re-implement the calculation logic to ensure we only show 1 and 2 if totalPages <= 2, otherwise a range with ellipsis.
    this.pages = [];
    if (this.totalPages <= 2) {
        for (let i = 1; i <= this.totalPages; i++) {
            this.pages.push(i);
        }
    } else {
        // Complex pagination logic for more than 2 pages
        const displayRange = 1; // How many pages around the current page to show (e.g., 1 means current, current-1, current+1)
        const start = Math.max(1, this.currentPage - displayRange);
        const end = Math.min(this.totalPages, this.currentPage + displayRange);

        // Always add page 1
        if (start > 1) {
            this.pages.push(1);
            if (start > 2) {
                this.pages.push(ellipsis); // Add ellipsis if gap between 1 and start
            }
        }

        // Add pages in the calculated range
        for (let i = start; i <= end; i++) {
            this.pages.push(i);
        }

        // Always add last page
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) {
                this.pages.push(ellipsis); // Add ellipsis if gap between end and totalPages
            }
            this.pages.push(this.totalPages);
        }
    }
  }

  goToPage(page: number | string): void { // Accept string for ellipsis, but handle only numbers
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }
}