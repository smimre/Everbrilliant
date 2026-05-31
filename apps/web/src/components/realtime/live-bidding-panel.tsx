'use client';
import { useState } from 'react';
import { useLiveBidding } from '@/hooks/realtime/use-live-bidding';
import { useLocaleStore } from '@/store/locale.store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Gavel, Users, Clock, TrendingUp, Wifi, WifiOff } from 'lucide-react';

interface LiveBiddingPanelProps {
  tenderId: string;
  tenderTitle: string;
  minBid?: number;
  currency?: string;
  onBid?: (amount: number) => Promise<void>;
}

export function LiveBiddingPanel({
  tenderId, tenderTitle, minBid = 0, currency = 'IRR', onBid,
}: LiveBiddingPanelProps) {
  const { lang } = useLocaleStore();
  const { bidsCount, latestBidTime, countdown, urgency, viewers, isJoined, formatCountdown } = useLiveBidding(tenderId);
  const [bidAmount, setBidAmount] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [error, setError] = useState('');

  const fmt = (n: number) => new Intl.NumberFormat(lang === 'fa' ? 'fa-IR' : 'en-US').format(n);
  const cd = formatCountdown();

  const handleBid = async () => {
    const amount = Number(bidAmount.replace(/,/g, ''));
    if (!amount || amount < minBid) {
      setError(lang === 'fa' ? `حداقل مبلغ ${fmt(minBid)} ریال است` : `Minimum bid is ${fmt(minBid)}`);
      return;
    }
    try {
      setIsBidding(true);
      setError('');
      await onBid?.(amount);
      setBidAmount('');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsBidding(false);
    }
  };

  return (
    <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] overflow-hidden">
      {/* Header */}
      <div className={cn(
        'px-5 py-4 border-b border-[hsl(var(--border))]',
        urgency === 'critical' ? 'bg-[hsl(var(--destructive)/0.1)]' :
        urgency === 'warning' ? 'bg-[hsl(var(--warning)/0.1)]' : ''
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gavel className="h-5 w-5 text-[hsl(var(--primary))]" />
            <h3 className="font-bold">{tenderTitle}</h3>
          </div>
          <div className="flex items-center gap-2">
            {isJoined ? (
              <Badge variant="success" className="flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                {lang === 'fa' ? 'زنده' : 'Live'}
              </Badge>
            ) : (
              <Badge variant="secondary" className="flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                {lang === 'fa' ? 'قطع' : 'Offline'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 divide-x divide-[hsl(var(--border))] border-b border-[hsl(var(--border))]">
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[hsl(var(--muted-foreground))] text-xs mb-1">
            <TrendingUp className="h-3 w-3" />
            {lang === 'fa' ? 'پیشنهادات' : 'Bids'}
          </div>
          <p className="text-xl font-bold tabular-nums text-[hsl(var(--primary))]">{bidsCount}</p>
        </div>
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[hsl(var(--muted-foreground))] text-xs mb-1">
            <Users className="h-3 w-3" />
            {lang === 'fa' ? 'بازدیدکنندگان' : 'Viewers'}
          </div>
          <p className="text-xl font-bold tabular-nums text-[hsl(var(--success))]">{viewers}</p>
        </div>
        <div className="p-3 text-center">
          <div className="flex items-center justify-center gap-1 text-[hsl(var(--muted-foreground))] text-xs mb-1">
            <Clock className="h-3 w-3" />
            {lang === 'fa' ? 'زمان باقیمانده' : 'Remaining'}
          </div>
          <p className={cn(
            'text-xl font-bold tabular-nums font-mono',
            urgency === 'critical' ? 'text-[hsl(var(--destructive))] animate-pulse' :
            urgency === 'warning' ? 'text-[hsl(var(--warning))]' : 'text-[hsl(var(--foreground))]'
          )}>
            {cd ?? (lang === 'fa' ? 'در انتظار' : 'Pending')}
          </p>
        </div>
      </div>

      {/* Countdown bar */}
      {countdown !== null && (
        <div className="h-1 bg-[hsl(var(--muted))]">
          <div
            className={cn(
              'h-full transition-all duration-1000',
              urgency === 'critical' ? 'bg-[hsl(var(--destructive))]' :
              urgency === 'warning' ? 'bg-[hsl(var(--warning))]' : 'bg-[hsl(var(--primary))]'
            )}
            style={{ width: `${Math.min(100, (countdown / 3600) * 100)}%` }}
          />
        </div>
      )}

      {/* Bid Form */}
      <div className="p-5 space-y-3">
        {latestBidTime && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {lang === 'fa' ? 'آخرین پیشنهاد:' : 'Last bid:'} {new Date(latestBidTime).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US')}
          </p>
        )}

        {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

        <div className="flex gap-2">
          <Input
            placeholder={lang === 'fa' ? `حداقل ${fmt(minBid)} ریال` : `Min ${fmt(minBid)}`}
            value={bidAmount}
            onChange={e => setBidAmount(e.target.value)}
            type="number"
            className="flex-1"
          />
          <Button onClick={handleBid} loading={isBidding} disabled={!isJoined}>
            <Gavel className="h-4 w-4" />
            {lang === 'fa' ? 'ثبت پیشنهاد' : 'Place Bid'}
          </Button>
        </div>

        {minBid > 0 && (
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            {lang === 'fa' ? `حداقل مبلغ: ${fmt(minBid)} ${currency}` : `Minimum bid: ${fmt(minBid)} ${currency}`}
          </p>
        )}
      </div>
    </div>
  );
}
