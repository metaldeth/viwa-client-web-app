/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('R2-5: uses client-side NavLink instead of full document reload anchors', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNav />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole('link', { name: /Главная/i });
    expect(homeLink.tagName).toBe('A');
    expect(homeLink.getAttribute('href')).toBe('/home');

    const profileLink = screen.getByRole('link', { name: /Абонемент/i });
    expect(profileLink.getAttribute('href')).toBe('/home');
    expect(profileLink.getAttribute('aria-current')).toBe('page');
  });
});
