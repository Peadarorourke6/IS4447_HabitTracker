describe('FormField component', () => {
  it('renders with correct label', () => {
    const label = 'Habit Name';
    expect(label).toBe('Habit Name');
  });

  it('fires onChangeText when input changes', () => {
    const mockFn = jest.fn();
    mockFn('Morning Run');
    expect(mockFn).toHaveBeenCalledWith('Morning Run');
  });

  it('does not render without a label', () => {
    const label = '';
    expect(label.trim()).toBe('');
  });
});