import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonChip,
  IonSkeletonText,
  IonRefresher,
  IonRefresherContent,
  IonBadge,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  footballOutline,
  calendarOutline,
  timeOutline,
  checkmarkCircleOutline,
  refreshOutline,
} from 'ionicons/icons';
import { FixturesService } from '../core/services/fixtures.service';
import { LeaguesService } from '../core/services/leagues.service';
import { FixtureWithRelations, League, FixtureStatus } from '../core/models';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonChip,
    IonSkeletonText,
    IonRefresher,
    IonRefresherContent,
    IonBadge,
    IonButton,
    IonIcon,
  ],
})
export class HomePage implements OnInit {
  readonly fixturesService = inject(FixturesService);
  private leaguesService = inject(LeaguesService);
  private router = inject(Router);

  selectedSegment = signal<'all' | 'live' | 'upcoming' | 'finished'>('all');
  selectedLeagueId = signal<number | null>(null);

  readonly loading = this.fixturesService.loading;
  readonly allFixtures = this.fixturesService.fixtures;
  readonly liveFixtures = this.fixturesService.liveFixtures;
  readonly upcomingFixtures = this.fixturesService.upcomingFixtures;
  readonly finishedFixtures = this.fixturesService.finishedFixtures;

  readonly leagues = this.leaguesService.leagues;

  readonly filteredFixtures = computed(() => {
    const segment = this.selectedSegment();
    const leagueId = this.selectedLeagueId();
    let fixtures: FixtureWithRelations[];

    switch (segment) {
      case 'live':
        fixtures = this.liveFixtures();
        break;
      case 'upcoming':
        fixtures = this.upcomingFixtures();
        break;
      case 'finished':
        fixtures = this.finishedFixtures();
        break;
      default:
        fixtures = this.allFixtures();
    }

    if (leagueId) {
      fixtures = fixtures.filter((f) => f.league_id === leagueId);
    }

    return fixtures;
  });

  constructor() {
    addIcons({
      footballOutline,
      calendarOutline,
      timeOutline,
      checkmarkCircleOutline,
      refreshOutline,
    });
  }

  async ngOnInit() {
    await Promise.all([
      this.fixturesService.loadFixtures({ limit: 50 }),
      this.leaguesService.loadLeagues(),
    ]);
  }

  onSegmentChange(event: Event) {
    const value = (event as CustomEvent).detail.value;
    this.selectedSegment.set(value);
  }

  onLeagueFilter(leagueId: number | null) {
    this.selectedLeagueId.set(
      this.selectedLeagueId() === leagueId ? null : leagueId
    );
  }

  async onRefresh(event: unknown) {
    await this.fixturesService.loadFixtures({ limit: 50 });
    const refresher = (event as { target: { complete: () => void } }).target;
    refresher.complete();
  }

  navigateToFixture(fixture: FixtureWithRelations) {
    this.router.navigate(['/fixture', fixture.api_id]);
  }

  navigateToStandings(leagueApiId: number) {
    this.router.navigate(['/standings', leagueApiId]);
  }

  getStatusColor(status: FixtureStatus): string {
    if (['1H', 'HT', '2H', 'ET', 'BT', 'LIVE'].includes(status)) return 'danger';
    if (['FT', 'AET', 'PEN'].includes(status)) return 'medium';
    if (status === 'NS') return 'primary';
    return 'warning';
  }

  getStatusLabel(status: FixtureStatus): string {
    const map: Record<FixtureStatus, string> = {
      NS: 'NS',
      '1H': '1°T',
      HT: 'ET',
      '2H': '2°T',
      ET: 'TE',
      P: 'Pausa',
      FT: 'FT',
      AET: 'TE',
      PEN: 'Pen',
      BT: 'Desc',
      SUSP: 'Suspendido',
      INT: 'Interrumpido',
      PST: 'Aplazado',
      CANC: 'Cancelado',
      ABD: 'Abandonado',
      AWD: 'Adjudicado',
      WO: 'WO',
      LIVE: 'En vivo',
    };
    return map[status] ?? status;
  }

  formatTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' });
  }

  trackByFixtureId(_index: number, fixture: FixtureWithRelations): number {
    return fixture.api_id;
  }

  trackByLeagueId(_index: number, league: League): number {
    return league.api_id;
  }
}
