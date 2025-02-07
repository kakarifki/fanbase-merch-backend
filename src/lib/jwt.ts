// src/libs/jwt.ts
import { sign, verify } from 'hono/jwt'

interface JWTVerifyPayload {
    sub: {
        user_id: string;
    },
    exp: number;
}

// Function to safely get the secret key from environment variables
const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not defined.");
  }
  return secret;
};

export const createJwt = async (userId: string): Promise<string> => {
    const secret = getSecret();

    const payload = {
        sub: {
            user_id: userId,
        },
        exp: Math.floor(Date.now() / 1000) + 60 * 5, // 5 minutes
    };

    const token = await sign(payload, secret);
    return token;
};

export const verifyJwt = async (token: string): Promise<JWTVerifyPayload | null> => {
    const secret = getSecret();
    try {
        const decodedPayload = await verify(token, secret)
        return decodedPayload as unknown as JWTVerifyPayload;

    } catch (error) {
        console.error("JWT Verification Error:", error);
        return null;
    }
};
