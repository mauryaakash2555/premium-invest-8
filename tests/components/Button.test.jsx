/**
 * Button component tests
 */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Button } from '@/components/shared/Button';

describe('Button', () => {
  test('renders children', () => {
    const { getByText } = render(<Button>Click Me</Button>);
    expect(getByText('Click Me')).toBeInTheDocument();
  });

  test('calls onClick', () => {
    const onClick = jest.fn();
    const { getByText } = render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(getByText('Click'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  test('disabled does not call onClick', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <Button onClick={onClick} disabled>
        Click
      </Button>
    );
    fireEvent.click(getByText('Click'));
    expect(onClick).not.toHaveBeenCalled();
  });
});
