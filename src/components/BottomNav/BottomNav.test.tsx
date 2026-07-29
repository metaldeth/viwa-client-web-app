/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import BottomNav from './BottomNav';

describe('BottomNav', () => {
  it('uses client-side NavLink with only Home active on /home', () => {
    render(
      <MemoryRouter initialEntries={['/home']}>
        <BottomNav />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole('link', { name: /Главная/i });
    expect(homeLink.tagName).toBe('A');
    expect(homeLink.getAttribute('href')).toBe('/home');
    expect(homeLink.className).toContain('linkActive');
    expect(homeLink.getAttribute('aria-current')).toBe('page');

    expect(screen.queryByRole('link', { name: /Профиль/i })).toBeNull();
    expect(screen.getByText('Профиль').closest('[aria-disabled="true"]')).toBeTruthy();

    expect(screen.getByRole('button', { name: /Станция/i })).toBeTruthy();
    expect(screen.getByText('История')).toBeTruthy();
    expect(screen.getByText('Награды')).toBeTruthy();
  });

  it('marks Home active with aria-current on machine-scoped /m/:serial/home', () => {
    render(
      <MemoryRouter initialEntries={['/m/VIWA-001/home']}>
        <BottomNav />
      </MemoryRouter>,
    );

    const homeLink = screen.getByRole('link', { name: /Главная/i });
    expect(homeLink.className).toContain('linkActive');
    expect(homeLink.getAttribute('aria-current')).toBe('page');
  });
});
