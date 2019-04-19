import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {FlickrService, MinimalPhoto} from './flickr.service';
import {Observable, Subscription} from 'rxjs';
import {debounceTime} from 'rxjs/operators';

interface SavedQuery {
  query: string;
  results: MinimalPhoto[];
}

@Component({
  selector: 'app-root',
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  subscriptions = new Subscription();
  photos: MinimalPhoto[] = [];
  query = '';
  savedQueries: SavedQuery[];
  operation = 'or';
  isMultipleSearch = false;
  emitQueryChange: (event: KeyboardEvent) => void;
  currentPage = 1;
  numOfPages: number;
  @ViewChild('multiSelect') multiSelect: any;

  constructor(private flickrService: FlickrService) {
    const localStorageData = localStorage.getItem('savedQueries');
    this.savedQueries = localStorageData ? JSON.parse(localStorageData) : [];
  }

  ngOnInit(): void {
    this.search();
    this.subscriptions.add(this.inputChanges().subscribe(
      input => this.search(input)
    ));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  inputChanges(): Observable<string> {
    return new Observable<string>(observer => {
      this.emitQueryChange = (event: KeyboardEvent) => {
        observer.next((event.target as HTMLInputElement).value);
      };
    }).pipe(
      debounceTime(700)
    );
  }

  search(query?: string, pageNumber?: number): void {
    query = query ? query : this.query;
    pageNumber = pageNumber ? pageNumber : 1;
    const queryIndex = this.savedQueries.findIndex((savedQuery) => savedQuery.query === query);
    if (queryIndex > -1) {
      this.photos = this.savedQueries[queryIndex].results;
    } else {
      this.flickrService.search(query, this.operation, pageNumber).subscribe((searchResult) => {
        this.photos = searchResult.photos;
        this.numOfPages = searchResult.numOfPages;
      });
    }
  }

  searchMultiple(query: string[]): void {
    this.query = '';
    this.isMultipleSearch = query.length > 0;
    if (query.length === 1) {
      this.search(query[0]);
    } else {
      this.flickrService.search(query.join(','), this.operation, 1).subscribe((searchResult) => {
        this.photos = searchResult.photos;
        this.numOfPages = searchResult.numOfPages;
      });
    }
  }

  save(): void {
    if (this.query) {
      this.savedQueries.push({query: this.query, results: this.photos});
      localStorage.setItem('savedQueries', JSON.stringify(this.savedQueries));
    }
  }

  clear(): void {
    localStorage.clear();
    this.savedQueries = [];
    this.isMultipleSearch = false;
  }

  onOperationChange(): void {
    this.searchMultiple(this.multiSelect.value);
  }

  fetchNextPage() {
    if (this.currentPage < this.numOfPages) {
      this.flickrService.search(this.query, this.operation, this.currentPage + 1).subscribe((res) => {
        this.currentPage = this.currentPage++;
        this.photos.concat(res.photos);
      });
    }
  }
}
