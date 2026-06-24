import { 
    createBrowserRouter, 
    createRoutesFromElements,
    Route
} from 'react-router-dom';
import App from './App';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForestScreen from './screens/ForestScreen';
import LectureScreen from './screens/LectureScreen';
import Semana1Screen from './screens/9/valores/unidad1/semana1Screen';
import Semana2Screen from './screens/9/valores/unidad1/semana2Screen';
import Semana3Screen from './screens/9/valores/unidad1/semana3Screen';
import Semana4Screen from './screens/9/valores/unidad1/semana4Screen';
import Semana5Screen from './screens/9/valores/unidad1/semana5Screen';
import SemanaTScreen from './screens/9/valores/unidad1/semanaTScreen';
import FrenchScreen from './screens/FrenchScreen';
import ValoresIndex from './screens/9/valores/ValoresIndex';
import ChineseScreen from './screens/9/valores/unidad1/ChineseScreen';
import StudentProfileScreen from './screens/students/StudentProfileScreen';
import StudentMySubjects from './screens/students/StudentMySubjects';
import StudentAskNewQuestionScreen from './screens/students/StudentAskNewQuestionScreen';
import StudentAskScreen from './screens/students/StudentAskScreen';
import StudentRecordScreen from './screens/students/StudentRecordScreen';
import StudentRecordCameraScreen from './screens/students/StudentRecordCameraScreen';
import StudentNewAnswersScreen from './screens/students/StudentNewAnswersScreen';
import StudentWatchAnswerScreen from './screens/students/StudentWatchAnswerScreen';
import StudentAskTeacherScreen from './screens/students/StudentAskTeacherScreen';
import StudentPreviousQuestionsScreen from './screens/students/StudentPreviousQuestionsScreen';
import StudentWatchQuestionScreen from './screens/students/StudentWatchQuestionScreen';
import StudentWatchCourseSreen from './screens/students/StudentWatchCourseSreen';
import StudentCoursesScreen from './screens/students/StudentCoursesScreen';
import StudentSubscriptionScreen from './screens/students/StudentSubscriptionScreen';
import StudentLessonPageScreen from './screens/students/StudentLessonPageScreen';
import Unidad1Semana1BosquesScreen from './screens/books/Unidad1Semana1BosquesScreen';




import Semana1Unidad2Screen from './screens/9/valores/unidad2/Semana1Unidad2Screen';
import Semana2Unidad2Screen from './screens/9/valores/unidad2/Semana2Unidad2Screen';
import Semana3Unidad2Screen from './screens/9/valores/unidad2/Semana3Unidad2Screen';
import Semana4Unidad2Screen from './screens/9/valores/unidad2/Semana4Unidad2Screen';
import Semana5Unidad2Screen from './screens/9/valores/unidad2/Semana5Unidad2Screen';
import Semana1Unidad3Screen from './screens/9/valores/unidad3/Semana1Unidad3Screen';
import Semana2Unidad3Screen from './screens/9/valores/unidad3/Semana2Unidad3Screen';
import Semana3Unidad3Screen from './screens/9/valores/unidad3/Semana3Unidad3Screen';
import Semana4Unidad3Screen from './screens/9/valores/unidad3/Semana4Unidad3Screen';
import Semana5Unidad3Screen from './screens/9/valores/unidad3/Semana5Unidad3Screen';
import Semana6Unidad3Screen from './screens/9/valores/unidad3/Semana6Unidad3Screen';

import Semana1Unidad4Screen from './screens/9/valores/unidad4/Semana1Unidad4Screen';
import Semana2Unidad4Screen from './screens/9/valores/unidad4/Semana2Unidad4Screen';
import Semana3Unidad4Screen from './screens/9/valores/unidad4/Semana3Unidad4Screen';
import Semana4Unidad4Screen from './screens/9/valores/unidad4/Semana4Unidad4Screen';
import Semana5Unidad4Screen from './screens/9/valores/unidad4/Semana5Unidad4Screen';
import Semana6Unidad4Screen from './screens/9/valores/unidad4/Semana6Unidad4Screen';

