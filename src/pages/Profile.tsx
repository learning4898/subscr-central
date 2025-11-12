import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import api from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    
    try {
      const response = await api.get(`/users/${user._id}`);
      setProfileData(response.data.data);
    } catch (error: any) {
      toast.error('Failed to fetch profile');
    } finally {
      setLoading(false);
    }
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
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
          <p className="text-muted-foreground mt-1">View your account information</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your personal details and account settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-foreground">
                {profileData?.name || user?.name}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-foreground">
                {profileData?.email || user?.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label>User ID</Label>
              <div className="px-3 py-2 bg-muted rounded-md text-foreground font-mono text-sm">
                {user?._id}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
