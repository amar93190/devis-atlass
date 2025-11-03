import styled from "styled-components";
import { GradientHeading } from "@components/GradientHeading";
import { HeroInput } from "@components/HeroInput";
import { PromptPill } from "@components/PromptPill";
import { ChatBubble } from "@components/ChatBubble";
import { PlanAccordion } from "@components/PlanAccordion";
import { useChat } from "@hooks/useChat";
import { spacing } from "@theme/index";

const Layout = styled.div`
  display: grid;
  gap: ${spacing.lg + 8}px;
  margin-top: 140px;

  @media (max-width: 1024px) {
    margin-top: 96px;
  }
`;

const Pills = styled.div`
  display: flex;
  justify-content: center;
  gap: ${spacing.sm}px;
  flex-wrap: nowrap;
  overflow-x: visible;
  padding: 0;
`;

const Feed = styled.div`
  display: grid;
  gap: ${spacing.md}px;
`;

const PlanSection = styled.div`
  display: grid;
  gap: ${spacing.md}px;
`;

const Placeholder = styled.div`
  text-align: center;
  color: #7b868c;
`;

const prompts = [
  "Programme de nutrition",
  "Programme spécifique",
  "Coaching mental",
  "Programme de récupération"
];

export const ChatPage = () => {
  const { messages, loading, error, sendPrompt } = useChat();

  const latestPlan = [...messages].reverse().find(message => message.plan)?.plan;

  return (
    <Layout>
      <GradientHeading>Bonjour User</GradientHeading>
      <HeroInput placeholder="Qu’est-ce qu’on fait aujourd’hui?" onSubmit={sendPrompt} />
      <Pills>
        {prompts.map(prompt => (
          <PromptPill key={prompt} label={prompt} onClick={() => sendPrompt(prompt)} />
        ))}
      </Pills>
      <Feed>
        {messages.length === 0 ? (
          <Placeholder>Partage ton objectif du jour pour recevoir un plan personnalisé.</Placeholder>
        ) : (
          messages.map(message => (
            <ChatBubble
              key={message.id}
              author={message.role}
              message={message.text}
              timestamp={new Date(message.createdAt).toLocaleString()}
            />
          ))
        )}
      </Feed>
      {loading && <span>Diego prépare ton plan…</span>}
      {error && <span style={{ color: "#d43" }}>{error}</span>}
      {latestPlan && (
        <PlanSection>
          <PlanAccordion title="Technical drills" items={latestPlan.technicalDrills ?? []} />
          <PlanAccordion title="Physical workouts" items={latestPlan.physicalWorkouts ?? []} />
          <PlanAccordion title="Tactical focus" items={latestPlan.tacticalFocus ?? []} />
          <PlanAccordion title="Nutrition advice" items={latestPlan.nutritionAdvice ?? []} />
          <PlanAccordion title="Mental tip" items={latestPlan.mentalTip ?? []} />
        </PlanSection>
      )}
    </Layout>
  );
};
