import { api, authApi } from './api';

class AdminStatsService {
    async getDashboardStats() {
        try {
            const [authStats, loisirsStats] = await Promise.all([
                this.getAuthServiceStats(),
                this.getLoisirsServiceStats()
            ]);

            return {
                users: {
                    total: authStats.totalUsers || 0,
                    active: authStats.activeUsers || 0
                },
                entreprises: {
                    total: authStats.totalEnterprises || 0,
                    active: authStats.activeEnterprises || 0
                },
                revenue: {
                    total: authStats.totalRevenue || 0,
                    subscriptions: authStats.subscriptionStats?.totalSubscriptionRevenue || 0,
                    publicites: authStats.publiciteStats?.totalPubliciteRevenue || 0,
                    monthly: authStats.monthlyRevenue || {}
                },
                activities: {
                    total: loisirsStats.totalActivites || 0,
                    events: loisirsStats.totalEvenements || 0,
                    posts: loisirsStats.totalPostes || 0,
                    ads: loisirsStats.totalPublicites || 0
                },
                reservations: {
                    total: loisirsStats.totalReservations || 0,
                    byActivity: loisirsStats.reservationsParActivite || [],
                    monthly: loisirsStats.monthlyStats?.reservations || []
                },
                monthlyStats: {
                    activities: loisirsStats.monthlyStats?.activites || [],
                    events: loisirsStats.monthlyStats?.evenements || [],
                    ads: loisirsStats.monthlyStats?.publicites || [],
                    subscriptions: authStats.monthlyRevenue?.subscriptions || [],
                    publicites: authStats.monthlyRevenue?.publicites || []
                }
            };
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw error;
        }
    }

    async getAuthServiceStats() {
        try {
            const response = await authApi.get('/admin/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Auth service stats error:', error);
            return {};
        }
    }

    async getLoisirsServiceStats() {
        try {
            const response = await api.get('/admin/stats/dashboard');
            return response.data;
        } catch (error) {
            console.error('Loisirs service stats error:', error);
            return {};
        }
    }

    async getDetailedStats() {
        try {
            const [authDetails, loisirsDetails] = await Promise.all([
                this.getAuthDetailedStats(),
                this.getLoisirsDetailedStats()
            ]);

            return {
                auth: authDetails,
                loisirs: loisirsDetails
            };
        } catch (error) {
            console.error('Error fetching detailed stats:', error);
            throw error;
        }
    }

    async getAuthDetailedStats() {
        try {
            const [users, entreprises, revenue, monthlySubscriptions, monthlyPublicites] = await Promise.all([
                authApi.get('/admin/stats/users'),
                authApi.get('/admin/stats/entreprises'),
                authApi.get('/admin/stats/revenue'),
                authApi.get('/admin/stats/monthly/subscriptions'),
                authApi.get('/admin/stats/monthly/publicites')
            ]);

            return {
                users: users.data,
                entreprises: entreprises.data,
                revenue: revenue.data,
                monthlySubscriptions: monthlySubscriptions.data,
                monthlyPublicites: monthlyPublicites.data
            };
        } catch (error) {
            console.error('Auth detailed stats error:', error);
            return {};
        }
    }

    async getLoisirsDetailedStats() {
        try {
            const [reservations, monthly] = await Promise.all([
                api.get('/admin/stats/reservations'),
                api.get('/admin/stats/monthly')
            ]);

            return {
                reservations: reservations.data,
                monthly: monthly.data
            };
        } catch (error) {
            console.error('Loisirs detailed stats error:', error);
            return {};
        }
    }
}

export const adminStatsService = new AdminStatsService();