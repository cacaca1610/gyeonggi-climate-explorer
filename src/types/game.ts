export interface GameData {
  character: string;
  name: string;
  step: number;
  location?: string;
  quizResults?: Array<{
    quizId: string;
    userAnswer: boolean;
    isCorrect: boolean;
  }>;
  completedAt?: string;
}
