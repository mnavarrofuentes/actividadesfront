import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  isLoading?: boolean;
  onClick: () => void;
}
function Button({ children, isLoading, onClick }: Props) {
  return (
    <button
      disabled={isLoading}
      onClick={onClick}
      type="button"
      className={`btn btn-${isLoading ? "secondary" : "primary"}`}
    >
      {isLoading ? "cargando..." : children}
    </button>
  );
}

export default Button;
