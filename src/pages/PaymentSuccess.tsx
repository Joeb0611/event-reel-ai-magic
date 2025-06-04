
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tier = searchParams.get('tier');
  const projectId = searchParams.get('project_id');
  const { refreshSubscription } = useSubscription();
  const [isRefreshing, setIsRefreshing] = useState(true);

  // Refresh subscription data to reflect the new purchase
  useEffect(() => {
    const updateSubscription = async () => {
      setIsRefreshing(true);
      try {
        await refreshSubscription();
      } catch (error) {
        console.error("Error refreshing subscription:", error);
      } finally {
        setIsRefreshing(false);
      }
    };

    updateSubscription();
  }, [refreshSubscription]);

  const goToProject = () => {
    if (projectId) {
      navigate(`/project/${projectId}`);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            {tier && (
              <span className="font-medium">
                Your wedding has been upgraded to {tier.charAt(0).toUpperCase() + tier.slice(1)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-gray-600">
            Thank you for your purchase. Your payment has been processed successfully, and your benefits have been activated.
          </p>
          
          {isRefreshing && (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button onClick={goToProject} className="bg-purple-600 hover:bg-purple-700">
            {projectId ? "Return to Project" : "Go to Dashboard"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
