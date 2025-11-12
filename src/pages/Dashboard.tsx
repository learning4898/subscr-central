import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  status: 'active' | 'expired' | 'cancelled';
  renewalDate: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    monthlySpending: 0,
    upcomingRenewals: 0,
  });

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/subscriptions/user/${user._id}`);
      const subs = response.data.data;
      setSubscriptions(subs);
      calculateStats(subs);
    } catch (error: any) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (subs: Subscription[]) => {
    const active = subs.filter(s => s.status === 'active').length;
    const expired = subs.filter(s => s.status === 'expired').length;
    
    const monthlySpending = subs
      .filter(s => s.status === 'active')
      .reduce((total, sub) => {
        let monthlyPrice = sub.price;
        if (sub.frequency === 'yearly') monthlyPrice = sub.price / 12;
        if (sub.frequency === 'weekly') monthlyPrice = sub.price * 4;
        if (sub.frequency === 'daily') monthlyPrice = sub.price * 30;
        return total + monthlyPrice;
      }, 0);

    const upcomingRenewals = subs.filter(s => {
      if (s.status !== 'active' || !s.renewalDate) return false;
      const days = differenceInDays(new Date(s.renewalDate), new Date());
      return days <= 7 && days >= 0;
    }).length;

    setStats({
      total: subs.length,
      active,
      expired,
      monthlySpending: Math.round(monthlySpending * 100) / 100,
      upcomingRenewals,
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Overview of your subscriptions</p>
          </div>
          <Link to="/subscriptions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Subscriptions</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
              <div className="h-2 w-2 rounded-full bg-status-active" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.active}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Monthly Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">₹{stats.monthlySpending.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">Renewals (7 days)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stats.upcomingRenewals}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Subscriptions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Subscriptions</h2>
            <Link to="/subscriptions">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>

          {subscriptions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No subscriptions yet</p>
                <Link to="/subscriptions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first subscription
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscriptions.slice(0, 6).map((sub) => (
                <Card key={sub._id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-base">{sub.name}</CardTitle>
                      <StatusBadge status={sub.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Price</span>
                      <span className="font-medium">
                        {sub.currency === 'INR' && '₹'}
                        {sub.currency === 'USD' && '$'}
                        {sub.currency === 'EUR' && '€'}
                        {sub.currency === 'YEN' && '¥'}
                        {sub.price}
                        <span className="text-xs text-muted-foreground ml-1">/{sub.frequency}</span>
                      </span>
                    </div>
                    {sub.renewalDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Renewal</span>
                        <span className="text-sm">{format(new Date(sub.renewalDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                    <div className="pt-2">
                      <span className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-secondary text-secondary-foreground">
                        {sub.category}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
