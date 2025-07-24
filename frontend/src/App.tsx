import { BrowserRouter, Route, Routes } from 'react-router-dom';
import React from "react";

import { Play } from './smallComponents/Play';
import { ChessComponentAi } from './components/ChessComponentAi';


import { RecoilRoot } from 'recoil';
import { ChessComponent } from './components/ChessComponent';
import { OAuthSuccess } from './smallComponents/OAuthSuccess';
import { Signup } from './smallComponents/Signup';
import { Dashboard } from './components/Dashboard';


function App() {
  return (
    <RecoilRoot>
      <BrowserRouter>
        <Routes>
          
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/oauth-success" element={<OAuthSuccess />} /> 
          <Route path="/chessgame" element={<Play />} />
          <Route path="/chessgame/signup" element={<Signup />} />
          <Route path="/chessgame/start" element={<ChessComponentAi />} />
          <Route path="/chessgame/start/friend" element={<ChessComponent />} />
        </Routes>
      </BrowserRouter>
    </RecoilRoot>
  );
}

export default App;
