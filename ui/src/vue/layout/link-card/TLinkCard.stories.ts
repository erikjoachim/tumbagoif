import type { Meta, StoryObj } from "@storybook/vue3";
import TLinkCard from "./TLinkCard.vue";

const meta: Meta<typeof TLinkCard> = {
  title: "Components/TLinkCard",
  component: TLinkCard,
  tags: ["autodocs"],
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 24px;">
          <story />
        </div>
      `,
    }),
  ],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof TLinkCard>;

export const Default: Story = {
  args: {
    title: "Gymnastik",
    description: "Verksamhet från 3 års ålder för både killar och tjejer.",
    icon: "🤸",
    href: "#",
    size: "md",
    showArrow: true,
  },
};

export const Large: Story = {
  args: {
    title: "Basket",
    description:
      "En av de största basketklubbarna i södra Stockholm. Barn, ungdomar och vuxna spelar basket i en trygg, inkluderande och utvecklande miljö.",
    icon: "🏀",
    href: "#",
    size: "lg",
    showArrow: true,
  },
};

export const NoIcon: Story = {
  args: {
    title: "Innebandy",
    description: "Lagsport med tempo och glädje.",
    href: "#",
    size: "md",
    showArrow: true,
  },
};

export const NoArrow: Story = {
  args: {
    title: "Gymmix",
    description: "Träna tillsammans i grupp med fokus på glädje och hälsa.",
    icon: "💪",
    href: "#",
    size: "md",
    showArrow: false,
  },
};
