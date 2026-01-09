import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';

const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <Card className="p-12 max-w-md w-full text-center">
          <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-12 w-12 text-gray-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#0a3d5c] mb-3">
            Payment Canceled
          </h1>
          
          <p className="text-gray-600 mb-4">
            Your payment was canceled and no charges were made.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-900 font-medium mb-1">Need Help?</p>
                <p className="text-sm text-blue-800">
                  If you encountered any issues during payment, please contact our support team or try subscribing again.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/subscription')}
              className="w-full bg-[#0a3d5c] hover:bg-[#0a3d5c]/90"
            >
              Try Again
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to Homepage
            </Button>
          </div>

          <p className="text-xs text-gray-500 mt-6">
            Your account will remain active with limited access until you subscribe.
          </p>
        </Card>
      </div>
    </AppLayout>
  );
};

export default SubscriptionCancel;
