import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  greeting = () => this.page.getByRole('heading', { name: /Good/ });
  priorityCard = () => this.page.getByText("Today's Priority");
  searchInput = () => this.page.getByPlaceholder(/Search anything/i);
  quickCaptureInput = () => this.page.getByPlaceholder(/Note, task, code/i);
  
  async completeOnboarding() {
    const onboarding = this.page.getByText('Welcome to Code Campus');
    if (await onboarding.isVisible({ timeout: 2000 }).catch(() => false)) {
      await this.page.getByRole('button', { name: /Skip|Continue|Enter/i }).click();
    }
  }

  async search(query: string) {
    await this.searchInput().click();
    await this.searchInput().fill(query);
    // Wait for dropdown
    await this.page.waitForTimeout(500); 
  }
}
