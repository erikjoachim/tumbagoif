import type { Meta, StoryObj } from "@storybook/vue3";
import TSocialLinks from "./TSocialLinks.vue";

const meta: Meta<typeof TSocialLinks> = {
  title: "Components/TSocialLinks",
  component: TSocialLinks,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TSocialLinks>;

export const Default: Story = {
  args: {
    links: [
      { name: "Facebook", href: "#", label: "Facebook" },
      { name: "Instagram", href: "#", label: "Instagram" },
      { name: "X", href: "#", label: "X" },
    ],
  },
};
