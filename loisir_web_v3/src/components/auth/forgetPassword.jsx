import { useState } from "react";
import { authApi } from "../../services/api";
import { useNavigate } from "react-router-dom";
import logo1 from '../../images/logo_1.png';

const ForgetPassword = () => {
    const [email, setEmail] = useState("");
    const [resetCode, setResetCode] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [step, setStep] = useState(1);
    const [userType, setUserType] = useState("user");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const navigate = useNavigate();

    // Étape 1 : Envoi du code
    const handleSendResetCode = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            const endpoint = userType === "user"
                ? "/user/forgot-password"
                : "/entreprise/forgot-password";
            await authApi.post(endpoint, { email });
            setSuccess("Un code de réinitialisation a été envoyé à votre email.");
            setStep(2);
        } catch (error) {
            setError("Erreur lors de l'envoi du code. Vérifiez votre email.");
        }
    };

    // Étape 2 : Vérification du code
    const handleVerifyResetCode = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            const endpoint = userType === "user"
                ? "/user/verify-reset-code"
                : "/entreprise/verify-reset-code";
            await authApi.post(endpoint, { email, reset_code: resetCode });
            setSuccess("Code vérifié. Veuillez saisir un nouveau mot de passe.");
            setStep(3);
        } catch (error) {
            setError("Code invalide ou expiré.");
        }
    };

    // Étape 3 : Réinitialisation du mot de passe
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError(""); setSuccess("");
        try {
            const endpoint = userType === "user"
                ? "/user/reset-password"
                : "/entreprise/reset-password";
            await authApi.post(endpoint, {
                email,
                reset_code: resetCode,
                password,
                password_confirmation: passwordConfirm,
            });
            setSuccess("Mot de passe réinitialisé avec succès !");
            setTimeout(() => navigate("/login"), 1500);
        } catch (error) {
            setError("Erreur lors de la réinitialisation. Vérifiez les champs.");
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
                                <h2>Mot de passe oublié</h2>
                                <div className="user-type-selector mb-3">
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
                                        <label className="form-check-label" htmlFor="userRadio">
                                            Utilisateur
                                        </label>
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
                                        <label className="form-check-label" htmlFor="entrepriseRadio">
                                            Entreprise
                                        </label>
                                    </div>
                                </div>
                                {error && <div className="alert alert-danger">{error}</div>}
                                {success && <div className="alert alert-success">{success}</div>}
                            </div>
                            <div className="login-register-form-middle">
                                {step === 1 && (
                                    <form onSubmit={handleSendResetCode}>
                                        <div className="single-input">
                                            <label htmlFor="email">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                placeholder="Email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="single-input">
                                            <button type="submit" className="button-1">
                                                Envoyer le code
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {step === 2 && (
                                    <form onSubmit={handleVerifyResetCode}>
                                        <div className="single-input">
                                            <label htmlFor="resetCode">Code reçu par email</label>
                                            <input
                                                type="text"
                                                name="resetCode"
                                                id="resetCode"
                                                placeholder="Code"
                                                value={resetCode}
                                                onChange={(e) => setResetCode(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="single-input">
                                            <button type="submit" className="button-1">
                                                Vérifier le code
                                            </button>
                                        </div>
                                    </form>
                                )}
                                {step === 3 && (
                                    <form onSubmit={handleResetPassword}>
                                        <div className="single-input">
                                            <label htmlFor="password">Nouveau mot de passe</label>
                                            <input
                                                type="password"
                                                name="password"
                                                id="password"
                                                placeholder="Nouveau mot de passe"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="single-input">
                                            <label htmlFor="passwordConfirm">Confirmer le mot de passe</label>
                                            <input
                                                type="password"
                                                name="passwordConfirm"
                                                id="passwordConfirm"
                                                placeholder="Confirmer le mot de passe"
                                                value={passwordConfirm}
                                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="single-input">
                                            <button type="submit" className="button-1">
                                                Réinitialiser le mot de passe
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ForgetPassword;