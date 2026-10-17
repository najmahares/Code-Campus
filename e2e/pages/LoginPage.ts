import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  emailInput = () => this.page.locator('input[type="email"]');
  passwordInput = () => this.page.locator('input[type="password"]');
  signInButton = () => this.page.locator('button[type="submit"]');
  errorMessage = () => this.page.locator('text=/invalid|error|wrong/i').first();

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.signInButton().click();
  }
}
