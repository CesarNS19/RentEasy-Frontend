import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './registro.page.html',
})
export class RegistroPage {
  username = '';
  password = '';
  rol = 'INQUILINO';

  constructor(private auth: AuthService, private router: Router) {}

  async register() {
    try {
      const data = await this.auth.register(this.username, this.password, this.rol);
      if (data) {
        this.router.navigateByUrl('/login');
      }
    } catch (e) {
      console.error('Error al registrarse', e);
    }
  }

  back() {
    this.router.navigate(['/login']);
  }
}
