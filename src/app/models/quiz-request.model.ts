export interface QuizQuestionRequest {
  questionText: string;
  answers: QuizAnswerRequest[];
}

export interface QuizAnswerRequest {
  answerText: string;
  isCorrect: boolean;
}

export interface QuizRequest {
  keycloakId: string;
  title: string;
  lessonId: number;
  passingScore: number;
  questions: QuizQuestionRequest[];
}
