import React, { useState, useEffect } from 'react';
import { getEnterpriseClients } from '../../../services/ReservationService';
import { toast } from 'react-toastify';

const ClientEn = () => {
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      const response = await getEnterpriseClients();
      if (response.status === 'success' && Array.isArray(response.reservations)) {
        // Create a unique list of clients from reservations
        const uniqueClients = [...new Map(
          response.reservations.map(reservation => [
            reservation.user.id,
            {
              id: reservation.user.id,
              name: reservation.user.name,
              email: reservation.user.email,
              phone: reservation.user.numTelU,
              totalReservations: 0,
              totalSpent: 0,
              lastReservation: null
            }
          ])
        ).values()];

        // Calculate statistics for each client
        uniqueClients.forEach(client => {
          const clientReservations = response.reservations.filter(
            reservation => reservation.user.id === client.id
          );
          
          client.totalReservations = clientReservations.length;
          client.totalSpent = clientReservations.reduce(
            (sum, res) => sum + parseFloat(res.montant), 0
          );
          client.lastReservation = clientReservations.reduce(
            (latest, res) => !latest || new Date(res.dateCreationReservation) > new Date(latest) 
              ? res.dateCreationReservation 
              : latest,
            null
          );
        });

        setClients(uniqueClients);
      }
    } catch (error) {
      toast.error('Failed to load clients');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginLeft: '10px' }}>
      <div className="app-hero-header d-flex align-items-start">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <i className="bi bi-house lh-1" style={{ color: '#4a7c87' }}></i>
            <a href="index-2.html" className="text-decoration-none" style={{ color: '#4a7c87' }}>
              Home
            </a>
          </li>
          <li className="breadcrumb-item" aria-current="page">Clients</li>
        </ol>
      </div>

      <div className="row gx-3">
        <div className="col-12">
          <div className="card mb-3">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table align-middle table-hover">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Total Reservations</th>
                      <th>Total Spent</th>
                      <th>Last Reservation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clients.map((client) => (
                      <tr key={client.id}>
                        <td>{client.name}</td>
                        <td>{client.email}</td>
                        <td>{client.phone}</td>
                        <td>{client.totalReservations}</td>
                        <td>{client.totalSpent.toFixed(2)} TND</td>
                        <td>{new Date(client.lastReservation).toLocaleDateString()}</td>
                      </tr>
                    ))}
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

export default ClientEn;