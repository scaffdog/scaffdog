export type Props = React.ComponentPropsWithoutRef<'svg'>;

export const CopyIcon: React.FC<Props> = (props) => (
  <svg viewBox="0 0 32 32" fill="none" {...props}>
    <path
      d="M24 10.6667H13.3333C11.8605 10.6667 10.6666 11.8606 10.6666 13.3333V24C10.6666 25.4727 11.8605 26.6667 13.3333 26.6667H24C25.4727 26.6667 26.6666 25.4727 26.6666 24V13.3333C26.6666 11.8606 25.4727 10.6667 24 10.6667Z"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M21.3334 10.6667V8.00001C21.3334 7.29277 21.0524 6.61449 20.5523 6.11439C20.0522 5.61429 19.374 5.33334 18.6667 5.33334H8.00004C7.2928 5.33334 6.61452 5.61429 6.11442 6.11439C5.61433 6.61449 5.33337 7.29277 5.33337 8.00001V18.6667C5.33337 19.3739 5.61433 20.0522 6.11442 20.5523C6.61452 21.0524 7.2928 21.3333 8.00004 21.3333H10.6667"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
