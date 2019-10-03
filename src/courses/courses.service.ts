import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Quiz } from './quiz.entity';
import { Question } from './question.entity';
import { QuestionOption } from './questionOption.entity';

@Injectable()
export class CoursesService {
    constructor(
        @InjectRepository(Course) private readonly coursesRepository: Repository<Course>,
        @InjectRepository(Quiz) private readonly quizRepository: Repository<Quiz>,
        @InjectRepository(Question) private readonly questionRepository: Repository<Question>,
        @InjectRepository(QuestionOption) private readonly questionOptionsRepository: Repository<QuestionOption>
    ) { }

    getAllCourses(): Promise<Course[]> {
        return this.coursesRepository.find();
    }

    getCourseById(id: number): Promise<Course> {
        return this.coursesRepository.findOne(id);
    }

    createCourse({ courseName }) {
        const course = new Course();
        course.courseName = courseName;

        return this.coursesRepository.save(course);
    }

    getQuizById(id: number): Promise<Quiz> {
        return this.quizRepository.findOne(id);
    }

    async createQuiz(courseId, quizName): Promise<Quiz> {
        const course = await this.getCourseById(courseId);
        console.log(course);

        const quiz = new Quiz();
        quiz.name = quizName;
        quiz.course = await this.getCourseById(courseId);

        return await this.quizRepository.save(quiz);
    }

    async createQuestion(quizId: number, questionTitle: string, options: string[], rightAnswer: string) {
        const quizToAssignQuestionTo = await this.getQuizById(quizId);
        
        let question = new Question();
        question.question = questionTitle;
        question.quiz = quizToAssignQuestionTo;
        await this.questionRepository.save(question);

        for (const option of options) {
            const questionOption = new QuestionOption();
            questionOption.title = option;
            questionOption.question = question;
            if(option == rightAnswer) {
                questionOption.amITheRightAnswer = true;
            } else {
                questionOption.amITheRightAnswer = false;
            }
            await this.questionOptionsRepository.save(questionOption);
        }
    }

    async getAllQuizesOfCourse(courseId) {
        const course = await this.getCourseById(courseId);
        const quizes = await course.quizes;
        return quizes;
    }

    async getAllQuestionsOfAQuiz(quizId) {
        const quiz = await this.getQuizById(quizId);
        const questions = await quiz.questions;
        return await Promise.all(questions.map((question) => this.questionRepository.findOne(question.id)));
    }
}
