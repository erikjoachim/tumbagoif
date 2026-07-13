import type { Meta, StoryObj } from "@storybook/vue3";
import THeaderText from "./THeaderText.vue";

const meta: Meta<typeof THeaderText> = {
  title: "Components/THeaderText",
  component: THeaderText,
  tags: ["autodocs"],
  argTypes: {
    as: { control: "select", options: ["h1", "h2", "h3", "h4", "h5", "h6"] },
  },
};

export default meta;
type Story = StoryObj<typeof THeaderText>;

export const Default: Story = {
  args: {
    as: "h2",
    text: "En förening för alla",
  },
};

export const H1: Story = {
  args: {
    as: "h1",
    text: "Glädje i rörelse",
  },
};

export const H2WithHighlight: Story = {
  args: {
    as: "h2",
    text: "Hitta din <mark>grej</mark>",
  },
};

export const UsingSegments: Story = {
  args: {
    as: "h2",
    segments: [{ text: "Hitta din " }, { text: "grej", highlighted: true }],
  },
};

export const MultipleHighlights: Story = {
  args: {
    as: "h3",
    text: "<mark>Träning</mark> och <mark>gemenskap</mark> i fokus",
  },
};
