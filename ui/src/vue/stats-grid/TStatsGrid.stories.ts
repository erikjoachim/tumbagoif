import type { Meta, StoryObj } from "@storybook/vue3";
import TStatsGrid from "./TStatsGrid.vue";

const meta: Meta<typeof TStatsGrid> = {
  title: "Components/TStatsGrid",
  component: TStatsGrid,
  tags: ["autodocs"],
  argTypes: {
    columns: { control: { type: "number", min: 1, max: 6 } },
  },
};

export default meta;
type Story = StoryObj<typeof TStatsGrid>;

export const FourColumns: Story = {
  args: {
    columns: 4,
    stats: [
      { value: "4", label: "Idrottsgrenar" },
      { value: "500+", label: "Medlemmar" },
      { value: "15+", label: "År av Gemenskap" },
      { value: "100+", label: "Aktiviteter/Vecka" },
    ],
  },
};

export const TwoColumns: Story = {
  args: {
    columns: 2,
    stats: [
      { value: "4", label: "Idrottsgrenar" },
      { value: "500+", label: "Medlemmar" },
    ],
  },
};
