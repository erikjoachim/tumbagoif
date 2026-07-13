import type { Meta, StoryObj } from "@storybook/vue3";
import TCard from "./TCard.vue";

const meta: Meta<typeof TCard> = {
  title: "Components/TCard",
  component: TCard,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "interactive"] },
    padding: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof TCard>;

export const Default: Story = {
  args: {
    variant: "default",
    padding: "md",
    default: "Card content",
  },
};

export const Interactive: Story = {
  args: {
    variant: "interactive",
    padding: "md",
    default: "Hover me",
  },
};
