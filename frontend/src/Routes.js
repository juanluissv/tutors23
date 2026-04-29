import { 
    createBrowserRouter, 
    createRoutesFromElements,
    Route
} from 'react-router-dom';
import App from './App';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import AskScreen  from './screens/AskScreen';
import AnswersScreen from './screens/AnswersScreen';
import BosquesScreen from './screens/BosquesScreen';
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
import StudentCamera from './screens/StudentCamera';
import StudentScreen from './screens/StudentScreen';
import ChineseScreen from './screens/ChineseScreen';

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
import TeacherOldQuestionsScreen from './screens/teachers/TeacherOldQuestionsScreen';
import TeacherWatchNewScreen from './screens/teachers/TeacherWatchNewScreen';
import TeacherAnswerDetailsScreen from './screens/teachers/TeacherAnswerDetailsScreen';
import TeacherAnswerScreen from './screens/teachers/TeacherAnswerScreen';
import TeacherStudentsScreen from './screens/teachers/TeacherStudentsScreen';
import TeacherProfileScreen from './screens/teachers/TeacherProfileScreen';
import TeacherStudentsBySubjectScreen from './screens/teachers/TeacherStudentsBySubjectScreen';
import TeacherAddStudentToSubjectScreen from './screens/teachers/TeacherAddStudentToSubjectScreen';

import SchoolAdminLoginScreen from './screens/schoolAdmin/SchoolAdminLoginScreen';
import SchoolAdminRegisterScreen from './screens/schoolAdmin/SchoolAdminRegisterScreen';
import SchoolAdminProfileScreen from './screens/schoolAdmin/SchoolAdminProfileScreen';
import SchoolAdminRegisterSchoolScreen from './screens/schoolAdmin/SchoolAdminRegisterSchoolScreen';
import SchoolAdminMySchoolsScreen from './screens/schoolAdmin/SchoolAdminMySchoolsScreen';
import SchoolAdminCreateSubjectScreen from './screens/schoolAdmin/SchoolAdminCreateSubjectScreen';
import SchoolAdminMySubjectsScreen from './screens/schoolAdmin/SchoolAdminMySubjectsScreen';
import SchoolAdminEditSubjectScreen from './screens/schoolAdmin/SchoolAdminEditSubjectScreen';
import SchoolAdminTeacherInviteScreen from './screens/schoolAdmin/SchoolAdminTeacherInviteScreen';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />} >
            <Route index={true} path="/" element={<HomeScreen />} />   
            <Route path="/exam" element={<HomeScreen />} />
            <Route path="/examen" element={<HomeScreen />} />
            <Route  path="/subjects/:id" element={<HomeScreen />} />
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/register" element={<RegisterScreen />} />
            <Route  path="/ask" element={<AskScreen />} />
            <Route  path="/answers" element={<AnswersScreen />} />
            <Route  path="/bosques" element={<BosquesScreen />} />
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
            <Route  path="/french" element={<FrenchScreen />} />
            <Route  path="/studentcamera" element={<StudentCamera />} />
            <Route  path="/studentscreen" element={<StudentScreen />} />
            <Route  path="/chinese" element={<ChineseScreen />} />





            <Route  path="/teachers/login" element={<TeacherLoginScreen />} />
            <Route  path="/teachers/register" element={<TeacherRegisterScreen />} />
            <Route  path="/teachers/bookupload" element={<TeacherBookUploadScreen />} />
            <Route  path="/teachers/newquestions" element={<TeacherNewQuestionsScreen />} />
            <Route  path="/teachers/subjects" element={<TeacherSubjectsScreen />} />
            <Route  path="/teachers/subjects/:id/edit" element={<TeacherEditSubjectScreen />} />
            <Route  path="/teachers/oldquestions" element={<TeacherOldQuestionsScreen />} />
            <Route  path="/teachers/watchnew" element={<TeacherWatchNewScreen />} />
            <Route  path="/teachers/answerdetails" element={<TeacherAnswerDetailsScreen />} />
            <Route  path="/teachers/answer" element={<TeacherAnswerScreen />} />
            <Route  path="/teachers/profile" element={<TeacherProfileScreen />} />
            <Route  path="/teachers/students/:id" element={<TeacherStudentsScreen />} />
            <Route  path="/teachers/students" element={<TeacherStudentsBySubjectScreen />} />
            <Route  path="/teachers/students/:id/addstudent" element={<TeacherAddStudentToSubjectScreen />} />

            <Route  path="/schooladmins/login" element={<SchoolAdminLoginScreen />} />
            <Route  path="/schooladmins/register" element={<SchoolAdminRegisterScreen />} />
            <Route  path="/schooladmins/profile" element={<SchoolAdminProfileScreen />} />
            <Route  path="/schooladmins/registerschool" element={<SchoolAdminRegisterSchoolScreen />} />
            <Route  path="/schooladmins/myschools" element={<SchoolAdminMySchoolsScreen />} />
            <Route  path="/schooladmins/createsubject" element={<SchoolAdminCreateSubjectScreen />} />
            <Route  path="/schooladmins/mysubjects" element={<SchoolAdminMySubjectsScreen />} />
            <Route  path="/schooladmins/editsubject/:id" element={<SchoolAdminEditSubjectScreen />} />
            <Route
                path="/schooladmins/teacherinvite/:id"
                element={<SchoolAdminTeacherInviteScreen />}
            />
        </Route>
    )
);

export default router;