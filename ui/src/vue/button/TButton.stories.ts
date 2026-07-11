import type { Meta, StoryObj } from "@storybook/vue3";
import TButton from "./TButton.vue";

const meta: Meta<typeof TButton> = {
  title: "Components/TButton",
  component: TButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["primary", "secondary"] },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof TButton>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "md",
    default: "Våra idrotter",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "md",
    default: "Om oss",
  },
};

export const Small: Story = {
  args: {
    variant: "primary",
    size: "sm",
    default: "Small",
  },
};

export const Large: Story = {
  args: {
    variant: "primary",
    size: "lg",
    default: "Large",
  },
};
