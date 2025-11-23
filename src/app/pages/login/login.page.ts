import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  username = '';
  password = '';
  rememberMe: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  async login() {
    if (!this.username.trim() || !this.password.trim()) {
      Swal.fire({
        toast: true,
        icon: 'warning',
        title: 'Por favor completa todos los campos',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    const data = await this.auth.login(this.username, this.password);
    if (!data) return;
    
    if (this.rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('savedUser', this.username);
      localStorage.setItem('savedPass', this.password);
    } else {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('savedUser');
      localStorage.removeItem('savedPass');
    }

    Swal.fire({
      toast: true,
      icon: 'success',
      title: '¡Bienvenido!',
      position: 'top-end',
      showConfirmButton: false,
      timer: 800,
      timerProgressBar: true,
    });

    await this.router.navigateByUrl('/home');
  }

  goRegistro() {
    this.router.navigate(['/registro']);
  }

  ngOnInit() {
    if (localStorage.getItem('rememberMe') === 'true') {
      this.username = localStorage.getItem('savedUser') || '';
      this.password = localStorage.getItem('savedPass') || '';
      this.rememberMe = true;
    }

    if (localStorage.getItem('loggedOut')) {
      Swal.fire({
        toast: true,
        icon: 'info',
        title: 'Sesión cerrada',
        text: 'Has cerrado sesión correctamente',
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      localStorage.removeItem('loggedOut');
    }
  }
}