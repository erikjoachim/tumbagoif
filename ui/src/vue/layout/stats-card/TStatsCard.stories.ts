import type { Meta, StoryObj } from "@storybook/vue3";
import TStatsCard from "./TStatsCard.vue";

const meta: Meta<typeof TStatsCard> = {
  title: "Components/TStatsCard",
  component: TStatsCard,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "interactive"] },
    padding: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof TStatsCard>;

export const Default: Story = {
  args: {
    value: "500+",
    label: "Medlemmar",
  },
};

export const Interactive: Story = {
  args: {
    value: "4",
    label: "Idrottsgrenar",
    variant: "interactive",
  },
};
