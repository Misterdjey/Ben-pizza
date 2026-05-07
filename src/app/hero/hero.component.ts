import { Component, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-hero',
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
})
export class HeroComponent implements AfterViewInit {
  protected t = inject(LanguageService).t;

  @ViewChild('heroVideo') heroVideo!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit() {
    const video = this.heroVideo.nativeElement;
    video.muted = true;
    video.play().catch(() => {});
  }
}
