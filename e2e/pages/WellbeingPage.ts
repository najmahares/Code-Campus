import { BasePage } from './BasePage';

export class WellbeingPage extends BasePage {
  checkInTab = () => this.page.getByRole('button', { name: /Check in/i });
  moodFaces = () => this.page.locator('[class*="moodFace"]');
  saveMoodButton = () => this.page.getByRole('button', { name: /Save check-in/i });
  breathingTab = () => this.page.getByRole('button', { name: /Breathe/i });
  beginBreathingButton = () => this.page.getByRole('button', { name: /Begin/i });
  rantTab = () => this.page.getByRole('button', { name: /Rant/i });
  rantInput = () => this.page.getByPlaceholder(/What is frustrating you/i);

  async checkIn(moodIndex: number) {
    await this.moodFaces().nth(moodIndex).click();
    await this.saveMoodButton().click();
  }
}
