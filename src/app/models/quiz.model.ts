export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
}

export interface QuizSubmission {
  candidateId: number;
  quizResourceId: number;
  answers: number[];
}

export interface QuizAttempt {
  id: number;
  userId: number;
  resourceId: number;
  score: number;
  passed: boolean;
  attemptedAt: string;
}
