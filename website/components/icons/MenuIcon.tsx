export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const MenuIcon: React.FC<Props> = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M5.33331 10.6667H26.6666"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5.33331 21.3333H26.6666"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
