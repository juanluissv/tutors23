import '../App.css';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useGetChatMutation } from '../slices/chatSlice';

// Icon URLs from Figma
const imgVector = "https://www.figma.com/api/mcp/asset/723162b6-de90-4133-b1f8-eede50d70e47";
const imgVector2 = "https://www.figma.com/api/mcp/asset/233ff404-949d-499e-b272-47afd90ec4c7";
const imgIcon9 = "https://www.figma.com/api/mcp/asset/f97f23f3-6aa1-4800-886e-0d66f48f67ed";

function App() {


    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");


    const [getChat, { isLoading }] = useGetChatMutation();

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const res = await getChat({ question });
            console.log(res);
            setAnswer(res.data.message);
        } catch (error) {
            console.error(error);
        }
    }





  return (
    <div className="chat-app">
      {/* Get Plus Button */}
      {/* <button className="get-plus-button">
        <img src={imgIcon10} alt="" />
        <span>Get Plus</span>
      </button> */}

      <div className="main-container">
        <Sidebar />

        {/* Main Content */}
        <div className="main-content">
          <Header />

          <div className="content-area">
            <div className="center-content">
              <h1 className="main-heading">What would you like to learn today?</h1>

              <div className="input-container">
                <button className="icon-button">
                  {/* <img src={imgVector} alt="Add" /> */}
                </button>
                <input
                  type="text"
                  className="input-field"
                  placeholder="Ask anything"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                />
                {/* <button className="icon-button">
                  <img src={imgVector2} alt="Attach" />
                </button> */}
                <button className="send-button" onClick={submitHandler}>
                  <img src={imgIcon9} alt="Send" />
                </button>
              </div>

              <p className="footer-text">
                {answer}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
