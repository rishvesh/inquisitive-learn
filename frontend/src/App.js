import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import ResponsePage from './pages/ResponsePage';
import ViewFolderPage from './pages/ViewFolderPage';
import PublicFoldersPage from './pages/PublicFoldersPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import { AuthProvider } from './authContext';
import { ProtectedRoute } from './ProtectedRoute';

function App() {
    return (
        <Router>
           <AuthProvider>
               <Routes>
                   <Route path="/login" element={<LoginPage />} />
                   <Route path="/register" element={<RegisterPage />} />
                   <Route
                       path="/"
                       element={
                           <ProtectedRoute>
                               <HomePage />
                           </ProtectedRoute>
                       }
                   />
                    <Route
                       path="/upload"
                        element={
                           <ProtectedRoute>
                               <UploadPage />
                           </ProtectedRoute>
                        }
                    />
                      <Route
                       path="/response"
                        element={
                           <ProtectedRoute>
                               <ResponsePage />
                           </ProtectedRoute>
                       }
                    />
                   <Route
                       path="/view_folder/:id"
                        element={
                           <ProtectedRoute>
                           <ViewFolderPage />
                          </ProtectedRoute>
                       }
                   />
                  <Route
                       path="/public_folders"
                        element={
                          <ProtectedRoute>
                           <PublicFoldersPage />
                          </ProtectedRoute>
                        }
                   />
                   <Route
                       path="/change_password"
                        element={
                          <ProtectedRoute>
                          <ChangePasswordPage />
                          </ProtectedRoute>
                        }
                   />
                </Routes>
            </AuthProvider>
        </Router>
    );
}

export default App;