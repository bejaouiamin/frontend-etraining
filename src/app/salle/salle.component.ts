import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalleService } from '../services/salle.service';
import { Salle, SalleStatus } from '../models/salle.model';
import { Reservation, ReservationStatus } from '../models/reservation.model';
import { AuthHelperService } from '../services/auth-helper.service';

@Component({
  selector: 'app-salle',
  imports: [CommonModule, FormsModule],
  templateUrl: './salle.component.html',
  styleUrl: './salle.component.scss'
})
export class SalleComponent implements OnInit {
  // Data
  salles: Salle[] = [];
  filteredSalles: Salle[] = [];
  reservations: Reservation[] = [];
  selectedSalle: Salle | null = null;
  selectedReservation: Reservation | null = null;

  // Form models
  salleForm: Salle = this.getEmptySalle();
  reservationForm: Reservation = this.getEmptyReservation();

  // UI State
  activeView: 'list' | 'disponibles' | 'reservations' = 'list';
  showSalleModal = false;
  showReservationModal = false;
  showCancelModal = false;
  isEditMode = false;
  loading = false;
  searchTerm = '';
  filterStatus: SalleStatus | 'ALL' = 'ALL';

  // Enums for template
  salleStatuses = Object.values(SalleStatus);
  reservationStatuses = Object.values(ReservationStatus);
  SalleStatus = SalleStatus;
  ReservationStatus = ReservationStatus;

  // Cancellation
  cancelReason = '';
  reservationIdToCancel: number | null = null;

  // Real Keycloak user IDs
  adminKeycloakId: string | null = null;
  formateurKeycloakId: string | null = null;

  constructor(
    private salleService: SalleService,
    private authHelper: AuthHelperService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.initializeAuth();
    this.loadAllSalles();
  }

  private async initializeAuth(): Promise<void> {
    try {
      // Get the current user's Keycloak ID
      const userId = await this.authHelper.getKeycloakUserId();
      if (userId) {
        this.adminKeycloakId = userId;
        this.formateurKeycloakId = userId;
        console.log('User authenticated with Keycloak ID:', userId);
      } else {
        console.error('Unable to get Keycloak user ID - user may not be authenticated');
        alert('Vous devez être connecté pour accéder à cette page');
      }
    } catch (error) {
      console.error('Error initializing authentication:', error);
    }
  }

  // ========== CRUD Operations ==========

  loadAllSalles(): void {
    this.loading = true;
    this.salleService.getAllSalles().subscribe({
      next: (data) => {
        this.salles = data;
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading salles:', err);
        this.loading = false;
      }
    });
  }

  loadSallesDisponibles(): void {
    this.loading = true;
    this.salleService.getSallesDisponibles().subscribe({
      next: (data) => {
        this.salles = data;
        this.filteredSalles = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading available salles:', err);
        this.loading = false;
      }
    });
  }

  createSalle(): void {
    this.loading = true;
    this.salleService.createSalle(this.salleForm).subscribe({
      next: (salle) => {
        this.salles.push(salle);
        this.applyFilters();
        this.closeSalleModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating salle:', err);
        this.loading = false;
      }
    });
  }

  updateSalle(): void {
    if (!this.selectedSalle?.id) return;

    this.loading = true;
    this.salleService.updateSalle(this.selectedSalle.id, this.salleForm).subscribe({
      next: (salle) => {
        const index = this.salles.findIndex(s => s.id === salle.id);
        if (index !== -1) {
          this.salles[index] = salle;
        }
        this.applyFilters();
        this.closeSalleModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating salle:', err);
        this.loading = false;
      }
    });
  }

  deleteSalle(id: number): void {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette salle ?')) return;

    this.loading = true;
    this.salleService.deleteSalle(id).subscribe({
      next: () => {
        this.salles = this.salles.filter(s => s.id !== id);
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error deleting salle:', err);
        this.loading = false;
      }
    });
  }

  updateStatus(salleId: number, status: SalleStatus): void {
    this.loading = true;
    this.salleService.updateSalleStatus(salleId, status).subscribe({
      next: () => {
        const salle = this.salles.find(s => s.id === salleId);
        if (salle) {
          salle.status = status;
        }
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error updating status:', err);
        this.loading = false;
      }
    });
  }

  // ========== Reservation Operations ==========

