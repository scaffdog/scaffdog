export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const ArrowLeftIcon: React.FC<Props> = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M20 8L12 16L20 24"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
