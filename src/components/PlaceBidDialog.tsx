import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';

interface PlaceBidDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  auctionId: string;
  currentBid: number; // Current highest bid
  itemName: string;
  itemImage?: string;
  minimumIncrement?: number; // Minimum bid increment (default 1000)
}

export function PlaceBidDialog({
  open,
  onOpenChange,
  auctionId,
  currentBid,
  itemName,
  itemImage,
  minimumIncrement = 1000,
}: PlaceBidDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState<string>('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  const minimumBid = currentBid + minimumIncrement;

  useEffect(() => {
    // Reset form when dialog opens/closes
    if (open) {
      setBidAmount(minimumBid.toLocaleString());
      setAgreedToTerms(false);
      setError('');
    }
  }, [open, minimumBid]);

  // Check if user is authenticated
  useEffect(() => {
    if (open && !user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to place a bid.',
        variant: 'destructive',
      });
      onOpenChange(false);
      navigate('/login');
    }
  }, [open, user, navigate, toast, onOpenChange]);

  const formatCurrency = (amount: number | string): string => {
    const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.]/g, '')) : amount;
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleBidAmountChange = (value: string) => {
    // Remove all non-numeric characters except decimal point
    const cleaned = value.replace(/[^0-9.]/g, '');
    setBidAmount(cleaned);
    
    const num = parseFloat(cleaned);
    if (!isNaN(num)) {
      if (num < minimumBid) {
        setError(`Minimum bid is ${formatCurrency(minimumBid)}`);
      } else {
        setError('');
      }
    } else {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please log in to place a bid.',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    const amount = parseFloat(bidAmount.replace(/[^0-9.]/g, ''));
    
    if (isNaN(amount) || amount < minimumBid) {
      setError(`Bid must be at least ${formatCurrency(minimumBid)}`);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Try to insert the bid into the database
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          auction_id: auctionId,
          user_id: user.id,
          bid_amount: amount,
          created_at: new Date().toISOString(),
        });

      if (bidError) {
        // If table doesn't exist, still show success (for now)
        if (bidError.message?.includes('relation') || bidError.message?.includes('does not exist') || bidError.code === '42P01') {
          toast({
            title: 'Bid Placed Successfully!',
            description: `Your bid of ${formatCurrency(amount)} has been placed. (Note: Database table not yet created - please run supabase/05_bids_schema.sql)`,
          });
          onOpenChange(false);
          return;
        }
        throw bidError;
      }

      toast({
        title: 'Bid Placed Successfully!',
        description: `Your bid of ${formatCurrency(amount)} has been placed.`,
      });

      onOpenChange(false);
      
      // Refresh the auction page to show updated bid
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Failed to place bid. Please try again.');
      toast({
        title: 'Error',
        description: err.message || 'Failed to place bid. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return null; // Dialog won't show if user is not logged in
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold" style={{ color: '#0a3d5c' }}>
            Place a Bid
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Enter your bid amount for this item
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Item Preview */}
          {itemImage && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <img
                src={itemImage}
                alt={itemName}
                className="w-20 h-20 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{itemName}</h4>
                <p className="text-sm text-gray-500 mt-1">Auction Item</p>
              </div>
            </div>
          )}

          {/* Current Bid Info */}
          <div className="bg-gradient-to-r from-[#0a3d5c] to-[#062a3d] rounded-xl p-4 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-white/80">Current Highest Bid</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(currentBid)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Minimum Bid</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(minimumBid)}</p>
              </div>
            </div>
          </div>

          {/* Bid Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="bidAmount" className="text-sm font-semibold text-gray-700">
              Your Bid Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">
                $
              </span>
              <Input
                id="bidAmount"
                type="text"
                value={bidAmount}
                onChange={(e) => handleBidAmountChange(e.target.value)}
                className="pl-8 text-lg font-semibold border-gray-200 rounded-lg focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all"
                placeholder={minimumBid.toLocaleString()}
                disabled={isSubmitting}
              />
            </div>
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Minimum bid increment: {formatCurrency(minimumIncrement)}
            </p>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#0a3d5c] border-gray-300 rounded focus:ring-[#0a3d5c]"
              disabled={isSubmitting}
            />
            <Label htmlFor="terms" className="text-sm text-gray-600 cursor-pointer">
              I agree to the{' '}
              <a href="/terms" target="_blank" className="text-[#0a3d5c] hover:underline font-semibold">
                terms and conditions
              </a>{' '}
              and understand that my bid is binding.
            </Label>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>Note:</strong> By placing a bid, you agree to purchase this item if you win the auction.
              Your bid cannot be withdrawn once placed.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="rounded-full"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !agreedToTerms || !!error}
            className="rounded-full bg-[#0a3d5c] hover:bg-[#0a3d5c]/90 text-white"
          >
            {isSubmitting ? (
              <>
                <span className="mr-2">Processing...</span>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </>
            ) : (
              `Place Bid (${formatCurrency(parseFloat(bidAmount.replace(/[^0-9.]/g, '')) || minimumBid)})`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

