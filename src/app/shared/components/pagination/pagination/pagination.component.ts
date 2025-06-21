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
    const maxPagesToShow = 5; 
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

      
      for (let i = startPage; i <= endPage; i++) {
        if (i > 1 && i < this.totalPages) { 
            pagesToDisplay.push(i);
        }
      }

      
      if (endPage < this.totalPages - 1) {
        pagesToDisplay.push(ellipsis);
      }

      
      if (this.totalPages > 1 && !pagesToDisplay.includes(this.totalPages)) {
          pagesToDisplay.push(this.totalPages);
      }
      
      this.pages = Array.from(new Set(pagesToDisplay));
      this.pages.sort((a, b) => {
        if (typeof a === 'string' || typeof b === 'string') return 0; 
        return (a as number) - (b as number);
      });
    }
     
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
        
        return array.indexOf(item) === index;
     });
     this.pages.sort((a,b) => (a === ellipsis || b === ellipsis) ? 0 : (a as number) - (b as number));

     
    this.pages = [];
    if (this.totalPages <= 2) {
        for (let i = 1; i <= this.totalPages; i++) {
            this.pages.push(i);
        }
    } else {
        
        const displayRange = 1; 
        const start = Math.max(1, this.currentPage - displayRange);
        const end = Math.min(this.totalPages, this.currentPage + displayRange);

        // Always add page 1
        if (start > 1) {
            this.pages.push(1);
            if (start > 2) {
                this.pages.push(ellipsis); 
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

  goToPage(page: number | string): void { 
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