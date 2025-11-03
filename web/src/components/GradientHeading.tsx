import { PropsWithChildren } from "react";
import styled from "styled-components";
import { colors } from "@theme/index";
import { typography } from "@theme/typography";

const Heading = styled.h1`
  font-size: 52px;
  line-height: 62px;
  font-weight: ${typography.greeting.fontWeight};
  text-align: center;
  margin: 0 0 28px;
  background: linear-gradient(90deg, ${colors.mint} 0%, ${colors.teal} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

export const GradientHeading = ({ children }: PropsWithChildren) => <Heading>{children}</Heading>;
