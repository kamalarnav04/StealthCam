import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// In a real application, this would be stored in a database
const users: { [key: string]: { id: string; username: string; password: string; } } = {};

export async function POST(request: NextRequest) {
  try {
    const { username, password, deviceType } = await request.json();

    if (!username || !password || !deviceType) {
      return NextResponse.json(
        { error: 'Username, password, and device type are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = Object.values(users).find(user => user.username === username);
    
    if (existingUser) {
      // Verify password
      const isValid = await bcrypt.compare(password, existingUser.password);
      if (!isValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = jwt.sign(
        { userId: existingUser.id, deviceType, username },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        token,
        userId: existingUser.id,
        username: existingUser.username,
        deviceType
      });
    } else {
      // Create new user
      const hashedPassword = await bcrypt.hash(password, 12);
      const userId = uuidv4();
      
      users[userId] = {
        id: userId,
        username,
        password: hashedPassword
      };

      // Generate JWT token
      const token = jwt.sign(
        { userId, deviceType, username },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
      );

      return NextResponse.json({
        token,
        userId,
        username,
        deviceType
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
