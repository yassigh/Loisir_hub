//src/components/auth/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { loginUser, loginEntreprise,validateToken } from '../../services/authService';

import { Link } from "react-router-dom";
import "../../assets/css/bootstrap.min.css.map";
import "../../assets/css/bootstrap-icons.css";
import "../../assets/css/fontawesome.all.min.css";
import "../../assets/css/owl.carousel.min.css";
import "../../assets/css/owl.theme.default.min.css";
import "../../assets/css/lightcase.css";
import "../../assets/css/nice-select.css";
import "../../assets/css/animate.css";
import "../../assets/css/normalize.css";
import "../../style.css";
import "../../assets/css/responsive.css";
import logo1 from '../../images/logo_1.png';
import "./login.css"
const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userType, setUserType] = useState('user');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

//v3.0
const handleLogin = async (e) => {
  e.preventDefault();
  setError('');
  
  try {
    const response = await login({
      email,
      password,
      userType
    });

    // Redirect based on user type
    if (response.user.role === 'admin') {
      navigate('/admin/categoriesAd');
    } else if (response.user.type === 'entreprise') {
      navigate('/enterprise/activitiesEn');
    } else {
      navigate('/');
    }
  } catch (error) {
    setError(error.message || 'Login failed');
    console.error("Login failed", error);
  }
};
//v2.0 marche correctemenet 
// const handleLogin = async (e) => {
//     e.preventDefault();
//     setError('');
  
//     try {
//       const loginFunction = userType === "user" ? loginUser : loginEntreprise;
//       const response = await loginFunction({ email, password });
  
//       if (!response.token) {
//         throw new Error('No authentication token received');
//       }
  
//       // Appeler la fonction login du contexte
//       login({
//         token: response.token,
//         type: response.user.type || response.user.role,
//         ...response.user
//       });
  
//       // Redirection
//       if (response.user.role === 'admin') {
//         navigate('/admin/categoriesAd');
//       } else if (response.user.type === 'entreprise') {
//         navigate('/enterprise/activitiesEn');
//       } else {
//         navigate('/');
//       }
//     } catch (error) {
//       setError(error.message || 'Login failed. Please try again.');
//       console.error("Login failed", error);
//     }
//   };


//v1.0
// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [userType, setUserType] = useState('user');
//     const [error, setError] = useState('');
//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError('');
        
//         try {
//             const loginFunction = userType === "user" ? loginUser : loginEntreprise;
//             const response = await loginFunction({ email, password });
            
//             // Vérifier le type d'utilisateur pour la redirection
//             let destination;
//             if (response.user.type === 'admin') {
//                 destination = "/admin/categoriesAd";
//             } else if (response.user.type === 'entreprise') {
//                 destination = "/enterprise/activitiesEn";
//             } else {
//                 destination = "/"; // Pour les utilisateurs normaux
//             }
    
//             await login(response.user);
            
