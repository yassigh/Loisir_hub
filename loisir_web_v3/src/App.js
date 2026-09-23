//src/app.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// Admin imports
import HeaderAd from './components/admin/header/HeaderAd';
import SidebarAd from './components/admin/sidebar/SidebarAd';
import MainContentAd from './components/admin/MainContentAd';
import FooterAd from './components/admin/FooterAd';
import AddCategoryAd from './components/admin/categorie/AddCategoryAd';
import CategoryListAd from './components/admin/categorie/CategoryListAd';
import ActivityListAd from './components/admin/activity/ActivityListAd';
import EventListAd from './components/admin/event/EventListAd';
import PostListAd from './components/admin/poste/PostListAd';
import EditCategoryAd from './components/admin/categorie/EditCategoryAd';
//profile Admin
import ProfileAd from './components/admin/Profile/ProfileAd';
import SettingAd from './components/admin/Profile/SettingAd';
//users and entreprises
import UsersAd from './components/admin/users/UsersAd';
import EntreprisesAd from './components/admin/entreprises/EntreprisesAd';
//Dashboard and analytics admin
import DashboardAd from './components/admin/dashboard/DashboardAd';

//reservations admin
import ReservationsAd from './components/admin/reservations/ReservationsAd';
//subscription plan
import AddSubscriptionPlanAd from './components/admin/subscriptionPlan/AddSubscriptionPlanAd';
import EditSubscriptionPlanAd from './components/admin/subscriptionPlan/EditSubscriptionPlanAd';
import SubscriptionPlanListAd from './components/admin/subscriptionPlan/SubscriptionPlanListAd';
//centre d'interet
import CentreInteretAd from './components/admin/centres/CentreInteretAd';



// Enterprise imports
import HeaderEn from './components/entreprise/header/HeaderEn';
import SidebarEn from './components/entreprise/sidebar/SidebarEn';
import MainContentEn from './components/entreprise/MainContentEn';
import FooterEn from './components/entreprise/FooterEn';

import AddActivityEn from './components/entreprise/activity/AddActivityEn';
import AddEventEn from './components/entreprise/event/AddEventEn';
import AddPostEn from './components/entreprise/post/AddPostEn';
import CategoryListEn from './components/entreprise/categorie/CategoryListEn';
import ActivityListEn from './components/entreprise/activity/ActivityListEn';
import EventListEn from './components/entreprise/event/EventListEn';
import PostListEn from './components/entreprise/post/PostListEn';
import EditActivityEn from './components/entreprise/activity/EditActivityEn';
import EditEventEn from './components/entreprise/event/EditEventEn';
import EditPostEn from './components/entreprise/post/EditPostEn';
import ImageManagement from './components/entreprise/shared/ImageManagement';
import AddAdverEn from './components/entreprise/advertisement/AddAdverEn';
import EditAdverEn from './components/entreprise/advertisement/EditAdverEn';

//subscription
import SubscriptionListEn from './components/entreprise/subscription/SubscriptionListEn';
import SubscriptionPaymentEn from './components/entreprise/subscription/SubscriptionPaymentEn';

//profile Entreprise 
import ProfileEn from './components/entreprise/Profile/ProfileEn';
import SettingEn from './components/entreprise/Profile/SettingEn';
//dashboard and analytics entreprise
import DashboardEn from './components/entreprise/dashboard/DashboardEn';

//reservations entreprise
import ReservationsEn from './components/entreprise/reservations/ReservationsEn';
//clients entreprise
import ClientEn from './components/entreprise/clients/ClientEn';
import AdListAd from './components/admin/advertisement/AdListAd';
import AdListEn from './components/entreprise/advertisement/AdListEn';

//subscription pyement
import PaymentSuccess from './components/payement/subscriptionPayement/PaymentSuccess';
import PaymentFail from './components/payement/subscriptionPayement/PaymentFail';
//info page
import InfoPage from './components/entreprise/shared/InfoPage';
import InfoPageAd from './components/admin/shared/InfoPageAd';
import ForgetPassword from './components/auth/forgetPassword';

//subscription
import SubscriptionAd from './components/admin/subscriptionPlan/SubscriptionAd';
import './styles/assets/css/main.min.css';

//auth
import Login from './components/auth/Login';
import Register from './components/auth/Register';

//home
import Home from './components/user/Home';

//protected route
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import ChatPage from './components/entreprise/Chat/ChatPage'; // Assurez-vous que le chemin est correct
import ChatPageAdmin from './components/admin/Chat/ChatPageAdmin'; // Importez le composant de chat pour l'admin


const AdminLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return (
    <div className="page-wrapper">
      <HeaderAd toggleSidebar={toggleSidebar} />
      <div className="main-container">
        <SidebarAd isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
        <MainContentAd>{children}</MainContentAd>
      </div>
      <FooterAd />
    </div>
  );
};

const EnterpriseLayout = ({ children }) => (
  <div className="page-wrapper">
    <HeaderEn />
    <div className="main-container">
      <SidebarEn />
      <MainContentEn>{children}</MainContentEn>
    </div>
    <FooterEn />
  </div>
);

