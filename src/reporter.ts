import ora, { Ora } from 'ora';

let spinner: Ora | undefined;

export function showSpinner(text: string) {
  if (!spinner) {
    spinner = ora({ text: '' }).start();
  }

  spinner.text = text;
}

export function hideSpinner() {
  if (!spinner) {
    return;
  }

  spinner.stop();
}
