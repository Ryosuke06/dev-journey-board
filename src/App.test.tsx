import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('AppShell', () => {
  it('renders the local app without requiring login', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: 'SpecLens Timeline' })).toBeInTheDocument();
    expect(screen.getByText('ログインなしで利用できます')).toBeInTheDocument();
  });
});