import Semana1Unidad5Screen from './screens/9/valores/unidad5/Semana1Unidad5Screen';
import Semana2Unidad5Screen from './screens/9/valores/unidad5/Semana2Unidad5Screen';
import Semana3Unidad5Screen from './screens/9/valores/unidad5/Semana3Unidad5Screen';
import Semana4Unidad5Screen from './screens/9/valores/unidad5/Semana4Unidad5Screen';
import Semana5Unidad5Screen from './screens/9/valores/unidad5/Semana5Unidad5Screen';

import Semana1Unidad6Screen from './screens/9/valores/unidad6/Semana1Unidad6Screen';
import Semana2Unidad6Screen from './screens/9/valores/unidad6/Semana2Unidad6Screen';
import Semana3Unidad6Screen from './screens/9/valores/unidad6/Semana3Unidad6Screen';
import Semana4Unidad6Screen from './screens/9/valores/unidad6/Semana4Unidad6Screen';
import Semana5Unidad6Screen from './screens/9/valores/unidad6/Semana5Unidad6Screen';

import TeacherLoginScreen from './screens/teachers/TeacherLoginScreen';
import TeacherRegisterScreen from './screens/teachers/TeacherRegisterScreen';
import TeacherBookUploadScreen from './screens/teachers/TeacherBookUploadScreen';
import TeacherNewQuestionsScreen from './screens/teachers/TeacherNewQuestionsScreen';
import TeacherSubjectsScreen from './screens/teachers/TeacherSubjectsScreen';
import TeacherEditSubjectScreen from './screens/teachers/TeacherEditSubjectScreen';
import TeacherPreviousQuestionsScreen from './screens/teachers/TeacherPreviousQuestionsScreen';
import TeacherWatchNewScreen from './screens/teachers/TeacherWatchNewScreen';
import TeacherAnswerDetailsScreen from './screens/teachers/TeacherAnswerDetailsScreen';
import TeacherAnswerScreen from './screens/teachers/TeacherAnswerScreen';
import TeacherStudentsScreen from './screens/teachers/TeacherStudentsScreen';
import TeacherProfileScreen from './screens/teachers/TeacherProfileScreen';
import TeacherStudentsBySubjectScreen from './screens/teachers/TeacherStudentsBySubjectScreen';
import TeacherAddStudentToSubjectScreen from './screens/teachers/TeacherAddStudentToSubjectScreen';
import TeacherRecordScreen from './screens/teachers/TeacherRecordScreen';
import TeacherRecordCameraScreen from './screens/teachers/TeacherRecordCameraScreen';
import TeacherCreateCourseScreen from './screens/teachers/TeacherCreateCourseScreen';
import TeacherAddLessonsScreen from './screens/teachers/TeacherAddLessonsScreen';
import TeacherPreviewCourseScreen from './screens/teachers/TeacherPreviewCourseScreen';
import TeacherWatchAnswerScreen from './screens/teachers/TeacherWatchAnswerScreen';
import TeacherCoursesScreen from './screens/teachers/TeacherCoursesScreen';




