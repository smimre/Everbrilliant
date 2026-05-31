'use client';
import { useEffect, useState, useCallback } from 'react';
import { useSocket } from './use-socket';
import { useUIStore } from '@/store/ui.store';
import { useLocaleStore } from '@/store/locale.store';
import { WS_EVENTS } from '@/lib/socket/socket-client';

interface BidUpdate {
  tenderId: string;
  bidsCount: number;
  latestBidTime: string;
}

interface TenderCountdown {
  tenderId: string;
  remaining: number;
  urgency: 'normal' | 'warning' | 'critical';
}

export function useLiveBidding(tenderId: string) {
  const { on, emit, isConnected } = useSocket();
  const { toast } = useUIStore();
  const { lang } = useLocaleStore();
  const [bidsCount, setBidsCount] = useState(0);
  const [latestBidTime, setLatestBidTime] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');
  const [viewers, setViewers] = useState(0);
  const [isJoined, setIsJoined] = useState(false);

  // Join tender room
  useEffect(() => {
    if (!tenderId || !isConnected) return;

    emit(WS_EVENTS.JOIN_TENDER, { tenderId });
    setIsJoined(true);

    return () => {
      emit(WS_EVENTS.LEAVE_TENDER, { tenderId });
      setIsJoined(false);
    };
  }, [tenderId, isConnected, emit]);

  // Listen for new bids
  useEffect(() => {
    const cleanup1 = on(WS_EVENTS.TENDER_BID_PLACED, (data: BidUpdate) => {
      if (data.tenderId !== tenderId) return;
      setBidsCount(data.bidsCount);
      setLatestBidTime(data.latestBidTime);
      toast('info', lang === 'fa' ? 'پیشنهاد جدید ثبت شد' : 'New bid placed!');
    });

    const cleanup2 = on(WS_EVENTS.TENDER_COUNTDOWN, (data: TenderCountdown) => {
      if (data.tenderId !== tenderId) return;
      setCountdown(data.remaining);
      setUrgency(data.urgency);
    });

    const cleanup3 = on(WS_EVENTS.TENDER_UPDATE, (data: any) => {
      if (data.tenderId !== tenderId) return;
      if (data.viewers !== undefined) setViewers(data.viewers);
      if (data.status === 'closed') {
        toast('warning', lang === 'fa' ? 'مزایده بسته شد' : 'Tender closed');
      }
      if (data.bidsCount !== undefined) setBidsCount(data.bidsCount);
    });

    return () => { cleanup1(); cleanup2(); cleanup3(); };
  }, [on, tenderId, toast, lang]);

  const formatCountdown = useCallback(() => {
    if (countdown === null) return null;
    const h = Math.floor(countdown / 3600);
    const m = Math.floor((countdown % 3600) / 60);
    const s = countdown % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }, [countdown]);

  return { bidsCount, latestBidTime, countdown, urgency, viewers, isJoined, formatCountdown };
}
