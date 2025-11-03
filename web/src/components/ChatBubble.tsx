import styled from "styled-components";
import { colors, spacing } from "@theme/index";

const Bubble = styled.div<{ $variant: "user" | "ai" }>`
  align-self: ${({ $variant }) => ($variant === "user" ? "flex-end" : "flex-start")};
  background: ${({ $variant }) => ($variant === "ai" ? colors.aiBubble : "#ffffff")};
  border: ${({ $variant }) => ($variant === "user" ? `2px solid ${colors.mint}` : "none")};
  border-radius: 20px;
  padding: ${spacing.sm}px ${spacing.md}px;
  max-width: 70%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Meta = styled.span`
  font-size: 13px;
  color: ${colors.greyText};
  font-weight: 500;
`;

const Text = styled.p`
  margin: 0;
  font-size: 16px;
  line-height: 24px;
  color: #1b1b1b;
`;

export type ChatBubbleProps = {
  author: "user" | "ai";
  message: string;
  timestamp: string;
};

export const ChatBubble = ({ author, message, timestamp }: ChatBubbleProps) => (
  <Bubble $variant={author}>
    <Meta>{author === "ai" ? "Diego" : "Toi"} • {timestamp}</Meta>
    <Text>{message}</Text>
  </Bubble>
);
