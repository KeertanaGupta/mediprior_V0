// // src/App.js
import React from 'react';
import Signup from './pages/Signup'; // Import your new page
import Container from 'react-bootstrap/Container';

function App() {
  return (
    // We'll use a container for a nice gray background and padding
    <Container fluid style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', paddingTop: '20px' }}>
      
      {/* For now, we'll just show the Signup page.
          Later, we'll use react-router-dom here
          to show the Login page, Dashboard, etc.
      */}
      <Signup />

    </Container>
  );
}

export default App;