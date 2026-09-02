export function createDisclosureController({
  initiallyOpen = false,
  onChange = () => {},
} = {}) {
  let open = Boolean(initiallyOpen);

  const emit = () => {
    onChange(open);
    return open;
  };

  return {
    get isOpen() {
      return open;
    },
    open() {
      open = true;
      return emit();
    },
    close() {
      open = false;
      return emit();
    },
    toggle(force) {
      open = typeof force === 'boolean' ? force : !open;
      return emit();
    },
    handleKey(key) {
      if (key === 'Enter' || key === ' ') return this.toggle();
      if (key === 'Escape' && open) return this.close();
      return open;
    },
  };
}
