
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <XCircle className="h-12 w-12 text-gray-400" />
          </div>
          <CardTitle className="text-2xl">Payment Canceled</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center">
          <p className="text-gray-600">
            Your payment was canceled. No charges have been made to your account.
            You can try again whenever you're ready to upgrade your plan.
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/subscription')}
            className="mr-2"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PaymentCanceled;
