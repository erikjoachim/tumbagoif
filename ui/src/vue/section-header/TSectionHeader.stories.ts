import type { Meta, StoryObj } from "@storybook/vue3";
import TSectionHeader from "./TSectionHeader.vue";

const meta: Meta<typeof TSectionHeader> = {
  title: "Components/TSectionHeader",
  component: TSectionHeader,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TSectionHeader>;

export const WithHighlight: Story = {
  args: {
    title: "Hitta din ",
    highlight: "grej",
    description:
      "Utforska våra fyra idrottsgrenar, var och en med egna träningsmöjligheter och sammanhang.",
  },
};

export const TitleOnly: Story = {
  args: {
    title: "En förening för alla",
  },
};

export const WithDescription: Story = {
  args: {
    title: "Om föreningen",
    description:
      "Vi är en ideell idrottsförening som samlar människor genom rörelse och gemenskap.",
  },
};
