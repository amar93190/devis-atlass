import { FormEvent, useState } from "react";
import type { KeyboardEvent } from "react";
import styled from "styled-components";
import { IconArrowUp } from "@tabler/icons-react";
import { colors } from "@theme/index";
import { typography } from "@theme/typography";
import { shadows } from "@theme/shadows";

const Form = styled.form`
  width: 100%;
  max-width: 740px;
  margin: 0 auto;
`;

const InputWrapper = styled.div`
  display: flex;
  align-items: center;
  border: 2.5px solid ${colors.mint};
  border-radius: 26px;
  background: #ffffff;
  padding: 18px 26px;
  box-shadow: ${shadows.hero};
`;

const Input = styled.textarea`
  flex: 1;
  border: none;
  font-size: ${typography.input.fontSize}px;
  line-height: ${typography.input.lineHeight}px;
  color: ${colors.greyText};
  font-family: inherit;
  outline: none;
  text-align: left;
  resize: none;
  background: transparent;
  height: 68px;
  padding: 0;
  overflow-y: auto;
`;

const SubmitButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background: ${colors.mint};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: scale(1.03);
  }
`;

export type HeroInputProps = {
  placeholder: string;
  onSubmit: (value: string) => void;
};

export const HeroInput = ({ placeholder, onSubmit }: HeroInputProps) => {
  const [value, setValue] = useState("");

  const submitMessage = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setValue("");
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submitMessage();
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <InputWrapper>
        <Input
          value={value}
          placeholder={placeholder}
          onChange={event => setValue(event.target.value)}
          onKeyDown={handleKeyDown}
          rows={2}
        />
        <SubmitButton type="submit" aria-label="Envoyer">
          <IconArrowUp size={22} stroke={1.8} />
        </SubmitButton>
      </InputWrapper>
    </Form>
  );
};
