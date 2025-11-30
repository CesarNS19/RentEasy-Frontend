import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from 'src/app/services/auth';

@Component({
  selector: 'app-recovery-password',
  standalone: true,
  imports: [RouterModule, FormsModule, CommonModule],
  templateUrl: './recovery-password.page.html',
  styleUrls: ['./recovery-password.page.scss']
})
export class RecoveryPasswordPage implements OnInit {

  email: string = '';
  codigo: string = '';
  password: string = '';
  password2: string = '';
  emailEnviado: boolean = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {}

  async enviarCorreo() {
    if (!this.email || !this.validarEmail(this.email)) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Ingresa un correo electrónico válido.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      return;
    }

    Swal.fire({
      title: 'Enviando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const res = await this.authService.recoverPassword(this.email);
    Swal.close();

    if (res) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Correo enviado',
        text: 'Revisa tu correo e ingresa el código recibido.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      this.emailEnviado = true;
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Error al enviar',
        text: 'Intenta de nuevo.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  }

  async recuperarPassword() {
    if (!this.codigo || !this.password || !this.password2) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Completa todos los campos.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      return;
    }

    if (this.password !== this.password2) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'warning',
        title: 'Contraseñas no coinciden',
        text: 'Asegúrate de que ambas contraseñas sean iguales.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
      return;
    }

    Swal.fire({
      title: 'Procesando...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });

    const res = await this.authService.confirmRecovery(this.codigo, this.password, this.password2);
    Swal.close();

    if (res) {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Contraseña actualizada',
        text: 'Ya puedes iniciar sesión.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      }).then(() => {
        this.router.navigate(['/login']);
      });
    } else {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Código incorrecto',
        text: 'El código es inválido o expiró.',
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true
      });
    }
  }

  validarEmail(correo: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }

  goLogin() {
    this.router.navigate(['/login']);
  }
}
