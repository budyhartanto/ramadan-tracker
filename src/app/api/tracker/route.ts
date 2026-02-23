import { NextResponse } from 'next/server';
import { getTrackingByDate, updateTracking, DailyTracking } from '@/lib/db';
import { auth } from '@/auth';

export async function GET(request: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Date parameter is required (YYYY-MM-DD)' }, { status: 400 });
    }

    try {
        const tracking = await getTrackingByDate(session.user.id, date);
        return NextResponse.json(tracking);
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body: Partial<DailyTracking> = await request.json();

        if (!body.date) {
            return NextResponse.json({ error: 'Date is required in the body' }, { status: 400 });
        }

        const trackingData: DailyTracking = {
            user_id: session.user.id,
            date: body.date,
            fasting: body.fasting ?? 0,
            fajr: body.fajr ?? 0,
            dhuhr: body.dhuhr ?? 0,
            asr: body.asr ?? 0,
            maghrib: body.maghrib ?? 0,
            isha: body.isha ?? 0,
            quran_surah: body.quran_surah || '',
            quran_ayah: body.quran_ayah ?? 0,
            notes: body.notes || ''
        };

        await updateTracking(trackingData);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tracking data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
