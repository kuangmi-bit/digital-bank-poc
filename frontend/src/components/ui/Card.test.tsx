import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card } from './Card';

describe('Card', () => {
  it('渲染 children', () => {
    render(<Card>内容</Card>);
    expect(screen.getByText('内容')).toBeInTheDocument();
  });

  it('title 时显示标题', () => {
    render(<Card title="标题">内容</Card>);
    expect(screen.getByRole('heading', { name: '标题' })).toBeInTheDocument();
  });

  it('accentBar 时渲染顶条', () => {
    const { container } = render(<Card accentBar>内容</Card>);
    const bar = container.querySelector('.bg-gradient-to-r.from-primary-500');
    expect(bar).toBeInTheDocument();
  });

  it('应用传入的 className', () => {
    const { container } = render(<Card className="custom">内容</Card>);
    expect(container.firstChild).toHaveClass('custom');
  });
});
