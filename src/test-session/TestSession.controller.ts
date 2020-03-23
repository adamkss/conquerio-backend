import { Controller, Post, Param, Body, Get, Res } from '@nestjs/common';
import { TestSessionService } from './TestSession.service';
import { EntryCodesService } from '../tests/entry-codes.service';
import { Response } from 'express';

@Controller('test-sessions')
export class TestSessionController {
    constructor(
        private readonly testSessionService: TestSessionService,
        private readonly entryCodesService: EntryCodesService,
    ) { }

    @Post('/by-entry-codes/:entryCode')
    async createSessionForQuiz(@Param('entryCode') entryCodeString, @Res() response: Response) {
        const entryCode = await this.entryCodesService.getEntryCodeByCode(entryCodeString);
        if (entryCode) {
            response
                .status(200)
                .send(
                    {
                        sessionId: await this.testSessionService.createSessionByEntryCode(
                            entryCode
                        )
                    }
                )
                .end();
        } else {
            response
                .status(404)
                .send(
                    {
                        error: 'Entry code is not valid!'
                    }
                )
                .end();
        }
    }

    @Get('/:sessionId/numberOfQuestions')
    async getNumberOfQuestions(@Param('sessionId') sessionId): Promise<number> {
        return await this.testSessionService.getNumberOfTestQuestions(sessionId);
    }

    @Get('/:sessionId/questionsWithIdsOnly')
    async getQuestionsOfSessionWithIdsOnly(@Param('sessionId') sessionId): Promise<number[]> {
        return await this.testSessionService.getQuestionsOfSessionOnlyWithId(sessionId);
    }

    @Get('/:sessionId/questions/:questionId')
    async getQuestionOfASession(@Param('sessionId') sessionId, @Param('questionId') questionId) {
        const question = await this.testSessionService.getQuestionOfASession(
            sessionId,
            questionId
        );
        //we filter here to not include the "amITheRightAnswer" option
        question.questionOptions = question.questionOptions
            .map(questionOption => {
                const { amITheRightAnswer, ...rest } = questionOption;
                return { ...rest };
            })
        return question;
    }

    @Get('/:sessionId/testInfo')
    async getInfoAboutTest(@Param('sessionId') sessionId) {
        const test = await this.testSessionService.getTestInfoFromSessionId(sessionId);
        return {
            testName: test.name,
            owner: test.owner
        }
    }

    @Post('/:sessionId/submissions')
    async submitTestSession(@Param('sessionId') sessionId, @Body() testQuestionsStatuses) {
        return await this.testSessionService.submitTest(sessionId, testQuestionsStatuses);
    }
}
