export type BotPayload = {
  text?: string;
  barchart?: {
    labels: string[];
    values: number[];
    xLabel?: string;
    yLabel?: string;
  };
  piechart?: {
    labels: string[];
    values: number[];
  };
  followUpQuestions?: string[];
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  payload?: BotPayload;
  isConversational?: boolean;
  followUpQuestions?: string[];
  id?: number;
};