  loadReservations(salleId: number): void {
    this.loading = true;
    this.salleService.getReservationsBySalle(salleId).subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading reservations:', err);
        this.loading = false;
      }
    });
  }

  loadFormateurReservations(): void {
    if (!this.formateurKeycloakId) {
      alert('Erreur: Identifiant utilisateur non trouvé');
      return;
    }

    this.loading = true;
    this.salleService.getFormateurReservations(this.formateurKeycloakId).subscribe({
      next: (data) => {
        this.reservations = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading formateur reservations:', err);
        this.loading = false;
      }
    });
  }

  createReservation(): void {
    if (!this.selectedSalle?.id) return;

    if (!this.adminKeycloakId || !this.reservationForm.formateurKeycloakId) {
      alert('Erreur: Identifiant utilisateur non trouvé. Veuillez vous reconnecter.');
      return;
    }

    this.loading = true;
    this.salleService.reserverSallePourFormateur(
      this.selectedSalle.id,
      this.reservationForm.formateurKeycloakId,
      this.reservationForm,
      this.adminKeycloakId
    ).subscribe({
      next: (reservation) => {
        this.reservations.push(reservation);
        this.loadAllSalles(); // Refresh to update status
        this.closeReservationModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error creating reservation:', err);
        alert('Erreur: ' + (err.error?.message || 'Impossible de créer la réservation'));
        this.loading = false;
      }
    });
  }

  openCancelModal(reservationId: number): void {
    this.reservationIdToCancel = reservationId;
    this.showCancelModal = true;
  }

  cancelReservation(): void {
    if (!this.reservationIdToCancel) return;

    this.loading = true;
    this.salleService.annulerReservation(this.reservationIdToCancel, this.cancelReason).subscribe({
      next: () => {
        this.reservations = this.reservations.filter(r => r.id !== this.reservationIdToCancel);
        this.loadAllSalles(); // Refresh to update status
        this.closeCancelModal();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cancelling reservation:', err);
        this.loading = false;
      }
    });
  }

  // ========== UI Helpers ==========

  openCreateSalleModal(): void {
    this.isEditMode = false;
    this.salleForm = this.getEmptySalle();
    this.showSalleModal = true;
  }

  openEditSalleModal(salle: Salle): void {
    this.isEditMode = true;
    this.selectedSalle = salle;
    this.salleForm = { ...salle };
    this.showSalleModal = true;
  }

  openReservationModal(salle: Salle): void {
    this.selectedSalle = salle;
    this.reservationForm = this.getEmptyReservation();
    this.showReservationModal = true;
  }

  closeSalleModal(): void {
    this.showSalleModal = false;
    this.selectedSalle = null;
    this.salleForm = this.getEmptySalle();
  }

  closeReservationModal(): void {
    this.showReservationModal = false;
    this.selectedSalle = null;
    this.reservationForm = this.getEmptyReservation();
  }

  closeCancelModal(): void {
    this.showCancelModal = false;
    this.reservationIdToCancel = null;
    this.cancelReason = '';
  }

  saveSalle(): void {
    if (this.isEditMode) {
      this.updateSalle();
    } else {
      this.createSalle();
    }
  }

  viewReservations(salle: Salle): void {
    this.selectedSalle = salle;
    this.loadReservations(salle.id!);
    this.activeView = 'reservations';
  }

  switchView(view: 'list' | 'disponibles' | 'reservations'): void {
    this.activeView = view;
    if (view === 'list') {
      this.loadAllSalles();
    } else if (view === 'disponibles') {
      this.loadSallesDisponibles();
    }
  }

  applyFilters(): void {
    let filtered = [...this.salles];

    // Filter by status
    if (this.filterStatus !== 'ALL') {
      filtered = filtered.filter(s => s.status === this.filterStatus);
    }

    // Filter by search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.nom.toLowerCase().includes(term) ||
        s.description.toLowerCase().includes(term) ||
        s.localisation.toLowerCase().includes(term)
      );
    }

    this.filteredSalles = filtered;
  }

  addEquipement(): void {
    if (!this.salleForm.equipements) {
      this.salleForm.equipements = [];
    }
    this.salleForm.equipements.push('');
  }

  removeEquipement(index: number): void {
    this.salleForm.equipements.splice(index, 1);
  }

  addPhoto(): void {
    if (!this.salleForm.photosUrls) {
      this.salleForm.photosUrls = [];
    }
    this.salleForm.photosUrls.push('');
  }

  removePhoto(index: number): void {
    this.salleForm.photosUrls.splice(index, 1);
  }

  trackByIndex(index: number): number {
    return index;
  }

  getStatusClass(status: SalleStatus): string {
    const classes: { [key in SalleStatus]: string } = {
      [SalleStatus.DISPONIBLE]: 'status-disponible',
      [SalleStatus.RESERVEE]: 'status-reservee',
      [SalleStatus.EN_COURS_UTILISATION]: 'status-encours',
      [SalleStatus.MAINTENANCE]: 'status-maintenance'
    };
    return classes[status];
  }

  getStatusLabel(status: SalleStatus): string {
    const labels: { [key in SalleStatus]: string } = {
      [SalleStatus.DISPONIBLE]: 'Disponible',
      [SalleStatus.RESERVEE]: 'Réservée',
      [SalleStatus.EN_COURS_UTILISATION]: 'En cours',
      [SalleStatus.MAINTENANCE]: 'Maintenance'
    };
    return labels[status];
  }

  getReservationStatusClass(status: ReservationStatus): string {
    const classes: { [key in ReservationStatus]: string } = {
      [ReservationStatus.CONFIRMEE]: 'res-confirmee',
      [ReservationStatus.EN_ATTENTE]: 'res-attente',
      [ReservationStatus.ANNULEE]: 'res-annulee',
      [ReservationStatus.TERMINEE]: 'res-terminee'
    };
    return classes[status];
  }

  private getEmptySalle(): Salle {
    return {
      nom: '',
      description: '',
      capacite: 0,
      localisation: '',
      equipements: [],
      photosUrls: [],
      status: SalleStatus.DISPONIBLE
    };
  }

  private getEmptyReservation(): Reservation {
    return {
      formateurKeycloakId: this.formateurKeycloakId || '',
      dateDebut: '',
      dateFin: '',
      status: ReservationStatus.CONFIRMEE,
      motif: ''
    };
  }
}
