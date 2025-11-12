import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import StatusBadge from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Plus, Search } from 'lucide-react';
import { format } from 'date-fns';

interface Subscription {
  _id: string;
  name: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  paymentMethod: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  renewalDate: string;
}

const Subscriptions = () => {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [filteredSubs, setFilteredSubs] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [user]);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchQuery, statusFilter, categoryFilter]);

  const fetchSubscriptions = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/subscriptions/user/${user._id}`);
      setSubscriptions(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    if (searchQuery) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(sub => sub.category === categoryFilter);
    }

    setFilteredSubs(filtered);
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Subscriptions</h1>
            <p className="text-muted-foreground mt-1">Manage all your subscriptions</p>
          </div>
          <Link to="/subscriptions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subscription
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search subscriptions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="entertainment">Entertainment</SelectItem>
                  <SelectItem value="lifestyle">Lifestyle</SelectItem>
                  <SelectItem value="technology">Technology</SelectItem>
                  <SelectItem value="finance">Finance</SelectItem>
                  <SelectItem value="politics">Politics</SelectItem>
                  <SelectItem value="games">Games</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Subscriptions List */}
        {filteredSubs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">
                {subscriptions.length === 0 ? 'No subscriptions yet' : 'No subscriptions match your filters'}
              </p>
              {subscriptions.length === 0 && (
                <Link to="/subscriptions/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add your first subscription
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredSubs.map((sub) => (
              <Card key={sub._id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold">{sub.name}</h3>
                    <StatusBadge status={sub.status} />
                  </div>

                  <div className="space-y-2">
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

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Category</span>
                      <span className="text-sm capitalize">{sub.category}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Payment</span>
                      <span className="text-sm">{sub.paymentMethod}</span>
                    </div>

                    {sub.renewalDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Renewal</span>
                        <span className="text-sm">{format(new Date(sub.renewalDate), 'MMM dd, yyyy')}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Subscriptions;
