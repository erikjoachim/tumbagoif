import type { Meta, StoryObj } from "@storybook/vue3";
import TBadge from "./TBadge.vue";

const meta: Meta<typeof TBadge> = {
  title: "Components/TBadge",
  component: TBadge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "pulse"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TBadge>;

export const Default: Story = {
  args: {
    label: "Tumba Gymnastik och Idrottsförening",
    variant: "default",
  },
};

export const Pulse: Story = {
  args: {
    label: "Tumba Gymnastik och Idrottsförening",
    variant: "pulse",
  },
};

export const WithSlot: Story = {
  args: {
    variant: "pulse",
  },
  render: (args) => ({
    components: { TBadge },
    setup: () => ({ args }),
    template: `<TBadge v-bind="args"><strong>Tumba</strong> Gymnastik</TBadge>`,
  }),
};
