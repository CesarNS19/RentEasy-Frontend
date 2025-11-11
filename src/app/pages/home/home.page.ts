import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true
})
export class HomePage implements OnInit {
  
  constructor(private router: Router) { }
  ngOnInit() {
  }
}
