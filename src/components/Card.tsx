import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface CardBodyProps {
  title: string;
  text?: string;
}

function Card(props: Props) {
  const { children } = props;
  const width = {
    width: "350px",
  };
  return (
    <div className="card" style={width}>
      <div className="card-body">{children}</div>
    </div>
  );
}

export function CardBody(props: CardBodyProps) {
  const { title, text } = props;
  return (
    <>
      <h5 className="card-title">{title}</h5>
      <p className="card-text">{text}</p>
    </>
  );
}

export default Card;
