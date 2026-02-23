import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        Credentials({
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) return null;

                try {
                    // Dynamic import to prevent Edge Runtime issues since we use sqlite which might have native deps
                    const { getUserByUsername } = await import('@/lib/db');
                    const { compare } = await import('bcryptjs');

                    const user = await getUserByUsername(credentials.username as string);
                    if (!user) return null;

                    const passwordsMatch = await compare(credentials.password as string, user.password as string);

                    if (passwordsMatch) {
                        return {
                            id: user.id,
                            name: user.name,
                            email: user.username, // Using username as email for NextAuth standard Session type
                        };
                    }

                    return null;
                } catch (error) {
                    console.error("Auth error:", error);
                    return null;
                }
            },
        }),
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    session: { strategy: "jwt" },
});
