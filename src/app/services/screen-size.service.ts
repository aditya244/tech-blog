import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject, fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScreenSizeService implements OnDestroy {
  private resizeSubject: BehaviorSubject<{ width: number; height: number }>;
  public screenSize$: Observable<{ width: number; height: number }>;

  constructor() {
    this.resizeSubject = new BehaviorSubject(this.getScreenSize());
    this.screenSize$ = this.resizeSubject.asObservable();

    fromEvent(window, 'resize')
      .pipe(debounceTime(100))
      .subscribe(() => this.resizeSubject.next(this.getScreenSize()));
  }

  ngOnDestroy() {
    this.resizeSubject.unsubscribe();
  }

  private getScreenSize() {
    return {
      width: window.innerWidth,
      height: window.innerHeight
    };
  }
}