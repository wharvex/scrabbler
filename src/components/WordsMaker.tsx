import { generate, count } from "random-words";

interface Props {
  bankSize: number;
}

export const WordsMaker = (props: Props) => {
  const getWords = ({ bankSize }: Props): Array<string> => {
    return generate(bankSize);
  };

  return (
    <ul>
      {" "}
      {getWords(props).map(word => (
        <li>{word}</li>
      ))}{" "}
    </ul>
  );
};
