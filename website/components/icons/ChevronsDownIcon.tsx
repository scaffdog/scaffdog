export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const ChevronsDownIcon: React.FC<Props> = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M9.3335 9.33325L16.0002 15.9999L22.6668 9.33325"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.3335 17.3333L16.0002 23.9999L22.6668 17.3333"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