//             if (response.token) {
//                 navigate(destination);
//             }
//         } catch (error) {
//             setError(error.message || 'Login failed. Please try again.');
//             console.error("Login failed", error);
//         }
//     };

    // const handleLogin = async (e) => {
    //     e.preventDefault();
    //     setError('');
        
    //     try {
    //         const loginFunction = userType === "user" ? loginUser : loginEntreprise;
    //         const response = await loginFunction({ email, password });
            
    //         await login(response.user);
            
    //         if (response.token) {
    //             const destination = userType === "user" ? "/admin/categoriesAd" : "/enterprise/activitiesEn";
    //             navigate(destination);
    //         }
    //     } catch (error) {
    //         setError(error.message || 'Login failed. Please try again.');
    //         console.error("Login failed", error);
    //     }
    // };

        return (
            <div className="login-form-bhouse">
            
               <img src={logo1} alt="LoisirHub Logo" className="logo login-logo" />
                <div className="login-register-form-head">
                    <h2>Sign In</h2>
                    <div className="user-type-selector">
                        <div className="form-check form-check-inline">
                           <input
                            type="radio"
                            id="userRadio"
                            name="userType"
                            value="user"
                            checked={userType === "user"}
                            onChange={(e) => setUserType(e.target.value)}
                            className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="userRadio">User</label>
                    </div>
                    <div className="form-check form-check-inline">
                        <input
                            type="radio"
                            id="entrepriseRadio"
                            name="userType"
                            value="entreprise"
                            checked={userType === "entreprise"}
                            onChange={(e) => setUserType(e.target.value)}
                            className="form-check-input"
                        />
                        <label className="form-check-label" htmlFor="entrepriseRadio">Enterprise</label>
                   
                </div>
            </div>
                <div className="login-register-form-middle">
                    <form onSubmit={handleLogin}>
                        <div className="single-input">
                            <label htmlFor="email">Email</label>
                            <input type="email" name="email" id="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="single-input">
                            <label htmlFor="password">Password</label>
                            <input type="password" name="password" id="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="single-input checkbox">
                            <input type="checkbox" name="rememberme" id="rememberme" />
                            <label className="rememberme" htmlFor="rememberme">Remember me</label>
                        </div>
                        <div className="single-input">
                            <button type="submit" className="button-1">Log In</button>
                        </div>
                    </form>
                </div>
                <div className="login-register-from-btom text-center">
                <p className="mb-2">
          <Link to="/auth/forgetPassword">Forget Password</Link>
        </p>
                    <p className="text-dark">Don't have account?<a href="/register" className="text-primary ml-1">Sign UP</a></p>
                </div>  </div>
            </div>
        );
};

export default Login;




// const Login = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [userType, setUserType] = useState('user');
//     const [error, setError] = useState('');
//     const { login } = useAuth();
//     const navigate = useNavigate();

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         setError('');
        
//         try {
//             const loginFunction = userType === "user" ? loginUser : loginEntreprise;
//             const response = await loginFunction({ email, password });
            
//             await login(response.user);
            
//             if (response.token) {
//                 const destination = userType === "user" ? "/admin/categoriesAd" : "/enterprise/activitiesEn";
//                 navigate(destination);
//             }
//         } catch (error) {
//             setError(error.message || 'Login failed. Please try again.');
//             console.error("Login failed", error);
//         }
//     };

//     return (
//         <div className="login-form-bhouse">
//             <div className="login-register-form-head">
//                 <h2>Sign In</h2>
//                 {error && <div className="alert alert-danger">{error}</div>}
                
//                 <div className="user-type-selector mb-3">
//                     <div className="form-check form-check-inline">
//                         <input
//                             type="radio"
//                             id="userRadio"
//                             name="userType"
//                             value="user"
//                             checked={userType === 'user'}
//                             onChange={(e) => setUserType(e.target.value)}
//                             className="form-check-input"
//                         />
//                         <label className="form-check-label" htmlFor="userRadio">
//                             User
//                         </label>
//                     </div>
//                     <div className="form-check form-check-inline">
//                         <input
//                             type="radio"
//                             id="entrepriseRadio"
//                             name="userType"
//                             value="entreprise"
//                             checked={userType === 'entreprise'}
//                             onChange={(e) => setUserType(e.target.value)}
//                             className="form-check-input"
//                         />
//                         <label className="form-check-label" htmlFor="entrepriseRadio">
//                             Enterprise
//                         </label>
//                     </div>
//                 </div>

//                 <form onSubmit={handleLogin}>
//                     <div className="form-group">
//                         <input
//                             type="email"
//                             className="form-control"
//                             placeholder="Email"
//                             value={email}
//                             onChange={(e) => setEmail(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <div className="form-group">
//                         <input
//                             type="password"
//                             className="form-control"
//                             placeholder="Password"
//                             value={password}
//                             onChange={(e) => setPassword(e.target.value)}
//                             required
//                         />
//                     </div>
//                     <button type="submit" className="btn btn-primary">
//                         Sign In
//                     </button>
//                 </form>
//             </div>
//         </div>
//     );
// };

// export default Login;