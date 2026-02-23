import { NextResponse } from 'next/server';
import { getUserByUsername, registerUser } from '@/lib/db';
import { hash } from 'bcryptjs';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
    try {
        const { username, password, name } = await request.json();

        if (!username || !password || !name) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }

        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return NextResponse.json({ error: 'Username already exists' }, { status: 400 });
        }

        const hashedPassword = await hash(password, 10);

        await registerUser({
            id: randomUUID(),
            username,
            password: hashedPassword,
            name
        });

        return NextResponse.json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
