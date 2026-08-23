import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonBackButton,
  IonButtons,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonChip,
  IonSkeletonText,
  IonSpinner,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  footballOutline,
  analyticsOutline,
  statsChartOutline,
  peopleOutline,
  walletOutline,
  timeOutline,
} from 'ionicons/icons';
import { FixturesService } from '../core/services/fixtures.service';
import { PredictionsService } from '../core/services/predictions.service';
import {
  FixtureDetail,
  Prediction,
  FixtureOddWithBookmaker,
  FixtureEvent,
  FixtureLineup,
  FixtureStat,
} from '../core/models';

@Component({
  selector: 'app-fixture-detail',
  templateUrl: './fixture-detail.page.html',
  styleUrls: ['./fixture-detail.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonBackButton,
    IonButtons,
    IonSegment,
    IonSegmentButton,
    IonLabel,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonChip,
    IonSkeletonText,
    IonSpinner,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonBadge,
  ],
})
export class FixtureDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fixturesService = inject(FixturesService);
  private predictionsService = inject(PredictionsService);

  fixture = signal<FixtureDetail | null>(null);
  prediction = signal<Prediction | null>(null);
  odds = signal<FixtureOddWithBookmaker[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  activeTab = signal<'prediction' | 'stats' | 'lineups' | 'odds'>('prediction');

  constructor() {
    addIcons({
      arrowBackOutline,
      footballOutline,
      analyticsOutline,
      statsChartOutline,
      peopleOutline,
      walletOutline,
      timeOutline,
    });
  }

  async ngOnInit() {
    const apiId = Number(this.route.snapshot.paramMap.get('id'));
    if (!apiId) {
      this.router.navigate(['/home']);
      return;
    }

    try {
      this.loading.set(true);

      const fixtureData = await this.fixturesService.getFixtureDetail(apiId);
      this.fixture.set(fixtureData);

      if (fixtureData) {
        const [pred, oddsData] = await Promise.all([
          this.predictionsService.getPrediction(fixtureData.id),
          this.predictionsService.getFixtureOdds(fixtureData.id),
        ]);
        this.prediction.set(pred);
        this.odds.set(oddsData);
      }
    } catch (err) {
      this.error.set(err instanceof Error ? err.message : 'Error loading fixture');
    } finally {
      this.loading.set(false);
    }
  }

  onTabChange(event: Event) {
    const value = (event as CustomEvent).detail.value;
    this.activeTab.set(value as 'prediction' | 'stats' | 'lineups' | 'odds');
  }

  formatDateTime(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getPercentColor(percent: string | null): string {
    if (!percent) return '';
    const val = parseInt(percent, 10);
    if (val >= 60) return 'success';
    if (val >= 40) return 'warning';
    return 'danger';
  }
}
