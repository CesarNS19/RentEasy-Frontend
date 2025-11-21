import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChatGroupPage } from './chat-group.page';

describe('ChatGroupPage', () => {
  let component: ChatGroupPage;
  let fixture: ComponentFixture<ChatGroupPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatGroupPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
