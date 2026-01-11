// API 요청/응답 타입 정의

export interface GameSession {
  id: string;
  character: string;
  name: string;
  location?: string;
  step: number;
  quizResults?: QuizResult[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizResult {
  quizId: string;
  userAnswer: boolean;
  isCorrect: boolean;
}

// API 요청 타입
export interface StartGameRequest {
  character: string;
  name: string;
}

export interface UpdateLocationRequest {
  location: string;
}

export interface SubmitQuizRequest {
  quizResults: QuizResult[];
}

export interface CompleteGameRequest {
  quizResults: QuizResult[];
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface GameSessionResponse extends ApiResponse<GameSession> {}
