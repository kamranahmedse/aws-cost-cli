import ora, { Ora } from 'ora';

let spinner: Ora | undefined;

/**
 * Shows the spinner with the given text
 * @param text Text to show in the spinner
 */
export function showSpinner(text: string) {
  if (!spinner) {
    spinner = ora({ text: '' }).start();
  }

  spinner.text = text;
}

/**
 * Hides the spinner and removes the loading text
 * @returns undefined
 */
export function hideSpinner() {
  if (!spinner) {
    return;
  }

  spinner.stop();
}