import SchoolAdminLoginScreen from './screens/schoolAdmin/SchoolAdminLoginScreen';
import SchoolAdminRegisterScreen from './screens/schoolAdmin/SchoolAdminRegisterScreen';
import SchoolAdminProfileScreen from './screens/schoolAdmin/SchoolAdminProfileScreen';
import SchoolAdminRegisterSchoolScreen from './screens/schoolAdmin/SchoolAdminRegisterSchoolScreen';
import SchoolAdminMySchoolsScreen from './screens/schoolAdmin/SchoolAdminMySchoolsScreen';
import SchoolAdminCreateSubjectScreen from './screens/schoolAdmin/SchoolAdminCreateSubjectScreen';
import SchoolAdminMySubjectsScreen from './screens/schoolAdmin/SchoolAdminMySubjectsScreen';
import SchoolAdminEditSubjectScreen from './screens/schoolAdmin/SchoolAdminEditSubjectScreen';
import SchoolAdminTeacherInviteScreen from './screens/schoolAdmin/SchoolAdminTeacherInviteScreen';
import SchoolAdminCreatePlanScreen from './screens/schoolAdmin/SchoolAdminCreatePlanScreen';
import SchoolAdminPlansScreen from './screens/schoolAdmin/SchoolAdminPlansScreen';
import SchoolAdminUpdatePlanScreen from './screens/schoolAdmin/SchoolAdminUpdatePlanScreen';
import SchoolAdminPreviousQuestionsScreen from './screens/schoolAdmin/SchoolAdminPreviousQuestionsScreen';
import SchoolAdminWatchQuestionScreen from './screens/schoolAdmin/SchoolAdminWatchQuestionScreen';
import SchoolAdminWatchAnswerScreen from './screens/schoolAdmin/SchoolAdminWatchAnswerScreen';
import SchoolAdminAddTeacherScreen from './screens/schoolAdmin/SchoolAdminAddTeacherScreen';
import SchoolAdminAddStudentsScreen from './screens/schoolAdmin/SchoolAdminAddStudentsScreen';
import SchoolAdminSubscriptionsScreen from './screens/schoolAdmin/SchoolAdminSubscriptionsScreen';
import SchoolAdminEarningsScreen from './screens/schoolAdmin/SchoolAdminEarningsScreen';
import SchooldAdminStudentsScreen from './screens/schoolAdmin/SchooldAdminStudentsScreen';
import SchoolAdminSubjectStudentsScreen from './screens/schoolAdmin/SchoolAdminSubjectStudentsScreen';
import SchoolAdminCoursesScreen from './screens/schoolAdmin/SchoolAdminCoursesScreen';
import SchoolAdminViewCourseScreen from './screens/schoolAdmin/SchoolAdminViewCourseScreen';
import SchoolAdminBookChapters from './screens/schoolAdmin/SchoolAdminBookChapters';
import SchoolAdminGenerateLessonsScreen from './screens/schoolAdmin/SchoolAdminGenerateLessonsScreen';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />} >
            <Route index={true} path="/" element={<HomeScreen />} />   
            <Route path="/exam" element={<HomeScreen />} />
            <Route path="/examen" element={<HomeScreen />} />
            <Route  path="/subjects/:id" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route  path="/forest" element={<ForestScreen />} />
            <Route  path="/lecture" element={<LectureScreen />} />
            <Route  path="/9/valores/unidad1/semana1" element={<Semana1Screen />} />
            <Route  path="/9/valores/unidad1/semana2" element={<Semana2Screen />} />
            <Route  path="/9/valores/unidad1/semana3" element={<Semana3Screen />} />
            <Route  path="/9/valores/unidad1/semana4" element={<Semana4Screen />} />
            <Route  path="/9/valores/unidad1/semana5" element={<Semana5Screen />} />
            <Route  path="/9/valores/unidad1/semanaT" element={<SemanaTScreen />} />
            <Route  path="/9/valores/unidad2/semana1" element={<Semana1Unidad2Screen />} />
            <Route  path="/9/valores/unidad2/semana2" element={<Semana2Unidad2Screen />} />
            <Route  path="/9/valores/unidad2/semana3" element={<Semana3Unidad2Screen />} />
            <Route  path="/9/valores/unidad2/semana4" element={<Semana4Unidad2Screen />} />
            <Route  path="/9/valores/unidad2/semana5" element={<Semana5Unidad2Screen />} />

            <Route  path="/9/valores/unidad3/semana1" element={<Semana1Unidad3Screen />} />
            <Route  path="/9/valores/unidad3/semana2" element={<Semana2Unidad3Screen />} />
            <Route  path="/9/valores/unidad3/semana3" element={<Semana3Unidad3Screen />} />
            <Route  path="/9/valores/unidad3/semana4" element={<Semana4Unidad3Screen />} />
            <Route  path="/9/valores/unidad3/semana5" element={<Semana5Unidad3Screen />} />
            <Route  path="/9/valores/unidad3/semana6" element={<Semana6Unidad3Screen />} />

            <Route  path="/9/valores/unidad4/semana1" element={<Semana1Unidad4Screen />} />
            <Route  path="/9/valores/unidad4/semana2" element={<Semana2Unidad4Screen />} />
            <Route  path="/9/valores/unidad4/semana3" element={<Semana3Unidad4Screen />} />
            <Route  path="/9/valores/unidad4/semana4" element={<Semana4Unidad4Screen />} />
            <Route  path="/9/valores/unidad4/semana5" element={<Semana5Unidad4Screen />} />
            <Route  path="/9/valores/unidad4/semana6" element={<Semana6Unidad4Screen />} />

            <Route  path="/9/valores/unidad5/semana1" element={<Semana1Unidad5Screen />} />
            <Route  path="/9/valores/unidad5/semana2" element={<Semana2Unidad5Screen />} />
            <Route  path="/9/valores/unidad5/semana3" element={<Semana3Unidad5Screen />} />
            <Route  path="/9/valores/unidad5/semana4" element={<Semana4Unidad5Screen />} />
            <Route  path="/9/valores/unidad5/semana5" element={<Semana5Unidad5Screen />} />

            <Route  path="/9/valores/unidad6/semana1" element={<Semana1Unidad6Screen />} />
            <Route  path="/9/valores/unidad6/semana2" element={<Semana2Unidad6Screen />} />
            <Route  path="/9/valores/unidad6/semana3" element={<Semana3Unidad6Screen />} />
            <Route  path="/9/valores/unidad6/semana4" element={<Semana4Unidad6Screen />} />
            <Route  path="/9/valores/unidad6/semana5" element={<Semana5Unidad6Screen />} />

            <Route  path="/9/valores" element={<ValoresIndex />} />
            <Route  path="/books/bosques/semana1" element={<Unidad1Semana1BosquesScreen />} />
            <Route  path="/french" element={<FrenchScreen />} />
            <Route  path="/chinese" element={<ChineseScreen />} />

            <Route  path="/students/profile" element={<StudentProfileScreen />} />
            <Route  path="/students/mysubjects" element={<StudentMySubjects />} />
            <Route  path="/students/asknewquestion" element={<StudentAskNewQuestionScreen />} />
            <Route  path="/students/ask/:id" element={<StudentAskScreen />} />
            <Route  path="/students/recordscreen/:id" element={<StudentRecordScreen />} />
            <Route  path="/students/recordcamera/:id" element={<StudentRecordCameraScreen />} />
            <Route  path="/students/newanswers" element={<StudentNewAnswersScreen />} />
            <Route path="/students/watchanswer/:answerId" element={<StudentWatchAnswerScreen />} />
            <Route path="/students/askteacher" element={<StudentAskTeacherScreen />} />
            <Route path="/students/previousquestions/:subjectId" element={<StudentPreviousQuestionsScreen />} />
            <Route path="/students/watchquestion/:questionId" element={<StudentWatchQuestionScreen />} />
            <Route path="/students/watchcourse/:courseId" element={<StudentWatchCourseSreen />} />
            <Route path="/students/courses/:subjectId" element={<StudentCoursesScreen />} />
            <Route path="/students/subscription" element={<StudentSubscriptionScreen />} />
            <Route  path="/students/lessonpage/:lessonId" element={<StudentLessonPageScreen />} />


            <Route  path="/teachers/login" element={<TeacherLoginScreen />} />
            <Route  path="/teachers/register" element={<TeacherRegisterScreen />} />
            <Route  path="/teachers/bookupload" element={<TeacherBookUploadScreen />} />
            <Route  path="/teachers/newquestions" element={<TeacherNewQuestionsScreen />} />
            <Route  path="/teachers/subjects" element={<TeacherSubjectsScreen />} />
            <Route
                path="/teachers/createcourse"
                element={<TeacherCreateCourseScreen />}
            />
            <Route  path="/teachers/subjects/:id/edit" element={<TeacherEditSubjectScreen />} />
            <Route  path="/teachers/previousquestions/:subjectId" element={<TeacherPreviousQuestionsScreen />} />
            <Route  path="/teachers/watchnew" element={<TeacherWatchNewScreen />} />
            <Route  path="/teachers/answerdetails" element={<TeacherAnswerDetailsScreen />} />
            <Route  path="/teachers/answer/:id" element={<TeacherAnswerScreen />} />
            <Route  path="/teachers/profile" element={<TeacherProfileScreen />} />
            <Route  path="/teachers/students/:id" element={<TeacherStudentsScreen />} />
            <Route  path="/teachers/students" element={<TeacherStudentsBySubjectScreen />} />
            <Route  path="/teachers/students/:id/addstudent" element={<TeacherAddStudentToSubjectScreen />} />
            <Route  path="/teachers/recordscreen/:id" element={<TeacherRecordScreen />} />
            <Route  path="/teachers/recordcamera/:id" element={<TeacherRecordCameraScreen />} />
            <Route  path="/teachers/watchanswer/:answerId" element={<TeacherWatchAnswerScreen />} />
            <Route
                path="/teachers/courses/:id/addlessons"
                element={<TeacherAddLessonsScreen />}
            />
            <Route path="/teachers/courses/:id" element={<TeacherCoursesScreen />} />
            <Route path="/teachers/courses/:id/preview" element={<TeacherPreviewCourseScreen />} />
            
            <Route  path="/schooladmins/login" element={<SchoolAdminLoginScreen />} />
            <Route  path="/schooladmins/register" element={<SchoolAdminRegisterScreen />} />
            <Route  path="/schooladmins/profile" element={<SchoolAdminProfileScreen />} />
            <Route  path="/schooladmins/registerschool" element={<SchoolAdminRegisterSchoolScreen />} />
            <Route  path="/schooladmins/myschools" element={<SchoolAdminMySchoolsScreen />} />
            <Route  path="/schooladmins/createsubject" element={<SchoolAdminCreateSubjectScreen />} />
            <Route  path="/schooladmins/mysubjects" element={<SchoolAdminMySubjectsScreen />} />
            <Route
                path="/schooladmins/courses/:id/preview"
                element={<SchoolAdminViewCourseScreen />}
            />
            <Route  path="/schooladmins/courses/:id" element={<SchoolAdminCoursesScreen />} />
            <Route  path="/schooladmins/editsubject/:id" element={<SchoolAdminEditSubjectScreen />} />
            <Route
                path="/schooladmins/teacherinvite/:id"
                element={<SchoolAdminTeacherInviteScreen />}
            />
            <Route  path="/schooladmins/createplan" element={<SchoolAdminCreatePlanScreen />} />
            <Route  path="/schooladmins/plans" element={<SchoolAdminPlansScreen />} />
            <Route  path="/schooladmins/updateplan/:id" element={<SchoolAdminUpdatePlanScreen />} />
            <Route  path="/schooladmins/previousquestions/:subjectId" element={<SchoolAdminPreviousQuestionsScreen />} />
            <Route  path="/schooladmins/watchquestion/:questionId" element={<SchoolAdminWatchQuestionScreen />} />
            <Route  path="/schooladmins/watchanswer/:answerId" element={<SchoolAdminWatchAnswerScreen />} />
            <Route  path="/schooladmins/addteacher" element={<SchoolAdminAddTeacherScreen />} />
            <Route  path="/schooladmins/addstudents" element={<SchoolAdminAddStudentsScreen />} />
            <Route  path="/schooladmins/subscriptions/:planId" element={<SchoolAdminSubscriptionsScreen />} />
            <Route  path="/schooladmins/earnings" element={<SchoolAdminEarningsScreen />} />
            <Route  path="/schooladmins/students" element={<SchooldAdminStudentsScreen />} />
            <Route
                path="/schooladmins/students/:id"
                element={<SchoolAdminSubjectStudentsScreen />}
            />
            <Route  path="/schooladmins/bookchapters/:subjectId" element={<SchoolAdminBookChapters />} />
            <Route  path="/schooladmins/generatelessons/:subjectId" element={<SchoolAdminGenerateLessonsScreen />} />
            <Route
                path="/schooladmins/lessonpage/:subjectId/:lessonId"
                element={<StudentLessonPageScreen />}
            />
        </Route>
    )
);

export default router;