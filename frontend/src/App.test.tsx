import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Ouorix tourism safety dashboard', () => {
  render(<App />);
  const titleElement = screen.getByText(/Welcome to Your Safety Dashboard/i);
  expect(titleElement).toBeInTheDocument();
});

test('renders Ouorix logo', () => {
  render(<App />);
  const logoElement = screen.getByText(/Ouorix/i);
  expect(logoElement).toBeInTheDocument();
});

test('renders emergency button', () => {
  render(<App />);
  const emergencyButton = screen.getByRole('button', { name: /🚨 EMERGENCY/i });
  expect(emergencyButton).toBeInTheDocument();
});

test('renders safety metrics', () => {
  render(<App />);
  const locationSafety = screen.getByRole('heading', { name: /Location Safety Score/i });
  const weatherAlert = screen.getByRole('heading', { name: /Weather Alert/i });
  const crowdDensity = screen.getByRole('heading', { name: /Crowd Density/i });
  
  expect(locationSafety).toBeInTheDocument();
  expect(weatherAlert).toBeInTheDocument();
  expect(crowdDensity).toBeInTheDocument();
});
