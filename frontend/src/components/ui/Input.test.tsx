import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('渲染 input 与 label', () => {
    render(<Input label="用户名" id="u" />);
    expect(screen.getByLabelText('用户名')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'u');
  });

  it('无 label 时仍渲染 input', () => {
    render(<Input placeholder="请输入" />);
    expect(screen.getByPlaceholderText('请输入')).toBeInTheDocument();
  });

  it('error 时显示错误并 aria-invalid', () => {
    render(<Input label="密码" error="必填" id="p" />);
    expect(screen.getByRole('alert')).toHaveTextContent('必填');
    expect(screen.getByLabelText('密码')).toHaveAttribute('aria-invalid', 'true');
  });

  it('hint 时显示辅助说明', () => {
    render(<Input label="邮箱" hint="选填" id="e" />);
    expect(screen.getByText('选填')).toBeInTheDocument();
  });

  it('受控 value 与 onChange', () => {
    render(<Input value="a" onChange={() => {}} label="x" id="x" />);
    expect(screen.getByLabelText('x')).toHaveValue('a');
  });
});
