export interface QuizAnswer {
  questionIndex: number;
  selectedAnswer: number;
}

export interface QuizSubmission {
  candidateKeycloakId: string;
  quizResourceId: number;
  answers: number[];
}

export interface QuizQuestion {
  id: number;
  questionText: string;
  answers: QuizAnswer[];
}

export interface QuizAttempt {
  id: number;
  candidateKeycloakId: string;
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
