export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const CheckIcon: React.FC<Props> = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M26.2761 8.39052C26.7968 8.91122 26.7968 9.75544 26.2761 10.2761L12.9428 23.6095C12.4221 24.1302 11.5779 24.1302 11.0572 23.6095L5.72384 18.2761C5.20314 17.7554 5.20314 16.9112 5.72384 16.3905C6.24454 15.8698 7.08876 15.8698 7.60945 16.3905L12 20.781L24.3905 8.39052C24.9112 7.86983 25.7554 7.86983 26.2761 8.39052Z"
      fill="currentColor"
    />
  </svg>
);
