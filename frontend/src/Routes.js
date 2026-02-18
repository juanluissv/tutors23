import { 
    createBrowserRouter, 
    createRoutesFromElements,
    Route
} from 'react-router-dom';
import App from './App';
import HomeScreen from './screens/HomeScreen';
import AskScreen  from './screens/AskScreen';

const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<App />} >
            <Route index={true} path="/" element={<HomeScreen />} />    
            <Route  path="/subjects/:id" element={<HomeScreen />} />
            <Route  path="/ask" element={<AskScreen />} />
        </Route>
    )
);

export default router;