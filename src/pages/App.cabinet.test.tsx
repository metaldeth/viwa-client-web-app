/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

vi.mock('../components/AppHeader/AppHeader', () => ({
  default: () => <div data-testid="legacy-flow-header">FLOW</div>,
}));

vi.mock('./SubscriptionPage/SubscriptionPage', () => ({
  default: () => <div data-testid="subscription-page">cabinet</div>,
}));

vi.mock('./HomeAuthGuard', () => ({
  default: ({ children }: { children: JSX.Element }) => children,
}));

describe('App cabinet shell', () => {
  it('hides legacy FLOW AppHeader on /home', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.queryByTestId('legacy-flow-header')).toBeNull();
    expect(screen.getByTestId('subscription-page')).toBeTruthy();
  });
});
