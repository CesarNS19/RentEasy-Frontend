import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from './services/auth';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <ng-container *ngIf="showLayout; else loginLayout">
      <header class="topbar">
        <button class="btn-toggle" (click)="toggleSidebar()">
          <i class="bi bi-list text-dark"></i>
        </button>
        <h1>RentEasy</h1>

        <div class="user-info">
          <span>{{ username }}</span>
          <button class="btn-logout" (click)="logout()">
            <i class="bi bi-box-arrow-right"></i>
          </button>
        </div>
      </header>

      <!-- Sidebar -->
      <aside class="sidebar" [class.open]="isSidebarOpen">
        <button class="btn-close" (click)="closeSidebar()">
          <i class="bi bi-x-lg"></i>
        </button>

        <ul>
          <!-- Inicio -->
          <li class="sidebar-title">Inicio</li>
          <li>
            <a routerLink="/home" (click)="closeSidebar()"
              ><i class="bi bi-house me-2"></i>Inicio</a
            >
          </li>

          <!-- Propiedades -->
          <li class="sidebar-title">Propiedades</li>
          <li>
            <a routerLink="/propiedades" (click)="closeSidebar()"
              ><i class="bi bi-building me-2"></i>Ver propiedades</a
            >
          </li>
          <li *ngIf="isArrendador">
            <a routerLink="/propiedad-form" (click)="closeSidebar()">
              <i class="bi bi-card-list me-2"></i>Mis propiedades
            </a>
          </li>
          <!-- Chats -->
          <li class="sidebar-title">Chats</li>
          <li>
            <a routerLink="/chat" (click)="closeSidebar()"
              ><i class="bi bi-chat-dots me-2"></i>Ver chats</a
            >
          </li>
        </ul>
      </aside>

      <div class="overlay" *ngIf="isSidebarOpen" (click)="closeSidebar()"></div>

      <nav class="bottom-nav">
          <a routerLink="/propiedades" routerLinkActive="active">
        <i class="bi bi-building"></i>
        <span>Propiedades</span>
      </a>
      <a routerLink="/home" routerLinkActive="active">
        <i class="bi bi-house"></i>
        <span>Inicio</span>
      </a>
      <a routerLink="/chat" routerLinkActive="active">
        <i class="bi bi-chat-dots"></i>
        <span>Chats</span>
      </a>
    </nav>

      <main class="main-content">
        <router-outlet></router-outlet>
      </main>
    </ng-container>

    <ng-template #loginLayout>
      <router-outlet></router-outlet>
    </ng-template>

  `,
  styles: [
    `
      /* --- Header --- */
      .topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0.5rem 1rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        position: sticky;
        top: 0;
        height: 56px;
        z-index: 1000;
        background-color: #ffffff;
        color: #212529;
      }
      .topbar h1 {
        margin: 0;
        font-size: 1.25rem;
      }
      .btn-toggle {
        font-size: 1.5rem;
        background: none;
        border: none;
        cursor: pointer;
      }
      .user-info {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
      }
      .btn-logout {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.25rem;
        color: inherit;
      }

      /* --- Sidebar --- */
      .sidebar {
        position: fixed;
        top: 0;
        left: -260px;
        width: 260px;
        height: 100%;
        background: #f8f9fa;
        color: #212529;
        padding: 1rem;
        box-shadow: 2px 0 6px rgba(0, 0, 0, 0.15);
        transition: left 0.3s ease;
        z-index: 1000;
        display: flex;
        flex-direction: column;
      }
      .sidebar.open {
        left: 0;
      }
      .sidebar ul {
        list-style: none;
        padding: 0;
        margin-top: 2rem;
      }
      .sidebar ul li {
        margin: 1rem 0;
      }
      .sidebar ul li a {
        text-decoration: none;
        color: inherit;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: color 0.2s;
      }
      .sidebar ul li a:hover {
        color: #0d6efd;
      }
      .btn-close {
        align-self: flex-end;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: inherit;
      }

      .main-content {
        padding: 1rem;
        margin-left: 0;
        min-height: 100vh; /* fuerza que cubra toda la pantalla */
        background-color: #ffffff;
        color: #212529;
        transition: margin-left 0.3s;
      }
    `,
  ],
})
export class AppComponent implements OnInit {
  isSidebarOpen = false;
  showLayout = true;
  username: string = 'Usuario';
  isArrendador: boolean = false;

  constructor(
    private router: Router,
    private auth: AuthService,
    private cd: ChangeDetectorRef
  ) {}

 ngOnInit() {
    const storedRole = this.auth.getRole();
    if (storedRole) this.isArrendador = storedRole === 'arrendador';

    const storedUser = this.auth.getUser();
    if (storedUser) this.username = storedUser;

    this.auth.role$.subscribe((role) => {
      this.isArrendador = role === 'arrendador';
      this.cd.detectChanges();
    });

    this.auth.user$.subscribe((user) => {
      this.username = user ?? 'Usuario';
      this.cd.detectChanges();
    });

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const hiddenRoutes = ['/', '/login', '/registro'];
        this.showLayout = !hiddenRoutes.includes(event.urlAfterRedirects);
        this.isSidebarOpen = false;
      });
  }


  toggleSidebar() {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
  closeSidebar() {
    this.isSidebarOpen = false;
  }

  logout() {
    this.auth.logout();
    Swal.fire({
      toast: true,
      icon: 'info',
      title: 'Sesión cerrada',
      position: 'top-end',
      showConfirmButton: false,
      timer: 1500,
      timerProgressBar: true,
    });
    setTimeout(() => this.router.navigate(['/login']), 1500);
  }
}