const App = () => {
  return (
    <AuthProvider>
        <div style={{  padding: '10px', textAlign: 'center' }}>
       <br />
          <br />
      </div>
      <Router>
        <Routes>

          {/* public route */}
          {/* Home screen */}
          <Route path="/" element={<Home />} />
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/enterprise/payment/success" element={<PaymentSuccess />} />
          <Route path="/enterprise/payment/fail" element={<PaymentFail />} />
 <Route path="/auth/forgetPassword" element={<ForgetPassword />} />
          {/* Admin Routes */}
          <Route path="/admin/*" element={ // Ajouter /* pour les sous-routes
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout>
                <Routes>
                  <Route path="categories/add" element={<AddCategoryAd />} />
                  <Route path="categoriesAd" element={<CategoryListAd />} />
                  <Route path="categories/edit/:id" element={<EditCategoryAd />} />
                  <Route path="activitiesAd" element={<ActivityListAd />} />
                  <Route path="eventsAd" element={<EventListAd />} />
                  <Route path="postsAd" element={<PostListAd />} />
                  <Route path="advertisementsAd" element={<AdListAd />} />
                  <Route path="/activities/info/:id" element={<InfoPageAd type="activity" />} />
                  <Route path="/events/info/:id" element={<InfoPageAd type="event" />} />
                  <Route path="/posts/info/:id" element={<InfoPageAd type="post" />} />
                  <Route path="/advertisements/info/:id" element={<InfoPageAd type="advertisement" />} />

                  {/* Routes profile */}
                  <Route path="profile" element={<ProfileAd />} />
                  <Route path="settings" element={<SettingAd />} />

                  {/* Routes users and entreprises */}
                  <Route path="usersAd" element={<UsersAd />} />
                  <Route path="entreprisesAd" element={<EntreprisesAd />} />

                  {/* Routes dashboard and analytics */}
                  <Route path="dashboardAd" element={<DashboardAd />} />
                
                  {/* Routes pour les reservation  */}
                  <Route path="ReservationsAd" element={<ReservationsAd />} />

                  {/* Routes pour subscription plan */}
                  <Route path="subscriptionPlans" element={<SubscriptionPlanListAd />} />
                  <Route path="subscriptionPlans/add" element={<AddSubscriptionPlanAd />} />
                  <Route path="subscriptionPlans/edit/:id" element={<EditSubscriptionPlanAd />} />

             <Route path="/subscriptionsEn" element={<SubscriptionAd />} />

                  {/* Routes pour les centre d'interet */}
                  <Route path="/centres-interet" element={<CentreInteretAd />} />

                  <Route path="chat/:conversationId" element={<ChatPageAdmin />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          } />

          {/* Enterprise Routes */}
          <Route path="/enterprise/*" element={ // Ajouter /* pour les sous-routes/enterprise

            <ProtectedRoute allowedRoles={['entreprise']}>
              <EnterpriseLayout>
                <Routes>
                  {/* Routes POST */}
                  <Route path="posts/add" element={<AddPostEn />} />
                  <Route path="posts/edit/:id" element={<EditPostEn />} />
                  <Route path="postsEn" element={<PostListEn />} />
                  <Route path="/posts/info/:id" element={<InfoPage type="post" />} />


                  {/* Routes Activities */}
                  <Route path="activities/add" element={<AddActivityEn />} />
                  <Route path="activities/edit/:id" element={<EditActivityEn />} />
                  <Route path="activitiesEn" element={<ActivityListEn />} />
                  <Route path="/activities/info/:id" element={<InfoPage type="activity" />} />


                  {/* Routes Events */}
                  <Route path="events/add" element={<AddEventEn />} />
                  <Route path="events/edit/:id" element={<EditEventEn />} />
                  <Route path="eventsEn" element={<EventListEn />} />
                  <Route path="/events/info/:id" element={<InfoPage type="event" />} />

                  {/* Routes Advertisement */}
                  <Route path="advertisementsEn" element={<AdListEn />} />
                  <Route path="advertisement/add" element={<AddAdverEn />} />
                  <Route path="advertisement/edit/:id" element={<EditAdverEn />} />
                  <Route path="/advertisements/info/:id" element={<InfoPage type="advertisement" />} />

                  {/* Routes Images */}
                  <Route path="manage-images/:type/:id" element={<ImageManagement />} />
                  {/* Routes Categories */}
                  <Route path="categories" element={<CategoryListEn />} />
                  {/* Routes profile */}
                  <Route path="profile" element={<ProfileEn />} />
                  <Route path="settings" element={<SettingEn />} />
                  {/* Routes dashboard and analytics */}
                  <Route path="dashboardEn" element={<DashboardEn />} />
                 
                  {/* Routes pour les reservation  */}
                  <Route path="ReservationsEn" element={<ReservationsEn />} />
                  {/* Routes pour les clients  */}
                  <Route path="clients" element={<ClientEn />} />
                 {/* Routes pour les subscriptions  */}
                 <Route path="subscriptions" element={<SubscriptionListEn />} />
                  <Route path="subscription/payment/:id" element={<SubscriptionPaymentEn />} />
               
                  {/* Routes pour les payement  subscription */}
                  


                  <Route path="chat/:conversationId" element={<ChatPage />} />
                </Routes>
              </EnterpriseLayout>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
    //   <div className="page-wrapper">    
    // <HeaderAd />
    //   <div className="main-container">
    //     <SidebarAd />
    //     <MainContentAd>{CategoryListAd}</MainContentAd>
    //   </div>
    //   <FooterAd />
    // </div>
  );
};

export default App;