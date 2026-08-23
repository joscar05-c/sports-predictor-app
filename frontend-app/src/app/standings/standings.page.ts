import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonSpinner,
  IonBadge,
} from '@ionic/angular/standalone';
import { StandingsService } from '../core/services/standings.service';
import { StandingWithTeam } from '../core/models';

@Component({
  selector: 'app-standings',
  templateUrl: './standings.page.html',
  styleUrls: ['./standings.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonSpinner,
    IonBadge,
  ],
})
export class StandingsPage implements OnInit {
  private route = inject(ActivatedRoute);
  private standingsService = inject(StandingsService);

  standings = this.standingsService.standings;
  loading = this.standingsService.loading;
  error = this.standingsService.error;

  leagueApiId = signal(0);
  season = signal(0);

  ngOnInit() {
    const leagueApiId = Number(this.route.snapshot.paramMap.get('id'));
    const season = new Date().getFullYear();
    this.leagueApiId.set(leagueApiId);
    this.season.set(season);
    this.standingsService.loadStandings(leagueApiId, season);
  }

  getFormIcons(form: string | null): string[] {
    if (!form) return [];
    return form.split('').slice(-5);
  }

  getFormColor(result: string): string {
    switch (result) {
      case 'W': return 'success';
      case 'D': return 'warning';
      case 'L': return 'danger';
      default: return 'medium';
    }
  }
}
