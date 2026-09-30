/** Small shared building blocks for the side panel. 4 px radius, no shadows. */

type Variant = 'primary' | 'secondary' | 'human';

export function buttonClass(variant: Variant = 'primary', className = '') {
  const styles = {
    primary: 'bg-primary hover:bg-primary-hover text-white',
    human: 'bg-human hover:bg-human-hover text-white',
    secondary: 'border border-line bg-surface hover:bg-subtle text-text',
  }[variant];
  return `h-8 px-3 inline-flex items-center justify-center gap-1.5 rounded-[4px] text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${styles} ${className}`;
}

export function Button({
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return <button {...props} className={buttonClass(variant, className)} />;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[11px] font-mono uppercase tracking-wide text-muted">{children}</p>;
}

export const inputClass =
  'w-full px-2.5 py-1.5 border border-line rounded-[4px] text-sm bg-surface text-text placeholder:text-muted focus:outline-none focus:border-primary';
