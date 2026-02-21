import { NextResponse } from 'next/server';
import { getTrackingByDate, updateTracking, DailyTracking } from '@/lib/db';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
        return NextResponse.json({ error: 'Date parameter is required (YYYY-MM-DD)' }, { status: 400 });
    }

    try {
        const tracking = getTrackingByDate(date);
        return NextResponse.json(tracking);
    } catch (error) {
        console.error('Error fetching tracking data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body: DailyTracking = await request.json();

        if (!body.date) {
            return NextResponse.json({ error: 'Date is required in the body' }, { status: 400 });
        }

        updateTracking(body);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating tracking data:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
