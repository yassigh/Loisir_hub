import { api, authApi } from './api';

class EntrepriseStatsService {
    async getDashboardStats() {
        try {
            const [authStats, loisirsStats] = await Promise.all([
                this.getAuthServiceStats(),
                this.getLoisirsServiceStats()
            ]);

            return {
                payments: {
                    total: authStats.totalPayments || 0,
                    subscriptions: {
                        total: authStats.subscriptionStats?.total || 0,
                        count: authStats.subscriptionStats?.count || 0
                    },
                    publicites: {
                        total: authStats.publiciteStats?.total || 0,
                        count: authStats.publiciteStats?.count || 0
                    }
                },
                activities: {
                    total: loisirsStats.totalActivites || 0,
                    events: loisirsStats.totalEvenements || 0,
                    posts: loisirsStats.totalPostes || 0,
                    ads: loisirsStats.totalPublicites || 0
                },
                reservations: {
                    total: loisirsStats.totalReservations || 0,
                    totalClients: loisirsStats.totalClients || 0,
                    byActivity: loisirsStats.reservationsParActivite || []
                },
                revenue: {
                    total: loisirsStats.revenue?.totalRevenue || 0,
                    average: loisirsStats.revenue?.averageReservationValue || 0
                },
                monthlyStats: {
                    reservations: loisirsStats.monthlyStats?.reservations || [],
                    revenue: loisirsStats.monthlyStats?.revenue || [],
                    activities: loisirsStats.monthlyStats?.activites || [],
                    events: loisirsStats.monthlyStats?.events || [],
                    subscriptions: authStats.monthlyStats?.subscriptions || [],
                    publicites: authStats.monthlyStats?.publicites || []
                },
                performance: {
                    successRate: loisirsStats.performanceMetrics?.reservationSuccessRate || 0,
                    popularActivities: loisirsStats.performanceMetrics?.popularActivities || [],
                    retentionRate: loisirsStats.performanceMetrics?.clientRetentionRate || 0
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getAuthServiceStats() {
        try {
            const response = await authApi.get('/entreprise/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Auth service stats error:', error);
            return {};
        }
    }

    async getLoisirsServiceStats() {
        try {
            const response = await api.get('/entreprise/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Loisirs service stats error:', error);
            return {};
        }
    }

    async getMonthlyStats() {
        try {
            const [authStats, loisirsStats] = await Promise.all([
                this.getAuthMonthlyStats(),
                this.getLoisirsMonthlyStats()
            ]);

            return {
                auth: authStats,
                loisirs: loisirsStats
            };
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            throw error;
        }
    }

    async getAuthMonthlyStats() {
        try {
            const response = await authApi.get('/entreprise/stats/monthly');
            return response.data;
        } catch (error) {
            console.error('Auth monthly stats error:', error);
            return {};
        }
    }

    async getLoisirsMonthlyStats() {
        try {
            const response = await api.get('/entreprise/stats/monthly');
            return response.data;
        } catch (error) {
            console.error('Loisirs monthly stats error:', error);
            return {};
        }
    }

    async getReservationStats() {
        try {
            const response = await api.get('/entreprise/stats/reservations');
            return response.data;
        } catch (error) {
            console.error('Reservation stats error:', error);
            return {};
        }
    }
}

export const entrepriseStatsService = new EntrepriseStatsService();