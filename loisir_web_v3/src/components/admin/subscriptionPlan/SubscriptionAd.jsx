import React, { useState, useEffect } from 'react';
import { getAllSubscriptionsForAdmin } from '../../../services/subscriptionService';
import { getAllEntreprises } from '../../../services/entrepriseService';
import { getAllSubscriptionPlans } from '../../../services/subscriptionPlanService';
import { ToastContainer, toast } from 'react-toastify';
import FilterComponent from '../shared/FilterComponent';

const SubscriptionAd = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [entreprises, setEnterprises] = useState([]);
  const [plans, setPlans] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    payment_status: '',
    entreprise: '',
    plan: '',
    date_from: '',
    date_to: ''
  });

  useEffect(() => {
    loadData();
  }, []);
  useEffect(() => {
    if (subscriptions.length > 0) {
      applyFilters();
    }
  }, [filters, subscriptions]);

  //v2.0
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [entreprisesData, plansData, subscriptionsData] = await Promise.all([
        getAllEntreprises(),
        getAllSubscriptionPlans(),
        getAllSubscriptionsForAdmin()
      ]);

      console.log('Loaded Data:', {
        entreprises: entreprisesData,
        plans: plansData,
        subscriptions: subscriptionsData?.subscriptions?.data
      });

      setEnterprises(entreprisesData || []);
      setPlans(plansData || []);
      setSubscriptions(subscriptionsData?.subscriptions?.data || []);
      setFilteredSubscriptions(subscriptionsData?.subscriptions?.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };
  //v1.0
  // const loadData = async () => {
  //   try {
  //     setIsLoading(true);
  //     const [entreprisesData, plansData, subscriptionsData] = await Promise.all([
  //       getAllEntreprises(),
  //       getAllSubscriptionPlans(),
  //       getAllSubscriptionsForAdmin()
  //     ]);

  //     setEnterprises(entreprisesData || []);
  //     setPlans(plansData || []);
  //     setSubscriptions(subscriptionsData?.subscriptions?.data || []);
  //   } catch (error) {
  //     console.error('Error loading data:', error);
  //     toast.error('Failed to load data');
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  //v3.0
  const applyFilters = () => {
    let result = [...subscriptions];

    // Debug initial data
    console.log('Initial subscriptions:', result);

    if (filters.entreprise) {
      console.log('Filtering by entreprise:', filters.entreprise);
      result = result.filter(sub => {
        // Vérifier si l'entreprise existe
        if (!sub || !sub.entreprise_id) return false;
        console.log(`Comparing entreprise: ${sub.entreprise_id} with filter: ${filters.entreprise}`);
        return String(sub.entreprise_id) === String(filters.entreprise);
      });
      console.log('After entreprise filter:', result);
    }

    if (filters.plan) {
      console.log('Filtering by plan:', filters.plan);
      result = result.filter(sub => {
        // Vérifier si le plan existe
        if (!sub || !sub.plan_id) return false;
        console.log(`Comparing plan: ${sub.plan_id} with filter: ${filters.plan}`);
        return String(sub.plan_id) === String(filters.plan);
      });
      console.log('After plan filter:', result);
    }

    if (filters.status) {
      result = result.filter(sub => sub.status === filters.status);
      console.log('After status filter:', result);
    }

    if (filters.payment_status) {
      result = result.filter(sub => sub.payment_status === filters.payment_status);
      console.log('After payment status filter:', result);
    }

    setFilteredSubscriptions(result);
  };
  //v2.0
  //   const applyFilters = () => {
  //     let result = [...subscriptions];

  //     if (filters.entreprise) {
  //         console.log('Filtering by entreprise:', filters.entreprise);
  //         result = result.filter(sub => {
  //             console.log('Subscription entreprise_id:', sub.entreprise_id);
  //             return sub.entreprise_id.toString() === filters.entreprise.toString();
  //         });
  //     }

  //     if (filters.plan) {
  //         console.log('Filtering by plan:', filters.plan);
  //         result = result.filter(sub => {
  //             console.log('Subscription plan_id:', sub.plan_id);
  //             return sub.plan_id.toString() === filters.plan.toString();
  //         });
  //     }

  //     if (filters.status) {
  //         result = result.filter(sub => sub.status === filters.status);
  //     }

  //     if (filters.payment_status) {
  //         result = result.filter(sub => sub.payment_status === filters.payment_status);
  //     }

  //     console.log('Filtered results:', result);
  //     setFilteredSubscriptions(result);
  // };

  //v1.0
  // const applyFilters = () => {
  //   let filteredResults = [...subscriptions];

  //   if (filters.entreprise) {
  //     filteredResults = filteredResults.filter(
  //       sub => sub.entreprise?.id.toString() === filters.entreprise
  //     );
  //   }

  //   if (filters.plan) {
  //     filteredResults = filteredResults.filter(
  //       sub => sub.plan?.id.toString() === filters.plan
  //     );
  //   }

  //   if (filters.status) {
  //     filteredResults = filteredResults.filter(
  //       sub => sub.status === filters.status
  //     );
  //   }

  //   if (filters.payment_status) {
  //     filteredResults = filteredResults.filter(
  //       sub => sub.payment_status === filters.payment_status
  //     );
  //   }

  //   setFilteredSubscriptions(filteredResults);
  // };
  // const loadData = async () => {
  //   try {
  //     const [entreprisesData, plansData] = await Promise.all([
  //       getAllEntreprises(),
  //       getAllSubscriptionPlans()
  //     ]);

  //     setEnterprises(entreprisesData || []);
  //     setPlans(plansData || []);
  //   } catch (error) {
  //     console.error('Error loading data:', error);
  //     toast.error('Failed to load data');
  //   }
  // };

  const loadSubscriptions = async () => {
    setIsLoading(true);
    try {
      const data = await getAllSubscriptionsForAdmin(filters);
      if (data && data.subscriptions) {
        setSubscriptions(data.subscriptions.data);
      }
    } catch (error) {
      console.error('Error loading subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setIsLoading(false);
    }
  };

  const filterConfig = [
    {
      name: 'entreprise',
      label: 'Enterprise',
      options: Array.isArray(entreprises) ? entreprises.map(ent => ({
        value: ent.id.toString(),
        label: ent.nomE
      })) : []
    },
    {
      name: 'plan',
      label: 'Plan',
      options: Array.isArray(plans) ? plans.map(plan => ({
        value: plan.id.toString(),
        label: plan.name
      })) : []
    },
    {
      name: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'cancelled', label: 'Cancelled' }
      ]
    },
    {
      name: 'payment_status',
      label: 'Payment Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'completed', label: 'Completed' },
        { value: 'failed', label: 'Failed' }
      ]
    }
  ];

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };


  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{ color: '#4A7C87' }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{ color: '#4A7C87' }}>
              Home
            </a>
          </li>
          <li className="breadcrumb-item" aria-current="page">
            Subscriptions
          </li>
        </ol>
      </div>

      <FilterComponent
        filters={filterConfig}
        onFilterChange={handleFilterChange}
      />

      <div className="row gx-3">
        <div className="col-xxl-12">
          <div className="card mb-3">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle table-hover m-0">
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Enterprise Name</th>
                      <th scope="col">Plan Name</th>
                      <th scope="col">Start Date</th>
                      <th scope="col">End Date</th>
                      <th scope="col">Status</th>
                      <th scope="col">Payment Status</th>
                      <th scope="col">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSubscriptions.length > 0 ? (
                      filteredSubscriptions.map((subscription) => (
                        <tr key={subscription.id}>
                          <td>{subscription.id}</td>
                          <td>{subscription.entreprise?.nomE || 'N/A'}</td>
                          <td>{subscription.plan?.name || 'N/A'}</td>
                          <td>{formatDate(subscription.start_date)}</td>
                          <td>{formatDate(subscription.end_date)}</td>
                          <td>
                            <span className={`badge border border-${subscription.status === 'active' ? 'success' :
                              subscription.status === 'inactive' ? 'warning' : 'danger'} 
                              text-${subscription.status === 'active' ? 'success' :
                                subscription.status === 'inactive' ? 'warning' : 'danger'}`}>
                              {subscription.status}
                            </span>
                          </td>
                          <td>
                            <span className={`badge border border-${subscription.payment_status === 'completed' ? 'success' :
                              subscription.payment_status === 'pending' ? 'warning' : 'danger'} 
                              text-${subscription.payment_status === 'completed' ? 'success' :
                                subscription.payment_status === 'pending' ? 'warning' : 'danger'}`}>
                              {subscription.payment_status}
                            </span>
                          </td>
                          <td>{subscription.amount_paid} TND</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center">No subscriptions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionAd;