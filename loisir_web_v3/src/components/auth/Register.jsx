import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser, registerEntreprise } from "../../services/authService";

//import "../../assets/css/bootstrap.min.css";
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

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        numTelU: "",
        email: "",
        password: "",
        passwordConfirm: "",
        userType: "user"
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

// ...existing code...
const handleRegister = async (e) => {
    e.preventDefault();
    try {
        const registerFunction = formData.userType === "user" ? registerUser : registerEntreprise;
        // Correction ici : mappe les champs pour le backend
        const dataToSend = {
            ...formData,
            first_name: formData.firstName,
            last_name: formData.lastName,
            password_confirmation: formData.passwordConfirm,
        };
        // Supprime les champs inutiles
        delete dataToSend.firstName;
        delete dataToSend.lastName;
        delete dataToSend.passwordConfirm;

        await registerFunction(dataToSend);
        navigate("/login");
    } catch (error) {
        console.error("Registration failed", error);
    }

};

    return (
        <section className="pt-50 pb-50 section-bg-23">
        <div className="container">
            <div className="row">
                <div className="col-lg-12">
                    <div className="login-form-bhouse">
                   <img src={logo1} alt="LoisirHub Logo" className="logo login-logo" />
                        <div className="login-register-form-head">
                            <h2>Register Account</h2>
                            <div className="user-type-selector mb-3">
                                <div className="form-check form-check-inline">
                                    <input
                                        type="radio"
                                        id="userRadio"
                                        name="userType"
                                        value="user"
                                        checked={formData.userType === "user"}
                                        onChange={handleChange}
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
                                        checked={formData.userType === "entreprise"}
                                        onChange={handleChange}
                                        className="form-check-input"
                                    />
                                    <label className="form-check-label" htmlFor="entrepriseRadio">Enterprise</label>
                                </div>
                            </div>
                        </div>
                        <div className="login-register-form-middle">
                            <form onSubmit={handleRegister}>
                                <div className="single-input">
                                    <label htmlFor="firstName">First Name</label>
                                    <input 
                                        type="text" 
                                        name="firstName" 
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First Name"
                                    />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="lastName">Last Name</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last Name"
                                    />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="numTelU">Phone Number</label>
                                    <input 
                                        type="tel" 
                                        name="numTelU"
                                        value={formData.numTelU}
                                        onChange={handleChange}
                                        placeholder="Phone Number"
                                    />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="email">Email</label>
                                    <input 
                                        type="email" 
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="Email"
                                    />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="password">Password</label>
                                    <input 
                                        type="password" 
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="Password"
                                    />
                                </div>
                                <div className="single-input">
                                    <label htmlFor="passwordConfirm">Confirm Password</label>
                                    <input 
                                        type="password" 
                                        name="passwordConfirm"
                                        value={formData.passwordConfirm}
                                        onChange={handleChange}
                                        placeholder="Confirm Password"
                                    />
                                </div>
                                <div className="single-input">
                                    <button type="submit" className="button-1">Register</button>
                                </div>
                            </form>
                        </div>
                            <div className="login-register-from-btom text-center">
                                <p className="text-dark mb-0">Already have an account?<a href="/login" className="text-primary ml-1">Sign In</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Register;