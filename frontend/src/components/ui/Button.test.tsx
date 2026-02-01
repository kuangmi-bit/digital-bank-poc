import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('渲染 children', () => {
    render(<Button>确定</Button>);
    expect(screen.getByRole('button', { name: '确定' })).toBeInTheDocument();
  });

  it('默认 type 为 button', () => {
    render(<Button>提交</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('支持 type="submit"', () => {
    render(<Button type="submit">登录</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });

  it('点击时触发 onClick', async () => {
    const user = userEvent.setup();
    const fn = vi.fn();
    render(<Button onClick={fn}>点击</Button>);
    await user.click(screen.getByRole('button'));
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('disabled 时不可点击', () => {
    render(<Button disabled>禁用</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('compact 时应用紧凑样式', () => {
    render(<Button compact>紧凑</Button>);
    const btn = screen.getByRole('button');
    expect(btn).toHaveClass('px-3', 'py-1.5', 'text-sm');
  });

  it('variant 应用对应样式', () => {
    const { rerender } = render(<Button variant="primary">主要</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-primary-500');

    rerender(<Button variant="outline">轮廓</Button>);
    expect(screen.getByRole('button')).toHaveClass('border-primary-500');
  });
});
