import React from 'react';
import { render, screen } from '@testing-library/react';
import FifaStatsOverlay from './FifaStatsOverlay';

const mockPokemon = {
  name: 'Pikachu',
  hp: 35,
  atk: 55,
  def: 40,
  satk: 50,
  sdef: 50,
  spd: 90,
};

describe('FifaStatsOverlay', () => {
  test('renders pokemon name and stats', () => {
    render(<FifaStatsOverlay pokemon={mockPokemon} position={{ top: 0, left: 0 }} />);
    expect(screen.getByText('Pikachu')).toBeInTheDocument();
    expect(screen.getByText('HP:')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
  });

  test('does not render if no pokemon', () => {
    const { container } = render(<FifaStatsOverlay pokemon={null} position={{ top: 0, left: 0 }} />);
    expect(container.firstChild).toBeNull();
  });
});