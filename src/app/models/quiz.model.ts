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

export interface QuizAnswerResponse {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

export interface QuizQuestionResponse {
  id: number;
  questionText: string;
  answers: QuizAnswerResponse[];
}

export interface QuizResponse {
  id: number;
  title: string;
  passingScore: number;
  lessonId: number;
  authorKeycloakId: string;
  questions: QuizQuestionResponse[];
}
