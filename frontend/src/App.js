import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';

const App = () => {
  return (
    <>
      <main className='py-3'>
        <Container fluid>
          <Outlet />
        </Container>
      </main>
      <ToastContainer />
    </>
  )
}

export default App